import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import '../styles/workspace-activity-feed.css'

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

type ActivityType =
  | 'calculation'
  | 'comparison'
  | 'project'
  | 'template'
  | 'collection'
  | 'report'

type WorkspaceTarget =
  | 'records'
  | 'compare'
  | 'projects'
  | 'reports'
  | 'templates'
  | 'collections'

interface WorkspaceActivityFeedPanelProps {
  onOpenCalculator: (
    calculatorId: string,
  ) => void
  onOpenTab: (
    tab: WorkspaceTarget,
  ) => void
}

interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  subtitle: string
  description: string
  occurredAt: string
  calculatorId: string
  target: WorkspaceTarget
}

const TYPE_CONFIG: Array<{
  type: ActivityType
  label: string
  symbol: string
}> = [
  {
    type: 'calculation',
    label: 'Calculations',
    symbol: '∑',
  },
  {
    type: 'comparison',
    label: 'Comparisons',
    symbol: '⇄',
  },
  {
    type: 'project',
    label: 'Projects',
    symbol: '▣',
  },
  {
    type: 'template',
    label: 'Templates',
    symbol: '◇',
  },
  {
    type: 'collection',
    label: 'Collections',
    symbol: '◎',
  },
  {
    type: 'report',
    label: 'Reports',
    symbol: '¶',
  },
]

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

function timestamp(
  value: string,
): number {
  const result =
    Date.parse(value)

  return Number.isNaN(result)
    ? 0
    : result
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
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat(
    'tr-TR',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  ).format(date)
}

function dayLabel(
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

  const today =
    new Date()

  today.setHours(
    0,
    0,
    0,
    0,
  )

  const target =
    new Date(date)

  target.setHours(
    0,
    0,
    0,
    0,
  )

  const difference =
    Math.round(
      (
        today.getTime() -
        target.getTime()
      ) /
      (
        24 *
        60 *
        60 *
        1000
      ),
    )

  if (difference === 0) {
    return 'Today'
  }

  if (difference === 1) {
    return 'Yesterday'
  }

  return new Intl.DateTimeFormat(
    'tr-TR',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    },
  ).format(date)
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

function createItems(
  type: ActivityType,
  storageKey: string,
  target: WorkspaceTarget,
): ActivityItem[] {
  return readArray(
    storageKey,
  ).flatMap(
    (value, index) => {
      if (
        isRecord(value) === false
      ) {
        return []
      }

      const calculatorId =
        readString(
          value,
          [
            'calculatorId',
            'calculatorID',
            'moduleId',
          ],
        )

      const calculatorTitle =
        readString(
          value,
          [
            'calculatorTitle',
            'moduleTitle',
          ],
        )

      const title =
        readString(
          value,
          [
            'title',
            'name',
          ],
        ) ||
        calculatorTitle ||
        TYPE_CONFIG.find(
          (config) =>
            config.type === type,
        )?.label ||
        'Workspace record'

      const category =
        readString(
          value,
          ['category'],
        )

      const occurredAt =
        readString(
          value,
          [
            'updatedAt',
            'createdAt',
            'savedAt',
            'generatedAt',
          ],
        )

      const count =
        relatedCount(value)

      let description =
        readString(
          value,
          [
            'description',
            'notes',
            'purpose',
            'subtitle',
          ],
        )

      if (
        description.length === 0 &&
        count > 0
      ) {
        description =
          String(count) +
          ' linked workspace items'
      }

      if (
        description.length === 0
      ) {
        description =
          'Saved workspace activity'
      }

      return [{
        id:
          readString(
            value,
            ['id'],
          ) ||
          type +
          '-' +
          String(index),
        type,
        title,
        subtitle:
          calculatorTitle ||
          category ||
          TYPE_CONFIG.find(
            (config) =>
              config.type === type,
          )?.label ||
          'Workspace record',
        description,
        occurredAt,
        calculatorId,
        target,
      }]
    },
  )
}

