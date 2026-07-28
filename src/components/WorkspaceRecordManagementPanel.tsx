import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import '../styles/workspace-record-management.css'

const CALCULATIONS_KEY =
  'cheme-toolkit.saved-calculations.v1'

const COMPARISONS_KEY =
  'cheme-toolkit.saved-comparisons.v1'

const PROJECTS_KEY =
  'cheme-toolkit.project-workspaces.v1'

const COLLECTIONS_KEY =
  'cheme-toolkit.workspace-collections.v1'

const CALCULATIONS_EVENT =
  'cheme-toolkit:saved-calculations-changed'

const COMPARISONS_EVENT =
  'cheme-toolkit:saved-comparisons-changed'

const PROJECTS_EVENT =
  'cheme-toolkit:project-workspaces-changed'

const COLLECTIONS_EVENT =
  'cheme-toolkit:workspace-collections-changed'

const PERSONAL_DATA_EVENT =
  'cheme-toolkit:personal-data-changed'

const MAX_TAGS = 12
const MAX_TAG_LENGTH = 24

type RecordType =
  | 'calculation'
  | 'comparison'

type TypeFilter =
  | 'all'
  | RecordType

type Status =
  | 'idle'
  | 'renamed'
  | 'duplicated'
  | 'tagged'
  | 'assigned'
  | 'collected'
  | 'deleted'
  | 'select-one'
  | 'select-records'
  | 'enter-value'
  | 'error'

interface ManagedRecord {
  id: string
  type: RecordType
  name: string
  calculatorTitle: string
  category: string
  createdAt: string
  tags: string[]
}

interface ProjectWorkspace {
  id: string
  name: string
  description?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  calculationIds: string[]
  comparisonIds?: string[]
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

function createRecordId(): string {
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

function readManagedRecords():
  ManagedRecord[] {
  const calculations =
    readArray(
      CALCULATIONS_KEY,
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

      return [{
        id: value.id,
        type:
          'calculation' as const,
        name: value.name,
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
      }]
    })

  const comparisons =
    readArray(
      COMPARISONS_KEY,
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

      return [{
        id: value.id,
        type:
          'comparison' as const,
        name: value.name,
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
      }]
    })

  return [
    ...calculations,
    ...comparisons,
  ].sort(
    (first, second) =>
      Date.parse(
        second.createdAt,
      ) -
      Date.parse(
        first.createdAt,
      ),
  )
}

function readProjects():
  ProjectWorkspace[] {
  return readArray(
    PROJECTS_KEY,
  ).flatMap((value) => {
    if (
      !isRecord(value) ||
      typeof value.id !==
        'string' ||
      typeof value.name !==
        'string' ||
      !Array.isArray(
        value.calculationIds,
      )
    ) {
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
      notes:
        typeof value.notes ===
        'string'
          ? value.notes
          : '',
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
      calculationIds:
        value.calculationIds.filter(
          (id): id is string =>
            typeof id === 'string',
        ),
      comparisonIds:
        Array.isArray(
          value.comparisonIds,
        )
          ? value.comparisonIds.filter(
              (
                id,
              ): id is string =>
                typeof id ===
                'string',
            )
          : [],
    }]
  })
}

interface WorkspaceCollection {
  id: string
  name: string
  mode: 'manual'
  updatedAt: string
  manualItemKeys: string[]
}

