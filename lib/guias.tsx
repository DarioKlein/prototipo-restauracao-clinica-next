import React from "react"
import {
  ArrowLeft,
  CalendarPlus,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  FileText,
  LogOut,
  Pencil,
  Plus,
  Power,
  RefreshCcw,
  RotateCcw,
  Save,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react"
import type { Guia } from "@/components/ui/guia-drawer"

/* -------------------------------------------------------------------------- */
/*  Helpers de preview visual — clones miniatura dos elementos reais           */
/* -------------------------------------------------------------------------- */

/** Botão com contorno (estilo secundário) */
function BtnOutline({
  icon: Icon,
  label,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
      {Icon && <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}
      {label}
    </span>
  )
}

/** Botão sólido primário */
function BtnPrimary({
  icon: Icon,
  label,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
      {Icon && <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}
      {label}
    </span>
  )
}

/** Botão de perigo (vermelho) */
function BtnDanger({
  icon: Icon,
  label,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600">
      {Icon && <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />}
      {label}
    </span>
  )
}

/** Botão link (texto + ícone, sem fundo) */
function BtnLink({
  icon: Icon,
  label,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
      {label}
    </span>
  )
}

/** Ícone isolado dentro de um botão quadrado (ações de tabela) */
function IconBtn({ icon: Icon, danger }: { icon: React.ComponentType<{ className?: string }>; danger?: boolean }) {
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md border ${
        danger
          ? "border-rose-200 bg-rose-50 text-rose-500"
          : "border-border bg-background text-muted-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    </span>
  )
}

/** Badge de status com ponto colorido */
function StatusBadge({
  color,
  label,
}: {
  color: "green" | "amber" | "red" | "sky" | "violet" | "gray" | "blue" | "purple"
  label: string
}) {
  const styles: Record<string, { wrap: string; dot: string }> = {
    green:  { wrap: "bg-emerald-50 border-emerald-200 text-emerald-700", dot: "bg-emerald-500" },
    amber:  { wrap: "bg-amber-50 border-amber-200 text-amber-700",       dot: "bg-amber-500" },
    red:    { wrap: "bg-rose-50 border-rose-200 text-rose-700",           dot: "bg-rose-500" },
    sky:    { wrap: "bg-sky-50 border-sky-200 text-sky-700",              dot: "bg-sky-500" },
    violet: { wrap: "bg-violet-50 border-violet-200 text-violet-700",     dot: "bg-violet-500" },
    gray:   { wrap: "bg-zinc-100 border-zinc-200 text-zinc-600",          dot: "bg-zinc-400" },
    blue:   { wrap: "bg-blue-50 border-blue-200 text-blue-700",           dot: "bg-blue-500" },
    purple: { wrap: "bg-purple-50 border-purple-200 text-purple-700",     dot: "bg-purple-500" },
  }
  const s = styles[color]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.wrap}`}>
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.dot}`} />
      {label}
    </span>
  )
}

