"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { type Funcionario, createSeedFuncionarios } from "@/lib/funcionarios"

interface FuncionariosContextValue {
  funcionarios: Funcionario[]
  getById: (id: string) => Funcionario | undefined
  addFuncionario: (data: Omit<Funcionario, "id">) => Funcionario
  updateFuncionario: (id: string, data: Partial<Funcionario>) => void
  removeFuncionario: (id: string) => void
  toggleStatus: (id: string) => void
}

const FuncionariosContext = createContext<FuncionariosContextValue | null>(null)

export function FuncionariosProvider({ children }: { children: ReactNode }) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(() => createSeedFuncionarios())

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

  const value = useMemo(
    () => ({ funcionarios, getById, addFuncionario, updateFuncionario, removeFuncionario, toggleStatus }),
    [funcionarios, getById, addFuncionario, updateFuncionario, removeFuncionario, toggleStatus],
  )

  return <FuncionariosContext.Provider value={value}>{children}</FuncionariosContext.Provider>
}

export function useFuncionarios() {
  const ctx = useContext(FuncionariosContext)
  if (!ctx) throw new Error("useFuncionarios deve ser usado dentro de FuncionariosProvider")
  return ctx
}
