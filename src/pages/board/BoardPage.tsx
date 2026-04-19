import { useMemo, useState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSearchParams } from 'react-router-dom'
import { ApplicationCard, ApplicationTable, BoardColumn } from '@/components'
import { ROUTES } from '@/constants/routes'
import { APPLICATION_STAGES } from '@/constants/stages'
import { useApplications } from '@/hooks'
import { groupApplicationsByStage } from '@/lib/application-groups'
import type {
  Application,
  ApplicationStage,
  CreateApplicationInput,
  UpdateApplicationInput,
} from '@/types/application'
import { APPLICATION_RESULT_STATUS_OPTIONS } from '@/types/application'

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
type ApplicationViewMode = 'card' | 'list'

export function BoardPage() {
  const {
    applications,
    createApplicationItem,
    deleteApplicationItem,
    errorMessage,
    isLoading,
    moveApplicationStage,
    updateApplicationItem,
  } = useApplications()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>('create')
  const [editingApplicationId, setEditingApplicationId] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<CreateApplicationInput>(INITIAL_FORM_VALUES)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingApplicationId, setDeletingApplicationId] = useState<string | null>(null)
  const [draggingApplicationId, setDraggingApplicationId] = useState<string | null>(null)

  const applicationViewMode: ApplicationViewMode = searchParams.get('view') === 'list' ? 'list' : 'card'
  const applicationsByStage = useMemo(() => groupApplicationsByStage(applications), [applications])
  const formTitle = formMode === 'create' ? '快速录入申请' : '编辑申请信息'
  const submitLabel = formMode === 'create' ? '创建申请' : '保存修改'

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

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
      [field]: field === 'next_deadline' || field === 'applied_at'
        ? (value ? value : null)
        : value,
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
      notes: formValues.notes?.trim() ? formValues.notes.trim() : null,
      jd_url: formValues.jd_url?.trim() ? formValues.jd_url.trim() : null,
      jd_snapshot: formValues.jd_snapshot?.trim() ? formValues.jd_snapshot.trim() : null,
      resume_version: formValues.resume_version?.trim() ? formValues.resume_version.trim() : null,
      contact_info: formValues.contact_info?.trim() ? formValues.contact_info.trim() : null,
      reminder_dismissed_at: formValues.reminder_dismissed_at,
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      if (formMode === 'create') {
        await createApplicationItem(payload)
      } else {
        if (!editingApplicationId) {
          throw new Error('未找到要编辑的申请记录')
        }

        await updateApplicationItem(editingApplicationId, payload as UpdateApplicationInput)
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

    try {
      await deleteApplicationItem(application.id)

      if (editingApplicationId === application.id) {
        closeForm()
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '删除申请失败，请稍后重试')
    } finally {
      setDeletingApplicationId(null)
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setDraggingApplicationId(typeof event.active.id === 'string' ? event.active.id : null)
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

    try {
      await moveApplicationStage(activeId, overStage)
    } catch {
      // 错误信息由共享数据层负责写入
    }
  }

  function updateViewMode(view: ApplicationViewMode) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('view', view)
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <main className="dashboard-page dashboard-page--board">
      <section className="hero-card hero-card--stacked">
        <div className="hero-card__top">
          <div>
            <p className="section-label">快速录入</p>
            <h2>新增与编辑申请</h2>
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
                <span>投递日期</span>
                <input
                  onChange={(event) => handleInputChange('applied_at', event.target.value)}
                  type="date"
                  value={formValues.applied_at ?? ''}
                />
              </label>

              <label className="field-label">
                <span>结果状态</span>
                <select
                  onChange={(event) => handleInputChange('result_status', event.target.value)}
                  value={formValues.result_status}
                >
                  {APPLICATION_RESULT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
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

            <div className="quick-form__grid quick-form__grid--details">
              <label className="field-label quick-form__notes-field">
                <span>笔记</span>
                <textarea
                  className="quick-form__notes-input"
                  onChange={(event) => handleInputChange('notes', event.target.value)}
                  placeholder="记录笔试题目、面试反馈、沟通要点等纯文本内容"
                  rows={5}
                  value={formValues.notes ?? ''}
                />
              </label>

              <label className="field-label">
                <span>JD 链接</span>
                <input
                  onChange={(event) => handleInputChange('jd_url', event.target.value)}
                  placeholder="https://..."
                  type="url"
                  value={formValues.jd_url ?? ''}
                />
              </label>

              <label className="field-label">
                <span>JD 摘要</span>
                <textarea
                  onChange={(event) => handleInputChange('jd_snapshot', event.target.value)}
                  placeholder="复制岗位要求或关键信息"
                  rows={4}
                  value={formValues.jd_snapshot ?? ''}
                />
              </label>

              <label className="field-label">
                <span>简历版本</span>
                <input
                  onChange={(event) => handleInputChange('resume_version', event.target.value)}
                  placeholder="例如：前端-平台版"
                  type="text"
                  value={formValues.resume_version ?? ''}
                />
              </label>

              <label className="field-label">
                <span>联系信息</span>
                <textarea
                  onChange={(event) => handleInputChange('contact_info', event.target.value)}
                  placeholder="记录 HR、面试官或沟通渠道"
                  rows={4}
                  value={formValues.contact_info ?? ''}
                />
              </label>
            </div>

            {formError ? <p className="form-error">{formError}</p> : null}

            <div className="quick-form__actions">
              <div>
                <p className="quick-form__title">{formTitle}</p>
                <p className="quick-form__hint">提交成功后会立即同步到当前看板与资料库。</p>
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
          onClick={() => updateViewMode('card')}
          type="button"
        >
          看板视图
        </button>
        <button
          aria-pressed={applicationViewMode === 'list'}
          className={applicationViewMode === 'list' ? 'view-toggle view-toggle--active' : 'view-toggle'}
          onClick={() => updateViewMode('list')}
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
    </main>
  )
}
