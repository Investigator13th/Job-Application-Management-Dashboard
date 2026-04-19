import { APPLICATION_STAGES } from '@/constants/stages'
import type { ApplicationStats } from '@/lib/statistics'
import {
  APPLICATION_RESULT_STATUS_LABELS,
  type ApplicationResultStatus,
  type ApplicationStage,
} from '@/types/application'

interface StatsPanelProps {
  stats: ApplicationStats
}

const SUMMARY_ITEMS: Array<{
  key: 'total' | 'addedThisWeek' | 'addedThisMonth'
  label: string
}> = [
  { key: 'total', label: '总申请数' },
  { key: 'addedThisWeek', label: '本周新增' },
  { key: 'addedThisMonth', label: '本月新增' },
]

export function StatsPanel({ stats }: StatsPanelProps) {
  if (stats.total === 0) {
    return (
      <section className="hero-card hero-card--stacked stats-panel" aria-label="申请统计概览">
        <div>
          <p className="section-label">数据概览</p>
          <h2>申请统计概览</h2>
        </div>
      </section>
    )
  }

  return (
    <section className="hero-card hero-card--stacked stats-panel" aria-label="申请统计概览">
      <div className="stats-panel__header">
        <div>
          <p className="section-label">数据概览</p>
          <h2>申请统计</h2>
        </div>
      </div>

      <div className="stats-panel__summary-grid">
        {SUMMARY_ITEMS.map(({ key, label }) => (
          <article className="stats-card" key={key}>
            <p className="stats-card__label">{label}</p>
            <strong className="stats-card__value">{stats[key]}</strong>
          </article>
        ))}
      </div>

      <div className="stats-panel__grid">
        <article className="stats-block">
          <div className="stats-block__header">
            <h3>阶段分布</h3>
          </div>
          <div className="stats-list">
            {APPLICATION_STAGES.map((stage: ApplicationStage) => (
              <div className="stats-list__item" key={stage}>
                <span className="stats-list__label">{stage}</span>
                <span className="stats-list__value">{stats.byStage[stage]}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="stats-block">
          <div className="stats-block__header">
            <h3>结果状态分布</h3>
          </div>
          <div className="stats-list">
            {Object.entries(APPLICATION_RESULT_STATUS_LABELS).map(([status, label]) => (
              <div className="stats-list__item" key={status}>
                <span className="stats-list__label">{label}</span>
                <span className="stats-list__value">{stats.byResultStatus[status as ApplicationResultStatus]}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
