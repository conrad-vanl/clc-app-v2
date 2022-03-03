/**
 * The standard contentful client doesn't work in react-native
 * So we create one that implements sync only
 */
console.log('load client')

import {wait} from 'async-toolbox/wait'
import type { SyncCollection, Entry, Asset, Sys } from "contentful";

type Fetch = typeof fetch

interface IClientOptions {
  baseUrl: string,
  spaceId: string,
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
      spaceId: process.env.CONTENTFUL_SPACE_ID!,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
      environmentId: process.env.CONTENTFUL_ENVIRONMENT || 'master',
      ...options,
    }
  }

  public async sync(query: any): Promise<SyncCollection> {
    const {spaceId, environmentId} = this.options
    
    const assets: Asset[] = []
    const deletedAssets: DeletedAsset[] = []
    const entries: Entry<any>[] = []
    const deletedEntries: DeletedEntry[] = []


    let resp = await this.get(`/spaces/${spaceId}/environments/${environmentId}/sync`, query)
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
    
    const match = body.nextSyncUrl && body.nextSyncUrl.match(/sync_token=(\w+)/)
    const nextSyncToken = match && match[1]
    return {
      assets,
      deletedAssets: deletedAssets as Asset[],
      entries,
      deletedEntries: deletedEntries as Entry<any>[],
      nextSyncToken,
      toPlainObject() { return this },
      stringifySafe() { return JSON.stringify(this) }
    }
  }

  private async get(path: string, query: Record<string, string> = {}): Promise<Response> {
    const url = new URL(path, this.options.baseUrl)
    Object.keys(query).forEach((k) => {
      url.searchParams.set(k, query[k])
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

// tslint:disable-next-line: max-classes-per-file
export class NotFoundError extends Error {}

interface SyncResponse {
  sys: { type: 'Array' },
  items: Array<SyncItem>,

  nextSyncUrl?: string,
  nextPageUrl?: string
}

type SyncItem =
  Entry<any> |
  Asset |
  DeletedEntry |
  DeletedAsset

interface DeletedEntry {
  sys: Sys & { type: 'DeletedEntry' }
}

interface DeletedAsset {
  sys: Sys & { type: 'DeletedAsset' }
}
  
function isEntry(e: any): e is Entry<any> {
  return e && e.sys && e.sys.type == 'Entry'
}

function isAsset(e: any): e is Asset {
  return e && e.sys && e.sys.type == 'Asset'
}

function isDeletedEntry(e: any): e is DeletedEntry {
  return e && e.sys && e.sys.type == 'DeletedEntry'
}

function isDeletedAsset(e: any): e is DeletedAsset {
  return e && e.sys && e.sys.type == 'DeletedAsset'
}