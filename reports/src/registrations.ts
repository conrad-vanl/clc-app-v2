
import fetch from 'isomorphic-fetch'
import {write as writeCsv} from 'fast-csv'
import fs from 'fs-extra'
import {onceAsync} from 'async-toolbox/events'

import {createClient, SimpleContentfulClient} from './contentful/client'
import { Entry, Link } from './contentful/types'
import { assign, present } from "./util"

interface RegistrationsArgs {
  spaceId: string,
  accessToken: string,
  code: string
  out?: string
}

const DataclipUrl = 'https://data.heroku.com/dataclips/ayaeestfwmdxtmskuowxgfplubju.json'

export class Registrations {
  private readonly client: SimpleContentfulClient

  constructor(private readonly argv: Readonly<RegistrationsArgs>) {

    this.client = createClient({
      accessToken: this.argv.accessToken,
      space: this.argv.spaceId,
      environmentId: 'dev'
    })
  }

  public async run() {
    const [events, dataclip] = await Promise.all([
      this.fetchEventMap(),
      this.fetchDataclip()
    ])

    const results = dataclip.map((row) => {
      if (!row.nodeId) {
        return
      }

      const event = events[row.nodeId]
      if (!event) {
        // deleted event, we don't care anymore
        return
      }
      
      return {
        ...row,
        title: event?.title,
        eventType: event?.eventType,
        startTime: event?.startTime,
        speakers: event?.speakers?.map((s) => s.fields.name)
      }
    }).filter(present)

    const out = this.argv.out
    const stream =
      !out || out == '-' ?
        process.stdout :
        fs.createWriteStream(out)

    const writer =
      writeCsv(results, {headers: true})
      .pipe(stream)

    await onceAsync(writer, 'end')
  }

  private async fetchDataclip(): Promise<DataclipRow[]> {
    const resp = await fetch(DataclipUrl)
    if (resp.status != 200) {
      throw new Error(`Unexpected status code ${resp.status}`)
    }

    const json = await resp.json() as DataclipJson
    return (json.values || []).map<DataclipRow>(row => {
      return row.reduce((hash, value, i) => {
        (hash as any)[json.fields[i]] = value
        return hash
      }, {} as DataclipRow)
    })
  }

  private async fetchEventMap() {
    const resp = this.client.entries({
      content_type: 'conference',
      include: 3,
      fields: {
        code: this.argv.code,
      }
    })

    // should only be one conference - one page
    const page = (await resp.next()).value
    if (!page) { throw new Error(`Could not find conference with code ${this.argv.code}`)}

    const speakers = reduceToHash(page.includes.Entry.filter(isSpeaker))
    const events = page.includes.Entry.filter(isEvent)
    return reduceToHash(events, (e) => {
      return {
        ...e.fields,
        speakers: (e.fields.speakers || [])
          .map((s) =>
            s && speakers[s.sys.id]
          ).filter((s) => s)
      }
    })
  }
}

interface DataclipJson {
  title: string,
  values: Array<Array<string | null>>
  fields: string[],
  types: number[],
  type_names: string[],
  started_at: string
  finished_at: string
  checksum: string
}

interface DataclipRow {
  firstName: string | null
  lastName: string | null
  email: string | null
  rockid: string | null
  nodeId: string | null
  nodeType: string | null
  registeredAt: string | null
}

type Event = Entry<EventFields>

interface EventFields {
  title: string
  summary?: string
  description?: string
  startTime?: string,
  endTime?: string
  eventType?: string
  speakers: Array<Link<'Entry'>>
}

type Speaker = Entry<SpeakerFields>

interface SpeakerFields {
  name: string
}

function isEvent(e: Entry<any>): e is Event {
  return e?.sys?.contentType?.sys?.id == 'event'
}

function isSpeaker(e: Entry<any>): e is Speaker {
  return e?.sys?.contentType?.sys?.id == 'speaker'
}

function reduceToHash<TEntry extends Entry>(entries: TEntry[]): Record<string, TEntry>
function reduceToHash<TEntry extends Entry, TValue>(entries: TEntry[], fn: (e: TEntry) => TValue): Record<string, TValue>

function reduceToHash(entries: Entry[], fn?: (e: Entry) => any) {
  return entries.reduce((hash, e) => {
    if (fn) {
      hash[e.sys.id] = fn(e)
    } else {
      hash[e.sys.id] = e
    }
    return hash
  }, {} as Record<string, any>)
}