import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getDeadlineMeta } from '@/lib/deadlines'
import {
  APPLICATION_RESULT_STATUS_LABELS,
  type Application,
} from '@/types/application'

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
      <div className="application-card__status-row">
        <span className={`result-status-badge result-status-badge--${application.result_status}`}>
          {APPLICATION_RESULT_STATUS_LABELS[application.result_status]}
        </span>
        {application.notes?.trim() ? <span className="note-badge">有笔记</span> : null}
        <p className={`application-card__meta application-card__meta--${deadlineMeta.status}`}>
          DDL：{deadlineMeta.label}
        </p>
      </div>
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
