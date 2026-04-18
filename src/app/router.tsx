import { createBrowserRouter } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ProtectedRoute } from '@/components'
import { AuthPage } from '@/pages/auth/AuthPage'
import { BoardPage } from '@/pages/board/BoardPage'

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.board,
        element: <BoardPage />,
      },
    ],
  },
  {
    path: ROUTES.auth,
    element: <AuthPage />,
  },
])
