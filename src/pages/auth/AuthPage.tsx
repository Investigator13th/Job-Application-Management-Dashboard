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
            { icon: '📋', title: '一屏掌控全局进度', desc: '从投递到 Offer，全阶段进展一眼见底，不再迷失在申请堆里' },
            { icon: '⏰', title: 'DDL 变色自动预警', desc: '智能感知死线，卡片随紧急程度自动变色，今天该忙啥一目了然' },
            { icon: '📁', title: '档案袋式一站归档', desc: 'JD、简历、面经同步挂载申请卡片，告别资料散落翻找的烦恼' },
            { icon: '✏️', title: '3 秒极速录入体验', desc: '专为求职定制核心字段，告别臃肿表格，手机端也能随时记录' },
            { icon: '📅', title: '掌控整月申请节奏', desc: '一键切换日历时间轴，科学规划面排期，从容应对双招高峰' },
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
