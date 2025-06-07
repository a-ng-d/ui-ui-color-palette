const enableTrial = async (trialTime: number, trialVersion: string) => {
  const date = new Date().getTime()
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null

  window.localStorage.setItem('trial_start_date', date.toString())
  window.localStorage.setItem('trial_version', trialVersion)
  window.localStorage.setItem('trial_time', trialTime.toString())

  iframe?.contentWindow?.postMessage({
    type: 'ENABLE_TRIAL',
    data: {
      date: date,
      trialTime: trialTime,
    },
  })
}

export default enableTrial
