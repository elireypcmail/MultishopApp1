import pool from '../../models/db.connect.js'

const graphController = {}

const fetchData = async (nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi) => {
  console.log("Buscar consulta")
  console.log(nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi)

  const tableName = `"${nombreCliente}"."${nombreTabla}"`
  let query 
  
  const determineDate = determineFilterType(fechaInicio, fechaFin)

  if(kpi == "ticketDeVenta"){
    if(determineDate == "semanas" || determineDate == "meses"){
      query = `SELECT fecha, totalventa AS valor1 , cantidadfac AS valor2, codemp, nomemp, nomempc FROM ${tableName} WHERE fecha BETWEEN $1 AND $2`
    }else{
      query = `
        SELECT fecha,
        (totalventa / cantidadfac) AS valor,
        codemp, nomemp, nomempc
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
      `
    }
  }else if(kpi == "unidadesVendidas"){
    if(determineDate == "semanas" || determineDate == "meses"){
      query = `SELECT fecha, cantidadund AS valor1 , cantidadfac AS valor2, codemp, nomemp, nomempc FROM ${tableName} WHERE fecha BETWEEN $1 AND $2`
    }else{
      query = `
        SELECT fecha,
          (CAST(cantidadund AS DECIMAL) / cantidadFac) AS valor,
          codemp, nomemp, nomempc
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
      `
    }
  }else if(kpi == "valorDeLaUnidadPromedio"){
    if(determineDate == "semanas" || determineDate == "meses"){
      query = `SELECT fecha, totalventa AS valor1 , cantidadund AS valor2, codemp, nomemp, nomempc FROM ${tableName} WHERE fecha BETWEEN $1 AND $2`
    }else{
      query = `
        SELECT fecha,
        (totalventa / cantidadund) AS valor,
        codemp, nomemp, nomempc
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
      `
    }
  }else if(kpi == "margenDeUtilidad"){
    if(determineDate == "semanas" || determineDate == "meses"){
      query = `SELECT fecha, (totalut * 100) AS valor1 , valor_tp AS valor2, codemp, nomemp , nomempc FROM ${tableName} WHERE fecha BETWEEN $1 AND $2`
    }else{
      query = `
        SELECT fecha,
        ((totalut * 100) / valor_tp) AS valor,
        codemp, nomemp, nomempc
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
      `
    }
  }else if(kpi == "ventasVScompras"){
    query = `SELECT fecha, totalventa AS valor1 , totalcompra AS valor2, codemp, nomemp , nomempc FROM ${tableName} WHERE fecha BETWEEN $1 AND $2`
  }else{
    query = `
      SELECT fecha, ${kpi} AS valor, codemp, nomemp, nomempc
      FROM ${tableName}
      WHERE fecha BETWEEN $1 AND $2
    `
  }
  const result = await pool.query(query, [fechaInicio, fechaFin])

  // console.log("resultados")
  // console.log(result.rows)

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
      nomemp: data[0].nomemp
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

  console.log(results)

  return {
    results,
    promedioTotal: promedioTotal.toFixed(2),
    totalGeneral: totalGeneral.toFixed(2),

  }
}