function readActivity():
  ActivityItem[] {
  return [
    ...createItems(
      'calculation',
      STORAGE_KEYS.calculations,
      'records',
    ),
    ...createItems(
      'comparison',
      STORAGE_KEYS.comparisons,
      'compare',
    ),
    ...createItems(
      'project',
      STORAGE_KEYS.projects,
      'projects',
    ),
    ...createItems(
      'template',
      STORAGE_KEYS.templates,
      'templates',
    ),
    ...createItems(
      'collection',
      STORAGE_KEYS.collections,
      'collections',
    ),
    ...createItems(
      'report',
      STORAGE_KEYS.reports,
      'reports',
    ),
  ].sort(
    (first, second) =>
      timestamp(
        second.occurredAt,
      ) -
      timestamp(
        first.occurredAt,
      ),
  )
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

export function WorkspaceActivityFeedPanel({
  onOpenCalculator,
  onOpenTab,
}: WorkspaceActivityFeedPanelProps) {
  const [
    items,
    setItems,
  ] = useState<ActivityItem[]>(
    readActivity,
  )

  const [
    filter,
    setFilter,
  ] = useState<
    'all' | ActivityType
  >('all')

  const [
    query,
    setQuery,
  ] = useState('')

  function refresh() {
    setItems(
      readActivity(),
    )
  }

  useEffect(() => {
    DATA_EVENTS.forEach(
      (eventName) => {
        window.addEventListener(
          eventName,
          refresh,
        )
      },
    )

    window.addEventListener(
      'storage',
      refresh,
    )

    window.addEventListener(
      'focus',
      refresh,
    )

    return () => {
      DATA_EVENTS.forEach(
        (eventName) => {
          window.removeEventListener(
            eventName,
            refresh,
          )
        },
      )

      window.removeEventListener(
        'storage',
        refresh,
      )

      window.removeEventListener(
        'focus',
        refresh,
      )
    }
  }, [])

  const filteredItems =
    useMemo(
      () => {
        const cleanQuery =
          normalize(query)

        return items.filter(
          (item) => {
            if (
              filter !== 'all' &&
              item.type !== filter
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
                  item.title,
                  item.subtitle,
                  item.description,
                  item.type,
                ].join(' '),
              )

            return searchText.includes(
              cleanQuery,
            )
          },
        )
      },
      [
        filter,
        items,
        query,
      ],
    )

  const todayStart =
    new Date()

  todayStart.setHours(
    0,
    0,
    0,
    0,
  )

  const sevenDaysAgo =
    Date.now() -
    (
      7 *
      24 *
      60 *
      60 *
      1000
    )

  const todayCount =
    items.filter(
      (item) =>
        timestamp(
          item.occurredAt,
        ) >=
        todayStart.getTime(),
    ).length

  const weekCount =
    items.filter(
      (item) =>
        timestamp(
          item.occurredAt,
        ) >=
        sevenDaysAgo,
    ).length

  const activeTypes =
    TYPE_CONFIG.filter(
      (config) =>
        items.some(
          (item) =>
            item.type ===
            config.type,
        ),
    ).length

  function openItem(
    item: ActivityItem,
  ) {
    if (
      item.type ===
        'calculation' &&
      item.calculatorId
    ) {
      onOpenCalculator(
        item.calculatorId,
      )
      return
    }

    onOpenTab(
      item.target,
    )
  }

  return (
    <section
      className="workspace-activity-feed"
      aria-label="Workspace activity feed"
    >
      <header className="workspace-activity-header">
        <div>
          <span>
            Chronological workspace history
          </span>

          <h3>
            Activity Feed
          </h3>

          <p>
            Review calculations, comparisons,
            projects, templates, collections and
            report activity in one chronological
            engineering timeline.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
        >
          Refresh activity
        </button>
      </header>

      <div className="workspace-activity-metrics">
        <article>
          <span>
            Total activity
          </span>

          <strong>
            {items.length}
          </strong>

          <small>
            workspace records
          </small>
        </article>

        <article>
          <span>
            Today
          </span>

          <strong>
            {todayCount}
          </strong>

          <small>
            created or updated
          </small>
        </article>

        <article>
          <span>
            Last 7 days
          </span>

          <strong>
            {weekCount}
          </strong>

          <small>
            recent activities
          </small>
        </article>

        <article>
          <span>
            Active types
          </span>

          <strong>
            {activeTypes}
          </strong>

          <small>
            of six record types
          </small>
        </article>
      </div>

      <div className="workspace-activity-controls">
        <label>
          <span>
            Search activity
          </span>

          <input
            type="search"
            value={query}
            placeholder="Search titles, calculators or notes"
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
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value as
                  | 'all'
                  | ActivityType,
              )
            }
          >
            <option value="all">
              All activity
            </option>

            {TYPE_CONFIG.map(
              (config) => (
                <option
                  key={config.type}
                  value={config.type}
                >
                  {config.label}
                </option>
              ),
            )}
          </select>
        </label>
      </div>

      <div className="workspace-activity-summary">
        {TYPE_CONFIG.map(
          (config) => {
            const count =
              items.filter(
                (item) =>
                  item.type ===
                  config.type,
              ).length

            return (
              <button
                key={config.type}
                type="button"
                className={
                  filter ===
                  config.type
                    ? 'is-active'
                    : ''
                }
                onClick={() =>
                  setFilter(
                    filter ===
                      config.type
                      ? 'all'
                      : config.type,
                  )
                }
              >
                <span>
                  {config.symbol}
                </span>

                <strong>
                  {count}
                </strong>

                <small>
                  {config.label}
                </small>
              </button>
            )
          },
        )}
      </div>

      <div className="workspace-activity-result-heading">
        <div>
          <span>
            Engineering timeline
          </span>

          <strong>
            {filteredItems.length}
            {' '}
            visible records
          </strong>
        </div>

        {(filter !== 'all' ||
          query.trim()) ? (
          <button
            type="button"
            onClick={() => {
              setFilter('all')
              setQuery('')
            }}
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {filteredItems.length ===
      0 ? (
        <div className="workspace-activity-empty">
          <strong>
            No matching activity
          </strong>

          <p>
            Save calculations or clear the active
            filters to populate the timeline.
          </p>
        </div>
      ) : (
        <div className="workspace-activity-list">
          {filteredItems.map(
            (item, index) => {
              const previous =
                filteredItems[
                  index - 1
                ]

              const showDay =
                index === 0 ||
                dayLabel(
                  previous.occurredAt,
                ) !==
                dayLabel(
                  item.occurredAt,
                )

              const config =
                TYPE_CONFIG.find(
                  (entry) =>
                    entry.type ===
                    item.type,
                )

              return (
                <div
                  key={
                    item.type +
                    '-' +
                    item.id
                  }
                  className="workspace-activity-row"
                >
                  {showDay ? (
                    <div className="workspace-activity-day">
                      {dayLabel(
                        item.occurredAt,
                      )}
                    </div>
                  ) : null}

                  <article>
                    <span className="workspace-activity-symbol">
                      {config?.symbol}
                    </span>

                    <div className="workspace-activity-content">
                      <span>
                        {config?.label}
                      </span>

                      <strong>
                        {item.title}
                      </strong>

                      <small>
                        {item.subtitle}
                      </small>

                      <p>
                        {item.description}
                      </p>
                    </div>

                    <div className="workspace-activity-action">
                      <time>
                        {formatDate(
                          item.occurredAt,
                        )}
                      </time>

                      <button
                        type="button"
                        onClick={() =>
                          openItem(item)
                        }
                      >
                        {item.type ===
                          'calculation' &&
                        item.calculatorId
                          ? 'Open calculator'
                          : 'Open section'}
                      </button>
                    </div>
                  </article>
                </div>
              )
            },
          )}
        </div>
      )}
    </section>
  )
}
