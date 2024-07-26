import config from '../controllers/clients/twilio.config.js'
import twilio from 'twilio'
import _var   from '../../global/_var.js'
import pool   from '../models/db.connect.js'

const client = twilio(config.accountSid, config.authToken, config.verifyServiceSid)

const service = {}
let message =

  service.sendVerificationCode = async (phoneNumber, verificationCode) => {
    //console.log(verificationCode)
    try {
      const message = await client.messages.create({
        body: `Tu código de verificación es: ${verificationCode}`,
        from: _var.FROM,
        to: phoneNumber
      })

      console.log(`Mensaje de verificación enviado a ${phoneNumber} con SID: ${message.sid}`)
    } catch (error) {
      console.error('Error al enviar el mensaje de verificación:', error)
    }
  }

const verifyServiceSid = _var.SERVICE_SID

service.verificarNumeroTelefono = async (numeroTelefono) => {
  let clientdb
  try {
    clientdb = await pool.connect()

    const result = await clientdb.query("SELECT * FROM dispositivo WHERE telefono = $1", [numeroTelefono])
    if (result.rows.length === 0) { throw new Error('El número no está registrado') }

    const verification = await client.verify.v2.services(verifyServiceSid)
      .verifications
      .create({ to: numeroTelefono, channel: 'sms' })
    console.log('Respuesta de Twilio:', verification)

    clientdb.release()

    return true
  } catch (error) {
    console.error('Error al verificar el número de teléfono:', error)
    if (clientdb) clientdb.release()
    return false
  }
}

service.saveVerification = async (userId, phoneNumber, verificationCode) => {
  try {
    const client = await pool.connect()

    const insertQuery = `
      INSERT INTO verificacion_code (userId, telefono, code)
      VALUES ($1, $2, $3)
      RETURNING id
    `
    const insertValues = [userId, phoneNumber, verificationCode]

    const { rows } = await client.query(insertQuery, insertValues)
    const verificationId = rows[0].id

    client.release()
    return verificationId
  } catch (err) {
    console.error('Error al guardar el código de verificación', err)
  }
}

service.compareVerificationCode = async (enteredCode) => {
  try {
    const client = await pool.connect()

    const selectQuery = `
      SELECT code
      FROM verificacion_code
      WHERE code = $1
    `
    const selectValues = [enteredCode]
    const { rows } = await client.query(selectQuery, selectValues)
    console.log(rows[0].code)

    if (rows.length === 0) { message = { msg: 'No se encontró ningún código de verificación coincidente.'} }

    const storedCode = rows[0].code

    client.release()

    const isMatch = enteredCode === storedCode
    if (isMatch) {
      message = {
        status: 200,
        data: 'Código correcto.'
      }
    } else {
      message = {
        status: 403,
        error: 'El código ingresado no coincide con el almacenado en la base de datos.'
      }
    }

    return message
  } catch (error) {
    console.error('Error al comparar el código de verificación:', error)
  }
}

service.saveVerificationCode = async (userId, telefono, verificationCode) => {
  try {
    const client = await pool.connect();
    const insertQuery = `
      INSERT INTO vericacion_code (userid, telefono, code)
      VALUES ($1, $2, $3)
      RETURNING id
    `
    const insertValues = [userId, telefono, verificationCode]
    const { rows } = await client.query(insertQuery, insertValues)
    const verificationId = rows[0].id
    client.release()
    return verificationId
  } catch (error) {
    console.error('Error al guardar el código de verificación en la base de datos:', error)
    throw error
  }
}

service.compareVerificationCodes = async (enteredCode) => {
  try {
    const client = await pool.connect()
    const selectQuery = `
      SELECT code
      FROM vericacion_code
      WHERE code = $1
      LIMIT 1
    `
    const selectValues = [enteredCode]
    const { rows } = await client.query(selectQuery, selectValues)
    const storedCode = rows[0].code
    client.release()
    return storedCode === enteredCode
  } catch (error) {
    console.error('Error al comparar el código de verificación:', error)
    throw error
  }
}

export default service