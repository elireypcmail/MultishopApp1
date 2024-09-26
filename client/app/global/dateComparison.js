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
  const [day, month, year] = dateString.split('/').map(Number)
  return new Date(year, month - 1, day)
}