import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import '../styles/workspace-collections.css'

const CALCULATIONS_KEY =
  'cheme-toolkit.saved-calculations.v1'

const COMPARISONS_KEY =
  'cheme-toolkit.saved-comparisons.v1'

const TEMPLATES_KEY =
  'cheme-toolkit.workspace-templates.v1'

const COLLECTIONS_KEY =
  'cheme-toolkit.workspace-collections.v1'

const COLLECTIONS_EVENT =
  'cheme-toolkit:workspace-collections-changed'

const PERSONAL_DATA_EVENT =
  'cheme-toolkit:personal-data-changed'

const WORKSPACE_TARGET_EVENT =
  'cheme-toolkit:workspace-open-target'

const PENDING_TARGET_KEY =
  'cheme-toolkit.pending-workspace-target.v1'

const SOURCE_EVENTS = [
  'cheme-toolkit:saved-calculations-changed',
  'cheme-toolkit:saved-comparisons-changed',
  'cheme-toolkit:workspace-templates-changed',
  PERSONAL_DATA_EVENT,
]

const MAX_COLLECTIONS = 100
const MAX_MANUAL_ITEMS = 200

type WorkspaceItemType =
  | 'calculation'
  | 'comparison'
  | 'template'

type CollectionMode =
  | 'manual'
  | 'smart'

type DestinationTab =
  | 'records'
  | 'compare'
  | 'templates'

type Status =
  | 'idle'
  | 'created'
  | 'updated'
  | 'duplicated'
  | 'deleted'
  | 'opened'
  | 'name-required'
  | 'selection-required'
  | 'error'

interface WorkspaceCollectionsPanelProps {
  onOpenCalculator: (
    calculatorId: string,
  ) => void

  onOpenTab: (
    tabId: DestinationTab,
  ) => void
}

interface WorkspaceItem {
  key: string
  id: string
  type: WorkspaceItemType
  name: string
  calculatorId: string
  calculatorTitle: string
  category: string
  createdAt: string
  tags: string[]
}

interface CollectionRule {
  types: WorkspaceItemType[]
  category: string
  tag: string
  query: string
}

interface WorkspaceCollection {
  id: string
  name: string
  description: string
  mode: CollectionMode
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  manualItemKeys: string[]
  rule: CollectionRule
}

const ALL_ITEM_TYPES:
  WorkspaceItemType[] = [
    'calculation',
    'comparison',
    'template',
  ]

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

function normalizeItemType(
  value: unknown,
): WorkspaceItemType | null {
  return ALL_ITEM_TYPES.includes(
    value as WorkspaceItemType,
  )
    ? value as WorkspaceItemType
    : null
}

function createWorkspaceItem(
  value: unknown,
  type: WorkspaceItemType,
): WorkspaceItem | null {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.name !== 'string'
  ) {
    return null
  }

  return {
    key: `${type}:${value.id}`,
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
  }
}

