import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useApplications } from '@/hooks'

interface ResourceItem {
  id: string
  companyName: string
  jobTitle: string
  stage: string
  updatedAt: string
  content: string
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function ResourcesPage() {
  const { applications, errorMessage, isLoading } = useApplications()

  const noteItems: ResourceItem[] = applications
    .filter((application) => application.notes?.trim())
    .map((application) => ({
      id: `${application.id}-notes`,
      companyName: application.company_name,
      jobTitle: application.job_title,
      stage: application.stage,
      updatedAt: application.updated_at,
      content: application.notes!.trim(),
    }))

  const jdItems: ResourceItem[] = applications
    .filter((application) => application.jd_url?.trim() || application.jd_snapshot?.trim())
    .map((application) => ({
      id: `${application.id}-jd`,
      companyName: application.company_name,
      jobTitle: application.job_title,
      stage: application.stage,
      updatedAt: application.updated_at,
      content: application.jd_url?.trim() || application.jd_snapshot!.trim(),
    }))

  const resumeItems: ResourceItem[] = applications
    .filter((application) => application.resume_version?.trim())
    .map((application) => ({
      id: `${application.id}-resume`,
      companyName: application.company_name,
      jobTitle: application.job_title,
      stage: application.stage,
      updatedAt: application.updated_at,
      content: application.resume_version!.trim(),
    }))

  const contactItems: ResourceItem[] = applications
    .filter((application) => application.contact_info?.trim())
    .map((application) => ({
      id: `${application.id}-contact`,
      companyName: application.company_name,
      jobTitle: application.job_title,
      stage: application.stage,
      updatedAt: application.updated_at,
      content: application.contact_info!.trim(),
    }))

  const sections = [
    { key: 'jd', label: 'JD / 链接', description: '岗位链接与 JD 文本摘要', items: jdItems },
    { key: 'notes', label: '笔记记录', description: '笔试、面试与沟通要点', items: noteItems },
    { key: 'resume', label: '简历版本', description: '针对岗位投递所用的简历版本', items: resumeItems },
    { key: 'contact', label: '联系信息', description: 'HR、面试官与沟通备注', items: contactItems },
  ] as const

  return (
    <main className="dashboard-page dashboard-page--resources">

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      {isLoading ? <p className="board-feedback">正在加载资料库...</p> : null}

      {!isLoading ? (
        <section className="resource-grid">
          {sections.map((section) => (
            <section className="hero-card hero-card--stacked resource-section" key={section.key}>
              <div>
                <p className="section-label">资料类型</p>
                <h2>{section.label}</h2>
                <p className="page-description">{section.description}</p>
              </div>

              {section.items.length === 0 ? (
                <div className="empty-card">当前还没有可展示的{section.label}。</div>
              ) : (
                <div className="resource-list">
                  {section.items.map((item) => (
                    <article className="resource-item" key={item.id}>
                      <div className="resource-item__top">
                        <div>
                          <p className="resource-item__title">{item.companyName} · {item.jobTitle}</p>
                          <p className="resource-item__meta">{item.stage} · 更新于 {formatTimestamp(item.updatedAt)}</p>
                        </div>
                        <Link className="text-button" to={ROUTES.applications}>去申请管理</Link>
                      </div>
                      <div className="placeholder-input resource-item__content">{item.content}</div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ))}
        </section>
      ) : null}
    </main>
  )
}
