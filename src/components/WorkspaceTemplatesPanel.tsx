import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import '../styles/workspace-templates.css'

const CALCULATIONS_KEY =
  'cheme-toolkit.saved-calculations.v1'

const TEMPLATES_KEY =
  'cheme-toolkit.workspace-templates.v1'

const PENDING_RESTORE_KEY =
  'cheme-toolkit.pending-calculation-restore.v1'

const RESTORE_REQUEST_EVENT =
  'cheme-toolkit:calculation-restore-requested'

const TEMPLATES_EVENT =
  'cheme-toolkit:workspace-templates-changed'

const CALCULATIONS_EVENT =
  'cheme-toolkit:saved-calculations-changed'

const PERSONAL_DATA_EVENT =
  'cheme-toolkit:personal-data-changed'

const MAX_TEMPLATES = 100
const MAX_TAGS = 12
const MAX_TAG_LENGTH = 24

type DestinationTab =
  | 'records'
  | 'templates'

type Status =
  | 'idle'
  | 'created'
  | 'updated'
  | 'duplicated'
  | 'deleted'
  | 'opening'
  | 'select-source'
  | 'select-template'
  | 'enter-name'
  | 'error'

interface WorkspaceTemplatesPanelProps {
  onOpenCalculator: (
    calculatorId: string,
  ) => void

  onOpenTab: (
    tabId: DestinationTab,
  ) => void
}

interface SavedInput {
  label: string
  value: string
  rawValue: string
  unit: string
}

interface SavedCalculation {
  id: string
  name: string
  calculatorId: string
  calculatorTitle: string
  category: string
  createdAt: string
  inputs: SavedInput[]
  results: unknown[]
  formula: string
  reference: string
  tags: string[]
  notes: string
}

interface WorkspaceTemplate {
  id: string
  name: string
  description: string
  sourceCalculationId: string
  calculatorId: string
  calculatorTitle: string
  category: string
  createdAt: string
  updatedAt: string
  lastUsedAt: string
  useCount: number
  inputs: SavedInput[]
  formula: string
  reference: string
  tags: string[]
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
        .replace(/\s+/g, ' ')
        .slice(
          0,
          MAX_TAG_LENGTH,
        ),
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
    .slice(0, MAX_TAGS)
}

function parseTagInput(
  value: string,
): string[] {
  return normalizeTags(
    value.split(','),
  )
}

function normalizeInputs(
  value: unknown,
): SavedInput[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap(
    (input) => {
      if (!isRecord(input)) {
        return []
      }

      return [{
        label:
          typeof input.label ===
          'string'
            ? input.label
            : 'Input',

        value:
          typeof input.value ===
          'string'
            ? input.value
            : '',

        rawValue:
          typeof input.rawValue ===
          'string'
            ? input.rawValue
            : (
                typeof input.value ===
                'string'
                  ? input.value
                  : ''
              ),

        unit:
          typeof input.unit ===
          'string'
            ? input.unit
            : '',
      }]
    },
  )
}

function readCalculations():
  SavedCalculation[] {
  return readArray(
    CALCULATIONS_KEY,
  ).flatMap((value) => {
    if (
      !isRecord(value) ||
      typeof value.id !==
        'string' ||
      typeof value.name !==
        'string' ||
      typeof value.calculatorId !==
        'string' ||
      typeof value.calculatorTitle !==
        'string'
    ) {
      return []
    }

    const inputs =
      normalizeInputs(
        value.inputs,
      )

    if (inputs.length === 0) {
      return []
    }

    return [{
      id: value.id,
      name: value.name,
      calculatorId:
        value.calculatorId,
      calculatorTitle:
        value.calculatorTitle,
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
      inputs,
      results:
        Array.isArray(value.results)
          ? value.results
          : [],
      formula:
        typeof value.formula ===
        'string'
          ? value.formula
          : '',
      reference:
        typeof value.reference ===
        'string'
          ? value.reference
          : '',
      tags:
        normalizeTags(
          value.tags,
        ),
      notes:
        typeof value.notes ===
        'string'
          ? value.notes
          : '',
    }]
  }).sort(
    (first, second) =>
      Date.parse(
        second.createdAt,
      ) -
      Date.parse(
        first.createdAt,
      ),
  )
}

