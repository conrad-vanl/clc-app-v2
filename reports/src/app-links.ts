import fs from 'fs-extra'
import {format as formatCsv} from 'fast-csv'
import {writeAsync} from 'async-toolbox/stream'
import {onceAsync} from 'async-toolbox/events'

import {createClient, SimpleContentfulClient} from './contentful/client'
import { Entry } from './contentful/types'

interface AppLinksParams {
  spaceId: string
  environmentId?: string
  accessToken: string
  code: string
  out?: string
  verbose?: boolean
}

export class AppLinks {
  private readonly client: SimpleContentfulClient
  private readonly logger: typeof console['debug']

  constructor(private readonly argv: Readonly<AppLinksParams>) {
    this.logger = argv.verbose ? console.error : (() => {})

    this.client = createClient({
      accessToken: this.argv.accessToken,
      space: this.argv.spaceId,
      environmentId: this.argv.environmentId || 'master',
      logger: this.logger
    })
  }

  public async run() {

    const out = this.argv.out
    const outputStream =
      !out || out == '-' ?
        process.stdout :
        fs.createWriteStream(out)
    
    const writerStream =
      formatCsv({headers: true})
  
    const didEnd = onceAsync(
      writerStream.pipe(outputStream),
      'finish'
    )
    const alreadyWrote = new Set<string>()

    const Tabs: AppLinkRow[] = [
      { type: 'Tab', title: 'Home', link: 'clc://clc/app-link/Home'},
      { type: 'Tab', title: 'Schedule', link:  'clc://clc/app-link/Schedule' },
      { type: 'Tab', title: 'My CLC', link:  'clc://clc/app-link/My-CLC' },
      { type: 'Tab', title: 'Tracks', link:  'clc://clc/app-link/Tracks' },
      { type: 'Tab', title: 'Connect', link:  'clc://clc/app-link/Connect' },
      { type: 'Tab', title: 'Staff Directory', link:  'clc://clc/app-link/StaffDirectory' },
      { type: 'Tab', title: 'Farkle Consequence Wheel', link:  'clc://clc/app-link/ConsequenceGenerator' }
    ]
    Tabs.forEach((t) => writerStream.write(t))

    const allSpeakers = this.client.entries({
      content_type: 'speaker',
      include: 0
    })
    for await(const page of allSpeakers) {
      for(const item of page.items) {
        await writeLink(item)
      }
    }
    const relatedEntries = this.client.entries({
      content_type: 'conference',
      include: 3,
      fields: {
        code: this.argv.code,
      }
    })
    for await(const page of relatedEntries) {
      for(const item of page.includes.Entry) {
        if (item.sys.contentType?.sys?.id && LinkableContentTypes.includes(item.sys.contentType.sys.id)) {
          await writeLink(item)
        }
      }
    }

    writerStream.end()
    await didEnd

    async function writeLink(entry: Entry) {
      if (alreadyWrote.has(entry.sys.id)) {
        return
      }
      alreadyWrote.add(entry.sys.id)

      const row: AppLinkRow = {
        type: entry.sys.contentType?.sys?.id,
        title: entry.fields.name || entry.fields.title,
        link: `clc://clc/app-link/LocalContentSingle?itemId=${entry.sys.id}`
      }
      return writeAsync(writerStream, row)
    }
  }
}
const LinkableContentTypes: string[] = ['event', 'announcement', 'breakouts', 'speaker', 'location', 'track']

interface AppLinkRow {
  type: string | undefined
  title: string
  link: string
}
