import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import '../styles/workspace-report-builder.css'

const CALCULATIONS_KEY =
  'cheme-toolkit.saved-calculations.v1'

const COMPARISONS_KEY =
  'cheme-toolkit.saved-comparisons.v1'

const PROJECTS_KEY =
  'cheme-toolkit.project-workspaces.v1'

const TEMPLATES_KEY =
  'cheme-toolkit.workspace-templates.v1'

const COLLECTIONS_KEY =
  'cheme-toolkit.workspace-collections.v1'

const REPORTS_KEY =
  'cheme-toolkit.workspace-reports.v1'

const REPORTS_EVENT =
  'cheme-toolkit:workspace-reports-changed'

const PERSONAL_DATA_EVENT =
  'cheme-toolkit:personal-data-changed'

const SOURCE_EVENTS = [
  'cheme-toolkit:saved-calculations-changed',
  'cheme-toolkit:saved-comparisons-changed',
  'cheme-toolkit:project-workspaces-changed',
  'cheme-toolkit:workspace-templates-changed',
  'cheme-toolkit:workspace-collections-changed',
  PERSONAL_DATA_EVENT,
]

const MAX_REPORTS = 100
const MAX_SECTIONS = 50

type SourceType =
  | 'calculation'
  | 'comparison'
  | 'project'
  | 'template'
  | 'collection'

type TypeFilter =
  | 'all'
  | SourceType

type Status =
  | 'idle'
  | 'saved'
  | 'updated'
  | 'loaded'
  | 'duplicated'
  | 'deleted'
  | 'printed'
  | 'title-required'
  | 'source-required'
  | 'draft-required'
  | 'duplicate-source'
  | 'error'

interface ReportSource {
  key: string
  id: string
  type: SourceType
  name: string
  subtitle: string
  category: string
  createdAt: string
  summary: string
  body: string
  formula: string
  reference: string
  tags: string[]
  facts: string[]
}

interface ReportSection {
  id: string
  sourceKey: string
  heading: string
  notes: string
}

interface ReportDraft {
  id: string
  title: string
  subtitle: string
  author: string
  organization: string
  reportDate: string
  purpose: string
  executiveSummary: string
  conclusion: string
  createdAt: string
  updatedAt: string
  sections: ReportSection[]
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

function readString(
  value: unknown,
  fallback = '',
): string {
  return typeof value === 'string'
    ? value
    : fallback
}

function readStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter(
    (item): item is string =>
      typeof item === 'string',
  )
}

function normalizeTags(
  value: unknown,
): string[] {
  const seen =
    new Set<string>()

  return readStringArray(value)
    .map((tag) =>
      tag
        .trim()
        .replace(/\s+/g, ' '),
    )
    .filter((tag) => {
      if (!tag) {
        return false
      }

      const normalized =
        tag.toLocaleLowerCase(
          'en-US',
        )

      if (seen.has(normalized)) {
        return false
      }

      seen.add(normalized)
      return true
    })
}

function createId(): string {
  if (
    typeof crypto !== 'undefined' &&
    'randomUUID' in crypto
  ) {
    return crypto.randomUUID()
  }

  return [
    Date.now().toString(36),
    Math.random()
      .toString(36)
      .slice(2),
  ].join('-')
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
    },
  ).format(date)
}

function sourceTypeLabel(
  type: SourceType,
): string {
  if (type === 'calculation') {
    return 'Saved calculation'
  }

  if (type === 'comparison') {
    return 'Comparison snapshot'
  }

  if (type === 'project') {
    return 'Project workspace'
  }

  if (type === 'template') {
    return 'Reusable template'
  }

  return 'Workspace collection'
}

