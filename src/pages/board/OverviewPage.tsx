import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DeadlinePanel, StatsPanel } from '@/components'
import { ROUTES } from '@/constants/routes'
import { useApplications } from '@/hooks'
import { getUrgentApplications } from '@/lib/deadlines'
import { computeApplicationStats } from '@/lib/statistics'
import { APPLICATION_RESULT_STATUS_LABELS } from '@/types/application'

const REMINDER_SESSION_KEY = 'job-board:urgent-reminder-dismissed'

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function OverviewPage() {
  const { applications, errorMessage, isLoading } = useApplications()
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.sessionStorage.getItem(REMINDER_SESSION_KEY) !== 'true'
  })

  const stats = useMemo(() => computeApplicationStats(applications), [applications])
  const urgentApplications = useMemo(() => getUrgentApplications(applications, 5), [applications])
  const recentApplications = useMemo(() => (
    [...applications]
      .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
      .slice(0, 5)
  ), [applications])
  const recentUpdates = useMemo(() => (
    [...applications]
      .sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime())
      .slice(0, 5)
  ), [applications])

  function handleReminderClose() {
    window.sessionStorage.setItem(REMINDER_SESSION_KEY, 'true')
    setIsReminderModalOpen(false)
  }

  return (
    <>
      {isReminderModalOpen && urgentApplications.length > 0 ? (
        <div className="reminder-modal" role="dialog" aria-modal="true" aria-labelledby="urgent-reminder-title">
          <div className="reminder-modal__backdrop" onClick={handleReminderClose} />
          <section className="reminder-modal__card">
            <div className="reminder-modal__header">
              <div>
                <p className="section-label">今日重点</p>
                <h2 id="urgent-reminder-title">近期截止提醒</h2>
              </div>
              <button
                aria-label="关闭提醒弹窗"
                className="secondary-button reminder-modal__close"
                onClick={handleReminderClose}
                type="button"
              >
                我知道了
              </button>
            </div>

            <div className="reminder-modal__list">
              {urgentApplications.map(({ application, deadline }) => (
                <article className="reminder-modal__item" key={application.id}>
                  <div>
                    <p className="reminder-modal__company">{application.company_name}</p>
                    <p className="reminder-modal__job">{application.job_title}</p>
                  </div>
                  <div className="reminder-modal__meta">
                    <span className={`deadline-badge deadline-badge--${deadline.status}`}>{deadline.toneLabel}</span>
                    <span className="reminder-modal__date">{deadline.label}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      <main className="dashboard-page dashboard-page--overview">
        <header className="app-header">
          <div>
            <p className="eyebrow">Overview</p>
            <h2>总览</h2>
          </div>
          <div className="header-actions">
            <Link className="secondary-button" to={ROUTES.applications}>进入申请管理</Link>
            <Link className="primary-button" to={ROUTES.calendar}>查看日历</Link>
          </div>
        </header>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        {isLoading ? <p className="board-feedback">正在加载申请总览...</p> : null}

        {!isLoading ? (
          <>
            <DeadlinePanel applications={applications} />
            <StatsPanel stats={stats} />

            <section className="overview-grid">
              <section className="hero-card hero-card--stacked" aria-label="快捷入口">
                <div>
                  <p className="section-label">下一步去哪</p>
                  <h2>快捷入口</h2>
                </div>
                <div className="overview-shortcuts">
                  <Link className="overview-shortcut" to={ROUTES.applications}>
                    <strong>申请管理</strong>
                  </Link>
                  <Link className="overview-shortcut" to={`${ROUTES.applications}?view=list`}>
                    <strong>列表视图</strong>
                  </Link>
                  <Link className="overview-shortcut" to={ROUTES.calendar}>
                    <strong>日历</strong>
                  </Link>
                  <Link className="overview-shortcut" to={ROUTES.resources}>
                    <strong>资料库</strong>
                  </Link>
                </div>
              </section>

              <section className="hero-card hero-card--stacked" aria-label="最近新增申请">
                <div>
                  <p className="section-label">最近新增</p>
                  <h2>新录入的申请</h2>
                </div>
                {recentApplications.length === 0 ? (
                  <div className="empty-card">暂无申请记录。</div>
                ) : (
                  <div className="overview-feed">
                    {recentApplications.map((application) => (
                      <article className="overview-feed__item" key={application.id}>
                        <div>
                          <p className="overview-feed__title">{application.company_name} · {application.job_title}</p>
                          <p className="overview-feed__meta">创建于 {formatTimestamp(application.created_at)}</p>
                        </div>
                        <span className="application-table__stage">{application.stage}</span>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="hero-card hero-card--stacked" aria-label="最近更新申请">
                <div>
                  <p className="section-label">最近变动</p>
                  <h2>刚刚更新过的申请</h2>
                </div>
                {recentUpdates.length === 0 ? (
                  <div className="empty-card">暂无更新记录。</div>
                ) : (
                  <div className="overview-feed">
                    {recentUpdates.map((application) => (
                      <article className="overview-feed__item" key={application.id}>
                        <div>
                          <p className="overview-feed__title">{application.company_name} · {application.job_title}</p>
                          <p className="overview-feed__meta">更新于 {formatTimestamp(application.updated_at)}</p>
                        </div>
                        <span className={`result-status-badge result-status-badge--${application.result_status}`}>
                          {APPLICATION_RESULT_STATUS_LABELS[application.result_status]}
                        </span>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </section>
          </>
        ) : null}
      </main>
    </>
  )
}
