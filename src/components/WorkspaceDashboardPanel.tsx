import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import '../styles/workspace-dashboard.css'

const CALCULATIONS_KEY =
  'cheme-toolkit.saved-calculations.v1'

const COMPARISONS_KEY =
  'cheme-toolkit.saved-comparisons.v1'

const PROJECTS_KEY =
  'cheme-toolkit.project-workspaces.v1'

const LAST_BACKUP_KEY =
  'cheme-toolkit.last-backup-at.v1'

const OPEN_TARGET_EVENT =
  'cheme-toolkit:workspace-open-target'

const PENDING_TARGET_KEY =
  'cheme-toolkit.pending-workspace-target.v1'

const DATA_EVENTS = [
  'cheme-toolkit:personal-data-changed',
  'cheme-toolkit:saved-calculations-changed',
  'cheme-toolkit:saved-comparisons-changed',
  'cheme-toolkit:project-workspaces-changed',
  'cheme-toolkit:backup-exported',
]

type DashboardTab =
  | 'records'
  | 'compare'
  | 'projects'
  | 'data'
  | 'search'
  | 'metadata'
  | 'management'

type RecordType =
  | 'calculation'
  | 'comparison'

type Status =
  | 'idle'
  | 'opened'

interface WorkspaceDashboardPanelProps {
  onOpenCalculator: (
    calculatorId: string,
  ) => void

  onOpenTab: (
    tabId: DashboardTab,
  ) => void
}

interface DashboardRecord {
  id: string
  type: RecordType
  name: string
  calculatorId: string
  calculatorTitle: string
  category: string
  createdAt: string
  tags: string[]
  notes: string
}

interface DashboardProject {
  id: string
  name: string
  description: string
  updatedAt: string
  calculationIds: string[]
  comparisonIds: string[]
}

interface DashboardData {
  calculations: DashboardRecord[]
  comparisons: DashboardRecord[]
  projects: DashboardProject[]
  lastBackupAt: string
}

interface PopularTag {
  name: string
  count: number
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}

function readArray(
  key: string,
): unknown[] {
  try {
    const raw =
      localStorage.getItem(key)

    if (!raw) {
      return []
    }

    const parsed: unknown =
      JSON.parse(raw)

    return Array.isArray(parsed)
      ? parsed
      : []
  } catch {
    return []
  }
}

function normalizeTags(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  const seen =
    new Set<string>()

  return value
    .filter(
      (tag): tag is string =>
        typeof tag === 'string',
    )
    .map((tag) =>
      tag
        .trim()
        .replace(/\s+/g, ' '),
    )
    .filter((tag) => {
      if (!tag) {
        return false
      }

      const key =
        tag.toLocaleLowerCase(
          'en-US',
        )

      if (seen.has(key)) {
        return false
      }

      seen.add(key)
      return true
    })
}

function readRecords(
  type: RecordType,
): DashboardRecord[] {
  const storageKey =
    type === 'calculation'
      ? CALCULATIONS_KEY
      : COMPARISONS_KEY

  return readArray(storageKey)
    .flatMap((value) => {
      if (
        !isRecord(value) ||
        typeof value.id !==
          'string' ||
        typeof value.name !==
          'string'
      ) {
        return []
      }

      const notes =
        type === 'calculation'
          ? (
              typeof value.notes ===
              'string'
                ? value.notes
                : ''
            )
          : (
              typeof value.description ===
              'string'
                ? value.description
                : ''
            )

      return [{
        id: value.id,
        type,
        name: value.name,
        calculatorId:
          typeof value.calculatorId ===
          'string'
            ? value.calculatorId
            : '',
        calculatorTitle:
          typeof value.calculatorTitle ===
          'string'
            ? value.calculatorTitle
            : 'Unknown calculator',
        category:
          typeof value.category ===
          'string'
            ? value.category
            : 'Uncategorized',
        createdAt:
          typeof value.createdAt ===
          'string'
            ? value.createdAt
            : '',
        tags:
          normalizeTags(
            value.tags,
          ),
        notes,
      }]
    })
}

