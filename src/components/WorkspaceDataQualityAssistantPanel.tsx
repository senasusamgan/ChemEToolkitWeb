import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import '../styles/workspace-data-quality-assistant.css'

const STORAGE_KEYS = {
  calculations:
    'cheme-toolkit.saved-calculations.v1',
  comparisons:
    'cheme-toolkit.saved-comparisons.v1',
  projects:
    'cheme-toolkit.project-workspaces.v1',
  templates:
    'cheme-toolkit.workspace-templates.v1',
  collections:
    'cheme-toolkit.workspace-collections.v1',
  reports:
    'cheme-toolkit.workspace-reports.v1',
} as const

const DATA_EVENTS = [
  'cheme-toolkit:personal-data-changed',
  'cheme-toolkit:saved-calculations-changed',
  'cheme-toolkit:saved-comparisons-changed',
  'cheme-toolkit:project-workspaces-changed',
  'cheme-toolkit:workspace-templates-changed',
  'cheme-toolkit:workspace-collections-changed',
  'cheme-toolkit:workspace-reports-changed',
]

type RecordType =
  | 'calculation'
  | 'comparison'
  | 'project'
  | 'template'
  | 'collection'
  | 'report'

type IssueSeverity =
  | 'attention'
  | 'improvement'
  | 'information'

type WorkspaceTarget =
  | 'records'
  | 'compare'
  | 'projects'
  | 'reports'
  | 'metadata'
  | 'management'
  | 'templates'
  | 'collections'
  | 'data'

interface WorkspaceDataQualityAssistantPanelProps {
  onOpenTab: (
    tab: WorkspaceTarget,
  ) => void
}

interface QualityRecord {
  id: string
  type: RecordType
  title: string
  updatedAt: string
  hasTitle: boolean
  hasDate: boolean
  hasTags: boolean
  hasNotes: boolean
  metadataEligible: boolean
  structuralEligible: boolean
  relatedCount: number
  checks: number
  passedChecks: number
}

interface QualityIssue {
  id: string
  recordId: string
  recordType: RecordType
  recordTitle: string
  code: string
  severity: IssueSeverity
  title: string
  description: string
  recommendation: string
  target: WorkspaceTarget
}

interface QualitySnapshot {
  records: QualityRecord[]
  issues: QualityIssue[]
  checkedAt: string
}

interface SourceConfig {
  type: RecordType
  key: string
  target: WorkspaceTarget
  metadataEligible: boolean
  structuralEligible: boolean
}

const SOURCES: SourceConfig[] = [
  {
    type: 'calculation',
    key:
      STORAGE_KEYS.calculations,
    target: 'records',
    metadataEligible: true,
    structuralEligible: false,
  },
  {
    type: 'comparison',
    key:
      STORAGE_KEYS.comparisons,
    target: 'compare',
    metadataEligible: true,
    structuralEligible: false,
  },
  {
    type: 'project',
    key:
      STORAGE_KEYS.projects,
    target: 'projects',
    metadataEligible: false,
    structuralEligible: true,
  },
  {
    type: 'template',
    key:
      STORAGE_KEYS.templates,
    target: 'templates',
    metadataEligible: true,
    structuralEligible: false,
  },
  {
    type: 'collection',
    key:
      STORAGE_KEYS.collections,
    target: 'collections',
    metadataEligible: false,
    structuralEligible: true,
  },
  {
    type: 'report',
    key:
      STORAGE_KEYS.reports,
    target: 'reports',
    metadataEligible: false,
    structuralEligible: true,
  },
]

const TYPE_LABELS:
  Record<RecordType, string> = {
    calculation: 'Calculations',
    comparison: 'Comparisons',
    project: 'Projects',
    template: 'Templates',
    collection: 'Collections',
    report: 'Reports',
  }

const SEVERITY_LABELS:
  Record<IssueSeverity, string> = {
    attention:
      'Needs attention',
    improvement:
      'Recommended improvement',
    information:
      'Organization suggestion',
  }

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray(value) === false
  )
}

