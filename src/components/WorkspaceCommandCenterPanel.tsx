import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { CalculatorDefinition } from '../types/calculator'
import '../styles/workspace-command-center.css'

const STORAGE_KEYS = {
  favorites:
    'cheme-toolkit-favorites-v1',
  recent:
    'cheme-toolkit-recent-v1',
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

type WorkspaceTarget =
  | 'dashboard'
  | 'insights'
  | 'records'
  | 'compare'
  | 'projects'
  | 'reports'
  | 'search'
  | 'metadata'
  | 'management'
  | 'templates'
  | 'collections'
  | 'data'

interface WorkspaceCommandCenterPanelProps {
  currentCalculator:
    CalculatorDefinition
  onOpenCalculator: (
    calculatorId: string,
  ) => void
  onOpenTab: (
    tab: WorkspaceTarget,
  ) => void
}

interface CalculationRecord {
  id: string
  title: string
  calculatorId: string
  calculatorTitle: string
  category: string
  updatedAt: string
  metadataComplete: boolean
}

interface ProjectRecord {
  id: string
  title: string
  updatedAt: string
  itemCount: number
}

interface RecentCalculator {
  id: string
  title: string
  category: string
  visitedAt: string
}

interface CommandSnapshot {
  calculations:
    CalculationRecord[]
  projects:
    ProjectRecord[]
  favoriteIds: string[]
  recentCalculators:
    RecentCalculator[]
  comparisons: number
  templates: number
  collections: number
  reports: number
  lastBackupAt: string
}

interface HealthAlert {
  id: string
  level:
    | 'attention'
    | 'info'
    | 'healthy'
  title: string
  description: string
  action: string
  target: WorkspaceTarget
}

const QUICK_ACTIONS: Array<{
  target: WorkspaceTarget
  number: string
  label: string
  description: string
}> = [
  {
    target: 'records',
    number: '01',
    label: 'Save calculation',
    description:
      'Store or reopen engineering results.',
  },
  {
    target: 'projects',
    number: '02',
    label: 'Open projects',
    description:
      'Organize related engineering cases.',
  },
  {
    target: 'reports',
    number: '03',
    label: 'Build report',
    description:
      'Create a printable engineering report.',
  },
  {
    target: 'search',
    number: '04',
    label: 'Search workspace',
    description:
      'Find records across the full notebook.',
  },
  {
    target: 'insights',
    number: '05',
    label: 'Review insights',
    description:
      'Inspect activity and usage trends.',
  },
  {
    target: 'data',
    number: '06',
    label: 'Back up data',
    description:
      'Export or restore personal workspace data.',
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

function firstString(
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

function humanizeId(
  value: string,
): string {
  return value
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    )
}

function readCalculations():
  CalculationRecord[] {
  return readArray(
    STORAGE_KEYS.calculations,
  ).flatMap((value) => {
    if (
      isRecord(value) === false
    ) {
      return []
    }

    const id =
      firstString(
        value,
        ['id'],
      )

    if (id.length === 0) {
      return []
    }

    const calculatorId =
      firstString(
        value,
        [
          'calculatorId',
          'calculatorID',
          'moduleId',
        ],
      )

    const calculatorTitle =
      firstString(
        value,
        [
          'calculatorTitle',
          'moduleTitle',
        ],
      ) ||
      (
        calculatorId
          ? humanizeId(
              calculatorId,
            )
          : 'Engineering calculation'
      )

    const createdAt =
      firstString(
        value,
        ['createdAt'],
      )

    return [{
      id,
      title:
        firstString(
          value,
          ['title', 'name'],
        ) ||
        calculatorTitle,
      calculatorId,
      calculatorTitle,
      category:
        firstString(
          value,
          ['category'],
        ) ||
        'Uncategorized',
      updatedAt:
        firstString(
          value,
          ['updatedAt'],
        ) ||
        createdAt,
      metadataComplete:
        hasTextArray(
          value.tags,
        ) &&
        firstString(
          value,
          [
            'notes',
            'description',
          ],
        ).length > 0,
    }]
  })
}

function readProjects():
  ProjectRecord[] {
  return readArray(
    STORAGE_KEYS.projects,
  ).flatMap((value) => {
    if (
      isRecord(value) === false
    ) {
      return []
    }

    const id =
      firstString(
        value,
        ['id'],
      )

    if (id.length === 0) {
      return []
    }

    const arrays = [
      value.items,
      value.calculationIds,
      value.comparisonIds,
      value.records,
    ]

    const itemCount =
      arrays.reduce<number>(
        (total, candidate) =>
          total +
          (
            Array.isArray(candidate)
              ? candidate.length
              : 0
          ),
        0,
      )

    const createdAt =
      firstString(
        value,
        ['createdAt'],
      )

    return [{
      id,
      title:
        firstString(
          value,
          ['title', 'name'],
        ) ||
        'Untitled project',
      updatedAt:
        firstString(
          value,
          ['updatedAt'],
        ) ||
        createdAt,
      itemCount,
    }]
  })
}

function readFavoriteIds():
  string[] {
  const ids =
    readArray(
      STORAGE_KEYS.favorites,
    ).flatMap((value) => {
      if (
        typeof value === 'string'
      ) {
        return value.trim()
          ? [value.trim()]
          : []
      }

      if (
        isRecord(value) === false
      ) {
        return []
      }

      const id =
        firstString(
          value,
          [
            'id',
            'calculatorId',
            'moduleId',
          ],
        )

      return id
        ? [id]
        : []
    })

  return Array.from(
    new Set(ids),
  )
}

function readRecentCalculators():
  RecentCalculator[] {
  return readArray(
    STORAGE_KEYS.recent,
  ).flatMap((value) => {
    if (
      typeof value === 'string'
    ) {
      return [{
        id: value,
        title:
          humanizeId(value),
        category: '',
        visitedAt: '',
      }]
    }

    if (
      isRecord(value) === false
    ) {
      return []
    }

    const id =
      firstString(
        value,
        [
          'id',
          'calculatorId',
          'moduleId',
        ],
      )

    if (id.length === 0) {
      return []
    }

    return [{
      id,
      title:
        firstString(
          value,
          [
            'title',
            'calculatorTitle',
          ],
        ) ||
        humanizeId(id),
      category:
        firstString(
          value,
          ['category'],
        ),
      visitedAt:
        firstString(
          value,
          [
            'visitedAt',
            'updatedAt',
            'createdAt',
          ],
        ),
    }]
  })
}

function readLastBackup():
  string {
  try {
    return (
      localStorage.getItem(
        STORAGE_KEYS.lastBackup,
      ) ?? ''
    )
  } catch {
    return ''
  }
}

function readSnapshot():
  CommandSnapshot {
  return {
    calculations:
      readCalculations(),
    projects:
      readProjects(),
    favoriteIds:
      readFavoriteIds(),
    recentCalculators:
      readRecentCalculators(),
    comparisons:
      readArray(
        STORAGE_KEYS.comparisons,
      ).length,
    templates:
      readArray(
        STORAGE_KEYS.templates,
      ).length,
    collections:
      readArray(
        STORAGE_KEYS.collections,
      ).length,
    reports:
      readArray(
        STORAGE_KEYS.reports,
      ).length,
    lastBackupAt:
      readLastBackup(),
  }
}

export function WorkspaceCommandCenterPanel({
  currentCalculator,
  onOpenCalculator,
  onOpenTab,
}: WorkspaceCommandCenterPanelProps) {
  const [
    snapshot,
    setSnapshot,
  ] = useState<CommandSnapshot>(
    readSnapshot,
  )

  function refreshSnapshot() {
    setSnapshot(
      readSnapshot(),
    )
  }

  useEffect(() => {
    DATA_EVENTS.forEach(
      (eventName) => {
        window.addEventListener(
          eventName,
          refreshSnapshot,
        )
      },
    )

    window.addEventListener(
      'storage',
      refreshSnapshot,
    )

    window.addEventListener(
      'focus',
      refreshSnapshot,
    )

    return () => {
      DATA_EVENTS.forEach(
        (eventName) => {
          window.removeEventListener(
            eventName,
            refreshSnapshot,
          )
        },
      )

      window.removeEventListener(
        'storage',
        refreshSnapshot,
      )

      window.removeEventListener(
        'focus',
        refreshSnapshot,
      )
    }
  }, [])

  const recentCalculations =
    useMemo(
      () =>
        [...snapshot.calculations]
          .sort(
            (first, second) =>
              timestamp(
                second.updatedAt,
              ) -
              timestamp(
                first.updatedAt,
              ),
          )
          .slice(0, 5),
      [snapshot.calculations],
    )

  const recentProjects =
    useMemo(
      () =>
        [...snapshot.projects]
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
      [snapshot.projects],
    )

  const favoriteCalculators =
    useMemo(
      () => {
        const lookup =
          new Map<
            string,
            RecentCalculator
          >()

        lookup.set(
          currentCalculator.id,
          {
            id:
              currentCalculator.id,
            title:
              currentCalculator.title,
            category:
              currentCalculator.category,
            visitedAt: '',
          },
        )

        snapshot.recentCalculators.forEach(
          (calculator) => {
            lookup.set(
              calculator.id,
              calculator,
            )
          },
        )

        snapshot.calculations.forEach(
          (calculation) => {
            if (
              calculation.calculatorId
            ) {
              lookup.set(
                calculation.calculatorId,
                {
                  id:
                    calculation.calculatorId,
                  title:
                    calculation.calculatorTitle,
                  category:
                    calculation.category,
                  visitedAt:
                    calculation.updatedAt,
                },
              )
            }
          },
        )

        return snapshot.favoriteIds
          .map((id) =>
            lookup.get(id) ?? {
              id,
              title:
                humanizeId(id),
              category: '',
              visitedAt: '',
            },
          )
          .slice(0, 6)
      },
      [
        currentCalculator,
        snapshot.calculations,
        snapshot.favoriteIds,
        snapshot.recentCalculators,
      ],
    )

  const latestCalculation =
    recentCalculations[0]

  const incompleteMetadata =
    snapshot.calculations.filter(
      (calculation) =>
        calculation.metadataComplete ===
        false,
    ).length

  const totalWorkspaceFiles =
    snapshot.calculations.length +
    snapshot.comparisons +
    snapshot.projects.length +
    snapshot.templates +
    snapshot.collections +
    snapshot.reports

  const alerts =
    useMemo<HealthAlert[]>(
      () => {
        const result:
          HealthAlert[] = []

        const backupTime =
          timestamp(
            snapshot.lastBackupAt,
          )

        const backupAge =
          backupTime === 0
            ? Number.POSITIVE_INFINITY
            : Date.now() -
              backupTime

        const fourteenDays =
          14 *
          24 *
          60 *
          60 *
          1000

        if (
          backupTime === 0
        ) {
          result.push({
            id: 'backup-missing',
            level: 'attention',
            title:
              'No workspace backup found',
            description:
              'Export a personal data backup before the workspace grows further.',
            action:
              'Open Data & Backup',
            target: 'data',
          })
        } else if (
          backupAge > fourteenDays
        ) {
          result.push({
            id: 'backup-old',
            level: 'attention',
            title:
              'Workspace backup is outdated',
            description:
              'The most recent local backup is more than fourteen days old.',
            action:
              'Create a new backup',
            target: 'data',
          })
        }

        if (
          incompleteMetadata > 0
        ) {
          result.push({
            id: 'metadata',
            level: 'info',
            title:
              `${incompleteMetadata} calculations need metadata`,
            description:
              'Add tags and notes to make saved engineering work easier to find and reuse.',
            action:
              'Open Tags & Notes',
            target: 'metadata',
          })
        }

        if (
          snapshot.projects.length ===
            0 &&
          snapshot.calculations.length >=
            3
        ) {
          result.push({
            id: 'projects',
            level: 'info',
            title:
              'Saved work is ready for a project',
            description:
              'Group related calculations into a project workspace.',
            action:
              'Create a project',
            target: 'projects',
          })
        }

        if (
          snapshot.reports === 0 &&
          snapshot.calculations.length >=
            5
        ) {
          result.push({
            id: 'reports',
            level: 'info',
            title:
              'Create your first engineering report',
            description:
              'Turn saved records into a structured printable report.',
            action:
              'Open Report Builder',
            target: 'reports',
          })
        }

        if (
          result.length === 0
        ) {
          result.push({
            id: 'healthy',
            level: 'healthy',
            title:
              'Workspace data looks healthy',
            description:
              'Your backup, metadata and organizational workflow are currently in good condition.',
            action:
              'Review insights',
            target: 'insights',
          })
        }

        return result
      },
      [
        incompleteMetadata,
        snapshot.calculations.length,
        snapshot.lastBackupAt,
        snapshot.projects.length,
        snapshot.reports,
      ],
    )

  return (
    <section
      className="workspace-command-center"
      aria-label="Engineering workspace command center"
    >
      <header className="workspace-command-header">
        <div>
          <span>
            Engineering workspace control
          </span>

          <h3>
            Command Center
          </h3>

          <p>
            Continue recent work, open core
            workspace tools and review important
            data-health actions from one place.
          </p>
        </div>

        <div className="workspace-command-active">
          <span>
            Active calculator
          </span>

          <strong>
            {currentCalculator.title}
          </strong>

          <small>
            {currentCalculator.category}
          </small>

          <button
            type="button"
            onClick={() =>
              onOpenCalculator(
                currentCalculator.id,
              )
            }
          >
            Open calculator
          </button>
        </div>
      </header>

      <div className="workspace-command-metrics">
        <article>
          <span>
            Workspace files
          </span>

          <strong>
            {totalWorkspaceFiles}
          </strong>

          <small>
            saved engineering records
          </small>
        </article>

        <article>
          <span>
            Calculations
          </span>

          <strong>
            {snapshot.calculations.length}
          </strong>

          <small>
            reusable calculation cases
          </small>
        </article>

        <article>
          <span>
            Projects
          </span>

          <strong>
            {snapshot.projects.length}
          </strong>

          <small>
            organized workspaces
          </small>
        </article>

        <article>
          <span>
            Reports
          </span>

          <strong>
            {snapshot.reports}
          </strong>

          <small>
            engineering report drafts
          </small>
        </article>

        <article>
          <span>
            Pinned calculators
          </span>

          <strong>
            {snapshot.favoriteIds.length}
          </strong>

          <small>
            favorite engineering tools
          </small>
        </article>
      </div>

      <div className="workspace-command-grid">
        <section className="workspace-command-card workspace-command-continue">
          <header>
            <span>
              Resume engineering work
            </span>

            <h4>
              Continue where you left off
            </h4>
          </header>

          {latestCalculation ? (
            <div className="workspace-command-primary-work">
              <span>
                Latest saved calculation
              </span>

              <strong>
                {latestCalculation.title}
              </strong>

              <p>
                {
                  latestCalculation.calculatorTitle
                }
                {' · '}
                {latestCalculation.category}
              </p>

              <small>
                Updated
                {' '}
                {formatDate(
                  latestCalculation.updatedAt,
                )}
              </small>

              <div>
                <button
                  type="button"
                  disabled={
                    latestCalculation
                      .calculatorId
                      .length === 0
                  }
                  onClick={() =>
                    onOpenCalculator(
                      latestCalculation
                        .calculatorId,
                    )
                  }
                >
                  Continue calculator
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onOpenTab('records')
                  }
                >
                  Open history
                </button>
              </div>
            </div>
          ) : (
            <div className="workspace-command-empty">
              <strong>
                No saved calculation yet
              </strong>

              <p>
                Run the active calculator and save
                the result to create a continuation
                point.
              </p>

              <button
                type="button"
                onClick={() =>
                  onOpenTab('records')
                }
              >
                Open Save & History
              </button>
            </div>
          )}
        </section>

        <section className="workspace-command-card workspace-command-actions">
          <header>
            <span>
              Workspace shortcuts
            </span>

            <h4>
              Quick actions
            </h4>
          </header>

          <div>
            {QUICK_ACTIONS.map(
              (action) => (
                <button
                  key={action.target}
                  type="button"
                  onClick={() =>
                    onOpenTab(
                      action.target,
                    )
                  }
                >
                  <span>
                    {action.number}
                  </span>

                  <div>
                    <strong>
                      {action.label}
                    </strong>

                    <small>
                      {action.description}
                    </small>
                  </div>

                  <b>
                    →
                  </b>
                </button>
              ),
            )}
          </div>
        </section>

        <section className="workspace-command-card workspace-command-pinned">
          <header>
            <span>
              Favorite tools
            </span>

            <h4>
              Pinned calculators
            </h4>
          </header>

          {favoriteCalculators.length ===
          0 ? (
            <div className="workspace-command-empty">
              <strong>
                No pinned calculators
              </strong>

              <p>
                Add frequently used calculators to
                favorites for direct access here.
              </p>
            </div>
          ) : (
            <div className="workspace-command-pinned-grid">
              {favoriteCalculators.map(
                (calculator) => (
                  <button
                    key={calculator.id}
                    type="button"
                    onClick={() =>
                      onOpenCalculator(
                        calculator.id,
                      )
                    }
                  >
                    <span>
                      ★
                    </span>

                    <strong>
                      {calculator.title}
                    </strong>

                    <small>
                      {calculator.category ||
                        'Engineering calculator'}
                    </small>
                  </button>
                ),
              )}
            </div>
          )}
        </section>

        <section className="workspace-command-card">
          <header>
            <span>
              Recent records
            </span>

            <h4>
              Latest calculations
            </h4>
          </header>

          {recentCalculations.length ===
          0 ? (
            <div className="workspace-command-empty">
              No recent calculation records.
            </div>
          ) : (
            <div className="workspace-command-list">
              {recentCalculations.map(
                (calculation) => (
                  <article
                    key={calculation.id}
                  >
                    <div>
                      <strong>
                        {calculation.title}
                      </strong>

                      <span>
                        {
                          calculation
                            .calculatorTitle
                        }
                      </span>

                      <small>
                        {formatDate(
                          calculation.updatedAt,
                        )}
                      </small>
                    </div>

                    <button
                      type="button"
                      disabled={
                        calculation
                          .calculatorId
                          .length === 0
                      }
                      onClick={() =>
                        onOpenCalculator(
                          calculation
                            .calculatorId,
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

        <section className="workspace-command-card">
          <header>
            <span>
              Project activity
            </span>

            <h4>
              Recent projects
            </h4>
          </header>

          {recentProjects.length ===
          0 ? (
            <div className="workspace-command-empty">
              <strong>
                No project workspace yet
              </strong>

              <p>
                Combine related calculations and
                comparisons into one project.
              </p>

              <button
                type="button"
                onClick={() =>
                  onOpenTab('projects')
                }
              >
                Open Projects
              </button>
            </div>
          ) : (
            <div className="workspace-command-list">
              {recentProjects.map(
                (project) => (
                  <article
                    key={project.id}
                  >
                    <div>
                      <strong>
                        {project.title}
                      </strong>

                      <span>
                        {project.itemCount}
                        {' '}
                        linked records
                      </span>

                      <small>
                        {formatDate(
                          project.updatedAt,
                        )}
                      </small>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onOpenTab(
                          'projects',
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

        <section className="workspace-command-card workspace-command-health">
          <header>
            <div>
              <span>
                Workspace readiness
              </span>

              <h4>
                Data-health actions
              </h4>
            </div>

            <button
              type="button"
              onClick={refreshSnapshot}
            >
              Refresh status
            </button>
          </header>

          <div>
            {alerts.map(
              (alert) => (
                <article
                  key={alert.id}
                  className={
                    `is-${alert.level}`
                  }
                >
                  <span>
                    {alert.level ===
                    'healthy'
                      ? '✓'
                      : alert.level ===
                          'attention'
                        ? '!'
                        : 'i'}
                  </span>

                  <div>
                    <strong>
                      {alert.title}
                    </strong>

                    <p>
                      {alert.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onOpenTab(
                        alert.target,
                      )
                    }
                  >
                    {alert.action}
                  </button>
                </article>
              ),
            )}
          </div>

          <footer>
            <span>
              Last backup
            </span>

            <strong>
              {snapshot.lastBackupAt
                ? formatDate(
                    snapshot.lastBackupAt,
                  )
                : 'No backup exported'}
            </strong>
          </footer>
        </section>
      </div>
    </section>
  )
}
