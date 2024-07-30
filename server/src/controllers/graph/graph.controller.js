import pool from '../../models/db.connect.js'

const graphController = {}

// Función para obtener todos los datos
const fetchData = async (nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi) => {
  const tableName = `"${nombreCliente}"."${nombreTabla}"`
  const query = `
    SELECT fecha, ${kpi} AS valor
    FROM ${tableName}
    WHERE fecha BETWEEN $1 AND $2
  `
  console.log(`Executing query: ${query} with dates ${fechaInicio} to ${fechaFin}`)
  const result = await pool.query(query, [fechaInicio, fechaFin])
  console.log('Fetched data:', result.rows)
  return result.rows
}

// Función para calcular los resultados
const calculateResults = (data, filtro, fechaInicio) => {
  let results = []
  const groupedData = {}
  const startDate = new Date(fechaInicio)

  data.forEach(row => {
    let key
    const date = new Date(row.fecha)

    switch (filtro) {
      case 'dias':
        key = row.fecha // YYYY-MM-DD
        break;
      case 'semanas':
        // Agrupar por semanas si el rango es de un mes o menos
        let startOfWeek = new Date(date)
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
        // Asegurarse de que startOfWeek no sea anterior a fechaInicio
        if (startOfWeek < startDate) {
          startOfWeek = startDate
        }
        key = startOfWeek.toISOString().split('T')[0] // YYYY-MM-DD
        break;
      case 'meses':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` // YYYY-MM
        break;
    }

    console.log('key:' + key);
    console.log('group' + groupedData);

    if (!groupedData[key]) {
      groupedData[key] = { total: 0, count: 0 }
    }

    groupedData[key].total += parseFloat(row.valor)
    groupedData[key].count += 1
  })

  for (const [periodo, values] of Object.entries(groupedData)) {
    results.push({
      periodo,
      total_valor: values.total.toFixed(2),
      promedio_valor: (values.total / values.count).toFixed(2),
    })
  }

  results.sort((a, b) => new Date(a.periodo) - new Date(b.periodo))

  if (filtro === 'meses') {
    const currentDate = new Date()
    results = results.filter(result => {
      const resultDate = new Date(result.periodo + '-01')
      return (currentDate - resultDate) <= 6 * 30 * 24 * 60 * 60 * 1000
    })
  }

  console.log('Final calculated results:', results)
  return results
}

// Función para determinar el tipo de filtro basado en el rango de fechas
const determineFilterType = (fechaInicio, fechaFin) => {
  const startDate = new Date(fechaInicio)
  const endDate = new Date(fechaFin)
  const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24) // Diferencia en días

  if (daysDiff <= 15) {
    return 'dias'
  } else if (daysDiff <= 45) {
    return 'semanas'
  } else {
    return 'meses'
  }
}

// Función principal del controlador
graphController.filterData = async (req, res) => {
  try {
    const { nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi } = req.body

    if (!nombreCliente || !nombreTabla || !fechaInicio || !fechaFin || !kpi) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' })
    }

    const filtro = determineFilterType(fechaInicio, fechaFin)

    // Limitar el rango de fechas a 6 meses para el filtro de meses
    let adjustedFechaFin = fechaFin
    if (filtro === 'meses') {
      const endDate = new Date(fechaFin)
      const startDate = new Date(fechaInicio)
      const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth()
      if (monthsDiff > 6) {
        adjustedFechaFin = new Date(startDate.setMonth(startDate.getMonth() + 6)).toISOString().split('T')[0]
      }
    }

    console.log(`Fetching data for ${nombreCliente}, ${nombreTabla} from ${fechaInicio} to ${adjustedFechaFin}`)
    const data = await fetchData(nombreCliente, nombreTabla, fechaInicio, adjustedFechaFin, kpi)
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'No se encontraron datos para el rango de fechas proporcionado' })
    }

    const results = calculateResults(data, filtro, fechaInicio)
    return res.json(results)
  } catch (error) {
    console.error('Error al filtrar datos:', error)
    return res.status(500).json({ error: 'Error al filtrar datos' })
  }
}

export default graphController