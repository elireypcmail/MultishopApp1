import pool from '../../models/db.connect.js'

const graphController = {}

const fetchData = async (nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi) => {
  console.log(kpi)

  const tableName = `"${nombreCliente}"."${nombreTabla}"`
  let query 
  
  const determineDate = determineFilterType(fechaInicio, fechaFin)
  // console.log(determineDate)

  if(kpi == "ticketDeVenta"){
    if(determineDate == "semanas" || determineDate == "meses"){
      query = `SELECT fecha, totalventa AS valor1 , cantidadfac AS valor2 FROM ${tableName} WHERE fecha BETWEEN $1 AND $2`
    }else{
      query = `
        SELECT fecha,
        (totalventa / cantidadfac) AS valor
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
      `
    }
  }else if(kpi == "unidadesVendidas"){
    if(determineDate == "semanas" || determineDate == "meses"){
      query = `SELECT fecha, cantidadund AS valor1 , cantidadfac AS valor2 FROM ${tableName} WHERE fecha BETWEEN $1 AND $2`
    }else{
      query = `
        SELECT fecha,
          (CAST(cantidadund AS DECIMAL) / cantidadFac) AS valor
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
      `
    }
  }else if(kpi == "valorDeLaUnidadPromedio"){
    if(determineDate == "semanas" || determineDate == "meses"){
      query = `SELECT fecha, totalventa AS valor1 , cantidadund AS valor2 FROM ${tableName} WHERE fecha BETWEEN $1 AND $2`
    }else{
      query = `
        SELECT fecha,
        (totalventa / cantidadund) AS valor
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
      `
    }
  }else if(kpi == "margenDeUtilidad"){
    if(determineDate == "semanas" || determineDate == "meses"){
      query = `SELECT fecha, (totalut * 100) AS valor1 , valor_tp AS valor2 FROM ${tableName} WHERE fecha BETWEEN $1 AND $2`
    }else{
      query = `
        SELECT fecha,
        ((totalut * 100) / valor_tp) AS valor
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
      `
    }
  }else{
    query = `
      SELECT fecha, ${kpi} AS valor
      FROM ${tableName}
      WHERE fecha BETWEEN $1 AND $2
    `
  }

  console.log(query)

  const result = await pool.query(query, [fechaInicio, fechaFin])

  console.log(result.rows)

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

    // Determinar la clave según el filtro
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

    // Inicializar el grupo si no existe
    if (!groupedData[key]) {
      groupedData[key] = { total: 0, count: 0, sumValor1: 0, sumValor2: 0 }
    }

    // Actualizar los valores del grupo
    groupedData[key].total += parseFloat(row.valor || 0)
    groupedData[key].count += 1

    if (row.valor1 && row.valor2) {
      groupedData[key].sumValor1 += parseFloat(row.valor1 || 0)
      groupedData[key].sumValor2 += parseFloat(row.valor2 || 0)
    }

    // Calcular totalGeneral considerando la nueva lógica
    if (row.valor) {
      totalGeneral += parseFloat(row.valor)
    } else if (row.valor1 && row.valor2) {
      totalGeneral += parseFloat(row.valor1) / parseFloat(row.valor2)
    }
  })

  // Calcular resultados agrupados
  for (const [periodo, values] of Object.entries(groupedData)) {
    let promedio

    if (values.sumValor2 > 0 && values.sumValor1 > 0) {
      values.total = parseFloat(values.sumValor1 / values.sumValor2) 
      promedio = parseFloat(values.sumValor1 / values.sumValor2) / values.count
    } else {
      promedio = values.total / values.count
    }

    totalSum += promedio
    totalCount += 1

    results.push({
      periodo,
      total_valor: values.total.toFixed(2),
      promedio_valor: promedio.toFixed(2),
    })
  }

  // Ordenar y filtrar resultados
  results.sort((a, b) => new Date(a.periodo) - new Date(b.periodo))

  if (filtro === 'meses') {
    results = results.filter(result => {
      const [year, month] = result.periodo.split('-')
      const resultDate = new Date(year, month - 1)
      return resultDate >= sixMonthsAgo
    })
  }

  // Calcular promedios generales
  const promedioTotal = totalSum / totalCount

  return {
    results,
    promedioTotal: promedioTotal.toFixed(2),
    totalGeneral: totalGeneral.toFixed(2),
  }
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

    let results

    // if (kpi == "ticketDeVenta" || kpi == "unidadesVendidas" || kpi == "valorDeLaUnidadPromedio" || kpi == "margenDeUtilidad") {
    //   results = calculateResults2(data, filtro, fechaInicio)
    // }

    results = calculateResults(data, filtro, fechaInicio)
    console.log(results)
    
    return res.json(results)
  } catch (error) {
    console.error('Error al filtrar datos:', error)
    return res.status(500).json({ 'error': 'Error al filtrar datos' })
  }
}

