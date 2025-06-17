const enableTrial = async (trialTime: number, trialVersion: string) => {
  const now = new Date().getTime()
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null

  window.localStorage.setItem('trial_start_date', now.toString())
  window.localStorage.setItem('trial_version', trialVersion)
  window.localStorage.setItem('trial_time', trialTime.toString())

  return iframe?.contentWindow?.postMessage({
    type: 'ENABLE_TRIAL',
    data: {
      date: now,
      trialTime: trialTime,
    },
  })
}

export default enableTrial
