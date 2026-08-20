"use client"

import { PDFViewer } from "@react-pdf/renderer"
import { DocumentoPDF, type DocumentoData } from "@/components/acolhidos/pdf/documento-pdf"

/**
 * Motor de pré-visualização único, compartilhado por declarações e documentos:
 * ambos os fluxos produzem um `DocumentoData` e renderizam pelo mesmo `DocumentoPDF`.
 */
export default function DocumentoPreview({ data }: { data: DocumentoData }) {
  return (
    <PDFViewer showToolbar={false} className="h-full w-full border-0" style={{ width: "100%", height: "100%" }}>
      <DocumentoPDF data={data} />
    </PDFViewer>
  )
}
