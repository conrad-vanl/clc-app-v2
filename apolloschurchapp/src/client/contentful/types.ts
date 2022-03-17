
export interface Sys<Type extends string = string> {
  id: string,
  type: Type
  contentType?: Link<'ContentType'>
}

export interface Entry<TFields = Record<string, any>> {
  sys: Sys<'Entry'>
  fields: TFields
}

export interface Link<LinkType extends string = string> {
  sys: {
    type: 'Link',
    linkType: LinkType,
    id: string
  }
}

export interface Asset {
  sys: Sys<'Asset'>
  fields: {
    title?: String
    description?: string
    file: {
      url: string
      fileName: string
      contentType: string
      details: {
        size: number,
        image?: {
          width: number,
          height: number
        }
      }
    }
  }
}

export interface EntryCollection<TFields = Record<string, any>> {
  sys: { type: 'Array' },
  total: number
  skip: number
  limit: number
  items: Entry<TFields>[]
}

export interface SyncCollection {
  assets: Asset[],
  deletedAssets: Asset[],
  entries: Entry[],
  deletedEntries: Entry[],
  nextSyncToken: string
}

export interface SyncResponse {
  sys: { type: 'Array' },
  items: Array<SyncItem>,

  nextSyncUrl?: string,
  nextPageUrl?: string
}

export type SyncItem =
  Entry<any> |
  Asset |
  DeletedEntry |
  DeletedAsset

  export interface DeletedEntry {
  sys: Sys<'DeletedEntry'>
}

export interface DeletedAsset {
  sys: Sys<'DeletedAsset'>
}
  
export function isEntry(e: any): e is Entry<any> {
  return e && e.sys && e.sys.type == 'Entry'
}

export function isAsset(e: any): e is Asset {
  return e && e.sys && e.sys.type == 'Asset'
}

export function isDeletedEntry(e: any): e is DeletedEntry {
  return e && e.sys && e.sys.type == 'DeletedEntry'
}

export function isDeletedAsset(e: any): e is DeletedAsset {
  return e && e.sys && e.sys.type == 'DeletedAsset'
}