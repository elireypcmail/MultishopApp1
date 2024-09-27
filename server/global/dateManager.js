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

  const [day, month, year] = dateString.split('/').map(Number)

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    console.error('Invalid date values:', { day, month, year })
    return null
  }

  return new Date(year, month - 1, day)
}

export function setOneMoreMonth(day, date, y) {
  date.setMonth(date.getMonth() + y)

  if (day > new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate())
    date.setDate(0)

  const newDay = String(date.getDate()).padStart(2, '0')
  const newMonth = String(date.getMonth()).padStart(2, '0')
  const newYear = date.getFullYear()

  return `${newYear}-${newMonth}-${newDay}`
}

export function addMonthToDate(dateString) {
  let date = parseDateFromDDMMYYYY(dateString)
  let days = getDaysDifference(date)

  if (date != null) {
    if (days >= 0 && days <= 5) {
      date.setMonth(date.getMonth() + 1)
      let day = dateString.split('/')[0]
      let finalDate = setOneMoreMonth(day, date, 1)
      return finalDate
    } else {
      let date = new Date()
      console.log(date.getMonth())
      let day  = date.getDay()
      let finalDate = setOneMoreMonth(day, date, 2)
      return finalDate
    }
  } else return null
}