import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type Props = {
  id: string
  children: React.ReactNode
}

export default function TaskItem({ id, children }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
    >
      <div 
        {...attributes}
        {...listeners}
        style={{
          cursor: "grab",
          userSelect: "none",
          marginBottom: "4px",
        }}
      >
        {children}
      </div>
      
    </div>
  )
}