import { ApplicationCalendar } from '@/components'
import { useApplications } from '@/hooks'

export function CalendarPage() {
  const { applications, errorMessage, isLoading } = useApplications()

  return (
    <main className="dashboard-page dashboard-page--calendar">

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      {isLoading ? <p className="board-feedback">正在加载日历...</p> : null}
      {!isLoading ? <ApplicationCalendar applications={applications} /> : null}
    </main>
  )
}
