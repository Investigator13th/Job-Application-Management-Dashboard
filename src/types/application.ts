import type { ApplicationStage } from '@/constants/stages'

export type ApplicationResultStatus = 'ongoing' | 'success' | 'failed' | 'withdrawn'

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
