import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { calculators } from '../data/calculators'
import { rankProblemSolvers } from '../features/problem-solver/problemSolverEngine'
import type { CalculatorDefinition } from '../types/calculator'
import '../styles/workspace-smart-launcher.css'

const STORAGE_KEYS = {
  favorites:
    'cheme-toolkit-favorites-v1',
  recent:
    'cheme-toolkit-recent-v1',
  calculations:
    'cheme-toolkit.saved-calculations.v1',
  templates:
    'cheme-toolkit.workspace-templates.v1',
} as const

const DATA_EVENTS = [
  'cheme-toolkit:personal-data-changed',
  'cheme-toolkit:saved-calculations-changed',
  'cheme-toolkit:workspace-templates-changed',
]

type WorkspaceTarget =
  | 'command'
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

interface WorkspaceSmartLauncherPanelProps {
  currentCalculator:
    CalculatorDefinition
  onOpenCalculator: (
    calculatorId: string,
  ) => void
  onOpenTab: (
    tab: WorkspaceTarget,
  ) => void
}

interface Candidate {
  id: string
  kind:
    | 'calculator'
    | 'workspace'
  title: string
  subtitle: string
  description: string
  keywords: string
  calculatorId?: string
  target?: WorkspaceTarget
  priority: number
  solverScore?: number
  matchReason?: string
  quickSolutionLabel?: string
}

interface PersonalCalculator {
  id: string
  title: string
  category: string
  priority: number
}

const WORKSPACE_TOOLS:
  Candidate[] = [
    {
      id: 'tool-command',
      kind: 'workspace',
      title: 'Command Center',
      subtitle: 'Workspace control',
      description:
        'Continue your latest work and review data-health actions.',
      keywords:
        'continue latest resume command health status workspace',
      target: 'command',
      priority: 9,
    },
    {
      id: 'tool-overview',
      kind: 'workspace',
      title: 'Overview',
      subtitle: 'Workspace dashboard',
      description:
        'Review recent calculations, projects and activity.',
      keywords:
        'overview dashboard summary recent activity',
      target: 'dashboard',
      priority: 7,
    },
    {
      id: 'tool-insights',
      kind: 'workspace',
      title: 'Insights',
      subtitle: 'Analytics and trends',
      description:
        'Inspect usage trends, categories and data quality.',
      keywords:
        'insights analytics statistics trends category quality',
      target: 'insights',
      priority: 8,
    },
    {
      id: 'tool-records',
      kind: 'workspace',
      title: 'Save & History',
      subtitle: 'Calculation records',
      description:
        'Save results or reopen previous engineering calculations.',
      keywords:
        'save history previous calculation result export reopen',
      target: 'records',
      priority: 10,
    },
    {
      id: 'tool-compare',
      kind: 'workspace',
      title: 'Compare',
      subtitle: 'Engineering comparison',
      description:
        'Compare saved cases, scenarios and numerical results.',
      keywords:
        'compare comparison difference case scenario numerical',
      target: 'compare',
      priority: 9,
    },
    {
      id: 'tool-projects',
      kind: 'workspace',
      title: 'Projects',
      subtitle: 'Project workspace',
      description:
        'Organize related calculations and comparisons.',
      keywords:
        'project organize group related calculations files',
      target: 'projects',
      priority: 9,
    },
    {
      id: 'tool-reports',
      kind: 'workspace',
      title: 'Reports',
      subtitle: 'Engineering report builder',
      description:
        'Create a printable engineering report or PDF.',
      keywords:
        'report pdf print documentation engineering',
      target: 'reports',
      priority: 10,
    },
    {
      id: 'tool-search',
      kind: 'workspace',
      title: 'Workspace Search',
      subtitle: 'Find saved work',
      description:
        'Search every saved Workspace record from one index.',
      keywords:
        'search find locate saved record project report',
      target: 'search',
      priority: 9,
    },
    {
      id: 'tool-metadata',
      kind: 'workspace',
      title: 'Tags & Notes',
      subtitle: 'Workspace metadata',
      description:
        'Add searchable tags, notes and descriptions.',
      keywords:
        'tags notes metadata description label',
      target: 'metadata',
      priority: 7,
    },
    {
      id: 'tool-management',
      kind: 'workspace',
      title: 'Manage Records',
      subtitle: 'Record management',
      description:
        'Rename, duplicate, organize or delete records.',
      keywords:
        'manage rename duplicate delete remove organize',
      target: 'management',
      priority: 7,
    },
    {
      id: 'tool-templates',
      kind: 'workspace',
      title: 'Templates',
      subtitle: 'Reusable engineering cases',
      description:
        'Create and reuse calculator starting cases.',
      keywords:
        'template reusable preset starting case repeat',
      target: 'templates',
      priority: 8,
    },
    {
      id: 'tool-collections',
      kind: 'workspace',
      title: 'Collections',
      subtitle: 'Smart record groups',
      description:
        'Group records manually or with reusable smart rules.',
      keywords:
        'collection group folder smart rule records',
      target: 'collections',
      priority: 7,
    },
    {
      id: 'tool-backup',
      kind: 'workspace',
      title: 'Data & Backup',
      subtitle: 'Personal data management',
      description:
        'Export, restore or clear local Workspace data.',
      keywords:
        'backup restore export import data json download',
      target: 'data',
      priority: 10,
    },
  ]

