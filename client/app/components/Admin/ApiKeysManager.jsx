'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { sileo } from 'sileo'
import { getApiKeys } from '@api/Get'
import { createApiKey } from '@api/Post'
import { updateApiKey } from '@api/Put'
import { deleteApiKey } from '@api/Delete'

const notify = { success: (msg) => sileo.success({ title: msg }), error: (msg) => sileo.error({ title: msg }) }

function formatDate(val) {
  if (!val) return 'Sin expiración'
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

export default function ApiKeysManager() {
  const router = useRouter()
  const schema = typeof router.query.schema === 'string' ? router.query.schema : ''
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [createForm, setCreateForm] = useState({ name: '', expires_at: '' })
  const [editForm, setEditForm] = useState({ id: null, name: '', expires_at: '' })
  const [newKeyResult, setNewKeyResult] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isNewKeyOpen, setIsNewKeyOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const fetchList = useCallback(async () => {
    if (!schema) return
    setLoading(true)
    try {
      const res = await getApiKeys(schema)
      if (res?.data?.data) setList(Array.isArray(res.data.data) ? res.data.data : [])
      else setList([])
    } catch (e) {
      notify.error('Error al cargar API keys')
      setList([])
    } finally {
      setLoading(false)
    }
  }, [schema])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!schema) return
    setActionLoading(true)
    try {
      const body = { schema, name: createForm.name || undefined, expires_at: createForm.expires_at || undefined }
      const res = await createApiKey(body)
      if (res?.status === 201 && res?.data) {
        setNewKeyResult(res.data)
        setIsCreateOpen(false)
        setIsNewKeyOpen(true)
        setCreateForm({ name: '', expires_at: '' })
        fetchList()
        notify.success('API key creada. Copia la clave ahora; no se volverá a mostrar.')
      } else {
        const msg = res?.data?.message || res?.data?.error || 'Error al crear API key'
        notify.error(msg)
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Error al crear API key'
      notify.error(msg)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editForm.id) return
    setActionLoading(true)
    try {
      const body = { schema, name: editForm.name || undefined, expires_at: editForm.expires_at || null }
      const res = await updateApiKey(editForm.id, body)
      if (res?.status === 200) {
        setIsEditOpen(false)
        setEditForm({ id: null, name: '', expires_at: '' })
        fetchList()
        notify.success('API key actualizada')
      } else {
        notify.error(res?.data?.message || 'Error al actualizar')
      }
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Error al actualizar')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete?.id) return
    setActionLoading(true)
    try {
      const res = await deleteApiKey(toDelete.id, schema)
      if (res?.status === 204 || res?.status === 200) {
        setIsDeleteOpen(false)
        setToDelete(null)
        fetchList()
        notify.success('API key eliminada')
      } else {
        notify.error(res?.data?.message || 'Error al eliminar')
      }
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Error al eliminar')
    } finally {
      setActionLoading(false)
    }
  }

  const openEdit = (row) => {
    setEditForm({
      id: row.id,
      name: row.name || '',
      expires_at: row.expires_at ? row.expires_at.slice(0, 16) : '',
    })
    setIsEditOpen(true)
  }

  const copyKey = () => {
    if (newKeyResult?.key) {
      navigator.clipboard.writeText(newKeyResult.key)
      notify.success('Clave copiada al portapapeles')
    }
  }

  const modalOverlay = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]'
  const modalContent = 'bg-white rounded-xl shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-auto'

  if (!schema) {
    return (
      <div className="apikeys-page flex flex-col flex-1 min-h-0 m-[30px] rounded-2xl bg-white p-6 overflow-auto">
        <p className="text-gray-600 mb-4">Falta el parámetro schema (identificación). Vuelve al perfil del cliente.</p>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg border border-gray-300"
          onClick={() => router.push(`/profile/${router.query.userId}`)}
        >
          ← Atrás
        </button>
      </div>
    )
  }

  return (
    <div className="apikeys-page flex flex-col flex-1 min-h-0 m-[30px] rounded-2xl bg-white p-6 overflow-auto">
      <button
        type="button"
        className="inline-flex items-center mb-5 px-4 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg border border-gray-300 w-fit"
        onClick={() => router.push(`/profile/${router.query.userId}`)}
      >
        ← Atrás
      </button>

      <header className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-xl flex-shrink-0">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 m-0 mb-1">API Keys</h1>
          <p className="text-sm text-gray-500 m-0 leading-snug">
            Claves de API del esquema <span className="font-medium text-gray-700">{schema}</span>. Crea, edita o elimina claves.
          </p>
        </div>
      </header>

      <div className="mb-4">
        <button
          type="button"
          className="px-4 py-2.5 rounded-lg font-medium text-white bg-[#146C94] hover:bg-[#115a7a] transition-colors text-sm shadow-sm"
          onClick={() => setIsCreateOpen(true)}
        >
          Nueva API key
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 my-6">Cargando...</p>
      ) : list.length === 0 ? (
        <p className="text-gray-500 my-6">No hay API keys para este esquema.</p>
      ) : (
        <ul className="list-none p-0 m-0 flex flex-col gap-4">
          {list.map((row) => (
            <li
              key={row.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 gap-y-2 mb-2">
                <span className="font-bold text-gray-900">#{row.id}</span>
                <span className="text-sm text-gray-600">{row.name || '—'}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
                <span>user_id: {row.user_id ?? '—'}</span>
                <span>Creado: {formatDate(row.created_at)}</span>
                <span>Expira: {formatDate(row.expires_at)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm font-medium text-[#146C94] bg-white border-2 border-[#146C94] hover:bg-[#146C94] hover:text-white rounded-lg transition-colors"
                  onClick={() => openEdit(row)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-300 hover:bg-red-50 rounded-lg transition-colors"
                  onClick={() => {
                    setToDelete(row)
                    setIsDeleteOpen(true)
                  }}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal Crear */}
      {isCreateOpen && (
        <div className={modalOverlay} onClick={() => setIsCreateOpen(false)}>
          <div className={modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva API key</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Esquema</label>
                <input
                  type="text"
                  value={schema}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (opcional)</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#146C94] focus:border-[#146C94] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expira (opcional)</label>
                <input
                  type="datetime-local"
                  value={createForm.expires_at}
                  onChange={(e) => setCreateForm((p) => ({ ...p, expires_at: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#146C94] focus:border-[#146C94] outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg font-medium text-white bg-[#146C94] hover:bg-[#115a7a] disabled:opacity-60"
                >
                  Crear
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal clave nueva (solo una vez) */}
      {isNewKeyOpen && newKeyResult?.key && (
        <div className={modalOverlay} onClick={() => { setNewKeyResult(null); setIsNewKeyOpen(false) }}>
          <div className={modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">API key creada</h3>
            <p className="text-red-600 text-sm mb-4">Guarda esta clave; no se volverá a mostrar.</p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                readOnly
                value={newKeyResult.key}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm"
              />
              <button
                type="button"
                className="px-4 py-2 rounded-lg font-medium text-white bg-[#146C94] hover:bg-[#115a7a] shrink-0"
                onClick={copyKey}
              >
                Copiar
              </button>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
              onClick={() => { setNewKeyResult(null); setIsNewKeyOpen(false) }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {isEditOpen && (
        <div className={modalOverlay} onClick={() => setIsEditOpen(false)}>
          <div className={modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar API key</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (opcional)</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#146C94] focus:border-[#146C94] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expira (opcional, vacío = sin expiración)</label>
                <input
                  type="datetime-local"
                  value={editForm.expires_at}
                  onChange={(e) => setEditForm((p) => ({ ...p, expires_at: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#146C94] focus:border-[#146C94] outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg font-medium text-white bg-[#146C94] hover:bg-[#115a7a] disabled:opacity-60"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {isDeleteOpen && toDelete && (
        <div className={modalOverlay} onClick={() => setIsDeleteOpen(false)}>
          <div className={modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Eliminar esta API key?</h3>
            <p className="text-gray-600 text-sm mb-4">Id: {toDelete.id}. Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                Eliminar
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
                onClick={() => setIsDeleteOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .apikeys-page {
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