function readProjects():
  DashboardProject[] {
  return readArray(
    PROJECTS_KEY,
  ).flatMap((value) => {
    if (
      !isRecord(value) ||
      typeof value.id !==
        'string' ||
      typeof value.name !==
        'string'
    ) {
      return []
    }

    const calculationIds =
      Array.isArray(
        value.calculationIds,
      )
        ? value.calculationIds.filter(
            (
              id,
            ): id is string =>
              typeof id === 'string',
          )
        : []

    const comparisonIds =
      Array.isArray(
        value.comparisonIds,
      )
        ? value.comparisonIds.filter(
            (
              id,
            ): id is string =>
              typeof id === 'string',
          )
        : []

    const createdAt =
      typeof value.createdAt ===
      'string'
        ? value.createdAt
        : ''

    return [{
      id: value.id,
      name: value.name,
      description:
        typeof value.description ===
        'string'
          ? value.description
          : '',
      updatedAt:
        typeof value.updatedAt ===
        'string'
          ? value.updatedAt
          : createdAt,
      calculationIds,
      comparisonIds,
    }]
  })
}

function readDashboardData():
  DashboardData {
  let lastBackupAt = ''

  try {
    lastBackupAt =
      localStorage.getItem(
        LAST_BACKUP_KEY,
      ) ?? ''
  } catch {
    lastBackupAt = ''
  }

  return {
    calculations:
      readRecords(
        'calculation',
      ),
    comparisons:
      readRecords(
        'comparison',
      ),
    projects:
      readProjects(),
    lastBackupAt,
  }
}

function timestamp(
  value: string,
): number {
  const parsed =
    Date.parse(value)

  return Number.isNaN(parsed)
    ? 0
    : parsed
}

function formatDate(
  value: string,
): string {
  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Unknown date'
  }

  return new Intl.DateTimeFormat(
    'tr-TR',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  ).format(date)
}

function recordTypeLabel(
  type: RecordType,
): string {
  return type ===
    'calculation'
    ? 'Saved calculation'
    : 'Comparison snapshot'
}

