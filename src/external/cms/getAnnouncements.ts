import { buildHeaders } from '../cms'
import { Language } from '../../types/translations'
import { Platform } from '../../types/app'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NotionItem = Record<string, any>

const PLATFORM_LABELS: Record<Platform, string> = {
  figma: 'Figma',
  penpot: 'Penpot',
  sketch: 'Sketch',
  framer: 'Framer',
}

const DEFAULT_LANGUAGE: Language = 'en-US'
const LOCALIZED_FIELD_SEPARATOR = '|||'

const plain = (property: NotionItem | undefined): string =>
  ((property?.rich_text ?? []) as Array<{ plain_text: string }>)
    .map((run) => run.plain_text)
    .join('')

const localizedContent = (
  item: NotionItem,
  language: Language
): { title: string; description: string } | null => {
  const raw = plain(item.properties[language])
  if (!raw) return null

  const [title = '', description = ''] = raw.split(LOCALIZED_FIELD_SEPARATOR)
  return { title: title.trim(), description: description.trim() }
}

const resolveLocalizedItem = (
  item: NotionItem,
  language: Language
): NotionItem => {
  const content =
    localizedContent(item, language) ?? localizedContent(item, DEFAULT_LANGUAGE)

  if (!content) return item

  return {
    ...item,
    properties: {
      ...item.properties,
      Title: {
        ...item.properties['Title'],
        title: [{ plain_text: content.title }],
      },
      Description: {
        ...item.properties['Description'],
        rich_text: [{ plain_text: content.description }],
      },
    },
  }
}

const getAnnouncements = (
  workerUrl: string,
  dbId: string,
  platform: Platform,
  language: Language
): Promise<NotionItem[]> =>
  fetch(`${workerUrl}/?action=get_announcements&database_id=${dbId}`, {
    headers: buildHeaders(),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === 'The database could not be queried')
        throw new Error(data.message)

      const label = PLATFORM_LABELS[platform]
      console.log(data.announcements)
      return (data.announcements as NotionItem[])
        .filter((item) =>
          item.properties['Platforms']?.multi_select?.some(
            (entry: { name: string }) => entry.name === label
          )
        )
        .map((item) => resolveLocalizedItem(item, language))
    })

export default getAnnouncements
