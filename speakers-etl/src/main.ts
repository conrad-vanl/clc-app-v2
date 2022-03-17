import { Readable } from 'stream'
import yargs from 'yargs'
import { collect } from 'async-toolbox/stream'
import 'isomorphic-fetch'

import {createClient} from './contentful/client'

const argv = yargs.argv

const accessToken = argv.accessToken || process.env.CONTENTFUL_ACCESS_TOKEN
const spaceId = argv.spaceId || process.env.CONTENTFUL_SPACE_ID

async function Main() {
  const client = createClient({
    accessToken,
    space: spaceId
  })

  const source = Readable.from(client.entries({
    content_type: 'person'
  }))

  const allPeople = await collect(source)
  console.log('length', allPeople.length)
  console.log('first', allPeople[0])
}

Main()
  .then(() => process.exit(0))
  .catch((ex) => {
    console.error(ex)
    process.exit(1)
  })
