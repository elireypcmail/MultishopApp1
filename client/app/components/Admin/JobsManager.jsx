'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import { sileo } from 'sileo'
import { getJobs, getJobById } from '@api/Get'
import Cookies from 'js-cookie'

const notify = { success: (msg) => sileo.success({ title: msg }), error: (msg) => sileo.error({ title: msg }) }

function formatDate(val) {
  if (!val) return '—'
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return val
    const day = d.getDate()
    const month = d.getMonth() + 1
    const year = String(d.getFullYear()).slice(-2)
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year}, ${h}:${m}`
  } catch {
    return val
  }
}

/** Diferencia entre created_at y updated_at en texto legible */
function timeDifference(createdAt, updatedAt) {
  if (!createdAt || !updatedAt) return null
  try {
    const start = new Date(createdAt).getTime()
    const end = new Date(updatedAt).getTime()
    if (isNaN(start) || isNaN(end) || end < start) return null
    const diffMs = end - start
    const sec = Math.floor(diffMs / 1000) % 60
    const min = Math.floor(diffMs / 60000) % 60
    const h = Math.floor(diffMs / 3600000)
    const parts = []
    if (h > 0) parts.push(`${h} h`)
    if (min > 0) parts.push(`${min} min`)
    if (sec > 0 || parts.length === 0) parts.push(`${sec} s`)
    return parts.join(' ')
  } catch {
    return null
  }
}

function statusLabel(status) {
  const s = (status || '').toLowerCase()
  if (s === 'completed') return 'Completado'
  if (s === 'failed') return 'Fallido'
  if (s === 'processing') return 'Procesando'
  if (s === 'pending') return 'Pendiente'
  return status || '—'
}

function statusPillClasses(status) {
  const s = (status || '').toLowerCase()
  const base = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium'
  if (s === 'completed') return `${base} bg-emerald-100 text-emerald-800`
  if (s === 'failed') return `${base} bg-red-100 text-red-800`
  if (s === 'processing') return `${base} bg-blue-100 text-blue-800`
  return `${base} bg-gray-100 text-gray-700`
}

function statusStyle(status) {
  const s = (status || '').toLowerCase()
  if (s === 'completed') return { color: '#0a0', fontWeight: 600 }
  if (s === 'failed') return { color: '#c00', fontWeight: 600 }
  if (s === 'processing') return { color: '#08c', fontWeight: 600 }
  return {}
}

function getResultStats(job) {
  const result = job?.result
  if (!result || typeof result !== 'object') return { inserted: null, updated: null }
  return {
    inserted: result.inserted ?? result.insertados ?? result.insertedCount ?? null,
    updated: result.updated ?? result.actualizados ?? result.updatedCount ?? null,
  }
}

/** Texto para mostrar qué API key (o Admin) lanzó el job */
function getApiKeyLabel(job) {
  const apiKey = job?.api_key
  if (!apiKey || (typeof apiKey === 'object' && !apiKey.id && !apiKey.name)) return 'Admin'
  const name = apiKey.name || 'API key'
  const id = apiKey.id != null ? `#${apiKey.id}` : ''
  return id ? `${name} (${id})` : name
}

/** Si el job fue lanzado por API key (muestra badge distinto a Admin) */
function isApiKeyJob(job) {
  const apiKey = job?.api_key
  return apiKey && (apiKey.id != null || apiKey.name != null)
}


function getSocketUrl() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return "";
  try {
    return new URL(base).origin;
  } catch {
    return base;
  }
}

const JOBS_PER_PAGE = 10
const FILTER_DEBOUNCE_MS = 400

/** Convierte fecha YYYY-MM-DD a ISO inicio del día (00:00:00.000) */
function dateToISOFrom(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  return isNaN(d.getTime()) ? null : d.toISOString()
}

/** Convierte fecha YYYY-MM-DD a ISO fin del día (23:59:59.999) */
function dateToISOTo(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T23:59:59.999')
  return isNaN(d.getTime()) ? null : d.toISOString()
}

