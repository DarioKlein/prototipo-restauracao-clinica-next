"use client"

import { useState, type FormEvent } from "react"
import { Field, TextInput, SelectInput } from "@/components/ui/form-controls"
import {
  formatCPF,
  formatPhone,
  formatCEP,
  type Funcionario,
} from "@/lib/funcionarios"
import { useFuncionarios } from "@/components/funcionarios/funcionarios-provider"

export type FuncionarioFormValues = Omit<Funcionario, "id">

interface FuncionarioFormProps {
  initialValues?: Partial<FuncionarioFormValues>
  submitLabel: string
  onSubmit: (values: FuncionarioFormValues) => void
  onCancel: () => void
}

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]

export function FuncionarioForm({ initialValues, submitLabel, onSubmit, onCancel }: FuncionarioFormProps) {
  const { cargos } = useFuncionarios()
  const [values, setValues] = useState<FuncionarioFormValues>({
    nome: initialValues?.nome ?? "",
    cpf: initialValues?.cpf ?? "",
    cargo: initialValues?.cargo ?? ("" as FuncionarioFormValues["cargo"]),
    email: initialValues?.email ?? "",
    telefone: initialValues?.telefone ?? "",
    dataNascimento: initialValues?.dataNascimento ?? "",
    dataAdmissao: initialValues?.dataAdmissao ?? "",
    cep: initialValues?.cep ?? "",
    logradouro: initialValues?.logradouro ?? "",
    numero: initialValues?.numero ?? "",
    bairro: initialValues?.bairro ?? "",
    cidade: initialValues?.cidade ?? "",
    estado: initialValues?.estado ?? "",
    status: initialValues?.status ?? "ativo",
  })
  const [error, setError] = useState<string | null>(null)
  const cargosDisponiveis = cargos.filter((cargo) => cargo.ativo || cargo.nome === initialValues?.cargo)

  function set<K extends keyof FuncionarioFormValues>(key: K, value: FuncionarioFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!values.nome.trim()) {
      setError("Informe o nome do colaborador.")
      return
    }
    if (!values.cargo) {
      setError("Selecione um cargo para o colaborador.")
      return
    }
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      setError("Informe um e-mail válido.")
      return
    }
    setError(null)
    onSubmit({ ...values, nome: values.nome.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Dados pessoais */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Dados pessoais
        </legend>

        <Field label="Nome completo" htmlFor="nome" required>
          <TextInput
            id="nome"
            value={values.nome}
            onChange={(e) => set("nome", e.target.value)}
            placeholder="Ex.: Maria da Silva"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="CPF" htmlFor="cpf">
            <TextInput
              id="cpf"
              value={values.cpf}
              onChange={(e) => set("cpf", formatCPF(e.target.value))}
              placeholder="000.000.000-00"
              inputMode="numeric"
            />
          </Field>
          <Field label="Data de nascimento" htmlFor="dataNascimento">
            <TextInput
              id="dataNascimento"
              type="date"
              value={values.dataNascimento}
              onChange={(e) => set("dataNascimento", e.target.value)}
            />
          </Field>
        </div>
      </fieldset>

      {/* Vínculo */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Vínculo</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cargo" htmlFor="cargo" required>
            <SelectInput id="cargo" value={values.cargo} onChange={(e) => set("cargo", e.target.value as FuncionarioFormValues["cargo"])}>
              <option value="">Selecione um cargo</option>
              {cargosDisponiveis.map((cargo) => (
                <option key={cargo.id} value={cargo.nome}>
                  {cargo.nome}
                  {!cargo.ativo ? " (inativo)" : ""}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Data de admissão" htmlFor="dataAdmissao">
            <TextInput
              id="dataAdmissao"
              type="date"
              value={values.dataAdmissao}
              onChange={(e) => set("dataAdmissao", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Situação" htmlFor="status">
          <SelectInput
            id="status"
            value={values.status}
            onChange={(e) => set("status", e.target.value as FuncionarioFormValues["status"])}
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </SelectInput>
        </Field>
      </fieldset>

      {/* Contato */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Contato</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="E-mail" htmlFor="email">
            <TextInput
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="nome@clinica.org"
            />
          </Field>
          <Field label="Telefone" htmlFor="telefone">
            <TextInput
              id="telefone"
              value={values.telefone}
              onChange={(e) => set("telefone", formatPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              inputMode="tel"
            />
          </Field>
        </div>
      </fieldset>

      {/* Endereço */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Endereço</legend>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="CEP" htmlFor="cep">
            <TextInput
              id="cep"
              value={values.cep}
              onChange={(e) => set("cep", formatCEP(e.target.value))}
              placeholder="00000-000"
              inputMode="numeric"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Logradouro" htmlFor="logradouro">
              <TextInput
                id="logradouro"
                value={values.logradouro}
                onChange={(e) => set("logradouro", e.target.value)}
                placeholder="Rua, avenida..."
              />
            </Field>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Número" htmlFor="numero">
            <TextInput
              id="numero"
              value={values.numero}
              onChange={(e) => set("numero", e.target.value)}
              placeholder="Nº"
            />
          </Field>
          <div className="sm:col-span-3">
            <Field label="Bairro" htmlFor="bairro">
              <TextInput
                id="bairro"
                value={values.bairro}
                onChange={(e) => set("bairro", e.target.value)}
                placeholder="Bairro"
              />
            </Field>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Field label="Cidade" htmlFor="cidade">
              <TextInput
                id="cidade"
                value={values.cidade}
                onChange={(e) => set("cidade", e.target.value)}
                placeholder="Cidade"
              />
            </Field>
          </div>
          <Field label="Estado" htmlFor="estado">
            <SelectInput id="estado" value={values.estado} onChange={(e) => set("estado", e.target.value)}>
              <option value="">UF</option>
              {ESTADOS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
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
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