const getTopKPIs = async (nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi) => {
  const tableName = `"${nombreCliente}"."${nombreTabla}"`
  const filtro = determineFilterType(fechaInicio, fechaFin)

  let query = ''
  let groupByClause = ''
  let limitClause = ''

  switch (filtro) {
    case 'dias':
      groupByClause = 'fecha'
      limitClause = 'LIMIT 10'
      break
    case 'semanas':
      groupByClause = "DATE_TRUNC('week', fecha)"
      limitClause = 'LIMIT 10'
      break
    case 'meses':
      groupByClause = "DATE_TRUNC('month', fecha)"
      limitClause = 'LIMIT 10'
      break
  }

  switch (kpi) {
    case 'DiaMasExitoso':
      query = `
        SELECT id, ${groupByClause} AS periodo, cantidadfac AS numero_operaciones, MAX(totalventa) AS total_ventas, cantidadund AS unidades_vendidas , clientesa, clientesf, clientesn
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
        GROUP BY id
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
          SELECT cod_op_bs, nom_op_bs, SUM(totalventa_bs_op) AS total_ventas
          FROM ${tableName}
          WHERE fecha BETWEEN $1 AND $2
          GROUP BY cod_op_bs, nom_op_bs
          ORDER BY total_ventas DESC
          ${limitClause}
        `
        break      
      

    case 'FabricantesConMasVentas':
      query = `
        SELECT 
          nom_fab_bs, 
          SUM(totalventa_fab_bs) AS total_ventas, 
          SUM(unidades_fab_bs) AS unidades_vendidas
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
        GROUP BY nom_fab_bs
        ORDER BY total_ventas DESC
      `
      break

    case 'ProductosTOP':
      query = `
        SELECT cod_art_bs, nom_art_bs, SUM(totalventa_bs_art) AS total_ventas
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
        GROUP BY cod_art_bs, nom_art_bs
        ORDER BY total_ventas DESC
      `
      break  

    case 'Inventario':
      query = `
        SELECT id, ${groupByClause} AS periodo, cantidad_und_inv , total_usdca_inv, total_usdcp_inv, total_bsca_inv, total_bscp_inv
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
        GROUP BY id, periodo, cantidad_und_inv , total_usdca_inv, total_usdcp_inv, total_bsca_inv, total_bscp_inv
        ORDER BY periodo DESC
      `
      break

    default:
      return { error: 'KPI no reconocido' }
  }

  const result = await pool.query(query, [fechaInicio, fechaFin])
  const limite = obtenerLimiteSegunFiltro(fechaInicio, fechaFin)
  const topValoresVentas = obtenerTopValoresVentas(result.rows, limite, kpi)
  const dateKPIs = await obtenerFechaKPI(topValoresVentas, tableName)

  console.log(result.rows)

  topValoresVentas.forEach((item, index) => {
    delete item.periodo;
    const localDate = new Date(dateKPIs[index].fecha);  // Convertir la fecha UTC a local
    item.fecha = localDate.toISOString();  // Formatear la fecha al formato ISO 8601
  })
  

  // Ordenar por fecha descendente en caso de ser necesario
  topValoresVentas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  // console.log(`Las filas con los ${limite} valores más altos de total_ventas son:`, topValoresVentas)
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
    return Math.max(Math.min(mesesDiff, 10), 10)
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

const obtenerTopValoresVentas = (resultados, limite, kpi) => {
  if (!resultados || resultados.length === 0) return []

  const filasConValores = resultados.map(row => ({
    total_ventas: parseFloat(row.total_ventas), 
    ...row 
  }))

  // console.log('Filas:', filasConValores)

  const filasOrdenadas = filasConValores.sort((a, b) => b.total_ventas - a.total_ventas)

  return (kpi === 'Inventario' || kpi === 'ProductosTOP') ? filasOrdenadas : filasOrdenadas.slice(0, limite);
}


graphController.getCustomKPI = async (req, res) => {
  try {
    const { nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi } = req.body
    console.log(nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi)

    const customKPIs = ['DiaMasExitoso', 'VentaMasExitosa', 'CajerosConMasVentas', 'FabricantesConMasVentas', 'ProductosTOP', 'Inventario']
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