export default function JobsManager() {
  const router = useRouter()
  const schema = typeof router.query.schema === 'string' ? router.query.schema : ''
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailJob, setDetailJob] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [liveBadge, setLiveBadge] = useState(false)
  const [page, setPage] = useState(1)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: JOBS_PER_PAGE, total: 0, totalPages: 0 })
  const debounceRef = useRef(null)

  const fetchJobs = useCallback(async (pageNum = page, from = dateFrom, to = dateTo) => {
    if (!schema) return
    setLoading(true)
    try {
      const params = { page: pageNum, limit: JOBS_PER_PAGE }
      const isoFrom = dateToISOFrom(from)
      const isoTo = dateToISOTo(to)
      if (isoFrom) params.date_from = isoFrom
      if (isoTo) params.date_to = isoTo
      const res = await getJobs(schema, params)
      if (res?.data?.jobs) setJobs(Array.isArray(res.data.jobs) ? res.data.jobs : [])
      else if (res?.data?.data) setJobs(Array.isArray(res.data.data) ? res.data.data : [])
      else setJobs([])
      if (res?.data?.pagination) setPagination(res.data.pagination)
      else setPagination((prev) => ({ ...prev, page: pageNum, limit: JOBS_PER_PAGE, total: res?.data?.jobs?.length ?? 0, totalPages: 1 }))
    } catch (e) {
      notify.error('Error al cargar jobs')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [schema, page, dateFrom, dateTo])

  useEffect(() => {
    fetchJobs()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo recargar al cambiar schema
  }, [schema])

  // Debounce: al cambiar fecha, ejecutar filtro tras FILTER_DEBOUNCE_MS (solo si hay al menos una fecha para no duplicar carga inicial)
  useEffect(() => {
    if (!schema) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const hasFilter = !!dateFrom || !!dateTo
    if (!hasFilter) return
    debounceRef.current = setTimeout(() => {
      setPage(1)
      fetchJobs(1, dateFrom, dateTo)
      debounceRef.current = null
    }, FILTER_DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo reaccionar a dateFrom/dateTo
  }, [dateFrom, dateTo])

  const handleClearFilters = () => {
    setDateFrom('')
    setDateTo('')
    setPage(1)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    fetchJobs(1, '', '')
  }

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    setPage(newPage)
    fetchJobs(newPage, dateFrom, dateTo)
  }

  // Socket.IO: conectar tras un pequeño retraso para evitar desconexión durante carga/hidratación
  const schemaRef = useRef(schema)
  const detailRef = useRef({ detailOpen, detailJob })
  const mountedRef = useRef(true)
  schemaRef.current = schema
  detailRef.current = { detailOpen, detailJob }

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !schema) return

    let socket
    let delayId

    const connect = () => {
      try {
        const { io } = require('socket.io-client')
        const token = Cookies.get('Token')
        const url = getSocketUrl()

        socket = io(url, {
          path: '/socket.io',
          auth: { token },
          transports: ["websocket", "polling"],
        })
        socket.on('connect', () => {
          if (mountedRef.current) setLiveBadge(true)
        })
        socket.on('disconnect', () => {
          if (mountedRef.current) setLiveBadge(false)
        })
        socket.on('job-update', (payload) => {
          if (payload?.schema !== schemaRef.current) return
          if (!mountedRef.current) return
          setJobs((prev) => {
            const list = [...prev]
            const idx = list.findIndex((j) => String(j.jobId || j.id) === String(payload.jobId))
            const row = { ...(list[idx] || {}), ...payload }
            if (idx >= 0) list[idx] = row
            else list.unshift(row)
            return list
          })
          const { detailOpen: open, detailJob: job } = detailRef.current
          if (open && job && String(job.jobId || job.id) === String(payload.jobId)) {
            setDetailJob((prev) => (prev ? { ...prev, ...payload } : null))
          }
        })
      } catch (err) {
        console.warn('Socket.IO no disponible:', err)
      }
    }

    // Retrasar conexión para no conectar durante hidratación/carga inicial
    delayId = setTimeout(connect, 300)

    return () => {
      clearTimeout(delayId)
      if (socket) {
        socket.removeAllListeners()
        socket.disconnect()
      }
    }
  }, [schema])

  const openDetail = async (job) => {
    try {
      const res = await getJobById(job.jobId || job.id, schema)
      const data = res?.data?.data || res?.data
      setDetailJob(data || job)
      setDetailOpen(true)
    } catch {
      setDetailJob(job)
      setDetailOpen(true)
    }
  }

  const modalOverlay = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]'
  const modalContent = 'bg-white rounded-xl shadow-xl p-6 max-w-[90vw] max-h-[90vh] overflow-auto mx-4'

  if (!schema) {
    return (
      <div className="jobs-page flex flex-col flex-1 min-h-0 m-[30px] rounded-2xl bg-white p-6 overflow-auto box-border">
        <p className="text-gray-500 mb-4">Falta el parámetro schema (identificación). Vuelve al perfil del cliente.</p>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg border border-gray-300 w-fit"
          onClick={() => router.push(`/profile/${router.query.userId}`)}
        >
          ← Atrás
        </button>
      </div>
    )
  }

  return (
    <div className="jobs-page flex flex-col flex-1 min-h-0 m-[30px] rounded-2xl bg-white p-6 overflow-auto box-border">
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg border border-gray-300"
          onClick={() => router.push(`/profile/${router.query.userId}`)}
        >
          ← Atrás
        </button>
        {liveBadge && <span className="text-emerald-600 font-medium"> ● En vivo</span>}
      </div>

      <header className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-xl flex-shrink-0">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 m-0 mb-1">Estado de importaciones</h1>
          <p className="text-sm text-gray-500 m-0 leading-snug">
            Listado de jobs de importación de productos. Las actualizaciones se reciben en tiempo real por WebSocket.
          </p>
        </div>
      </header>

      {/* Filtros por fecha (solo fecha, con debounce) y paginación */}
      <div className="flex flex-col gap-4 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Desde (fecha)</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Hasta (fecha)</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            type="button"
            className="ml-auto px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
            onClick={handleClearFilters}
          >
            Limpiar fechas
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 my-6">Cargando...</p>
      ) : jobs.length === 0 ? (
        <p className="text-gray-500 my-6">No hay jobs para este esquema.</p>
      ) : (
        <ul className="list-none p-0 m-0 flex flex-col gap-4 w-full flex-1 min-h-0 overflow-y-auto">
          {jobs.map((job) => {
            const diff = timeDifference(job.created_at, job.updated_at)
            const stats = getResultStats(job)
            const fileName = job.file_path ? String(job.file_path).split(/[/\\]/).pop() : '—'
            return (
              <li
                key={job.jobId || job.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm w-full"
              >
                <div className="flex flex-wrap items-center gap-2 gap-y-2 mb-2">
                  <span className="font-bold text-gray-900">#{job.jobId ?? job.id ?? '—'}</span>
                  <span className={statusPillClasses(job.status)}>
                    {(job.status || '').toLowerCase() === 'completed' ? '✓ ' : ''}{statusLabel(job.status)}
                  </span>
                  <span className="text-sm text-gray-600">{fileName}</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                      isApiKeyJob(job)
                        ? 'bg-violet-100 text-violet-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                    title={isApiKeyJob(job) ? 'Lanzado por API key' : 'Lanzado por admin'}
                  >
                    {isApiKeyJob(job) ? (
                      <>
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                        </svg>
                        {getApiKeyLabel(job)}
                      </>
                    ) : (
                      <>Admin</>
                    )}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-2">
                  <span>Modo: {job.mode ?? '—'}</span>
                  <span>Lote: {job.batch_size ?? '—'}</span>
                  <span>Creado: {formatDate(job.created_at)}</span>
                  {diff != null && (job.status || '').toLowerCase() === 'completed' && (
                    <span className="font-semibold text-gray-900">Duración: {diff}</span>
                  )}
                </div>
                {(stats.inserted != null || stats.updated != null) && (
                  <div className="flex flex-wrap gap-3 text-sm mb-3">
                    {stats.inserted != null && <span className="text-emerald-600 font-medium">Insertados: {stats.inserted}</span>}
                    {stats.updated != null && <span className="text-blue-600 font-medium">Actualizados: {stats.updated}</span>}
                  </div>
                )}
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => openDetail(job)}
                >
                  Ver detalle
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* Paginación al final de la lista */}
      {!loading && pagination.totalPages > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 mt-6 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">
            Página {pagination.page} de {pagination.totalPages} · {pagination.total} resultado{pagination.total !== 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => goToPage(pagination.page - 1)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => goToPage(pagination.page + 1)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {detailOpen && detailJob && (
        <div className={modalOverlay} onClick={() => setDetailOpen(false)}>
          <div className={modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle del job</h3>
            <div className="space-y-2 text-sm mb-4">
              <div><strong>Job ID:</strong> {detailJob.jobId ?? detailJob.id}</div>
              <div><strong>Schema:</strong> {detailJob.schema}</div>
              <div>
                <strong>Lanzado por:</strong>{' '}
                {detailJob.api_key && (detailJob.api_key.id != null || detailJob.api_key.name != null) ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-violet-100 text-violet-800">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                    {getApiKeyLabel(detailJob)}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">Admin</span>
                )}
              </div>
              <div><strong>Estado:</strong> <span style={statusStyle(detailJob.status)}>{detailJob.status}</span></div>
              <div><strong>Archivo:</strong> {detailJob.file_path || '—'}</div>
              <div><strong>Modo:</strong> {detailJob.mode ?? '—'}</div>
              <div><strong>Lote:</strong> {detailJob.batch_size ?? '—'}</div>
              <div><strong>Creado:</strong> {formatDate(detailJob.created_at)}</div>
              <div><strong>Actualizado:</strong> {formatDate(detailJob.updated_at)}</div>
              {detailJob.created_at && detailJob.updated_at && timeDifference(detailJob.created_at, detailJob.updated_at) && (
                <div><strong>Duración:</strong> {timeDifference(detailJob.created_at, detailJob.updated_at)}</div>
              )}
              {detailJob.status === 'completed' && detailJob.result && (
                <div className="mt-2"><strong>Resultado:</strong> <pre className="mt-2 p-2.5 bg-gray-100 rounded-lg overflow-auto max-h-32 text-xs">{typeof detailJob.result === 'object' ? JSON.stringify(detailJob.result, null, 2) : String(detailJob.result)}</pre></div>
              )}
              {detailJob.status === 'failed' && detailJob.error_message && (
                <div className="mt-2"><strong>Error:</strong> <pre className="mt-2 p-2.5 bg-red-100 rounded-lg overflow-auto max-h-32 text-xs">{detailJob.error_message}</pre></div>
              )}
            </div>
            <button
              type="button"
              className="px-4 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg border border-gray-300"
              onClick={() => setDetailOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .jobs-page {
          box-sizing: border-box;
        }
        :global(.main.main--full) {
          display: flex;
          flex-direction: column;
          min-height: 0;
          flex: 1;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
