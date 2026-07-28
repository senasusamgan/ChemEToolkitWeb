import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import '../styles/saved-comparisons.css'

const COMPARISONS_KEY =
  'cheme-toolkit.saved-comparisons.v1'

const COMPARISONS_CHANGE_EVENT =
  'cheme-toolkit:saved-comparisons-changed'

const PROJECTS_KEY =
  'cheme-toolkit.project-workspaces.v1'

const PROJECTS_CHANGE_EVENT =
  'cheme-toolkit:project-workspaces-changed'

const WORKSPACE_TARGET_EVENT =
  'cheme-toolkit:workspace-open-target'

const PENDING_WORKSPACE_TARGET_KEY =
  'cheme-toolkit.pending-workspace-target.v1'

interface SavedCalculation {
  id: string
  name: string
  calculatorId: string
  calculatorTitle: string
  category: string
  createdAt: string
  inputs: Array<{
    label: string
    value: string
    rawValue?: string
    unit: string
  }>
  results: Array<{
    label: string
    value: string
    unit: string
  }>
  formula: string
  reference: string
}

interface ComparisonRow {
  key: string
  label: string
  unit: string
  values: Record<string, string>
}

interface DifferenceItem {
  calculationId: string
  calculationName: string
  value: string
  difference: number | null
  percentage: number | null
}

interface DifferenceRow {
  key: string
  label: string
  unit: string
  baselineValue: string
  comparisons: DifferenceItem[]
}

interface SavedComparison {
  id: string
  name: string
  calculatorId: string
  calculatorTitle: string
  category: string
  createdAt: string
  baselineCalculationId: string
  calculationIds: string[]
  calculationSnapshots: SavedCalculation[]
  inputRows: ComparisonRow[]
  resultRows: ComparisonRow[]
  differenceRows: DifferenceRow[]
}

interface ProjectWorkspace {
  id: string
  name: string
  description: string
  notes: string
  createdAt: string
  updatedAt: string
  calculationIds: string[]
  comparisonIds?: string[]
}

type Status =
  | 'idle'
  | 'deleted'
  | 'assigned'
  | 'removed'
  | 'csv'
  | 'print'
  | 'error'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function escapeCsv(value: string): string {
  return `"${value.replaceAll('"', '""')}"`
}

