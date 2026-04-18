import type { Application, ApplicationResultStatus } from '@/types/application'
import { getDeadlineMeta } from '@/lib/deadlines'

interface ApplicationTableProps {
  applications: Application[]
  isDeleting: boolean
  onDelete: (application: Application) => void
  onEdit: (application: Application) => void
}

const RESULT_STATUS_LABELS: Record<ApplicationResultStatus, string> = {
  ongoing: '进行中',
  success: '成功',
  failed: '失败',
  withdrawn: '主动放弃',
}

export function ApplicationTable({ applications, isDeleting, onDelete, onEdit }: ApplicationTableProps) {
  if (applications.length === 0) {
    return <div className="empty-card application-table-empty">暂无申请记录</div>
  }

  return (
    <section className="application-table-card" aria-label="申请列表视图">
      <div className="application-table-wrap">
        <table className="application-table">
          <thead>
            <tr>
              <th scope="col">公司名称</th>
              <th scope="col">岗位名称</th>
              <th scope="col">当前阶段</th>
              <th scope="col">下一个 DDL</th>
              <th scope="col">结果状态</th>
              <th scope="col">操作</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => {
              const deadlineMeta = getDeadlineMeta(application.next_deadline)

              return (
                <tr key={application.id}>
                  <td className="application-table__strong">{application.company_name}</td>
                  <td>{application.job_title}</td>
                  <td>
                    <span className="application-table__stage">{application.stage}</span>
                  </td>
                  <td>
                    <span className={`application-table__deadline application-table__deadline--${deadlineMeta.status}`}>
                      {deadlineMeta.label}
                    </span>
                  </td>
                  <td>{RESULT_STATUS_LABELS[application.result_status]}</td>
                  <td>
                    <div className="application-table__actions">
                      <button className="text-button" onClick={() => onEdit(application)} type="button">
                        编辑
                      </button>
                      <button
                        className="text-button application-card__delete"
                        disabled={isDeleting}
                        onClick={() => onDelete(application)}
                        type="button"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