const calculateResults2 = (data, nombreCliente, nombreTabla) => {
  console.log("calculando resultados con 2 valores");

  if (data.length === 0) {
    return {
      results: [],
      promedioTotalVentas: 0.00,
      promedioTotalCompras: 0.00,
      totalGeneralVentas: 0.00,
      totalGeneralCompras: 0.00
    };
  }

  let empresas = {};

  data.forEach((row) => {
    if (!empresas[row.codemp]) {
      empresas[row.codemp] = {
        codemp: row.codemp,
        nomemp: row.nomemp,
        nomempc: row.nomempc,
        totalGeneralVentas: 0,
        totalGeneralCompras: 0,
        fechas: []
      };
    }
    empresas[row.codemp].totalGeneralVentas += parseFloat(row.valor1 || 0);
    empresas[row.codemp].totalGeneralCompras += parseFloat(row.valor2 || 0);
    empresas[row.codemp].fechas.push(new Date(row.fecha));
  });

  let results = Object.values(empresas)
  .sort((a, b) => b.totalGeneralVentas - a.totalGeneralVentas)
  .map(emp => {
    const fechaMin = new Date(Math.min(...emp.fechas));
    const fechaMax = new Date(Math.max(...emp.fechas));
    const promedioTotalVentas = emp.totalGeneralVentas / emp.fechas.length;
    const promedioTotalCompras = emp.totalGeneralCompras / emp.fechas.length;

    return [
      // ventasVscompras = [
        {
          codemp: emp.codemp,
          nomemp: emp.nomemp,
          nomempc: emp.nomempc,
          periodo: `${fechaMin.toISOString().split("T")[0]}`,
          total_valor: emp.totalGeneralVentas.toFixed(2),
          promedio_valor: promedioTotalVentas.toFixed(2),
          label: 'Ventas',
          kpiType: 'ventasVScompras',
        },
        {
          codemp: emp.codemp,
          periodo: `${fechaMax.toISOString().split("T")[0]}`,
          total_valor: emp.totalGeneralCompras.toFixed(2),
          promedio_valor: promedioTotalCompras.toFixed(2),
          label: 'Compras',
          kpiType: 'ventasVScompras',
        }
      // ]
    ];
  }).flat();

  return { results };
}

