import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './AppShell'
import { ROUTES } from '@/constants/routes'
import { ProtectedRoute } from '@/components'
import { AuthPage } from '@/pages/auth/AuthPage'
import { AccountPage } from '@/pages/board/AccountPage'
import { BoardPage } from '@/pages/board/BoardPage'
import { CalendarPage } from '@/pages/board/CalendarPage'
import { OverviewPage } from '@/pages/board/OverviewPage'
import { ResourcesPage } from '@/pages/board/ResourcesPage'

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: ROUTES.overview,
            element: <OverviewPage />,
          },
          {
            path: ROUTES.applications,
            element: <BoardPage />,
          },
          {
            path: ROUTES.calendar,
            element: <CalendarPage />,
          },
          {
            path: ROUTES.resources,
            element: <ResourcesPage />,
          },
          {
            path: ROUTES.account,
            element: <AccountPage />,
          },
        ],
      },
    ],
  },
  {
    path: ROUTES.auth,
    element: <AuthPage />,
  },
])
