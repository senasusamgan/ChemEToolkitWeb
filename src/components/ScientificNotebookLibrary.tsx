import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  downloadNotebookEngineeringReport,
  printNotebookEngineeringReport,
} from '../lib/scientificNotebookReport'


import {
  ScientificNotebookProjectSets,
} from './ScientificNotebookProjectSets'

import {
  readNotebookProjectSets,
  type NotebookProjectSet,
} from '../lib/scientificNotebookProjectSets'

import '../styles/scientific-notebook-library.css'

const STORAGE_KEY =
  'cheme-toolkit.scientific-notebook.v1'

interface SnapshotValue {
  label?: string
  value?: string
  unit?: string
}

interface SnapshotRecord {
  id?: string
  name?: string
  favorite?: boolean
  capturedAt?: string
  inputs?: SnapshotValue[]
  results?: SnapshotValue[]
  formula?: string
  reference?: string
}

interface NotebookRecord {
  calculatorId: string
  calculatorTitle: string
  category: string
  objective?: string
  assumptions?: string
  observations?: string
  conclusion?: string
  snapshots?: SnapshotRecord[]
  updatedAt?: string
}

type NotebookStore =
  Record<
    string,
    NotebookRecord
  >

type SortMode =
  | 'updated'
  | 'favorites'
  | 'title'


type ImportMode =
  | 'merge'
  | 'replace'

interface NotebookArchive {
  version: number
  exportedAt?: string
  notebooks: NotebookStore
}

interface ScientificNotebookLibraryProps {
  onClose: () => void
  onOpenCalculator: (
    calculatorId: string,
    openNotebook: boolean,
  ) => void
}

function readStore():
  NotebookStore {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY,
      )

    if (!raw) {
      return {}
    }

    const parsed: unknown =
      JSON.parse(raw)

    if (
      typeof parsed !== 'object'
      || parsed === null
      || Array.isArray(parsed)
    ) {
      return {}
    }

    return parsed as NotebookStore
  } catch {
    return {}
  }
}

function normalize(
  value:
    | string
    | undefined,
): string {
  return (
    value
      ?.replace(
        /\s+/g,
        ' ',
      )
      .trim()
    ?? ''
  )
}

function hasNotebookContent(
  record: NotebookRecord,
): boolean {
  return (
    Boolean(
      normalize(
        record.objective,
      ),
    )
    || Boolean(
      normalize(
        record.assumptions,
      ),
    )
    || Boolean(
      normalize(
        record.observations,
      ),
    )
    || Boolean(
      normalize(
        record.conclusion,
      ),
    )
    || (
      Array.isArray(
        record.snapshots,
      )
      && record.snapshots.length > 0
    )
  )
}

function favoriteCount(
  record: NotebookRecord,
): number {
  return (
    record.snapshots
      ?.filter(
        (snapshot) =>
          snapshot.favorite === true,
      )
      .length
    ?? 0
  )
}

function snapshotCount(
  record: NotebookRecord,
): number {
  return (
    record.snapshots
      ?.length
    ?? 0
  )
}

function notePreview(
  record: NotebookRecord,
): string {
  const candidate =
    [
      record.objective,
      record.observations,
      record.conclusion,
      record.assumptions,
    ]
      .map(
        normalize,
      )
      .find(Boolean)

  if (!candidate) {
    return 'Calculation snapshots saved for this calculator.'
  }

  return (
    candidate.length > 180
      ? `${candidate.slice(0, 177)}…`
      : candidate
  )
}

function isRecord(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value === 'object'
    && value !== null
    && !Array.isArray(
      value,
    )
  )
}

function isNotebookStore(
  value: unknown,
): value is NotebookStore {
  if (!isRecord(value)) {
    return false
  }

  return Object.entries(
    value,
  ).every(
    (
      [
        calculatorId,
        record,
      ],
    ) => {
      if (
        !calculatorId
        || !isRecord(
          record,
        )
      ) {
        return false
      }

      return (
        typeof record.calculatorId ===
          'string'
        && typeof record.calculatorTitle ===
          'string'
        && typeof record.category ===
          'string'
      )
    },
  )
}

