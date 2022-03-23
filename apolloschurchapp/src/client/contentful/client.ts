/**
 * The standard contentful client doesn't work in react-native
 * So we create one that implements sync only
 */
import 'fastestsmallesttextencoderdecoder'
import { URL } from 'whatwg-url';
import {wait} from 'async-toolbox/wait'
import { SyncCollection, Entry, Asset, isAsset, DeletedAsset, DeletedEntry, isDeletedAsset, isDeletedEntry, isEntry, SyncResponse, EntryCollection } from "./types";

type Fetch = typeof fetch

interface IClientOptions {
  baseUrl: string,
  space: string,
  environmentId: string,
  accessToken: string
}

export function createClient(options: Partial<IClientOptions>): SimpleContentfulClient {
  return new SimpleContentfulClient(options)
}

export class SimpleContentfulClient {
  private options: IClientOptions

  constructor(
    options?: Partial<IClientOptions>,
    private fetch: Fetch = globalThis.fetch,
  ) {
    this.options = {
      baseUrl: 'https://cdn.contentful.com',
      space: process.env.CONTENTFUL_SPACE_ID!,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
      environmentId: process.env.CONTENTFUL_ENVIRONMENT || 'dev',
      ...options,
    }
  }

  public async sync(query: any): Promise<SyncCollection> {
    const {space, environmentId} = this.options
    
    const assets: Asset[] = []
    const deletedAssets: DeletedAsset[] = []
    const entries: Entry<any>[] = []
    const deletedEntries: DeletedEntry[] = []

    query = query.nextSyncToken ?
      { sync_token: query.nextSyncToken } :
      { initial: true }

    let resp = await this.get(`/spaces/${space}/environments/${environmentId}/sync`, query)
    let body = await resp.json() as SyncResponse
    assets.push(...body.items.filter(isAsset))
    deletedAssets.push(...body.items.filter(isDeletedAsset))
    entries.push(...body.items.filter(isEntry))
    deletedEntries.push(...body.items.filter(isDeletedEntry))

    while(body.nextPageUrl) {
      resp = await this.get(body.nextPageUrl)
      body = await resp.json() as SyncResponse
      assets.push(...body.items.filter(isAsset))
      deletedAssets.push(...body.items.filter(isDeletedAsset))
      entries.push(...body.items.filter(isEntry))
      deletedEntries.push(...body.items.filter(isDeletedEntry))
    }
    
    const nextSyncToken = new URL(body.nextSyncUrl!).searchParams.get('sync_token')!
    return {
      assets,
      deletedAssets: deletedAssets as unknown as Asset[],
      entries,
      deletedEntries: deletedEntries as unknown as Entry[],
      nextSyncToken,
      toPlainObject() { return this },
      stringifySafe() { return JSON.stringify(this) }
    } as SyncCollection
  }

  public async *entries<T extends Entry>(query?: EntriesQuery): AsyncGenerator<EntryCollection<T>, void, void> {
    const {space, environmentId} = this.options

    if (query) {
      query = {
        content_type: query.content_type,
        include: query.include,
        ...(query?.fields && Object.keys(query.fields).reduce((h, f) => {
          if (query?.fields?.hasOwnProperty(f)) {
            if (f == 'id') {
              h['sys.id'] = query.fields.id
            }
            h[`fields.${f}`] = query.fields[f]
          }
          return h
        }, {} as Record<string, string>))
      }
    }

    const q = {
      ...query,
      skip: 0,
      limit: 100
    }
    let page: EntryCollection<T>
    do {
      const resp = await this.get(`/spaces/${space}/environments/${environmentId}/entries`, q)
      page = await resp.json()
      q.skip = page.skip + page.items.length

      yield {...page}
    } while(page.total > q.skip)
  }

  private async get(path: string, query: Record<string, string | number | undefined> = {}): Promise<Response> {
    const url = new URL(path, this.options.baseUrl)
    Object.keys(query).forEach((k) => {
      const v = query[k]
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, v.toString())
      }
    })

    let resp: Response

    do {
      console.log('get', url.toString())
      resp = await this.fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.options.accessToken}`,
        },
        redirect: 'follow',
      })

      if (resp.status == 404) {
        throw new NotFoundError(`404: ${path}`)
      }

      if (resp.status == 429) {
        const reset = resp.headers.get('X-Contentful-RateLimit-Reset')
        if (!reset) { throw new Error(`Rate-limited with no X-Contentful-RateLimit-Reset header!`) }

        await wait(parseFloat(reset) * 1000)
        continue
      }

      if (resp.status != 200) {
        throw new Error(`Unexpected status code ${resp.status} for '${path}'`)
      }
    } while (resp.status != 200)

    return resp
  }
}

interface EntriesQuery {
  content_type: string,

  include?: number

  fields?: Record<string, string>
}

// tslint:disable-next-line: max-classes-per-file
export class NotFoundError extends Error {}
