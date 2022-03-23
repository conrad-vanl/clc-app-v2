import { Limiter } from 'async-toolbox'
import { Pipeline } from 'async-toolbox/pipeline'
import chalk from 'chalk'
import {createClient} from 'contentful-management'

import { ProcessesAssets } from './load/processesAssets'
import { PublishesEntries } from './load/publishesEntries'
import { UploadsEntries } from './load/uploadsEntries'
import { assign, Options, present, prompt, required, wait } from './util'

interface LoadArgs {
  warnings: '-' | string | NodeJS.WritableStream
  spaceId: string,
  managementToken: string
  environmentId?: string,
  publish: boolean,
  confirm: boolean
  progress: boolean
}

export class Load {
  private readonly options: Readonly<LoadArgs>

  constructor(options: Options<LoadArgs>) {
    const opts = assign({
        spaceId: process.env.CONTENTFUL_SPACE_ID,
        environmentId: process.env.CONTENTFUL_ENVIRONMENT,
        managementToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
        publish: false,
        confirm: false,
        progress: true,
      },
      options)

    this.options = required(opts, 'spaceId', 'managementToken')
  }

  public async getPipeline() {
    const { spaceId, managementToken, publish, confirm } = this.options
    let environmentId = this.options.environmentId

    if (!present(environmentId)) {
      environmentId = 'master'
    }

    if (environmentId == 'master') {
      console.error(chalk.yellow(`Importing entries into MASTER!`))
      if (confirm) {
        chalk.yellow('Abort (ctrl-c) within 10 seconds if this is a mistake')
        await wait(10000)
      } else {
        let resp: string = await prompt(chalk.cyan('Confirm? (y/n):'))
        while (!resp.match(/^(y|n)/i)) {
          resp = await prompt('Please answer yes or no:')
        }
        if (!resp.match(/^y/i)) {
          throw new Error('Aborted')
        }
      }
    } else {
      console.error(chalk.gray(`Importing entries into ${environmentId}!`))
    }

    const client = createClient({
      accessToken: managementToken,
    })
    const space = await client.getSpace(spaceId)
    const env = await space.getEnvironment(environmentId)

    // By default the Contentful Management API enforces rate limits of
    // 10 requests per second and 36000 requests per hour.
    const rateLimit = new Limiter({
      interval: 'second',
      // give us some extra room for ProcessesAssets...
      tokensPerInterval: 6,
    })

    const pipeline = new Pipeline(...[
      new UploadsEntries(env, rateLimit),
      new ProcessesAssets(env, rateLimit),
      publish && new PublishesEntries(env, rateLimit)
    ].filter(present))

    // in the load step, we collect all warnings and write them to the output
    const warningsFile = process.stderr

    pipeline.pipeline.forEach((stream) => {
      stream.on('warning', (...msg: any[]) => {
        msg.forEach((part) => {
          warningsFile.write(part.toString())
          warningsFile.write('\t')
        })
        warningsFile.write('\n')
      })
    })

    return Object.assign(pipeline, { name: 'Load' })
  }
}