function readTemplates():
  WorkspaceTemplate[] {
  return readArray(
    TEMPLATES_KEY,
  ).flatMap((value) => {
    if (
      !isRecord(value) ||
      typeof value.id !==
        'string' ||
      typeof value.name !==
        'string' ||
      typeof value.calculatorId !==
        'string' ||
      typeof value.calculatorTitle !==
        'string'
    ) {
      return []
    }

    const inputs =
      normalizeInputs(
        value.inputs,
      )

    if (inputs.length === 0) {
      return []
    }

    return [{
      id: value.id,
      name: value.name,
      description:
        typeof value.description ===
        'string'
          ? value.description
          : '',
      sourceCalculationId:
        typeof value.sourceCalculationId ===
        'string'
          ? value.sourceCalculationId
          : '',
      calculatorId:
        value.calculatorId,
      calculatorTitle:
        value.calculatorTitle,
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
      updatedAt:
        typeof value.updatedAt ===
        'string'
          ? value.updatedAt
          : '',
      lastUsedAt:
        typeof value.lastUsedAt ===
        'string'
          ? value.lastUsedAt
          : '',
      useCount:
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
          : 0,
      inputs,
      formula:
        typeof value.formula ===
        'string'
          ? value.formula
          : '',
      reference:
        typeof value.reference ===
        'string'
          ? value.reference
          : '',
      tags:
        normalizeTags(
          value.tags,
        ),
    }]
  }).sort(
    (first, second) =>
      Date.parse(
        second.updatedAt ||
        second.createdAt,
      ) -
      Date.parse(
        first.updatedAt ||
        first.createdAt,
      ),
  )
}

