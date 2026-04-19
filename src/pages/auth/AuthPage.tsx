import { FormEvent, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks'

export function AuthPage() {
  const { user, isGuestMode, isLoading, signIn, signUp, enterGuestMode } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? ROUTES.overview

  if (!isLoading && (user || isGuestMode)) {
    return <Navigate replace to={from} />
  }

  function handleGuestMode() {
    setErrorMessage('')
    enterGuestMode()
    navigate(from, { replace: true })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      if (mode === 'signIn') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      navigate(from, { replace: true })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '认证失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <aside className="auth-brand">
        <div>
          <p className="auth-brand__eyebrow">专为秋招 / 春招打造</p>
          <h1 className="auth-brand__title">JobTrack</h1>
          <p className="auth-brand__subtitle">你的求职进度,一眼看透</p>
        </div>

        <ul className="auth-brand__features">
          {[
            { icon: '📋', title: '看板全局视图', desc: '投递、笔试、面试、Offer 全阶段一屏呈现' },
            { icon: '⏰', title: 'DDL 智能预警', desc: '临近截止自动标红,不再漏掉重要节点' },
            { icon: '📁', title: '资料随卡归档', desc: 'JD、简历版本、面经笔记全部挂在申请卡片下' },
            { icon: '✏️', title: '三秒录入一条', desc: '只填四项核心字段,告别臃肿大表格' },
            { icon: '📅', title: '日历视图', desc: '以时间轴方式查看所有 DDL,把控整月节奏' },
          ].map((f) => (
            <li key={f.title} className="auth-brand__feature">
              <span className="auth-brand__feature-icon">{f.icon}</span>
              <div>
                <p className="auth-brand__feature-title">{f.title}</p>
                <p className="auth-brand__feature-desc">{f.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="auth-brand__comparison">
          <p className="auth-brand__comparison-title">为什么不用飞书多维表格?</p>
          <ul className="auth-brand__comparison-list">
            {[
              '飞书是通用工具,需自建字段;JobTrack 求职流程开箱即用',
              '飞书看板无法感知 DDL 紧迫程度;JobTrack 颜色自动变化',
              '飞书移动端大表格体验差;JobTrack 手机也能快速录入',
              '飞书无法将 JD 与申请绑定;JobTrack 每张卡片即档案袋',
            ].map((item, i) => (
              <li key={i} className="auth-brand__comparison-item">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>{mode === 'signIn' ? '登录' : '注册'}</h1>
        <p className="page-description">使用邮箱和密码进入你的求职申请管理看板。</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field-label">
            邮箱
            <input
              autoComplete="email"
              disabled={isSubmitting}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="field-label">
            密码
            <input
              autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
              disabled={isSubmitting}
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? '处理中...' : mode === 'signIn' ? '登录' : '注册'}
          </button>
          <button className="secondary-button" disabled={isSubmitting} onClick={handleGuestMode} type="button">
            跳过注册，直接体验
          </button>
        </form>

        <button
          className="text-button"
          disabled={isSubmitting}
          onClick={() => {
            setErrorMessage('')
            setMode(mode === 'signIn' ? 'signUp' : 'signIn')
          }}
          type="button"
        >
          {mode === 'signIn' ? '没有账号？去注册' : '已有账号？去登录'}
        </button>
      </section>
    </main>
  )
}
