"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { type Triagem, createSeedTriagens, deriveStatus } from "@/lib/triagens"

interface TriagensContextValue {
  triagens: Triagem[]
  getById: (id: string) => Triagem | undefined
  addTriagem: (data: Omit<Triagem, "id">) => Triagem
  updateTriagem: (id: string, data: Partial<Triagem>) => void
  removeTriagem: (id: string) => void
  concluirTriagem: (id: string) => void
  reabrirTriagem: (id: string) => void
}

const TriagensContext = createContext<TriagensContextValue | null>(null)

export function TriagensProvider({ children }: { children: ReactNode }) {
  const [rawTriagens, setTriagens] = useState<Triagem[]>(() => createSeedTriagens())

  // Recalcula o status a cada render para que triagens agendadas com data
  // vencida passem automaticamente para "atrasada" (sem sobrescrever concluídas).
  const triagens = useMemo(
    () => rawTriagens.map((t) => ({ ...t, status: deriveStatus(t.data, t.status) })),
    [rawTriagens],
  )

  const getById = useCallback((id: string) => triagens.find((t) => t.id === id), [triagens])

  const addTriagem = useCallback((data: Omit<Triagem, "id">) => {
    const novo: Triagem = {
      ...data,
      id: `tri-${Date.now()}`,
      status: deriveStatus(data.data, data.status),
    }
    setTriagens((prev) => [...prev, novo])
    return novo
  }, [])

  const updateTriagem = useCallback((id: string, data: Partial<Triagem>) => {
    setTriagens((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const merged = { ...t, ...data }
        // Recalcula o status pela presença de data, preservando triagens concluídas.
        return { ...merged, status: deriveStatus(merged.data, merged.status) }
      }),
    )
  }, [])

  const removeTriagem = useCallback((id: string) => {
    setTriagens((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const concluirTriagem = useCallback((id: string) => {
    // Só é possível concluir uma triagem com data definida (agendada ou atrasada).
    // Triagens pendentes precisam antes ser agendadas.
    setTriagens((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const atual = deriveStatus(t.data, t.status)
        return atual === "agendada" || atual === "atrasada" ? { ...t, status: "concluida" } : t
      }),
    )
  }, [])

  const reabrirTriagem = useCallback((id: string) => {
    setTriagens((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: deriveStatus(t.data) } : t)),
    )
  }, [])

  const value = useMemo(
    () => ({ triagens, getById, addTriagem, updateTriagem, removeTriagem, concluirTriagem, reabrirTriagem }),
    [triagens, getById, addTriagem, updateTriagem, removeTriagem, concluirTriagem, reabrirTriagem],
  )

  return <TriagensContext.Provider value={value}>{children}</TriagensContext.Provider>
}

export function useTriagens() {
  const ctx = useContext(TriagensContext)
  if (!ctx) throw new Error("useTriagens deve ser usado dentro de TriagensProvider")
  return ctx
}
