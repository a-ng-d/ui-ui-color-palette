import { doSpecificMode } from 'src/stores/features'

export default {
  env: {
    platform: 'penpot',
    editor: 'penpot',
    ui: 'penpot',
    colorMode: 'penpot-dark',
  },
  features: doSpecificMode([], [], []),
}
