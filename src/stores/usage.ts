import { MeteredAction } from '../types/messages'
import { ActionEvent } from '../types/events'

export interface PendingRun {
  feature: ActionEvent['feature']
}

const pendingRuns = new Map<MeteredAction, PendingRun>()

export const setPendingRun = (action: MeteredAction, run: PendingRun) =>
  pendingRuns.set(action, run)

export const takePendingRun = (
  action: MeteredAction
): PendingRun | undefined => {
  const run = pendingRuns.get(action)
  pendingRuns.delete(action)
  return run
}

export const clearPendingRun = (action: MeteredAction) =>
  pendingRuns.delete(action)
