import pool from '../../models/db.connect.js'

const graphController = {}

const fetchData = async (nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi) => {
  const tableName = `"${nombreCliente}"."${nombreTabla}"`
  const query = `
    SELECT fecha, ${kpi} AS valor
    FROM ${tableName}
    WHERE fecha BETWEEN $1 AND $2
  `

  const result = await pool.query(query, [fechaInicio, fechaFin])
  return result.rows
}

const calculateResults = (data, filtro, fechaInicio) => {
  let results = []
  const groupedData = {}
  const startDate = new Date(fechaInicio)
  const sixMonthsAgo = new Date(startDate)
  sixMonthsAgo.setMonth(startDate.getMonth() - 6) 

  let totalSum = 0
  let totalCount = 0
  let totalGeneral = 0 

  data.forEach(row => {
    let key
    const date = new Date(row.fecha)

    switch (filtro) {
      case 'dias':
        key = row.fecha.toISOString().split('T')[0] 
        break
      case 'semanas':
        let startOfWeek = new Date(date)
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()) 
        if (startOfWeek < startDate) {
          startOfWeek = startDate
        }
        key = startOfWeek.toISOString().split('T')[0] 
        break
      case 'meses':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
    }

    if (!groupedData[key]) {
      groupedData[key] = { total: 0, count: 0 }
    }

    groupedData[key].total += parseFloat(row.valor)
    groupedData[key].count += 1

    totalGeneral += parseFloat(row.valor)
  })

  for (const [periodo, values] of Object.entries(groupedData)) {
    const promedio = (values.total / values.count)
    totalSum += promedio
    totalCount += 1

    results.push({
      periodo,
      total_valor: values.total.toFixed(2),
      promedio_valor: promedio.toFixed(2),
    })
  }

  results.sort((a, b) => new Date(a.periodo) - new Date(b.periodo))

  if (filtro === 'meses') {
    results = results.filter(result => {
      const [year, month] = result.periodo.split('-')
      const resultDate = new Date(year, month - 1)
      return resultDate >= sixMonthsAgo
    })
  }

  const promedioTotal = totalSum / totalCount
  
  return { results, promedioTotal: promedioTotal.toFixed(2), totalGeneral: totalGeneral.toFixed(2) }
}

const determineFilterType = (fechaInicio, fechaFin) => {
  const startDate = new Date(fechaInicio)
  const endDate = new Date(fechaFin)
  const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24) 

  if (daysDiff <= 15) {
    return 'dias'
  } else if (daysDiff <= 45) {
    return 'semanas'
  } else {
    return 'meses'
  }
}

graphController.filterData = async (req, res) => {
  try {
    const { nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi } = req.body
    console.log(nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi);
    

    if (!nombreCliente || !nombreTabla || !fechaInicio || !fechaFin || !kpi) {
      return res.status(400).json({ 'error': 'Faltan parámetros requeridos' })
    }

    const filtro = determineFilterType(fechaInicio, fechaFin)

    let adjustedFechaFin = fechaFin
    if (filtro === 'meses') {
      const endDate = new Date(fechaFin)
      const startDate = new Date(fechaInicio)
      const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth()
      if (monthsDiff > 6) {
        adjustedFechaFin = new Date(startDate.setMonth(startDate.getMonth() + 6)).toISOString().split('T')[0]
      }
    }

    const data = await fetchData(nombreCliente, nombreTabla, fechaInicio, adjustedFechaFin, kpi)
    
    if (data.length === 0) {
      return res.status(404).json({ 'error': 'No se encontraron datos para el rango de fechas proporcionado' })
    }

    const results = calculateResults(data, filtro, fechaInicio)
    console.log(results)
    
    return res.json(results)
  } catch (error) {
    console.error('Error al filtrar datos:', error)
    return res.status(500).json({ 'error': 'Error al filtrar datos' })
  }
}

export default graphController