import { Readable } from 'stream'
import yargs from 'yargs'
import { ParallelTransform } from 'async-toolbox/stream'
import 'isomorphic-fetch'

import {createClient as createManagementClient, Entry as ManagementEntry} from 'contentful-management'
import {createClient} from './contentful/client'
import { Pipeline } from 'async-toolbox/pipeline'
import { createAssetUpload, mergeSpeakers, PersonProps, SpeakerProps, transformPersonToSpeaker } from './transform'
import { Entry, Asset } from './contentful/types'
import { Load } from './load'

const argv = yargs.argv

const paperSignsAccessToken = argv.sourceAccessToken || process.env.SOURCE_CONTENTFUL_ACCESS_TOKEN
const paperSignsSpaceId = argv.sourceSpaceId || process.env.SOURCE_CONTENTFUL_SPACE_ID || 'hw5pse7y1ojx'

const clcAppSpaceId = argv.spaceId || process.env.CONTENTFUL_SPACE || 'vsbnbtnlrnnr'
const managementToken = argv.managementToken || process.env.CONTENTFUL_MANAGEMENT_TOKEN

const environmentId = argv.environmentId || process.env.CONTENTFUL_ENVIRONMENT || 'dev'

async function Main() {
  const sourceClient = createClient({
    accessToken: paperSignsAccessToken,
    space: paperSignsSpaceId,
    environmentId
  })

  const destinationClient = createManagementClient({
    accessToken: managementToken,
  })
  const destSpace = await destinationClient.getSpace(clcAppSpaceId)
  const destEnv = await destSpace.getEnvironment(environmentId || 'master')

  const sourceTeams = sourceClient.entries({
    content_type: 'team',
    include: 0,
  })

  // create a lookup table of team members -> team
  const personIdToTeam: Record<string, Entry> = {}
  for await(const page of sourceTeams) {
    for(const team of page.items) {
      // only use "Listed" teams
      if (!team.fields.isListed) {
        continue
      }

      for(const memberLink of (team.fields.members || [])) {
        personIdToTeam[memberLink.sys.id] = team
      }
    }
  }

  const pipeline = new Pipeline(
    await extract(),
    await transform(),
    await load()
  )

  await pipeline.run({
    progress: true
  })

  async function extract() {
    const destSpeakers: ManagementEntry[] = []
    let skip = 0
    while(true) {
      const page = await destEnv.getEntries({
        content_type: 'speaker',
        include: 0,
        skip
      })
      destSpeakers.push(...page.items)
      if (page.total <= page.items.length + skip) {
        break;
      }
      skip += page.items.length
    }

    const sourcePeople = sourceClient.entries({
      content_type: 'person',
      include: 1,
    })

    async function* generator() {
      for await(const page of sourcePeople) {
        for(const person of page.items) {
          // skip people not on staff
          if (!person.fields.onStaff) { continue }
          
          const name = `${person.fields.firstName} ${person.fields.lastName}`
          const speaker =
            destSpeakers.find((s) =>
              s.fields.name && s.fields.name['en-US'] && s.fields.name['en-US'].toLowerCase() == name.toLowerCase())?.toPlainObject()

          if (!speaker) {
            console.error('Creating new speaker for', name)
          }
          let profileImage: Asset | undefined
          const profileImageId = person.fields.profileImage?.sys?.id
          if (profileImageId) {
            profileImage = page.includes?.Asset?.find((a) => a.sys.id == profileImageId)
          }

          yield {
            person,
            speaker,
            profileImage
          } as Chunk
        }
      }
    }

    return Readable.from(generator())
  }

  async function transform() {
    return new ParallelTransform({
      objectMode: true,
      async transformAsync(chunk: Chunk) {
        let newSpeaker = await transformPersonToSpeaker(chunk.person, personIdToTeam)

        if (chunk.speaker) {
          newSpeaker = mergeSpeakers(chunk.speaker, newSpeaker)
        }

        if (!newSpeaker.fields.photo && chunk.profileImage) {
          // make sure we upload the profile image in the Load() step
          const upload = createAssetUpload(chunk.profileImage)
          this.push(upload)

          // link the newSpeaker to the profile image
          newSpeaker.fields.photo = {
            'en-US': {
              sys: {
                type: 'Link',
                linkType: 'Asset',
                id: upload.sys.id
              }
            }
          }
        }

        this.push(newSpeaker)
      }
    })
  }

  function load() {
    return new Load({
      spaceId: clcAppSpaceId,
      environmentId,
      managementToken,
      publish: argv.publish
    }).getPipeline()
  }
}

Main()
  .then(() => process.exit(0))
  .catch((ex) => {
    console.error(ex)
    process.exit(1)
  })

interface Chunk {
  person: Entry<PersonProps>
  speaker: Entry<SpeakerProps> | undefined
  profileImage: Asset | undefined
}