function createSlug(value: string): string {
  return value
    .toLocaleLowerCase('en-US')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function formatNumber(
  value: number | null,
): string {
  if (value === null) {
    return 'Not available'
  }

  return new Intl.NumberFormat(
    'tr-TR',
    {
      maximumSignificantDigits: 9,
    },
  ).format(value)
}

function readComparisons():
  SavedComparison[] {
  try {
    const raw =
      localStorage.getItem(
        COMPARISONS_KEY,
      )

    if (!raw) {
      return []
    }

    const parsed: unknown =
      JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(
      (
        item,
      ): item is SavedComparison => {
        if (
          typeof item !== 'object' ||
          item === null
        ) {
          return false
        }

        const candidate =
          item as Partial<SavedComparison>

        return (
          typeof candidate.id ===
            'string' &&
          typeof candidate.name ===
            'string' &&
          typeof candidate.calculatorId ===
            'string' &&
          typeof candidate.calculatorTitle ===
            'string' &&
          typeof candidate.category ===
            'string' &&
          typeof candidate.createdAt ===
            'string' &&
          Array.isArray(
            candidate.calculationSnapshots,
          ) &&
          Array.isArray(
            candidate.inputRows,
          ) &&
          Array.isArray(
            candidate.resultRows,
          ) &&
          Array.isArray(
            candidate.differenceRows,
          )
        )
      },
    )
  } catch {
    return []
  }
}

function readProjects():
  ProjectWorkspace[] {
  try {
    const raw =
      localStorage.getItem(
        PROJECTS_KEY,
      )

    if (!raw) {
      return []
    }

    const parsed: unknown =
      JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(
      (
        item,
      ): item is ProjectWorkspace => {
        if (
          typeof item !== 'object' ||
          item === null
        ) {
          return false
        }

        const candidate =
          item as Partial<ProjectWorkspace>

        return (
          typeof candidate.id ===
            'string' &&
          typeof candidate.name ===
            'string' &&
          Array.isArray(
            candidate.calculationIds,
          )
        )
      },
    )
  } catch {
    return []
  }
}

function downloadComparisonCsv(
  comparison: SavedComparison,
) {
  const calculations =
    comparison.calculationSnapshots

  const header = [
    'Variable',
    'Unit',
    ...calculations.map(
      (calculation) =>
        calculation.name,
    ),
  ]

  const rows: string[][] = [
    [
      'ChemE Toolkit Saved Comparison',
      '',
    ],
    [
      'Comparison name',
      comparison.name,
    ],
    [
      'Calculator',
      comparison.calculatorTitle,
    ],
    [
      'Category',
      comparison.category,
    ],
    [
      'Saved',
      new Date(
        comparison.createdAt,
      ).toLocaleString('tr-TR'),
    ],
    [],
    ['INPUTS'],
    header,
    ...comparison.inputRows.map(
      (row) => [
        row.label,
        row.unit,
        ...calculations.map(
          (calculation) =>
            row.values[
              calculation.id
            ] ?? '—',
        ),
      ],
    ),
    [],
    ['RESULTS'],
    header,
    ...comparison.resultRows.map(
      (row) => [
        row.label,
        row.unit,
        ...calculations.map(
          (calculation) =>
            row.values[
              calculation.id
            ] ?? '—',
        ),
      ],
    ),
    [],
    ['DIFFERENCES FROM BASELINE'],
    [
      'Result',
      'Unit',
      'Comparison',
      'Value',
      'Difference',
      'Percentage change',
    ],
    ...comparison.differenceRows.flatMap(
      (row) =>
        row.comparisons.map(
          (item) => [
            row.label,
            row.unit,
            item.calculationName,
            item.value,
            formatNumber(
              item.difference,
            ),
            item.percentage === null
              ? 'Not available'
              : `${formatNumber(
                  item.percentage,
                )}%`,
          ],
        ),
    ),
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

  link.href = url
  link.download =
    `${createSlug(
      comparison.name,
    ) || 'saved-comparison'}.csv`

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

function createTableMarkup(
  title: string,
  rows: ComparisonRow[],
  calculations: SavedCalculation[],
): string {
  return `
    <section>
      <h2>${escapeHtml(title)}</h2>

      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Unit</th>

            ${calculations
              .map(
                (calculation) => `
                  <th>
                    ${escapeHtml(
                      calculation.name,
                    )}
                  </th>
                `,
              )
              .join('')}
          </tr>
        </thead>

        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td>
                    ${escapeHtml(
                      row.label,
                    )}
                  </td>

                  <td>
                    ${escapeHtml(
                      row.unit,
                    )}
                  </td>

                  ${calculations
                    .map(
                      (calculation) => `
                        <td>
                          ${escapeHtml(
                            row.values[
                              calculation.id
                            ] ?? '—',
                          )}
                        </td>
                      `,
                    )
                    .join('')}
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    </section>
  `
}

function printComparison(
  comparison: SavedComparison,
): boolean {
  const reportWindow =
    window.open('', '_blank')

  if (!reportWindow) {
    return false
  }

  const calculations =
    comparison.calculationSnapshots

  const differenceMarkup =
    comparison.differenceRows
      .map(
        (row) => `
          <article>
            <h3>
              ${escapeHtml(row.label)}
              <small>
                ${escapeHtml(row.unit)}
              </small>
            </h3>

            <p>
              <strong>Baseline:</strong>
              ${escapeHtml(
                row.baselineValue,
              )}
            </p>

            ${row.comparisons
              .map(
                (item) => `
                  <div>
                    <strong>
                      ${escapeHtml(
                        item.calculationName,
                      )}
                    </strong>

                    <span>
                      Difference:
                      ${escapeHtml(
                        formatNumber(
                          item.difference,
                        ),
                      )}
                    </span>

                    <span>
                      Change:
                      ${
                        item.percentage ===
                        null
                          ? 'Not available'
                          : `${escapeHtml(
                              formatNumber(
                                item.percentage,
                              ),
                            )}%`
                      }
                    </span>
                  </div>
                `,
              )
              .join('')}
          </article>
        `,
      )
      .join('')

  reportWindow.document.write(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />

        <title>
          ${escapeHtml(
            comparison.name,
          )}
        </title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            max-width: 1120px;
            margin: 0 auto;
            padding: 40px;
            color: #0b3556;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          header {
            padding-bottom: 22px;
            border-bottom:
              3px solid #049b96;
          }

          .eyebrow {
            margin: 0 0 8px;
            color: #007b78;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }

          h1 {
            margin: 0;
            font-family:
              Georgia,
              serif;
            font-size: 36px;
          }

          .meta {
            margin-top: 15px;
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 8px;
            color: #647a8e;
            font-size: 12px;
          }

          section {
            margin-top: 28px;
            overflow-x: auto;
          }

          h2 {
            color: #007b78;
            font-size: 13px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          table {
            width: 100%;
            min-width: 720px;
            border-collapse: collapse;
          }

          th,
          td {
            padding: 10px;
            border:
              1px solid #d9d0bd;
            text-align: left;
          }

          th {
            background: #e4f3f0;
            font-size: 11px;
          }

          .difference-grid {
            display: grid;
            grid-template-columns:
              repeat(
                auto-fit,
                minmax(250px, 1fr)
              );
            gap: 12px;
          }

          .difference-grid article {
            padding: 14px;
            border:
              1px solid #d9d0bd;
            border-radius: 8px;
          }

          .difference-grid h3 {
            margin: 0;
            font-size: 15px;
          }

          .difference-grid h3 small {
            margin-left: 6px;
            color: #647a8e;
          }

          .difference-grid article div {
            margin-top: 9px;
            padding-top: 9px;
            display: grid;
            gap: 4px;
            border-top:
              1px solid #d9d0bd;
            font-size: 12px;
          }

          footer {
            margin-top: 34px;
            color: #647a8e;
            font-size: 11px;
          }

          @media print {
            body {
              max-width: none;
              padding: 13mm;
            }

            @page {
              size: A4 landscape;
              margin: 0;
            }
          }
        </style>
      </head>

      <body>
        <header>
          <p class="eyebrow">
            ChemE Toolkit · Saved comparison
          </p>

          <h1>
            ${escapeHtml(
              comparison.name,
            )}
          </h1>

          <div class="meta">
            <span>
              <strong>Calculator:</strong>
              ${escapeHtml(
                comparison.calculatorTitle,
              )}
            </span>

            <span>
              <strong>Category:</strong>
              ${escapeHtml(
                comparison.category,
              )}
            </span>

            <span>
              <strong>Calculations:</strong>
              ${calculations.length}
            </span>

            <span>
              <strong>Saved:</strong>
              ${escapeHtml(
                new Date(
                  comparison.createdAt,
                ).toLocaleString(
                  'tr-TR',
                ),
              )}
            </span>
          </div>
        </header>

        ${createTableMarkup(
          'Input comparison',
          comparison.inputRows,
          calculations,
        )}

        ${createTableMarkup(
          'Result comparison',
          comparison.resultRows,
          calculations,
        )}

        <section>
          <h2>
            Difference from baseline
          </h2>

          <div class="difference-grid">
            ${differenceMarkup}
          </div>
        </section>

        <footer>
          This saved comparison contains a
          snapshot of its source calculations.
          Final engineering decisions must be
          independently verified.
        </footer>

        <script>
          window.addEventListener(
            'load',
            () => {
              window.setTimeout(
                () => window.print(),
                250,
              )
            },
          )
        </script>
      </body>
    </html>
  `)

  reportWindow.document.close()

  return true
}

export function SavedComparisonsPanel() {
  const [
    comparisons,
    setComparisons,
  ] = useState<SavedComparison[]>(
    readComparisons,
  )

  const [
    projects,
    setProjects,
  ] = useState<ProjectWorkspace[]>(
    readProjects,
  )

  const [
    activeComparisonId,
    setActiveComparisonId,
  ] = useState('')

  const [
    isExpanded,
    setIsExpanded,
  ] = useState(false)

  const [status, setStatus] =
    useState<Status>('idle')

  const activeComparison =
    useMemo(
      () =>
        comparisons.find(
          (comparison) =>
            comparison.id ===
            activeComparisonId,
        ) ?? null,
      [
        comparisons,
        activeComparisonId,
      ],
    )

  const projectAssignmentMap =
    useMemo(() => {
      const assignments =
        new Map<string, string>()

      projects.forEach((project) => {
        ;(
          project.comparisonIds ??
          []
        ).forEach(
          (comparisonId) => {
            assignments.set(
              comparisonId,
              project.id,
            )
          },
        )
      })

      return assignments
    }, [projects])

  useEffect(() => {
    function refreshComparisons() {
      setComparisons(
        readComparisons(),
      )
    }

    function refreshProjects() {
      setProjects(
        readProjects(),
      )
    }

    window.addEventListener(
      COMPARISONS_CHANGE_EVENT,
      refreshComparisons,
    )

    window.addEventListener(
      PROJECTS_CHANGE_EVENT,
      refreshProjects,
    )

    window.addEventListener(
      'storage',
      refreshComparisons,
    )

    window.addEventListener(
      'storage',
      refreshProjects,
    )

    window.addEventListener(
      'focus',
      refreshComparisons,
    )

    window.addEventListener(
      'focus',
      refreshProjects,
    )

    return () => {
      window.removeEventListener(
        COMPARISONS_CHANGE_EVENT,
        refreshComparisons,
      )

      window.removeEventListener(
        PROJECTS_CHANGE_EVENT,
        refreshProjects,
      )

      window.removeEventListener(
        'storage',
        refreshComparisons,
      )

      window.removeEventListener(
        'storage',
        refreshProjects,
      )

      window.removeEventListener(
        'focus',
        refreshComparisons,
      )

      window.removeEventListener(
        'focus',
        refreshProjects,
      )
    }
  }, [])

  useEffect(() => {
    function handleWorkspaceTarget(
      event: Event,
    ) {
      const detail =
        (
          event as CustomEvent<{
            type?: string
            id?: string
          }>
        ).detail

      if (
        detail?.type !==
          'comparison' ||
        typeof detail.id !==
          'string' ||
        !comparisons.some(
          (comparison) =>
            comparison.id ===
            detail.id,
        )
      ) {
        return
      }

      setIsExpanded(true)
      setActiveComparisonId(
        detail.id,
      )

      sessionStorage.removeItem(
        PENDING_WORKSPACE_TARGET_KEY,
      )

      window.setTimeout(() => {
        const element =
          document.getElementById(
            `saved-comparison-${detail.id}`,
          )

        element?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })

        element?.animate(
          [
            {
              boxShadow:
                '0 0 0 0 rgba(7, 156, 153, 0)',
            },
            {
              boxShadow:
                '0 0 0 5px rgba(7, 156, 153, 0.28)',
            },
            {
              boxShadow:
                '0 0 0 0 rgba(7, 156, 153, 0)',
            },
          ],
          {
            duration: 1800,
            easing: 'ease-out',
          },
        )
      }, 300)
    }

    window.addEventListener(
      WORKSPACE_TARGET_EVENT,
      handleWorkspaceTarget,
    )

    return () => {
      window.removeEventListener(
        WORKSPACE_TARGET_EVENT,
        handleWorkspaceTarget,
      )
    }
  }, [comparisons])

  useEffect(() => {
    if (status === 'idle') {
      return
    }

    const timer =
      window.setTimeout(
        () => setStatus('idle'),
        2600,
      )

    return () =>
      window.clearTimeout(timer)
  }, [status])

  function handleDelete(
    comparisonId: string,
  ) {
    const confirmed =
      window.confirm(
        'Delete this saved comparison?',
      )

    if (!confirmed) {
      return
    }

    const nextComparisons =
      comparisons.filter(
        (comparison) =>
          comparison.id !==
          comparisonId,
      )

    setComparisons(
      nextComparisons,
    )

    localStorage.setItem(
      COMPARISONS_KEY,
      JSON.stringify(
        nextComparisons,
      ),
    )

    const nextProjects =
      projects.map((project) => ({
        ...project,
        comparisonIds:
          (
            project.comparisonIds ??
            []
          ).filter(
            (id) =>
              id !== comparisonId,
          ),
      }))

    setProjects(nextProjects)

    localStorage.setItem(
      PROJECTS_KEY,
      JSON.stringify(nextProjects),
    )

    if (
      activeComparisonId ===
      comparisonId
    ) {
      setActiveComparisonId('')
    }

    window.dispatchEvent(
      new Event(
        COMPARISONS_CHANGE_EVENT,
      ),
    )

    window.dispatchEvent(
      new Event(
        PROJECTS_CHANGE_EVENT,
      ),
    )

    setStatus('deleted')
  }

  function handleProjectAssignment(
    comparisonId: string,
    projectId: string,
  ) {
    const nextProjects =
      projects.map((project) => {
        const comparisonIds =
          (
            project.comparisonIds ??
            []
          ).filter(
            (id) =>
              id !== comparisonId,
          )

        if (
          project.id !== projectId
        ) {
          return {
            ...project,
            comparisonIds,
          }
        }

        return {
          ...project,
          comparisonIds: [
            ...comparisonIds,
            comparisonId,
          ],
          updatedAt:
            new Date().toISOString(),
        }
      })

    setProjects(nextProjects)

    localStorage.setItem(
      PROJECTS_KEY,
      JSON.stringify(nextProjects),
    )

    window.dispatchEvent(
      new Event(
        PROJECTS_CHANGE_EVENT,
      ),
    )

    setStatus(
      projectId
        ? 'assigned'
        : 'removed',
    )
  }

  function handleCsv(
    comparison: SavedComparison,
  ) {
    downloadComparisonCsv(
      comparison,
    )

    setStatus('csv')
  }

  function handlePrint(
    comparison: SavedComparison,
  ) {
    const opened =
      printComparison(comparison)

    setStatus(
      opened
        ? 'print'
        : 'error',
    )
  }

  return (
    <section
      className="saved-comparisons-panel"
      aria-label="Saved comparisons"
    >
      <div className="saved-comparisons-header">
        <div>
          <span>
            Persistent engineering files
          </span>

          <h3>
            Saved comparisons
          </h3>

          <p>
            Stored comparison snapshots stay
            available after navigation and can
            be attached directly to projects.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setIsExpanded(
              (current) =>
                !current,
            )
          }
          aria-expanded={
            isExpanded
          }
        >
          {isExpanded
            ? 'Hide saved comparisons'
            : `Open saved comparisons (${comparisons.length})`}
        </button>
      </div>

      <p
        className="saved-comparisons-status"
        aria-live="polite"
      >
        {status === 'deleted'
          ? 'Saved comparison deleted.'
          : null}

        {status === 'assigned'
          ? 'Comparison added to the selected project.'
          : null}

        {status === 'removed'
          ? 'Comparison removed from its project.'
          : null}

        {status === 'csv'
          ? 'Comparison CSV downloaded.'
          : null}

        {status === 'print'
          ? 'Printable comparison report opened.'
          : null}

        {status === 'error'
          ? 'The report window was blocked by the browser.'
          : null}
      </p>

      {isExpanded ? (
        <div className="saved-comparisons-content">
          {comparisons.length === 0 ? (
            <div className="saved-comparisons-empty">
              <strong>
                No saved comparisons yet
              </strong>

              <p>
                Select at least two calculations
                in the comparison panel and save
                the completed comparison.
              </p>
            </div>
          ) : (
            <div className="saved-comparisons-list">
              {comparisons.map(
                (comparison) => {
                  const assignedProjectId =
                    projectAssignmentMap.get(
                      comparison.id,
                    ) ?? ''

                  return (
                    <article
                      id={`saved-comparison-${comparison.id}`}
                      key={
                        comparison.id
                      }
                      className={
                        comparison.id ===
                        activeComparisonId
                          ? 'is-open'
                          : ''
                      }
                    >
                      <div className="saved-comparison-main">
                        <span>
                          {
                            comparison.category
                          }
                        </span>

                        <h4>
                          {
                            comparison.name
                          }
                        </h4>

                        <p>
                          {
                            comparison.calculatorTitle
                          }
                        </p>

                        <small>
                          {
                            comparison
                              .calculationSnapshots
                              .length
                          }{' '}
                          calculations ·{' '}
                          {new Intl.DateTimeFormat(
                            'tr-TR',
                            {
                              dateStyle:
                                'medium',
                              timeStyle:
                                'short',
                            },
                          ).format(
                            new Date(
                              comparison.createdAt,
                            ),
                          )}
                        </small>
                      </div>

                      <label className="saved-comparison-project">
                        <span>
                          Project
                        </span>

                        <select
                          value={
                            assignedProjectId
                          }
                          onChange={(
                            event,
                          ) =>
                            handleProjectAssignment(
                              comparison.id,
                              event.target.value,
                            )
                          }
                        >
                          <option value="">
                            Not assigned
                          </option>

                          {projects.map(
                            (project) => (
                              <option
                                key={
                                  project.id
                                }
                                value={
                                  project.id
                                }
                              >
                                {
                                  project.name
                                }
                              </option>
                            ),
                          )}
                        </select>
                      </label>

                      <div className="saved-comparison-actions">
                        <button
                          type="button"
                          className="saved-comparison-open"
                          onClick={() =>
                            setActiveComparisonId(
                              comparison.id ===
                              activeComparisonId
                                ? ''
                                : comparison.id,
                            )
                          }
                        >
                          {comparison.id ===
                          activeComparisonId
                            ? 'Close snapshot'
                            : 'Open snapshot'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleCsv(
                              comparison,
                            )
                          }
                        >
                          CSV
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handlePrint(
                              comparison,
                            )
                          }
                        >
                          Print / PDF
                        </button>

                        <button
                          type="button"
                          className="saved-comparison-delete"
                          onClick={() =>
                            handleDelete(
                              comparison.id,
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  )
                },
              )}
            </div>
          )}

          {activeComparison ? (
            <div className="saved-comparison-snapshot">
              <div className="saved-snapshot-heading">
                <div>
                  <span>
                    Saved snapshot
                  </span>

                  <h4>
                    {
                      activeComparison.name
                    }
                  </h4>
                </div>

                <strong>
                  Baseline:{' '}
                  {
                    activeComparison
                      .calculationSnapshots[0]
                      ?.name
                  }
                </strong>
              </div>

              <div className="saved-snapshot-table">
                <h5>
                  Input comparison
                </h5>

                <div>
                  <table>
                    <thead>
                      <tr>
                        <th>
                          Variable
                        </th>

                        <th>
                          Unit
                        </th>

                        {activeComparison
                          .calculationSnapshots
                          .map(
                            (
                              calculation,
                            ) => (
                              <th
                                key={
                                  calculation.id
                                }
                              >
                                {
                                  calculation.name
                                }
                              </th>
                            ),
                          )}
                      </tr>
                    </thead>

                    <tbody>
                      {activeComparison
                        .inputRows
                        .map((row) => (
                          <tr
                            key={
                              row.key
                            }
                          >
                            <td>
                              {
                                row.label
                              }
                            </td>

                            <td>
                              {
                                row.unit ||
                                '—'
                              }
                            </td>

                            {activeComparison
                              .calculationSnapshots
                              .map(
                                (
                                  calculation,
                                ) => (
                                  <td
                                    key={
                                      calculation.id
                                    }
                                  >
                                    {row
                                      .values[
                                      calculation
                                        .id
                                    ] ??
                                      '—'}
                                  </td>
                                ),
                              )}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="saved-snapshot-table">
                <h5>
                  Result comparison
                </h5>

                <div>
                  <table>
                    <thead>
                      <tr>
                        <th>
                          Result
                        </th>

                        <th>
                          Unit
                        </th>

                        {activeComparison
                          .calculationSnapshots
                          .map(
                            (
                              calculation,
                            ) => (
                              <th
                                key={
                                  calculation.id
                                }
                              >
                                {
                                  calculation.name
                                }
                              </th>
                            ),
                          )}
                      </tr>
                    </thead>

                    <tbody>
                      {activeComparison
                        .resultRows
                        .map((row) => (
                          <tr
                            key={
                              row.key
                            }
                          >
                            <td>
                              {
                                row.label
                              }
                            </td>

                            <td>
                              {
                                row.unit ||
                                '—'
                              }
                            </td>

                            {activeComparison
                              .calculationSnapshots
                              .map(
                                (
                                  calculation,
                                ) => (
                                  <td
                                    key={
                                      calculation.id
                                    }
                                  >
                                    {row
                                      .values[
                                      calculation
                                        .id
                                    ] ??
                                      '—'}
                                  </td>
                                ),
                              )}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="saved-snapshot-differences">
                <h5>
                  Difference from baseline
                </h5>

                <div>
                  {activeComparison
                    .differenceRows
                    .map((row) => (
                      <article
                        key={
                          row.key
                        }
                      >
                        <strong>
                          {
                            row.label
                          }
                        </strong>

                        <small>
                          {
                            row.unit
                          }
                        </small>

                        <p>
                          Baseline:{' '}
                          {
                            row.baselineValue
                          }
                        </p>

                        {row.comparisons.map(
                          (item) => (
                            <div
                              key={
                                item.calculationId
                              }
                            >
                              <strong>
                                {
                                  item.calculationName
                                }
                              </strong>

                              <span>
                                Difference:{' '}
                                {formatNumber(
                                  item.difference,
                                )}
                              </span>

                              <span>
                                Change:{' '}
                                {item.percentage ===
                                null
                                  ? 'Not available'
                                  : `${formatNumber(
                                      item.percentage,
                                    )}%`}
                              </span>
                            </div>
                          ),
                        )}
                      </article>
                    ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