function readArray(
  key: string,
): unknown[] {
  try {
    const raw =
      localStorage.getItem(key)

    if (raw === null) {
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

function readString(
  record: Record<string, unknown>,
  keys: string[],
): string {
  for (const key of keys) {
    const value =
      record[key]

    if (
      typeof value === 'string' &&
      value.trim().length > 0
    ) {
      return value.trim()
    }
  }

  return ''
}

function hasTextArray(
  value: unknown,
): boolean {
  return (
    Array.isArray(value) &&
    value.some(
      (item) =>
        typeof item === 'string' &&
        item.trim().length > 0,
    )
  )
}

function isValidDate(
  value: string,
): boolean {
  if (value.length === 0) {
    return false
  }

  return Number.isNaN(
    Date.parse(value),
  ) === false
}

function relatedCount(
  record: Record<string, unknown>,
): number {
  const keys = [
    'items',
    'records',
    'sections',
    'calculationIds',
    'comparisonIds',
    'recordIds',
    'selectedIds',
  ]

  let total = 0

  keys.forEach((key) => {
    const value =
      record[key]

    if (Array.isArray(value)) {
      total += value.length
    }
  })

  return total
}

function createIssue(
  record: QualityRecord,
  code: string,
  severity: IssueSeverity,
  title: string,
  description: string,
  recommendation: string,
  target: WorkspaceTarget,
): QualityIssue {
  return {
    id:
      record.type +
      '-' +
      record.id +
      '-' +
      code,
    recordId:
      record.id,
    recordType:
      record.type,
    recordTitle:
      record.title ||
      'Untitled workspace record',
    code,
    severity,
    title,
    description,
    recommendation,
    target,
  }
}

function readQualitySnapshot():
  QualitySnapshot {
  const records:
    QualityRecord[] = []

  const issues:
    QualityIssue[] = []

  SOURCES.forEach((source) => {
    readArray(
      source.key,
    ).forEach(
      (value, index) => {
        if (
          isRecord(value) === false
        ) {
          return
        }

        const id =
          readString(
            value,
            ['id'],
          ) ||
          source.type +
          '-' +
          String(index)

        const title =
          readString(
            value,
            [
              'title',
              'name',
              'calculatorTitle',
              'moduleTitle',
            ],
          )

        const updatedAt =
          readString(
            value,
            [
              'updatedAt',
              'createdAt',
              'savedAt',
              'generatedAt',
            ],
          )

        const hasTitle =
          title.length > 0

        const hasDate =
          isValidDate(updatedAt)

        const hasTags =
          hasTextArray(
            value.tags,
          )

        const hasNotes =
          readString(
            value,
            [
              'notes',
              'description',
              'purpose',
              'subtitle',
              'executiveSummary',
              'conclusion',
            ],
          ).length > 0

        const linkedItems =
          relatedCount(value)

        let checks = 2
        let passedChecks = 0

        if (hasTitle) {
          passedChecks += 1
        }

        if (hasDate) {
          passedChecks += 1
        }

        if (
          source.metadataEligible
        ) {
          checks += 2

          if (hasTags) {
            passedChecks += 1
          }

          if (hasNotes) {
            passedChecks += 1
          }
        }

        if (
          source.structuralEligible
        ) {
          checks += 1

          if (linkedItems > 0) {
            passedChecks += 1
          }
        }

        const record:
          QualityRecord = {
            id,
            type: source.type,
            title,
            updatedAt,
            hasTitle,
            hasDate,
            hasTags,
            hasNotes,
            metadataEligible:
              source.metadataEligible,
            structuralEligible:
              source.structuralEligible,
            relatedCount:
              linkedItems,
            checks,
            passedChecks,
          }

        records.push(record)

        if (hasTitle === false) {
          issues.push(
            createIssue(
              record,
              'missing-title',
              'attention',
              'Record title is missing',
              'This record is difficult to identify in search, reports and project views.',
              'Add a clear engineering title that describes the case or result.',
              'management',
            ),
          )
        }

        if (hasDate === false) {
          issues.push(
            createIssue(
              record,
              'missing-date',
              'attention',
              'Activity date is unavailable',
              'The record cannot be placed reliably in activity and recency views.',
              'Review or recreate the record so that it contains a valid saved or updated date.',
              'management',
            ),
          )
        }

        if (
          source.metadataEligible &&
          hasTags === false
        ) {
          issues.push(
            createIssue(
              record,
              'missing-tags',
              'improvement',
              'Searchable tags are missing',
              'The record has no tags for engineering topic, process or project context.',
              'Add concise tags such as category, equipment, method or project name.',
              'metadata',
            ),
          )
        }

        if (
          source.metadataEligible &&
          hasNotes === false
        ) {
          issues.push(
            createIssue(
              record,
              'missing-notes',
              'improvement',
              'Descriptive notes are missing',
              'The engineering purpose, assumptions or interpretation are not documented.',
              'Add a short note describing why the case was saved and what the result means.',
              'metadata',
            ),
          )
        }

        if (
          source.structuralEligible &&
          linkedItems === 0
        ) {
          issues.push(
            createIssue(
              record,
              'empty-structure',
              'information',
              'Workspace structure is empty',
              'This record does not currently contain linked calculations, records or report sections.',
              'Add relevant engineering records or remove the empty structure when it is no longer required.',
              source.target,
            ),
          )
        }
      },
    )
  })

  return {
    records,
    issues,
    checkedAt:
      new Date().toISOString(),
  }
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
    return 'Not available'
  }

  return new Intl.DateTimeFormat(
    'tr-TR',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  ).format(date)
}

function normalize(
  value: string,
): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .trim()
}

function exportQualityReport(
  snapshot: QualitySnapshot,
) {
  const payload = {
    schema:
      'cheme-toolkit.workspace-data-quality.v1',
    generatedAt:
      new Date().toISOString(),
    checkedAt:
      snapshot.checkedAt,
    recordCount:
      snapshot.records.length,
    issueCount:
      snapshot.issues.length,
    records:
      snapshot.records,
    issues:
      snapshot.issues,
  }

  const blob =
    new Blob(
      [
        JSON.stringify(
          payload,
          null,
          2,
        ),
      ],
      {
        type:
          'application/json;charset=utf-8;',
      },
    )

  const url =
    URL.createObjectURL(blob)

  const link =
    document.createElement('a')

  link.href = url
  link.download =
    'cheme-workspace-data-quality-' +
    new Date()
      .toISOString()
      .slice(0, 10) +
    '.json'

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

export function WorkspaceDataQualityAssistantPanel({
  onOpenTab,
}: WorkspaceDataQualityAssistantPanelProps) {
  const [
    snapshot,
    setSnapshot,
  ] = useState<QualitySnapshot>(
    readQualitySnapshot,
  )

  const [
    typeFilter,
    setTypeFilter,
  ] = useState<
    'all' | RecordType
  >('all')

  const [
    severityFilter,
    setSeverityFilter,
  ] = useState<
    'all' | IssueSeverity
  >('all')

  const [
    query,
    setQuery,
  ] = useState('')

  function refreshSnapshot() {
    setSnapshot(
      readQualitySnapshot(),
    )
  }

  useEffect(() => {
    function handleRefresh() {
      setSnapshot(
        readQualitySnapshot(),
      )
    }

    DATA_EVENTS.forEach(
      (eventName) => {
        window.addEventListener(
          eventName,
          handleRefresh,
        )
      },
    )

    window.addEventListener(
      'storage',
      handleRefresh,
    )

    window.addEventListener(
      'focus',
      handleRefresh,
    )

    return () => {
      DATA_EVENTS.forEach(
        (eventName) => {
          window.removeEventListener(
            eventName,
            handleRefresh,
          )
        },
      )

      window.removeEventListener(
        'storage',
        handleRefresh,
      )

      window.removeEventListener(
        'focus',
        handleRefresh,
      )
    }
  }, [])

  const summary =
    useMemo(
      () => {
        let checks = 0
        let passedChecks = 0

        snapshot.records.forEach(
          (record) => {
            checks += record.checks
            passedChecks +=
              record.passedChecks
          },
        )

        const qualityScore =
          checks === 0
            ? 100
            : Math.round(
                (
                  passedChecks /
                  checks
                ) * 100,
              )

        const metadataRecords =
          snapshot.records.filter(
            (record) =>
              record.metadataEligible,
          )

        const completeMetadata =
          metadataRecords.filter(
            (record) =>
              record.hasTags &&
              record.hasNotes,
          ).length

        return {
          qualityScore,
          checks,
          passedChecks,
          metadataRecords:
            metadataRecords.length,
          completeMetadata,
          attention:
            snapshot.issues.filter(
              (issue) =>
                issue.severity ===
                'attention',
            ).length,
          improvement:
            snapshot.issues.filter(
              (issue) =>
                issue.severity ===
                'improvement',
            ).length,
        }
      },
      [
        snapshot.issues,
        snapshot.records,
      ],
    )

  const filteredIssues =
    useMemo(
      () => {
        const cleanQuery =
          normalize(query)

        return snapshot.issues.filter(
          (issue) => {
            if (
              typeFilter !== 'all' &&
              issue.recordType !==
                typeFilter
            ) {
              return false
            }

            if (
              severityFilter !==
                'all' &&
              issue.severity !==
                severityFilter
            ) {
              return false
            }

            if (
              cleanQuery.length === 0
            ) {
              return true
            }

            const searchText =
              normalize(
                [
                  issue.recordTitle,
                  issue.title,
                  issue.description,
                  issue.recommendation,
                  issue.recordType,
                ].join(' '),
              )

            return searchText.includes(
              cleanQuery,
            )
          },
        )
      },
      [
        query,
        severityFilter,
        snapshot.issues,
        typeFilter,
      ],
    )

  const issueCodes =
    useMemo(
      () => {
        const counts =
          new Map<string, number>()

        snapshot.issues.forEach(
          (issue) => {
            counts.set(
              issue.code,
              (
                counts.get(
                  issue.code,
                ) ?? 0
              ) + 1,
            )
          },
        )

        return Array.from(
          counts.entries(),
        )
          .sort(
            (first, second) =>
              second[1] -
              first[1],
          )
          .slice(0, 4)
      },
      [snapshot.issues],
    )

  const recommendationLabels:
    Record<string, string> = {
      'missing-title':
        'Add clear record titles',
      'missing-date':
        'Restore record dates',
      'missing-tags':
        'Add searchable tags',
      'missing-notes':
        'Document assumptions and purpose',
      'empty-structure':
        'Populate empty workspace structures',
    }

  return (
    <section
      className="workspace-quality-assistant"
      aria-label="Workspace data quality assistant"
    >
      <header className="workspace-quality-header">
        <div>
          <span>
            Local workspace review
          </span>

          <h3>
            Data Quality Assistant
          </h3>

          <p>
            Review incomplete metadata, missing
            titles, invalid activity dates and
            empty workspace structures without
            sending personal engineering data
            outside this browser.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={refreshSnapshot}
          >
            Run quality check
          </button>

          <button
            type="button"
            disabled={
              snapshot.records.length ===
              0
            }
            onClick={() =>
              exportQualityReport(
                snapshot,
              )
            }
          >
            Export JSON report
          </button>
        </div>
      </header>

      <div className="workspace-quality-metrics">
        <article>
          <span>
            Quality score
          </span>

          <strong>
            {summary.qualityScore}%
          </strong>

          <small>
            {summary.passedChecks}
            {' / '}
            {summary.checks}
            {' '}
            checks passed
          </small>
        </article>

        <article>
          <span>
            Reviewed records
          </span>

          <strong>
            {snapshot.records.length}
          </strong>

          <small>
            across six record types
          </small>
        </article>

        <article>
          <span>
            Open findings
          </span>

          <strong>
            {snapshot.issues.length}
          </strong>

          <small>
            quality recommendations
          </small>
        </article>

        <article>
          <span>
            Needs attention
          </span>

          <strong>
            {summary.attention}
          </strong>

          <small>
            title or date problems
          </small>
        </article>

        <article>
          <span>
            Metadata ready
          </span>

          <strong>
            {summary.completeMetadata}
          </strong>

          <small>
            of
            {' '}
            {summary.metadataRecords}
            {' '}
            eligible records
          </small>
        </article>
      </div>

      <div className="workspace-quality-grid">
        <section className="workspace-quality-card">
          <header>
            <span>
              Priority guidance
            </span>

            <h4>
              Recommended next actions
            </h4>
          </header>

          {issueCodes.length ===
          0 ? (
            <div className="workspace-quality-healthy">
              <strong>
                Workspace quality looks healthy
              </strong>

              <p>
                No incomplete records or empty
                structures were found.
              </p>
            </div>
          ) : (
            <div className="workspace-quality-recommendations">
              {issueCodes.map(
                (
                  [
                    code,
                    count,
                  ],
                  index,
                ) => (
                  <article key={code}>
                    <span>
                      {String(
                        index + 1,
                      ).padStart(
                        2,
                        '0',
                      )}
                    </span>

                    <div>
                      <strong>
                        {
                          recommendationLabels[
                            code
                          ]
                        }
                      </strong>

                      <small>
                        {count}
                        {' '}
                        affected records
                      </small>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </section>

        <section className="workspace-quality-card">
          <header>
            <span>
              Quality workflow
            </span>

            <h4>
              Assistant shortcuts
            </h4>
          </header>

          <div className="workspace-quality-actions">
            <button
              type="button"
              onClick={() =>
                onOpenTab('metadata')
              }
            >
              <strong>
                Tags & Notes
              </strong>

              <span>
                Improve searchable metadata
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                onOpenTab(
                  'management',
                )
              }
            >
              <strong>
                Manage Records
              </strong>

              <span>
                Rename or remove records
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                onOpenTab('data')
              }
            >
              <strong>
                Data & Backup
              </strong>

              <span>
                Export a safe backup first
              </span>
            </button>
          </div>
        </section>
      </div>

      <div className="workspace-quality-controls">
        <label>
          <span>
            Search findings
          </span>

          <input
            type="search"
            value={query}
            placeholder="Search record names or recommendations"
            onChange={(event) =>
              setQuery(
                event.target.value,
              )
            }
          />
        </label>

        <label>
          <span>
            Record type
          </span>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value as
                  | 'all'
                  | RecordType,
              )
            }
          >
            <option value="all">
              All record types
            </option>

            {SOURCES.map(
              (source) => (
                <option
                  key={source.type}
                  value={source.type}
                >
                  {
                    TYPE_LABELS[
                      source.type
                    ]
                  }
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          <span>
            Priority
          </span>

          <select
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(
                event.target.value as
                  | 'all'
                  | IssueSeverity,
              )
            }
          >
            <option value="all">
              All priorities
            </option>

            <option value="attention">
              Needs attention
            </option>

            <option value="improvement">
              Recommended improvement
            </option>

            <option value="information">
              Organization suggestion
            </option>
          </select>
        </label>
      </div>

      <div className="workspace-quality-result-heading">
        <div>
          <span>
            Quality findings
          </span>

          <strong>
            {filteredIssues.length}
            {' '}
            visible recommendations
          </strong>
        </div>

        <small>
          Checked
          {' '}
          {formatDate(
            snapshot.checkedAt,
          )}
        </small>
      </div>

      {filteredIssues.length ===
      0 ? (
        <div className="workspace-quality-empty">
          <strong>
            No matching findings
          </strong>

          <p>
            The current filters contain no quality
            recommendations.
          </p>
        </div>
      ) : (
        <div className="workspace-quality-issues">
          {filteredIssues.map(
            (issue) => (
              <article
                key={issue.id}
                className={
                  'is-' +
                  issue.severity
                }
              >
                <span className="workspace-quality-status">
                  {issue.severity ===
                  'attention'
                    ? '!'
                    : issue.severity ===
                        'improvement'
                      ? '↑'
                      : 'i'}
                </span>

                <div>
                  <span>
                    {
                      TYPE_LABELS[
                        issue.recordType
                      ]
                    }
                    {' · '}
                    {
                      SEVERITY_LABELS[
                        issue.severity
                      ]
                    }
                  </span>

                  <strong>
                    {issue.title}
                  </strong>

                  <small>
                    {issue.recordTitle}
                  </small>

                  <p>
                    {issue.description}
                  </p>

                  <b>
                    Recommendation:
                    {' '}
                    {issue.recommendation}
                  </b>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onOpenTab(
                      issue.target,
                    )
                  }
                >
                  Open section
                </button>
              </article>
            ),
          )}
        </div>
      )}
    </section>
  )
}
