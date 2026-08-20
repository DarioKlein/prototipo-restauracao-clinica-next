"use client"

import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer"

/* Paleta (react-pdf não entende classes do Tailwind) */
const RED = "#c0392b"
const INK = "#1f2937"
const MUTED = "#6b7280"
const LIGHT = "#9ca3af"
const BORDER = "#e5e7eb"
const CARD_BG = "#f9fafb"

export interface RelatorioKPI {
  label: string
  valor: string
}

export interface RelatorioLinha {
  label: string
  entradas: string
  saidas: string
  saldo: string
  ativos: string
  receita: string
}

export interface RelatorioDistribuicao {
  nome: string
  valor: string
  percentual: string
  cor: string
}

export interface RelatorioData {
  geradoEm: string
  periodo: string
  filtros: { label: string; valor: string }[]
  kpis: RelatorioKPI[]
  serie: RelatorioLinha[]
  totais: RelatorioLinha
  porConvenio: RelatorioDistribuicao[]
  porPrograma: RelatorioDistribuicao[]
  porMotivo: RelatorioDistribuicao[]
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 56,
    paddingHorizontal: 0,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: INK,
    lineHeight: 1.5,
  },
  topBar: { height: 6, backgroundColor: RED, width: "100%" },
  body: { paddingHorizontal: 40, paddingTop: 26 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  clinicName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: RED, letterSpacing: 0.5 },
  clinicMeta: { fontSize: 8, color: MUTED, marginTop: 3 },
  geradoBox: { backgroundColor: CARD_BG, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 12, alignItems: "flex-end" },
  geradoLabel: { fontSize: 7, color: LIGHT, textTransform: "uppercase", letterSpacing: 1 },
  geradoValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: INK, marginTop: 3 },

  titulo: { fontSize: 22, fontFamily: "Helvetica-Bold", color: INK, marginTop: 26, lineHeight: 1.2 },
  subtitulo: { fontSize: 11, color: MUTED, marginTop: 6, lineHeight: 1.2 },
  divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginTop: 16, marginBottom: 16 },

  filtrosRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4 },
  filtroChip: {
    backgroundColor: CARD_BG,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  filtroLabel: { fontSize: 6.5, color: LIGHT, textTransform: "uppercase", letterSpacing: 0.8 },
  filtroValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: INK, marginTop: 1 },

  sectionHeading: { fontSize: 9, fontFamily: "Helvetica-Bold", color: RED, textTransform: "uppercase", letterSpacing: 0.6, marginTop: 18 },
  sectionRule: { borderBottomWidth: 1.5, borderBottomColor: RED, width: 26, marginTop: 3, marginBottom: 10 },

  kpiGrid: { flexDirection: "row", flexWrap: "wrap" },
  kpiCard: {
    width: "25%",
    padding: 4,
  },
  kpiInner: { borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 8 },
  kpiLabel: { fontSize: 7, color: LIGHT, textTransform: "uppercase", letterSpacing: 0.6 },
  kpiValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: INK, marginTop: 3 },

  table: { borderWidth: 1, borderColor: BORDER, borderRadius: 6, overflow: "hidden" },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  trLast: { flexDirection: "row" },
  th: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, padding: 6 },
  td: { fontSize: 9, color: INK, padding: 6 },
  thead: { backgroundColor: CARD_BG },
  totalRow: { backgroundColor: "#fdf2f0" },
  cMes: { width: "28%" },
  cNum: { width: "14.4%", textAlign: "right" },

  distRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  distDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  distNome: { flex: 1, fontSize: 9, color: INK },
  distValor: { fontSize: 9, fontFamily: "Helvetica-Bold", color: INK, width: 40, textAlign: "right" },
  distPct: { fontSize: 8, color: MUTED, width: 44, textAlign: "right" },

  twoCol: { flexDirection: "row", gap: 16 },
  col: { flex: 1 },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
  footerText: { fontSize: 7.5, color: LIGHT },
})

const CLINICA_META = {
  nome: "CLÍNICA RESTAURAÇÃO",
  linha1: "Comunidade Terapêutica · CNPJ 00.000.000/0001-00",
  linha2: "Rua das Flores, 1280 · Belo Horizonte/MG · (31) 3000-0000",
}

function Distribuicao({ titulo, itens }: { titulo: string; itens: RelatorioDistribuicao[] }) {
  return (
    <View style={styles.col}>
      <Text style={styles.sectionHeading}>{titulo}</Text>
      <View style={styles.sectionRule} />
      {itens.length === 0 ? (
        <Text style={{ fontSize: 9, color: MUTED }}>Sem registros no período.</Text>
      ) : (
        itens.map((d, i) => (
          <View key={i} style={styles.distRow}>
            <View style={[styles.distDot, { backgroundColor: d.cor }]} />
            <Text style={styles.distNome}>{d.nome}</Text>
            <Text style={styles.distValor}>{d.valor}</Text>
            <Text style={styles.distPct}>{d.percentual}</Text>
          </View>
        ))
      )}
    </View>
  )
}

