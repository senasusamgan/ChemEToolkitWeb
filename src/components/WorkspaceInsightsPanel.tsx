import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import '../styles/workspace-insights.css'

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
  lastBackup:
    'cheme-toolkit.last-backup-at.v1',
} as const

const DATA_EVENTS = [
  'cheme-toolkit:personal-data-changed',
  'cheme-toolkit:saved-calculations-changed',
  'cheme-toolkit:saved-comparisons-changed',
  'cheme-toolkit:project-workspaces-changed',
  'cheme-toolkit:workspace-templates-changed',
  'cheme-toolkit:workspace-collections-changed',
  'cheme-toolkit:workspace-reports-changed',
  'cheme-toolkit:backup-exported',
]

type InsightType =
  | 'calculation'
  | 'comparison'
  | 'project'
  | 'template'
  | 'collection'
  | 'report'

type InsightRange =
  | '7d'
  | '30d'
  | '90d'
  | 'all'

interface InsightItem {
  id: string
  type: InsightType
  category: string
  calculatorTitle: string
  createdAt: string
  updatedAt: string
  metadataComplete:
    | boolean
    | null
}

interface InsightsData {
  items: InsightItem[]
  lastBackupAt: string
}

interface CountEntry {
  name: string
  count: number
}

interface ActivityDay {
  key: string
  label: string
  fullLabel: string
  count: number
}

const RANGE_DAYS:
  Record<
    Exclude<
      InsightRange,
      'all'
    >,
    number
  > = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
  }

const RANGE_LABELS:
  Record<
    InsightRange,
    string
  > = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    all: 'All time',
  }

const TYPE_ORDER:
  InsightType[] = [
    'calculation',
    'comparison',
    'project',
    'template',
    'collection',
    'report',
  ]

const TYPE_LABELS:
  Record<
    InsightType,
    string
  > = {
    calculation: 'Calculations',
    comparison: 'Comparisons',
    project: 'Projects',
    template: 'Templates',
    collection: 'Collections',
    report: 'Reports',
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
  value: unknown,
): string {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

function hasTags(
  value: unknown,
): boolean {
  return (
    Array.isArray(value) &&
    value.some(
      (tag) =>
        typeof tag === 'string' &&
        tag.trim().length > 0,
    )
  )
}

function timestamp(
  value: string,
): number {
  const result =
    Date.parse(value)

  return Number.isNaN(result)
    ? 0
    : result
}

function dateKey(
  date: Date,
): string {
  const year =
    date.getFullYear()

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, '0')

  const day =
    String(
      date.getDate(),
    ).padStart(2, '0')

  return `${year}-${month}-${day}`
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

function readItems(
  type: InsightType,
  storageKey: string,
): InsightItem[] {
  return readArray(
    storageKey,
  ).flatMap((value) => {
    if (
      isRecord(value) === false
    ) {
      return []
    }

    const id =
      readString(value.id)

    if (id.length === 0) {
      return []
    }

    const createdAt =
      readString(
        value.createdAt,
      )

    const updatedAt =
      readString(
        value.updatedAt,
      ) || createdAt

    let category = ''
    let calculatorTitle = ''
    let metadataComplete:
      boolean | null = null

    if (
      type === 'calculation'
    ) {
      category =
        readString(
          value.category,
        ) || 'Uncategorized'

      calculatorTitle =
        readString(
          value.calculatorTitle,
        )

      metadataComplete =
        hasTags(value.tags) &&
        readString(
          value.notes,
        ).length > 0
    }

    if (
      type === 'comparison'
    ) {
      category =
        readString(
          value.category,
        ) || 'Uncategorized'

      calculatorTitle =
        readString(
          value.calculatorTitle,
        )

      metadataComplete =
        hasTags(value.tags) &&
        readString(
          value.description,
        ).length > 0
    }

    if (type === 'project') {
      category =
        'Project workspace'
    }

    if (type === 'template') {
      category =
        readString(
          value.category,
        ) || 'Uncategorized'

      calculatorTitle =
        readString(
          value.calculatorTitle,
        )

      metadataComplete =
        hasTags(value.tags) &&
        readString(
          value.description,
        ).length > 0
    }

    if (
      type === 'collection'
    ) {
      category =
        'Workspace collection'
    }

    if (type === 'report') {
      category =
        'Engineering report'
    }

    return [{
      id,
      type,
      category,
      calculatorTitle,
      createdAt,
      updatedAt,
      metadataComplete,
    }]
  })
}

function readInsightsData():
  InsightsData {
  const items = [
    ...readItems(
      'calculation',
      STORAGE_KEYS.calculations,
    ),
    ...readItems(
      'comparison',
      STORAGE_KEYS.comparisons,
    ),
    ...readItems(
      'project',
      STORAGE_KEYS.projects,
    ),
    ...readItems(
      'template',
      STORAGE_KEYS.templates,
    ),
    ...readItems(
      'collection',
      STORAGE_KEYS.collections,
    ),
    ...readItems(
      'report',
      STORAGE_KEYS.reports,
    ),
  ]

  let lastBackupAt = ''

  try {
    lastBackupAt =
      localStorage.getItem(
        STORAGE_KEYS.lastBackup,
      ) ?? ''
  } catch {
    lastBackupAt = ''
  }

  return {
    items,
    lastBackupAt,
  }
}

function countBy(
  values: string[],
): CountEntry[] {
  const counts =
    new Map<
      string,
      CountEntry
    >()

  values.forEach((value) => {
    const name =
      value.trim()

    if (name.length === 0) {
      return
    }

    const key =
      name.toLocaleLowerCase(
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
        name,
        count: 1,
      },
    )
  })

  return Array.from(
    counts.values(),
  ).sort(
    (first, second) =>
      second.count -
        first.count ||
      first.name.localeCompare(
        second.name,
      ),
  )
}

