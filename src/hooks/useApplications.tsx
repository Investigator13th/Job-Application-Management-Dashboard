import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  createApplication,
  deleteApplication,
  listApplications,
  updateApplication,
  updateApplicationStage,
} from '@/lib/applications'
import type {
  Application,
  ApplicationStage,
  CreateApplicationInput,
  UpdateApplicationInput,
} from '@/types/application'

interface ApplicationsContextValue {
  applications: Application[]
  isLoading: boolean
  errorMessage: string
  refreshApplications: () => Promise<void>
  createApplicationItem: (input: CreateApplicationInput) => Promise<Application>
  updateApplicationItem: (id: string, input: UpdateApplicationInput) => Promise<Application>
  deleteApplicationItem: (id: string) => Promise<void>
  moveApplicationStage: (id: string, stage: ApplicationStage) => Promise<Application>
}

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null)

function moveApplicationToStage(
  applications: Application[],
  applicationId: string,
  nextStage: ApplicationStage,
) {
  return applications.map((application) =>
    application.id === applicationId
      ? {
          ...application,
          stage: nextStage,
        }
      : application,
  )
}

export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const refreshApplications = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const data = await listApplications()
      setApplications(data)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '申请列表加载失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshApplications()
  }, [refreshApplications])

  const value = useMemo<ApplicationsContextValue>(() => ({
    applications,
    isLoading,
    errorMessage,
    refreshApplications,
    async createApplicationItem(input) {
      const createdApplication = await createApplication(input)
      setApplications((current) => [createdApplication, ...current])
      setErrorMessage('')
      return createdApplication
    },
    async updateApplicationItem(id, input) {
      const updatedApplication = await updateApplication(id, input)
      setApplications((current) =>
        current.map((application) =>
          application.id === updatedApplication.id ? updatedApplication : application,
        ),
      )
      setErrorMessage('')
      return updatedApplication
    },
    async deleteApplicationItem(id) {
      await deleteApplication(id)
      setApplications((current) => current.filter((application) => application.id !== id))
      setErrorMessage('')
    },
    async moveApplicationStage(id, stage) {
      const previousApplications = applications
      setApplications((current) => moveApplicationToStage(current, id, stage))
      setErrorMessage('')

      try {
        const updatedApplication = await updateApplicationStage(id, stage)
        setApplications((current) =>
          current.map((application) =>
            application.id === updatedApplication.id ? updatedApplication : application,
          ),
        )
        return updatedApplication
      } catch (error) {
        setApplications(previousApplications)
        const nextErrorMessage = error instanceof Error ? error.message : '拖拽更新失败，已回退到原阶段'
        setErrorMessage(nextErrorMessage)
        throw error
      }
    },
  }), [applications, errorMessage, isLoading, refreshApplications])

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>
}

export function useApplications() {
  const value = useContext(ApplicationsContext)

  if (!value) {
    throw new Error('useApplications must be used inside ApplicationsProvider')
  }

  return value
}
