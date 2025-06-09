const checkUserLicense = async () => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null
  const licenseKey = window.localStorage.getItem('user_license_key')
  const instanceId = window.localStorage.getItem('user_license_instance_id')

  if (licenseKey !== null && instanceId !== null)
    return iframe?.contentWindow?.postMessage(
      {
        type: 'CHECK_USER_LICENSE',
        data: {
          licenseKey: licenseKey,
          instanceId: instanceId,
        },
      },
      '*'
    )
  return false
}

export default checkUserLicense
