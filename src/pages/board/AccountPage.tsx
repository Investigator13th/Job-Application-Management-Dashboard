import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks'

export function AccountPage() {
  const { isGuestMode, viewerLabel } = useAuth()

  return (
    <main className="dashboard-page dashboard-page--account">

      <section className="hero-card hero-card--stacked">
        <div>
          <p className="section-label">当前身份</p>
          <h2>{viewerLabel}</h2>
          <p className="page-description">
            {isGuestMode ? '你当前处于游客模式，适合体验信息架构与基础功能。' : '你当前使用登录账号访问求职申请管理系统。'}
          </p>
        </div>
        <div className="overview-shortcuts">
          <Link className="overview-shortcut" to={ROUTES.auth}>
            <strong>前往认证页</strong>
            <span>切换登录方式或重新进入认证页面。</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
