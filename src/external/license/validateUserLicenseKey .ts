const validateUserLicenseKey = async (
  storeApiUrl: string,
  licenseKey: string,
  instanceId: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    fetch(
      `${storeApiUrl}/licenses/validate?license_key=${licenseKey}&instance_id=${instanceId}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
      .then((response) => {
        if (response.status === 200) return response.json()
        else throw new Error()
      })
      .then((data) => {
        if (data.valid) resolve(data.valid)
        if (data.error) reject()
      })
  })
}

export default validateUserLicenseKey
