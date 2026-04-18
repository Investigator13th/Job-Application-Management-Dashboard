import type {
  Application,
  CreateApplicationInput,
  UpdateApplicationInput,
} from '@/types/application'
import { APPLICATIONS_TABLE } from '@/constants/supabase'
import {
  createGuestApplication,
  deleteGuestApplication,
  listGuestApplications,
  updateGuestApplication,
} from '@/lib/guest-applications'
import { isGuestModeEnabled } from '@/lib/guest-session'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('当前未配置 Supabase 环境变量，请使用游客模式体验。')
  }

  return supabase
}

export async function listApplications() {
  if (isGuestModeEnabled()) {
    return listGuestApplications()
  }

  const client = requireSupabase()
  const { data, error } = await client
    .from(APPLICATIONS_TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Application[]
}

export async function createApplication(input: CreateApplicationInput) {
  if (isGuestModeEnabled()) {
    return createGuestApplication(input)
  }

  const client = requireSupabase()
  const { data: userData, error: userError } = await client.auth.getUser()

  if (userError) throw userError
  if (!userData.user) {
    throw new Error('当前未登录，无法创建申请记录')
  }

  const { data, error } = await client
    .from(APPLICATIONS_TABLE)
    .insert({ ...input, user_id: userData.user.id })
    .select()
    .single()

  if (error) throw error
  return data as Application
}

export async function updateApplication(id: string, input: UpdateApplicationInput) {
  if (isGuestModeEnabled()) {
    return updateGuestApplication(id, input)
  }

  const client = requireSupabase()
  const { data, error } = await client
    .from(APPLICATIONS_TABLE)
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Application
}

export async function updateApplicationStage(id: string, stage: Application['stage']) {
  return updateApplication(id, { stage })
}

export async function deleteApplication(id: string) {
  if (isGuestModeEnabled()) {
    await deleteGuestApplication(id)
    return
  }

  const client = requireSupabase()
  const { error } = await client
    .from(APPLICATIONS_TABLE)
    .delete()
    .eq('id', id)

  if (error) throw error
}
