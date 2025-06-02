import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { supabase } from '../../index'
import type { AppStates } from '../../ui/App'

const pullPalette = async ({
  rawData,
  palettesDbTableName,
}: {
  rawData: AppStates
  palettesDbTableName: string
}): Promise<Partial<AppStates>> => {
  const { data, error } = await supabase
    .from(palettesDbTableName)
    .select('*')
    .eq('palette_id', rawData.id)

  if (!error && data.length === 1) {
    const palette: FullConfiguration = new Data({
      base: {
        name: data[0].name,
        description: data[0].description,
        preset: data[0].preset,
        shift: data[0].shift,
        areSourceColorsLocked: data[0].are_source_colors_locked,
        colors: data[0].colors,
        colorSpace: data[0].color_space,
        algorithmVersion: data[0].algorithm_version,
      },
      themes: data[0].themes,
      meta: {
        id: data[0].palette_id,
        dates: {
          createdAt: data[0].created_at,
          updatedAt: data[0].updated_at,
          publishedAt: data[0].published_at,
          openedAt: rawData.dates.openedAt,
        },
        publicationStatus: {
          isPublished: true,
          isShared: data[0].is_shared,
        },
        creatorIdentity: {
          creatorId: data[0].creator_id,
          creatorFullName: data[0].creator_full_name,
          creatorAvatar: data[0].creator_avatar,
        },
      },
    }).makePaletteFullData()

    parent.postMessage(
      {
        pluginMessage: {
          type: 'SET_DATA',
          items: [
            {
              key: `palette_${data[0].palette_id}`,
              value: palette,
            },
          ],
        },
      },
      '*'
    )

    return {
      id: data[0].palette_id,
      name: data[0].name,
      description: data[0].description,
      preset: data[0].preset,
      shift: data[0].shift,
      areSourceColorsLocked: data[0].are_source_colors_locked,
      colors: data[0].colors,
      colorSpace: data[0].color_space,
      algorithmVersion: data[0].algorithm_version,
      themes: data[0].themes,
      dates: {
        publishedAt: data[0].published_at,
        createdAt: data[0].created_at,
        updatedAt: data[0].updated_at,
        openedAt: rawData.dates.openedAt,
      },
      publicationStatus: {
        isPublished: true,
        isShared: data[0].is_shared,
      },
      creatorIdentity: {
        creatorFullName: data[0].creator_full_name,
        creatorAvatar: data[0].creator_avatar,
        creatorId: data[0].creator_id,
      },
    }
  } else throw error
}

export default pullPalette
