import { getUrgentApplications } from '@/lib/deadlines'
import type { Application } from '@/types/application'

interface DeadlinePanelProps {
  applications: Application[]
}

export function DeadlinePanel({ applications }: DeadlinePanelProps) {
  const urgentItems = getUrgentApplications(applications, 5)

  return (
    <section className="hero-card deadline-panel" aria-label="临近截止">
      <div className="deadline-panel__header">
        <div>
          <p className="section-label">临近截止</p>
          <h2>优先处理申请</h2>
        </div>
        <p className="deadline-panel__desc">
          {urgentItems.length > 0 ? `你有 ${urgentItems.length} 项任务需要紧急处理` : '暂无需要紧急处理的任务'}
        </p>
      </div>

      {urgentItems.length === 0 ? (
        <div className="deadline-panel__empty">当前没有临近或已过期的申请，继续保持。</div>
      ) : (
        <div className="deadline-panel__list">
          {urgentItems.map(({ application, deadline }) => (
            <article className="deadline-panel__item" key={application.id}>
              <div>
                <p className="deadline-panel__company">{application.company_name}</p>
                <p className="deadline-panel__job">{application.job_title}</p>
              </div>
              <div className="deadline-panel__meta">
                <span className={`deadline-badge deadline-badge--${deadline.status}`}>{deadline.toneLabel}</span>
                <span className="deadline-panel__date">{deadline.label}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
