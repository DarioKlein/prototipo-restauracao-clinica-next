"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Check } from "lucide-react"
import { Field, SelectInput, TextInput } from "@/components/ui/form-controls"
import type { MedicamentoFormValues } from "@/lib/medicamentos"
import type { ModalidadeItem } from "@/lib/modalidades"

interface MedicamentoFormProps {
  initialValues?: Partial<MedicamentoFormValues>
  modalidades: ModalidadeItem[]
  editing?: boolean
  submitLabel: string
  onSubmit: (values: MedicamentoFormValues) => void
  onCancel: () => void
}

const UNIDADES = ["Comprimidos", "Cápsulas", "Frascos", "Ampolas", "Bisnagas", "Saches", "Unidades"]

export function MedicamentoForm({ initialValues, modalidades, editing = false, submitLabel, onSubmit, onCancel }: MedicamentoFormProps) {
  const [values, setValues] = useState<MedicamentoFormValues>({
    nome: initialValues?.nome ?? "",
    preco: initialValues?.preco ?? 0,
    modalidadeId: initialValues?.modalidadeId ?? modalidades.find((modalidade) => modalidade.ativa)?.id ?? "",
    unidade: initialValues?.unidade ?? "Comprimidos",
    estoqueMinimo: initialValues?.estoqueMinimo ?? 10,
    estoqueInicial: initialValues?.estoqueInicial ?? 0,
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setValues({
      nome: initialValues?.nome ?? "",
      preco: initialValues?.preco ?? 0,
      modalidadeId: initialValues?.modalidadeId ?? modalidades.find((modalidade) => modalidade.ativa)?.id ?? "",
      unidade: initialValues?.unidade ?? "Comprimidos",
      estoqueMinimo: initialValues?.estoqueMinimo ?? 10,
      estoqueInicial: initialValues?.estoqueInicial ?? 0,
    })
    setError(null)
  }, [initialValues, modalidades])

  function set<K extends keyof MedicamentoFormValues>(key: K, value: MedicamentoFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!values.nome.trim()) {
      setError("O nome não pode ser nulo ou vazio.")
      return
    }
    if (values.nome.trim().length < 3) {
      setError("O nome não pode ser menor que 3 caracteres.")
      return
    }
    if (values.preco < 0) {
      setError("O preço não pode ser negativo.")
      return
    }
    if (!values.modalidadeId) {
      setError("Selecione a modalidade de entrada.")
      return
    }
    if (values.estoqueMinimo < 0 || values.estoqueInicial < 0) {
      setError("Os valores de estoque não podem ser negativos.")
      return
    }

    setError(null)
    onSubmit({ ...values, nome: values.nome.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Nome do medicamento" htmlFor="medicamento-nome" required>
        <TextInput
          id="medicamento-nome"
          value={values.nome}
          onChange={(event) => set("nome", event.target.value)}
          placeholder="Ex.: Paracetamol 500mg"
          autoFocus
        />
      </Field>

      <Field label="Preço" htmlFor="medicamento-preco" required hint="Informe o preço unitário em reais.">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
          <TextInput
            id="medicamento-preco"
            type="number"
            min="0"
            step="0.01"
            value={values.preco}
            onChange={(event) => set("preco", Number(event.target.value))}
            className="pl-10"
            inputMode="decimal"
          />
        </div>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Modalidade de entrada" htmlFor="medicamento-modalidade" required hint="Defina para qual público o estoque será direcionado.">
          <SelectInput
            id="medicamento-modalidade"
            value={values.modalidadeId}
            onChange={(event) => set("modalidadeId", event.target.value)}
          >
            <option value="">Selecione uma modalidade</option>
            {modalidades
              .filter((modalidade) => modalidade.ativa || modalidade.id === initialValues?.modalidadeId)
              .map((modalidade) => (
                <option key={modalidade.id} value={modalidade.id}>
                  {modalidade.nome}
                  {!modalidade.ativa ? " (inativa)" : ""}
                </option>
              ))}
          </SelectInput>
        </Field>

        <Field label="Unidade de controle" htmlFor="medicamento-unidade" required>
          <SelectInput id="medicamento-unidade" value={values.unidade} onChange={(event) => set("unidade", event.target.value)}>
            {UNIDADES.map((unidade) => (
              <option key={unidade} value={unidade}>
                {unidade}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Estoque mínimo" htmlFor="medicamento-minimo" required hint="Abaixo desse valor, o item será sinalizado como estoque baixo.">
          <TextInput
            id="medicamento-minimo"
            type="number"
            min="0"
            step="1"
            value={values.estoqueMinimo}
            onChange={(event) => set("estoqueMinimo", Number(event.target.value))}
            inputMode="numeric"
          />
        </Field>

        {!editing && (
          <Field label="Estoque inicial" htmlFor="medicamento-inicial" hint="Você poderá ajustar o saldo depois pelas movimentações.">
            <TextInput
              id="medicamento-inicial"
              type="number"
              min="0"
              step="1"
              value={values.estoqueInicial}
              onChange={(event) => set("estoqueInicial", Number(event.target.value))}
              inputMode="numeric"
            />
          </Field>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive">
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
          {submitLabel}
        </button>
      </div>
    </form>
  )
}