function writeTemplates(
  templates: WorkspaceTemplate[],
): boolean {
  try {
    localStorage.setItem(
      TEMPLATES_KEY,
      JSON.stringify(
        templates.slice(
          0,
          MAX_TEMPLATES,
        ),
      ),
    )

    window.dispatchEvent(
      new Event(
        TEMPLATES_EVENT,
      ),
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
    return 'Not used yet'
  }

  return new Intl.DateTimeFormat(
    'tr-TR',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  ).format(date)
}

export function WorkspaceTemplatesPanel({
  onOpenCalculator,
  onOpenTab,
}: WorkspaceTemplatesPanelProps) {
  const [
    calculations,
    setCalculations,
  ] = useState<SavedCalculation[]>(
    readCalculations,
  )

  const [
    templates,
    setTemplates,
  ] = useState<WorkspaceTemplate[]>(
    readTemplates,
  )

  const [
    sourceCalculationId,
    setSourceCalculationId,
  ] = useState('')

  const [
    templateName,
    setTemplateName,
  ] = useState('')

  const [
    templateDescription,
    setTemplateDescription,
  ] = useState('')

  const [
    templateTags,
    setTemplateTags,
  ] = useState('')

  const [
    selectedTemplateId,
    setSelectedTemplateId,
  ] = useState('')

  const [
    editName,
    setEditName,
  ] = useState('')

  const [
    editDescription,
    setEditDescription,
  ] = useState('')

  const [
    editTags,
    setEditTags,
  ] = useState('')

  const [
    query,
    setQuery,
  ] = useState('')

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState('all')

  const [
    calculatorFilter,
    setCalculatorFilter,
  ] = useState('all')

  const [
    status,
    setStatus,
  ] = useState<Status>(
    'idle',
  )

  const selectedTemplate =
    useMemo(
      () =>
        templates.find(
          (template) =>
            template.id ===
            selectedTemplateId,
        ) ?? null,
      [
        templates,
        selectedTemplateId,
      ],
    )

  const categoryOptions =
    useMemo(
      () =>
        Array.from(
          new Set(
            templates.map(
              (template) =>
                template.category,
            ),
          ),
        ).sort(
          (first, second) =>
            first.localeCompare(
              second,
            ),
        ),
      [templates],
    )

  const calculatorOptions =
    useMemo(() => {
      const options =
        new Map<string, string>()

      templates.forEach(
        (template) => {
          options.set(
            template.calculatorId,
            template.calculatorTitle,
          )
        },
      )

      return Array.from(
        options.entries(),
      ).sort(
        (first, second) =>
          first[1].localeCompare(
            second[1],
          ),
      )
    }, [templates])

  const filteredTemplates =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLocaleLowerCase(
            'en-US',
          )

      return templates.filter(
        (template) => {
          const searchMatches =
            !normalizedQuery ||
            [
              template.name,
              template.description,
              template.calculatorTitle,
              template.category,
              ...template.tags,
            ]
              .join(' ')
              .toLocaleLowerCase(
                'en-US',
              )
              .includes(
                normalizedQuery,
              )

          const categoryMatches =
            categoryFilter ===
              'all' ||
            template.category ===
              categoryFilter

          const calculatorMatches =
            calculatorFilter ===
              'all' ||
            template.calculatorId ===
              calculatorFilter

          return (
            searchMatches &&
            categoryMatches &&
            calculatorMatches
          )
        },
      )
    }, [
      templates,
      query,
      categoryFilter,
      calculatorFilter,
    ])

  useEffect(() => {
    if (!selectedTemplate) {
      setEditName('')
      setEditDescription('')
      setEditTags('')
      return
    }

    setEditName(
      selectedTemplate.name,
    )

    setEditDescription(
      selectedTemplate.description,
    )

    setEditTags(
      selectedTemplate.tags.join(
        ', ',
      ),
    )
  }, [selectedTemplate])

  useEffect(() => {
    function refreshCalculations() {
      setCalculations(
        readCalculations(),
      )
    }

    function refreshTemplates() {
      const nextTemplates =
        readTemplates()

      setTemplates(
        nextTemplates,
      )

      setSelectedTemplateId(
        (current) =>
          nextTemplates.some(
            (template) =>
              template.id ===
              current,
          )
            ? current
            : '',
      )
    }

    window.addEventListener(
      CALCULATIONS_EVENT,
      refreshCalculations,
    )

    window.addEventListener(
      TEMPLATES_EVENT,
      refreshTemplates,
    )

    window.addEventListener(
      PERSONAL_DATA_EVENT,
      refreshTemplates,
    )

    window.addEventListener(
      'storage',
      refreshCalculations,
    )

    window.addEventListener(
      'storage',
      refreshTemplates,
    )

    window.addEventListener(
      'focus',
      refreshCalculations,
    )

    window.addEventListener(
      'focus',
      refreshTemplates,
    )

    return () => {
      window.removeEventListener(
        CALCULATIONS_EVENT,
        refreshCalculations,
      )

      window.removeEventListener(
        TEMPLATES_EVENT,
        refreshTemplates,
      )

      window.removeEventListener(
        PERSONAL_DATA_EVENT,
        refreshTemplates,
      )

      window.removeEventListener(
        'storage',
        refreshCalculations,
      )

      window.removeEventListener(
        'storage',
        refreshTemplates,
      )

      window.removeEventListener(
        'focus',
        refreshCalculations,
      )

      window.removeEventListener(
        'focus',
        refreshTemplates,
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

  function saveTemplateList(
    nextTemplates:
      WorkspaceTemplate[],
  ): boolean {
    if (
      !writeTemplates(
        nextTemplates,
      )
    ) {
      setStatus('error')
      return false
    }

    setTemplates(
      nextTemplates,
    )

    return true
  }

  function handleCreateTemplate() {
    const source =
      calculations.find(
        (calculation) =>
          calculation.id ===
          sourceCalculationId,
      )

    if (!source) {
      setStatus('select-source')
      return
    }

    const now =
      new Date().toISOString()

    const name =
      templateName.trim() ||
      `${source.name} Template`

    const template:
      WorkspaceTemplate = {
      id: createId(),
      name,
      description:
        templateDescription.trim() ||
        source.notes,
      sourceCalculationId:
        source.id,
      calculatorId:
        source.calculatorId,
      calculatorTitle:
        source.calculatorTitle,
      category:
        source.category,
      createdAt: now,
      updatedAt: now,
      lastUsedAt: '',
      useCount: 0,
      inputs:
        source.inputs.map(
          (input) => ({
            ...input,
          }),
        ),
      formula:
        source.formula,
      reference:
        source.reference,
      tags:
        parseTagInput(
          templateTags,
        ).length > 0
          ? parseTagInput(
              templateTags,
            )
          : source.tags,
    }

    const nextTemplates = [
      template,
      ...templates,
    ].slice(
      0,
      MAX_TEMPLATES,
    )

    if (
      !saveTemplateList(
        nextTemplates,
      )
    ) {
      return
    }

    setSelectedTemplateId(
      template.id,
    )

    setSourceCalculationId('')
    setTemplateName('')
    setTemplateDescription('')
    setTemplateTags('')
    setStatus('created')
  }

  function handleSaveDetails() {
    if (!selectedTemplate) {
      setStatus('select-template')
      return
    }

    const nextName =
      editName.trim()

    if (!nextName) {
      setStatus('enter-name')
      return
    }

    const nextTemplates =
      templates.map(
        (template) =>
          template.id ===
          selectedTemplate.id
            ? {
                ...template,
                name: nextName,
                description:
                  editDescription.trim(),
                tags:
                  parseTagInput(
                    editTags,
                  ),
                updatedAt:
                  new Date()
                    .toISOString(),
              }
            : template,
      )

    if (
      saveTemplateList(
        nextTemplates,
      )
    ) {
      setStatus('updated')
    }
  }

  function handleDuplicate() {
    if (!selectedTemplate) {
      setStatus('select-template')
      return
    }

    const now =
      new Date().toISOString()

    const duplicate:
      WorkspaceTemplate = {
      ...selectedTemplate,
      id: createId(),
      name:
        `${selectedTemplate.name} Copy`,
      createdAt: now,
      updatedAt: now,
      lastUsedAt: '',
      useCount: 0,
      inputs:
        selectedTemplate.inputs.map(
          (input) => ({
            ...input,
          }),
        ),
      tags: [
        ...selectedTemplate.tags,
      ],
    }

    const nextTemplates = [
      duplicate,
      ...templates,
    ].slice(
      0,
      MAX_TEMPLATES,
    )

    if (
      !saveTemplateList(
        nextTemplates,
      )
    ) {
      return
    }

    setSelectedTemplateId(
      duplicate.id,
    )

    setStatus('duplicated')
  }

  function handleDelete() {
    if (!selectedTemplate) {
      setStatus('select-template')
      return
    }

    const confirmed =
      window.confirm(
        `Delete the template “${selectedTemplate.name}”? Saved calculations will not be deleted.`,
      )

    if (!confirmed) {
      return
    }

    const nextTemplates =
      templates.filter(
        (template) =>
          template.id !==
          selectedTemplate.id,
      )

    if (
      !saveTemplateList(
        nextTemplates,
      )
    ) {
      return
    }

    setSelectedTemplateId('')
    setStatus('deleted')
  }

  function handleUseTemplate(
    template: WorkspaceTemplate,
  ) {
    const now =
      new Date().toISOString()

    const restorePayload = {
      id: createId(),
      name:
        `${template.name} · New case`,
      calculatorId:
        template.calculatorId,
      calculatorTitle:
        template.calculatorTitle,
      category:
        template.category,
      createdAt: now,
      inputs:
        template.inputs.map(
          (input) => ({
            ...input,
          }),
        ),
      results: [],
      formula:
        template.formula,
      reference:
        template.reference,
      tags: [
        ...template.tags,
      ],
      notes:
        template.description,
    }

    try {
      sessionStorage.setItem(
        PENDING_RESTORE_KEY,
        JSON.stringify(
          restorePayload,
        ),
      )
    } catch {
      setStatus('error')
      return
    }

    const nextTemplates =
      templates.map(
        (current) =>
          current.id ===
          template.id
            ? {
                ...current,
                useCount:
                  current.useCount + 1,
                lastUsedAt: now,
                updatedAt: now,
              }
            : current,
      )

    if (
      !saveTemplateList(
        nextTemplates,
      )
    ) {
      return
    }

    setStatus('opening')

    onOpenCalculator(
      template.calculatorId,
    )

    onOpenTab('records')

    window.setTimeout(() => {
      window.dispatchEvent(
        new Event(
          RESTORE_REQUEST_EVENT,
        ),
      )
    }, 350)

    window.setTimeout(() => {
      if (
        sessionStorage.getItem(
          PENDING_RESTORE_KEY,
        )
      ) {
        window.dispatchEvent(
          new Event(
            RESTORE_REQUEST_EVENT,
          ),
        )
      }
    }, 950)

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

  return (
    <section
      className="workspace-templates-panel"
      aria-label="Workspace templates and reusable cases"
    >
      <header className="workspace-templates-header">
        <div>
          <span>
            Reusable engineering cases
          </span>

          <h3>
            Workspace templates
          </h3>

          <p>
            Convert saved calculations into
            reusable starting cases while
            preserving calculator inputs,
            references and engineering context.
          </p>
        </div>

        <div className="workspace-templates-summary">
          <strong>
            {templates.length}
          </strong>

          <span>
            personal templates
          </span>

          <small>
            {
              templates.reduce(
                (
                  total,
                  template,
                ) =>
                  total +
                  template.useCount,
                0,
              )
            }
            {' '}
            total uses
          </small>
        </div>
      </header>

      <section className="workspace-template-creator">
        <div>
          <span>
            Create from saved work
          </span>

          <h4>
            New reusable case
          </h4>

          <p>
            Select a saved calculation. Its
            starting inputs, formula and
            reference will be copied into the
            template.
          </p>
        </div>

        <div className="workspace-template-creator-fields">
          <label>
            <span>
              Source calculation
            </span>

            <select
              value={
                sourceCalculationId
              }
              onChange={(event) =>
                setSourceCalculationId(
                  event.target.value,
                )
              }
            >
              <option value="">
                Select saved calculation
              </option>

              {calculations.map(
                (calculation) => (
                  <option
                    key={
                      calculation.id
                    }
                    value={
                      calculation.id
                    }
                  >
                    {
                      calculation.name
                    }
                    {' · '}
                    {
                      calculation.calculatorTitle
                    }
                  </option>
                ),
              )}
            </select>
          </label>

          <label>
            <span>
              Template name
            </span>

            <input
              type="text"
              value={templateName}
              maxLength={100}
              placeholder="Example: Standard pump sizing case"
              onChange={(event) =>
                setTemplateName(
                  event.target.value,
                )
              }
            />
          </label>

          <label>
            <span>
              Tags
            </span>

            <input
              type="text"
              value={templateTags}
              placeholder="design, validation, standard"
              onChange={(event) =>
                setTemplateTags(
                  event.target.value,
                )
              }
            />
          </label>

          <label className="workspace-template-description-field">
            <span>
              Description
            </span>

            <textarea
              value={
                templateDescription
              }
              rows={3}
              maxLength={500}
              placeholder="Explain when this starting case should be used."
              onChange={(event) =>
                setTemplateDescription(
                  event.target.value,
                )
              }
            />
          </label>

          <button
            type="button"
            onClick={
              handleCreateTemplate
            }
            disabled={
              calculations.length ===
              0
            }
          >
            Create template
          </button>
        </div>
      </section>

      <div className="workspace-template-filters">
        <label>
          <span>
            Search templates
          </span>

          <input
            type="search"
            value={query}
            placeholder="Search names, calculators, descriptions or tags…"
            onChange={(event) =>
              setQuery(
                event.target.value,
              )
            }
          />
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
            value={
              calculatorFilter
            }
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

        <button
          type="button"
          onClick={() => {
            setQuery('')
            setCategoryFilter('all')
            setCalculatorFilter('all')
          }}
        >
          Clear filters
        </button>
      </div>

      <div className="workspace-template-layout">
        <div className="workspace-template-library">
          {filteredTemplates.length ===
          0 ? (
            <div className="workspace-template-empty">
              <strong>
                No matching templates
              </strong>

              <p>
                Create a reusable case from a
                saved calculation or clear the
                active filters.
              </p>
            </div>
          ) : (
            filteredTemplates.map(
              (template) => {
                const isSelected =
                  selectedTemplateId ===
                  template.id

                return (
                  <article
                    key={template.id}
                    className={
                      isSelected
                        ? 'is-selected'
                        : ''
                    }
                  >
                    <div className="workspace-template-card-heading">
                      <div>
                        <span>
                          {
                            template.category
                          }
                        </span>

                        <h4>
                          {template.name}
                        </h4>

                        <p>
                          {
                            template.calculatorTitle
                          }
                        </p>
                      </div>

                      <strong>
                        {template.useCount}
                        {' '}
                        use
                        {template.useCount ===
                        1
                          ? ''
                          : 's'}
                      </strong>
                    </div>

                    <p className="workspace-template-card-description">
                      {template.description ||
                        'No template description.'}
                    </p>

                    <div className="workspace-template-input-summary">
                      <span>
                        {
                          template.inputs
                            .length
                        }
                        {' '}
                        saved inputs
                      </span>

                      <span>
                        Last used:
                        {' '}
                        {formatDate(
                          template.lastUsedAt,
                        )}
                      </span>
                    </div>

                    {template.tags.length >
                    0 ? (
                      <div className="workspace-template-tags">
                        {template.tags
                          .slice(0, 5)
                          .map((tag) => (
                            <span key={tag}>
                              {tag}
                            </span>
                          ))}

                        {template.tags.length >
                        5 ? (
                          <small>
                            +
                            {template.tags
                              .length - 5}
                          </small>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="workspace-template-card-actions">
                      <button
                        type="button"
                        className="workspace-template-primary"
                        onClick={() =>
                          handleUseTemplate(
                            template,
                          )
                        }
                      >
                        Use template
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedTemplateId(
                            template.id,
                          )
                        }
                      >
                        Edit
                      </button>
                    </div>
                  </article>
                )
              },
            )
          )}
        </div>

        <aside className="workspace-template-editor">
          <span>
            Template management
          </span>

          <h4>
            Edit selected template
          </h4>

          <p>
            Update the filing information without
            changing the saved calculator inputs.
          </p>

          <label>
            <span>
              Template name
            </span>

            <input
              type="text"
              value={editName}
              maxLength={100}
              disabled={
                !selectedTemplate
              }
              placeholder="Select a template"
              onChange={(event) =>
                setEditName(
                  event.target.value,
                )
              }
            />
          </label>

          <label>
            <span>
              Tags
            </span>

            <input
              type="text"
              value={editTags}
              disabled={
                !selectedTemplate
              }
              placeholder="tag one, tag two"
              onChange={(event) =>
                setEditTags(
                  event.target.value,
                )
              }
            />
          </label>

          <label>
            <span>
              Description
            </span>

            <textarea
              value={editDescription}
              rows={5}
              maxLength={500}
              disabled={
                !selectedTemplate
              }
              placeholder="Template description"
              onChange={(event) =>
                setEditDescription(
                  event.target.value,
                )
              }
            />
          </label>

          {selectedTemplate ? (
            <div className="workspace-template-editor-meta">
              <span>
                {
                  selectedTemplate.inputs
                    .length
                }
                {' '}
                stored inputs
              </span>

              <span>
                Created:
                {' '}
                {formatDate(
                  selectedTemplate.createdAt,
                )}
              </span>

              <span>
                {
                  selectedTemplate.formula
                    ? 'Formula preserved'
                    : 'No formula stored'
                }
              </span>

              <span>
                {
                  selectedTemplate.reference
                    ? 'Reference preserved'
                    : 'No reference stored'
                }
              </span>
            </div>
          ) : null}

          <button
            type="button"
            className="workspace-template-save"
            disabled={
              !selectedTemplate
            }
            onClick={
              handleSaveDetails
            }
          >
            Save template details
          </button>

          <div className="workspace-template-editor-actions">
            <button
              type="button"
              disabled={
                !selectedTemplate
              }
              onClick={
                handleDuplicate
              }
            >
              Duplicate
            </button>

            <button
              type="button"
              className="workspace-template-delete"
              disabled={
                !selectedTemplate
              }
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </aside>
      </div>

      <p
        className="workspace-template-status"
        aria-live="polite"
      >
        {status === 'created'
          ? 'Reusable template created.'
          : null}

        {status === 'updated'
          ? 'Template details updated.'
          : null}

        {status === 'duplicated'
          ? 'Template duplicated.'
          : null}

        {status === 'deleted'
          ? 'Template deleted.'
          : null}

        {status === 'opening'
          ? 'Template inputs are being restored in the calculator.'
          : null}

        {status === 'select-source'
          ? 'Select a saved calculation first.'
          : null}

        {status === 'select-template'
          ? 'Select a template first.'
          : null}

        {status === 'enter-name'
          ? 'Enter a template name.'
          : null}

        {status === 'error'
          ? 'The template operation could not be completed.'
          : null}
      </p>
    </section>
  )
}
