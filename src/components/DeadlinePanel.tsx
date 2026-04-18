import { getUrgentApplications } from '@/lib/deadlines'
import type { Application } from '@/types/application'

interface DeadlinePanelProps {
  applications: Application[]
}

export function DeadlinePanel({ applications }: DeadlinePanelProps) {
  const urgentItems = getUrgentApplications(applications, 5)

  return (
    <section className="hero-card deadline-panel" aria-label="临近 DDL 提示区">
      <div>
        <p className="section-label">T5 DDL 提示</p>
        <h2>优先处理这些申请</h2>
        <p className="page-description">按截止时间排序，优先展示已过期和未来 3 天内即将截止的申请。</p>
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
