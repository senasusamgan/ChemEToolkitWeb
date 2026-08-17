import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import '../styles/scientific-notebook-library.css'

const STORAGE_KEY =
  'cheme-toolkit.scientific-notebook.v1'

interface SnapshotRecord {
  id?: string
  name?: string
  favorite?: boolean
  capturedAt?: string
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

  useEffect(() => {
    const refresh =
      () => {
        setStore(
          readStore(),
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
