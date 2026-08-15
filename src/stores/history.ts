import { atom } from 'nanostores'
import {
  ExchangeConfiguration,
  ThemeConfiguration,
} from '@yelbolt/engine-ui-color-palette'
import { sendPluginMessage } from '../utils/pluginMessage'
import { $palette, $themes } from './palette'

const MAX_DEPTH = 50
const DEBOUNCE_MS = 400

interface Snapshot {
  palette: ExchangeConfiguration
  themes: Array<ThemeConfiguration>
}

let stack: Snapshot[] = []
let cursor = -1
let isApplying = false
let pending: Snapshot | null = null
let timer: number | null = null
let unsubscribers: Array<() => void> = []

export const $canUndo = atom(false)
export const $canRedo = atom(false)

const getSnapshot = (): Snapshot => ({
  palette: structuredClone($palette.get()),
  themes: structuredClone($themes.get()),
})

const refresh = () => {
  $canUndo.set(cursor > 0)
  $canRedo.set(cursor < stack.length - 1)
}

const commit = (snap: Snapshot) => {
  stack = stack.slice(0, cursor + 1)
  stack.push(structuredClone(snap))
  if (stack.length > MAX_DEPTH) {
    stack.shift()
    cursor = stack.length - 1
  } else cursor = stack.length - 1
  refresh()
}

export const flush = () => {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
  if (pending) {
    commit(pending)
    pending = null
  }
}

const scheduleCommit = () => {
  if (isApplying) return
  pending = getSnapshot()
  if (timer !== null) clearTimeout(timer)
  timer = window.setTimeout(() => {
    if (pending) commit(pending)
    pending = null
    timer = null
  }, DEBOUNCE_MS)
}

const apply = (snap: Snapshot) => {
  isApplying = true
  $palette.set(structuredClone(snap.palette))
  $themes.set(structuredClone(snap.themes))
  isApplying = false
  refresh()

  sendPluginMessage(
    {
      pluginMessage: {
        type: 'UPDATE_PALETTE',
        id: snap.palette.id,
        shouldLoadPalette: false,
        items: [
          { key: 'base.name', value: snap.palette.name },
          { key: 'base.description', value: snap.palette.description },
          { key: 'base.preset', value: snap.palette.preset },
          { key: 'base.shift', value: snap.palette.shift },
          {
            key: 'base.areSourceColorsLocked',
            value: snap.palette.areSourceColorsLocked,
          },
          { key: 'base.colors', value: snap.palette.colors },
          { key: 'base.colorSpace', value: snap.palette.colorSpace },
          {
            key: 'base.algorithmVersion',
            value: snap.palette.algorithmVersion,
          },
          { key: 'themes', value: snap.themes },
        ],
      },
    },
    '*'
  )
}

export const suppressHistory = (fn: () => void) => {
  const wasApplying = isApplying
  isApplying = true
  try {
    fn()
  } finally {
    isApplying = wasApplying
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
    pending = null
  }
}

export const initHistory = () => {
  unsubscribers.forEach((u) => u())
  unsubscribers = []

  stack = [getSnapshot()]
  cursor = 0
  refresh()

  unsubscribers = [
    $palette.listen(() => scheduleCommit()),
    $themes.listen(() => scheduleCommit()),
  ]
}

export const undo = () => {
  flush()
  if (cursor <= 0) return
  cursor -= 1
  apply(stack[cursor])
}

export const redo = () => {
  if (cursor >= stack.length - 1) return
  cursor += 1
  apply(stack[cursor])
}

export const clearHistory = () => {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
  pending = null
  stack = [getSnapshot()]
  cursor = 0
  refresh()
}

export const teardownHistory = () => {
  unsubscribers.forEach((u) => u())
  unsubscribers = []
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
  pending = null
  stack = []
  cursor = -1
  refresh()
}
