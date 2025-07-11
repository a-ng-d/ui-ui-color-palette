import { getSupabase } from '../auth/client'
import type { AppStates } from '../../ui/App'

const pushPalette = async ({
  rawData,
  palettesDbTableName,
  isShared = false,
  locales,
}: {
  rawData: AppStates
  palettesDbTableName: string
  isShared?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  locales: any
}): Promise<Partial<AppStates>> => {
  const now = new Date().toISOString()
  const name =
    rawData.name === '' || rawData.name === locales.settings.global.name.default
      ? locales.settings.global.name.self.replace(
          '{username}',
          rawData.userSession.userFullName
        )
      : rawData.name

  const { error } = await getSupabase()
    .from(palettesDbTableName)
    .update([
      {
        name: name,
        description: rawData.description,
        preset: rawData.preset,
        shift: rawData.shift,
        are_source_colors_locked: rawData.areSourceColorsLocked,
        colors: rawData.colors,
        color_space: rawData.colorSpace,
        themes: rawData.themes,
        algorithm_version: rawData.algorithmVersion,
        is_shared: isShared,
        creator_full_name: rawData.userSession.userFullName,
        creator_avatar: rawData.userSession.userAvatar,
        creator_id: rawData.userSession.userId,
        updated_at: now,
        published_at: now,
      },
    ])
    .match({ palette_id: rawData.id })

  if (!error) {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'UPDATE_PALETTE',
          id: rawData.id,
          items: [
            {
              key: 'base.name',
              value: name,
            },
            {
              key: 'meta.publicationStatus.isShared',
              value: isShared,
            },
            {
              key: 'meta.dates.updatedAt',
              value: now,
            },
            {
              key: 'meta.dates.publishedAt',
              value: now,
            },
          ],
          isAlreadyUpdated: true,
        },
      },
      '*'
    )

    return {
      name: name,
      dates: {
        createdAt: rawData.dates.createdAt,
        updatedAt: now,
        publishedAt: now,
        openedAt: rawData.dates.openedAt,
      },
    }
  } else throw error
}

export default pushPalette