const calculateResults3 = (data, filtro, fechaInicio, kpi) => {
  if (data.length === 0) {
    return {
      results: [],
      promedioTotal: "0.00",
      totalGeneral: "0.00",
    };
  }

  // console.log("Datos para corregir decimales");
  // console.log(data);

  let empresas = {};
  const startDate = new Date(fechaInicio);
  const sixMonthsAgo = new Date(startDate);
  sixMonthsAgo.setMonth(startDate.getMonth() - 6);

  let totalSum = 0, totalCount = 0, totalGeneral = 0;

  data.forEach(row => {
    let key;
    const date = new Date(row.fecha);

    // Determinar la clave según el filtro
    switch (filtro) {
      case 'dias':
        key = row.fecha.toISOString().split('T')[0];
        break;
      case 'semanas':
        let startOfWeek = new Date(date);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        if (startOfWeek < startDate) {
          startOfWeek = startDate;
        }
        key = startOfWeek.toISOString().split('T')[0];
        break;
      case 'meses':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }

    if (!empresas[row.codemp]) {
      empresas[row.codemp] = {
        codemp: row.codemp,
        nomemp: row.nomemp,
        nomempc: row.nomempc,
        totalGeneral: 0,
        fechas: [],
        groupedData: {}
      };
    }

    empresas[row.codemp].totalGeneral = parseFloat((empresas[row.codemp].totalGeneral + parseFloat(row.valor || row.valor1 || 0)).toFixed(2));
    empresas[row.codemp].fechas.push(date);

    if (!empresas[row.codemp].groupedData[key]) {
      empresas[row.codemp].groupedData[key] = { total: 0, count: 0, sumValor1: 0, sumValor2: 0 };
    }

    empresas[row.codemp].groupedData[key].total = parseFloat((empresas[row.codemp].groupedData[key].total + parseFloat(row.valor || 0)).toFixed(2));
    empresas[row.codemp].groupedData[key].count += 1;

    if (row.valor1 && row.valor2) {
      empresas[row.codemp].groupedData[key].sumValor1 = parseFloat((empresas[row.codemp].groupedData[key].sumValor1 + parseFloat(row.valor1 || 0)).toFixed(2));
      empresas[row.codemp].groupedData[key].sumValor2 = parseFloat((empresas[row.codemp].groupedData[key].sumValor2 + parseFloat(row.valor2 || 0)).toFixed(2));
    }

    if (row.valor) {
      totalGeneral = parseFloat((totalGeneral + parseFloat(row.valor)).toFixed(2));
    } else if (row.valor1 && row.valor2) {
      totalGeneral = parseFloat((totalGeneral + parseFloat((row.valor1 / row.valor2).toFixed(2))).toFixed(2));
    }
  });

  let results = Object.values(empresas).map(emp => {
    let totalValor = 0;
    let promedioValor = 0;
    let totalCountPerCompany = 0;
    let sumValor1 = 0, sumValor2 = 0;

    const fechaMin = new Date(Math.min(...emp.fechas));
    const fechaMax = new Date(Math.max(...emp.fechas));

    // Para cada empresa, agrupamos los datos por período y calculamos el promedio total
    Object.entries(emp.groupedData).forEach(([periodo, values]) => {
      let promedio = values.count > 0 ? parseFloat((values.total / values.count).toFixed(2)) : 0;

      if (values.sumValor2 > 0 && values.sumValor1 > 0) {
        values.total = parseFloat((values.sumValor1 / values.sumValor2).toFixed(2));
        promedio = parseFloat((values.total / values.count).toFixed(2));
      }

      totalValor = parseFloat((totalValor + values.total).toFixed(2));
      sumValor1 = parseFloat((sumValor1 + values.sumValor1).toFixed(2));
      sumValor2 = parseFloat((sumValor2 + values.sumValor2).toFixed(2));
      totalCountPerCompany += 1;
      promedioValor = parseFloat((promedioValor + promedio).toFixed(2));
    });

    // Calculamos los promedios y totales generales por empresa
    const totalPromedio = totalCountPerCompany > 0 ? parseFloat((promedioValor / totalCountPerCompany).toFixed(2)) : 0;

    return {
      codemp: emp.codemp,
      nomemp: emp.nomemp,
      nomempc: emp.nomempc,
      periodo: `${fechaMin.toISOString().split('T')[0]} - ${fechaMax.toISOString().split('T')[0]}`,
      total_valor: totalValor.toFixed(2),
      promedio_valor: totalPromedio.toFixed(2),
      kpiType: kpi,
      label: "Valor Total"
    };
  });

  results.sort((a, b) => a.nomemp.localeCompare(b.nomemp)); // Ordena por nombre de empresa

  // Filtramos por los últimos 6 meses si el filtro es "meses"
  if (filtro === 'meses') {
    results = results.filter(result => {
      const [year, month] = result.periodo.split('-')[0].split('-');
      const resultDate = new Date(year, month - 1);
      return resultDate >= sixMonthsAgo;
    });
  }

  const promedioTotal = totalCount > 0 ? parseFloat((totalSum / totalCount).toFixed(2)) : 0;

  
  return {
    results,
    promedioTotal: promedioTotal.toFixed(2),
    totalGeneral: totalGeneral.toFixed(2)
  };
}

