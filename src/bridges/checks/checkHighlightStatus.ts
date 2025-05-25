const checkHighlightStatus = (remoteVersion: string) => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const localVersion = window.localStorage.getItem('highlight_version')
  const isOnboardingRead = window.localStorage.getItem('is_onboarding_read')

  if (localVersion === undefined && remoteVersion === undefined)
    return {
      type: 'PUSH_HIGHLIGHT_STATUS',
      data: {
        status: 'NO_HIGHLIGHT',
      },
    }
  else if (localVersion === undefined && isOnboardingRead === undefined)
    return iframe?.contentWindow?.postMessage({
      type: 'PUSH_ONBOARDING_STATUS',
      data: {
        status: 'DISPLAY_ONBOARDING_DIALOG',
      },
    })
  else if (localVersion === undefined)
    return iframe?.contentWindow?.postMessage({
      type: 'PUSH_HIGHLIGHT_STATUS',
      data: {
        status: 'DISPLAY_HIGHLIGHT_DIALOG',
      },
    })
  else {
    const remoteMajorVersion = remoteVersion.split('.')[0],
      remoteMinorVersion = remoteVersion.split('.')[1]

    const localMajorVersion = localVersion?.split('.')[0],
      localMinorVersion = localVersion?.split('.')[1]

    if (remoteMajorVersion !== localMajorVersion)
      return iframe?.contentWindow?.postMessage({
        type: 'PUSH_HIGHLIGHT_STATUS',
        data: {
          status: 'DISPLAY_HIGHLIGHT_DIALOG',
        },
      })

    if (remoteMinorVersion !== localMinorVersion)
      return iframe?.contentWindow?.postMessage({
        type: 'PUSH_HIGHLIGHT_STATUS',
        data: {
          status: 'DISPLAY_HIGHLIGHT_NOTIFICATION',
        },
      })

    return {
      type: 'PUSH_HIGHLIGHT_STATUS',
      data: {
        status: 'NO_HIGHLIGHT',
      },
    }
  }
}

export default checkHighlightStatus
