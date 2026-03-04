import { useQuery, useMutation, UseQueryOptions, UseMutationOptions, useQueryClient } from "@tanstack/react-query"

import { getUsers, getUser, getNotifyClient, getAdmins, getAdmin, getAdminByEmail, getMove } from "@api/Get"
import { registroCliente, registroAdmin, loginAdmin, filtrarClientesPorLetra, renovarFechaCorte } from "@api/Post"
import { updateUser, updateAdmin, updateState } from "@api/Put"
import { deleteClient, deleteAdmin, deleteDevice } from "@api/Delete"
import { getDaysDifference } from "./dateComparison"

// ------- QUERIES (GET) -------

export function useUsers(search: string, options?: UseQueryOptions<any, unknown, any, any[]>) {
  const updateStateMutation = useUpdateState()

  return useQuery({
    queryKey: ["users", search],
    queryFn: async () => {
      const usersResponse = await getUsers(search)
      if (!usersResponse || !usersResponse.data?.data) return

      const { inactivos=[], activos=[], prorrogas=[], updateStatus=[] } = usersResponse.data.data.reduce((prev: { inactivos: any[], activos: any[], prorrogas: any[], updateStatus: any[] }, curr: any) => {
        const v = getDaysDifference(curr.fecha_corte)
        if (v === true) return { ...prev, activos: [...prev.activos, curr] }
        if (!v) {
          return {
            ...prev,
            inactivos: [...prev.inactivos, { ...curr, est_financiero: "Inactivo" }],
            updateStatus: [...prev.updateStatus, updateStateMutation.mutateAsync(curr["id"])],
          }
        }
        if (v > 0 && v <= 5) {
          return {
            ...prev,
            prorrogas: [...prev.prorrogas, { ...curr, est_financiero: "Prorroga" }],
          }
        }
        return {
          ...prev,
          inactivos: [...prev.inactivos, { ...curr, est_financiero: "Inactivo" }],
          updateStatus: [...prev.updateStatus, ()=>updateStateMutation.mutateAsync(curr["id"])],
        }
      }, { inactivos: [], prorrogas: [], activos: [], updateStatus: [] })

      await Promise.allSettled(updateStatus)

      return {
        inactivos,
        activos,
        prorrogas,
      }
    },
    enabled: search !== undefined,
    ...(options as any),
  })
}

export function useUser(id: string | number | undefined, options?: UseQueryOptions<any, unknown, any, any[]>) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(String(id)),
    enabled: Boolean(id),
    ...(options as any),
  })
}

export function useNotifyClient(
  id: string | number | undefined,
  params: { start?: string; end?: string } = {},
  options?: UseQueryOptions<any, unknown, any, any[]>,
) {
  return useQuery({
    queryKey: ["notify", id, params],
    queryFn: () => getNotifyClient(String(id), params),
    enabled: Boolean(id),
    ...(options as any),
  })
}

export function useMoves(
  id: string | number | undefined,
  params: { start?: string; end?: string } = {},
  options?: UseQueryOptions<any, unknown, any, any[]>,
) {
  return useQuery({
    queryKey: ["moves", id, params],
    queryFn: () => getMove(String(id), params),
    enabled: Boolean(id),
    ...(options as any),
  })
}

export function useAdmins(options?: UseQueryOptions<any, unknown, any, any[]>) {
  return useQuery({
    queryKey: ["admins"],
    queryFn: () => getAdmins(),
    ...(options as any),
  })
}

export function useAdmin(id: string | number | undefined, options?: UseQueryOptions<any, unknown, any, any[]>) {
  return useQuery({
    queryKey: ["admin", id],
    queryFn: () => getAdmin(String(id)),
    enabled: Boolean(id),
    ...(options as any),
  })
}

export function useAdminByEmail(email: string | undefined, options?: UseQueryOptions<any, unknown, any, any[]>) {
  return useQuery({
    queryKey: ["adminByEmail", email],
    queryFn: () => getAdminByEmail(String(email)),
    enabled: Boolean(email),
    ...(options as any),
  })
}

// ------- MUTATIONS (POST / PUT / DELETE) -------

export function useRegistrarCliente(options?: UseMutationOptions<any, unknown, any>) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = (options || {}) as UseMutationOptions<any, unknown, any>

  return useMutation({
    mutationFn: (data: any) => registroCliente(data),
    onSuccess: async (data, variables, context, _mutation) => {
      await queryClient.invalidateQueries({ queryKey: ["users"], exact: false })
      if (onSuccess) onSuccess(data, variables, context, _mutation as any)
    },
    ...(rest as any),
  })
}

