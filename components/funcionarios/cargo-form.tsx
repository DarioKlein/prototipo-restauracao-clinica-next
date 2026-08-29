"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Check } from "lucide-react"
import { Field, TextInput } from "@/components/ui/form-controls"
import type { CargoItem } from "@/lib/funcionarios"

export type CargoFormValues = Omit<CargoItem, "id">

interface CargoFormProps {
  initialValues?: Partial<CargoFormValues>
  submitLabel: string
  onSubmit: (values: CargoFormValues) => void
  onCancel: () => void
}

export function CargoForm({ initialValues, submitLabel, onSubmit, onCancel }: CargoFormProps) {
  const [values, setValues] = useState<CargoFormValues>({
    nome: initialValues?.nome ?? "",
    ativo: initialValues?.ativo ?? true,
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setValues({
      nome: initialValues?.nome ?? "",
      ativo: initialValues?.ativo ?? true,
    })
    setError(null)
  }, [initialValues])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!values.nome.trim()) {
      setError("Informe o nome do cargo.")
      return
    }

    setError(null)
    onSubmit({ nome: values.nome.trim(), ativo: values.ativo })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Nome do cargo" htmlFor="cargo-nome" required>
        <TextInput
          id="cargo-nome"
          value={values.nome}
          onChange={(event) => setValues((prev) => ({ ...prev, nome: event.target.value }))}
          placeholder="Ex.: Terapeuta ocupacional"
          autoFocus
        />
      </Field>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
        <input
          type="checkbox"
          checked={values.ativo}
          onChange={(event) => setValues((prev) => ({ ...prev, ativo: event.target.checked }))}
          className="mt-0.5 h-4 w-4 accent-primary"
        />
        <span>
          <span className="block text-sm font-medium text-foreground">Cargo ativo</span>
          <span className="block text-xs text-muted-foreground">Cargos ativos ficam disponíveis para novos colaboradores.</span>
        </span>
      </label>

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