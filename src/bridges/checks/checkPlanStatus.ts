import globalConfig from '../../global.config'

const checkPlanStatus = async () => {
  // figma.clientStorage.deleteAsync('trial_start_date')
  // figma.clientStorage.deleteAsync('trial_version')
  // window.localStorage.setItem(
  //  'trial_start_date',
  //  (new Date().getTime() - 72 * 60 * 60 * 1000).toString()
  // )
  // figma.payments?.setPaymentStatusInDevelopment({
  //   type: 'UNPAID',
  // })

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

    if (
      consumedTime <= currentTrialTime &&
      currentTrialVersion !== globalConfig.versions.trialVersion
    ) {
      trialStatus = 'PENDING'
    } else if (consumedTime >= globalConfig.plan.trialTime)
      trialStatus = 'EXPIRED'
    else trialStatus = 'PENDING'
  }

  iframe?.contentWindow?.postMessage({
    type: 'CHECK_PLAN_STATUS',
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

export default checkPlanStatus
