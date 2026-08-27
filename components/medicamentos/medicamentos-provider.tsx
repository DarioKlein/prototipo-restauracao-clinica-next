"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { createSeedMedicamentos, type Medicamento, type MedicamentoFormValues } from "@/lib/medicamentos"

interface MedicamentosContextValue {
  medicamentos: Medicamento[]
  getById: (id: string) => Medicamento | undefined
  addMedicamento: (data: MedicamentoFormValues) => Medicamento
  updateMedicamento: (id: string, data: Partial<MedicamentoFormValues>) => void
  removeMedicamento: (id: string) => void
}

const MedicamentosContext = createContext<MedicamentosContextValue | null>(null)

export function MedicamentosProvider({ children }: { children: ReactNode }) {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>(() => createSeedMedicamentos())

  const getById = useCallback((id: string) => medicamentos.find((medicamento) => medicamento.id === id), [medicamentos])

  const addMedicamento = useCallback((data: MedicamentoFormValues) => {
    const novo: Medicamento = { ...data, id: `med-${Date.now()}` }
    setMedicamentos((prev) => [novo, ...prev])
    return novo
  }, [])

  const updateMedicamento = useCallback((id: string, data: Partial<MedicamentoFormValues>) => {
    setMedicamentos((prev) => prev.map((medicamento) => (medicamento.id === id ? { ...medicamento, ...data } : medicamento)))
  }, [])

  const removeMedicamento = useCallback((id: string) => {
    setMedicamentos((prev) => prev.filter((medicamento) => medicamento.id !== id))
  }, [])

  const value = useMemo(
    () => ({ medicamentos, getById, addMedicamento, updateMedicamento, removeMedicamento }),
    [medicamentos, getById, addMedicamento, updateMedicamento, removeMedicamento],
  )

  return <MedicamentosContext.Provider value={value}>{children}</MedicamentosContext.Provider>
}

export function useMedicamentos() {
  const ctx = useContext(MedicamentosContext)
  if (!ctx) throw new Error("useMedicamentos deve ser usado dentro de MedicamentosProvider")
  return ctx
}