export function useRegistrarAdmin(options?: UseMutationOptions<any, unknown, any>) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = (options || {}) as UseMutationOptions<any, unknown, any>

  return useMutation({
    mutationFn: (data: any) => registroAdmin(data),
    onSuccess: async (data, variables, context, _mutation) => {
      await queryClient.invalidateQueries({ queryKey: ["admins"], exact: false })
      if (onSuccess) onSuccess(data, variables, context, _mutation as any)
    },
    ...(rest as any),
  })
}

export function useLoginAdmin(options?: UseMutationOptions<any, unknown, any>) {
  return useMutation({
    mutationFn: (data: any) => loginAdmin(data),
    ...(options as any),
  })
}

export function useFiltrarClientesPorLetra(options?: UseMutationOptions<any, unknown, string>) {
  return useMutation({
    mutationFn: (letra: string) => filtrarClientesPorLetra(letra),
    ...(options as any),
  })
}

export function useRenovarFechaCorte(options?: UseMutationOptions<any, unknown, { id: string | number; date: string }>) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = (options || {}) as UseMutationOptions<any, unknown, { id: string | number; date: string }>

  return useMutation({
    mutationFn: ({ id, date }: { id: string | number; date: string }) => renovarFechaCorte(id, date),
    onSuccess: async (data, variables, context, _mutation) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user", variables.id], exact: false }),
        queryClient.invalidateQueries({ queryKey: ["users"], exact: false }),
      ])
      if (onSuccess) onSuccess(data, variables, context, _mutation as any)
    },
    ...(rest as any),
  })
}

export function useUpdateUser(options?: UseMutationOptions<any, unknown, { id: string | number; data: any }>) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = (options || {}) as UseMutationOptions<any, unknown, { id: string | number; data: any }>

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) => updateUser(id, data),
    onSuccess: async (data, variables, context, _mutation) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user", variables.id], exact: false }),
        queryClient.invalidateQueries({ queryKey: ["users"], exact: false }),
      ])
      if (onSuccess) onSuccess(data, variables, context, _mutation as any)
    },
    ...(rest as any),
  })
}

export function useUpdateAdmin(options?: UseMutationOptions<any, unknown, { id: string | number; data: any }>) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = (options || {}) as UseMutationOptions<any, unknown, { id: string | number; data: any }>

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) => updateAdmin(id, data),
    onSuccess: async (data, variables, context, _mutation) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admins"], exact: false }),
        queryClient.invalidateQueries({ queryKey: ["admin", variables.id], exact: false }),
        queryClient.invalidateQueries({ queryKey: ["adminByEmail"], exact: false }),
      ])
      if (onSuccess) onSuccess(data, variables, context, _mutation as any)
    },
    ...(rest as any),
  })
}

export function useUpdateState(options?: UseMutationOptions<any, unknown, string | number>) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = (options || {}) as UseMutationOptions<any, unknown, string | number>

  return useMutation({
    mutationFn: (id: string | number) => updateState(id),
    onSuccess: async (data, variables, context, _mutation) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"], exact: false }),
        queryClient.invalidateQueries({ queryKey: ["user", variables], exact: false }),
      ])
      if (onSuccess) onSuccess(data, variables, context, _mutation as any)
    },
    ...(rest as any),
  })
}

export function useDeleteClient(options?: UseMutationOptions<any, unknown, string | number>) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = (options || {}) as UseMutationOptions<any, unknown, string | number>

  return useMutation({
    mutationFn: (id: string | number) => deleteClient(id),
    onSuccess: async (data, variables, context, _mutation) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"], exact: false }),
        queryClient.invalidateQueries({ queryKey: ["user", variables], exact: false }),
      ])
      if (onSuccess) onSuccess(data, variables, context, _mutation as any)
    },
    ...(rest as any),
  })
}

export function useDeleteAdmin(options?: UseMutationOptions<any, unknown, string | number>) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = (options || {}) as UseMutationOptions<any, unknown, string | number>

  return useMutation({
    mutationFn: (id: string | number) => deleteAdmin(id),
    onSuccess: async (data, variables, context, _mutation) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admins"], exact: false }),
        queryClient.invalidateQueries({ queryKey: ["admin", variables], exact: false }),
        queryClient.invalidateQueries({ queryKey: ["adminByEmail"], exact: false }),
      ])
      if (onSuccess) onSuccess(data, variables, context, _mutation as any)
    },
    ...(rest as any),
  })
}

export function useDeleteDevice(options?: UseMutationOptions<any, unknown, string | number>) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = (options || {}) as UseMutationOptions<any, unknown, string | number>

  return useMutation({
    mutationFn: (login_user: string | number) => deleteDevice(login_user),
    onSuccess: async (data, variables, context, _mutation) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user"], exact: false }),
        queryClient.invalidateQueries({ queryKey: ["users"], exact: false }),
      ])
      if (onSuccess) onSuccess(data, variables, context, _mutation as any)
    },
    ...(rest as any),
  })
}

