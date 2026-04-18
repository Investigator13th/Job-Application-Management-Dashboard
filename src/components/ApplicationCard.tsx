import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Application } from '@/types/application'
import { getDeadlineMeta } from '@/lib/deadlines'

interface ApplicationCardProps {
  application: Application
  isDragging?: boolean
  onDelete?: (application: Application) => void
  onEdit?: (application: Application) => void
}

export function ApplicationCard({ application, isDragging = false, onDelete, onEdit }: ApplicationCardProps) {
  const deadlineMeta = getDeadlineMeta(application.next_deadline)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: application.id,
    data: {
      application,
      stage: application.stage,
      type: 'application',
    },
  })

  return (
    <article
      {...attributes}
      {...listeners}
      className={`application-card${isDragging ? ' application-card--dragging' : ''}`}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="application-card__header">
        <h3>{application.company_name}</h3>
        <span>{application.stage}</span>
      </div>
      <p className="application-card__job">{application.job_title}</p>
      <p className={`application-card__meta application-card__meta--${deadlineMeta.status}`}>
        DDL：{deadlineMeta.label}
      </p>
      {onEdit || onDelete ? (
        <div className="application-card__actions">
          {onEdit ? (
            <button
              className="text-button"
              onClick={() => onEdit(application)}
              onPointerDown={(event) => event.stopPropagation()}
              type="button"
            >
              编辑
            </button>
          ) : null}
          {onDelete ? (
            <button
              className="text-button application-card__delete"
              onClick={() => onDelete(application)}
              onPointerDown={(event) => event.stopPropagation()}
              type="button"
            >
              删除
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