function readReportSources():
  ReportSource[] {
  const calculations =
    readArray(
      CALCULATIONS_KEY,
    ).flatMap((value) => {
      if (
        !isRecord(value) ||
        typeof value.id !== 'string' ||
        typeof value.name !== 'string'
      ) {
        return []
      }

      const inputs =
        Array.isArray(value.inputs)
          ? value.inputs.length
          : 0

      const results =
        Array.isArray(value.results)
          ? value.results.length
          : 0

      return [{
        key:
          `calculation:${value.id}`,
        id: value.id,
        type:
          'calculation' as const,
        name: value.name,
        subtitle:
          readString(
            value.calculatorTitle,
            'Unknown calculator',
          ),
        category:
          readString(
            value.category,
            'Uncategorized',
          ),
        createdAt:
          readString(value.createdAt),
        summary:
          `${inputs} saved inputs and ${results} calculated results.`,
        body:
          readString(value.notes),
        formula:
          readString(value.formula),
        reference:
          readString(value.reference),
        tags:
          normalizeTags(value.tags),
        facts: [
          `${inputs} stored inputs`,
          `${results} stored results`,
        ],
      }]
    })

  const comparisons =
    readArray(
      COMPARISONS_KEY,
    ).flatMap((value) => {
      if (
        !isRecord(value) ||
        typeof value.id !== 'string' ||
        typeof value.name !== 'string'
      ) {
        return []
      }

      const snapshots =
        Array.isArray(
          value.calculationSnapshots,
        )
          ? value
              .calculationSnapshots
              .length
          : 0

      return [{
        key:
          `comparison:${value.id}`,
        id: value.id,
        type:
          'comparison' as const,
        name: value.name,
        subtitle:
          readString(
            value.calculatorTitle,
            'Engineering comparison',
          ),
        category:
          readString(
            value.category,
            'Uncategorized',
          ),
        createdAt:
          readString(value.createdAt),
        summary:
          `${snapshots} calculation cases preserved in this comparison snapshot.`,
        body:
          readString(
            value.description,
          ),
        formula: '',
        reference: '',
        tags:
          normalizeTags(value.tags),
        facts: [
          `${snapshots} source cases`,
          'Comparison snapshot',
        ],
      }]
    })

  const projects =
    readArray(
      PROJECTS_KEY,
    ).flatMap((value) => {
      if (
        !isRecord(value) ||
        typeof value.id !== 'string' ||
        typeof value.name !== 'string'
      ) {
        return []
      }

      const calculationsCount =
        readStringArray(
          value.calculationIds,
        ).length

      const comparisonsCount =
        readStringArray(
          value.comparisonIds,
        ).length

      const createdAt =
        readString(value.createdAt)

      const updatedAt =
        readString(
          value.updatedAt,
          createdAt,
        )

      return [{
        key:
          `project:${value.id}`,
        id: value.id,
        type:
          'project' as const,
        name: value.name,
        subtitle:
          'Project workspace',
        category:
          'Project workspace',
        createdAt: updatedAt,
        summary:
          `${calculationsCount} calculations and ${comparisonsCount} comparisons are linked to this project.`,
        body: [
          readString(
            value.description,
          ),
          readString(value.notes),
        ]
          .filter(Boolean)
          .join('\n\n'),
        formula: '',
        reference: '',
        tags: [],
        facts: [
          `${calculationsCount} calculations`,
          `${comparisonsCount} comparisons`,
        ],
      }]
    })

  const templates =
    readArray(
      TEMPLATES_KEY,
    ).flatMap((value) => {
      if (
        !isRecord(value) ||
        typeof value.id !== 'string' ||
        typeof value.name !== 'string'
      ) {
        return []
      }

      const inputs =
        Array.isArray(value.inputs)
          ? value.inputs.length
          : 0

      const useCount =
        typeof value.useCount ===
          'number' &&
        Number.isFinite(
          value.useCount,
        )
          ? Math.max(
              0,
              Math.floor(
                value.useCount,
              ),
            )
          : 0

      return [{
        key:
          `template:${value.id}`,
        id: value.id,
        type:
          'template' as const,
        name: value.name,
        subtitle:
          readString(
            value.calculatorTitle,
            'Reusable calculator case',
          ),
        category:
          readString(
            value.category,
            'Uncategorized',
          ),
        createdAt:
          readString(
            value.updatedAt,
            readString(
              value.createdAt,
            ),
          ),
        summary:
          `${inputs} starting inputs preserved for reuse. Used ${useCount} times.`,
        body:
          readString(
            value.description,
          ),
        formula:
          readString(value.formula),
        reference:
          readString(value.reference),
        tags:
          normalizeTags(value.tags),
        facts: [
          `${inputs} stored inputs`,
          `${useCount} template uses`,
        ],
      }]
    })

  const collections =
    readArray(
      COLLECTIONS_KEY,
    ).flatMap((value) => {
      if (
        !isRecord(value) ||
        typeof value.id !== 'string' ||
        typeof value.name !== 'string'
      ) {
        return []
      }

      const mode =
        value.mode === 'smart'
          ? 'Smart'
          : 'Manual'

      const itemCount =
        readStringArray(
          value.manualItemKeys,
        ).length

      const ruleSummary =
        value.mode === 'smart' &&
        isRecord(value.rule)
          ? [
              readString(
                value.rule.category,
              ),
              readString(
                value.rule.tag,
              ),
              readString(
                value.rule.query,
              ),
            ]
              .filter(
                (item) =>
                  item &&
                  item !== 'all',
              )
              .join(' · ')
          : ''

      return [{
        key:
          `collection:${value.id}`,
        id: value.id,
        type:
          'collection' as const,
        name: value.name,
        subtitle:
          `${mode} collection`,
        category:
          'Workspace collection',
        createdAt:
          readString(
            value.updatedAt,
            readString(
              value.createdAt,
            ),
          ),
        summary:
          value.mode === 'smart'
            ? 'Automatically updated workspace view based on saved rules.'
            : `${itemCount} fixed workspace records are included.`,
        body:
          readString(
            value.description,
          ),
        formula: '',
        reference: '',
        tags: [],
        facts: [
          `${mode} collection`,
          value.mode === 'smart'
            ? (
                ruleSummary ||
                'Automatic matching rules'
              )
            : `${itemCount} selected records`,
        ],
      }]
    })

  return [
    ...calculations,
    ...comparisons,
    ...projects,
    ...templates,
    ...collections,
  ].sort(
    (first, second) =>
      timestamp(
        second.createdAt,
      ) -
      timestamp(
        first.createdAt,
      ),
  )
}

