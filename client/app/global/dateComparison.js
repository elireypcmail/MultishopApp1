export function getDaysDifference(apiDateString) {
  const apiDate = new Date(apiDateString)
  const currentDate = new Date()

  if (currentDate >= apiDate) {
    const differenceInMilliseconds = currentDate - apiDate
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24)
    return differenceInDays
  }
  else if (apiDate >= currentDate) return true
  else return false
}

export function parseDateFromDDMMYYYY(dateString) {
  if (!dateString || !/\d{2}\/\d{2}\/\d{4}/.test(dateString)) {
    console.error('Invalid date string:', dateString)
    return null
  }

  let tmp = dateString.split('/')
  const day = parseInt(tmp[0]), month = parseInt(tmp[1]), year = parseInt(tmp[2])

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    console.error('Invalid date values:', { day, month, year })
    return null
  }

  return new Date(year, month - 1, day)
}