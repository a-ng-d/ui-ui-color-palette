import { doSpecificMode } from 'src/stores/features'

export default {
  env: {
    platform: 'figma',
    editor: 'dev',
    ui: 'figma-ui3',
    colorMode: 'figma-light',
  },
  features: doSpecificMode([], [], []),
}
