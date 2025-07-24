import { MetaConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { getSupabase } from '../auth/client'
import { AppStates } from '../../ui/App'

const publishPalette = async ({
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

  const supabase = getSupabase()

  if (!supabase) throw new Error('Supabase client is not initialized')

  const { error } = await supabase
    .from(palettesDbTableName)
    .insert([
      {
        palette_id: rawData.id,
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
        created_at: rawData.dates.createdAt,
        updated_at: now,
        published_at: now,
      },
    ])
    .select()

  if (!error) {
    const meta: MetaConfiguration = {
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
        creatorId: rawData.userSession.userId,
        creatorFullName: rawData.userSession.userFullName,
        creatorAvatar: rawData.userSession.userAvatar,
      },
    }

    parent.postMessage(
      {
        pluginMessage: {
          type: 'UPDATE_PALETTE',
          id: meta.id,
          items: [
            {
              key: 'meta.dates.updatedAt',
              value: meta.dates.updatedAt,
            },
            {
              key: 'meta.dates.publishedAt',
              value: meta.dates.publishedAt,
            },
            {
              key: 'meta.publicationStatus.isPublished',
              value: meta.publicationStatus.isPublished,
            },
            {
              key: 'meta.publicationStatus.isShared',
              value: meta.publicationStatus.isShared,
            },
            {
              key: 'meta.creatorIdentity.creatorFullName',
              value: meta.creatorIdentity.creatorFullName,
            },
            {
              key: 'meta.creatorIdentity.creatorAvatar',
              value: meta.creatorIdentity.creatorAvatar,
            },
            {
              key: 'meta.creatorIdentity.creatorId',
              value: meta.creatorIdentity.creatorId,
            },
          ],
          isAlreadyUpdated: true,
        },
      },
      '*'
    )

    return meta
  } else throw error
}

export default publishPalette
