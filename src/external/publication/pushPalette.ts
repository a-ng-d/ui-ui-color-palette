import { getSupabase } from '../auth'
import { sendPluginMessage } from '../../utils/pluginMessage'
import { ManagePaletteState } from '../../ui/services/ManagePalette'
import type { AppState } from '../../ui/App'

const pushPalette = async ({
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
}): Promise<Partial<ManagePaletteState & AppState>> => {
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
    .update([
      {
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
        updated_at: now,
        published_at: now,
      },
    ])
    .match({ palette_id: paletteData.id })

  if (!error) {
    sendPluginMessage(
      {
        pluginMessage: {
          type: 'UPDATE_PALETTE',
          id: paletteData.id,
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
        createdAt: paletteData.dates.createdAt,
        updatedAt: now,
        publishedAt: now,
        openedAt: paletteData.dates.openedAt,
      },
      publicationStatus: {
        isPublished: paletteData.publicationStatus.isPublished,
        isShared: isShared,
      },
    }
  } else throw error
}

export default pushPalette
