import yargs from 'yargs'
import { AppLinks } from './app-links';
import { Registrations } from './registrations';

const common = {
  spaceId: {
    type: 'string',
    description: 'Contentful space ID of CLC app',
    default: process.env.CONTENTFUL_SPACE || 'vsbnbtnlrnnr'
  },
  environmentId: {
    type: 'string',
    description: 'Contentful environment ID',
    default: 'master'
  },
  accessToken: { 
    type: 'string',
    description: 'Contentful CDN access token',
    default: process.env.CONTENTFUL_REST_KEY || 'k8mCSPw_UbsnK3XgC4JYpPVihDyRNLv5ZRZbfgcM6pg'
  },
  code: {
    type: 'string',
    description: 'Conference code in Contentful',
    default: 'CLC2021'
  },
  out: {
    type: 'string',
    alias: 'o',
    description: 'File to write out CSV output (defaults to stdout)',
    default: '-'
  },
  verbose: {
    type: 'boolean',
    alias: 'v',
    description: 'Set this to print debug output to stderr'
  }
} as const

const _argv = yargs
  .command(
    'registrations [code]',
    'Download registrations info from Heroku dataclip',
    {
      ...common,
      rockToken: {
        type: 'string',
        description: 'Rock API access token',
        default: process.env.ROCK_TOKEN || ''
      },
    },
    Main((argv) => new Registrations(argv).run())
  )
  .command(
    'app-links [code]',
    'Produce CSV of app links for all Contentful content',
    {
      ...common,
    },
    Main((argv) => new AppLinks(argv).run())
  )
  .demandCommand()
  .argv

function Main<TArgv>(task: (argv: TArgv) => Promise<void>): (argv: TArgv) => Promise<void> {
  return async (argv: TArgv) => {
    try {
      await task(argv)
      setTimeout(() => process.exit(0), 10)
    } catch (ex) {
      console.error(ex)
      process.exit(-1)
    }
  }
}
