import { MetaConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { getSupabase } from '../auth'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { ManagePaletteState } from '../../ui/services/ManagePalette'
import { AppState } from '../../ui/App'

const publishPalette = async ({
  paletteData,
  appData,
  palettesDbTableName,
  isShared = false,
  locales,
}: {
  paletteData: ManagePaletteState
  appData: AppState
  palettesDbTableName: string
  isShared?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  locales: (key: string, params?: Record<string, any> | undefined) => string
}): Promise<Partial<ManagePaletteState>> => {
  const now = new Date().toISOString()
  const name =
    paletteData.name === '' ||
    paletteData.name === locales('settings.global.name.default')
      ? locales('settings.global.name.self', {
          username: appData.userSession.userFullName,
        })
      : paletteData.name

  const supabase = getSupabase()

  if (!supabase) throw new Error('Supabase client is not initialized')

  const { error } = await supabase
    .from(palettesDbTableName)
    .insert([
      {
        palette_id: paletteData.id,
        name: name,
        description: paletteData.description,
        preset: paletteData.preset,
        shift: paletteData.shift,
        are_source_colors_locked: paletteData.areSourceColorsLocked,
        colors: paletteData.colors,
        color_space: paletteData.colorSpace,
        themes: paletteData.themes,
        algorithm_version: paletteData.algorithmVersion,
        is_shared: isShared,
        creator_id: appData.userSession.userId,
        created_at: paletteData.dates.createdAt,
        updated_at: now,
        published_at: now,
      },
    ])
    .select()

  if (!error) {
    const meta: MetaConfiguration = {
      id: paletteData.id,
      dates: {
        createdAt: paletteData.dates.createdAt,
        updatedAt: now,
        publishedAt: now,
        openedAt: paletteData.dates.openedAt,
      },
      publicationStatus: {
        isPublished: true,
        isShared: isShared,
      },
      creatorIdentity: {
        creatorId: appData.userSession.userId,
        creatorFullName: appData.userSession.userFullName,
        creatorAvatar: appData.userSession.userAvatar,
      },
    }

    sendPluginMessage(
      {
        pluginMessage: {
          type: 'UPDATE_PALETTE',
          id: meta.id,
          items: [
            {
              key: 'base.name',
              value: name,
            },
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
