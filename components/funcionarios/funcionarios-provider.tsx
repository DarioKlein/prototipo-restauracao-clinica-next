"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { type CargoItem, type Funcionario, createSeedCargos, createSeedFuncionarios } from "@/lib/funcionarios"

interface FuncionariosContextValue {
  funcionarios: Funcionario[]
  cargos: CargoItem[]
  getById: (id: string) => Funcionario | undefined
  addFuncionario: (data: Omit<Funcionario, "id">) => Funcionario
  updateFuncionario: (id: string, data: Partial<Funcionario>) => void
  removeFuncionario: (id: string) => void
  toggleStatus: (id: string) => void
  addCargo: (data: Omit<CargoItem, "id">) => CargoItem
  updateCargo: (id: string, data: Partial<Omit<CargoItem, "id">>) => void
  toggleCargo: (id: string) => void
}

const FuncionariosContext = createContext<FuncionariosContextValue | null>(null)

export function FuncionariosProvider({ children }: { children: ReactNode }) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(() => createSeedFuncionarios())
  const [cargos, setCargos] = useState<CargoItem[]>(() => createSeedCargos())

  const getById = useCallback((id: string) => funcionarios.find((f) => f.id === id), [funcionarios])

  const addFuncionario = useCallback((data: Omit<Funcionario, "id">) => {
    const novo: Funcionario = { ...data, id: `func-${Date.now()}` }
    setFuncionarios((prev) => [novo, ...prev])
    return novo
  }, [])

  const updateFuncionario = useCallback((id: string, data: Partial<Funcionario>) => {
    setFuncionarios((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)))
  }, [])

  const removeFuncionario = useCallback((id: string) => {
    setFuncionarios((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const toggleStatus = useCallback((id: string) => {
    setFuncionarios((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: f.status === "ativo" ? "inativo" : "ativo" } : f)),
    )
  }, [])

  const addCargo = useCallback((data: Omit<CargoItem, "id">) => {
    const novo: CargoItem = { ...data, id: `cargo-${Date.now()}` }
    setCargos((prev) => [...prev, novo])
    return novo
  }, [])

  const updateCargo = useCallback((id: string, data: Partial<Omit<CargoItem, "id">>) => {
    setCargos((prev) => prev.map((cargo) => (cargo.id === id ? { ...cargo, ...data } : cargo)))
  }, [])

  const toggleCargo = useCallback((id: string) => {
    setCargos((prev) => prev.map((cargo) => (cargo.id === id ? { ...cargo, ativo: !cargo.ativo } : cargo)))
  }, [])

  const value = useMemo(
    () => ({
      funcionarios,
      cargos,
      getById,
      addFuncionario,
      updateFuncionario,
      removeFuncionario,
      toggleStatus,
      addCargo,
      updateCargo,
      toggleCargo,
    }),
    [
      funcionarios,
      cargos,
      getById,
      addFuncionario,
      updateFuncionario,
      removeFuncionario,
      toggleStatus,
      addCargo,
      updateCargo,
      toggleCargo,
    ],
  )

  return <FuncionariosContext.Provider value={value}>{children}</FuncionariosContext.Provider>
}

export function useFuncionarios() {
  const ctx = useContext(FuncionariosContext)
  if (!ctx) throw new Error("useFuncionarios deve ser usado dentro de FuncionariosProvider")
  return ctx
}
