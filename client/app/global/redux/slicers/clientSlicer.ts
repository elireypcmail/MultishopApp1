import { createSlice } from "@reduxjs/toolkit"
import { dataClient } from "@t/common"

const initialState: dataClient = {
  id: null,
  identificacion: '',
  nombre: '',
  telefono: '',
  instancia: '',
  est_financiero: '',
  suscripcion: '',
  dispositivos: []
}

const clientSlice = createSlice({ 
  name: 'client',
  initialState,
  reducers: { 
    seeDataClient: (state: any, action) => {
      return { 
        ...state, 
        ...action.payload,
      }
    }
  }
})

export const { seeDataClient } = clientSlice.actions
export default clientSlice.reducer 