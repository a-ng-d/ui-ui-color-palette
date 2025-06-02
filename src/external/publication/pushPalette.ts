import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { supabase } from '../../index'
import type { AppStates } from '../../ui/App'

const pushPalette = async ({
  rawData,
  palettesDbTableName,
  isShared = false,
  locals,
}: {
  rawData: AppStates
  palettesDbTableName: string
  isShared?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  locals: any
}): Promise<Partial<AppStates>> => {
  const now = new Date().toISOString()
  const name =
    rawData.name === '' || rawData.name === locals.settings.global.name.default
      ? locals.settings.global.name.self.replace(
          '$1',
          rawData.userSession.userFullName
        )
      : rawData.name

  const { error } = await supabase
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
        updated_at: rawData.dates.updatedAt,
        published_at: now,
      },
    ])
    .match({ palette_id: rawData.id })

  if (!error) {
    const palette: FullConfiguration = new Data({
      base: {
        name: name,
        description: rawData.description,
        preset: rawData.preset,
        shift: rawData.shift,
        areSourceColorsLocked: rawData.areSourceColorsLocked,
        colors: rawData.colors,
        colorSpace: rawData.colorSpace,
        algorithmVersion: rawData.algorithmVersion,
      },
      themes: rawData.themes,
      meta: {
        id: rawData.id,
        dates: {
          createdAt: rawData.dates.createdAt,
          updatedAt: now,
          publishedAt: now,
          openedAt: rawData.dates.openedAt,
        },
        publicationStatus: {
          isPublished: true,
          isShared: isShared,
        },
        creatorIdentity: {
          creatorFullName: rawData.userSession.userFullName,
          creatorAvatar: rawData.userSession.userAvatar,
          creatorId: rawData.userSession.userId,
        },
      },
    }).makePaletteFullData()

    parent.postMessage(
      {
        pluginMessage: {
          type: 'SET_DATA',
          items: [
            {
              key: `palette_${rawData.id}`,
              value: palette,
            },
          ],
        },
      },
      '*'
    )

    return {
      id: rawData.id,
      name: name,
      description: rawData.description,
      preset: rawData.preset,
      shift: rawData.shift,
      areSourceColorsLocked: rawData.areSourceColorsLocked,
      colors: rawData.colors,
      colorSpace: rawData.colorSpace,
      algorithmVersion: rawData.algorithmVersion,
      themes: rawData.themes,
      dates: {
        publishedAt: now,
        createdAt: rawData.dates.createdAt,
        updatedAt: now,
        openedAt: rawData.dates.openedAt,
      },
      publicationStatus: {
        isPublished: true,
        isShared: isShared,
      },
      creatorIdentity: {
        creatorFullName: rawData.userSession.userFullName,
        creatorAvatar: rawData.userSession.userAvatar,
        creatorId: rawData.userSession.userId,
      },
    }
  } else throw error
}

export default pushPalette
