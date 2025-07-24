import { ThemeConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { getSupabase } from '../auth/client'
import type { AppStates } from '../../ui/App'

const pullPalette = async ({
  rawData,
  palettesDbTableName,
}: {
  rawData: AppStates
  palettesDbTableName: string
}): Promise<Partial<AppStates>> => {
  const supabase = getSupabase()

  if (!supabase) throw new Error('Supabase client is not initialized')

  const { data, error } = await supabase
    .from(palettesDbTableName)
    .select('*')
    .eq('palette_id', rawData.id)

  if (!error && data.length === 1) {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'UPDATE_PALETTE',
          id: data[0].palette_id,
          items: [
            {
              key: 'base.name',
              value: data[0].name,
            },
            {
              key: 'base.description',
              value: data[0].description,
            },
            {
              key: 'base.preset',
              value: data[0].preset,
            },
            {
              key: 'base.shift',
              value: data[0].shift,
            },
            {
              key: 'base.areSourceColorsLocked',
              value: data[0].are_source_colors_locked,
            },
            {
              key: 'base.colors',
              value: data[0].colors,
            },
            {
              key: 'base.colorSpace',
              value: data[0].color_space,
            },
            {
              key: 'base.algorithmVersion',
              value: data[0].algorithm_version,
            },
            {
              key: 'themes',
              value: data[0].themes,
            },
            {
              key: 'meta.dates.publishedAt',
              value: data[0].published_at,
            },
            {
              key: 'meta.dates.createdAt',
              value: data[0].created_at,
            },
            {
              key: 'meta.dates.updatedAt',
              value: data[0].updated_at,
            },
            {
              key: 'meta.dates.openedAt',
              value: rawData.dates.openedAt,
            },
            {
              key: 'meta.publicationStatus.isPublished',
              value: true,
            },
            {
              key: 'meta.publicationStatus.isShared',
              value: data[0].is_shared,
            },
            {
              key: 'meta.creatorIdentity.creatorId',
              value: data[0].creator_id,
            },
            {
              key: 'meta.creatorIdentity.creatorFullName',
              value: data[0].creator_full_name,
            },
            {
              key: 'meta.creatorIdentity.creatorAvatar',
              value: data[0].creator_avatar,
            },
          ],
          isAlreadyUpdated: true,
        },
      },
      '*'
    )

    return {
      id: data[0].palette_id,
      name: data[0].name,
      description: data[0].description,
      preset: data[0].preset,
      scale:
        data[0].themes.find((theme: ThemeConfiguration) => theme.isEnabled)
          ?.scale || {},
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
