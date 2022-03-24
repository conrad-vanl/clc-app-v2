import { Asset, Entry, Link } from "./contentful/types"
import { present } from "./util"

export function transformPersonToSpeaker(entry: Entry<PersonProps>, personIdToTeam: Record<string, Entry>): any {
  const name = [entry.fields.firstName, entry.fields.lastName].filter(present).join(' ')
  const bio = 
    entry.fields.hasProfilePage !== false &&
      `[Read ${entry.fields.firstName}'s Bio](https://www.watermark.org/people/${entry.fields.slug})` ||
      ''

  const team: Entry | undefined = personIdToTeam[entry.sys.id]

  return {
    sys: {
      id: entry.sys.id,
      type: 'Entry',
      contentType: {
        sys: {
          type: 'Link',
          linkType: 'ContentType',
          id: 'speaker'
        }
      }
    },
    fields: {
      internalTitle: { 'en-US': name },
      name: { 'en-US': name },
      summary: { 'en-US': entry.fields.title },
      biography: { 'en-US': bio },
      isOnConferenceDirectory: { 'en-US': entry.fields.onStaff },
      team: { 'en-US': team?.fields?.name || entry.fields.team },
      email: { 'en-US': entry.fields.email }
    }
  }
}

export function mergeSpeakers(existing: Entry<SpeakerProps>, newSpeaker: Entry<SpeakerProps>) {
  return {
    ...existing,
    fields: {
      ...existing.fields,
      biography: newSpeaker.fields.biography,
      email: newSpeaker.fields.email,
      team: newSpeaker.fields.team,
      isOnConferenceDirectory: newSpeaker.fields.isOnConferenceDirectory
    }
  }
}

export function createAssetUpload(asset: Asset) {
  return {
    sys: asset.sys,
    fields: {
      title: { 'en-US': asset.fields.title },
      file: {
        'en-US': {
          upload: rewriteContentfulUrl(asset.fields.file.url),
          fileName: asset.fields.file.fileName,
          contentType: asset.fields.file.contentType,
        } 
      }
    }
  }
}

export interface PersonProps {
  firstName: string,
  lastName: string,
  email: string,
  slug: string,
  onStaff: boolean,
  hasProfilePage: boolean
  title: string
  team: string
}

export interface SpeakerProps {
  internalTitle: string,
  name: string
  summary: string
  email: string
  team: string
  biography: string
  photo?: Link<'Asset'>
  isOnConferenceDirectory: boolean
}

function rewriteContentfulUrl(url: string): string {
  return url.replace(/^(https?\:)?\/\//, 'https://')
}
