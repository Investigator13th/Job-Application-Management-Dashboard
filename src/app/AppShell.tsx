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
          <svg viewBox="0 0 17 17" className="apple-logo" width="24" height="24" style={{ marginBottom: '12px' }}>
            <path fill="currentColor" d="M14.613,11.233c-0.038-1.921,1.564-2.859,1.637-2.906c-0.89-1.303-2.274-1.493-2.738-1.517 C12.338,6.671,11.23,7.4,10.63,7.4C10.031,7.4,9.112,6.792,8.08,6.805c-1.328,0.017-2.558,0.772-3.245,1.968 C3.435,11.2,4.402,14.63,5.772,16.608c0.665,0.957,1.442,2.02,2.483,1.981c0.999-0.039,1.385-0.645,2.593-0.645 c1.205,0,1.556,0.645,2.61,0.627c1.09-0.019,1.751-0.966,2.413-1.931c0.767-1.121,1.082-2.207,1.101-2.26 C14.954,11.373,14.651,11.246,14.613,11.233 M11.139,4.646c0.55-0.666,0.92-1.593,0.818-2.52C11.161,2.158,10.165,2.7,9.593,3.364 C9.083,3.955,8.636,4.898,8.756,5.807C9.645,5.875,10.589,5.312,11.139,4.646"></path>
          </svg>
          <h1>Job OS</h1>
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
                 <div className="sidebar-nav__description">{item.description}</div>
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
