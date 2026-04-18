import type { Application, ApplicationStage } from '@/types/application'

export function groupApplicationsByStage(applications: Application[]) {
  const grouped = new Map<ApplicationStage, Application[]>()

  for (const application of applications) {
    const current = grouped.get(application.stage) ?? []
    current.push(application)
    grouped.set(application.stage, current)
  }

  return grouped
}