function readManualCollections():
  WorkspaceCollection[] {
  return readArray(
    COLLECTIONS_KEY,
  ).flatMap((value) => {
    if (
      !isRecord(value) ||
      typeof value.id !==
        'string' ||
      typeof value.name !==
        'string' ||
      value.mode !== 'manual'
    ) {
      return []
    }

    return [{
      id: value.id,
      name: value.name,
      mode: 'manual' as const,
      updatedAt:
        typeof value.updatedAt ===
        'string'
          ? value.updatedAt
          : '',
      manualItemKeys:
        Array.isArray(
          value.manualItemKeys,
        )
          ? value.manualItemKeys.filter(
              (
                key,
              ): key is string =>
                typeof key ===
                'string',
            )
          : [],
    }]
  }).sort(
    (first, second) =>
      first.name.localeCompare(
        second.name,
      ),
  )
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

function dispatchEvents(
  calculationChanged = false,
  comparisonChanged = false,
  projectsChanged = false,
  collectionsChanged = false,
) {
  if (calculationChanged) {
    window.dispatchEvent(
      new Event(
        CALCULATIONS_EVENT,
      ),
    )
  }

  if (comparisonChanged) {
    window.dispatchEvent(
      new Event(
        COMPARISONS_EVENT,
      ),
    )
  }

  if (projectsChanged) {
    window.dispatchEvent(
      new Event(
        PROJECTS_EVENT,
      ),
    )
  }

  if (collectionsChanged) {
    window.dispatchEvent(
      new Event(
        COLLECTIONS_EVENT,
      ),
    )
  }

  window.dispatchEvent(
    new Event(
      PERSONAL_DATA_EVENT,
    ),
  )
}

export function WorkspaceRecordManagementPanel() {
  const [
    records,
    setRecords,
  ] = useState<ManagedRecord[]>(
    readManagedRecords,
  )

  const [
    projects,
    setProjects,
  ] = useState<ProjectWorkspace[]>(
    readProjects,
  )

  const [
    manualCollections,
    setManualCollections,
  ] = useState<WorkspaceCollection[]>(
    readManualCollections,
  )

  const [
    selectedIds,
    setSelectedIds,
  ] = useState<string[]>([])

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
    renameDraft,
    setRenameDraft,
  ] = useState('')

  const [
    tagDraft,
    setTagDraft,
  ] = useState('')

  const [
    projectId,
    setProjectId,
  ] = useState('')

  const [
    collectionId,
    setCollectionId,
  ] = useState('')

  const [
    status,
    setStatus,
  ] = useState<Status>(
    'idle',
  )

  const filteredRecords =
    useMemo(() => {
      const search =
        query
          .trim()
          .toLocaleLowerCase(
            'en-US',
          )

      return records.filter(
        (record) => {
          const typeMatches =
            typeFilter === 'all' ||
            record.type ===
              typeFilter

          const searchMatches =
            !search ||
            [
              record.name,
              record.calculatorTitle,
              record.category,
              ...record.tags,
            ]
              .join(' ')
              .toLocaleLowerCase(
                'en-US',
              )
              .includes(search)

          return (
            typeMatches &&
            searchMatches
          )
        },
      )
    }, [
      records,
      query,
      typeFilter,
    ])

  const selectedRecords =
    useMemo(
      () =>
        records.filter(
          (record) =>
            selectedIds.includes(
              record.id,
            ),
        ),
      [
        records,
        selectedIds,
      ],
    )

  const singleSelected =
    selectedRecords.length === 1
      ? selectedRecords[0]
      : null

  const allVisibleSelected =
    filteredRecords.length > 0 &&
    filteredRecords.every(
      (record) =>
        selectedIds.includes(
          record.id,
        ),
    )

  function refreshData() {
    const nextRecords =
      readManagedRecords()

    setRecords(nextRecords)
    setProjects(
      readProjects(),
    )

    setManualCollections(
      readManualCollections(),
    )

    setSelectedIds(
      (current) =>
        current.filter((id) =>
          nextRecords.some(
            (record) =>
              record.id === id,
          ),
        ),
    )
  }

  useEffect(() => {
    setRenameDraft(
      singleSelected?.name ?? '',
    )
  }, [singleSelected])

  useEffect(() => {
    function handleDataChange() {
      refreshData()
    }

    window.addEventListener(
      CALCULATIONS_EVENT,
      handleDataChange,
    )

    window.addEventListener(
      COMPARISONS_EVENT,
      handleDataChange,
    )

    window.addEventListener(
      PROJECTS_EVENT,
      handleDataChange,
    )

    window.addEventListener(
      COLLECTIONS_EVENT,
      handleDataChange,
    )

    window.addEventListener(
      PERSONAL_DATA_EVENT,
      handleDataChange,
    )

    window.addEventListener(
      'storage',
      handleDataChange,
    )

    window.addEventListener(
      'focus',
      handleDataChange,
    )

    return () => {
      window.removeEventListener(
        CALCULATIONS_EVENT,
        handleDataChange,
      )

      window.removeEventListener(
        COMPARISONS_EVENT,
        handleDataChange,
      )

      window.removeEventListener(
        PROJECTS_EVENT,
        handleDataChange,
      )

      window.removeEventListener(
        COLLECTIONS_EVENT,
        handleDataChange,
      )

      window.removeEventListener(
        PERSONAL_DATA_EVENT,
        handleDataChange,
      )

      window.removeEventListener(
        'storage',
        handleDataChange,
      )

      window.removeEventListener(
        'focus',
        handleDataChange,
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

  function toggleRecord(
    id: string,
  ) {
    setSelectedIds(
      (current) =>
        current.includes(id)
          ? current.filter(
              (currentId) =>
                currentId !== id,
            )
          : [
              ...current,
              id,
            ],
    )
  }

  function toggleVisibleRecords() {
    if (allVisibleSelected) {
      const visibleIds =
        new Set(
          filteredRecords.map(
            (record) =>
              record.id,
          ),
        )

      setSelectedIds(
        (current) =>
          current.filter(
            (id) =>
              !visibleIds.has(id),
          ),
      )

      return
    }

    setSelectedIds(
      (current) =>
        Array.from(
          new Set([
            ...current,
            ...filteredRecords.map(
              (record) =>
                record.id,
            ),
          ]),
        ),
    )
  }

  function handleRename() {
    if (!singleSelected) {
      setStatus('select-one')
      return
    }

    const nextName =
      renameDraft.trim()

    if (!nextName) {
      setStatus('enter-value')
      return
    }

    const storageKey =
      singleSelected.type ===
      'calculation'
        ? CALCULATIONS_KEY
        : COMPARISONS_KEY

    const nextItems =
      readArray(storageKey).map(
        (value) => {
          if (
            !isRecord(value) ||
            value.id !==
              singleSelected.id
          ) {
            return value
          }

          return {
            ...value,
            name: nextName,
          }
        },
      )

    localStorage.setItem(
      storageKey,
      JSON.stringify(nextItems),
    )

    dispatchEvents(
      singleSelected.type ===
        'calculation',
      singleSelected.type ===
        'comparison',
    )

    refreshData()
    setStatus('renamed')
  }

  function handleDuplicate() {
    if (
      selectedRecords.length ===
      0
    ) {
      setStatus('select-records')
      return
    }

    const selectedCalculationIds =
      new Set(
        selectedRecords
          .filter(
            (record) =>
              record.type ===
              'calculation',
          )
          .map(
            (record) =>
              record.id,
          ),
      )

    const selectedComparisonIds =
      new Set(
        selectedRecords
          .filter(
            (record) =>
              record.type ===
              'comparison',
          )
          .map(
            (record) =>
              record.id,
          ),
      )

    const now =
      new Date().toISOString()

    const calculations =
      readArray(
        CALCULATIONS_KEY,
      )

    const calculationCopies =
      calculations.flatMap(
        (value) => {
          if (
            !isRecord(value) ||
            typeof value.id !==
              'string' ||
            !selectedCalculationIds.has(
              value.id,
            )
          ) {
            return []
          }

          return [{
            ...value,
            id: createRecordId(),
            name:
              typeof value.name ===
              'string'
                ? `${value.name} Copy`
                : 'Calculation Copy',
            createdAt: now,
          }]
        },
      )

    const comparisons =
      readArray(
        COMPARISONS_KEY,
      )

    const comparisonCopies =
      comparisons.flatMap(
        (value) => {
          if (
            !isRecord(value) ||
            typeof value.id !==
              'string' ||
            !selectedComparisonIds.has(
              value.id,
            )
          ) {
            return []
          }

          return [{
            ...value,
            id: createRecordId(),
            name:
              typeof value.name ===
              'string'
                ? `${value.name} Copy`
                : 'Comparison Copy',
            createdAt: now,
          }]
        },
      )

    localStorage.setItem(
      CALCULATIONS_KEY,
      JSON.stringify([
        ...calculationCopies,
        ...calculations,
      ]),
    )

    localStorage.setItem(
      COMPARISONS_KEY,
      JSON.stringify([
        ...comparisonCopies,
        ...comparisons,
      ]),
    )

    dispatchEvents(
      calculationCopies.length > 0,
      comparisonCopies.length > 0,
    )

    setSelectedIds([])
    refreshData()
    setStatus('duplicated')
  }

  function handleBulkTags() {
    if (
      selectedRecords.length ===
      0
    ) {
      setStatus('select-records')
      return
    }

    const newTags =
      parseTagInput(tagDraft)

    if (newTags.length === 0) {
      setStatus('enter-value')
      return
    }

    const selectedCalculationIds =
      new Set(
        selectedRecords
          .filter(
            (record) =>
              record.type ===
              'calculation',
          )
          .map(
            (record) =>
              record.id,
          ),
      )

    const selectedComparisonIds =
      new Set(
        selectedRecords
          .filter(
            (record) =>
              record.type ===
              'comparison',
          )
          .map(
            (record) =>
              record.id,
          ),
      )

    function addTags(
      items: unknown[],
      selected:
        Set<string>,
    ): unknown[] {
      return items.map((value) => {
        if (
          !isRecord(value) ||
          typeof value.id !==
            'string' ||
          !selected.has(value.id)
        ) {
          return value
        }

        return {
          ...value,
          tags:
            normalizeTags([
              ...normalizeTags(
                value.tags,
              ),
              ...newTags,
            ]),
        }
      })
    }

    const calculations =
      addTags(
        readArray(
          CALCULATIONS_KEY,
        ),
        selectedCalculationIds,
      )

    const comparisons =
      addTags(
        readArray(
          COMPARISONS_KEY,
        ),
        selectedComparisonIds,
      )

    localStorage.setItem(
      CALCULATIONS_KEY,
      JSON.stringify(
        calculations,
      ),
    )

    localStorage.setItem(
      COMPARISONS_KEY,
      JSON.stringify(
        comparisons,
      ),
    )

    dispatchEvents(
      selectedCalculationIds.size > 0,
      selectedComparisonIds.size > 0,
    )

    setTagDraft('')
    refreshData()
    setStatus('tagged')
  }

  function handleProjectAssignment() {
    if (
      selectedRecords.length ===
      0
    ) {
      setStatus('select-records')
      return
    }

    if (!projectId) {
      setStatus('enter-value')
      return
    }

    const calculationIds =
      selectedRecords
        .filter(
          (record) =>
            record.type ===
            'calculation',
        )
        .map(
          (record) =>
            record.id,
        )

    const comparisonIds =
      selectedRecords
        .filter(
          (record) =>
            record.type ===
            'comparison',
        )
        .map(
          (record) =>
            record.id,
        )

    const calculationSet =
      new Set(calculationIds)

    const comparisonSet =
      new Set(comparisonIds)

    const nextProjects =
      readProjects().map(
        (project) => {
          const cleanCalculationIds =
            project.calculationIds.filter(
              (id) =>
                !calculationSet.has(id),
            )

          const cleanComparisonIds =
            (
              project.comparisonIds ??
              []
            ).filter(
              (id) =>
                !comparisonSet.has(id),
            )

          if (
            project.id !==
            projectId
          ) {
            return {
              ...project,
              calculationIds:
                cleanCalculationIds,
              comparisonIds:
                cleanComparisonIds,
            }
          }

          return {
            ...project,
            calculationIds:
              Array.from(
                new Set([
                  ...cleanCalculationIds,
                  ...calculationIds,
                ]),
              ),
            comparisonIds:
              Array.from(
                new Set([
                  ...cleanComparisonIds,
                  ...comparisonIds,
                ]),
              ),
            updatedAt:
              new Date().toISOString(),
          }
        },
      )

    localStorage.setItem(
      PROJECTS_KEY,
      JSON.stringify(
        nextProjects,
      ),
    )

    dispatchEvents(
      false,
      false,
      true,
    )

    setProjects(nextProjects)
    setStatus('assigned')
  }

  function handleCollectionAssignment() {
    if (
      selectedRecords.length ===
      0
    ) {
      setStatus('select-records')
      return
    }

    if (!collectionId) {
      setStatus('enter-value')
      return
    }

    const selectedKeys =
      selectedRecords.map(
        (record) =>
          `${record.type}:${record.id}`,
      )

    const now =
      new Date().toISOString()

    let collectionFound = false

    const nextCollections =
      readArray(
        COLLECTIONS_KEY,
      ).map((value) => {
        if (
          !isRecord(value) ||
          value.id !== collectionId ||
          value.mode !== 'manual'
        ) {
          return value
        }

        collectionFound = true

        const currentKeys =
          Array.isArray(
            value.manualItemKeys,
          )
            ? value.manualItemKeys.filter(
                (
                  key,
                ): key is string =>
                  typeof key ===
                  'string',
              )
            : []

        return {
          ...value,
          manualItemKeys:
            Array.from(
              new Set([
                ...currentKeys,
                ...selectedKeys,
              ]),
            ).slice(0, 200),
          updatedAt: now,
        }
      })

    if (!collectionFound) {
      setStatus('error')
      return
    }

    try {
      localStorage.setItem(
        COLLECTIONS_KEY,
        JSON.stringify(
          nextCollections,
        ),
      )
    } catch {
      setStatus('error')
      return
    }

    dispatchEvents(
      false,
      false,
      false,
      true,
    )

    setManualCollections(
      readManualCollections(),
    )

    setStatus('collected')
  }

  function handleDelete() {
    if (
      selectedRecords.length ===
      0
    ) {
      setStatus('select-records')
      return
    }

    const confirmed =
      window.confirm(
        `Permanently delete ${selectedRecords.length} selected record${
          selectedRecords.length === 1
            ? ''
            : 's'
        }? This action also removes their project links.`,
      )

    if (!confirmed) {
      return
    }

    const calculationIds =
      new Set(
        selectedRecords
          .filter(
            (record) =>
              record.type ===
              'calculation',
          )
          .map(
            (record) =>
              record.id,
          ),
      )

    const comparisonIds =
      new Set(
        selectedRecords
          .filter(
            (record) =>
              record.type ===
              'comparison',
          )
          .map(
            (record) =>
              record.id,
          ),
      )

    const calculations =
      readArray(
        CALCULATIONS_KEY,
      ).filter(
        (value) =>
          !(
            isRecord(value) &&
            typeof value.id ===
              'string' &&
            calculationIds.has(
              value.id,
            )
          ),
      )

    const comparisons =
      readArray(
        COMPARISONS_KEY,
      ).filter(
        (value) =>
          !(
            isRecord(value) &&
            typeof value.id ===
              'string' &&
            comparisonIds.has(
              value.id,
            )
          ),
      )

    const nextProjects =
      readProjects().map(
        (project) => ({
          ...project,
          calculationIds:
            project.calculationIds.filter(
              (id) =>
                !calculationIds.has(id),
            ),
          comparisonIds:
            (
              project.comparisonIds ??
              []
            ).filter(
              (id) =>
                !comparisonIds.has(id),
            ),
        }),
      )

    const deletedItemKeys =
      new Set([
        ...Array.from(
          calculationIds,
        ).map(
          (id) =>
            `calculation:${id}`,
        ),
        ...Array.from(
          comparisonIds,
        ).map(
          (id) =>
            `comparison:${id}`,
        ),
      ])

    let collectionsChanged = false
    const now =
      new Date().toISOString()

    const nextCollections =
      readArray(
        COLLECTIONS_KEY,
      ).map((value) => {
        if (
          !isRecord(value) ||
          !Array.isArray(
            value.manualItemKeys,
          )
        ) {
          return value
        }

        const currentKeys =
          value.manualItemKeys.filter(
            (
              key,
            ): key is string =>
              typeof key === 'string',
          )

        const cleanKeys =
          currentKeys.filter(
            (key) =>
              !deletedItemKeys.has(key),
          )

        if (
          cleanKeys.length ===
          currentKeys.length
        ) {
          return value
        }

        collectionsChanged = true

        return {
          ...value,
          manualItemKeys:
            cleanKeys,
          updatedAt: now,
        }
      })

    localStorage.setItem(
      CALCULATIONS_KEY,
      JSON.stringify(
        calculations,
      ),
    )

    localStorage.setItem(
      COMPARISONS_KEY,
      JSON.stringify(
        comparisons,
      ),
    )

    localStorage.setItem(
      PROJECTS_KEY,
      JSON.stringify(
        nextProjects,
      ),
    )

    localStorage.setItem(
      COLLECTIONS_KEY,
      JSON.stringify(
        nextCollections,
      ),
    )

    dispatchEvents(
      calculationIds.size > 0,
      comparisonIds.size > 0,
      true,
      collectionsChanged,
    )

    setSelectedIds([])
    refreshData()
    setStatus('deleted')
  }

  return (
    <section
      className="workspace-record-management-panel"
      aria-label="Workspace record management"
    >
      <div className="workspace-record-management-header">
        <div>
          <span>
            Workspace administration
          </span>

          <h3>
            Record management
          </h3>

          <p>
            Rename, duplicate, tag, organize
            and safely remove saved engineering
            records from one control panel.
          </p>
        </div>

        <div className="workspace-record-management-summary">
          <strong>
            {records.length}
          </strong>

          <span>
            total records
          </span>

          <small>
            {selectedRecords.length}
            {' '}
            selected
          </small>
        </div>
      </div>

      <div className="workspace-record-management-filters">
        <label>
          <span>
            Search records
          </span>

          <input
            type="search"
            value={query}
            placeholder="Search name, calculator, category or tag…"
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
                event.target
                  .value as TypeFilter,
              )
            }
          >
            <option value="all">
              All records
            </option>

            <option value="calculation">
              Saved calculations
            </option>

            <option value="comparison">
              Comparison snapshots
            </option>
          </select>
        </label>

        <button
          type="button"
          onClick={
            toggleVisibleRecords
          }
          disabled={
            filteredRecords.length ===
            0
          }
        >
          {allVisibleSelected
            ? 'Clear visible selection'
            : 'Select visible records'}
        </button>
      </div>

      <div className="workspace-record-management-layout">
        <div className="workspace-record-list">
          {filteredRecords.length ===
          0 ? (
            <div className="workspace-record-empty">
              <strong>
                No matching records
              </strong>

              <p>
                Change the search or type
                filter.
              </p>
            </div>
          ) : (
            filteredRecords.map(
              (record) => {
                const isSelected =
                  selectedIds.includes(
                    record.id,
                  )

                return (
                  <article
                    key={`${record.type}-${record.id}`}
                    className={
                      isSelected
                        ? 'is-selected'
                        : ''
                    }
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={
                          isSelected
                        }
                        onChange={() =>
                          toggleRecord(
                            record.id,
                          )
                        }
                      />

                      <span>
                        Select
                      </span>
                    </label>

                    <div className="workspace-record-copy">
                      <span>
                        {record.type ===
                        'calculation'
                          ? 'Saved calculation'
                          : 'Comparison snapshot'}
                      </span>

                      <h4>
                        {record.name}
                      </h4>

                      <p>
                        {
                          record.calculatorTitle
                        }
                      </p>

                      <small>
                        {record.category}
                        {' · '}
                        {formatDate(
                          record.createdAt,
                        )}
                      </small>

                      {record.tags.length >
                      0 ? (
                        <div>
                          {record.tags
                            .slice(0, 4)
                            .map(
                              (tag) => (
                                <span
                                  key={tag}
                                >
                                  {tag}
                                </span>
                              ),
                            )}

                          {record.tags.length >
                          4 ? (
                            <small>
                              +
                              {record.tags.length -
                                4}
                            </small>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </article>
                )
              },
            )
          )}
        </div>

        <aside className="workspace-record-actions">
          <section>
            <span>
              Single record
            </span>

            <h4>
              Rename
            </h4>

            <p>
              Select exactly one record.
            </p>

            <input
              type="text"
              value={renameDraft}
              placeholder="New record name"
              maxLength={100}
              disabled={
                !singleSelected
              }
              onChange={(event) =>
                setRenameDraft(
                  event.target.value,
                )
              }
            />

            <button
              type="button"
              onClick={handleRename}
            >
              Rename selected record
            </button>
          </section>

          <section>
            <span>
              Multiple records
            </span>

            <h4>
              Bulk tags
            </h4>

            <p>
              Separate multiple tags with
              commas.
            </p>

            <input
              type="text"
              value={tagDraft}
              placeholder="validation, final, review"
              onChange={(event) =>
                setTagDraft(
                  event.target.value,
                )
              }
            />

            <button
              type="button"
              onClick={
                handleBulkTags
              }
            >
              Add tags to selection
            </button>
          </section>

          <section>
            <span>
              Project filing
            </span>

            <h4>
              Add to project
            </h4>

            <p>
              Selected records will be moved
              into the chosen project.
            </p>

            <select
              value={projectId}
              onChange={(event) =>
                setProjectId(
                  event.target.value,
                )
              }
            >
              <option value="">
                Select a project
              </option>

              {projects.map(
                (project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name}
                  </option>
                ),
              )}
            </select>

            <button
              type="button"
              onClick={
                handleProjectAssignment
              }
            >
              Add selection to project
            </button>
          </section>

          <section className="workspace-record-collection-action">
            <span>
              Manual filing
            </span>

            <h4>
              Add to collection
            </h4>

            <p>
              Add selected records to a manual
              collection. Smart collections
              continue to update from their rules.
            </p>

            <select
              value={collectionId}
              disabled={
                manualCollections.length ===
                0
              }
              onChange={(event) =>
                setCollectionId(
                  event.target.value,
                )
              }
            >
              <option value="">
                {manualCollections.length ===
                0
                  ? 'No manual collections'
                  : 'Select a manual collection'}
              </option>

              {manualCollections.map(
                (collection) => (
                  <option
                    key={collection.id}
                    value={collection.id}
                  >
                    {collection.name}
                    {' · '}
                    {
                      collection
                        .manualItemKeys
                        .length
                    }
                    {' '}
                    records
                  </option>
                ),
              )}
            </select>

            <button
              type="button"
              disabled={
                manualCollections.length ===
                0
              }
              onClick={
                handleCollectionAssignment
              }
            >
              Add selection to collection
            </button>
          </section>

          <section className="workspace-record-secondary-actions">
            <button
              type="button"
              onClick={
                handleDuplicate
              }
            >
              Duplicate selection
            </button>

            <button
              type="button"
              className="workspace-record-delete"
              onClick={handleDelete}
            >
              Delete selection
            </button>
          </section>
        </aside>
      </div>

      <p
        className="workspace-record-management-status"
        aria-live="polite"
      >
        {status === 'renamed'
          ? 'Selected record renamed.'
          : null}

        {status === 'duplicated'
          ? 'Selected records duplicated.'
          : null}

        {status === 'tagged'
          ? 'Tags added to selected records.'
          : null}

        {status === 'assigned'
          ? 'Selected records added to the project.'
          : null}

        {status === 'collected'
          ? 'Selected records added to the manual collection.'
          : null}

        {status === 'deleted'
          ? 'Selected records permanently deleted.'
          : null}

        {status === 'select-one'
          ? 'Select exactly one record for this action.'
          : null}

        {status === 'select-records'
          ? 'Select at least one record.'
          : null}

        {status === 'enter-value'
          ? 'Complete the required field first.'
          : null}

        {status === 'error'
          ? 'The record operation could not be completed.'
          : null}
      </p>
    </section>
  )
}