function readReportDrafts():
  ReportDraft[] {
  return readArray(
    REPORTS_KEY,
  ).flatMap((value) => {
    if (
      !isRecord(value) ||
      typeof value.id !== 'string' ||
      typeof value.title !==
        'string'
    ) {
      return []
    }

    const sections =
      Array.isArray(value.sections)
        ? value.sections.flatMap(
            (section) => {
              if (
                !isRecord(section) ||
                typeof section.id !==
                  'string' ||
                typeof section.sourceKey !==
                  'string'
              ) {
                return []
              }

              return [{
                id: section.id,
                sourceKey:
                  section.sourceKey,
                heading:
                  readString(
                    section.heading,
                    'Report section',
                  ),
                notes:
                  readString(
                    section.notes,
                  ),
              }]
            },
          )
        : []

    const createdAt =
      readString(value.createdAt)

    return [{
      id: value.id,
      title: value.title,
      subtitle:
        readString(value.subtitle),
      author:
        readString(value.author),
      organization:
        readString(
          value.organization,
        ),
      reportDate:
        readString(
          value.reportDate,
        ),
      purpose:
        readString(value.purpose),
      executiveSummary:
        readString(
          value.executiveSummary,
        ),
      conclusion:
        readString(
          value.conclusion,
        ),
      createdAt,
      updatedAt:
        readString(
          value.updatedAt,
          createdAt,
        ),
      sections:
        sections.slice(
          0,
          MAX_SECTIONS,
        ),
    }]
  }).sort(
    (first, second) =>
      timestamp(
        second.updatedAt,
      ) -
      timestamp(
        first.updatedAt,
      ),
  )
}

function writeReportDrafts(
  drafts: ReportDraft[],
): boolean {
  try {
    localStorage.setItem(
      REPORTS_KEY,
      JSON.stringify(
        drafts.slice(
          0,
          MAX_REPORTS,
        ),
      ),
    )

    window.dispatchEvent(
      new Event(REPORTS_EVENT),
    )

    window.dispatchEvent(
      new Event(
        PERSONAL_DATA_EVENT,
      ),
    )

    return true
  } catch {
    return false
  }
}

function initialReportDate(): string {
  return new Date()
    .toISOString()
    .slice(0, 10)
}