export function WorkspaceDashboardPanel({
  onOpenCalculator,
  onOpenTab,
}: WorkspaceDashboardPanelProps) {
  const [
    data,
    setData,
  ] = useState<DashboardData>(
    readDashboardData,
  )

  const [
    status,
    setStatus,
  ] = useState<Status>(
    'idle',
  )

  const allRecords =
    useMemo(
      () => [
        ...data.calculations,
        ...data.comparisons,
      ],
      [
        data.calculations,
        data.comparisons,
      ],
    )

  const recentRecords =
    useMemo(
      () =>
        [...allRecords]
          .sort(
            (first, second) =>
              timestamp(
                second.createdAt,
              ) -
              timestamp(
                first.createdAt,
              ),
          )
          .slice(0, 6),
      [allRecords],
    )

  const recentProjects =
    useMemo(
      () =>
        [...data.projects]
          .sort(
            (first, second) =>
              timestamp(
                second.updatedAt,
              ) -
              timestamp(
                first.updatedAt,
              ),
          )
          .slice(0, 4),
      [data.projects],
    )

  const popularTags =
    useMemo<PopularTag[]>(
      () => {
        const counts =
          new Map<
            string,
            PopularTag
          >()

        allRecords.forEach(
          (record) => {
            record.tags.forEach(
              (tag) => {
                const key =
                  tag.toLocaleLowerCase(
                    'en-US',
                  )

                const existing =
                  counts.get(key)

                if (existing) {
                  existing.count += 1
                  return
                }

                counts.set(
                  key,
                  {
                    name: tag,
                    count: 1,
                  },
                )
              },
            )
          },
        )

        return Array.from(
          counts.values(),
        )
          .sort(
            (first, second) =>
              second.count -
                first.count ||
              first.name.localeCompare(
                second.name,
              ),
          )
          .slice(0, 8)
      },
      [allRecords],
    )

  const incompleteRecords =
    useMemo(
      () =>
        allRecords.filter(
          (record) =>
            record.tags.length ===
              0 ||
            !record.notes.trim(),
        ),
      [allRecords],
    )

  const completeRecords =
    allRecords.length -
    incompleteRecords.length

  const metadataPercentage =
    allRecords.length === 0
      ? 0
      : Math.round(
          (
            completeRecords /
            allRecords.length
          ) * 100,
        )

  const projectFileCount =
    data.projects.reduce(
      (total, project) =>
        total +
        project.calculationIds
          .length +
        project.comparisonIds
          .length,
      0,
    )

  function refreshData() {
    setData(
      readDashboardData(),
    )
  }

  useEffect(() => {
    DATA_EVENTS.forEach(
      (eventName) => {
        window.addEventListener(
          eventName,
          refreshData,
        )
      },
    )

    window.addEventListener(
      'storage',
      refreshData,
    )

    window.addEventListener(
      'focus',
      refreshData,
    )

    return () => {
      DATA_EVENTS.forEach(
        (eventName) => {
          window.removeEventListener(
            eventName,
            refreshData,
          )
        },
      )

      window.removeEventListener(
        'storage',
        refreshData,
      )

      window.removeEventListener(
        'focus',
        refreshData,
      )
    }
  }, [])

  useEffect(() => {
    if (status === 'idle') {
      return
    }

    const timer =
      window.setTimeout(
        () =>
          setStatus('idle'),
        2200,
      )

    return () =>
      window.clearTimeout(timer)
  }, [status])

  function scrollToWorkspace() {
    window.setTimeout(() => {
      document
        .querySelector(
          '#engineering-workspace',
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
    }, 160)
  }

  function openRecord(
    record: DashboardRecord,
  ) {
    const destination:
      DashboardTab =
      record.type ===
      'calculation'
        ? 'records'
        : 'compare'

    sessionStorage.setItem(
      PENDING_TARGET_KEY,
      JSON.stringify({
        type: record.type,
        id: record.id,
      }),
    )

    window.dispatchEvent(
      new CustomEvent(
        OPEN_TARGET_EVENT,
        {
          detail: {
            type: record.type,
            id: record.id,
          },
        },
      ),
    )

    if (record.calculatorId) {
      onOpenCalculator(
        record.calculatorId,
      )
    }

    onOpenTab(destination)
    setStatus('opened')
    scrollToWorkspace()
  }

  function openProject(
    project: DashboardProject,
  ) {
    sessionStorage.setItem(
      PENDING_TARGET_KEY,
      JSON.stringify({
        type: 'project',
        id: project.id,
      }),
    )

    window.dispatchEvent(
      new CustomEvent(
        OPEN_TARGET_EVENT,
        {
          detail: {
            type: 'project',
            id: project.id,
          },
        },
      ),
    )

    onOpenTab('projects')
    setStatus('opened')
    scrollToWorkspace()
  }

  function openSection(
    tab: DashboardTab,
  ) {
    onOpenTab(tab)
    scrollToWorkspace()
  }

  return (
    <section
      className="workspace-dashboard-panel"
      aria-label="Engineering workspace overview"
    >
      <header className="workspace-dashboard-header">
        <div>
          <span>
            Smart workspace overview
          </span>

          <h3>
            Engineering dashboard
          </h3>

          <p>
            Review saved work, project activity,
            metadata quality and personal data
            health from one overview.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            openSection('search')
          }
        >
          Search workspace
          <span aria-hidden="true">
            →
          </span>
        </button>
      </header>

      <div className="workspace-dashboard-stats">
        <article>
          <span>
            Calculations
          </span>

          <strong>
            {data.calculations.length}
          </strong>

          <small>
            saved engineering cases
          </small>
        </article>

        <article>
          <span>
            Comparisons
          </span>

          <strong>
            {data.comparisons.length}
          </strong>

          <small>
            preserved snapshots
          </small>
        </article>

        <article>
          <span>
            Projects
          </span>

          <strong>
            {data.projects.length}
          </strong>

          <small>
            {projectFileCount}
            {' '}
            linked files
          </small>
        </article>

        <article>
          <span>
            Metadata health
          </span>

          <strong>
            {metadataPercentage}%
          </strong>

          <small>
            {completeRecords}
            {' '}
            complete records
          </small>
        </article>
      </div>

      <div className="workspace-dashboard-grid">
        <section className="workspace-dashboard-card workspace-dashboard-recent">
          <header>
            <div>
              <span>
                Latest activity
              </span>

              <h4>
                Recent saved work
              </h4>
            </div>

            <button
              type="button"
              onClick={() =>
                openSection('management')
              }
            >
              Manage all
            </button>
          </header>

          {recentRecords.length ===
          0 ? (
            <div className="workspace-dashboard-empty">
              <strong>
                No saved records yet
              </strong>

              <p>
                Save a calculation or comparison
                to begin the workspace history.
              </p>
            </div>
          ) : (
            <div className="workspace-dashboard-record-list">
              {recentRecords.map(
                (record) => (
                  <article
                    key={`${record.type}-${record.id}`}
                  >
                    <div>
                      <span>
                        {recordTypeLabel(
                          record.type,
                        )}
                      </span>

                      <strong>
                        {record.name}
                      </strong>

                      <small>
                        {
                          record.calculatorTitle
                        }
                        {' · '}
                        {formatDate(
                          record.createdAt,
                        )}
                      </small>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openRecord(
                          record,
                        )
                      }
                    >
                      Open
                    </button>
                  </article>
                ),
              )}
            </div>
          )}
        </section>

        <section className="workspace-dashboard-card workspace-dashboard-projects">
          <header>
            <div>
              <span>
                Project filing
              </span>

              <h4>
                Project overview
              </h4>
            </div>

            <button
              type="button"
              onClick={() =>
                openSection('projects')
              }
            >
              All projects
            </button>
          </header>

          {recentProjects.length ===
          0 ? (
            <div className="workspace-dashboard-empty">
              <strong>
                No projects created
              </strong>

              <p>
                Create a project to organize
                related calculations and
                comparisons.
              </p>
            </div>
          ) : (
            <div className="workspace-dashboard-project-list">
              {recentProjects.map(
                (project) => {
                  const fileCount =
                    project
                      .calculationIds
                      .length +
                    project
                      .comparisonIds
                      .length

                  return (
                    <article
                      key={project.id}
                    >
                      <div>
                        <strong>
                          {project.name}
                        </strong>

                        <p>
                          {project.description ||
                            'No project description.'}
                        </p>

                        <small>
                          {fileCount}
                          {' '}
                          file
                          {fileCount === 1
                            ? ''
                            : 's'}
                          {' · '}
                          Updated
                          {' '}
                          {formatDate(
                            project.updatedAt,
                          )}
                        </small>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openProject(
                            project,
                          )
                        }
                      >
                        Open
                      </button>
                    </article>
                  )
                },
              )}
            </div>
          )}
        </section>

        <section className="workspace-dashboard-card workspace-dashboard-tags">
          <header>
            <div>
              <span>
                Workspace taxonomy
              </span>

              <h4>
                Popular tags
              </h4>
            </div>

            <button
              type="button"
              onClick={() =>
                openSection('metadata')
              }
            >
              Edit tags
            </button>
          </header>

          {popularTags.length === 0 ? (
            <div className="workspace-dashboard-empty">
              <strong>
                No tags added
              </strong>

              <p>
                Add tags to create a searchable
                engineering filing system.
              </p>
            </div>
          ) : (
            <div className="workspace-dashboard-tag-list">
              {popularTags.map(
                (tag) => (
                  <button
                    key={tag.name}
                    type="button"
                    onClick={() =>
                      openSection(
                        'search',
                      )
                    }
                  >
                    <span>
                      {tag.name}
                    </span>

                    <strong>
                      {tag.count}
                    </strong>
                  </button>
                ),
              )}
            </div>
          )}
        </section>

        <section className="workspace-dashboard-card workspace-dashboard-health">
          <header>
            <div>
              <span>
                Data quality
              </span>

              <h4>
                Workspace health
              </h4>
            </div>
          </header>

          <div className="workspace-dashboard-health-grid">
            <article>
              <span>
                Missing metadata
              </span>

              <strong>
                {
                  incompleteRecords.length
                }
              </strong>

              <button
                type="button"
                onClick={() =>
                  openSection(
                    'management',
                  )
                }
              >
                Review records
              </button>
            </article>

            <article>
              <span>
                Last backup
              </span>

              <strong>
                {data.lastBackupAt
                  ? formatDate(
                      data.lastBackupAt,
                    )
                  : 'Not exported yet'}
              </strong>

              <button
                type="button"
                onClick={() =>
                  openSection('data')
                }
              >
                Backup data
              </button>
            </article>
          </div>

          {incompleteRecords.length >
          0 ? (
            <div className="workspace-dashboard-incomplete">
              <span>
                Records requiring attention
              </span>

              {incompleteRecords
                .slice(0, 4)
                .map((record) => (
                  <button
                    key={`${record.type}-${record.id}`}
                    type="button"
                    onClick={() =>
                      openSection(
                        'management',
                      )
                    }
                  >
                    <strong>
                      {record.name}
                    </strong>

                    <small>
                      {record.tags.length ===
                      0
                        ? 'Missing tags'
                        : 'Missing notes'}
                    </small>
                  </button>
                ))}
            </div>
          ) : null}
        </section>
      </div>

      <div className="workspace-dashboard-actions">
        <button
          type="button"
          onClick={() =>
            openSection('records')
          }
        >
          Save & History
        </button>

        <button
          type="button"
          onClick={() =>
            openSection('management')
          }
        >
          Manage records
        </button>

        <button
          type="button"
          onClick={() =>
            openSection('metadata')
          }
        >
          Tags & Notes
        </button>

        <button
          type="button"
          onClick={() =>
            openSection('data')
          }
        >
          Data & Backup
        </button>
      </div>

      <p
        className="workspace-dashboard-status"
        aria-live="polite"
      >
        {status === 'opened'
          ? 'Workspace record opened.'
          : null}
      </p>
    </section>
  )
}