function readWorkspaceItems():
  WorkspaceItem[] {
  const calculations =
    readArray(
      CALCULATIONS_KEY,
    ).flatMap((value) => {
      const item =
        createWorkspaceItem(
          value,
          'calculation',
        )

      return item
        ? [item]
        : []
    })

  const comparisons =
    readArray(
      COMPARISONS_KEY,
    ).flatMap((value) => {
      const item =
        createWorkspaceItem(
          value,
          'comparison',
        )

      return item
        ? [item]
        : []
    })

  const templates =
    readArray(
      TEMPLATES_KEY,
    ).flatMap((value) => {
      const item =
        createWorkspaceItem(
          value,
          'template',
        )

      return item
        ? [item]
        : []
    })

  return [
    ...calculations,
    ...comparisons,
    ...templates,
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

function normalizeRule(
  value: unknown,
): CollectionRule {
  if (!isRecord(value)) {
    return {
      types: [
        ...ALL_ITEM_TYPES,
      ],
      category: 'all',
      tag: 'all',
      query: '',
    }
  }

  const types =
    Array.isArray(value.types)
      ? value.types.flatMap(
          (type) => {
            const normalized =
              normalizeItemType(type)

            return normalized
              ? [normalized]
              : []
          },
        )
      : []

  return {
    types:
      types.length > 0
        ? Array.from(
            new Set(types),
          )
        : [
            ...ALL_ITEM_TYPES,
          ],
    category:
      typeof value.category ===
      'string'
        ? value.category
        : 'all',
    tag:
      typeof value.tag ===
      'string'
        ? value.tag
        : 'all',
    query:
      typeof value.query ===
      'string'
        ? value.query
        : '',
  }
}

function readCollections():
  WorkspaceCollection[] {
  return readArray(
    COLLECTIONS_KEY,
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

    const createdAt =
      typeof value.createdAt ===
      'string'
        ? value.createdAt
        : ''

    const mode:
      CollectionMode =
      value.mode === 'smart'
        ? 'smart'
        : 'manual'

    const manualItemKeys =
      Array.isArray(
        value.manualItemKeys,
      )
        ? value.manualItemKeys
            .filter(
              (
                key,
              ): key is string =>
                typeof key ===
                'string',
            )
            .slice(
              0,
              MAX_MANUAL_ITEMS,
            )
        : []

    return [{
      id: value.id,
      name: value.name,
      description:
        typeof value.description ===
        'string'
          ? value.description
          : '',
      mode,
      isFavorite:
        value.isFavorite === true,
      createdAt,
      updatedAt:
        typeof value.updatedAt ===
        'string'
          ? value.updatedAt
          : createdAt,
      manualItemKeys,
      rule:
        normalizeRule(
          value.rule,
        ),
    }]
  }).sort(
    (first, second) =>
      Number(
        second.isFavorite,
      ) -
        Number(
          first.isFavorite,
        ) ||
      Date.parse(
        second.updatedAt,
      ) -
        Date.parse(
          first.updatedAt,
        ),
  )
}

function writeCollections(
  collections: WorkspaceCollection[],
): boolean {
  try {
    localStorage.setItem(
      COLLECTIONS_KEY,
      JSON.stringify(
        collections.slice(
          0,
          MAX_COLLECTIONS,
        ),
      ),
    )

    window.dispatchEvent(
      new Event(
        COLLECTIONS_EVENT,
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

function itemTypeLabel(
  type: WorkspaceItemType,
): string {
  if (type === 'calculation') {
    return 'Calculation'
  }

  if (type === 'comparison') {
    return 'Comparison'
  }

  return 'Template'
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

function matchesRule(
  item: WorkspaceItem,
  rule: CollectionRule,
): boolean {
  if (
    !rule.types.includes(
      item.type,
    )
  ) {
    return false
  }

  if (
    rule.category !== 'all' &&
    item.category !==
      rule.category
  ) {
    return false
  }

  if (
    rule.tag !== 'all' &&
    !item.tags.some(
      (tag) =>
        tag.toLocaleLowerCase(
          'en-US',
        ) ===
        rule.tag.toLocaleLowerCase(
          'en-US',
        ),
    )
  ) {
    return false
  }

  const query =
    rule.query
      .trim()
      .toLocaleLowerCase(
        'en-US',
      )

  if (!query) {
    return true
  }

  return [
    item.name,
    item.calculatorTitle,
    item.category,
    ...item.tags,
  ]
    .join(' ')
    .toLocaleLowerCase(
      'en-US',
    )
    .includes(query)
}

function getCollectionItems(
  collection: WorkspaceCollection,
  items: WorkspaceItem[],
): WorkspaceItem[] {
  if (
    collection.mode === 'smart'
  ) {
    return items.filter(
      (item) =>
        matchesRule(
          item,
          collection.rule,
        ),
    )
  }

  const keys =
    new Set(
      collection.manualItemKeys,
    )

  return items.filter(
    (item) =>
      keys.has(item.key),
  )
}

function toggleValue<T>(
  values: T[],
  value: T,
  checked: boolean,
): T[] {
  if (checked) {
    return Array.from(
      new Set([
        ...values,
        value,
      ]),
    )
  }

  return values.filter(
    (current) =>
      current !== value,
  )
}

export function WorkspaceCollectionsPanel({
  onOpenCalculator,
  onOpenTab,
}: WorkspaceCollectionsPanelProps) {
  const [
    items,
    setItems,
  ] = useState<WorkspaceItem[]>(
    readWorkspaceItems,
  )

  const [
    collections,
    setCollections,
  ] = useState<
    WorkspaceCollection[]
  >(
    readCollections,
  )

  const [
    selectedCollectionId,
    setSelectedCollectionId,
  ] = useState('')

  const [
    creatorName,
    setCreatorName,
  ] = useState('')

  const [
    creatorDescription,
    setCreatorDescription,
  ] = useState('')

  const [
    creatorMode,
    setCreatorMode,
  ] = useState<CollectionMode>(
    'smart',
  )

  const [
    creatorFavorite,
    setCreatorFavorite,
  ] = useState(false)

  const [
    creatorTypes,
    setCreatorTypes,
  ] = useState<
    WorkspaceItemType[]
  >([
    ...ALL_ITEM_TYPES,
  ])

  const [
    creatorCategory,
    setCreatorCategory,
  ] = useState('all')

  const [
    creatorTag,
    setCreatorTag,
  ] = useState('all')

  const [
    creatorRuleQuery,
    setCreatorRuleQuery,
  ] = useState('')

  const [
    creatorManualKeys,
    setCreatorManualKeys,
  ] = useState<string[]>([])

  const [
    itemQuery,
    setItemQuery,
  ] = useState('')

  const [
    itemTypeFilter,
    setItemTypeFilter,
  ] = useState<
    'all' | WorkspaceItemType
  >('all')

  const [
    collectionQuery,
    setCollectionQuery,
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
    editFavorite,
    setEditFavorite,
  ] = useState(false)

  const [
    editTypes,
    setEditTypes,
  ] = useState<
    WorkspaceItemType[]
  >([
    ...ALL_ITEM_TYPES,
  ])

  const [
    editCategory,
    setEditCategory,
  ] = useState('all')

  const [
    editTag,
    setEditTag,
  ] = useState('all')

  const [
    editRuleQuery,
    setEditRuleQuery,
  ] = useState('')

  const [
    editManualKeys,
    setEditManualKeys,
  ] = useState<string[]>([])

  const [
    status,
    setStatus,
  ] = useState<Status>(
    'idle',
  )

  const selectedCollection =
    useMemo(
      () =>
        collections.find(
          (collection) =>
            collection.id ===
            selectedCollectionId,
        ) ?? null,
      [
        collections,
        selectedCollectionId,
      ],
    )

  const categoryOptions =
    useMemo(
      () =>
        Array.from(
          new Set(
            items.map(
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
      [items],
    )

  const tagOptions =
    useMemo(
      () =>
        Array.from(
          new Set(
            items.flatMap(
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
      [items],
    )

  const filteredItems =
    useMemo(() => {
      const query =
        itemQuery
          .trim()
          .toLocaleLowerCase(
            'en-US',
          )

      return items.filter(
        (item) => {
          const typeMatches =
            itemTypeFilter ===
              'all' ||
            item.type ===
              itemTypeFilter

          const queryMatches =
            !query ||
            [
              item.name,
              item.calculatorTitle,
              item.category,
              ...item.tags,
            ]
              .join(' ')
              .toLocaleLowerCase(
                'en-US',
              )
              .includes(query)

          return (
            typeMatches &&
            queryMatches
          )
        },
      ).slice(0, 80)
    }, [
      items,
      itemQuery,
      itemTypeFilter,
    ])

  const filteredCollections =
    useMemo(() => {
      const query =
        collectionQuery
          .trim()
          .toLocaleLowerCase(
            'en-US',
          )

      return collections.filter(
        (collection) =>
          !query ||
          [
            collection.name,
            collection.description,
            collection.mode,
          ]
            .join(' ')
            .toLocaleLowerCase(
              'en-US',
            )
            .includes(query),
      )
    }, [
      collections,
      collectionQuery,
    ])

  const selectedCollectionItems =
    useMemo(
      () =>
        selectedCollection
          ? getCollectionItems(
              selectedCollection,
              items,
            )
          : [],
      [
        selectedCollection,
        items,
      ],
    )

  useEffect(() => {
    if (!selectedCollection) {
      setEditName('')
      setEditDescription('')
      setEditFavorite(false)
      setEditTypes([
        ...ALL_ITEM_TYPES,
      ])
      setEditCategory('all')
      setEditTag('all')
      setEditRuleQuery('')
      setEditManualKeys([])
      return
    }

    setEditName(
      selectedCollection.name,
    )

    setEditDescription(
      selectedCollection.description,
    )

    setEditFavorite(
      selectedCollection.isFavorite,
    )

    setEditTypes([
      ...selectedCollection.rule.types,
    ])

    setEditCategory(
      selectedCollection.rule.category,
    )

    setEditTag(
      selectedCollection.rule.tag,
    )

    setEditRuleQuery(
      selectedCollection.rule.query,
    )

    setEditManualKeys([
      ...selectedCollection.manualItemKeys,
    ])
  }, [selectedCollection])

  useEffect(() => {
    function refreshItems() {
      setItems(
        readWorkspaceItems(),
      )
    }

    function refreshCollections() {
      const next =
        readCollections()

      setCollections(next)

      setSelectedCollectionId(
        (current) =>
          next.some(
            (collection) =>
              collection.id ===
              current,
          )
            ? current
            : '',
      )
    }

    SOURCE_EVENTS.forEach(
      (eventName) => {
        window.addEventListener(
          eventName,
          refreshItems,
        )
      },
    )

    window.addEventListener(
      COLLECTIONS_EVENT,
      refreshCollections,
    )

    window.addEventListener(
      'storage',
      refreshItems,
    )

    window.addEventListener(
      'storage',
      refreshCollections,
    )

    window.addEventListener(
      'focus',
      refreshItems,
    )

    window.addEventListener(
      'focus',
      refreshCollections,
    )

    return () => {
      SOURCE_EVENTS.forEach(
        (eventName) => {
          window.removeEventListener(
            eventName,
            refreshItems,
          )
        },
      )

      window.removeEventListener(
        COLLECTIONS_EVENT,
        refreshCollections,
      )

      window.removeEventListener(
        'storage',
        refreshItems,
      )

      window.removeEventListener(
        'storage',
        refreshCollections,
      )

      window.removeEventListener(
        'focus',
        refreshItems,
      )

      window.removeEventListener(
        'focus',
        refreshCollections,
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

  function saveCollectionList(
    next:
      WorkspaceCollection[],
  ): boolean {
    if (
      !writeCollections(next)
    ) {
      setStatus('error')
      return false
    }

    setCollections(next)
    return true
  }

  function resetCreator() {
    setCreatorName('')
    setCreatorDescription('')
    setCreatorMode('smart')
    setCreatorFavorite(false)
    setCreatorTypes([
      ...ALL_ITEM_TYPES,
    ])
    setCreatorCategory('all')
    setCreatorTag('all')
    setCreatorRuleQuery('')
    setCreatorManualKeys([])
  }

  function handleCreate() {
    const name =
      creatorName.trim()

    if (!name) {
      setStatus('name-required')
      return
    }

    if (
      creatorMode === 'manual' &&
      creatorManualKeys.length === 0
    ) {
      setStatus(
        'selection-required',
      )
      return
    }

    const now =
      new Date().toISOString()

    const collection:
      WorkspaceCollection = {
      id: createId(),
      name,
      description:
        creatorDescription.trim(),
      mode: creatorMode,
      isFavorite:
        creatorFavorite,
      createdAt: now,
      updatedAt: now,
      manualItemKeys:
        creatorMode === 'manual'
          ? creatorManualKeys.slice(
              0,
              MAX_MANUAL_ITEMS,
            )
          : [],
      rule: {
        types:
          creatorTypes.length > 0
            ? creatorTypes
            : [
                ...ALL_ITEM_TYPES,
              ],
        category:
          creatorCategory,
        tag:
          creatorTag,
        query:
          creatorRuleQuery.trim(),
      },
    }

    const next = [
      collection,
      ...collections,
    ].slice(
      0,
      MAX_COLLECTIONS,
    )

    if (
      !saveCollectionList(next)
    ) {
      return
    }

    setSelectedCollectionId(
      collection.id,
    )

    resetCreator()
    setStatus('created')
  }

  function handleSaveSelected() {
    if (!selectedCollection) {
      return
    }

    const name =
      editName.trim()

    if (!name) {
      setStatus('name-required')
      return
    }

    if (
      selectedCollection.mode ===
        'manual' &&
      editManualKeys.length === 0
    ) {
      setStatus(
        'selection-required',
      )
      return
    }

    const next =
      collections.map(
        (collection) =>
          collection.id ===
          selectedCollection.id
            ? {
                ...collection,
                name,
                description:
                  editDescription.trim(),
                isFavorite:
                  editFavorite,
                updatedAt:
                  new Date()
                    .toISOString(),
                manualItemKeys:
                  collection.mode ===
                  'manual'
                    ? editManualKeys.slice(
                        0,
                        MAX_MANUAL_ITEMS,
                      )
                    : [],
                rule: {
                  types:
                    editTypes.length > 0
                      ? editTypes
                      : [
                          ...ALL_ITEM_TYPES,
                        ],
                  category:
                    editCategory,
                  tag:
                    editTag,
                  query:
                    editRuleQuery.trim(),
                },
              }
            : collection,
      )

    if (
      saveCollectionList(next)
    ) {
      setStatus('updated')
    }
  }

  function handleDuplicate() {
    if (!selectedCollection) {
      return
    }

    const now =
      new Date().toISOString()

    const duplicate:
      WorkspaceCollection = {
      ...selectedCollection,
      id: createId(),
      name:
        `${selectedCollection.name} Copy`,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
      manualItemKeys: [
        ...selectedCollection.manualItemKeys,
      ],
      rule: {
        ...selectedCollection.rule,
        types: [
          ...selectedCollection.rule.types,
        ],
      },
    }

    const next = [
      duplicate,
      ...collections,
    ].slice(
      0,
      MAX_COLLECTIONS,
    )

    if (
      !saveCollectionList(next)
    ) {
      return
    }

    setSelectedCollectionId(
      duplicate.id,
    )

    setStatus('duplicated')
  }

  function handleDelete() {
    if (!selectedCollection) {
      return
    }

    const confirmed =
      window.confirm(
        `Delete the collection “${selectedCollection.name}”? Workspace records will not be deleted.`,
      )

    if (!confirmed) {
      return
    }

    const next =
      collections.filter(
        (collection) =>
          collection.id !==
          selectedCollection.id,
      )

    if (
      !saveCollectionList(next)
    ) {
      return
    }

    setSelectedCollectionId('')
    setStatus('deleted')
  }

  function handleQuickFavorite(
    collection:
      WorkspaceCollection,
  ) {
    const next =
      collections.map(
        (current) =>
          current.id ===
          collection.id
            ? {
                ...current,
                isFavorite:
                  !current.isFavorite,
                updatedAt:
                  new Date()
                    .toISOString(),
              }
            : current,
      )

    saveCollectionList(next)
  }

  function openItem(
    item: WorkspaceItem,
  ) {
    if (
      item.type === 'template'
    ) {
      onOpenTab('templates')
      setStatus('opened')
      return
    }

    try {
      sessionStorage.setItem(
        PENDING_TARGET_KEY,
        JSON.stringify({
          type: item.type,
          id: item.id,
        }),
      )
    } catch {
      setStatus('error')
      return
    }

    window.dispatchEvent(
      new CustomEvent(
        WORKSPACE_TARGET_EVENT,
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

    onOpenTab(
      item.type ===
        'calculation'
        ? 'records'
        : 'compare',
    )

    setStatus('opened')
  }

  function renderTypeControls(
    values: WorkspaceItemType[],
    onChange: (
      next: WorkspaceItemType[],
    ) => void,
    name: string,
  ) {
    return (
      <fieldset className="workspace-collection-type-fieldset">
        <legend>
          Included record types
        </legend>

        {ALL_ITEM_TYPES.map(
          (type) => (
            <label key={type}>
              <input
                type="checkbox"
                name={`${name}-${type}`}
                checked={
                  values.includes(
                    type,
                  )
                }
                onChange={(event) =>
                  onChange(
                    toggleValue(
                      values,
                      type,
                      event.target
                        .checked,
                    ),
                  )
                }
              />

              <span>
                {itemTypeLabel(type)}
              </span>
            </label>
          ),
        )}
      </fieldset>
    )
  }

  function renderItemSelector(
    selectedKeys: string[],
    onChange: (
      next: string[],
    ) => void,
  ) {
    return (
      <div className="workspace-collection-item-selector">
        <div className="workspace-collection-item-filters">
          <input
            type="search"
            value={itemQuery}
            placeholder="Search workspace records…"
            onChange={(event) =>
              setItemQuery(
                event.target.value,
              )
            }
          />

          <select
            value={itemTypeFilter}
            onChange={(event) =>
              setItemTypeFilter(
                event.target.value as
                  | 'all'
                  | WorkspaceItemType,
              )
            }
          >
            <option value="all">
              All record types
            </option>

            <option value="calculation">
              Calculations
            </option>

            <option value="comparison">
              Comparisons
            </option>

            <option value="template">
              Templates
            </option>
          </select>
        </div>

        <div className="workspace-collection-item-options">
          {filteredItems.length ===
          0 ? (
            <p>
              No matching workspace records.
            </p>
          ) : (
            filteredItems.map(
              (item) => (
                <label key={item.key}>
                  <input
                    type="checkbox"
                    checked={
                      selectedKeys.includes(
                        item.key,
                      )
                    }
                    onChange={(event) =>
                      onChange(
                        toggleValue(
                          selectedKeys,
                          item.key,
                          event.target
                            .checked,
                        ).slice(
                          0,
                          MAX_MANUAL_ITEMS,
                        ),
                      )
                    }
                  />

                  <span>
                    <strong>
                      {item.name}
                    </strong>

                    <small>
                      {itemTypeLabel(
                        item.type,
                      )}
                      {' · '}
                      {
                        item.calculatorTitle
                      }
                    </small>
                  </span>
                </label>
              ),
            )
          )}
        </div>
      </div>
    )
  }

  return (
    <section
      className="workspace-collections-panel"
      aria-label="Workspace smart collections"
    >
      <header className="workspace-collections-header">
        <div>
          <span>
            Saved workspace views
          </span>

          <h3>
            Smart collections
          </h3>

          <p>
            Group calculations, comparison
            snapshots and reusable templates
            manually or with rules that update
            automatically as the workspace grows.
          </p>
        </div>

        <div className="workspace-collections-summary">
          <strong>
            {collections.length}
          </strong>

          <span>
            collections
          </span>

          <small>
            {
              collections.filter(
                (collection) =>
                  collection.isFavorite,
              ).length
            }
            {' '}
            pinned
          </small>
        </div>
      </header>

      <section className="workspace-collection-creator">
        <header>
          <div>
            <span>
              Create a saved view
            </span>

            <h4>
              New collection
            </h4>

            <p>
              Manual collections keep a fixed
              selection. Smart collections
              recalculate their contents from
              saved rules.
            </p>
          </div>

          <div className="workspace-collection-mode-switch">
            <button
              type="button"
              className={
                creatorMode === 'smart'
                  ? 'is-active'
                  : ''
              }
              onClick={() =>
                setCreatorMode(
                  'smart',
                )
              }
            >
              Smart
            </button>

            <button
              type="button"
              className={
                creatorMode === 'manual'
                  ? 'is-active'
                  : ''
              }
              onClick={() =>
                setCreatorMode(
                  'manual',
                )
              }
            >
              Manual
            </button>
          </div>
        </header>

        <div className="workspace-collection-basic-fields">
          <label>
            <span>
              Collection name
            </span>

            <input
              type="text"
              value={creatorName}
              maxLength={100}
              placeholder="Example: Heat-transfer validation cases"
              onChange={(event) =>
                setCreatorName(
                  event.target.value,
                )
              }
            />
          </label>

          <label>
            <span>
              Description
            </span>

            <input
              type="text"
              value={
                creatorDescription
              }
              maxLength={300}
              placeholder="What belongs in this collection?"
              onChange={(event) =>
                setCreatorDescription(
                  event.target.value,
                )
              }
            />
          </label>

          <label className="workspace-collection-favorite-field">
            <input
              type="checkbox"
              checked={creatorFavorite}
              onChange={(event) =>
                setCreatorFavorite(
                  event.target.checked,
                )
              }
            />

            <span>
              Pin collection
            </span>
          </label>
        </div>

        {creatorMode === 'smart' ? (
          <div className="workspace-collection-rule-builder">
            {renderTypeControls(
              creatorTypes,
              setCreatorTypes,
              'creator',
            )}

            <label>
              <span>
                Category
              </span>

              <select
                value={creatorCategory}
                onChange={(event) =>
                  setCreatorCategory(
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
                Required tag
              </span>

              <select
                value={creatorTag}
                onChange={(event) =>
                  setCreatorTag(
                    event.target.value,
                  )
                }
              >
                <option value="all">
                  Any tag
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
                Text rule
              </span>

              <input
                type="search"
                value={
                  creatorRuleQuery
                }
                placeholder="Search name, calculator, category or tags"
                onChange={(event) =>
                  setCreatorRuleQuery(
                    event.target.value,
                  )
                }
              />
            </label>
          </div>
        ) : (
          renderItemSelector(
            creatorManualKeys,
            setCreatorManualKeys,
          )
        )}

        <button
          type="button"
          className="workspace-collection-create-button"
          onClick={handleCreate}
        >
          Create collection
        </button>
      </section>

      <div className="workspace-collection-search">
        <label>
          <span>
            Search collections
          </span>

          <input
            type="search"
            value={collectionQuery}
            placeholder="Search collection names and descriptions…"
            onChange={(event) =>
              setCollectionQuery(
                event.target.value,
              )
            }
          />
        </label>

        <span>
          {
            filteredCollections.length
          }
          {' '}
          shown
        </span>
      </div>

      <div className="workspace-collection-layout">
        <div className="workspace-collection-library">
          {filteredCollections.length ===
          0 ? (
            <div className="workspace-collection-empty">
              <strong>
                No collections found
              </strong>

              <p>
                Create a smart rule or select
                workspace records manually.
              </p>
            </div>
          ) : (
            filteredCollections.map(
              (collection) => {
                const collectionItems =
                  getCollectionItems(
                    collection,
                    items,
                  )

                const isSelected =
                  collection.id ===
                  selectedCollectionId

                return (
                  <article
                    key={collection.id}
                    className={
                      isSelected
                        ? 'is-selected'
                        : ''
                    }
                  >
                    <header>
                      <div>
                        <span>
                          {collection.mode ===
                          'smart'
                            ? 'Smart collection'
                            : 'Manual collection'}
                        </span>

                        <h4>
                          {collection.name}
                        </h4>
                      </div>

                      <button
                        type="button"
                        aria-label={
                          collection.isFavorite
                            ? 'Unpin collection'
                            : 'Pin collection'
                        }
                        onClick={() =>
                          handleQuickFavorite(
                            collection,
                          )
                        }
                      >
                        {collection.isFavorite
                          ? '★'
                          : '☆'}
                      </button>
                    </header>

                    <p>
                      {collection.description ||
                        'No collection description.'}
                    </p>

                    <div className="workspace-collection-card-meta">
                      <strong>
                        {
                          collectionItems.length
                        }
                      </strong>

                      <span>
                        matching records
                      </span>

                      <small>
                        Updated
                        {' '}
                        {formatDate(
                          collection.updatedAt,
                        )}
                      </small>
                    </div>

                    {collection.mode ===
                    'smart' ? (
                      <div className="workspace-collection-rule-summary">
                        <span>
                          {
                            collection.rule.types
                              .map(
                                itemTypeLabel,
                              )
                              .join(', ')
                          }
                        </span>

                        {collection.rule
                          .category !==
                        'all' ? (
                          <span>
                            {
                              collection.rule
                                .category
                            }
                          </span>
                        ) : null}

                        {collection.rule.tag !==
                        'all' ? (
                          <span>
                            #
                            {
                              collection.rule
                                .tag
                            }
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <button
                      type="button"
                      className="workspace-collection-edit-button"
                      onClick={() =>
                        setSelectedCollectionId(
                          collection.id,
                        )
                      }
                    >
                      Open collection
                    </button>
                  </article>
                )
              },
            )
          )}
        </div>

        <aside className="workspace-collection-editor">
          <span>
            Collection management
          </span>

          <h4>
            {selectedCollection
              ? selectedCollection.name
              : 'Select a collection'}
          </h4>

          <p>
            Edit its rules or membership without
            changing the original workspace
            records.
          </p>

          <label>
            <span>
              Name
            </span>

            <input
              type="text"
              value={editName}
              disabled={
                !selectedCollection
              }
              maxLength={100}
              onChange={(event) =>
                setEditName(
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
              disabled={
                !selectedCollection
              }
              rows={3}
              maxLength={300}
              onChange={(event) =>
                setEditDescription(
                  event.target.value,
                )
              }
            />
          </label>

          <label className="workspace-collection-favorite-field">
            <input
              type="checkbox"
              checked={editFavorite}
              disabled={
                !selectedCollection
              }
              onChange={(event) =>
                setEditFavorite(
                  event.target.checked,
                )
              }
            />

            <span>
              Pin collection
            </span>
          </label>

          {selectedCollection?.mode ===
          'smart' ? (
            <div className="workspace-collection-editor-rules">
              {renderTypeControls(
                editTypes,
                setEditTypes,
                'editor',
              )}

              <label>
                <span>
                  Category
                </span>

                <select
                  value={editCategory}
                  onChange={(event) =>
                    setEditCategory(
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
                  Required tag
                </span>

                <select
                  value={editTag}
                  onChange={(event) =>
                    setEditTag(
                      event.target.value,
                    )
                  }
                >
                  <option value="all">
                    Any tag
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
                  Text rule
                </span>

                <input
                  type="search"
                  value={
                    editRuleQuery
                  }
                  onChange={(event) =>
                    setEditRuleQuery(
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>
          ) : null}

          {selectedCollection?.mode ===
          'manual'
            ? renderItemSelector(
                editManualKeys,
                setEditManualKeys,
              )
            : null}

          <button
            type="button"
            className="workspace-collection-save-button"
            disabled={
              !selectedCollection
            }
            onClick={
              handleSaveSelected
            }
          >
            Save collection
          </button>

          <div className="workspace-collection-editor-actions">
            <button
              type="button"
              disabled={
                !selectedCollection
              }
              onClick={
                handleDuplicate
              }
            >
              Duplicate
            </button>

            <button
              type="button"
              className="workspace-collection-delete-button"
              disabled={
                !selectedCollection
              }
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>

          {selectedCollection ? (
            <div className="workspace-collection-results">
              <header>
                <strong>
                  {
                    selectedCollectionItems.length
                  }
                  {' '}
                  records
                </strong>

                <span>
                  {selectedCollection.mode ===
                  'smart'
                    ? 'Updates automatically'
                    : 'Fixed selection'}
                </span>
              </header>

              {selectedCollectionItems.length ===
              0 ? (
                <p>
                  This collection currently has
                  no matching records.
                </p>
              ) : (
                selectedCollectionItems
                  .slice(0, 20)
                  .map((item) => (
                    <article
                      key={item.key}
                    >
                      <div>
                        <span>
                          {itemTypeLabel(
                            item.type,
                          )}
                        </span>

                        <strong>
                          {item.name}
                        </strong>

                        <small>
                          {
                            item.calculatorTitle
                          }
                        </small>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openItem(item)
                        }
                      >
                        Open
                      </button>
                    </article>
                  ))
              )}

              {selectedCollectionItems.length >
              20 ? (
                <small>
                  Showing the first 20 records.
                </small>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>

      <p
        className="workspace-collection-status"
        aria-live="polite"
      >
        {status === 'created'
          ? 'Collection created.'
          : null}

        {status === 'updated'
          ? 'Collection updated.'
          : null}

        {status === 'duplicated'
          ? 'Collection duplicated.'
          : null}

        {status === 'deleted'
          ? 'Collection deleted.'
          : null}

        {status === 'opened'
          ? 'Workspace record opened.'
          : null}

        {status === 'name-required'
          ? 'Enter a collection name.'
          : null}

        {status === 'selection-required'
          ? 'Select at least one workspace record.'
          : null}

        {status === 'error'
          ? 'The collection operation could not be completed.'
          : null}
      </p>
    </section>
  )
}
