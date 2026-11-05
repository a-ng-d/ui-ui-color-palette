import {
  PaletteData,
  SystemConfiguration,
  SystemData,
  SystemDataToken,
} from '@yelbolt/engine-ui-color-palette'
import { StructureAgentContext } from '../external/mistral/types'
import { arePathsEqual } from './mergeBindings'
import { EMPTY_REF_VALUE } from './emptyRef'

interface MakeStructureContextParams {
  paletteData: PaletteData
  systemData: SystemData
  system: SystemConfiguration
  stops: Array<string>
  tokens?: Array<SystemDataToken>
}

const makeStructureContext = ({
  paletteData,
  systemData,
  system,
  stops,
  tokens,
}: MakeStructureContextParams): StructureAgentContext => {
  const colorsById = new Map<
    string,
    StructureAgentContext['palette']['colors'][number]
  >()

  paletteData.themes.forEach((theme) =>
    theme.colors.forEach((color) => {
      const entry = colorsById.get(color.id) ?? {
        id: color.id,
        name: color.name,
        ...(color.description ? { description: color.description } : {}),
        shades: {},
      }

      color.shades.forEach((shade) => {
        entry.shades[shade.name] = {
          ...(entry.shades[shade.name] ?? {}),
          [theme.name]: shade.hex,
        }
      })

      colorsById.set(color.id, entry)
    })
  )

  const bindings = system.bindings ?? []

  return {
    palette: {
      name: paletteData.name,
      description: paletteData.description,
      stops,
      themes: paletteData.themes.map((theme) => ({
        id: theme.id,
        name: theme.name,
      })),
      colors: [...colorsById.values()],
    },
    schema: systemData.schema,
    tokens: (tokens ?? systemData.tokens).map((token) => {
      const binding = bindings.find((item) =>
        arePathsEqual(item.path, token.path)
      )

      return {
        path: token.path,
        pathNames: token.pathNames,
        ...(binding !== undefined && binding.ref !== EMPTY_REF_VALUE
          ? { ref: binding.ref }
          : {}),
        isExcluded: token.isExcluded,
        ...(token.description ? { description: token.description } : {}),
      }
    }),
  }
}

export default makeStructureContext
