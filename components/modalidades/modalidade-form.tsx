"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Check } from "lucide-react"
import { Field, TextInput, TextArea } from "@/components/ui/form-controls"
import {
  MODALIDADE_CORES,
  MODALIDADE_COR_OPCOES,
  type ModalidadeCor,
  type ModalidadeItem,
} from "@/lib/modalidades"

export type ModalidadeFormValues = Omit<ModalidadeItem, "id" | "criadoEm">

interface ModalidadeFormProps {
  /** Modalidade sendo editada; ausente ao criar. */
  modalidade?: ModalidadeItem | null
  /** Vagas já ocupadas — impede reduzir a capacidade abaixo desse valor. */
  ocupadas?: number
  onSubmit: (values: ModalidadeFormValues) => void
  onCancel: () => void
}

const EMPTY: ModalidadeFormValues = { nome: "", descricao: "", vagas: 10, cor: "sky", ativa: true }

export function ModalidadeForm({ modalidade, ocupadas = 0, onSubmit, onCancel }: ModalidadeFormProps) {
  const [values, setValues] = useState<ModalidadeFormValues>(() =>
    modalidade
      ? {
          nome: modalidade.nome,
          descricao: modalidade.descricao,
          vagas: modalidade.vagas,
          cor: modalidade.cor,
          ativa: modalidade.ativa,
        }
      : EMPTY,
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setValues(
      modalidade
        ? {
            nome: modalidade.nome,
            descricao: modalidade.descricao,
            vagas: modalidade.vagas,
            cor: modalidade.cor,
            ativa: modalidade.ativa,
          }
        : EMPTY,
    )
    setError(null)
  }, [modalidade])

  const set = <K extends keyof ModalidadeFormValues>(key: K, value: ModalidadeFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!values.nome.trim()) {
      setError("Informe o nome da modalidade.")
      return
    }
    if (values.vagas < 1) {
      setError("A modalidade precisa ter ao menos 1 vaga.")
      return
    }
    if (values.vagas < ocupadas) {
      setError(`Já existem ${ocupadas} acolhidos nesta modalidade. Defina ao menos ${ocupadas} vagas.`)
      return
    }
    onSubmit({ ...values, nome: values.nome.trim(), descricao: values.descricao.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Nome da modalidade" htmlFor="mod-nome" required>
            <TextInput
              id="mod-nome"
              value={values.nome}
              onChange={(e) => set("nome", e.target.value)}
              placeholder="Ex.: Particular, Convênio, Bolsa social..."
              autoFocus
            />
          </Field>

          <Field label="Descrição" htmlFor="mod-descricao" hint="Explique como funciona esta modalidade de entrada.">
            <TextArea
              id="mod-descricao"
              value={values.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              placeholder="Ex.: Internação custeada pela família do acolhido."
              className="min-h-20"
            />
          </Field>

          <Field
            label="Quantidade de vagas"
            htmlFor="mod-vagas"
            required
            hint={ocupadas > 0 ? `${ocupadas} vaga(s) atualmente ocupada(s).` : "Capacidade total oferecida."}
          >
            <TextInput
              id="mod-vagas"
              type="number"
              min={Math.max(1, ocupadas)}
              value={values.vagas}
              onChange={(e) => set("vagas", Number(e.target.value))}
              inputMode="numeric"
            />
          </Field>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-foreground">Cor de identificação</span>
            <div className="flex flex-wrap gap-2">
              {MODALIDADE_COR_OPCOES.map((cor) => {
                const c = MODALIDADE_CORES[cor]
                const active = values.cor === cor
                return (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => set("cor", cor as ModalidadeCor)}
                    aria-pressed={active}
                    aria-label={c.label}
                    className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105 ${c.track} ${
                      active ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
                    }`}
                  >
                    <span className={`h-4 w-4 rounded-full ${c.bar}`} aria-hidden="true" />
                    {active && <Check className="absolute h-3.5 w-3.5 text-white" aria-hidden="true" />}
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          {modalidade ? "Salvar alterações" : "Criar modalidade"}
        </button>
      </div>
    </form>
  )
}
