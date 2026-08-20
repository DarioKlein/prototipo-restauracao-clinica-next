"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { type ModalidadeItem, createSeedModalidades } from "@/lib/modalidades"

interface ModalidadesContextValue {
  modalidades: ModalidadeItem[]
  getById: (id: string) => ModalidadeItem | undefined
  addModalidade: (data: Omit<ModalidadeItem, "id" | "criadoEm">) => ModalidadeItem
  updateModalidade: (id: string, data: Partial<ModalidadeItem>) => void
  toggleAtiva: (id: string) => void
  removeModalidade: (id: string) => void
}

const ModalidadesContext = createContext<ModalidadesContextValue | null>(null)

export function ModalidadesProvider({ children }: { children: ReactNode }) {
  const [modalidades, setModalidades] = useState<ModalidadeItem[]>(() => createSeedModalidades())

  const getById = useCallback((id: string) => modalidades.find((m) => m.id === id), [modalidades])

  const addModalidade = useCallback((data: Omit<ModalidadeItem, "id" | "criadoEm">) => {
    const nova: ModalidadeItem = {
      ...data,
      id: `mod-${Date.now()}`,
      criadoEm: new Date().toISOString().slice(0, 10),
    }
    setModalidades((prev) => [...prev, nova])
    return nova
  }, [])

  const updateModalidade = useCallback((id: string, data: Partial<ModalidadeItem>) => {
    setModalidades((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)))
  }, [])

  const toggleAtiva = useCallback((id: string) => {
    setModalidades((prev) => prev.map((m) => (m.id === id ? { ...m, ativa: !m.ativa } : m)))
  }, [])

  const removeModalidade = useCallback((id: string) => {
    setModalidades((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const value = useMemo(
    () => ({ modalidades, getById, addModalidade, updateModalidade, toggleAtiva, removeModalidade }),
    [modalidades, getById, addModalidade, updateModalidade, toggleAtiva, removeModalidade],
  )

  return <ModalidadesContext.Provider value={value}>{children}</ModalidadesContext.Provider>
}

export function useModalidades() {
  const ctx = useContext(ModalidadesContext)
  if (!ctx) throw new Error("useModalidades deve ser usado dentro de ModalidadesProvider")
  return ctx
}
