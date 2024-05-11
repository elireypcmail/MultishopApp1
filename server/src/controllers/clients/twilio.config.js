import _var from '../../../global/_var.js'
import pkg  from 'twilio'
const { Twilio } = pkg

const twilioConfig = {
  accountSid: _var.ACCOUNT_SID,
  authToken: _var.AUTH_TOKEN,
  verifyServiceSid: _var.SERVICE_SID
}

export default {
  twilio: new Twilio(twilioConfig.accountSid, twilioConfig.authToken, twilioConfig.verifyServiceSid)
}