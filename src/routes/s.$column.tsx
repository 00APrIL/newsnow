import { createFileRoute, redirect } from "@tanstack/react-router"
import { columnIds } from "@shared/metadata"
import { Column } from "~/components/column"

export const Route = createFileRoute("/s/$column")({
  component: SectionComponent,
  params: {
    parse: (params) => {
      const column = columnIds.find(x => x === params.column.toLowerCase())
      if (!column)
        throw new Error(`"${params.column}" is not a valid column.`)
      return {
        column,
      }
    },
    stringify: params => params,
  },
  onError: (error) => {
    if (error?.routerCode === "PARSE_PARAMS") {
      throw redirect({ to: "/" })
    }
  },
})

function SectionComponent() {
  const { column } = Route.useParams()
  return <Column id={column} />
}
