import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import '../styles/workspace-search.css'

const CALCULATIONS_KEY =
  'cheme-toolkit.saved-calculations.v1'

const COMPARISONS_KEY =
  'cheme-toolkit.saved-comparisons.v1'

const PROJECTS_KEY =
  'cheme-toolkit.project-workspaces.v1'

const OPEN_TARGET_EVENT =
  'cheme-toolkit:workspace-open-target'

const PENDING_TARGET_KEY =
  'cheme-toolkit.pending-workspace-target.v1'

const DATA_EVENTS = [
  'cheme-toolkit:personal-data-changed',
  'cheme-toolkit:saved-calculations-changed',
  'cheme-toolkit:saved-comparisons-changed',
  'cheme-toolkit:project-workspaces-changed',
]

type SearchResultType =
  | 'calculation'
  | 'comparison'
  | 'project'

type TypeFilter =
  | 'all'
  | SearchResultType

type SortMode =
  | 'newest'
  | 'oldest'
  | 'name'

type DestinationTab =
  | 'records'
  | 'compare'
  | 'projects'

interface WorkspaceSearchPanelProps {
  onOpenCalculator: (
    calculatorId: string,
  ) => void

  onOpenTab: (
    tabId: DestinationTab,
  ) => void
}

interface StoredCalculation {
  id: string
  name: string
  calculatorId: string
  calculatorTitle: string
  category: string
  createdAt: string
  tags?: string[]
  notes?: string
}

interface StoredComparison {
  id: string
  name: string
  calculatorId: string
  calculatorTitle: string
  category: string
  createdAt: string
  calculationSnapshots?: unknown[]
  tags?: string[]
  description?: string
}

interface StoredProject {
  id: string
  name: string
  description: string
  notes: string
  createdAt: string
  updatedAt: string
  calculationIds: string[]
  comparisonIds?: string[]
}

interface SearchItem {
  id: string
  type: SearchResultType
  title: string
  subtitle: string
  description: string
  category: string
  calculatorId: string
  calculatorTitle: string
  createdAt: string
  itemCount: number
  tags: string[]
  notes: string
  searchText: string
}

type Status =
  | 'idle'
  | 'opened'
  | 'csv'

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
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

function readCalculations():
  StoredCalculation[] {
  return readArray(
    CALCULATIONS_KEY,
  ).filter(
    (
      value,
    ): value is StoredCalculation => {
      if (!isRecord(value)) {
        return false
      }

      return (
        typeof value.id ===
          'string' &&
        typeof value.name ===
          'string' &&
        typeof value.calculatorId ===
          'string' &&
        typeof value.calculatorTitle ===
          'string' &&
        typeof value.category ===
          'string' &&
        typeof value.createdAt ===
          'string'
      )
    },
  )
}

function readComparisons():
  StoredComparison[] {
  return readArray(
    COMPARISONS_KEY,
  ).filter(
    (
      value,
    ): value is StoredComparison => {
      if (!isRecord(value)) {
        return false
      }

      return (
        typeof value.id ===
          'string' &&
        typeof value.name ===
          'string' &&
        typeof value.calculatorId ===
          'string' &&
        typeof value.calculatorTitle ===
          'string' &&
        typeof value.category ===
          'string' &&
        typeof value.createdAt ===
          'string'
      )
    },
  )
}

function readProjects():
  StoredProject[] {
  return readArray(
    PROJECTS_KEY,
  ).filter(
    (
      value,
    ): value is StoredProject => {
      if (!isRecord(value)) {
        return false
      }

      return (
        typeof value.id ===
          'string' &&
        typeof value.name ===
          'string' &&
        typeof value.createdAt ===
          'string' &&
        Array.isArray(
          value.calculationIds,
        )
      )
    },
  ).map((project) => ({
    ...project,

    description:
      typeof project.description ===
      'string'
        ? project.description
        : '',

    notes:
      typeof project.notes ===
      'string'
        ? project.notes
        : '',

    updatedAt:
      typeof project.updatedAt ===
      'string'
        ? project.updatedAt
        : project.createdAt,

    comparisonIds:
      Array.isArray(
        project.comparisonIds,
      )
        ? project.comparisonIds
        : [],
  }))
}