function parseArchive(
  text: string,
): NotebookArchive {
  const parsed: unknown =
    JSON.parse(text)

  if (
    !isRecord(parsed)
    || typeof parsed.version !==
      'number'
    || !isNotebookStore(
      parsed.notebooks,
    )
  ) {
    throw new Error(
      'Invalid ChemE Toolkit notebook archive.',
    )
  }

  return {
    version:
      parsed.version,
    exportedAt:
      typeof parsed.exportedAt ===
        'string'
        ? parsed.exportedAt
        : undefined,
    notebooks:
      parsed.notebooks,
  }
}

function mergeSnapshotArrays(
  current:
    | SnapshotRecord[]
    | undefined,
  incoming:
    | SnapshotRecord[]
    | undefined,
): SnapshotRecord[] {
  const merged =
    new Map<
      string,
      SnapshotRecord
    >()

  const add =
    (
      snapshot: SnapshotRecord,
      index: number,
      source: string,
    ) => {
      const key =
        snapshot.id
        || [
            source,
            snapshot.capturedAt
              || 'unknown',
            snapshot.name
              || 'unnamed',
            index,
          ].join(':')

      merged.set(
        key,
        {
          ...(
            merged.get(
              key,
            )
            ?? {}
          ),
          ...snapshot,
        },
      )
    }

  current
    ?.forEach(
      (
        snapshot,
        index,
      ) =>
        add(
          snapshot,
          index,
          'current',
        ),
    )

  incoming
    ?.forEach(
      (
        snapshot,
        index,
      ) =>
        add(
          snapshot,
          index,
          'incoming',
        ),
    )

  return Array.from(
    merged.values(),
  ).sort(
    (
      left,
      right,
    ) =>
      new Date(
        right.capturedAt
        ?? 0,
      ).getTime()
      - new Date(
          left.capturedAt
          ?? 0,
        ).getTime(),
  )
}

function mergeNotebookStores(
  current: NotebookStore,
  incoming: NotebookStore,
): NotebookStore {
  const merged: NotebookStore = {
    ...current,
  }

  for (
    const [
      calculatorId,
      incomingRecord,
    ]
    of Object.entries(
      incoming,
    )
  ) {
    const currentRecord =
      merged[
        calculatorId
      ]

    if (!currentRecord) {
      merged[
        calculatorId
      ] = incomingRecord
      continue
    }

    const incomingUpdated =
      new Date(
        incomingRecord.updatedAt
        ?? 0,
      ).getTime()

    const currentUpdated =
      new Date(
        currentRecord.updatedAt
        ?? 0,
      ).getTime()

    const newerRecord =
      incomingUpdated >=
        currentUpdated
        ? incomingRecord
        : currentRecord

    const olderRecord =
      newerRecord ===
        incomingRecord
        ? currentRecord
        : incomingRecord

    merged[
      calculatorId
    ] = {
      ...olderRecord,
      ...newerRecord,
      calculatorId,
      calculatorTitle:
        newerRecord.calculatorTitle
        || olderRecord.calculatorTitle,
      category:
        newerRecord.category
        || olderRecord.category,
      snapshots:
        mergeSnapshotArrays(
          currentRecord.snapshots,
          incomingRecord.snapshots,
        ),
      updatedAt:
        new Date(
          Math.max(
            currentUpdated,
            incomingUpdated,
          )
          || Date.now(),
        ).toISOString(),
    }
  }

  return merged
}

function createSlug(
  value: string,
): string {
  return value
    .toLocaleLowerCase(
      'en-US',
    )
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .replace(
      /[^a-z0-9]+/g,
      '-',
    )
    .replace(
      /^-+|-+$/g,
      '',
    )
}

