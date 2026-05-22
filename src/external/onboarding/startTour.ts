import { driver } from 'driver.js'
import { Context, Mode } from '../../types/app'

type TFunction = (key: string, params?: Record<string, unknown>) => string

export type TourCallbacks = {
  setMode: (mode: Mode) => void
  setEditContext: (context: Context | '') => void
  setInspectContext: (context: Context | '') => void
}

const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))

export const showNoPaletteNotice = (t: TFunction) => {
  const d = driver({
    allowClose: true,
    showButtons: ['next', 'close'],
    doneBtnText: t('tour.buttons.done'),
    steps: [
      {
        popover: {
          title: t('tour.noPalette.title'),
          description: t('tour.noPalette.description'),
        },
      },
    ],
  })
  d.drive()
}

const startTour = async (t: TFunction, callbacks: TourCallbacks) => {
  callbacks.setMode('EDIT')
  await wait(200)
  callbacks.setEditContext('SCALE')
  await wait(300)

  const d = driver({
    showProgress: true,
    allowClose: true,
    progressText: t('tour.progress', {
      current: '{{current}}',
      total: '{{total}}',
    }),
    nextBtnText: t('tour.buttons.next'),
    prevBtnText: t('tour.buttons.prev'),
    doneBtnText: t('tour.buttons.done'),
    steps: [
      {
        element: 'section.context',
        popover: {
          title: t('tour.scale.title'),
          description: t('tour.scale.description'),
        },
      },
      {
        element: 'section.context',
        popover: {
          title: t('tour.colors.title'),
          description: t('tour.colors.description'),
        },
      },
      {
        element: '[data-id="tour-themes"]',
        popover: {
          title: t('tour.themes.title'),
          description: t('tour.themes.description'),
        },
      },
      {
        element: 'section.context',
        popover: {
          title: t('tour.imports.title'),
          description: t('tour.imports.description'),
        },
      },
      {
        element: 'section.context',
        popover: {
          title: t('tour.settings.title'),
          description: t('tour.settings.description'),
        },
      },
      {
        element: '[data-id="tour-publication"]',
        popover: {
          title: t('tour.publication.title'),
          description: t('tour.publication.description'),
        },
      },
      {
        element: '[data-id="tour-report"]',
        popover: {
          title: t('tour.report.title'),
          description: t('tour.report.description'),
        },
      },
      {
        element: '#tour-scores-controls',
        popover: {
          title: t('tour.scoresControls.title'),
          description: t('tour.scoresControls.description'),
        },
      },
      {
        element: '#export-palette',
        popover: {
          title: t('tour.export.title'),
          description: t('tour.export.description'),
        },
      },
    ],
    onPrevClick: async () => {
      const current = d.getActiveIndex() ?? 0

      switch (current) {
        case 1:
          callbacks.setEditContext('SCALE')
          break
        case 2:
          callbacks.setEditContext('COLORS')
          break
        case 3:
          callbacks.setEditContext('')
          break
        case 4:
          callbacks.setEditContext('IMPORTS')
          break
        case 5:
          callbacks.setEditContext('SETTINGS')
          break
        case 6:
          callbacks.setMode('EDIT')
          await wait(100)
          callbacks.setEditContext('')
          break
        case 7:
          callbacks.setInspectContext('')
          break
        case 8:
          callbacks.setMode('INSPECT')
          await wait(100)
          callbacks.setInspectContext('')
          break
      }

      await wait(300)
      d.movePrevious()
    },
    onNextClick: async () => {
      const current = d.getActiveIndex() ?? 0

      switch (current) {
        case 0:
          callbacks.setEditContext('COLORS')
          break
        case 1:
          callbacks.setEditContext('')
          break
        case 2:
          callbacks.setEditContext('IMPORTS')
          break
        case 3:
          callbacks.setEditContext('SETTINGS')
          break
        case 4:
          callbacks.setEditContext('')
          break
        case 5:
          callbacks.setMode('INSPECT')
          await wait(100)
          callbacks.setInspectContext('')
          break
        case 6:
          break
        case 7:
          callbacks.setMode('EXPORT')
          break
      }

      await wait(300)
      d.moveNext()
    },
  })

  d.drive()
}

export default startTour
