import type { Application } from '@/types/application'

export type DeadlineStatus = 'overdue' | 'upcoming' | 'normal' | 'missing'

export interface DeadlineMeta {
  date: Date | null
  daysUntil: number | null
  label: string
  sortTimestamp: number
  status: DeadlineStatus
  toneLabel: string
}

const DAY_IN_MS = 24 * 60 * 60 * 1000
const UPCOMING_WINDOW_DAYS = 3

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatDeadline(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function getDeadlineMeta(value: string | null): DeadlineMeta {
  if (!value) {
    return {
      date: null,
      daysUntil: null,
      label: '未设置 DDL',
      sortTimestamp: Number.POSITIVE_INFINITY,
      status: 'missing',
      toneLabel: '未设置',
    }
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return {
      date: null,
      daysUntil: null,
      label: value,
      sortTimestamp: Number.POSITIVE_INFINITY,
      status: 'missing',
      toneLabel: '未设置',
    }
  }

  const deadlineDate = startOfDay(parsed)
  const today = startOfDay(new Date())
  const daysUntil = Math.round((deadlineDate.getTime() - today.getTime()) / DAY_IN_MS)

  if (daysUntil < 0) {
    return {
      date: deadlineDate,
      daysUntil,
      label: `${formatDeadline(deadlineDate)} · 已过期`,
      sortTimestamp: deadlineDate.getTime(),
      status: 'overdue',
      toneLabel: '已过期',
    }
  }

  if (daysUntil <= UPCOMING_WINDOW_DAYS) {
    return {
      date: deadlineDate,
      daysUntil,
      label: `${formatDeadline(deadlineDate)} · 临近截止`,
      sortTimestamp: deadlineDate.getTime(),
      status: 'upcoming',
      toneLabel: '临近截止',
    }
  }

  return {
    date: deadlineDate,
    daysUntil,
    label: formatDeadline(deadlineDate),
    sortTimestamp: deadlineDate.getTime(),
    status: 'normal',
    toneLabel: '正常',
  }
}

export function getUrgentApplications(applications: Application[], limit = 5) {
  return applications
    .map((application) => ({
      application,
      deadline: getDeadlineMeta(application.next_deadline),
    }))
    .filter(({ deadline }) => deadline.status === 'overdue' || deadline.status === 'upcoming')
    .sort((left, right) => left.deadline.sortTimestamp - right.deadline.sortTimestamp)
    .slice(0, limit)
}
