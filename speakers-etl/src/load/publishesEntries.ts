import { Semaphore } from 'async-toolbox'
import { ParallelTransform } from 'async-toolbox/stream'
import chalk from 'chalk'
import { Asset, Entry, Environment } from 'contentful-management'

export class PublishesEntries extends ParallelTransform {
  private publishedAssetCount: number = 0
  private publishedEntryCount: number = 0
  private skippedCount: number = 0

  constructor(public readonly environment: Environment, private readonly rateLimit: Semaphore) {
    super({
      objectMode: true,
      // publish 1 entry at a time
      maxParallelChunks: 1,
      // allow 10 entries in the publish queue
      highWaterMark: 10,
    })
  }

  public async _transformAsync(chunk: Entry | Asset) {
    if (chunk.isPublished() && !chunk.isUpdated()) {
      this.push(chunk)
      return
    }

    if (isAsset(chunk)) {
      const publishedAsset: Asset | undefined = await this.publishAsset(chunk)
      if (publishedAsset) {
        this.push(publishedAsset)
      }
    } else {
      const publishedEntry: Entry | undefined = await this.publishEntry(chunk)
      if (publishedEntry) {
        this.push(publishedEntry)
      }
    }
    this.emit('status', `published ${this.publishedEntryCount} entries and ${this.publishedAssetCount} assets ` +
      `(${this.skippedCount} skipped)`)
  }

  private async publishAsset(asset: Asset): Promise<Asset | undefined> {
    try {
      asset = await this.rateLimit.lock(() =>
            asset.publish())
    } catch (ex: any) {
      if (!['VersionMismatch'].includes(ex.name)) {
        throw ex
      }

      // version mismatch means that asset processing updated the asset while
      // we were waiting and we need to reload it and try again
      asset = await this.rateLimit.lock(() =>
        this.environment.getAsset(asset.sys.id))
      this.write(asset)
      return
    }
    this.publishedAssetCount++
    return asset
  }

  private async publishEntry(entry: Entry): Promise<Entry | undefined> {
    try {
      entry = await this.rateLimit.lock(() =>
          entry.publish())
    } catch (ex: any) {
      if (!['UnresolvedLinks', 'InvalidEntry'].includes(ex.name)) {
        throw ex
      }

      const data = JSON.parse(ex.message)
      const err = data.details.errors[0]
      if (!err) {
        throw ex
      }
      if (err.name == 'unique' && err.path.join('.') == 'fields.slug.en-US') {
        this.emit('warning', entry.sys.id, `skipping publishing for '${entry.fields.slug['en-US']}' - already exists`)
        this.skippedCount++
        return
      } else if (err.name == 'notResolvable') {
        console.error(chalk.gray(`Dependency of ${entry.sys.id} not yet published`))
        // put the entry back on the publish queue - hopefully its dependencies
        // will have been published by the time it gets back around
        this.write(entry)
        return
      } else {
        // validation errors need to go into the warning.txt output file
        this.emit('warning', entry.sys.id, ex.message)
      }
    }
    this.publishedEntryCount++
    return entry
  }
}

function isAsset(chunk: Entry | Asset): chunk is Asset {
  return chunk && chunk.sys && chunk.sys.type == 'Asset'
}
