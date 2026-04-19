import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ApplicationsProvider, useAuth } from '@/hooks'

const NAV_ITEMS: Array<{
  to: string
  label: string
  description: string
  end?: boolean
}> = [
  {
    to: ROUTES.overview,
    label: '总览',
    description: '查看今日重点与整体进展',
    end: true,
  },
  {
    to: ROUTES.applications,
    label: '申请管理',
    description: '看板与列表双态',
  },
  {
    to: ROUTES.calendar,
    label: '日历',
    description: '按时间查看下一步',
  },
  {
    to: ROUTES.resources,
    label: '资料库',
    description: '聚合查看资料',
  },
] as const

export function AppShell() {
  const { viewerLabel, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate(ROUTES.auth, { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <div className="app-shell__brand">
          <h1>Jobtrack</h1>
        </div>

        <nav className="sidebar-nav" aria-label="主导航">
          {NAV_ITEMS.map((item) => (
            <NavLink
              className={({ isActive }) => isActive ? 'sidebar-nav__item sidebar-nav__item--active' : 'sidebar-nav__item'}
              end={item.end}
              key={item.to}
              to={item.to}
            >
              <div>
                 <div className="sidebar-nav__label">{item.label}</div>
              </div>
            </NavLink>
          ))}
        </nav>

        <section className="sidebar-account">
          <p className="sidebar-account__label">当前登录</p>
          <strong className="sidebar-account__value">{viewerLabel}</strong>
          <button className="secondary-button" style={{ marginTop: '12px', width: '100%' }} onClick={() => void handleSignOut()} type="button">退出登录</button>
        </section>
      </aside>

      <div className="app-shell__content apple-content-wrapper">
        <ApplicationsProvider>
          <Outlet />
        </ApplicationsProvider>
      </div>
    </div>
  )
}
