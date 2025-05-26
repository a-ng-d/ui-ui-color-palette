import { doSpecificMode } from 'src/stores/features'

export default {
  env: {
    platform: 'figma',
    editor: 'figma',
    ui: 'figma-ui3',
    colorMode: 'figma-dark',
  },
  features: doSpecificMode([], [], []),
}
