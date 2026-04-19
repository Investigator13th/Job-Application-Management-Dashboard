import { APPLICATION_STAGES } from '@/constants/stages'
import type {
  Application,
  ApplicationResultStatus,
  ApplicationStage,
} from '@/types/application'

export interface ApplicationStats {
  total: number
  byStage: Record<ApplicationStage, number>
  byResultStatus: Record<ApplicationResultStatus, number>
  addedThisWeek: number
  addedThisMonth: number
}

const RESULT_STATUSES: ApplicationResultStatus[] = ['ongoing', 'success', 'failed', 'withdrawn']

function createStageCounts() {
  return Object.fromEntries(
    APPLICATION_STAGES.map((stage) => [stage, 0]),
  ) as Record<ApplicationStage, number>
}

function createResultStatusCounts() {
  return Object.fromEntries(
    RESULT_STATUSES.map((status) => [status, 0]),
  ) as Record<ApplicationResultStatus, number>
}

function parseDate(value: string | null) {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getEffectiveAppliedDate(application: Application) {
  return parseDate(application.applied_at) ?? parseDate(application.created_at)
}

function startOfWeek(date: Date) {
  const result = new Date(date)
  const day = result.getDay()
  const diff = day === 0 ? -6 : 1 - day

  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function computeApplicationStats(applications: Application[], now = new Date()): ApplicationStats {
  const byStage = createStageCounts()
  const byResultStatus = createResultStatusCounts()
  const currentWeekStart = startOfWeek(now)
  const currentMonthStart = startOfMonth(now)

  let addedThisWeek = 0
  let addedThisMonth = 0

  applications.forEach((application) => {
    byStage[application.stage] += 1

    const resultStatus = application.result_status ?? 'ongoing'
    byResultStatus[resultStatus] += 1

    const effectiveDate = getEffectiveAppliedDate(application)
    if (!effectiveDate) {
      return
    }

    if (effectiveDate >= currentWeekStart && effectiveDate <= now) {
      addedThisWeek += 1
    }

    if (effectiveDate >= currentMonthStart && effectiveDate <= now) {
      addedThisMonth += 1
    }
  })

  return {
    total: applications.length,
    byStage,
    byResultStatus,
    addedThisWeek,
    addedThisMonth,
  }
}
