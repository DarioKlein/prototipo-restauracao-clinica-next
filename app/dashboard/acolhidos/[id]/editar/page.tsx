import { use } from "react"
import { redirect } from "next/navigation"

export default function EditarAcolhidoLegacyRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  redirect(`/dashboard/acolhidos/${id}?edit=1`)
}
