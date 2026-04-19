import type {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
} from '@/types/application'
import { GUEST_USER_ID } from '@/lib/guest-session'
import { DEMO_SEED_APPLICATIONS } from '@/lib/demo-seed-data'

const GUEST_APPLICATIONS_KEY = 'job-board.guest-applications'
const DEMO_SEEDED_KEY = 'job-board.demo-seeded'

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function normalizeApplication(application: Application): Application {
  return {
    ...application,
    applied_at: application.applied_at ?? null,
    result_status: application.result_status ?? 'ongoing',
    notes: application.notes ?? null,
    jd_url: application.jd_url ?? null,
    jd_snapshot: application.jd_snapshot ?? null,
    resume_version: application.resume_version ?? null,
    contact_info: application.contact_info ?? null,
    reminder_dismissed_at: application.reminder_dismissed_at ?? null,
  }
}

function readApplications() {
  if (!canUseLocalStorage()) return [] as Application[]

  const raw = window.localStorage.getItem(GUEST_APPLICATIONS_KEY)
  if (!raw) return [] as Application[]

  try {
    const parsed = JSON.parse(raw) as Application[]
    return Array.isArray(parsed) ? parsed.map((application) => normalizeApplication(application)) : []
  } catch {
    return []
  }
}

function writeApplications(applications: Application[]) {
  if (!canUseLocalStorage()) return
  window.localStorage.setItem(GUEST_APPLICATIONS_KEY, JSON.stringify(applications))
}

function sortApplications(applications: Application[]) {
  return [...applications].sort((left, right) => right.created_at.localeCompare(left.created_at))
}

function createGuestApplicationId() {
  return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function isDemoSeeded(): boolean {
  if (!canUseLocalStorage()) return true
  return window.localStorage.getItem(DEMO_SEEDED_KEY) === 'true'
}

function markDemoSeeded(): void {
  if (!canUseLocalStorage()) return
  window.localStorage.setItem(DEMO_SEEDED_KEY, 'true')
}

function seedDemoApplications(): void {
  if (isDemoSeeded()) return

  const existing = readApplications()
  if (existing.length > 0) {
    markDemoSeeded()
    return
  }

  writeApplications(DEMO_SEED_APPLICATIONS)
  markDemoSeeded()
}

export async function listGuestApplications() {
  seedDemoApplications()
  return sortApplications(readApplications())
}

export async function createGuestApplication(input: CreateApplicationInput) {
  const now = new Date().toISOString()
  const nextApplication: Application = {
    id: createGuestApplicationId(),
    user_id: GUEST_USER_ID,
    company_name: input.company_name,
    job_title: input.job_title,
    stage: input.stage,
    next_deadline: input.next_deadline,
    applied_at: input.applied_at,
    result_status: input.result_status,
    notes: input.notes,
    jd_url: input.jd_url,
    jd_snapshot: input.jd_snapshot,
    resume_version: input.resume_version,
    contact_info: input.contact_info,
    reminder_dismissed_at: input.reminder_dismissed_at,
    created_at: now,
    updated_at: now,
  }

  const applications = sortApplications([nextApplication, ...readApplications()])
  writeApplications(applications)
  return nextApplication
}

export async function updateGuestApplication(id: string, input: UpdateApplicationInput) {
  const currentApplications = readApplications()
  const currentApplication = currentApplications.find((application) => application.id === id)

  if (!currentApplication) {
    throw new Error('未找到要更新的本地申请记录')
  }

  const updatedApplication: Application = {
    ...currentApplication,
    ...input,
    updated_at: new Date().toISOString(),
  }

  const applications = sortApplications(
    currentApplications.map((application) => application.id === id ? updatedApplication : application),
  )

  writeApplications(applications)
  return updatedApplication
}

export async function deleteGuestApplication(id: string) {
  const applications = readApplications().filter((application) => application.id !== id)
  writeApplications(applications)
}
