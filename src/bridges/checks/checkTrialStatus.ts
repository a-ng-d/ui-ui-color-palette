import globalConfig from '../../global.config'

const checkTrialStatus = async () => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const trialStartDate =
    window.localStorage.getItem('trial_start_date') !== null
      ? parseFloat(window.localStorage.getItem('trial_start_date') ?? '0')
      : null
  const currentTrialVersion: string =
    window.localStorage.getItem('trial_version') || ''
  const currentTrialTime: number = parseFloat(
    window.localStorage.getItem('trial_time') || '72'
  )

  let consumedTime = 0,
    trialStatus = 'UNUSED'

  if (trialStartDate) {
    consumedTime =
      (new Date().getTime() - new Date(trialStartDate).getTime()) /
      1000 /
      (60 * 60)

    if (consumedTime <= currentTrialTime && globalConfig.plan.isTrialEnabled)
      trialStatus = 'PENDING'
    else if (
      consumedTime >= globalConfig.plan.trialTime &&
      globalConfig.plan.isTrialEnabled
    )
      trialStatus = 'EXPIRED'
    else trialStatus = 'UNUSED'
  }

  iframe?.contentWindow?.postMessage({
    type: 'CHECK_TRIAL_STATUS',
    data: {
      planStatus:
        trialStatus === 'PENDING' || !globalConfig.plan.isProEnabled
          ? 'PAID'
          : 'UNPAID',
      trialStatus: trialStatus,
      trialRemainingTime: Math.ceil(
        currentTrialVersion !== globalConfig.versions.trialVersion
          ? currentTrialTime - consumedTime
          : globalConfig.plan.trialTime - consumedTime
      ),
    },
  })

  return trialStatus === 'PENDING' || !globalConfig.plan.isProEnabled
    ? 'PAID'
    : 'UNPAID'
}

export default checkTrialStatus
