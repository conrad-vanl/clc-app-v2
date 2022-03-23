import { Semaphore } from 'async-toolbox'
import { ParallelTransform } from 'async-toolbox/stream'
import { Asset, Entry, Environment } from 'contentful-management'
import { isEqual } from 'lodash'

export class UploadsEntries extends ParallelTransform {
  private changedEntries: number = 0
  private newEntries: number = 0

  constructor(public readonly environment: Environment, private readonly rateLimit: Semaphore) {
    super({
      objectMode: true,
      maxParallelChunks: 2,
    })
  }

  public async _transformAsync(chunk: Entry | Asset) {
    if (isAsset(chunk)) {
      this.push(await this.uploadAsset(chunk))
    } else {
      this.push(await this.uploadEntry(chunk))
    }
    this.emit('status', `${this.newEntries} new, ${this.changedEntries} changed`)
  }

  private async uploadAsset(chunk: Asset): Promise<Asset> {
    const query = await this.rateLimit.lock(() =>
      this.environment.getAssets({ 'sys.id': chunk.sys.id }),
    )
    let existing = query.items[0]
    if (!existing) {
      const newAsset = await this.rateLimit.lock(() =>
        this.environment.createAssetWithId(chunk.sys.id, {
          fields: chunk.fields,
        }),
      )
      this.newEntries++
      return newAsset
    }

    // we only need to reupload the asset if the file has changed.
    if (
      existing.fields.file &&
        (chunk.fields.file['en-US'].fileName ==
          existing.fields.file['en-US'].fileName)
    ) {
      return existing
    }
    Object.assign(existing.fields, chunk.fields)
    existing = await this.rateLimit.lock(() =>
      existing.update(),
    )
    this.changedEntries++
    return existing
  }

  private async uploadEntry(chunk: Entry): Promise<Entry> {
    const query = await this.rateLimit.lock(() =>
      this.environment.getEntries({ 'sys.id': chunk.sys.id }),
    )
    let existing = query.items[0]
    if (!existing) {
      const newEntry = await this.rateLimit.lock(() =>
        this.environment.createEntryWithId(
          chunk.sys.contentType.sys.id,
          chunk.sys.id,
          {
            fields: chunk.fields,
          }),
      )
      this.newEntries++
      return newEntry
    }

    if (isEqual(existing.toPlainObject().fields, chunk.fields)) {
      return existing
    }
    Object.assign(existing.fields, chunk.fields)
    existing = await this.rateLimit.lock(() =>
      existing.update(),
    )
    this.changedEntries++
    return existing
  }
}

function isAsset(chunk: Entry | Asset): chunk is Asset {
  return chunk && chunk.sys && chunk.sys.type == 'Asset'
}
