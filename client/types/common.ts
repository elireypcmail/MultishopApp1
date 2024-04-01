export interface dataClient {
  id: null,
  identificacion: string,
  nombre: string,
  telefono: string,
  instancia: string,
  est_financiero: string,
  suscripcion: string,
  dispositivos: Array<{ telefono: string; mac: string; rol: string; clave: string }>
}