"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { type Acolhido, type Relatorio, type DocumentoEmitido, createSeedAcolhidos } from "@/lib/acolhidos"

interface AcolhidosContextValue {
  acolhidos: Acolhido[]
  getById: (id: string) => Acolhido | undefined
  addAcolhido: (data: Omit<Acolhido, "id" | "relatorios" | "documentosEmitidos">) => Acolhido
  updateAcolhido: (id: string, data: Partial<Acolhido>) => void
  removeAcolhido: (id: string) => void
  toggleInativo: (id: string) => void
  registrarAlta: (id: string) => void
  addRelatorio: (acolhidoId: string, relatorio: Omit<Relatorio, "id">) => void
  removeRelatorio: (acolhidoId: string, relatorioId: string) => void
  registrarEmissao: (acolhidoId: string, doc: Omit<DocumentoEmitido, "id">) => void
}

const AcolhidosContext = createContext<AcolhidosContextValue | null>(null)

export function AcolhidosProvider({ children }: { children: ReactNode }) {
  const [acolhidos, setAcolhidos] = useState<Acolhido[]>(() => createSeedAcolhidos())

  const getById = useCallback((id: string) => acolhidos.find((a) => a.id === id), [acolhidos])

  const addAcolhido = useCallback((data: Omit<Acolhido, "id" | "relatorios" | "documentosEmitidos">) => {
    const novo: Acolhido = { ...data, id: `aco-${Date.now()}`, relatorios: [], documentosEmitidos: [] }
    setAcolhidos((prev) => [novo, ...prev])
    return novo
  }, [])

  const updateAcolhido = useCallback((id: string, data: Partial<Acolhido>) => {
    setAcolhidos((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)))
  }, [])

  const removeAcolhido = useCallback((id: string) => {
    setAcolhidos((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const toggleInativo = useCallback((id: string) => {
    setAcolhidos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, situacao: a.situacao === "inativo" ? "ativo" : "inativo" } : a)),
    )
  }, [])

  const registrarAlta = useCallback((id: string) => {
    setAcolhidos((prev) => prev.map((a) => (a.id === id ? { ...a, situacao: "alta" } : a)))
  }, [])

  const addRelatorio = useCallback((acolhidoId: string, relatorio: Omit<Relatorio, "id">) => {
    setAcolhidos((prev) =>
      prev.map((a) =>
        a.id === acolhidoId
          ? { ...a, relatorios: [{ ...relatorio, id: `rel-${Date.now()}` }, ...a.relatorios] }
          : a,
      ),
    )
  }, [])

  const removeRelatorio = useCallback((acolhidoId: string, relatorioId: string) => {
    setAcolhidos((prev) =>
      prev.map((a) =>
        a.id === acolhidoId ? { ...a, relatorios: a.relatorios.filter((r) => r.id !== relatorioId) } : a,
      ),
    )
  }, [])

  const registrarEmissao = useCallback((acolhidoId: string, doc: Omit<DocumentoEmitido, "id">) => {
    setAcolhidos((prev) =>
      prev.map((a) =>
        a.id === acolhidoId
          ? { ...a, documentosEmitidos: [{ ...doc, id: `doc-${Date.now()}` }, ...a.documentosEmitidos] }
          : a,
      ),
    )
  }, [])

  const value = useMemo(
    () => ({
      acolhidos,
      getById,
      addAcolhido,
      updateAcolhido,
      removeAcolhido,
      toggleInativo,
      registrarAlta,
      addRelatorio,
      removeRelatorio,
      registrarEmissao,
    }),
    [
      acolhidos,
      getById,
      addAcolhido,
      updateAcolhido,
      removeAcolhido,
      toggleInativo,
      registrarAlta,
      addRelatorio,
      removeRelatorio,
      registrarEmissao,
    ],
  )

  return <AcolhidosContext.Provider value={value}>{children}</AcolhidosContext.Provider>
}

export function useAcolhidos() {
  const ctx = useContext(AcolhidosContext)
  if (!ctx) throw new Error("useAcolhidos deve ser usado dentro de AcolhidosProvider")
  return ctx
}
