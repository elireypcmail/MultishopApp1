import app  from './src/controllers/app.js'
import _var from './global/_var.js'

function __init__() {
  app().listen(_var.PORT, (err) => {
    if (err) throw err
    console.log(`Server running on ${_var.PORT}`)
  })
}

__init__()