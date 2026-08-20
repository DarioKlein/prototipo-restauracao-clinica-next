"use client"

import { User2, Phone, Users, BedDouble, FileText } from "lucide-react"
import {
  type Acolhido,
  formatLongDate,
  formatNumericDate,
  calcAge,
} from "@/lib/acolhidos"

function Card({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border bg-primary/5 px-5 py-3.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{children || "—"}</dd>
    </div>
  )
}

export function DadosGerais({ acolhido }: { acolhido: Acolhido }) {
  const idade = calcAge(acolhido.dataNascimento)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card icon={User2} title="Dados pessoais" description="Identificação e informações básicas">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Item label="Nome completo">{acolhido.nome}</Item>
            <Item label="Data de nascimento">
              {formatLongDate(acolhido.dataNascimento)}
              {idade !== null ? ` (${idade} anos)` : ""}
            </Item>
            <Item label="CPF">{acolhido.cpf}</Item>
            <Item label="RG">{acolhido.rg}</Item>
            <Item label="Naturalidade">{acolhido.naturalidade}</Item>
            <Item label="Estado civil">{acolhido.estadoCivil}</Item>
            <Item label="Escolaridade">{acolhido.escolaridade}</Item>
            <Item label="Profissão">{acolhido.profissao}</Item>
            <Item label="Religião">{acolhido.religiao}</Item>
          </dl>
        </Card>

        <Card icon={Phone} title="Contato" description="Endereço e formas de contato direto">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Item label="CEP">{acolhido.cep}</Item>
            <Item label="Endereço">{acolhido.endereco}</Item>
            <Item label="Bairro">{acolhido.bairro}</Item>
            <Item label="Cidade">{acolhido.cidade}</Item>
            <Item label="UF">{acolhido.uf}</Item>
            <Item label="Telefone">{acolhido.telefone}</Item>
            <Item label="E-mail">{acolhido.email}</Item>
          </dl>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card icon={Users} title="Responsável / familiar" description="Contato de emergência e responsável legal">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Item label="Nome">{acolhido.respNome}</Item>
            <Item label="Grau de parentesco">{acolhido.respParentesco}</Item>
            <Item label="Telefone">{acolhido.respTelefone}</Item>
            <Item label="Endereço">{acolhido.respEndereco}</Item>
          </dl>
        </Card>

        <Card icon={BedDouble} title="Internação" description="Dados do processo de internação atual">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Item label="Data de entrada">{formatNumericDate(acolhido.dataEntrada)}</Item>
            <Item label="Previsão de alta">{formatNumericDate(acolhido.previsaoAlta)}</Item>
            <Item label="Modalidade">{acolhido.modalidade}</Item>
            <Item label="Leito">{acolhido.leito}</Item>
          </dl>
        </Card>
      </div>

      <Card icon={FileText} title="Observações gerais" description="Notas adicionais registradas no cadastro">
        <p className="text-sm leading-relaxed text-foreground">
          {acolhido.observacoes || "Nenhuma observação registrada."}
        </p>
      </Card>
    </div>
  )
}
