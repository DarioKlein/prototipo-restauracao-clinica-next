"use client"

import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer"

/* Paleta do documento (react-pdf não entende classes do Tailwind) */
const RED = "#c0392b"
const INK = "#1f2937"
const MUTED = "#6b7280"
const LIGHT = "#9ca3af"
const BORDER = "#e5e7eb"
const CARD_BG = "#f9fafb"

export interface DocSecao {
  heading: string
  paragrafos?: string[]
  itens?: string[]
}

export interface DocIdentificacao {
  nome: string
  matricula: string
  idade: string
  leito: string
  cpf: string
  rg: string
  modalidade: string
  dataEntrada: string
  previsaoAlta: string
  status: string
}

export interface DocumentoData {
  titulo: string
  subtitulo: string
  geradoEm: string
  identificacao: DocIdentificacao
  secoes: DocSecao[]
  local: string
  assinatura?: { nome: string; cargo: string }
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
  body: { paddingHorizontal: 48, paddingTop: 28 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  clinicName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: RED, letterSpacing: 0.5 },
  clinicMeta: { fontSize: 8, color: MUTED, marginTop: 3 },
  geradoBox: { backgroundColor: CARD_BG, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 12, alignItems: "flex-end" },
  geradoLabel: { fontSize: 7, color: LIGHT, textTransform: "uppercase", letterSpacing: 1 },
  geradoValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: INK, marginTop: 3 },

  titulo: { fontSize: 22, fontFamily: "Helvetica-Bold", color: INK, marginTop: 30, lineHeight: 1.2 },
  subtitulo: { fontSize: 11, color: MUTED, marginTop: 8, lineHeight: 1.4 },
  divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginTop: 18, marginBottom: 18 },

  idCard: { borderWidth: 1, borderColor: BORDER, borderRadius: 8, padding: 14 },
  idLabel: { fontSize: 7, color: LIGHT, textTransform: "uppercase", letterSpacing: 1 },
  idName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: INK, marginTop: 3 },
  idSub: { fontSize: 9, color: MUTED, marginTop: 2 },
  idGrid: { flexDirection: "row", marginTop: 12 },
  idCol: { flex: 1 },
  idFieldLabel: { fontSize: 7, color: LIGHT, textTransform: "uppercase", letterSpacing: 0.8 },
  idFieldValue: { fontSize: 9.5, color: INK, marginTop: 2, marginBottom: 8 },

  section: { marginTop: 16 },
  sectionHeading: { fontSize: 9, fontFamily: "Helvetica-Bold", color: RED, textTransform: "uppercase", letterSpacing: 0.6 },
  sectionRule: { borderBottomWidth: 1.5, borderBottomColor: RED, width: 26, marginTop: 3, marginBottom: 8 },
  paragraph: { fontSize: 10, color: INK, marginBottom: 6, textAlign: "justify" },
  listItem: { flexDirection: "row", marginBottom: 5 },
  bullet: { width: 12, fontSize: 10, color: RED },
  listText: { flex: 1, fontSize: 10, color: INK },

  local: { fontSize: 10, color: INK, marginTop: 18 },

  signatureWrap: { marginTop: 46, alignItems: "center" },
  signatureLine: { borderTopWidth: 1, borderTopColor: INK, width: 240, marginBottom: 6 },
  signatureName: { fontSize: 10, fontFamily: "Helvetica-Bold", color: INK },
  signatureRole: { fontSize: 8.5, color: MUTED, marginTop: 2 },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
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

function IdField({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.idFieldLabel}>{label}</Text>
      <Text style={styles.idFieldValue}>{value}</Text>
    </View>
  )
}

export function DocumentoPDF({ data }: { data: DocumentoData }) {
  const { identificacao: id } = data
  return (
    <Document title={data.titulo} author="Clínica Restauração">
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
          <Text style={styles.titulo}>{data.titulo}</Text>
          <Text style={styles.subtitulo}>{data.subtitulo}</Text>
          <View style={styles.divider} />

          {/* Identificação */}
          <View style={styles.idCard}>
            <Text style={styles.idLabel}>Identificação do acolhido</Text>
            <Text style={styles.idName}>{id.nome}</Text>
            <Text style={styles.idSub}>
              Matrícula {id.matricula} · {id.idade} · Leito {id.leito}
            </Text>
            <View style={styles.idGrid}>
              <View style={styles.idCol}>
                <IdField label="CPF" value={id.cpf} />
                <IdField label="Data de entrada" value={id.dataEntrada} />
              </View>
              <View style={styles.idCol}>
                <IdField label="RG" value={id.rg} />
                <IdField label="Previsão de alta" value={id.previsaoAlta} />
              </View>
              <View style={styles.idCol}>
                <IdField label="Modalidade" value={id.modalidade} />
                <IdField label="Status" value={id.status} />
              </View>
            </View>
          </View>

          {/* Seções */}
          {data.secoes.map((sec, i) => (
            <View key={i} style={styles.section} wrap={false}>
              <Text style={styles.sectionHeading}>{sec.heading}</Text>
              <View style={styles.sectionRule} />
              {sec.paragrafos?.map((p, k) => (
                <Text key={k} style={styles.paragraph}>
                  {p}
                </Text>
              ))}
              {sec.itens?.map((item, k) => (
                <View key={k} style={styles.listItem}>
                  <Text style={styles.bullet}>{"\u2022"}</Text>
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* Local e data */}
          <Text style={styles.local}>{data.local}</Text>

          {/* Assinatura */}
          {data.assinatura && (
            <View style={styles.signatureWrap}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{data.assinatura.nome}</Text>
              <Text style={styles.signatureRole}>{data.assinatura.cargo}</Text>
            </View>
          )}
        </View>

        {/* Rodapé */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Documento gerado automaticamente pelo sistema Restauração.</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}
