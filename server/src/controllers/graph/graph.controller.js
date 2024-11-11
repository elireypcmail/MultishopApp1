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
    console.log(nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi)
    

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

const getTopKPIs = async (nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi) => {
  const tableName = `"${nombreCliente}"."${nombreTabla}"`
  const filtro    = determineFilterType(fechaInicio, fechaFin)

  let query = ''
  let groupByClause = ''
  let limitClause = ''

  switch (filtro) {
    case 'dias':
      groupByClause = 'fecha'
      limitClause = 'LIMIT 5'
      break
    case 'semanas':
      groupByClause = "DATE_TRUNC('week', fecha)"
      break
    case 'meses':
      groupByClause = "DATE_TRUNC('month', fecha)"
      break
  }

  switch (kpi) {
    case 'DiaMasExitoso':
      query = `
        SELECT id, ${groupByClause} AS periodo, MAX(cantidadfac) AS numero_operaciones, MAX(totalventa) AS total_ventas, MAX(cantidadund) AS unidades_vendidas
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
        GROUP BY id, periodo
        ORDER BY total_ventas DESC
        LIMIT 1
      `
      break

    case 'VentaMasExitosa':
      query = `
        SELECT id, ${groupByClause} AS periodo, cod_clibs, nom_clibs, MAX(totalventa_bs) AS total_ventas
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
        GROUP BY id, periodo, cod_clibs, nom_clibs
        ORDER BY total_ventas DESC
        LIMIT 1
      `
      break

    case 'CajerosConMasVentas':
      query = `
        SELECT id, ${groupByClause} AS periodo, cod_op_bs, nom_op_bs, MAX(totalventa_bs_op) AS total_ventas
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
        GROUP BY id, periodo, cod_op_bs, nom_op_bs
        ORDER BY total_ventas DESC
        ${limitClause}
      `
      break

    case 'FabricantesConMasVentas':
      query = `
        SELECT id, ${groupByClause} AS periodo, cod_fab_bs, nom_fab_bs, MAX(totalventa_fab_bs) AS total_ventas
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
        GROUP BY id, periodo, cod_fab_bs, nom_fab_bs
        ORDER BY total_ventas DESC
        ${limitClause}
      `
      break

    case 'ProductosTOP':
      query = `
        SELECT id, ${groupByClause} AS periodo, cod_art_bs, nom_art_bs, MAX(totalventa_bs) AS total_ventas
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
        GROUP BY id, periodo, cod_art_bs, nom_art_bs
        ORDER BY total_ventas DESC
        ${limitClause}
      `
      break

    default:
      return { error: 'KPI no reconocido' }
  }

  const result           = await pool.query(query, [fechaInicio, fechaFin])
  const limite           = obtenerLimiteSegunFiltro(fechaInicio, fechaFin)
  const topValoresVentas = obtenerTopValoresVentas(result.rows, limite)
  const dateKPIs         = await obtenerFechaKPI(topValoresVentas, tableName)
  
  console.log(dateKPIs)

  topValoresVentas.forEach((item, index) => {
    delete item.periodo 
    item.fecha = dateKPIs[index].fecha
  })

  console.log(`Las filas con los ${limite} valores más altos de total_ventas son:`, topValoresVentas)
  console.log(topValoresVentas)
  
  return topValoresVentas
}

const obtenerLimiteSegunFiltro = (fechaInicio, fechaFin) => {
  const startDate = new Date(fechaInicio)
  const endDate = new Date(fechaFin)
  const diasDiff = (endDate - startDate) / (1000 * 60 * 60 * 24)
  const limite = diasDiff + 1
  console.log('Días totales de diferencia:', limite)
  console.log('Fecha de inicio:', startDate)
  console.log('Fecha de fin:', endDate)

  if (limite <= 15) {
    return limite
  } else if (limite <= 45) {
    const semanas = Math.ceil(limite / 7)
    console.log('Semanas de diferencia:', semanas)
    return semanas
  } else {
    const mesesDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
    return Math.min(mesesDiff, 6) 
  }
}

const obtenerFechaKPI = async (data, tableName) => {
  const kpiWithDates  = await Promise.all(data.map(async row => {
    const uniqueValue = row.id

    const query = `SELECT fecha FROM ${tableName} WHERE id = $1`
    const fechaResult   = await pool.query(query, [uniqueValue])
    const fechaCorrecta = fechaResult.rows[0]?.fecha || null
    console.log('date: ' + fechaCorrecta)

    return {
      ...row,
      fecha: fechaCorrecta
    }
  }))

  return kpiWithDates
}

const obtenerTopValoresVentas = (resultados, limite) => {
  if (!resultados || resultados.length === 0) return []
  
  const filasConValores = resultados.map(row => {
    console.log('esto es el row: ' + row)
    
    return {
      total_ventas: parseFloat(row.total_ventas), 
      ...row 
    }
  })

  console.log('Filas:', filasConValores)
  
  const filasOrdenadas = filasConValores.sort((a, b) => b.total_ventas - a.total_ventas)
  const topFilasVentas = filasOrdenadas.slice(0, limite)

  return topFilasVentas
}

graphController.getCustomKPI = async (req, res) => {
  try {
    const { nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi } = req.body

    const customKPIs = ['DiaMasExitoso', 'VentaMasExitosa', 'CajerosConMasVentas', 'FabricantesConMasVentas', 'ProductosTOP']
    if (!customKPIs.includes(kpi)) {
      return res.status(400).json({ error: 'KPI no reconocido para cálculo personalizado' })
    }

    const data = await getTopKPIs(nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi)
    if (data.length === 0) {
      return res.status(404).json({ error: 'No se encontraron datos para el rango de fechas proporcionado' })
    }

    return res.json(data)
  } catch (error) {
    console.error('Error al obtener KPI personalizado:', error)
    return res.status(500).json({ error: 'Error al obtener KPI personalizado' })
  }
}

export default graphController