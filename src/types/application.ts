import type { ApplicationStage } from '@/constants/stages'

export type ApplicationResultStatus = 'ongoing' | 'success' | 'failed' | 'withdrawn'

export const APPLICATION_RESULT_STATUS_LABELS: Record<ApplicationResultStatus, string> = {
  ongoing: '进行中',
  success: '成功',
  failed: '失败',
  withdrawn: '主动放弃',
}

export const APPLICATION_RESULT_STATUS_OPTIONS: Array<{
  value: ApplicationResultStatus
  label: string
}> = Object.entries(APPLICATION_RESULT_STATUS_LABELS).map(([value, label]) => ({
  value: value as ApplicationResultStatus,
  label,
}))

export interface Application {
  id: string
  user_id: string
  company_name: string
  job_title: string
  stage: ApplicationStage
  next_deadline: string | null
  applied_at: string | null
  result_status: ApplicationResultStatus
  notes: string | null
  jd_url: string | null
  jd_snapshot: string | null
  resume_version: string | null
  contact_info: string | null
  reminder_dismissed_at: string | null
  created_at: string
  updated_at: string
}

export { type ApplicationStage }

export interface CreateApplicationInput {
  company_name: string
  job_title: string
  stage: ApplicationStage
  next_deadline: string | null
  applied_at: string | null
  result_status: ApplicationResultStatus
  notes: string | null
  jd_url: string | null
  jd_snapshot: string | null
  resume_version: string | null
  contact_info: string | null
  reminder_dismissed_at: string | null
}

export interface UpdateApplicationInput {
  company_name?: string
  job_title?: string
  stage?: ApplicationStage
  next_deadline?: string | null
  applied_at?: string | null
  result_status?: ApplicationResultStatus
  notes?: string | null
  jd_url?: string | null
  jd_snapshot?: string | null
  resume_version?: string | null
  contact_info?: string | null
  reminder_dismissed_at?: string | null
}
