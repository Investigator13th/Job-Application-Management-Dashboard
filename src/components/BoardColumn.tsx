import { useDroppable } from '@dnd-kit/core'
import type { ReactNode } from 'react'
import type { ApplicationStage } from '@/types/application'

interface BoardColumnProps {
  count: number
  children: ReactNode
  isOver?: boolean
  stage: ApplicationStage
}

export function BoardColumn({ count, children, isOver = false, stage }: BoardColumnProps) {
  const { isOver: droppableIsOver, setNodeRef } = useDroppable({
    id: stage,
    data: {
      stage,
      type: 'column',
    },
  })

  const activeDrop = isOver || droppableIsOver

  return (
    <article className={`board-column${activeDrop ? ' board-column--over' : ''}`} ref={setNodeRef}>
      <div className="column-header">
        <h2>{stage}</h2>
        <span>{count}</span>
      </div>
      <div className="column-body">{children}</div>
    </article>
  )
}
