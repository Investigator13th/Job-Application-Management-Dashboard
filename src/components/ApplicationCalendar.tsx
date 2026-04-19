import { useMemo, useState } from 'react'
import { getDeadlineMeta } from '@/lib/deadlines'
import type { Application } from '@/types/application'

interface ApplicationCalendarProps {
  applications: Application[]
}

interface CalendarEntry {
  application: Application
  dayKey: string
  date: Date
}

function createMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
  }).format(date)
}

function formatDayKey(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDetailDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date)
}

function formatCellDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
  }).format(date)
}

function getCalendarGridStart(month: Date) {
  const firstDay = createMonthStart(month)
  const offset = (firstDay.getDay() + 6) % 7
  return new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() - offset)
}

function buildCalendarDays(month: Date) {
  const start = getCalendarGridStart(month)

  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
    return {
      date: current,
      dayKey: formatDayKey(current),
      isCurrentMonth: current.getMonth() === month.getMonth(),
    }
  })
}

function groupApplicationsByDay(applications: Application[]) {
  const entries: CalendarEntry[] = []

  applications.forEach((application) => {
    const deadline = getDeadlineMeta(application.next_deadline)
    if (!deadline.date) {
      return
    }

    entries.push({
      application,
      date: deadline.date,
      dayKey: formatDayKey(deadline.date),
    })
  })

  return entries.reduce<Map<string, CalendarEntry[]>>((map, entry) => {
    const current = map.get(entry.dayKey) ?? []
    current.push(entry)
    current.sort((left, right) => left.application.company_name.localeCompare(right.application.company_name, 'zh-CN'))
    map.set(entry.dayKey, current)
    return map
  }, new Map())
}

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

export function ApplicationCalendar({ applications }: ApplicationCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => createMonthStart(new Date()))
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null)

  const calendarEntries = useMemo(() => groupApplicationsByDay(applications), [applications])
  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth])

  const selectedEntries = selectedDayKey ? (calendarEntries.get(selectedDayKey) ?? []) : []
  const selectedDate = selectedEntries[0]?.date ?? null

  return (
    <section className="hero-card hero-card--stacked application-calendar" aria-label="申请日历视图">
      <div className="application-calendar__header">
        <div>
          <p className="section-label">日历视图</p>
          <h2>按日期查看下一步截止事项</h2>
        </div>
        <div className="application-calendar__actions">
          <button className="secondary-button" onClick={() => setCurrentMonth((month) => addMonths(month, -1))} type="button">
            上个月
          </button>
          <strong className="application-calendar__month-label">{formatMonthLabel(currentMonth)}</strong>
          <button className="secondary-button" onClick={() => setCurrentMonth((month) => addMonths(month, 1))} type="button">
            下个月
          </button>
        </div>
      </div>

      <div className="application-calendar__weekdays" aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <span className="application-calendar__weekday" key={label}>{label}</span>
        ))}
      </div>

      <div className="application-calendar__grid">
        {calendarDays.map(({ date, dayKey, isCurrentMonth }) => {
          const entries = calendarEntries.get(dayKey) ?? []
          const isSelected = selectedDayKey === dayKey

          return (
            <button
              aria-pressed={isSelected}
              className={[
                'application-calendar__cell',
                isCurrentMonth ? '' : 'application-calendar__cell--muted',
                entries.length > 0 ? 'application-calendar__cell--has-events' : '',
                isSelected ? 'application-calendar__cell--selected' : '',
              ].filter(Boolean).join(' ')}
              key={dayKey}
              onClick={() => setSelectedDayKey(dayKey)}
              type="button"
            >
              <div className="application-calendar__cell-top">
                <span className="application-calendar__date-number">{date.getDate()}</span>
                {entries.length > 0 ? <span className="application-calendar__count">{entries.length} 条</span> : null}
              </div>

              <div className="application-calendar__items">
                {entries.slice(0, 2).map(({ application }) => (
                  <span className="application-calendar__item" key={application.id}>
                    {application.company_name} · {application.job_title}
                  </span>
                ))}
                {entries.length > 2 ? (
                  <span className="application-calendar__more">还有 {entries.length - 2} 条</span>
                ) : null}
              </div>
            </button>
          )
        })}
      </div>

      <div className="application-calendar__detail">
        <div>
          <p className="section-label">当日详情</p>
          <h2>{selectedDate ? formatDetailDate(selectedDate) : '请选择一个日期'}</h2>
          <p className="page-description">
            {selectedDate ? '查看这一天需要推进的申请事项。' : '点击任意日期后，在这里查看当天聚合的申请详情。'}
          </p>
        </div>

        {selectedEntries.length === 0 ? (
          <div className="placeholder-input application-calendar__detail-empty">当前日期没有可展示的申请记录。</div>
        ) : (
          <div className="application-calendar__detail-list">
            {selectedEntries.map(({ application }) => {
              const deadline = getDeadlineMeta(application.next_deadline)

              return (
                <article className="application-calendar__detail-card" key={application.id}>
                  <div>
                    <p className="application-calendar__detail-company">{application.company_name}</p>
                    <p className="application-calendar__detail-job">{application.job_title}</p>
                  </div>
                  <div className="application-calendar__detail-meta">
                    <span className="application-table__stage">{application.stage}</span>
                    <span className={`deadline-badge deadline-badge--${deadline.status}`}>{deadline.toneLabel}</span>
                    <span className="application-calendar__detail-date">{deadline.label}</span>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
