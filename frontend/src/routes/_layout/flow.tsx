import { createFileRoute } from '@tanstack/react-router'
import { FlowCanvas } from '../../components/Nodes/FlowCanvas'

export const Route = createFileRoute('/_layout/flow')({
  component: RouteComponent,
})

function RouteComponent() {
  return <FlowCanvas />
}