export function WorkspaceReportBuilderPanel() {
  const [
    sources,
    setSources,
  ] = useState<ReportSource[]>(
    readReportSources,
  )

  const [
    drafts,
    setDrafts,
  ] = useState<ReportDraft[]>(
    readReportDrafts,
  )

  const [
    selectedDraftId,
    setSelectedDraftId,
  ] = useState('')

  const [
    title,
    setTitle,
  ] = useState('')

  const [
    subtitle,
    setSubtitle,
  ] = useState('')

  const [
    author,
    setAuthor,
  ] = useState('')

  const [
    organization,
    setOrganization,
  ] = useState('')

  const [
    reportDate,
    setReportDate,
  ] = useState(
    initialReportDate,
  )

  const [
    purpose,
    setPurpose,
  ] = useState('')

  const [
    executiveSummary,
    setExecutiveSummary,
  ] = useState('')

  const [
    conclusion,
    setConclusion,
  ] = useState('')

  const [
    sections,
    setSections,
  ] = useState<ReportSection[]>(
    [],
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
    status,
    setStatus,
  ] = useState<Status>(
    'idle',
  )

  const sourceByKey =
    useMemo(
      () =>
        new Map(
          sources.map(
            (source) => [
              source.key,
              source,
            ],
          ),
        ),
      [sources],
    )

  const filteredSources =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLocaleLowerCase(
            'en-US',
          )

      return sources.filter(
        (source) => {
          const typeMatches =
            typeFilter === 'all' ||
            source.type ===
              typeFilter

          const queryMatches =
            !normalizedQuery ||
            [
              source.name,
              source.subtitle,
              source.category,
              source.summary,
              source.body,
              ...source.tags,
            ]
              .join(' ')
              .toLocaleLowerCase(
                'en-US',
              )
              .includes(
                normalizedQuery,
              )

          return (
            typeMatches &&
            queryMatches
          )
        },
      )
    }, [
      sources,
      query,
      typeFilter,
    ])

  const selectedDraft =
    useMemo(
      () =>
        drafts.find(
          (draft) =>
            draft.id ===
            selectedDraftId,
        ) ?? null,
      [
        drafts,
        selectedDraftId,
      ],
    )

  useEffect(() => {
    function refreshSources() {
      setSources(
        readReportSources(),
      )
    }

    function refreshDrafts() {
      const next =
        readReportDrafts()

      setDrafts(next)

      setSelectedDraftId(
        (current) =>
          next.some(
            (draft) =>
              draft.id === current,
          )
            ? current
            : '',
      )
    }

    SOURCE_EVENTS.forEach(
      (eventName) => {
        window.addEventListener(
          eventName,
          refreshSources,
        )
      },
    )

    window.addEventListener(
      REPORTS_EVENT,
      refreshDrafts,
    )

    window.addEventListener(
      'storage',
      refreshSources,
    )

    window.addEventListener(
      'storage',
      refreshDrafts,
    )

    window.addEventListener(
      'focus',
      refreshSources,
    )

    window.addEventListener(
      'focus',
      refreshDrafts,
    )

    return () => {
      SOURCE_EVENTS.forEach(
        (eventName) => {
          window.removeEventListener(
            eventName,
            refreshSources,
          )
        },
      )

      window.removeEventListener(
        REPORTS_EVENT,
        refreshDrafts,
      )

      window.removeEventListener(
        'storage',
        refreshSources,
      )

      window.removeEventListener(
        'storage',
        refreshDrafts,
      )

      window.removeEventListener(
        'focus',
        refreshSources,
      )

      window.removeEventListener(
        'focus',
        refreshDrafts,
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
        2800,
      )

    return () =>
      window.clearTimeout(timer)
  }, [status])

  function resetEditor() {
    setSelectedDraftId('')
    setTitle('')
    setSubtitle('')
    setAuthor('')
    setOrganization('')
    setReportDate(
      initialReportDate(),
    )
    setPurpose('')
    setExecutiveSummary('')
    setConclusion('')
    setSections([])
    setStatus('idle')
  }

  function createDraft(
    id: string,
    createdAt: string,
  ): ReportDraft {
    const now =
      new Date().toISOString()

    return {
      id,
      title:
        title.trim(),
      subtitle:
        subtitle.trim(),
      author:
        author.trim(),
      organization:
        organization.trim(),
      reportDate,
      purpose:
        purpose.trim(),
      executiveSummary:
        executiveSummary.trim(),
      conclusion:
        conclusion.trim(),
      createdAt,
      updatedAt: now,
      sections:
        sections.slice(
          0,
          MAX_SECTIONS,
        ),
    }
  }

  function validateReport():
    boolean {
    if (!title.trim()) {
      setStatus(
        'title-required',
      )
      return false
    }

    if (sections.length === 0) {
      setStatus(
        'source-required',
      )
      return false
    }

    return true
  }

  function saveDraftList(
    next: ReportDraft[],
  ): boolean {
    if (
      !writeReportDrafts(next)
    ) {
      setStatus('error')
      return false
    }

    setDrafts(next)
    return true
  }

  function handleSaveNew() {
    if (!validateReport()) {
      return
    }

    const now =
      new Date().toISOString()

    const draft =
      createDraft(
        createId(),
        now,
      )

    const next = [
      draft,
      ...drafts,
    ].slice(
      0,
      MAX_REPORTS,
    )

    if (
      !saveDraftList(next)
    ) {
      return
    }

    setSelectedDraftId(
      draft.id,
    )

    setStatus('saved')
  }

  function handleUpdate() {
    if (!selectedDraft) {
      setStatus(
        'draft-required',
      )
      return
    }

    if (!validateReport()) {
      return
    }

    const updated =
      createDraft(
        selectedDraft.id,
        selectedDraft.createdAt,
      )

    const next =
      drafts.map(
        (draft) =>
          draft.id ===
          selectedDraft.id
            ? updated
            : draft,
      )

    if (
      saveDraftList(next)
    ) {
      setStatus('updated')
    }
  }

  function handleLoad(
    draft: ReportDraft,
  ) {
    setSelectedDraftId(
      draft.id,
    )
    setTitle(draft.title)
    setSubtitle(draft.subtitle)
    setAuthor(draft.author)
    setOrganization(
      draft.organization,
    )
    setReportDate(
      draft.reportDate ||
      initialReportDate(),
    )
    setPurpose(draft.purpose)
    setExecutiveSummary(
      draft.executiveSummary,
    )
    setConclusion(
      draft.conclusion,
    )
    setSections(
      draft.sections.map(
        (section) => ({
          ...section,
        }),
      ),
    )
    setStatus('loaded')
  }

  function handleDuplicate(
    draft: ReportDraft,
  ) {
    const now =
      new Date().toISOString()

    const duplicate:
      ReportDraft = {
      ...draft,
      id: createId(),
      title:
        `${draft.title} Copy`,
      createdAt: now,
      updatedAt: now,
      sections:
        draft.sections.map(
          (section) => ({
            ...section,
            id: createId(),
          }),
        ),
    }

    const next = [
      duplicate,
      ...drafts,
    ].slice(
      0,
      MAX_REPORTS,
    )

    if (
      !saveDraftList(next)
    ) {
      return
    }

    handleLoad(duplicate)
    setStatus('duplicated')
  }

  function handleDelete(
    draft: ReportDraft,
  ) {
    const confirmed =
      window.confirm(
        `Delete the report draft “${draft.title}”? Source workspace records will not be deleted.`,
      )

    if (!confirmed) {
      return
    }

    const next =
      drafts.filter(
        (current) =>
          current.id !==
          draft.id,
      )

    if (
      !saveDraftList(next)
    ) {
      return
    }

    if (
      selectedDraftId ===
      draft.id
    ) {
      resetEditor()
    }

    setStatus('deleted')
  }

  function addSource(
    source: ReportSource,
  ) {
    if (
      sections.some(
        (section) =>
          section.sourceKey ===
          source.key,
      )
    ) {
      setStatus(
        'duplicate-source',
      )
      return
    }

    setSections(
      (current) => [
        ...current,
        {
          id: createId(),
          sourceKey:
            source.key,
          heading:
            source.name,
          notes: '',
        },
      ].slice(
        0,
        MAX_SECTIONS,
      ),
    )
  }

  function updateSection(
    id: string,
    update:
      Partial<ReportSection>,
  ) {
    setSections(
      (current) =>
        current.map(
          (section) =>
            section.id === id
              ? {
                  ...section,
                  ...update,
                }
              : section,
        ),
    )
  }

  function removeSection(
    id: string,
  ) {
    setSections(
      (current) =>
        current.filter(
          (section) =>
            section.id !== id,
        ),
    )
  }

  function moveSection(
    index: number,
    direction: -1 | 1,
  ) {
    const target =
      index + direction

    if (
      target < 0 ||
      target >= sections.length
    ) {
      return
    }

    setSections(
      (current) => {
        const next =
          [...current]

        const [
          selected,
        ] = next.splice(
          index,
          1,
        )

        next.splice(
          target,
          0,
          selected,
        )

        return next
      },
    )
  }

  function handlePrint() {
    if (!validateReport()) {
      return
    }

    setStatus('printed')

    window.setTimeout(() => {
      window.print()
    }, 120)
  }

  return (
    <section
      className="workspace-report-builder-panel"
      aria-label="Workspace engineering report builder"
    >
      <header className="workspace-report-builder-header">
        <div>
          <span>
            Engineering documentation
          </span>

          <h3>
            Workspace report builder
          </h3>

          <p>
            Combine saved calculations,
            comparisons, projects, templates and
            collections into a structured
            engineering report.
          </p>
        </div>

        <div className="workspace-report-builder-summary">
          <strong>
            {drafts.length}
          </strong>

          <span>
            saved drafts
          </span>

          <small>
            {sections.length}
            {' '}
            active sections
          </small>
        </div>
      </header>

      <div className="workspace-report-builder-toolbar">
        <button
          type="button"
          onClick={resetEditor}
        >
          New report
        </button>

        <button
          type="button"
          onClick={handleSaveNew}
        >
          Save as new draft
        </button>

        <button
          type="button"
          disabled={!selectedDraft}
          onClick={handleUpdate}
        >
          Update selected draft
        </button>

        <button
          type="button"
          className="workspace-report-print-button"
          onClick={handlePrint}
        >
          Print / Save PDF
        </button>
      </div>

      <div className="workspace-report-builder-layout">
        <div className="workspace-report-builder-editor">
          <section className="workspace-report-cover-editor">
            <header>
              <span>
                Step 01
              </span>

              <h4>
                Report cover
              </h4>
            </header>

            <div className="workspace-report-cover-fields">
              <label className="workspace-report-title-field">
                <span>
                  Report title
                </span>

                <input
                  type="text"
                  value={title}
                  maxLength={140}
                  placeholder="Example: Pump System Design Review"
                  onChange={(event) =>
                    setTitle(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Subtitle
                </span>

                <input
                  type="text"
                  value={subtitle}
                  maxLength={180}
                  placeholder="Optional report subtitle"
                  onChange={(event) =>
                    setSubtitle(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Author
                </span>

                <input
                  type="text"
                  value={author}
                  maxLength={100}
                  placeholder="Prepared by"
                  onChange={(event) =>
                    setAuthor(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Organization
                </span>

                <input
                  type="text"
                  value={organization}
                  maxLength={120}
                  placeholder="Company, university or team"
                  onChange={(event) =>
                    setOrganization(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Report date
                </span>

                <input
                  type="date"
                  value={reportDate}
                  onChange={(event) =>
                    setReportDate(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="workspace-report-wide-field">
                <span>
                  Purpose and scope
                </span>

                <textarea
                  value={purpose}
                  rows={3}
                  maxLength={1000}
                  placeholder="Describe the engineering objective, assumptions and report scope."
                  onChange={(event) =>
                    setPurpose(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="workspace-report-wide-field">
                <span>
                  Executive summary
                </span>

                <textarea
                  value={
                    executiveSummary
                  }
                  rows={4}
                  maxLength={1600}
                  placeholder="Summarize the problem, approach and key findings."
                  onChange={(event) =>
                    setExecutiveSummary(
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>
          </section>

          <section className="workspace-report-source-browser">
            <header>
              <div>
                <span>
                  Step 02
                </span>

                <h4>
                  Add workspace sources
                </h4>
              </div>

              <strong>
                {sources.length}
                {' '}
                available
              </strong>
            </header>

            <div className="workspace-report-source-filters">
              <input
                type="search"
                value={query}
                placeholder="Search saved workspace records…"
                onChange={(event) =>
                  setQuery(
                    event.target.value,
                  )
                }
              />

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
                  All source types
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

                <option value="template">
                  Templates
                </option>

                <option value="collection">
                  Collections
                </option>
              </select>
            </div>

            <div className="workspace-report-source-list">
              {filteredSources.length ===
              0 ? (
                <p>
                  No matching workspace sources.
                </p>
              ) : (
                filteredSources
                  .slice(0, 60)
                  .map((source) => {
                    const isAdded =
                      sections.some(
                        (section) =>
                          section.sourceKey ===
                          source.key,
                      )

                    return (
                      <article
                        key={source.key}
                      >
                        <div>
                          <span>
                            {sourceTypeLabel(
                              source.type,
                            )}
                          </span>

                          <strong>
                            {source.name}
                          </strong>

                          <small>
                            {source.subtitle}
                            {' · '}
                            {source.category}
                          </small>
                        </div>

                        <button
                          type="button"
                          disabled={isAdded}
                          onClick={() =>
                            addSource(
                              source,
                            )
                          }
                        >
                          {isAdded
                            ? 'Added'
                            : 'Add'}
                        </button>
                      </article>
                    )
                  })
              )}
            </div>
          </section>

          <section className="workspace-report-outline-editor">
            <header>
              <div>
                <span>
                  Step 03
                </span>

                <h4>
                  Report outline
                </h4>
              </div>

              <strong>
                {sections.length}
                {' '}
                sections
              </strong>
            </header>

            {sections.length === 0 ? (
              <div className="workspace-report-empty-outline">
                <strong>
                  No report sections
                </strong>

                <p>
                  Add workspace sources from the
                  source browser above.
                </p>
              </div>
            ) : (
              <div className="workspace-report-section-list">
                {sections.map(
                  (
                    section,
                    index,
                  ) => {
                    const source =
                      sourceByKey.get(
                        section.sourceKey,
                      )

                    return (
                      <article
                        key={section.id}
                      >
                        <header>
                          <span>
                            Section
                            {' '}
                            {index + 1}
                          </span>

                          <div>
                            <button
                              type="button"
                              disabled={
                                index === 0
                              }
                              aria-label="Move section up"
                              onClick={() =>
                                moveSection(
                                  index,
                                  -1,
                                )
                              }
                            >
                              ↑
                            </button>

                            <button
                              type="button"
                              disabled={
                                index ===
                                sections.length -
                                  1
                              }
                              aria-label="Move section down"
                              onClick={() =>
                                moveSection(
                                  index,
                                  1,
                                )
                              }
                            >
                              ↓
                            </button>

                            <button
                              type="button"
                              className="workspace-report-remove-section"
                              onClick={() =>
                                removeSection(
                                  section.id,
                                )
                              }
                            >
                              Remove
                            </button>
                          </div>
                        </header>

                        <label>
                          <span>
                            Section heading
                          </span>

                          <input
                            type="text"
                            value={
                              section.heading
                            }
                            maxLength={140}
                            onChange={(event) =>
                              updateSection(
                                section.id,
                                {
                                  heading:
                                    event
                                      .target
                                      .value,
                                },
                              )
                            }
                          />
                        </label>

                        <small>
                          {source
                            ? `${sourceTypeLabel(
                                source.type,
                              )} · ${source.subtitle}`
                            : 'Source record is no longer available'}
                        </small>

                        <label>
                          <span>
                            Engineering notes
                          </span>

                          <textarea
                            value={
                              section.notes
                            }
                            rows={3}
                            maxLength={1200}
                            placeholder="Add interpretation, assumptions, recommendations or review notes."
                            onChange={(event) =>
                              updateSection(
                                section.id,
                                {
                                  notes:
                                    event
                                      .target
                                      .value,
                                },
                              )
                            }
                          />
                        </label>
                      </article>
                    )
                  },
                )}
              </div>
            )}

            <label className="workspace-report-conclusion-field">
              <span>
                Conclusions and recommendations
              </span>

              <textarea
                value={conclusion}
                rows={5}
                maxLength={1800}
                placeholder="Document final conclusions, limitations and recommended next actions."
                onChange={(event) =>
                  setConclusion(
                    event.target.value,
                  )
                }
              />
            </label>
          </section>

          <section className="workspace-report-draft-library">
            <header>
              <div>
                <span>
                  Saved work
                </span>

                <h4>
                  Report drafts
                </h4>
              </div>

              <strong>
                {drafts.length}
                {' '}
                drafts
              </strong>
            </header>

            {drafts.length === 0 ? (
              <p>
                No saved report drafts yet.
              </p>
            ) : (
              <div>
                {drafts.map(
                  (draft) => (
                    <article
                      key={draft.id}
                      className={
                        draft.id ===
                        selectedDraftId
                          ? 'is-selected'
                          : ''
                      }
                    >
                      <div>
                        <strong>
                          {draft.title}
                        </strong>

                        <small>
                          {
                            draft.sections
                              .length
                          }
                          {' '}
                          sections
                          {' · '}
                          Updated
                          {' '}
                          {formatDate(
                            draft.updatedAt,
                          )}
                        </small>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            handleLoad(
                              draft,
                            )
                          }
                        >
                          Load
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDuplicate(
                              draft,
                            )
                          }
                        >
                          Duplicate
                        </button>

                        <button
                          type="button"
                          className="workspace-report-delete-draft"
                          onClick={() =>
                            handleDelete(
                              draft,
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="workspace-report-preview-shell">
          <div className="workspace-report-preview-heading">
            <span>
              Live report preview
            </span>

            <small>
              Print dialog → Save as PDF
            </small>
          </div>

          <article
            id="workspace-report-print-area"
            className="workspace-report-print-area"
          >
            <header className="workspace-report-cover-preview">
              <span>
                ChemE Toolkit
              </span>

              <h1>
                {title ||
                  'Untitled Engineering Report'}
              </h1>

              {subtitle ? (
                <h2>
                  {subtitle}
                </h2>
              ) : null}

              <div>
                {author ? (
                  <p>
                    <strong>
                      Prepared by
                    </strong>
                    {author}
                  </p>
                ) : null}

                {organization ? (
                  <p>
                    <strong>
                      Organization
                    </strong>
                    {organization}
                  </p>
                ) : null}

                <p>
                  <strong>
                    Report date
                  </strong>
                  {reportDate
                    ? formatDate(
                        reportDate,
                      )
                    : 'Not specified'}
                </p>
              </div>
            </header>

            {purpose ? (
              <section>
                <span>
                  Scope
                </span>

                <h2>
                  Purpose and scope
                </h2>

                <p>
                  {purpose}
                </p>
              </section>
            ) : null}

            {executiveSummary ? (
              <section>
                <span>
                  Executive summary
                </span>

                <h2>
                  Engineering summary
                </h2>

                <p>
                  {executiveSummary}
                </p>
              </section>
            ) : null}

            {sections.map(
              (
                section,
                index,
              ) => {
                const source =
                  sourceByKey.get(
                    section.sourceKey,
                  )

                return (
                  <section
                    key={section.id}
                    className="workspace-report-preview-section"
                  >
                    <span>
                      {String(
                        index + 1,
                      ).padStart(
                        2,
                        '0',
                      )}
                    </span>

                    <h2>
                      {section.heading ||
                        source?.name ||
                        'Report section'}
                    </h2>

                    {source ? (
                      <>
                        <div className="workspace-report-preview-metadata">
                          <strong>
                            {sourceTypeLabel(
                              source.type,
                            )}
                          </strong>

                          <span>
                            {source.subtitle}
                          </span>

                          <span>
                            {source.category}
                          </span>

                          <span>
                            {formatDate(
                              source.createdAt,
                            )}
                          </span>
                        </div>

                        <p>
                          {source.summary}
                        </p>

                        {source.body ? (
                          <p>
                            {source.body}
                          </p>
                        ) : null}

                        {source.facts.length >
                        0 ? (
                          <ul>
                            {source.facts.map(
                              (fact) => (
                                <li
                                  key={fact}
                                >
                                  {fact}
                                </li>
                              ),
                            )}
                          </ul>
                        ) : null}

                        {source.formula ? (
                          <div className="workspace-report-reference-block">
                            <strong>
                              Formula
                            </strong>

                            <p>
                              {source.formula}
                            </p>
                          </div>
                        ) : null}

                        {source.reference ? (
                          <div className="workspace-report-reference-block">
                            <strong>
                              Reference
                            </strong>

                            <p>
                              {source.reference}
                            </p>
                          </div>
                        ) : null}

                        {source.tags.length >
                        0 ? (
                          <div className="workspace-report-preview-tags">
                            {source.tags.map(
                              (tag) => (
                                <span
                                  key={tag}
                                >
                                  {tag}
                                </span>
                              ),
                            )}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <p>
                        The original workspace
                        source is no longer
                        available.
                      </p>
                    )}

                    {section.notes ? (
                      <div className="workspace-report-engineering-note">
                        <strong>
                          Engineering notes
                        </strong>

                        <p>
                          {section.notes}
                        </p>
                      </div>
                    ) : null}
                  </section>
                )
              },
            )}

            {conclusion ? (
              <section>
                <span>
                  Final review
                </span>

                <h2>
                  Conclusions and recommendations
                </h2>

                <p>
                  {conclusion}
                </p>
              </section>
            ) : null}

            <footer>
              <span>
                ChemE Toolkit Web
              </span>

              <span>
                {formatDate(
                  new Date()
                    .toISOString(),
                )}
              </span>
            </footer>
          </article>
        </aside>
      </div>

      <p
        className="workspace-report-builder-status"
        aria-live="polite"
      >
        {status === 'saved'
          ? 'Report saved as a new draft.'
          : null}

        {status === 'updated'
          ? 'Selected report draft updated.'
          : null}

        {status === 'loaded'
          ? 'Report draft loaded.'
          : null}

        {status === 'duplicated'
          ? 'Report draft duplicated.'
          : null}

        {status === 'deleted'
          ? 'Report draft deleted.'
          : null}

        {status === 'printed'
          ? 'Print dialog opened. Choose Save as PDF to create a PDF file.'
          : null}

        {status === 'title-required'
          ? 'Enter a report title first.'
          : null}

        {status === 'source-required'
          ? 'Add at least one workspace source.'
          : null}

        {status === 'draft-required'
          ? 'Load or save a report draft first.'
          : null}

        {status === 'duplicate-source'
          ? 'This workspace source is already included.'
          : null}

        {status === 'error'
          ? 'The report operation could not be completed.'
          : null}
      </p>
    </section>
  )
}
