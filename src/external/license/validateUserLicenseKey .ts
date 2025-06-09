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
      .then((response) => response.json())
      .then((data) => {
        if (data.valid) return resolve(data.valid)
        if (data.error) throw new Error(data.error)
      })
      .catch((error) => reject(error))
  })
}

export default validateUserLicenseKey