function escapeCsv(
  value: string,
): string {
  return `"${value.replaceAll(
    '"',
    '""',
  )}"`
}

function exportInsightsCsv(
  items: InsightItem[],
  range: InsightRange,
) {
  const typeSummary =
    TYPE_ORDER.map(
      (type) => [
        TYPE_LABELS[type],
        String(
          items.filter(
            (item) =>
              item.type === type,
          ).length,
        ),
      ],
    )

  const rows: string[][] = [
    [
      'ChemE Toolkit Workspace Insights',
      '',
      '',
      '',
      '',
      '',
    ],
    [
      'Analysis range',
      RANGE_LABELS[range],
      '',
      '',
      '',
      '',
    ],
    [
      'Exported',
      new Date().toLocaleString(
        'tr-TR',
      ),
      '',
      '',
      '',
      '',
    ],
    [],
    [
      'Record type summary',
      'Count',
    ],
    ...typeSummary,
    [],
    [
      'Type',
      'Category',
      'Calculator',
      'Created',
      'Updated',
      'Metadata status',
    ],
    ...items.map((item) => [
      TYPE_LABELS[item.type],
      item.category,
      item.calculatorTitle ||
        'Not applicable',
      formatDate(
        item.createdAt,
      ),
      formatDate(
        item.updatedAt,
      ),
      item.metadataComplete ===
      null
        ? 'Not measured'
        : item.metadataComplete
          ? 'Complete'
          : 'Requires metadata',
    ]),
  ]

  const csv =
    '\uFEFF' +
    rows
      .map((row) =>
        row
          .map(escapeCsv)
          .join(';'),
      )
      .join('\n')

  const blob =
    new Blob([csv], {
      type:
        'text/csv;charset=utf-8;',
    })

  const url =
    URL.createObjectURL(blob)

  const link =
    document.createElement('a')

  const date =
    new Date()
      .toISOString()
      .slice(0, 10)

  link.href = url
  link.download =
    `cheme-workspace-insights-${range}-${date}.csv`

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

function exportInsightsJson(
  items: InsightItem[],
  range: InsightRange,
) {
  const typeSummary =
    TYPE_ORDER.map(
      (type) => ({
        type,
        label:
          TYPE_LABELS[type],
        count:
          items.filter(
            (item) =>
              item.type === type,
          ).length,
      }),
    )

  const categorySummary =
    countBy(
      items.map(
        (item) =>
          item.category,
      ),
    )

  const calculatorSummary =
    countBy(
      items.map(
        (item) =>
          item.calculatorTitle,
      ),
    )

  const payload = {
    schema:
      'cheme-toolkit.workspace-insights.v1',
    generatedAt:
      new Date().toISOString(),
    range,
    rangeLabel:
      RANGE_LABELS[range],
    totalRecords:
      items.length,
    typeSummary,
    categorySummary,
    calculatorSummary,
    records:
      items,
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

  const date =
    new Date()
      .toISOString()
      .slice(0, 10)

  link.href = url
  link.download =
    `cheme-workspace-insights-${range}-${date}.json`

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

export function WorkspaceInsightsPanel() {
  const [
    data,
    setData,
  ] = useState<InsightsData>(
    readInsightsData,
  )

  const [
    range,
    setRange,
  ] = useState<InsightRange>(
    '30d',
  )

  function refreshData() {
    setData(
      readInsightsData(),
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

  const filteredItems =
    useMemo(
      () => {
        if (range === 'all') {
          return data.items
        }

        const cutoff =
          Date.now() -
          RANGE_DAYS[range] *
          24 *
          60 *
          60 *
          1000

        return data.items.filter(
          (item) => {
            const itemTime =
              timestamp(
                item.updatedAt ||
                item.createdAt,
              )

            return (
              itemTime > 0 &&
              itemTime >= cutoff
            )
          },
        )
      },
      [
        data.items,
        range,
      ],
    )

  const previousItems =
    useMemo(
      () => {
        if (range === 'all') {
          return []
        }

        const rangeDuration =
          RANGE_DAYS[range] *
          24 *
          60 *
          60 *
          1000

        const currentStart =
          Date.now() -
          rangeDuration

        const previousStart =
          currentStart -
          rangeDuration

        return data.items.filter(
          (item) => {
            const itemTime =
              timestamp(
                item.updatedAt ||
                item.createdAt,
              )

            return (
              itemTime >=
                previousStart &&
              itemTime <
                currentStart
            )
          },
        )
      },
      [
        data.items,
        range,
      ],
    )

  const typeCounts =
    useMemo(
      () =>
        TYPE_ORDER.map(
          (type) => ({
            type,
            name:
              TYPE_LABELS[type],
            count:
              filteredItems.filter(
                (item) =>
                  item.type === type,
              ).length,
          }),
        ),
      [filteredItems],
    )

  const typeTrends =
    useMemo(
      () =>
        TYPE_ORDER.map(
          (type) => {
            const current =
              filteredItems.filter(
                (item) =>
                  item.type === type,
              ).length

            const previous =
              previousItems.filter(
                (item) =>
                  item.type === type,
              ).length

            return {
              type,
              name:
                TYPE_LABELS[type],
              current,
              previous,
              difference:
                current - previous,
            }
          },
        ),
      [
        filteredItems,
        previousItems,
      ],
    )

  const categoryCounts =
    useMemo(
      () =>
        countBy(
          filteredItems.map(
            (item) =>
              item.category,
          ),
        ).slice(0, 7),
      [filteredItems],
    )

  const calculatorCounts =
    useMemo(
      () =>
        countBy(
          filteredItems.map(
            (item) =>
              item.calculatorTitle,
          ),
        ).slice(0, 6),
      [filteredItems],
    )

  const activityDays =
    useMemo<ActivityDay[]>(
      () =>
        Array.from(
          {
            length: 14,
          },
          (_, index) => {
            const date =
              new Date()

            date.setHours(
              0,
              0,
              0,
              0,
            )

            date.setDate(
              date.getDate() -
                (13 - index),
            )

            const key =
              dateKey(date)

            const count =
              filteredItems.filter(
                (item) => {
                  const itemTime =
                    timestamp(
                      item.updatedAt ||
                      item.createdAt,
                    )

                  if (itemTime === 0) {
                    return false
                  }

                  return (
                    dateKey(
                      new Date(
                        itemTime,
                      ),
                    ) === key
                  )
                },
              ).length

            return {
              key,
              label:
                new Intl.DateTimeFormat(
                  'tr-TR',
                  {
                    weekday: 'short',
                  },
                ).format(date),
              fullLabel:
                new Intl.DateTimeFormat(
                  'tr-TR',
                  {
                    day: '2-digit',
                    month: 'short',
                  },
                ).format(date),
              count,
            }
          },
        ),
      [filteredItems],
    )

  const metadataItems =
    filteredItems.filter(
      (item) =>
        item.metadataComplete !==
        null,
    )

  const metadataComplete =
    metadataItems.filter(
      (item) =>
        item.metadataComplete ===
        true,
    ).length

  const metadataPercentage =
    metadataItems.length === 0
      ? 0
      : Math.round(
          (
            metadataComplete /
            metadataItems.length
          ) * 100,
        )

  const maximumTypeCount =
    Math.max(
      1,
      ...typeCounts.map(
        (entry) =>
          entry.count,
      ),
    )

  const maximumCategoryCount =
    Math.max(
      1,
      ...categoryCounts.map(
        (entry) =>
          entry.count,
      ),
    )

  const maximumCalculatorCount =
    Math.max(
      1,
      ...calculatorCounts.map(
        (entry) =>
          entry.count,
      ),
    )

  const maximumActivity =
    Math.max(
      1,
      ...activityDays.map(
        (day) =>
          day.count,
      ),
    )

  const latestActivity =
    filteredItems.reduce(
      (latest, item) =>
        Math.max(
          latest,
          timestamp(
            item.updatedAt ||
            item.createdAt,
          ),
        ),
      0,
    )

  const overallDifference =
    filteredItems.length -
    previousItems.length

  const overallTrendLabel =
    range === 'all'
      ? 'All-time view'
      : previousItems.length === 0
        ? filteredItems.length === 0
          ? 'No change'
          : 'New activity'
        : `${
            overallDifference >= 0
              ? '+'
              : ''
          }${Math.round(
            (
              overallDifference /
              previousItems.length
            ) * 100,
          )}%`

  const overallTrendClass =
    range === 'all' ||
    overallDifference === 0
      ? 'is-neutral'
      : overallDifference > 0
        ? 'is-positive'
        : 'is-negative'

  const comparisonCaption =
    range === 'all'
      ? 'Select a dated range to compare activity with the immediately preceding period.'
      : `${RANGE_LABELS[range]} compared with the previous equivalent period.`

  return (
    <section
      className="workspace-insights-panel"
      aria-label="Workspace insights and analytics"
    >
      <header className="workspace-insights-header">
        <div>
          <span>
            Local workspace analytics
          </span>

          <h3>
            Engineering activity insights
          </h3>

          <p>
            Review usage patterns, saved-file
            distribution, calculator activity and
            workspace data quality. All analytics
            remain inside this browser.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshData}
        >
          Refresh insights
        </button>
      </header>

      <div className="workspace-insights-toolbar">
        <label>
          <span>
            Analysis range
          </span>

          <select
            value={range}
            onChange={(event) =>
              setRange(
                event.target
                  .value as InsightRange,
              )
            }
          >
            <option value="7d">
              Last 7 days
            </option>

            <option value="30d">
              Last 30 days
            </option>

            <option value="90d">
              Last 90 days
            </option>

            <option value="all">
              All time
            </option>
          </select>
        </label>

        <div>
          <span>
            <strong>
              {filteredItems.length}
            </strong>
            {' '}
            files in selected range
          </span>

          <button
            type="button"
            onClick={() =>
              exportInsightsCsv(
                filteredItems,
                range,
              )
            }
            disabled={
              filteredItems.length ===
              0
            }
          >
            ↓ Export insights CSV
          </button>

          <button
            type="button"
            onClick={() =>
              exportInsightsJson(
                filteredItems,
                range,
              )
            }
            disabled={
              filteredItems.length ===
              0
            }
          >
            ↓ Export insights JSON
          </button>
        </div>
      </div>

      <div className="workspace-insights-metrics">
        <article>
          <span>
            Total workspace files
          </span>

          <strong>
            {data.items.length}
          </strong>

          <small>
            across six record types
          </small>
        </article>

        <article>
          <span>
            Selected range
          </span>

          <strong>
            {filteredItems.length}
          </strong>

          <small>
            {RANGE_LABELS[range]}
          </small>
        </article>

        <article>
          <span>
            Active calculators
          </span>

          <strong>
            {calculatorCounts.length}
          </strong>

          <small>
            represented in this range
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
            {metadataComplete}
            {' / '}
            {metadataItems.length}
            {' '}
            complete records
          </small>
        </article>

        <article>
          <span>
            Latest activity
          </span>

          <strong className="workspace-insights-date">
            {latestActivity > 0
              ? formatDate(
                  new Date(
                    latestActivity,
                  ).toISOString(),
                )
              : 'No activity'}
          </strong>

          <small>
            Last backup:
            {' '}
            {data.lastBackupAt
              ? formatDate(
                  data.lastBackupAt,
                )
              : 'Not exported'}
          </small>
        </article>
      </div>

      <div className="workspace-insights-grid">
        <section className="workspace-insights-card">
          <header>
            <span>
              Workspace composition
            </span>

            <h4>
              File type distribution
            </h4>
          </header>

          <div className="workspace-insights-bars">
            {typeCounts.map(
              (entry) => (
                <article
                  key={entry.type}
                >
                  <div>
                    <span>
                      {entry.name}
                    </span>

                    <strong>
                      {entry.count}
                    </strong>
                  </div>

                  <div className="workspace-insights-track">
                    <span
                      style={{
                        width:
                          `${(
                            entry.count /
                            maximumTypeCount
                          ) * 100}%`,
                      }}
                    />
                  </div>
                </article>
              ),
            )}
          </div>
        </section>

        <section className="workspace-insights-card">
          <header>
            <span>
              Engineering domains
            </span>

            <h4>
              Category distribution
            </h4>
          </header>

          {categoryCounts.length ===
          0 ? (
            <div className="workspace-insights-empty">
              No categorized workspace files yet.
            </div>
          ) : (
            <div className="workspace-insights-bars">
              {categoryCounts.map(
                (entry) => (
                  <article
                    key={entry.name}
                  >
                    <div>
                      <span>
                        {entry.name}
                      </span>

                      <strong>
                        {entry.count}
                      </strong>
                    </div>

                    <div className="workspace-insights-track">
                      <span
                        style={{
                          width:
                            `${(
                              entry.count /
                              maximumCategoryCount
                            ) * 100}%`,
                        }}
                      />
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </section>

        <section className="workspace-insights-card workspace-insights-activity">
          <header>
            <span>
              Recent activity
            </span>

            <h4>
              Fourteen-day workspace timeline
            </h4>
          </header>

          <div className="workspace-insights-timeline">
            {activityDays.map(
              (day) => (
                <article
                  key={day.key}
                  title={`${day.fullLabel}: ${day.count} files`}
                >
                  <strong>
                    {day.count}
                  </strong>

                  <div>
                    <span
                      style={{
                        height:
                          `${Math.max(
                            6,
                            (
                              day.count /
                              maximumActivity
                            ) * 100,
                          )}%`,
                      }}
                    />
                  </div>

                  <small>
                    {day.label}
                  </small>
                </article>
              ),
            )}
          </div>
        </section>

        <section className="workspace-insights-card workspace-insights-comparison">
          <header>
            <span>
              Comparative analytics
            </span>

            <h4>
              Period-over-period activity
            </h4>
          </header>

          <div className="workspace-insights-comparison-summary">
            <article>
              <span>
                Selected period
              </span>

              <strong>
                {filteredItems.length}
              </strong>

              <small>
                {RANGE_LABELS[range]}
              </small>
            </article>

            <article>
              <span>
                Previous period
              </span>

              <strong>
                {range === 'all'
                  ? '—'
                  : previousItems.length}
              </strong>

              <small>
                Equivalent preceding range
              </small>
            </article>

            <article
              className={
                overallTrendClass
              }
            >
              <span>
                Activity trend
              </span>

              <strong>
                {overallTrendLabel}
              </strong>

              <small>
                {range === 'all'
                  ? 'Comparison unavailable'
                  : `${overallDifference >= 0
                      ? '+'
                      : ''}${overallDifference} records`}
              </small>
            </article>
          </div>

          <p className="workspace-insights-comparison-caption">
            {comparisonCaption}
          </p>

          <div className="workspace-insights-type-trends">
            {typeTrends.map(
              (entry) => (
                <article
                  key={entry.type}
                >
                  <div>
                    <span>
                      {entry.name}
                    </span>

                    <strong>
                      {entry.current}
                    </strong>
                  </div>

                  <small
                    className={
                      range === 'all' ||
                      entry.difference === 0
                        ? 'is-neutral'
                        : entry.difference > 0
                          ? 'is-positive'
                          : 'is-negative'
                    }
                  >
                    {range === 'all'
                      ? 'All-time total'
                      : `${entry.previous} previous · ${
                          entry.difference >= 0
                            ? '+'
                            : ''
                        }${entry.difference}`}
                  </small>
                </article>
              ),
            )}
          </div>
        </section>

        <section className="workspace-insights-card">
          <header>
            <span>
              Calculator usage
            </span>

            <h4>
              Most active calculators
            </h4>
          </header>

          {calculatorCounts.length ===
          0 ? (
            <div className="workspace-insights-empty">
              Save calculations or templates to
              build calculator usage insights.
            </div>
          ) : (
            <div className="workspace-insights-ranked">
              {calculatorCounts.map(
                (entry, index) => (
                  <article
                    key={entry.name}
                  >
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
                        {entry.name}
                      </strong>

                      <div className="workspace-insights-track">
                        <span
                          style={{
                            width:
                              `${(
                                entry.count /
                                maximumCalculatorCount
                              ) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <small>
                      {entry.count}
                    </small>
                  </article>
                ),
              )}
            </div>
          )}
        </section>

        <section className="workspace-insights-card workspace-insights-quality">
          <header>
            <span>
              Data quality
            </span>

            <h4>
              Workspace readiness
            </h4>
          </header>

          <div>
            <article>
              <strong>
                {metadataComplete}
              </strong>

              <span>
                Complete metadata records
              </span>
            </article>

            <article>
              <strong>
                {
                  metadataItems.length -
                  metadataComplete
                }
              </strong>

              <span>
                Records requiring metadata
              </span>
            </article>

            <article>
              <strong>
                {data.items.length -
                  metadataItems.length}
              </strong>

              <span>
                Structural workspace files
              </span>
            </article>
          </div>

          <p>
            Metadata health currently measures
            saved calculations, comparisons and
            reusable templates with both tags and
            descriptive notes.
          </p>
        </section>
      </div>
    </section>
  )
}