/** Badge de modalidade simples */
function ModalidadeBadge({ label, color }: { label: string; color: "blue" | "purple" | "green" }) {
  const styles = {
    blue:   "bg-sky-50 border-sky-200 text-sky-700",
    purple: "bg-violet-50 border-violet-200 text-violet-700",
    green:  "bg-emerald-50 border-emerald-200 text-emerald-700",
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[color]}`}>
      {label}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*  Guias                                                                      */
/* -------------------------------------------------------------------------- */

export const GUIA_DASHBOARD: Guia = {
  pagina: "Visão Geral",
  descricao: "Painel principal com os indicadores em tempo real da clínica.",
  secoes: [
    {
      titulo: "Cartões de indicadores",
      itens: [
        { nome: "Acolhidos ativos",       descricao: "Total de pessoas internadas no momento." },
        { nome: "Leitos disponíveis",     descricao: "Vagas abertas considerando todas as modalidades ativas." },
        { nome: "Triagens pendentes",     descricao: "Avaliações agendadas ou sem data que ainda não foram concluídas." },
        { nome: "Internações previstas",  descricao: "Triagens concluídas com internação programada nos próximos dias." },
        { nome: "Próximas altas",         descricao: "Acolhidos cuja previsão de alta está chegando ou já passou." },
      ],
    },
    {
      titulo: "Ações rápidas",
      itens: [
        {
          nome: "Novo acolhido",
          descricao: "Atalho para abrir o formulário de cadastro de um novo acolhido.",
          preview: <BtnPrimary icon={UserPlus} label="Novo acolhido" />,
        },
        {
          nome: "Nova triagem",
          descricao: "Atalho para registrar uma nova triagem de candidato à internação.",
          preview: <BtnPrimary icon={CalendarPlus} label="Nova triagem" />,
        },
        {
          nome: "Novo colaborador",
          descricao: "Atalho para cadastrar um novo membro da equipe.",
          preview: <BtnPrimary icon={UserPlus} label="Novo colaborador" />,
        },
      ],
    },
    {
      titulo: "Alertas de alta",
      itens: [
        { nome: "Lista de alertas", descricao: "Acolhidos que estão próximos da data de alta ou com alta vencida, para que a equipe tome as providências necessárias." },
        {
          nome: "Alta vencida",
          descricao: "A data de previsão de alta já passou e o acolhido ainda está internado.",
          preview: <StatusBadge color="red" label="Alta vencida" />,
        },
        {
          nome: "Próximo da alta",
          descricao: "A previsão de alta está dentro dos próximos 7 dias.",
          preview: <StatusBadge color="amber" label="Próximo da alta" />,
        },
      ],
    },
  ],
}

export const GUIA_ACOLHIDOS: Guia = {
  pagina: "Acolhidos",
  descricao: "Lista completa de todos os residentes da clínica, com filtros e ações rápidas.",
  secoes: [
    {
      titulo: "Cartões de resumo",
      itens: [
        { nome: "Total de acolhidos",  descricao: "Quantidade total de acolhidos cadastrados no sistema, incluindo inativos." },
        { nome: "Em tratamento",       descricao: "Acolhidos com internação ativa e dentro do prazo de alta." },
        { nome: "Próximo da alta",     descricao: "Internação ativa com data de alta chegando (até 7 dias)." },
        { nome: "Alta vencida",        descricao: "Data de alta já ultrapassada sem que a alta tenha sido registrada." },
      ],
    },
    {
      titulo: "Status dos acolhidos",
      itens: [
        { nome: "Em tratamento",  descricao: "Internação ativa dentro do prazo.",  preview: <StatusBadge color="green"  label="Em tratamento" /> },
        { nome: "Próximo da alta",descricao: "Alta prevista para os próximos 7 dias.", preview: <StatusBadge color="amber"  label="Próximo da alta" /> },
        { nome: "Alta vencida",   descricao: "Prazo de alta já passou.",           preview: <StatusBadge color="red"    label="Alta vencida" /> },
        { nome: "Alta concedida", descricao: "Alta já registrada no sistema.",      preview: <StatusBadge color="blue"   label="Alta concedida" /> },
        { nome: "Desligado",      descricao: "Saiu antes do prazo terapêutico.",    preview: <StatusBadge color="gray"   label="Desligado" /> },
      ],
    },
    {
      titulo: "Modalidades",
      itens: [
        { nome: "Particular",  descricao: "Acolhido com custeio próprio.",         preview: <ModalidadeBadge label="Particular" color="blue" /> },
        { nome: "Prefeitura",  descricao: "Vaga custeada pelo município.",          preview: <ModalidadeBadge label="Prefeitura" color="purple" /> },
        { nome: "Social",      descricao: "Vaga de caráter assistencial gratuita.", preview: <ModalidadeBadge label="Social" color="green" /> },
      ],
    },
    {
      titulo: "Ações por acolhido",
      itens: [
        {
          nome: "Ver prontuário",
          descricao: "Abre a página completa do acolhido com todos os dados, relatórios e documentos.",
          preview: <BtnOutline icon={Eye} label="Prontuário" />,
        },
        {
          nome: "Editar",
          descricao: "Abre o formulário para alterar os dados cadastrais do acolhido.",
          preview: <IconBtn icon={Pencil} />,
        },
        {
          nome: "Registrar alta",
          descricao: "Registra a saída terapêutica do acolhido, encerrando a internação.",
          preview: <IconBtn icon={LogOut} />,
        },
        {
          nome: "Inativar / Reativar",
          descricao: "Oculta ou reativa o acolhido nas listas sem excluir o histórico.",
          preview: <IconBtn icon={Power} />,
        },
        {
          nome: "Excluir",
          descricao: "Remove permanentemente o acolhido e todos os seus dados. Ação irreversível.",
          preview: <IconBtn icon={Trash2} danger />,
        },
      ],
    },
    {
      titulo: "Navegação",
      itens: [
        {
          nome: "Novo acolhido",
          descricao: "Abre o formulário para cadastrar um novo residente.",
          preview: <BtnPrimary icon={UserPlus} label="Novo acolhido" />,
        },
      ],
    },
  ],
}

export const GUIA_PRONTUARIO: Guia = {
  pagina: "Prontuário do Acolhido",
  descricao: "Registro completo de um acolhido: dados pessoais, relatórios clínicos, declarações e documentos.",
  secoes: [
    {
      titulo: "Cabeçalho do prontuário",
      itens: [
        {
          nome: "Voltar",
          descricao: "Retorna para a lista de acolhidos.",
          preview: <BtnLink icon={ArrowLeft} label="Voltar para acolhidos" />,
        },
        {
          nome: "Editar dados",
          descricao: "Abre o formulário de edição dos dados cadastrais e clínicos do acolhido.",
          preview: <BtnOutline icon={Pencil} label="Editar dados" />,
        },
        {
          nome: "Registrar alta",
          descricao: "Registra a saída terapêutica. O acolhido passa para o status 'Alta concedida'.",
          preview: <BtnPrimary icon={LogOut} label="Registrar alta" />,
        },
      ],
    },
    {
      titulo: "Faixa de informações",
      itens: [
        { nome: "Data de entrada",   descricao: "Data em que o acolhido deu entrada na clínica." },
        { nome: "Tempo internado",   descricao: "Quantos dias se passaram desde a entrada." },
        { nome: "Previsão de alta",  descricao: "Data estimada para a alta terapêutica." },
        { nome: "CPF",               descricao: "Documento de identificação do acolhido." },
        { nome: "Leito",             descricao: "Identificação do leito ocupado." },
      ],
    },
    {
      titulo: "Abas do prontuário",
      itens: [
        { nome: "Dados gerais",            descricao: "Informações completas de identificação, contato, responsável e dados clínicos de entrada." },
        { nome: "Relatórios médicos",      descricao: "Evoluções, anamneses, prescrições registradas pelo médico responsável." },
        { nome: "Relatórios sociais",      descricao: "Registros da assistente social: visitas, atendimentos e acompanhamento familiar." },
        { nome: "Relatórios psicológicos", descricao: "Sessões e evoluções registradas pela psicóloga." },
        { nome: "Relatórios de nutrição",  descricao: "Avaliações e acompanhamento nutricional." },
        { nome: "Declarações",             descricao: "Geração de declarações em PDF (internação, comparecimento, etc.)." },
        { nome: "Documentos",              descricao: "Emissão de documentos técnicos e acesso a todos os relatórios em PDF." },
      ],
    },
    {
      titulo: "Dentro de cada aba de relatório",
      itens: [
        {
          nome: "Novo relatório",
          descricao: "Abre o formulário para registrar uma nova evolução ou sessão.",
          preview: <BtnPrimary icon={Plus} label="Novo relatório" />,
        },
        {
          nome: "Expandir / Recolher",
          descricao: "Seta que abre ou fecha o conteúdo detalhado de cada relatório na lista.",
          preview: (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
              <span>expandir</span>
              <span className="text-border">/</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span>recolher</span>
            </span>
          ),
        },
        {
          nome: "Excluir relatório",
          descricao: "Remove o relatório permanentemente (ícone de lixeira no canto do card).",
          preview: <IconBtn icon={Trash2} danger />,
        },
      ],
    },
  ],
}

export const GUIA_TRIAGENS: Guia = {
  pagina: "Triagens",
  descricao: "Gerenciamento das avaliações de candidatos à internação, desde o agendamento até a conclusão.",
  secoes: [
    {
      titulo: "Abas principais",
      itens: [
        { nome: "Triagens ativas", descricao: "Candidatos aguardando avaliação: pendentes (sem data), agendados e atrasados." },
        { nome: "Histórico",       descricao: "Triagens já concluídas, em ordem mais recente primeiro." },
      ],
    },
    {
      titulo: "Status das triagens",
      itens: [
        { nome: "Pendente",  descricao: "Nenhuma data foi definida ainda.",                       preview: <StatusBadge color="gray"  label="Pendente" /> },
        { nome: "Agendada",  descricao: "Data e horário definidos, avaliação ainda não realizada.", preview: <StatusBadge color="sky"   label="Agendada" /> },
        { nome: "Atrasada",  descricao: "A data da triagem já passou sem ser concluída.",          preview: <StatusBadge color="red"   label="Atrasada" /> },
        { nome: "Concluída", descricao: "Avaliação realizada e registrada no sistema.",             preview: <StatusBadge color="green" label="Concluída" /> },
      ],
    },
    {
      titulo: "Ações por triagem",
      itens: [
        {
          nome: "Concluir",
          descricao: "Marca a triagem como realizada e a move para o histórico.",
          preview: <BtnPrimary icon={Check} label="Concluir" />,
        },
        {
          nome: "Reabrir",
          descricao: "Volta uma triagem concluída para o estado ativo (para corrigir registros).",
          preview: <BtnOutline icon={RotateCcw} label="Reabrir" />,
        },
        {
          nome: "Editar",
          descricao: "Altera os dados do candidato ou da triagem.",
          preview: <IconBtn icon={Pencil} />,
        },
        {
          nome: "Excluir",
          descricao: "Remove a triagem permanentemente.",
          preview: <IconBtn icon={Trash2} danger />,
        },
        {
          nome: "Nova triagem",
          descricao: "Cadastra um novo candidato para avaliação.",
          preview: <BtnPrimary icon={CalendarPlus} label="Nova triagem" />,
        },
      ],
    },
  ],
}

export const GUIA_TRIAGEM_DETALHE: Guia = {
  pagina: "Detalhe da Triagem",
  descricao: "Página individual de uma triagem: dados do candidato, agendamento e documentação da avaliação.",
  secoes: [
    {
      titulo: "Cabeçalho",
      itens: [
        {
          nome: "Voltar",
          descricao: "Retorna para a lista de triagens.",
          preview: <BtnLink icon={ArrowLeft} label="Voltar para triagens" />,
        },
        {
          nome: "Editar",
          descricao: "Habilita a edição dos dados da triagem (só disponível se não estiver concluída).",
          preview: <BtnOutline icon={Pencil} label="Editar" />,
        },
        {
          nome: "Remover",
          descricao: "Exclui a triagem permanentemente.",
          preview: <BtnDanger icon={Trash2} label="Remover" />,
        },
        {
          nome: "Concluir triagem",
          descricao: "Registra a triagem como realizada. Após concluída, os dados ficam bloqueados.",
          preview: <BtnPrimary icon={Check} label="Concluir triagem" />,
        },
        {
          nome: "Reabrir triagem",
          descricao: "Desfaz a conclusão e permite editar novamente (visível só em triagens concluídas).",
          preview: <BtnOutline icon={RotateCcw} label="Reabrir triagem" />,
        },
      ],
    },
    {
      titulo: "Card de identificação",
      itens: [
        { nome: "Dados do candidato", descricao: "Nome, CPF, telefone e responsável pela triagem." },
        { nome: "Agendamento",        descricao: "Data, horário e local definidos para a avaliação presencial." },
        { nome: "Rótulo de dia",      descricao: "Exibe 'Hoje', 'Amanhã', 'Ontem' ou a data formatada para facilitar a leitura." },
      ],
    },
    {
      titulo: "Documentação da avaliação",
      itens: [
        { nome: "Área de texto", descricao: "Campo livre para registrar o conteúdo da avaliação, histórico e observações clínicas." },
        {
          nome: "Editar documentação",
          descricao: "Habilita o campo de texto para edição.",
          preview: <BtnOutline icon={Pencil} label="Editar documentação" />,
        },
        {
          nome: "Salvar documentação",
          descricao: "Confirma e salva o texto digitado.",
          preview: <BtnPrimary icon={Save} label="Salvar" />,
        },
        {
          nome: "Cancelar",
          descricao: "Descarta as alterações não salvas e volta ao modo de leitura.",
          preview: <BtnOutline icon={X} label="Cancelar" />,
        },
      ],
    },
  ],
}

export const GUIA_COLABORADORES: Guia = {
  pagina: "Colaboradores",
  descricao: "Cadastro e gestão de todos os membros da equipe da clínica.",
  secoes: [
    {
      titulo: "Cartões de resumo",
      itens: [
        { nome: "Total",    descricao: "Quantidade total de colaboradores cadastrados." },
        { nome: "Ativos",   descricao: "Colaboradores que estão em exercício." },
        { nome: "Inativos", descricao: "Colaboradores afastados ou desligados, mantidos para histórico." },
      ],
    },
    {
      titulo: "Ações por colaborador",
      itens: [
        {
          nome: "Editar",
          descricao: "Abre a página de edição do colaborador.",
          preview: <IconBtn icon={Pencil} />,
        },
        {
          nome: "Ativar / Inativar",
          descricao: "Alterna o status do colaborador sem excluí-lo do sistema.",
          preview: <IconBtn icon={Power} />,
        },
        {
          nome: "Excluir",
          descricao: "Remove permanentemente o colaborador. Ação irreversível.",
          preview: <IconBtn icon={Trash2} danger />,
        },
      ],
    },
    {
      titulo: "Navegação",
      itens: [
        {
          nome: "Novo colaborador",
          descricao: "Abre o formulário de cadastro de um novo membro da equipe.",
          preview: <BtnPrimary icon={UserPlus} label="Novo colaborador" />,
        },
      ],
    },
  ],
}

export const GUIA_MODALIDADES: Guia = {
  pagina: "Modalidades",
  descricao: "Controle das formas de internação e vagas disponíveis por modalidade de convênio.",
  secoes: [
    {
      titulo: "Painel de vagas",
      itens: [
        { nome: "Total de vagas",          descricao: "Soma de todas as vagas das modalidades ativas." },
        { nome: "Ocupadas",                descricao: "Vagas com acolhidos ativos internados no momento." },
        { nome: "Disponíveis",             descricao: "Vagas abertas para novas internações." },
        { nome: "Modalidades inativas",    descricao: "Modalidades desativadas temporariamente (não contam para o total)." },
      ],
    },
    {
      titulo: "Card de modalidade",
      itens: [
        { nome: "Barra de ocupação", descricao: "Barra visual que mostra quantas vagas estão ocupadas em relação ao total." },
        {
          nome: "Editar",
          descricao: "Permite alterar o nome e a quantidade de vagas da modalidade.",
          preview: <IconBtn icon={Pencil} />,
        },
        {
          nome: "Ativar / Desativar",
          descricao: "Desativa temporariamente a modalidade sem excluí-la.",
          preview: <IconBtn icon={Power} />,
        },
        {
          nome: "Excluir",
          descricao: "Remove a modalidade. Só é possível se não houver acolhidos vinculados.",
          preview: <IconBtn icon={Trash2} danger />,
        },
      ],
    },
    {
      titulo: "Ações gerais",
      itens: [
        {
          nome: "Nova modalidade",
          descricao: "Cria uma nova forma de internação com nome e quantidade de vagas.",
          preview: <BtnPrimary icon={Plus} label="Nova modalidade" />,
        },
      ],
    },
  ],
}

export const GUIA_RELATORIOS: Guia = {
  pagina: "Relatórios",
  descricao: "Painel analítico com indicadores gerenciais, gráficos e série histórica de movimentação.",
  secoes: [
    {
      titulo: "Ações",
      itens: [
        {
          nome: "Exportar PDF",
          descricao: "Gera e baixa um PDF completo do relatório com todos os indicadores e gráficos do período selecionado.",
          preview: <BtnPrimary icon={Download} label="Exportar PDF" />,
        },
      ],
    },
    {
      titulo: "Filtros do painel",
      itens: [
        { nome: "Período",              descricao: "Define o intervalo de análise: últimos 3, 6 ou 12 meses, ou o ano atual." },
        { nome: "Convênio / Modalidade",descricao: "Restringe os dados a uma modalidade específica (Particular, Prefeitura, Social)." },
        { nome: "Programa",             descricao: "Filtra por programa terapêutico quando aplicável." },
      ],
    },
    {
      titulo: "Cartões de KPI",
      itens: [
        { nome: "Acolhidos ativos",     descricao: "Total de internações ativas no período." },
        { nome: "Entradas no período",  descricao: "Novos acolhidos que entraram na clínica." },
        { nome: "Saídas no período",    descricao: "Altas e desligamentos registrados." },
        { nome: "Saldo líquido",        descricao: "Diferença entre entradas e saídas (positivo = crescimento)." },
        { nome: "Permanência média",    descricao: "Média de dias de internação no período." },
        { nome: "Receita estimada",     descricao: "Soma das diárias de todos os acolhidos no período." },
      ],
    },
    {
      titulo: "Gráficos",
      itens: [
        { nome: "Entradas × Saídas",       descricao: "Barras mensais comparando novos acolhidos e saídas." },
        { nome: "Ocupação de leitos",       descricao: "Linha com a evolução da taxa de ocupação ao longo do período." },
        { nome: "Receita estimada",         descricao: "Barras com a receita mês a mês." },
        { nome: "Distribuições (rosca)",    descricao: "Proporção por convênio, programa e motivo de saída." },
        { nome: "Tabela de série histórica",descricao: "Tabela com entradas, saídas, saldo, ocupação e receita de cada mês." },
      ],
    },
  ],
}

export const GUIA_DOCUMENTOS: Guia = {
  pagina: "Documentos",
  descricao: "Central de emissão de documentos técnicos e relatórios clínicos por acolhido.",
  secoes: [
    {
      titulo: "Seleção do acolhido",
      itens: [
        { nome: "Busca",           descricao: "Encontre o acolhido por nome, matrícula ou CPF." },
        { nome: "Filtro de modalidade", descricao: "Restringe a lista por Particular, Prefeitura ou Social." },
        { nome: "Filtro de status",     descricao: "Filtra pelo estado clínico do acolhido." },
        {
          nome: "Card do acolhido",
          descricao: "Clique no card para selecionar o acolhido e acessar seus documentos.",
          preview: <BtnOutline icon={ChevronRight} label="Selecionar acolhido" />,
        },
        {
          nome: "Trocar acolhido",
          descricao: "Volta para a lista para escolher outro acolhido.",
          preview: <BtnOutline icon={RefreshCcw} label="Trocar acolhido" />,
        },
      ],
    },
    {
      titulo: "Categorias de conteúdo",
      itens: [
        { nome: "Documentos técnicos",       descricao: "Emissão de Termo de internação, Laudo de alta e Relatório multiprofissional em PDF." },
        { nome: "Relatórios médicos",         descricao: "Visualização e redação dos relatórios do médico responsável." },
        { nome: "Relatórios sociais",         descricao: "Registros da assistente social." },
        { nome: "Relatórios psicológicos",    descricao: "Sessões e evoluções da psicóloga." },
        { nome: "Relatórios de nutrição",     descricao: "Acompanhamento nutricional do acolhido." },
      ],
    },
    {
      titulo: "Emissão de documentos",
      itens: [
        {
          nome: "Gerar PDF",
          descricao: "Baixa o documento em formato PDF no seu computador.",
          preview: <BtnPrimary icon={Download} label="Gerar PDF" />,
        },
        {
          nome: "Voltar",
          descricao: "Retorna para a lista de tipos de documento.",
          preview: <BtnLink icon={ArrowLeft} label="Voltar" />,
        },
        { nome: "Histórico de emissões", descricao: "Registro dos documentos já gerados para o acolhido, com data e horário." },
      ],
    },
  ],
}

export const GUIA_DECLARACOES: Guia = {
  pagina: "Declarações",
  descricao: "Emissão de declarações oficiais em PDF para acolhidos, como internação e comparecimento.",
  secoes: [
    {
      titulo: "Seleção do acolhido",
      itens: [
        { nome: "Busca de acolhido", descricao: "Digite o nome, matrícula ou CPF para localizar o acolhido." },
        {
          nome: "Card do acolhido",
          descricao: "Clique para selecionar o acolhido para quem será emitida a declaração.",
          preview: <BtnOutline icon={ChevronRight} label="Selecionar acolhido" />,
        },
      ],
    },
    {
      titulo: "Tipos de declaração",
      itens: [
        { nome: "Card de declaração", descricao: "Clique no tipo de declaração desejado para ver a pré-visualização em PDF." },
        { nome: "Pré-visualização",   descricao: "Exibe o documento formatado antes de baixar, já preenchido com os dados do acolhido." },
        {
          nome: "Gerar PDF",
          descricao: "Baixa a declaração em PDF no seu dispositivo.",
          preview: <BtnPrimary icon={Download} label="Gerar PDF" />,
        },
        {
          nome: "Voltar",
          descricao: "Retorna para a lista de declarações disponíveis.",
          preview: <BtnLink icon={ArrowLeft} label="Voltar" />,
        },
      ],
    },
    {
      titulo: "Histórico",
      itens: [
        { nome: "Histórico de emissões", descricao: "Lista das declarações já geradas para o acolhido selecionado, com tipo e data de emissão." },
      ],
    },
  ],
}