const EXAMPLES = [
  'Find Reynolds number for density 998 kg/m3, velocity 2 m/s, diameter 0.05 m and viscosity 0.001 Pa s',
  'Find Reynolds number and flow regime',
  'Size a heat exchanger using LMTD',
  'Tune a PID controller',
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
    .replace(
      /[^a-z0-9çğıöşü\s-]/g,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim()
}

function readPersonalCalculators(
  currentCalculator:
    CalculatorDefinition,
): PersonalCalculator[] {
  const map =
    new Map<
      string,
      PersonalCalculator
    >()

  function add(
    id: string,
    title: string,
    category: string,
    priority: number,
  ) {
    const cleanId =
      id.trim()

    if (cleanId.length === 0) {
      return
    }

    const existing =
      map.get(cleanId)

    if (
      existing &&
      existing.priority <= priority
    ) {
      return
    }

    map.set(
      cleanId,
      {
        id: cleanId,
        title:
          title.trim() ||
          humanizeId(cleanId),
        category:
          category.trim() ||
          'Engineering calculator',
        priority,
      },
    )
  }

  add(
    currentCalculator.id,
    currentCalculator.title,
    currentCalculator.category,
    0,
  )

  const sources = [
    {
      key:
        STORAGE_KEYS.favorites,
      priority: 1,
    },
    {
      key:
        STORAGE_KEYS.recent,
      priority: 2,
    },
    {
      key:
        STORAGE_KEYS.calculations,
      priority: 3,
    },
    {
      key:
        STORAGE_KEYS.templates,
      priority: 4,
    },
  ]

  sources.forEach((source) => {
    readArray(
      source.key,
    ).forEach((value) => {
      if (
        typeof value === 'string'
      ) {
        add(
          value,
          '',
          '',
          source.priority,
        )
        return
      }

      if (isRecord(value)) {
        add(
          readString(
            value,
            [
              'calculatorId',
              'calculatorID',
              'moduleId',
              'id',
            ],
          ),
          readString(
            value,
            [
              'calculatorTitle',
              'moduleTitle',
              'title',
            ],
          ),
          readString(
            value,
            ['category'],
          ),
          source.priority,
        )
      }
    })
  })

  return Array.from(
    map.values(),
  ).sort(
    (first, second) =>
      first.priority -
        second.priority ||
      first.title.localeCompare(
        second.title,
      ),
  )
}

function score(
  candidate: Candidate,
  query: string,
): number {
  const cleanQuery =
    normalize(query)

  if (cleanQuery.length === 0) {
    return candidate.priority
  }

  const title =
    normalize(
      candidate.title,
    )

  const fullText =
    normalize(
      [
        candidate.title,
        candidate.subtitle,
        candidate.description,
        candidate.keywords,
      ].join(' '),
    )

  const tokens =
    cleanQuery
      .split(' ')
      .filter(
        (token) =>
          token.length > 1,
      )

  let result = 0

  if (title === cleanQuery) {
    result += 120
  }

  if (
    title.startsWith(
      cleanQuery,
    )
  ) {
    result += 70
  }

  if (
    fullText.includes(
      cleanQuery,
    )
  ) {
    result += 50
  }

  tokens.forEach((token) => {
    if (title.includes(token)) {
      result += 22
    } else if (
      fullText.includes(token)
    ) {
      result += 9
    }
  })

  return result
}

export function WorkspaceSmartLauncherPanel({
  currentCalculator,
  onOpenCalculator,
  onOpenTab,
}: WorkspaceSmartLauncherPanelProps) {
  const [
    query,
    setQuery,
  ] = useState('')

  const [
    revision,
    setRevision,
  ] = useState(0)

  useEffect(() => {
    function refresh() {
      setRevision(
        (value) =>
          value + 1,
      )
    }

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

  const calculatorCandidates =
    useMemo(
      () => {
        void revision

        return readPersonalCalculators(
          currentCalculator,
        ).map(
          (
            calculator,
          ): Candidate => ({
            id:
              'calculator-' +
              calculator.id,
            kind: 'calculator',
            title:
              calculator.title,
            subtitle:
              calculator.category,
            description:
              calculator.id ===
              currentCalculator.id
                ? 'Open the active engineering calculator.'
                : 'Open a recent, saved or favorite calculator.',
            keywords:
              calculator.id +
              ' calculator engineering module tool',
            calculatorId:
              calculator.id,
            priority:
              12 -
              calculator.priority,
          }),
        )
      },
      [
        currentCalculator,
        revision,
      ],
    )

  const problemMatches =
    useMemo(
      () =>
        rankProblemSolvers(
          query,
          calculators,
          10,
        ),
      [query],
    )

  const problemCandidates =
    useMemo(
      () =>
        problemMatches.map(
          (match): Candidate => ({
            id:
              'solver-' +
              match.calculatorId,
            kind: 'calculator',
            title:
              match.title,
            subtitle:
              match.category,
            description:
              [
                match.quickSolution
                  ? 'Quick result: ' +
                    match.quickSolution
                      .resultLabel +
                    ' = ' +
                    match.quickSolution
                      .resultValue
                  : '',
                match.quickSolution
                  ? 'Steps: ' +
                    match.quickSolution
                      .steps
                      .slice(0, 2)
                      .join(' → ')
                  : '',
                match.guidance,
                'Readiness: ' +
                  match.readinessPercent +
                  '%',
                match.detectedInputs.length > 0
                  ? 'Detected: ' +
                    match.detectedInputs
                      .slice(0, 3)
                      .join(', ')
                  : 'Detected: none',
                match.missingInputs.length > 0
                  ? 'Missing: ' +
                    match.missingInputs
                      .slice(0, 3)
                      .join(', ')
                  : 'Required inputs complete',
                match.equationHint
                  ? 'Model: ' +
                    match.equationHint
                  : '',
              ]
                .filter(Boolean)
                .join(' · '),
            keywords:
              [
                match.calculatorId,
                match.title,
                match.category,
                ...match.reasons,
                match.guidance,
                ...match.requiredInputs,
                ...match.detectedInputs,
                ...match.missingInputs,
                match.equationHint,
                match.quickSolution
                  ?.resultLabel ??
                  '',
                match.quickSolution
                  ?.resultValue ??
                  '',
                match.quickSolution
                  ?.equation ??
                  '',
                ...(
                  match.quickSolution
                    ?.steps ??
                  []
                ),
              ].join(' '),
            calculatorId:
              match.calculatorId,
            priority: 20,
            solverScore:
              match.score,
            matchReason:
              match.quickSolution
                ? 'quick solve ready'
                : match.confidence +
                  ' confidence',
            quickSolutionLabel:
              match.quickSolution
                ? 'Solved locally'
                : undefined,
          }),
        ),
      [problemMatches],
    )

  const allCandidates =
    useMemo(
      () =>
        query.trim().length > 0
          ? [
              ...problemCandidates,
              ...WORKSPACE_TOOLS,
            ]
          : [
              ...calculatorCandidates,
              ...WORKSPACE_TOOLS,
            ],
      [
        calculatorCandidates,
        problemCandidates,
        query,
      ],
    )

  const results =
    useMemo(
      () => {
        const cleanQuery =
          query.trim()

        if (
          cleanQuery.length === 0
        ) {
          const defaults =
            allCandidates.filter(
              (candidate) =>
                candidate.calculatorId ===
                  currentCalculator.id ||
                candidate.target ===
                  'records' ||
                candidate.target ===
                  'projects' ||
                candidate.target ===
                  'reports' ||
                candidate.target ===
                  'data',
            )

          return defaults.slice(0, 6)
        }

        return allCandidates
          .map((candidate) => ({
            candidate,
            value:
              score(
                candidate,
                cleanQuery,
              ) +
              (
                candidate.solverScore ??
                0
              ),
          }))
          .filter(
            (entry) =>
              entry.value > 0,
          )
          .sort(
            (first, second) =>
              second.value -
                first.value ||
              second.candidate
                .priority -
                first.candidate
                  .priority,
          )
          .slice(0, 8)
          .map(
            (entry) =>
              entry.candidate,
          )
      },
      [
        allCandidates,
        currentCalculator.id,
        query,
      ],
    )

  function openCandidate(
    candidate: Candidate,
  ) {
    if (
      candidate.kind ===
        'calculator' &&
      candidate.calculatorId
    ) {
      onOpenCalculator(
        candidate.calculatorId,
      )
      return
    }

    if (candidate.target) {
      onOpenTab(
        candidate.target,
      )
    }
  }

  return (
    <section
      className="workspace-smart-launcher"
      aria-label="Workspace smart launcher"
    >
      <header className="workspace-smart-launcher-header">
        <div>
          <span>
            Intent-based navigation
          </span>

          <h3>
            Smart Launcher
          </h3>

          <p>
            Describe an engineering problem or Workspace
            goal. Problem Solver recommends calculators
            and Smart Launcher opens the right tool.
          </p>
        </div>

        <div className="workspace-smart-launcher-count">
          <strong>
            {calculators.length}
          </strong>

          <span>
            verified calculators searchable
          </span>
        </div>
      </header>

      <div className="workspace-smart-launcher-search">
        <label htmlFor="workspace-smart-launcher-query">
          What engineering problem are you solving?
        </label>

        <div>
          <span>
            ⌕
          </span>

          <input
            id="workspace-smart-launcher-query"
            type="search"
            value={query}
            placeholder="Example: estimate pressure drop through a pipe"
            autoComplete="off"
            onChange={(event) =>
              setQuery(
                event.target.value,
              )
            }
          />

          {query ? (
            <button
              type="button"
              onClick={() =>
                setQuery('')
              }
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <div className="workspace-smart-launcher-examples">
        <span>
          Try:
        </span>

        {EXAMPLES.map(
          (example) => (
            <button
              key={example}
              type="button"
              onClick={() =>
                setQuery(example)
              }
            >
              {example}
            </button>
          ),
        )}
      </div>

      <div className="workspace-smart-launcher-heading">
        <div>
          <span>
            {query.trim()
              ? 'Best matches'
              : 'Recommended starting points'}
          </span>

          <strong>
            {results.length}
            {' '}
            results
          </strong>
        </div>

        <small>
          Matching is performed locally in this
          browser.
        </small>
      </div>

      {results.length === 0 ? (
        <div className="workspace-smart-launcher-empty">
          <strong>
            No direct match found
          </strong>

          <p>
            Try “report”, “compare”, “backup”,
            “project” or a calculator name.
          </p>

          <button
            type="button"
            onClick={() =>
              onOpenTab('search')
            }
          >
            Open full Workspace Search
          </button>
        </div>
      ) : (
        <div className="workspace-smart-launcher-results">
          {results.map(
            (candidate, index) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() =>
                  openCandidate(
                    candidate,
                  )
                }
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
                  <small>
                    {candidate.kind ===
                      'calculator'
                        ? candidate.quickSolutionLabel
                          ? candidate.quickSolutionLabel
                          : candidate.matchReason
                            ? 'Problem Solver match'
                            : 'Calculator'
                        : 'Workspace tool'}
                  </small>

                  <strong>
                    {candidate.title}
                  </strong>

                  <b>
                    {candidate.subtitle}
                  </b>

                  <p>
                    {candidate.description}
                  </p>
                </div>

                <em>
                   {candidate.quickSolutionLabel
                     ? 'Review result · Open →'
                     : 'Open →'}
                 </em>
              </button>
            ),
          )}
        </div>
      )}

      <footer className="workspace-smart-launcher-footer">
        <div>
          <strong>
            Need a broader search?
          </strong>

          <span>
            Search every saved Workspace record
            from the advanced index.
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            onOpenTab('search')
          }
        >
          Open advanced search
        </button>
      </footer>
    </section>
  )
}
