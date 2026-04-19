import { getDeadlineMeta } from '@/lib/deadlines'
import {
  APPLICATION_RESULT_STATUS_LABELS,
  type Application,
} from '@/types/application'

interface ApplicationTableProps {
  applications: Application[]
  isDeleting: boolean
  onDelete: (application: Application) => void
  onEdit: (application: Application) => void
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
              <th scope="col">笔记</th>
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
                  <td>
                    <span className={`result-status-badge result-status-badge--${application.result_status}`}>
                      {APPLICATION_RESULT_STATUS_LABELS[application.result_status]}
                    </span>
                  </td>
                  <td>
                    {application.notes?.trim() ? <span className="note-badge">有笔记</span> : <span className="application-table__empty-note">—</span>}
                  </td>
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
