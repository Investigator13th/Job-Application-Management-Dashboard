import { useEffect, useMemo, useState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Link, useNavigate } from 'react-router-dom'
import { ApplicationCalendar, ApplicationCard, ApplicationTable, BoardColumn, DeadlinePanel } from '@/components'
import { APPLICATION_STAGES } from '@/constants/stages'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks'
import {
  createApplication,
  deleteApplication,
  listApplications,
  updateApplication,
  updateApplicationStage,
} from '@/lib/applications'
import { groupApplicationsByStage } from '@/lib/application-groups'
import type {
  Application,
  ApplicationStage,
  CreateApplicationInput,
  UpdateApplicationInput,
} from '@/types/application'

const INITIAL_FORM_VALUES: CreateApplicationInput = {
  company_name: '',
  job_title: '',
  stage: APPLICATION_STAGES[0],
  next_deadline: null,
  applied_at: null,
  result_status: 'ongoing',
  notes: null,
  jd_url: null,
  jd_snapshot: null,
  resume_version: null,
  contact_info: null,
  reminder_dismissed_at: null,
}

type FormMode = 'create' | 'edit'
type HomeTab = 'applications' | 'calendar'
type ApplicationViewMode = 'card' | 'list'

function moveApplicationToStage(
  applications: Application[],
  applicationId: string,
  nextStage: ApplicationStage,
) {
  return applications.map((application) =>
    application.id === applicationId
      ? {
          ...application,
          stage: nextStage,
        }
      : application,
  )
}