function normalizeSearch(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase('en-US')
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

function timestamp(
  value: string,
): number {
  const parsed =
    Date.parse(value)

  return Number.isNaN(parsed)
    ? 0
    : parsed
}

function escapeCsv(
  value: string,
): string {
  return `"${value.replaceAll('"', '""')}"`
}

function downloadSearchCsv(
  items: SearchItem[],
) {
  const rows: string[][] = [
    [
      'ChemE Toolkit Workspace Search',
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
    ],
    [],
    [
      'Type',
      'Name',
      'Calculator / Project',
      'Category',
      'Created / updated',
      'Tags',
      'Notes / description',
    ],
    ...items.map((item) => [
      item.type,
      item.title,
      item.subtitle,
      item.category,
      formatDate(item.createdAt),
      item.tags.join(' | '),
      item.notes,
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
    `cheme-workspace-search-${date}.csv`

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

function resultTypeLabel(
  type: SearchResultType,
): string {
  if (type === 'calculation') {
    return 'Saved calculation'
  }

  if (type === 'comparison') {
    return 'Comparison snapshot'
  }

  return 'Project workspace'
}

export function WorkspaceSearchPanel({
  onOpenCalculator,
  onOpenTab,
}: WorkspaceSearchPanelProps) {
  const [
    calculations,
    setCalculations,
  ] = useState<StoredCalculation[]>(
    readCalculations,
  )

  const [
    comparisons,
    setComparisons,
  ] = useState<StoredComparison[]>(
    readComparisons,
  )

  const [
    projects,
    setProjects,
  ] = useState<StoredProject[]>(
    readProjects,
  )

  const [
    query,
    setQuery,
  ] = useState('')

  const [
    typeFilter,
    setTypeFilter,
  ] = useState<TypeFilter>(
    'all',
  )

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState('all')

  const [
    calculatorFilter,
    setCalculatorFilter,
  ] = useState('all')

  const [
    tagFilter,
    setTagFilter,
  ] = useState('all')

  const [
    sortMode,
    setSortMode,
  ] = useState<SortMode>(
    'newest',
  )

  const [status, setStatus] =
    useState<Status>('idle')

  const allItems =
    useMemo<SearchItem[]>(
      () => [
        ...calculations.map(
          (calculation) => {
            const tags =
              normalizeTags(
                calculation.tags,
              )

            const notes =
              typeof calculation.notes ===
              'string'
                ? calculation.notes
                : ''

            const searchText =
              normalizeSearch(
                [
                  calculation.name,
                  calculation.calculatorTitle,
                  calculation.category,
                  notes,
                  ...tags,
                ].join(' '),
              )

            return {
              id:
                calculation.id,
              type:
                'calculation' as const,
              title:
                calculation.name,
              subtitle:
                calculation.calculatorTitle,
              description:
                notes ||
                'Saved calculator inputs and results.',
              category:
                calculation.category,
              calculatorId:
                calculation.calculatorId,
              calculatorTitle:
                calculation.calculatorTitle,
              createdAt:
                calculation.createdAt,
              itemCount: 1,
              tags,
              notes,
              searchText,
            }
          },
        ),

        ...comparisons.map(
          (comparison) => {
            const count =
              comparison
                .calculationSnapshots
                ?.length ?? 0

            const tags =
              normalizeTags(
                comparison.tags,
              )

            const description =
              typeof comparison.description ===
              'string'
                ? comparison.description
                : ''

            const searchText =
              normalizeSearch(
                [
                  comparison.name,
                  comparison.calculatorTitle,
                  comparison.category,
                  description,
                  ...tags,
                ].join(' '),
              )

            return {
              id:
                comparison.id,
              type:
                'comparison' as const,
              title:
                comparison.name,
              subtitle:
                comparison.calculatorTitle,
              description:
                description ||
                `${count} source calculation${
                  count === 1
                    ? ''
                    : 's'
                } in this snapshot.`,
              category:
                comparison.category,
              calculatorId:
                comparison.calculatorId,
              calculatorTitle:
                comparison.calculatorTitle,
              createdAt:
                comparison.createdAt,
              itemCount: count,
              tags,
              notes: description,
              searchText,
            }
          },
        ),

        ...projects.map(
          (project) => {
            const calculationCount =
              project
                .calculationIds
                .length

            const comparisonCount =
              project
                .comparisonIds
                ?.length ?? 0

            const searchText =
              normalizeSearch(
                [
                  project.name,
                  project.description,
                  project.notes,
                  'project workspace',
                ].join(' '),
              )

            return {
              id:
                project.id,
              type:
                'project' as const,
              title:
                project.name,
              subtitle:
                'Project workspace',
              description:
                project.description ||
                `${calculationCount} calculations and ${comparisonCount} comparisons.`,
              category:
                'Project workspace',
              calculatorId: '',
              calculatorTitle: '',
              createdAt:
                project.updatedAt,
              itemCount:
                calculationCount +
                comparisonCount,
              tags: [],
              notes:
                project.notes,
              searchText,
            }
          },
        ),
      ],
      [
        calculations,
        comparisons,
        projects,
      ],
    )

  const categoryOptions =
    useMemo(
      () =>
        Array.from(
          new Set(
            allItems.map(
              (item) =>
                item.category,
            ),
          ),
        ).sort(
          (first, second) =>
            first.localeCompare(
              second,
            ),
        ),
      [allItems],
    )

  const calculatorOptions =
    useMemo(() => {
      const options =
        new Map<string, string>()

      allItems.forEach((item) => {
        if (
          item.calculatorId &&
          item.calculatorTitle
        ) {
          options.set(
            item.calculatorId,
            item.calculatorTitle,
          )
        }
      })

      return Array.from(
        options.entries(),
      ).sort(
        (first, second) =>
          first[1].localeCompare(
            second[1],
          ),
      )
    }, [allItems])

  const tagOptions =
    useMemo(
      () =>
        Array.from(
          new Set(
            allItems.flatMap(
              (item) =>
                item.tags,
            ),
          ),
        ).sort(
          (first, second) =>
            first.localeCompare(
              second,
            ),
        ),
      [allItems],
    )

  const filteredItems =
    useMemo(() => {
      const normalizedQuery =
        normalizeSearch(query)

      const filtered =
        allItems.filter((item) => {
          const queryMatches =
            !normalizedQuery ||
            item.searchText.includes(
              normalizedQuery,
            )

          const typeMatches =
            typeFilter === 'all' ||
            item.type === typeFilter

          const categoryMatches =
            categoryFilter ===
              'all' ||
            item.category ===
              categoryFilter

          const calculatorMatches =
            calculatorFilter ===
              'all' ||
            item.calculatorId ===
              calculatorFilter

          const tagMatches =
            tagFilter === 'all' ||
            item.tags.some(
              (tag) =>
                tag === tagFilter,
            )

          return (
            queryMatches &&
            typeMatches &&
            categoryMatches &&
            calculatorMatches &&
            tagMatches
          )
        })

      return [...filtered].sort(
        (first, second) => {
          if (sortMode === 'name') {
            return first.title.localeCompare(
              second.title,
            )
          }

          const difference =
            timestamp(
              first.createdAt,
            ) -
            timestamp(
              second.createdAt,
            )

          return sortMode === 'oldest'
            ? difference
            : -difference
        },
      )
    }, [
      allItems,
      query,
      typeFilter,
      categoryFilter,
      calculatorFilter,
      tagFilter,
      sortMode,
    ])

  useEffect(() => {
    function refreshData() {
      setCalculations(
        readCalculations(),
      )

      setComparisons(
        readComparisons(),
      )

      setProjects(
        readProjects(),
      )
    }

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
        2400,
      )

    return () =>
      window.clearTimeout(timer)
  }, [status])

  function clearFilters() {
    setQuery('')
    setTypeFilter('all')
    setCategoryFilter('all')
    setCalculatorFilter('all')
    setTagFilter('all')
    setSortMode('newest')
  }

  function openItem(
    item: SearchItem,
  ) {
    const destination:
      DestinationTab =
      item.type === 'calculation'
        ? 'records'
        : item.type ===
            'comparison'
          ? 'compare'
          : 'projects'

    sessionStorage.setItem(
      PENDING_TARGET_KEY,
      JSON.stringify({
        type: item.type,
        id: item.id,
      }),
    )

    window.dispatchEvent(
      new CustomEvent(
        OPEN_TARGET_EVENT,
        {
          detail: {
            type: item.type,
            id: item.id,
          },
        },
      ),
    )

    if (item.calculatorId) {
      onOpenCalculator(
        item.calculatorId,
      )
    }

    onOpenTab(destination)
    setStatus('opened')

    window.setTimeout(() => {
      document
        .querySelector(
          '#engineering-workspace',
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
    }, 180)
  }

  function exportResults() {
    downloadSearchCsv(
      filteredItems,
    )

    setStatus('csv')
  }

  return (
    <section
      className="workspace-search-panel"
      aria-label="Search saved workspace files"
    >
      <div className="workspace-search-header">
        <div>
          <span>
            Workspace index
          </span>

          <h3>
            Search saved work
          </h3>

          <p>
            Find calculations, comparison
            snapshots and project files from
            one searchable index.
          </p>
        </div>

        <div className="workspace-search-total">
          <strong>
            {allItems.length}
          </strong>

          <span>
            indexed files
          </span>
        </div>
      </div>

      <div className="workspace-search-controls">
        <label className="workspace-search-query">
          <span>
            Search
          </span>

          <input
            type="search"
            value={query}
            placeholder="Search names, calculators, categories or project notes…"
            onChange={(event) =>
              setQuery(
                event.target.value,
              )
            }
          />
        </label>

        <label>
          <span>
            File type
          </span>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target
                  .value as TypeFilter,
              )
            }
          >
            <option value="all">
              All file types
            </option>

            <option value="calculation">
              Calculations
            </option>

            <option value="comparison">
              Comparisons
            </option>

            <option value="project">
              Projects
            </option>
          </select>
        </label>

        <label>
          <span>
            Category
          </span>

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value,
              )
            }
          >
            <option value="all">
              All categories
            </option>

            {categoryOptions.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          <span>
            Calculator
          </span>

          <select
            value={calculatorFilter}
            onChange={(event) =>
              setCalculatorFilter(
                event.target.value,
              )
            }
          >
            <option value="all">
              All calculators
            </option>

            {calculatorOptions.map(
              ([id, title]) => (
                <option
                  key={id}
                  value={id}
                >
                  {title}
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          <span>
            Tag
          </span>

          <select
            value={tagFilter}
            onChange={(event) =>
              setTagFilter(
                event.target.value,
              )
            }
          >
            <option value="all">
              All tags
            </option>

            {tagOptions.map(
              (tag) => (
                <option
                  key={tag}
                  value={tag}
                >
                  {tag}
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          <span>
            Sort
          </span>

          <select
            value={sortMode}
            onChange={(event) =>
              setSortMode(
                event.target
                  .value as SortMode,
              )
            }
          >
            <option value="newest">
              Newest first
            </option>

            <option value="oldest">
              Oldest first
            </option>

            <option value="name">
              Name A–Z
            </option>
          </select>
        </label>
      </div>

      <div className="workspace-search-toolbar">
        <p>
          <strong>
            {filteredItems.length}
          </strong>{' '}
          result
          {filteredItems.length === 1
            ? ''
            : 's'}
        </p>

        <div>
          <button
            type="button"
            onClick={clearFilters}
          >
            Clear filters
          </button>

          <button
            type="button"
            className="workspace-search-primary"
            onClick={exportResults}
            disabled={
              filteredItems.length ===
              0
            }
          >
            ↓ Export results CSV
          </button>
        </div>
      </div>

      <p
        className="workspace-search-status"
        aria-live="polite"
      >
        {status === 'opened'
          ? 'Related workspace section opened.'
          : null}

        {status === 'csv'
          ? 'Search results exported as CSV.'
          : null}
      </p>

      {filteredItems.length === 0 ? (
        <div className="workspace-search-empty">
          <strong>
            No matching workspace files
          </strong>

          <p>
            Change the search text or clear
            one of the active filters.
          </p>
        </div>
      ) : (
        <div className="workspace-search-results">
          {filteredItems.map(
            (item) => (
              <article key={`${item.type}-${item.id}`}>
                <div className="workspace-search-type">
                  <span
                    data-type={
                      item.type
                    }
                  >
                    {resultTypeLabel(
                      item.type,
                    )}
                  </span>

                  <small>
                    {formatDate(
                      item.createdAt,
                    )}
                  </small>
                </div>

                <div className="workspace-search-result-copy">
                  <h4>
                    {item.title}
                  </h4>

                  <p>
                    {item.subtitle}
                  </p>

                  <small>
                    {item.description}
                  </small>

                  {item.tags.length > 0 ? (
                    <div className="workspace-search-result-tags">
                      {item.tags
                        .slice(0, 4)
                        .map((tag) => (
                          <span
                            key={tag}
                          >
                            {tag}
                          </span>
                        ))}

                      {item.tags.length > 4 ? (
                        <small>
                          +{item.tags.length - 4}
                        </small>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="workspace-search-result-meta">
                  <span>
                    {item.category}
                  </span>

                  {item.itemCount > 1 ? (
                    <small>
                      {item.itemCount} files
                    </small>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openItem(item)
                  }
                >
                  Open
                  <span aria-hidden="true">
                    →
                  </span>
                </button>
              </article>
            ),
          )}
        </div>
      )}
    </section>
  )
}
