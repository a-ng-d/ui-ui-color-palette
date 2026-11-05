import globalConfig from '../../global.config'

const addHours = (date: Date, hours: number) => {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

export const addMonths = (date: Date, months: number) => {
  const result = new Date(date.getTime())
  const day = result.getDate()
  result.setDate(1)
  result.setMonth(result.getMonth() + months)
  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0
  ).getDate()
  result.setDate(Math.min(day, lastDay))
  return result
}

const checkCredits = async () => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null

  const creditsCountStr = window.localStorage.getItem('credits_count')
  const renewDateStr = window.localStorage.getItem('credits_renew_date')
  const creditsVersion = window.localStorage.getItem('credits_version')

  const now = new Date()

  let creditsCount =
    creditsCountStr !== null ? parseFloat(creditsCountStr) : NaN
  let renewDate: Date | null =
    renewDateStr !== null && !Number.isNaN(parseInt(renewDateStr, 10))
      ? new Date(parseInt(renewDateStr, 10))
      : null

  const periodHours =
    globalConfig.plan.creditsRenewalPeriodHours ??
    globalConfig.plan.creditsRenewalPeriodDays * 24

  const getNextRenewal = (from: Date) =>
    globalConfig.plan.creditsRenewalPeriodMonths
      ? addMonths(from, globalConfig.plan.creditsRenewalPeriodMonths)
      : addHours(from, periodHours)

  if (renewDate === null) {
    const next = getNextRenewal(now)
    window.localStorage.setItem('credits_renew_date', next.getTime().toString())
    renewDate = next
  }

  if (renewDate && renewDate.getTime() <= now.getTime()) {
    window.localStorage.setItem(
      'credits_count',
      globalConfig.plan.creditsLimit.toString()
    )
    const next = getNextRenewal(now)
    window.localStorage.setItem('credits_renew_date', next.getTime().toString())
    creditsCount = globalConfig.plan.creditsLimit
  }

  if (Number.isNaN(creditsCount)) {
    window.localStorage.setItem(
      'credits_count',
      globalConfig.plan.creditsLimit.toString()
    )
    creditsCount = globalConfig.plan.creditsLimit
  }

  if (creditsVersion !== globalConfig.versions.creditsVersion) {
    window.localStorage.setItem(
      'credits_version',
      globalConfig.versions.creditsVersion
    )
    window.localStorage.setItem(
      'credits_count',
      globalConfig.plan.creditsLimit.toString()
    )
    const next = getNextRenewal(now)
    window.localStorage.setItem('credits_renew_date', next.getTime().toString())
    creditsCount = globalConfig.plan.creditsLimit
    renewDate = next
  }

  iframe?.contentWindow?.postMessage({
    type: 'CHECK_CREDITS',
    data: {
      creditsCount: creditsCount,
      creditsRenewalDate: renewDate?.getTime() ?? null,
    },
  })

  return creditsCount
}

export default checkCredits