export function BoardPage() {
  const { viewerLabel, signOut } = useAuth()
  const navigate = useNavigate()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>('create')
  const [editingApplicationId, setEditingApplicationId] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<CreateApplicationInput>(INITIAL_FORM_VALUES)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingApplicationId, setDeletingApplicationId] = useState<string | null>(null)
  const [draggingApplicationId, setDraggingApplicationId] = useState<string | null>(null)
  const [activeHomeTab, setActiveHomeTab] = useState<HomeTab>('applications')
  const [applicationViewMode, setApplicationViewMode] = useState<ApplicationViewMode>('card')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  useEffect(() => {
    let isMounted = true

    async function loadApplications() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const data = await listApplications()
        if (!isMounted) return
        setApplications(data)
      } catch (error) {
        if (!isMounted) return
        setErrorMessage(error instanceof Error ? error.message : '申请列表加载失败，请稍后重试')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadApplications()

    return () => {
      isMounted = false
    }
  }, [])

  const applicationsByStage = useMemo(() => groupApplicationsByStage(applications), [applications])
  const formTitle = formMode === 'create' ? '快速录入申请' : '编辑申请信息'
  const submitLabel = formMode === 'create' ? '创建申请' : '保存修改'

  function resetForm() {
    setFormValues(INITIAL_FORM_VALUES)
    setFormError('')
    setEditingApplicationId(null)
    setFormMode('create')
  }

  function openCreateForm() {
    resetForm()
    setIsFormOpen(true)
  }

  function openEditForm(application: Application) {
    setFormMode('edit')
    setEditingApplicationId(application.id)
    setFormValues({
      company_name: application.company_name,
      job_title: application.job_title,
      stage: application.stage,
      next_deadline: application.next_deadline,
      applied_at: application.applied_at,
      result_status: application.result_status,
      notes: application.notes,
      jd_url: application.jd_url,
      jd_snapshot: application.jd_snapshot,
      resume_version: application.resume_version,
      contact_info: application.contact_info,
      reminder_dismissed_at: application.reminder_dismissed_at,
    })
    setFormError('')
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    resetForm()
  }

  function handleInputChange(field: keyof CreateApplicationInput, value: string) {
    setFormValues((current) => ({
      ...current,
      [field]: field === 'next_deadline' ? (value ? value : null) : value,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const companyName = formValues.company_name.trim()
    const jobTitle = formValues.job_title.trim()

    if (!companyName || !jobTitle) {
      setFormError('请先填写公司名称和岗位名称')
      return
    }

    const payload: CreateApplicationInput = {
      company_name: companyName,
      job_title: jobTitle,
      stage: formValues.stage,
      next_deadline: formValues.next_deadline,
      applied_at: formValues.applied_at,
      result_status: formValues.result_status,
      notes: formValues.notes,
      jd_url: formValues.jd_url,
      jd_snapshot: formValues.jd_snapshot,
      resume_version: formValues.resume_version,
      contact_info: formValues.contact_info,
      reminder_dismissed_at: formValues.reminder_dismissed_at,
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      if (formMode === 'create') {
        const createdApplication = await createApplication(payload)
        setApplications((current) => [createdApplication, ...current])
      } else {
        if (!editingApplicationId) {
          throw new Error('未找到要编辑的申请记录')
        }

        const updatedApplication = await updateApplication(
          editingApplicationId,
          payload as UpdateApplicationInput,
        )

        setApplications((current) =>
          current.map((application) =>
            application.id === updatedApplication.id ? updatedApplication : application,
          ),
        )
      }

      closeForm()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '保存申请失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(application: Application) {
    const confirmed = window.confirm(`确认删除 ${application.company_name} - ${application.job_title} 吗？`)

    if (!confirmed) return

    setDeletingApplicationId(application.id)
    setErrorMessage('')

    try {
      await deleteApplication(application.id)
      setApplications((current) => current.filter((item) => item.id !== application.id))

      if (editingApplicationId === application.id) {
        closeForm()
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '删除申请失败，请稍后重试')
    } finally {
      setDeletingApplicationId(null)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate(ROUTES.auth, { replace: true })
  }

  function handleDragStart(event: DragStartEvent) {
    setDraggingApplicationId(typeof event.active.id === 'string' ? event.active.id : null)
    setErrorMessage('')
  }

  async function handleDragEnd(event: DragEndEvent) {
    setDraggingApplicationId(null)

    const activeId = typeof event.active.id === 'string' ? event.active.id : null
    if (!activeId) return

    const activeApplication = applications.find((application) => application.id === activeId)
    if (!activeApplication) return

    const overStage = event.over?.data.current?.type === 'column'
      ? (event.over.data.current.stage as ApplicationStage)
      : null

    if (!overStage || overStage === activeApplication.stage) {
      return
    }

    const previousApplications = applications
    setApplications((current) => moveApplicationToStage(current, activeId, overStage))
    setErrorMessage('')

    try {
      const updatedApplication = await updateApplicationStage(activeId, overStage)
      setApplications((current) =>
        current.map((application) =>
          application.id === updatedApplication.id ? updatedApplication : application,
        ),
      )
    } catch (error) {
      setApplications(previousApplications)
      setErrorMessage(error instanceof Error ? error.message : '拖拽更新失败，已回退到原阶段')
    }
  }

  return (
    <main className="page-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Job Application Board</p>
          <h1>求职申请管理看板</h1>
          <p className="page-description">集中查看不同阶段的申请记录，并支持快速录入、编辑和删除。</p>
          <p className="session-hint">当前登录：{viewerLabel}</p>
        </div>
        <div className="header-actions">
          <Link className="ghost-link" to={ROUTES.auth}>账号页</Link>
          <button className="secondary-button" onClick={() => void handleSignOut()} type="button">退出登录</button>
        </div>
      </header>

      <section className="home-tabs" aria-label="首页主视图切换">
        <button
          aria-pressed={activeHomeTab === 'applications'}
          className={activeHomeTab === 'applications' ? 'home-tab home-tab--active' : 'home-tab'}
          onClick={() => setActiveHomeTab('applications')}
          type="button"
        >
          申请管理
        </button>
        <button
          aria-pressed={activeHomeTab === 'calendar'}
          className={activeHomeTab === 'calendar' ? 'home-tab home-tab--active' : 'home-tab'}
          onClick={() => setActiveHomeTab('calendar')}
          type="button"
        >
          日历视图
        </button>
      </section>

      {activeHomeTab === 'applications' ? (
        <>
          <DeadlinePanel applications={applications} />

          <section className="hero-card hero-card--stacked">
            <div className="hero-card__top">
              <div>
                <p className="section-label">T4 快速录入</p>
                <h2>快速新增与编辑删除入口</h2>
                <p>只填写核心字段即可创建申请，也可以直接在卡片上编辑或删除已有记录。</p>
              </div>
              <button className="primary-button" onClick={openCreateForm} type="button">新增申请</button>
            </div>

            {isFormOpen ? (
              <form className="quick-form" onSubmit={handleSubmit}>
                <div className="quick-form__grid">
                  <label className="field-label">
                    <span>公司名称</span>
                    <input
                      autoFocus
                      onChange={(event) => handleInputChange('company_name', event.target.value)}
                      placeholder="例如：美团"
                      type="text"
                      value={formValues.company_name}
                    />
                  </label>

                  <label className="field-label">
                    <span>岗位名称</span>
                    <input
                      onChange={(event) => handleInputChange('job_title', event.target.value)}
                      placeholder="例如：前端开发工程师"
                      type="text"
                      value={formValues.job_title}
                    />
                  </label>

                  <label className="field-label">
                    <span>当前阶段</span>
                    <select
                      onChange={(event) => handleInputChange('stage', event.target.value as ApplicationStage)}
                      value={formValues.stage}
                    >
                      {APPLICATION_STAGES.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field-label">
                    <span>下一个 DDL</span>
                    <input
                      onChange={(event) => handleInputChange('next_deadline', event.target.value)}
                      type="date"
                      value={formValues.next_deadline ?? ''}
                    />
                  </label>
                </div>

                {formError ? <p className="form-error">{formError}</p> : null}

                <div className="quick-form__actions">
                  <div>
                    <p className="quick-form__title">{formTitle}</p>
                    <p className="quick-form__hint">提交成功后会立即同步到当前看板。</p>
                  </div>
                  <div className="quick-form__buttons">
                    <button className="secondary-button" onClick={closeForm} type="button">
                      取消
                    </button>
                    <button className="primary-button" disabled={isSubmitting} type="submit">
                      {isSubmitting ? '提交中...' : submitLabel}
                    </button>
                  </div>
                </div>
              </form>
            ) : null}
          </section>

          <section className="application-view-switcher" aria-label="申请视图切换">
            <button
              aria-pressed={applicationViewMode === 'card'}
              className={applicationViewMode === 'card' ? 'view-toggle view-toggle--active' : 'view-toggle'}
              onClick={() => setApplicationViewMode('card')}
              type="button"
            >
              卡片视图
            </button>
            <button
              aria-pressed={applicationViewMode === 'list'}
              className={applicationViewMode === 'list' ? 'view-toggle view-toggle--active' : 'view-toggle'}
              onClick={() => setApplicationViewMode('list')}
              type="button"
            >
              列表视图
            </button>
          </section>

          {errorMessage ? <p className="form-error board-feedback">{errorMessage}</p> : null}
          {isLoading ? <p className="board-feedback">正在加载申请列表...</p> : null}

          {!isLoading ? (
            applicationViewMode === 'card' ? (
              <DndContext onDragEnd={(event) => void handleDragEnd(event)} onDragStart={handleDragStart} sensors={sensors}>
                <section className="board-grid" aria-label="申请阶段看板">
                  {APPLICATION_STAGES.map((stage) => {
                    const stageApplications = applicationsByStage.get(stage) ?? []

                    return (
                      <SortableContext
                        items={stageApplications.map((application) => application.id)}
                        key={stage}
                        strategy={verticalListSortingStrategy}
                      >
                        <BoardColumn count={stageApplications.length} key={stage} stage={stage}>
                          {stageApplications.length === 0 ? (
                            <div className="empty-card">当前阶段还没有申请记录</div>
                          ) : (
                            <div className="application-list">
                              {stageApplications.map((application) => (
                                <ApplicationCard
                                  application={application}
                                  isDragging={draggingApplicationId === application.id}
                                  key={application.id}
                                  onDelete={deletingApplicationId ? undefined : (item) => void handleDelete(item)}
                                  onEdit={openEditForm}
                                />
                              ))}
                            </div>
                          )}
                        </BoardColumn>
                      </SortableContext>
                    )
                  })}
                </section>
              </DndContext>
            ) : (
              <ApplicationTable
                applications={applications}
                isDeleting={Boolean(deletingApplicationId)}
                onDelete={(application) => void handleDelete(application)}
                onEdit={openEditForm}
              />
            )
          ) : null}
        </>
      ) : (
        <ApplicationCalendar applications={applications} />
      )}
    </main>
  )
}