export function ScientificNotebookLibrary({
  onClose,
  onOpenCalculator,
}: ScientificNotebookLibraryProps) {
  const [
    store,
    setStore,
  ] = useState<NotebookStore>(
    {},
  )

  const [
    query,
    setQuery,
  ] = useState('')

  const [
    category,
    setCategory,
  ] = useState('all')

  const [
    favoritesOnly,
    setFavoritesOnly,
  ] = useState(false)

  const [
    sortMode,
    setSortMode,
  ] = useState<SortMode>(
    'updated',
  )

  const [
    status,
    setStatus,
  ] = useState(
    'Stored locally on this device.',
  )


  const [
    projectReportIds,
    setProjectReportIds,
  ] = useState<string[]>(
    [],
  )

  const [
    projectReportTitle,
    setProjectReportTitle,
  ] = useState(
    'Engineering Project Report',
  )


  const [
    projectSets,
    setProjectSets,
  ] = useState<
    NotebookProjectSet[]
  >(
    [],
  )


  const [
    importMode,
    setImportMode,
  ] = useState<ImportMode>(
    'merge',
  )

  const importInputRef =
    useRef<HTMLInputElement>(
      null,
    )

  useEffect(() => {
    const refresh =
      () => {
        setStore(
          readStore(),
        )

        setProjectSets(
          readNotebookProjectSets(),
        )
      }

    refresh()

    window.addEventListener(
      'storage',
      refresh,
    )

    return () => {
      window.removeEventListener(
        'storage',
        refresh,
      )
    }
  }, [])

  const notebooks =
    useMemo(
      () =>
        Object.values(
          store,
        ).filter(
          hasNotebookContent,
        ),
      [
        store,
      ],
    )

  const categories =
    useMemo(
      () =>
        Array.from(
          new Set(
            notebooks
              .map(
                (record) =>
                  record.category,
              )
              .filter(Boolean),
          ),
        ).sort(
          (left, right) =>
            left.localeCompare(
              right,
            ),
        ),
      [
        notebooks,
      ],
    )

  const visibleNotebooks =
    useMemo(
      () => {
        const normalizedQuery =
          query
            .trim()
            .toLocaleLowerCase(
              'en-US',
            )

        return notebooks
          .filter(
            (record) => {
              if (
                category !==
                  'all'
                && record.category !==
                  category
              ) {
                return false
              }

              if (
                favoritesOnly
                && favoriteCount(
                  record,
                ) === 0
              ) {
                return false
              }

              if (
                !normalizedQuery
              ) {
                return true
              }

              const searchable =
                [
                  record.calculatorTitle,
                  record.category,
                  record.objective,
                  record.assumptions,
                  record.observations,
                  record.conclusion,
                  ...(
                    record.snapshots
                      ?.map(
                        (snapshot) =>
                          snapshot.name,
                      )
                    ?? []
                  ),
                ]
                  .map(
                    (value) =>
                      normalize(
                        value,
                      )
                        .toLocaleLowerCase(
                          'en-US',
                        ),
                  )
                  .join(' ')

              return searchable.includes(
                normalizedQuery,
              )
            },
          )
          .sort(
            (
              left,
              right,
            ) => {
              if (
                sortMode ===
                'favorites'
              ) {
                const favoriteDifference =
                  favoriteCount(
                    right,
                  )
                  - favoriteCount(
                    left,
                  )

                if (
                  favoriteDifference !== 0
                ) {
                  return favoriteDifference
                }
              }

              if (
                sortMode ===
                'title'
              ) {
                return (
                  left.calculatorTitle
                    .localeCompare(
                      right.calculatorTitle,
                    )
                )
              }

              return (
                new Date(
                  right.updatedAt
                  ?? 0,
                ).getTime()
                - new Date(
                    left.updatedAt
                    ?? 0,
                  ).getTime()
              )
            },
          )
      },
      [
        notebooks,
        query,
        category,
        favoritesOnly,
        sortMode,
      ],
    )

  const selectedProjectNotebooks =
    notebooks.filter(
      (record) =>
        projectReportIds.includes(
          record.calculatorId,
        ),
    )

  const totalSnapshots =
    notebooks.reduce(
      (
        total,
        record,
      ) =>
        total
        + snapshotCount(
            record,
          ),
      0,
    )

  const totalFavorites =
    notebooks.reduce(
      (
        total,
        record,
      ) =>
        total
        + favoriteCount(
            record,
          ),
      0,
    )

  function loadProjectSet(
    projectSet:
      NotebookProjectSet,
  ) {
    const availableIds =
      new Set(
        notebooks.map(
          (notebook) =>
            notebook.calculatorId,
        ),
      )

    const validIds =
      projectSet.calculatorIds.filter(
        (calculatorId) =>
          availableIds.has(
            calculatorId,
          ),
      )

    setProjectReportIds(
      validIds,
    )

    setProjectReportTitle(
      projectSet.reportTitle,
    )

    setStatus(
      `Project set "${projectSet.name}" loaded (${validIds.length} calculators).`,
    )
  }

  function toggleProjectReportNotebook(
    calculatorId: string,
  ) {
    setProjectReportIds(
      (current) =>
        current.includes(
          calculatorId,
        )
          ? current.filter(
              (id) =>
                id !==
                calculatorId,
            )
          : [
              ...current,
              calculatorId,
            ],
    )
  }

  function selectVisibleForProjectReport() {
    setProjectReportIds(
      (current) =>
        Array.from(
          new Set(
            [
              ...current,
              ...visibleNotebooks.map(
                (record) =>
                  record.calculatorId,
              ),
            ],
          ),
        ),
    )
  }

  function clearProjectReportSelection() {
    setProjectReportIds(
      [],
    )
  }

  async function exportProjectReport() {
    if (
      selectedProjectNotebooks.length === 0
    ) {
      setStatus(
        'Select at least one notebook for the project report.',
      )
      return
    }

    try {
      const {
        downloadProjectEngineeringReport,
      } = await import(
        '../lib/scientificNotebookProjectReport'
      )

      downloadProjectEngineeringReport({
        title:
          projectReportTitle,
        notebooks:
          selectedProjectNotebooks,
      })

      setStatus(
        `Project report exported (${selectedProjectNotebooks.length} calculators).`,
      )
    } catch {
      setStatus(
        'Project report export failed.',
      )
    }
  }

  async function printProjectReport() {
    if (
      selectedProjectNotebooks.length === 0
    ) {
      setStatus(
        'Select at least one notebook for the project report.',
      )
      return
    }

    try {
      const {
        printProjectEngineeringReport,
      } = await import(
        '../lib/scientificNotebookProjectReport'
      )

      const opened =
        printProjectEngineeringReport({
          title:
            projectReportTitle,
          notebooks:
            selectedProjectNotebooks,
        })

      setStatus(
        opened
          ? `Print-ready project report opened (${selectedProjectNotebooks.length} calculators).`
          : 'Print preview was blocked by the browser.',
      )
    } catch {
      setStatus(
        'Project report preview failed.',
      )
    }
  }

  function exportArchive() {
    const archive = {
      version: 1,
      exportedAt:
        new Date()
          .toISOString(),
      notebooks:
        store,
    }

    const blob =
      new Blob(
        [
          JSON.stringify(
            archive,
            null,
            2,
          ),
        ],
        {
          type:
            'application/json;charset=utf-8',
        },
      )

    const url =
      URL.createObjectURL(
        blob,
      )

    const anchor =
      document.createElement(
        'a',
      )

    anchor.href = url
    anchor.download =
      `cheme-toolkit-notebook-library-${
        createSlug(
          new Date()
            .toISOString()
            .slice(
              0,
              10,
            ),
        )
      }.json`

    document.body.appendChild(
      anchor,
    )

    anchor.click()
    anchor.remove()

    URL.revokeObjectURL(
      url,
    )

    setStatus(
      'Notebook library exported.',
    )
  }

  async function importArchive(
    file: File,
  ) {
    try {
      const archive =
        parseArchive(
          await file.text(),
        )

      const importedCount =
        Object.keys(
          archive.notebooks,
        ).length

      if (
        importMode ===
        'replace'
        && !window.confirm(
          'Replace the entire local Notebook Library with this backup?',
        )
      ) {
        setStatus(
          'Restore cancelled.',
        )
        return
      }

      const nextStore =
        importMode ===
          'replace'
          ? archive.notebooks
          : mergeNotebookStores(
              readStore(),
              archive.notebooks,
            )

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          nextStore,
        ),
      )

      setStore(
        nextStore,
      )

      setStatus(
        importMode ===
          'replace'
          ? `Library restored from backup (${importedCount} notebooks).`
          : `Backup merged (${importedCount} notebooks imported).`,
      )
    } catch {
      setStatus(
        'Import failed. Choose a valid ChemE Toolkit Notebook Library JSON backup.',
      )
    } finally {
      if (
        importInputRef.current
      ) {
        importInputRef.current.value =
          ''
      }
    }
  }

  function openImportPicker() {
    importInputRef.current
      ?.click()
  }

  function clearFilters() {
    setQuery('')
    setCategory('all')
    setFavoritesOnly(false)
    setSortMode(
      'updated',
    )
  }

  return (
    <aside
      id="scientific-notebook-library"
      className="scientific-notebook-library"
      aria-label="Scientific Notebook Library"
    >
      <header className="scientific-notebook-library-header">
        <div>
          <span>
            Scientific Notebook
          </span>

          <h3>
            Notebook Library
          </h3>

          <p>
            Search engineering notes and calculation snapshots across your calculator workspace.
          </p>
        </div>

        <button
          type="button"
          className="scientific-notebook-library-close"
          aria-label="Close Notebook Library"
          onClick={onClose}
        >
          ×
        </button>
      </header>

      <section
        className="scientific-notebook-library-stats"
        aria-label="Notebook Library statistics"
      >
        <article>
          <strong>
            {notebooks.length}
          </strong>

          <span>
            Notebooks
          </span>
        </article>

        <article>
          <strong>
            {totalSnapshots}
          </strong>

          <span>
            Snapshots
          </span>
        </article>

        <article>
          <strong>
            {totalFavorites}
          </strong>

          <span>
            Favorites
          </span>
        </article>

        <article>
          <strong>
            {visibleNotebooks.length}
          </strong>

          <span>
            Visible
          </span>
        </article>
      </section>

      <section
        className="scientific-notebook-project-builder"
        aria-label="Engineering project report builder"
      >
        <header>
          <div>
            <span>
              Project Report Builder
            </span>

            <strong>
              {selectedProjectNotebooks.length}
              {' '}
              selected
            </strong>
          </div>

          <p>
            Combine multiple calculator notebooks into one engineering project report.
          </p>
        </header>

        <div className="scientific-notebook-project-builder-controls">
          <label>
            <span>
              Project title
            </span>

            <input
              type="text"
              value={
                projectReportTitle
              }
              onChange={(event) =>
                setProjectReportTitle(
                  event.target.value,
                )
              }
              placeholder="Engineering Project Report"
            />
          </label>

          <div>
            <button
              type="button"
              onClick={
                selectVisibleForProjectReport
              }
              disabled={
                visibleNotebooks.length === 0
              }
            >
              Select visible
            </button>

            <button
              type="button"
              onClick={
                clearProjectReportSelection
              }
              disabled={
                projectReportIds.length === 0
              }
            >
              Clear selection
            </button>

            <button
              type="button"
              onClick={() => {
                void exportProjectReport()
              }}
              disabled={
                selectedProjectNotebooks.length === 0
              }
            >
              Export project .md
            </button>

            <button
              type="button"
              onClick={() => {
                void printProjectReport()
              }}
              disabled={
                selectedProjectNotebooks.length === 0
              }
            >
              Print project report
            </button>
          </div>
        </div>
      </section>

      <ScientificNotebookProjectSets
        projectSets={
          projectSets
        }
        currentTitle={
          projectReportTitle
        }
        currentCalculatorIds={
          projectReportIds
        }
        onProjectSetsChange={
          setProjectSets
        }
        onLoad={
          loadProjectSet
        }
      />

      <section
        className="scientific-notebook-library-controls"
        aria-label="Notebook Library filters"
      >
        <label className="scientific-notebook-library-search">
          <span>
            Search
          </span>

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value,
              )
            }
            placeholder="Calculator, note or snapshot name…"
          />
        </label>

        <label>
          <span>
            Category
          </span>

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value,
              )
            }
          >
            <option value="all">
              All categories
            </option>

            {categories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
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
                event.target.value as SortMode,
              )
            }
          >
            <option value="updated">
              Recently updated
            </option>

            <option value="favorites">
              Most favorites
            </option>

            <option value="title">
              Calculator title
            </option>
          </select>
        </label>

        <label className="scientific-notebook-library-favorite-filter">
          <input
            type="checkbox"
            checked={
              favoritesOnly
            }
            onChange={(event) =>
              setFavoritesOnly(
                event.target.checked,
              )
            }
          />

          <span>
            Favorites only
          </span>
        </label>
      </section>

      <div className="scientific-notebook-library-toolbar">
        <span
          role="status"
          aria-live="polite"
        >
          {status}
        </span>

        <div>
          <label className="scientific-notebook-library-import-mode">
            <span>
              Restore mode
            </span>

            <select
              value={importMode}
              onChange={(event) =>
                setImportMode(
                  event.target.value as ImportMode,
                )
              }
            >
              <option value="merge">
                Merge backup
              </option>

              <option value="replace">
                Replace library
              </option>
            </select>
          </label>

          <input
            ref={importInputRef}
            className="scientific-notebook-library-file-input"
            type="file"
            accept=".json,application/json"
            aria-label="Import Notebook Library JSON backup"
            onChange={(event) => {
              const file =
                event.target.files?.[0]

              if (file) {
                void importArchive(
                  file,
                )
              }
            }}
          />

          <button
            type="button"
            onClick={
              openImportPicker
            }
          >
            Import library JSON
          </button>

          <button
            type="button"
            onClick={
              clearFilters
            }
          >
            Clear filters
          </button>

          <button
            type="button"
            onClick={
              exportArchive
            }
            disabled={
              notebooks.length === 0
            }
          >
            Export library JSON
          </button>
        </div>
      </div>

      {visibleNotebooks.length > 0 ? (
        <div className="scientific-notebook-library-grid">
          {visibleNotebooks.map(
            (record) => {
              const snapshots =
                snapshotCount(
                  record,
                )

              const favorites =
                favoriteCount(
                  record,
                )

              return (
                <article
                  key={
                    record.calculatorId
                  }
                  className="scientific-notebook-library-card"
                >
                  <header>
                    <div>
                      <span>
                        {record.category}
                      </span>

                      <h4>
                        {record.calculatorTitle}
                      </h4>
                    </div>

                    {favorites > 0 ? (
                      <strong
                        title={`${favorites} favorite snapshots`}
                      >
                        ★ {favorites}
                      </strong>
                    ) : null}
                  </header>

                  <p>
                    {notePreview(
                      record,
                    )}
                  </p>

                  <dl>
                    <div>
                      <dt>
                        Snapshots
                      </dt>

                      <dd>
                        {snapshots}
                      </dd>
                    </div>

                    <div>
                      <dt>
                        Updated
                      </dt>

                      <dd>
                        {record.updatedAt
                          ? new Date(
                              record.updatedAt,
                            ).toLocaleDateString()
                          : '—'}
                      </dd>
                    </div>
                  </dl>

                  <footer>
                    <button
                      type="button"
                      aria-pressed={
                        projectReportIds.includes(
                          record.calculatorId,
                        )
                      }
                      onClick={() =>
                        toggleProjectReportNotebook(
                          record.calculatorId,
                        )
                      }
                    >
                      {projectReportIds.includes(
                        record.calculatorId,
                      )
                        ? '✓ In project report'
                        : 'Add to project report'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onOpenCalculator(
                          record.calculatorId,
                          false,
                        )
                      }
                    >
                      Open calculator
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onOpenCalculator(
                          record.calculatorId,
                          true,
                        )
                      }
                    >
                      Open notebook
                    </button>


                    <button
                      type="button"
                      onClick={() => {
                        downloadNotebookEngineeringReport(
                          record,
                        )

                        setStatus(
                          `Engineering report exported for ${record.calculatorTitle}.`,
                        )
                      }}
                    >
                      Export report .md
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const opened =
                          printNotebookEngineeringReport(
                            record,
                          )

                        setStatus(
                          opened
                            ? `Print-ready report opened for ${record.calculatorTitle}.`
                            : 'Print preview was blocked by the browser.',
                        )
                      }}
                    >
                      Print report
                    </button>
                  </footer>
                </article>
              )
            },
          )}
        </div>
      ) : (
        <div className="scientific-notebook-library-empty">
          <strong>
            No notebooks match this view.
          </strong>

          <p>
            Capture a calculation or save engineering notes, then they will appear here automatically.
          </p>
        </div>
      )}
    </aside>
  )
}