export function RelatorioPDF({ data }: { data: RelatorioData }) {
  return (
    <Document title="Relatório gerencial" author="Clínica Restauração">
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} fixed />
        <View style={styles.body}>
          {/* Cabeçalho */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.clinicName}>{CLINICA_META.nome}</Text>
              <Text style={styles.clinicMeta}>{CLINICA_META.linha1}</Text>
              <Text style={styles.clinicMeta}>{CLINICA_META.linha2}</Text>
            </View>
            <View style={styles.geradoBox}>
              <Text style={styles.geradoLabel}>Gerado em</Text>
              <Text style={styles.geradoValue}>{data.geradoEm}</Text>
            </View>
          </View>

          {/* Título */}
          <Text style={styles.titulo}>Relatório gerencial</Text>
          <Text style={styles.subtitulo}>{data.periodo}</Text>
          <View style={styles.divider} />

          {/* Filtros aplicados */}
          <View style={styles.filtrosRow}>
            {data.filtros.map((f, i) => (
              <View key={i} style={styles.filtroChip}>
                <Text style={styles.filtroLabel}>{f.label}</Text>
                <Text style={styles.filtroValue}>{f.valor}</Text>
              </View>
            ))}
          </View>

          {/* Indicadores */}
          <Text style={styles.sectionHeading}>Indicadores do período</Text>
          <View style={styles.sectionRule} />
          <View style={styles.kpiGrid}>
            {data.kpis.map((k, i) => (
              <View key={i} style={styles.kpiCard}>
                <View style={styles.kpiInner}>
                  <Text style={styles.kpiLabel}>{k.label}</Text>
                  <Text style={styles.kpiValue}>{k.valor}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Tabela mensal */}
          <Text style={styles.sectionHeading}>Movimentação mês a mês</Text>
          <View style={styles.sectionRule} />
          <View style={styles.table}>
            <View style={[styles.tr, styles.thead]}>
              <Text style={[styles.th, styles.cMes]}>Mês</Text>
              <Text style={[styles.th, styles.cNum]}>Entradas</Text>
              <Text style={[styles.th, styles.cNum]}>Saídas</Text>
              <Text style={[styles.th, styles.cNum]}>Saldo</Text>
              <Text style={[styles.th, styles.cNum]}>Ativos</Text>
              <Text style={[styles.th, styles.cNum]}>Receita</Text>
            </View>
            {data.serie.map((l, i) => (
              <View key={i} style={styles.tr} wrap={false}>
                <Text style={[styles.td, styles.cMes]}>{l.label}</Text>
                <Text style={[styles.td, styles.cNum]}>{l.entradas}</Text>
                <Text style={[styles.td, styles.cNum]}>{l.saidas}</Text>
                <Text style={[styles.td, styles.cNum]}>{l.saldo}</Text>
                <Text style={[styles.td, styles.cNum]}>{l.ativos}</Text>
                <Text style={[styles.td, styles.cNum]}>{l.receita}</Text>
              </View>
            ))}
            <View style={[styles.trLast, styles.totalRow]} wrap={false}>
              <Text style={[styles.td, styles.cMes, { fontFamily: "Helvetica-Bold" }]}>{data.totais.label}</Text>
              <Text style={[styles.td, styles.cNum, { fontFamily: "Helvetica-Bold" }]}>{data.totais.entradas}</Text>
              <Text style={[styles.td, styles.cNum, { fontFamily: "Helvetica-Bold" }]}>{data.totais.saidas}</Text>
              <Text style={[styles.td, styles.cNum, { fontFamily: "Helvetica-Bold" }]}>{data.totais.saldo}</Text>
              <Text style={[styles.td, styles.cNum, { fontFamily: "Helvetica-Bold" }]}>{data.totais.ativos}</Text>
              <Text style={[styles.td, styles.cNum, { fontFamily: "Helvetica-Bold" }]}>{data.totais.receita}</Text>
            </View>
          </View>

          {/* Distribuições */}
          <View style={styles.twoCol} wrap={false}>
            <Distribuicao titulo="Entradas por convênio" itens={data.porConvenio} />
            <Distribuicao titulo="Entradas por programa" itens={data.porPrograma} />
          </View>
          <View style={styles.twoCol} wrap={false}>
            <Distribuicao titulo="Saídas por motivo" itens={data.porMotivo} />
          </View>
        </View>

        {/* Rodapé */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Relatório gerado automaticamente pelo sistema Restauração.</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}
