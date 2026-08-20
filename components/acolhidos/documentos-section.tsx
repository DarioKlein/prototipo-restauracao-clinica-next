"use client"

import type { Acolhido } from "@/lib/acolhidos"
import { DocumentosView } from "@/components/documentos/documentos-view"

/** Aba "Documentos" do prontuário — reaproveita o mesmo motor da página global de Documentos. */
export function DocumentosSection({ acolhido }: { acolhido: Acolhido }) {
  return <DocumentosView acolhidoFixo={acolhido} />
}
