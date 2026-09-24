import { todayISO } from "@/lib/triagens"

/* -------------------------------------------------------------------------- */
/*  Tipos                                                                      */
/* -------------------------------------------------------------------------- */

export type ModalidadeCor = "sky" | "violet" | "emerald" | "amber" | "rose" | "slate"

export interface ModalidadeItem {
  id: string
  nome: string
  descricao: string
  /** Capacidade total de vagas oferecidas nesta modalidade. */
  vagas: number
  cor: ModalidadeCor
  /** Modalidades inativas não recebem novos acolhidos, mas mantêm o histórico. */
  ativa: boolean
  criadoEm: string // yyyy-mm-dd
}

/* -------------------------------------------------------------------------- */
/*  Paleta de cores das modalidades                                            */
/* -------------------------------------------------------------------------- */

export const MODALIDADE_CORES: Record<
  ModalidadeCor,
  { label: string; badge: string; icon: string; bar: string; track: string; dot: string; faixa: string }
> = {
  sky: {
    label: "Azul",
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    icon: "bg-sky-50 text-sky-600",
    bar: "bg-sky-500",
    track: "bg-sky-100",
    dot: "bg-sky-500",
    faixa: "border-l-sky-500",
  },
  violet: {
    label: "Violeta",
    badge: "border-violet-200 bg-violet-50 text-violet-700",
    icon: "bg-violet-50 text-violet-600",
    bar: "bg-violet-500",
    track: "bg-violet-100",
    dot: "bg-violet-500",
    faixa: "border-l-violet-500",
  },
  emerald: {
    label: "Verde",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: "bg-emerald-50 text-emerald-600",
    bar: "bg-emerald-500",
    track: "bg-emerald-100",
    dot: "bg-emerald-500",
    faixa: "border-l-emerald-500",
  },
  amber: {
    label: "Âmbar",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    icon: "bg-amber-50 text-amber-600",
    bar: "bg-amber-500",
    track: "bg-amber-100",
    dot: "bg-amber-500",
    faixa: "border-l-amber-500",
  },
  rose: {
    label: "Rosa",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    icon: "bg-rose-50 text-rose-600",
    bar: "bg-rose-500",
    track: "bg-rose-100",
    dot: "bg-rose-500",
    faixa: "border-l-rose-500",
  },
  slate: {
    label: "Cinza",
    badge: "border-slate-200 bg-slate-100 text-slate-600",
    icon: "bg-slate-100 text-slate-600",
    bar: "bg-slate-500",
    track: "bg-slate-200",
    dot: "bg-slate-400",
    faixa: "border-l-slate-500",
  },
}

export const MODALIDADE_COR_OPCOES: ModalidadeCor[] = ["sky", "violet", "emerald", "amber", "rose", "slate"]

/* -------------------------------------------------------------------------- */
/*  Seed determinístico (espelha as modalidades já usadas pelos acolhidos)     */
/* -------------------------------------------------------------------------- */

export function createSeedModalidades(): ModalidadeItem[] {
  return [
    {
      id: "mod-particular",
      nome: "Particular",
      descricao: "Internação custeada integralmente pela família do acolhido.",
      vagas: 12,
      cor: "sky",
      ativa: true,
      criadoEm: todayISO(),
    },
    {
      id: "mod-prefeitura",
      nome: "Prefeitura",
      descricao: "Vagas conveniadas com o município por meio de contrato público.",
      vagas: 10,
      cor: "violet",
      ativa: true,
      criadoEm: todayISO(),
    },
    {
      id: "mod-social",
      nome: "Social",
      descricao: "Vaga beneficente ou bolsa social para pessoas em vulnerabilidade.",
      vagas: 8,
      cor: "emerald",
      ativa: true,
      criadoEm: todayISO(),
    },
  ]
}

/* -------------------------------------------------------------------------- */
/*  Helpers de ocupação                                                        */
/* -------------------------------------------------------------------------- */

export interface OcupacaoModalidade {
  ocupadas: number
  disponiveis: number
  percentual: number // 0-100
  lotada: boolean
}

/** Calcula a ocupação de uma modalidade a partir do total de acolhidos ativos. */
export function calcularOcupacao(vagas: number, ocupadas: number): OcupacaoModalidade {
  const disponiveis = Math.max(0, vagas - ocupadas)
  const percentual = vagas > 0 ? Math.min(100, Math.round((ocupadas / vagas) * 100)) : 0
  return { ocupadas, disponiveis, percentual, lotada: ocupadas >= vagas && vagas > 0 }
}