const calculatePromKpis = (data, filtro, fechaInicio) => {
  try {
    const empresas = {};

    // Agrupar datos por empresa
    data.forEach(row => {
      if (!empresas[row.nomemp]) {
        empresas[row.nomemp] = [];
      }
      empresas[row.nomemp].push(row);
    });

    // Variables para el total general
    let totalGeneral = 0;

    // Calcular resultados por empresa
    const results = Object.entries(empresas).map(([empresa, datosEmpresa]) => {
      const resultados = calculateResults(datosEmpresa, filtro, fechaInicio);
      const formattedData = resultados.results || [];

      // Sumar total_valor dentro de results con precisión
      const totalSum = formattedData.reduce(
        (sum, item) => sum + Math.round(parseFloat(item.total_valor || 0) * 100) / 100, 
        0
      );

      totalGeneral += totalSum; // Acumulamos para el total general
      
      // Calcular el promedio total con corrección de decimales
      const promedioTotal = formattedData.length > 0 
        ? Math.round((totalSum / formattedData.length) * 100) / 100 
        : 0;

      console.log(`Empresa: ${empresa}`);
      console.log(`Total Sum: ${totalSum.toFixed(2)}`);
      console.log(`Cantidad de elementos: ${formattedData.length}`);
      console.log(`Promedio Total Calculado: ${promedioTotal.toFixed(2)}`);

      return {
        codemp: datosEmpresa[0].codemp,
        nomemp: empresa,
        nomempc: datosEmpresa[0].nomempc,
        periodo: `${fechaInicio} - ${filtro.fechaFin}`,
        total_valor: promedioTotal.toFixed(2),
        promedio_valor: promedioTotal.toFixed(2),
        kpiType: 'totalventa',
        label: 'Valor Total'
      };
    });

    // Calcular el promedio total general con corrección de decimales
    const promedioGeneral = results.length > 0 
      ? Math.round((totalGeneral / results.length) * 100) / 100 
      : 0;

    return {
      results,
      promedioTotal: promedioGeneral.toFixed(2),
      totalGeneral: totalGeneral.toFixed(2)
    };
  } catch (error) {
    console.log(error);
    return null;
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
    const { nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi, typeCompanies } = req.body
    console.log(nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi, typeCompanies)

    if (!nombreCliente || !nombreTabla || !fechaInicio || !fechaFin || !kpi || !typeCompanies) {
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

    if (kpi == "ventasVScompras") {
      results = calculateResults2(data, nombreCliente, nombreTabla, filtro, fechaInicio, kpi)
    }
    else if(typeCompanies == "Multiple"){
      if(kpi == "ticketDeVenta" || kpi == "margenDeUtilidad" || kpi == "unidadesVendidas" || kpi == "valorDeLaUnidadPromedio"){
        results = calculatePromKpis(data, filtro, fechaInicio, kpi)
      }else{
        results = calculateResults3(data, nombreCliente, nombreTabla, filtro, fechaInicio, kpi)
      }
    }
    else{
      results = calculateResults(data, filtro, fechaInicio)
    }

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
        SELECT DISTINCT ON (codemp) 
          id, 
          ${groupByClause} AS periodo, 
          cantidadfac AS numero_operaciones, 
          MAX(totalventa) AS total_ventas, 
          cantidadund AS unidades_vendidas, 
          clientesa, 
          clientesf, 
          clientesn, 
          codemp, 
          nomemp
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
        GROUP BY id
        ORDER BY codemp, total_ventas DESC
      `;
      console.log(query)
      break

    case 'VentaMasExitosa':
      query = `
        SELECT DISTINCT ON (codemp) 
          id, 
          ${groupByClause} AS periodo, 
          cod_clibs, 
          nom_clibs, 
          MAX(totalventa_bs) AS total_ventas,
          codemp, 
          nomemp
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
        GROUP BY id
        ORDER BY codemp, total_ventas DESC
      `;
      break

    case 'CajerosConMasVentas':
      query = `
        WITH RankedCajeros AS (
          SELECT
            codemp,
            nomemp,
            cod_op_bs,
            nom_op_bs,
            SUM(totalventa_bs_op) AS total_ventas,
            ROW_NUMBER() OVER (PARTITION BY codemp ORDER BY SUM(totalventa_bs_op) DESC) AS row_num
          FROM ${tableName}
          WHERE fecha BETWEEN $1 AND $2
          GROUP BY codemp, nomemp, cod_op_bs, nom_op_bs
        )
        SELECT codemp, nomemp, cod_op_bs, nom_op_bs, total_ventas
        FROM RankedCajeros
        WHERE row_num <= 10
        ORDER BY codemp, total_ventas DESC;
      `
      break
      

    case 'FabricantesConMasVentas':
      query = `
      WITH RankedFabricantes AS (
        SELECT
          codemp, 
          nomemp, 
          nom_fab_bs, 
          SUM(totalventa_fab_bs) AS total_ventas, 
          SUM(unidades_fab_bs) AS unidades_vendidas,
          ROW_NUMBER() OVER (PARTITION BY codemp ORDER BY SUM(totalventa_fab_bs) DESC) AS row_num
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
        GROUP BY codemp, nomemp, nom_fab_bs
      )
      SELECT codemp, nomemp, nom_fab_bs, total_ventas, unidades_vendidas
      FROM RankedFabricantes
      WHERE row_num <= 10
      ORDER BY codemp, total_ventas DESC;
      `
      break

    case 'ProductosTOP':
      query = `
      SELECT cod_art_bs, nom_art_bs, SUM(totalventa_bs_art) AS total_ventas, codemp, nomemp
      FROM ${tableName}
      WHERE fecha BETWEEN $1 AND $2
      GROUP BY cod_art_bs, nom_art_bs, codemp, nomemp
      ORDER BY nomemp, total_ventas DESC
    `

      break  

    case 'Inventario':
      query = `
        SELECT id, ${groupByClause} AS periodo, cantidad_und_inv , total_usdca_inv, total_usdcp_inv, total_bsca_inv, total_bscp_inv, codemp, nomemp
        FROM ${tableName}
        WHERE fecha BETWEEN $1 AND $2
        GROUP BY id, periodo, cantidad_und_inv , total_usdca_inv, total_usdcp_inv, total_bsca_inv, total_bscp_inv, codemp, nomemp
        ORDER BY periodo, nomemp DESC
      `
      break

      case 'flujoDeCaja':
        query = `
          SELECT DISTINCT ON (codemp)  
              codemp,
              nomemp,
              SUM(totusd) AS totusd, 
              SUM(totcop) AS totcop, 
              SUM(totbs) AS totbs
          FROM ${tableName}
          WHERE fecha BETWEEN $1 AND $2
          GROUP BY codemp, nomemp
          ORDER BY codemp
        `
        break

    default:
      return { error: 'KPI no reconocido' }
  }

  const result = await pool.query(query, [fechaInicio, fechaFin])
  const limite = obtenerLimiteSegunFiltro(fechaInicio, fechaFin, kpi)
  const topValoresVentas = obtenerTopValoresVentas(result.rows, limite, kpi)
  const dateKPIs = await obtenerFechaKPI(topValoresVentas, tableName)

  topValoresVentas.forEach((item, index) => {
    delete item.periodo;
    const localDate = new Date(dateKPIs[index].fecha);  // Convertir la fecha UTC a local
    item.fecha = localDate.toISOString();  // Formatear la fecha al formato ISO 8601
  })
  

  // Ordenar por fecha descendente en caso de ser necesario
  topValoresVentas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  return topValoresVentas
}

const obtenerLimiteSegunFiltro = (fechaInicio, fechaFin, kpi) => {
  const startDate = new Date(fechaInicio)
  const endDate = new Date(fechaFin)
  const diasDiff = (endDate - startDate) / (1000 * 60 * 60 * 24)
  let limite = diasDiff + 1

  if (kpi == "CajerosConMasVentas" || kpi == "FabricantesConMasVentas" || kpi == "ProductosTOP" || kpi == "Inventario" || kpi == "flujoDeCaja" || kpi == "DiaMasExitoso" || kpi == "VentaMasExitosa") {
    limite= 100
    return limite
  }

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
    // console.log('date: ' + fechaCorrecta)

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
    const { nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi, typeCompanies } = req.body

    console.log("Valores top")

    console.log(nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi, typeCompanies)

    const customKPIs = ['DiaMasExitoso', 'VentaMasExitosa', 'CajerosConMasVentas', 'FabricantesConMasVentas', 'ProductosTOP', 'Inventario', 'flujoDeCaja']
    if (!customKPIs.includes(kpi)) {
      return res.status(400).json({ error: 'KPI no reconocido para cálculo personalizado' })
    }

    let data = await getTopKPIs(nombreCliente, nombreTabla, fechaInicio, fechaFin, kpi)
    // console.log(data)

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