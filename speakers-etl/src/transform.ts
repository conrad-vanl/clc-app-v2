import { Asset, Entry, Link } from "./contentful/types"
import { present } from "./util"

export async function transformPersonToSpeaker(entry: Entry<PersonProps>): Promise<Entry<SpeakerProps>> {
  const name = [entry.fields.firstName, entry.fields.lastName].filter(present).join(' ')
  const bio = 
    entry.fields.hasProfilePage &&
      `__${entry.fields.title}__\n[Read ${entry.fields.firstName}'s Bio](https://www.watermark.org/people/${entry.fields.slug})` ||
      ''

  return {
    ...entry,
    fields: {
      internalTitle: name,
      name: name,
      summary: entry.fields.title,
      biography: bio,
      isOnConferenceDirectory: entry.fields.onStaff,
      team: entry.fields.team,
      email: entry.fields.email
    }
  }
}

export function mergeSpeakers(existing: Entry<SpeakerProps>, newSpeaker: Entry<SpeakerProps>) {
  return {
    ...existing,
    fields: {
      ...existing.fields,
      email: newSpeaker.fields.email,
      team: newSpeaker.fields.team
    }
  }
}

export function createAssetUpload(asset: Asset) {
  return {
    sys: asset.sys,
    fields: {
      title: asset.fields.title,
      file: {
        upload: asset.fields.file.url,
        fileName: asset.fields.file.fileName,
        contentType: asset.fields.file.contentType,
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