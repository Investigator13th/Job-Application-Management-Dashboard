import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks'

export function ProtectedRoute() {
  const { user, isGuestMode, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <p className="eyebrow">Loading</p>
          <h1>正在恢复登录态</h1>
          <p className="page-description">请稍候，正在校验当前会话。</p>
        </section>
      </main>
    )
  }

  if (!user && !isGuestMode) {
    return <Navigate replace state={{ from: location }} to={ROUTES.auth} />
  }

  return <Outlet />
}
