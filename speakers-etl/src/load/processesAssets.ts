import { Semaphore, timeout } from 'async-toolbox'
import { ParallelTransform } from 'async-toolbox/stream'
import { Asset, Entry, Environment } from 'contentful-management'
import { PassThrough } from 'stream'

export class ProcessesAssets extends ParallelTransform {
  private processCount = 0
  private resizeCount = 0

  constructor(public readonly environment: Environment, private readonly rateLimit: Semaphore) {
    super({
      objectMode: true,
      // Allow 3 parallel asset processings to happen at the same time
      maxParallelChunks: 3,
    })
  }

  public async _transformAsync(chunk: Entry | Asset) {
    if (!isAsset(chunk)) {
      // nothing to do - pass it on to the next stage
      this.push(chunk)
      return
    }
    try {
      const result: Asset = await timeout(() => this.processAsset(chunk), 100000)
      this.push(result)
    } catch (ex: any) {
      if (ex.name == 'AssetProcessingTimeout' || ex.name == 'TimeoutError') {
        this.emit('warning', chunk.sys.id, `timeout during processing`)
        // put it back on the queue to be retried
        this.write(chunk)
      } else {
        throw ex
      }
    }
  }

  private async processAsset(asset: Asset): Promise<Asset> {
    if (!asset.fields.file['en-US'].details) {
      asset = await this.rateLimit.lock(() =>
        asset.processForLocale('en-US'),
      )
      this.processCount++
    }

    this.emit('status', `${this.processCount} processed, ${this.resizeCount} resized`)

    return asset
  }
}

function isAsset(chunk: Entry | Asset): chunk is Asset {
  return chunk && chunk.sys && chunk.sys.type == 'Asset'
}
