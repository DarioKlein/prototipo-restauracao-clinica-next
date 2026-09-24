"use client"

import { useState, type FormEvent } from "react"
import { Field, TextInput, TextArea, SelectInput } from "@/components/ui/form-controls"
import {
  MODALIDADES,
  MODALIDADE_INFO,
  ESTADOS_CIVIS,
  ESCOLARIDADES,
  PARENTESCOS,
  UFS,
  formatCPF,
  formatPhone,
  formatCEP,
  type Acolhido,
  type Modalidade,
} from "@/lib/acolhidos"

export type AcolhidoFormValues = Omit<Acolhido, "id" | "relatorios" | "documentosEmitidos">

interface AcolhidoFormProps {
  initialValues?: Partial<AcolhidoFormValues>
  submitLabel: string
  onSubmit: (values: AcolhidoFormValues) => void
  onCancel: () => void
}

export function AcolhidoForm({ initialValues, submitLabel, onSubmit, onCancel }: AcolhidoFormProps) {
  const [values, setValues] = useState<AcolhidoFormValues>({
    matricula: initialValues?.matricula ?? "",
    nome: initialValues?.nome ?? "",
    cpf: initialValues?.cpf ?? "",
    rg: initialValues?.rg ?? "",
    dataNascimento: initialValues?.dataNascimento ?? "",
    naturalidade: initialValues?.naturalidade ?? "",
    estadoCivil: initialValues?.estadoCivil ?? "",
    escolaridade: initialValues?.escolaridade ?? "",
    profissao: initialValues?.profissao ?? "",
    religiao: initialValues?.religiao ?? "",
    cep: initialValues?.cep ?? "",
    endereco: initialValues?.endereco ?? "",
    bairro: initialValues?.bairro ?? "",
    cidade: initialValues?.cidade ?? "",
    uf: initialValues?.uf ?? "",
    telefone: initialValues?.telefone ?? "",
    email: initialValues?.email ?? "",
    respNome: initialValues?.respNome ?? "",
    respParentesco: initialValues?.respParentesco ?? "",
    respTelefone: initialValues?.respTelefone ?? "",
    respEndereco: initialValues?.respEndereco ?? "",
    dataEntrada: initialValues?.dataEntrada ?? "",
    previsaoAlta: initialValues?.previsaoAlta ?? "",
    modalidade: initialValues?.modalidade ?? ("" as Modalidade),
    leito: initialValues?.leito ?? "",
    observacoes: initialValues?.observacoes ?? "",
    situacao: initialValues?.situacao ?? "ativo",
  })
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof AcolhidoFormValues>(key: K, value: AcolhidoFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!values.nome.trim()) return setError("Informe o nome completo do acolhido.")
    if (!values.cpf.trim()) return setError("Informe o CPF do acolhido.")
    if (!values.dataNascimento) return setError("Informe a data de nascimento.")
    if (!values.modalidade) return setError("Selecione a modalidade da internação.")
    if (!values.dataEntrada) return setError("Informe a data de entrada.")
    if (!values.previsaoAlta) return setError("Informe a previsão de alta.")
    if (!values.telefone.trim()) return setError("Informe um telefone de contato.")
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
            placeholder="Ex.: João da Silva"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="CPF" htmlFor="cpf" required>
            <TextInput
              id="cpf"
              value={values.cpf}
              onChange={(e) => set("cpf", formatCPF(e.target.value))}
              placeholder="000.000.000-00"
              inputMode="numeric"
            />
          </Field>
          <Field label="Data de nascimento" htmlFor="dataNascimento" required>
            <TextInput
              id="dataNascimento"
              type="date"
              value={values.dataNascimento}
              onChange={(e) => set("dataNascimento", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="RG" htmlFor="rg">
            <TextInput
              id="rg"
              value={values.rg}
              onChange={(e) => set("rg", e.target.value)}
              placeholder="00.000.000-0"
            />
          </Field>
          <Field label="Naturalidade" htmlFor="naturalidade">
            <TextInput
              id="naturalidade"
              value={values.naturalidade}
              onChange={(e) => set("naturalidade", e.target.value)}
              placeholder="Cidade / UF"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Estado civil" htmlFor="estadoCivil">
            <SelectInput
              id="estadoCivil"
              value={values.estadoCivil}
              onChange={(e) => set("estadoCivil", e.target.value)}
            >
              <option value="">Selecione</option>
              {ESTADOS_CIVIS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Escolaridade" htmlFor="escolaridade">
            <SelectInput
              id="escolaridade"
              value={values.escolaridade}
              onChange={(e) => set("escolaridade", e.target.value)}
            >
              <option value="">Selecione</option>
              {ESCOLARIDADES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Profissão" htmlFor="profissao">
            <TextInput
              id="profissao"
              value={values.profissao}
              onChange={(e) => set("profissao", e.target.value)}
              placeholder="Ex.: Pedreiro"
            />
          </Field>
          <Field label="Religião" htmlFor="religiao">
            <TextInput
              id="religiao"
              value={values.religiao}
              onChange={(e) => set("religiao", e.target.value)}
              placeholder="Ex.: Católica"
            />
          </Field>
        </div>
      </fieldset>

      {/* Internação */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Internação
        </legend>

        <Field label="Modalidade" htmlFor="modalidade" required>
          <SelectInput
            id="modalidade"
            value={values.modalidade}
            onChange={(e) => set("modalidade", e.target.value as Modalidade)}
          >
            <option value="">Selecione uma modalidade</option>
            {MODALIDADES.map((m) => (
              <option key={m} value={m}>
                {m} — {MODALIDADE_INFO[m].descricao}
              </option>
            ))}
          </SelectInput>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Data de entrada" htmlFor="dataEntrada" required>
            <TextInput
              id="dataEntrada"
              type="date"
              value={values.dataEntrada}
              onChange={(e) => set("dataEntrada", e.target.value)}
            />
          </Field>
          <Field label="Previsão de alta" htmlFor="previsaoAlta" required>
            <TextInput
              id="previsaoAlta"
              type="date"
              value={values.previsaoAlta}
              onChange={(e) => set("previsaoAlta", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Leito" htmlFor="leito">
            <TextInput
              id="leito"
              value={values.leito}
              onChange={(e) => set("leito", e.target.value)}
              placeholder="Ex.: 204-A"
            />
          </Field>
          <Field label="Situação" htmlFor="situacao">
            <SelectInput
              id="situacao"
              value={values.situacao}
              onChange={(e) => set("situacao", e.target.value as AcolhidoFormValues["situacao"])}
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="alta">Alta</option>
            </SelectInput>
          </Field>
        </div>

        <Field label="Observações gerais" htmlFor="observacoes">
          <TextArea
            id="observacoes"
            value={values.observacoes}
            onChange={(e) => set("observacoes", e.target.value)}
            placeholder="Informações adicionais, histórico relevante, condições clínicas..."
          />
        </Field>
      </fieldset>

      {/* Contato */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Contato
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telefone" htmlFor="telefone" required>
            <TextInput
              id="telefone"
              value={values.telefone}
              onChange={(e) => set("telefone", formatPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              inputMode="tel"
            />
          </Field>
          <Field label="E-mail" htmlFor="email">
            <TextInput
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="exemplo@email.com"
            />
          </Field>
        </div>

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
            <Field label="Endereço" htmlFor="endereco">
              <TextInput
                id="endereco"
                value={values.endereco}
                onChange={(e) => set("endereco", e.target.value)}
                placeholder="Rua, número, complemento"
              />
            </Field>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Bairro" htmlFor="bairro">
            <TextInput
              id="bairro"
              value={values.bairro}
              onChange={(e) => set("bairro", e.target.value)}
              placeholder="Bairro"
            />
          </Field>
          <Field label="Cidade" htmlFor="cidade">
            <TextInput
              id="cidade"
              value={values.cidade}
              onChange={(e) => set("cidade", e.target.value)}
              placeholder="Cidade"
            />
          </Field>
          <Field label="UF" htmlFor="uf">
            <SelectInput
              id="uf"
              value={values.uf}
              onChange={(e) => set("uf", e.target.value)}
            >
              <option value="">UF</option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>
      </fieldset>

      {/* Responsável / familiar */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Responsável / familiar
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome completo" htmlFor="respNome">
            <TextInput
              id="respNome"
              value={values.respNome}
              onChange={(e) => set("respNome", e.target.value)}
              placeholder="Ex.: Maria da Silva"
            />
          </Field>
          <Field label="Grau de parentesco" htmlFor="respParentesco">
            <SelectInput
              id="respParentesco"
              value={values.respParentesco}
              onChange={(e) => set("respParentesco", e.target.value)}
            >
              <option value="">Selecione</option>
              {PARENTESCOS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telefone" htmlFor="respTelefone">
            <TextInput
              id="respTelefone"
              value={values.respTelefone}
              onChange={(e) => set("respTelefone", formatPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              inputMode="tel"
            />
          </Field>
          <Field label="Endereço" htmlFor="respEndereco">
            <TextInput
              id="respEndereco"
              value={values.respEndereco}
              onChange={(e) => set("respEndereco", e.target.value)}
              placeholder="Rua, número, bairro, cidade/UF"
            />
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
