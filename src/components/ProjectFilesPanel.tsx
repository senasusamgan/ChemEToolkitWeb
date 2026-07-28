import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import '../styles/project-files.css'

const CALCULATIONS_KEY =
  'cheme-toolkit.saved-calculations.v1'

const COMPARISONS_KEY =
  'cheme-toolkit.saved-comparisons.v1'

const PROJECTS_KEY =
  'cheme-toolkit.project-workspaces.v1'

const CALCULATIONS_EVENT =
  'cheme-toolkit:saved-calculations-changed'

const COMPARISONS_EVENT =
  'cheme-toolkit:saved-comparisons-changed'

const PROJECTS_EVENT =
  'cheme-toolkit:project-workspaces-changed'

interface SavedValue {
  label: string
  value: string
  unit: string
}

interface SavedCalculation {
  id: string
  name: string
  calculatorId: string
  calculatorTitle: string
  category: string
  createdAt: string
  inputs: SavedValue[]
  results: SavedValue[]
  formula: string
  reference: string
  tags?: string[]
  notes?: string
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
  tags?: string[]
  description?: string
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
  | 'csv'
  | 'print'
  | 'removed'
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

function normalizeTags(
  value: string[] | undefined,
): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  const seen = new Set<string>()

  return value
    .map((tag) => tag.trim())
    .filter((tag) => {
      if (!tag) {
        return false
      }

      const key =
        tag.toLocaleLowerCase('en-US')

      if (seen.has(key)) {
        return false
      }

      seen.add(key)
      return true
    })
}

function createTagMarkup(
  tags: string[] | undefined,
): string {
  const normalized =
    normalizeTags(tags)

  if (normalized.length === 0) {
    return ''
  }

  return `
    <div class="tag-list">
      ${normalized
        .map(
          (tag) => `
            <span class="tag">
              ${escapeHtml(tag)}
            </span>
          `,
        )
        .join('')}
    </div>
  `
}

function readCalculations():
  SavedCalculation[] {
  try {
    const raw =
      localStorage.getItem(
        CALCULATIONS_KEY,
      )

    const parsed: unknown =
      raw
        ? JSON.parse(raw)
        : []

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(
      (
        item,
      ): item is SavedCalculation => {
        if (
          typeof item !== 'object' ||
          item === null
        ) {
          return false
        }

        const candidate =
          item as Partial<SavedCalculation>

        return (
          typeof candidate.id ===
            'string' &&
          typeof candidate.name ===
            'string' &&
          typeof candidate.calculatorTitle ===
            'string' &&
          Array.isArray(candidate.inputs) &&
          Array.isArray(candidate.results)
        )
      },
    )
  } catch {
    return []
  }
}

function readComparisons():
  SavedComparison[] {
  try {
    const raw =
      localStorage.getItem(
        COMPARISONS_KEY,
      )

    const parsed: unknown =
      raw
        ? JSON.parse(raw)
        : []

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
          typeof candidate.calculatorTitle ===
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

    const parsed: unknown =
      raw
        ? JSON.parse(raw)
        : []

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

function createProjectCsv(
  project: ProjectWorkspace,
  calculations: SavedCalculation[],
  comparisons: SavedComparison[],
): string {
  const rows: string[][] = [
    [
      'ChemE Toolkit Combined Project Report',
      '',
      '',
      '',
    ],
    ['Project', project.name, '', ''],
    [
      'Description',
      project.description ||
        'Not provided',
      '',
      '',
    ],
    [
      'Project notes',
      project.notes ||
        'Not provided',
      '',
      '',
    ],
    [
      'Calculations',
      String(calculations.length),
      '',
      '',
    ],
    [
      'Comparisons',
      String(comparisons.length),
      '',
      '',
    ],
    [
      'Generated',
      new Date().toLocaleString(
        'tr-TR',
      ),
      '',
      '',
    ],
    ['', '', '', ''],
  ]

  calculations.forEach(
    (calculation, index) => {
      rows.push(
        [
          `CALCULATION ${index + 1}`,
          calculation.name,
          '',
          '',
        ],
        [
          'Calculator',
          calculation.calculatorTitle,
          calculation.category,
          '',
        ],
        [
          'Saved',
          new Date(
            calculation.createdAt,
          ).toLocaleString('tr-TR'),
          '',
          '',
        ],
        [
          'Tags',
          normalizeTags(
            calculation.tags,
          ).join(' | ') ||
            'Not provided',
          '',
          '',
        ],
        [
          'Engineering notes',
          calculation.notes ||
            'Not provided',
          '',
          '',
        ],
        [
          'Section',
          'Variable',
          'Value',
          'Unit',
        ],
        ...calculation.inputs.map(
          (input) => [
            'Input',
            input.label,
            input.value,
            input.unit,
          ],
        ),
        ...calculation.results.map(
          (result) => [
            'Result',
            result.label,
            result.value,
            result.unit,
          ],
        ),
        [
          'Formula',
          calculation.formula ||
            'Not provided',
          '',
          '',
        ],
        [
          'Reference',
          calculation.reference ||
            'Not provided',
          '',
          '',
        ],
        ['', '', '', ''],
      )
    },
  )

  comparisons.forEach(
    (comparison, index) => {
      const snapshots =
        comparison.calculationSnapshots

      rows.push(
        [
          `COMPARISON ${index + 1}`,
          comparison.name,
          '',
          '',
        ],
        [
          'Calculator',
          comparison.calculatorTitle,
          comparison.category,
          '',
        ],
        [
          'Saved',
          new Date(
            comparison.createdAt,
          ).toLocaleString('tr-TR'),
          '',
          '',
        ],
        [
          'Tags',
          normalizeTags(
            comparison.tags,
          ).join(' | ') ||
            'Not provided',
          '',
          '',
        ],
        [
          'Comparison description',
          comparison.description ||
            'Not provided',
          '',
          '',
        ],
        [
          'Baseline',
          snapshots[0]?.name ??
            'Not available',
          '',
          '',
        ],
        [
          'Source calculations',
          snapshots
            .map(
              (calculation) =>
                calculation.name,
            )
            .join(' | '),
          '',
          '',
        ],
        ['', '', '', ''],
        [
          'INPUT COMPARISON',
          'Unit',
          ...snapshots.map(
            (calculation) =>
              calculation.name,
          ),
        ],
        ...comparison.inputRows.map(
          (row) => [
            row.label,
            row.unit,
            ...snapshots.map(
              (calculation) =>
                row.values[
                  calculation.id
                ] ?? '—',
            ),
          ],
        ),
        ['', '', '', ''],
        [
          'RESULT COMPARISON',
          'Unit',
          ...snapshots.map(
            (calculation) =>
              calculation.name,
          ),
        ],
        ...comparison.resultRows.map(
          (row) => [
            row.label,
            row.unit,
            ...snapshots.map(
              (calculation) =>
                row.values[
                  calculation.id
                ] ?? '—',
            ),
          ],
        ),
        ['', '', '', ''],
        [
          'DIFFERENCES',
          'Unit',
          'Comparison',
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
                formatNumber(
                  item.difference,
                ),
                item.percentage ===
                null
                  ? 'Not available'
                  : `${formatNumber(
                      item.percentage,
                    )}%`,
              ],
            ),
        ),
        ['', '', '', ''],
      )
    },
  )

  return (
    '\uFEFF' +
    rows
      .map((row) =>
        row
          .map(escapeCsv)
          .join(';'),
      )
      .join('\n')
  )
}

function downloadProjectCsv(
  project: ProjectWorkspace,
  calculations: SavedCalculation[],
  comparisons: SavedComparison[],
) {
  const csv =
    createProjectCsv(
      project,
      calculations,
      comparisons,
    )

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
    `${createSlug(project.name) ||
      'cheme-project'}-combined.csv`

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

function createValueTable(
  title: string,
  values: SavedValue[],
): string {
  const rows =
    values.length === 0
      ? `
        <tr>
          <td colspan="3">
            No saved data.
          </td>
        </tr>
      `
      : values
          .map(
            (value) => `
              <tr>
                <td>
                  ${escapeHtml(
                    value.label,
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    value.value,
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    value.unit,
                  )}
                </td>
              </tr>
            `,
          )
          .join('')

  return `
    <h3>${escapeHtml(title)}</h3>

    <table>
      <thead>
        <tr>
          <th>Variable</th>
          <th>Value</th>
          <th>Unit</th>
        </tr>
      </thead>

      <tbody>
        ${rows}
      </tbody>
    </table>
  `
}

function createComparisonTable(
  title: string,
  rows: ComparisonRow[],
  calculations: SavedCalculation[],
): string {
  return `
    <h3>${escapeHtml(title)}</h3>

    <div class="table-scroll">
      <table class="comparison-table">
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
    </div>
  `
}

function printProjectReport(
  project: ProjectWorkspace,
  calculations: SavedCalculation[],
  comparisons: SavedComparison[],
): boolean {
  const reportWindow =
    window.open('', '_blank')

  if (!reportWindow) {
    return false
  }

  const calculationMarkup =
    calculations.length === 0
      ? `
        <div class="empty">
          No individual calculations assigned.
        </div>
      `
      : calculations
          .map(
            (
              calculation,
              index,
            ) => `
              <section class="file-card">
                <p class="file-type">
                  Calculation ${index + 1}
                </p>

                <h2>
                  ${escapeHtml(
                    calculation.name,
                  )}
                </h2>

                <p class="file-meta">
                  ${escapeHtml(
                    calculation.calculatorTitle,
                  )}
                  ·
                  ${escapeHtml(
                    calculation.category,
                  )}
                  ·
                  ${escapeHtml(
                    new Date(
                      calculation.createdAt,
                    ).toLocaleString(
                      'tr-TR',
                    ),
                  )}
                </p>

                ${createTagMarkup(
                  calculation.tags,
                )}

                ${
                  calculation.notes
                    ? `
                      <div class="note">
                        <strong>
                          Engineering notes
                        </strong>

                        <p>
                          ${escapeHtml(
                            calculation.notes,
                          )}
                        </p>
                      </div>
                    `
                    : ''
                }

                ${createValueTable(
                  'Inputs',
                  calculation.inputs,
                )}

                ${createValueTable(
                  'Results',
                  calculation.results,
                )}

                ${
                  calculation.formula
                    ? `
                      <div class="note">
                        <strong>
                          Formula / model
                        </strong>

                        <p>
                          ${escapeHtml(
                            calculation.formula,
                          )}
                        </p>
                      </div>
                    `
                    : ''
                }

                ${
                  calculation.reference
                    ? `
                      <div class="note">
                        <strong>
                          Reference basis
                        </strong>

                        <p>
                          ${escapeHtml(
                            calculation.reference,
                          )}
                        </p>
                      </div>
                    `
                    : ''
                }
              </section>
            `,
          )
          .join('')

  const comparisonMarkup =
    comparisons.length === 0
      ? `
        <div class="empty">
          No comparison snapshots assigned.
        </div>
      `
      : comparisons
          .map(
            (
              comparison,
              index,
            ) => {
              const snapshots =
                comparison
                  .calculationSnapshots

              const differences =
                comparison
                  .differenceRows
                  .map(
                    (row) => `
                      <article class="difference-card">
                        <h4>
                          ${escapeHtml(
                            row.label,
                          )}

                          <small>
                            ${escapeHtml(
                              row.unit,
                            )}
                          </small>
                        </h4>

                        <p>
                          Baseline:
                          <strong>
                            ${escapeHtml(
                              row.baselineValue,
                            )}
                          </strong>
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

              return `
                <section class="file-card comparison-file">
                  <p class="file-type">
                    Comparison ${index + 1}
                  </p>

                  <h2>
                    ${escapeHtml(
                      comparison.name,
                    )}
                  </h2>

                  <p class="file-meta">
                    ${escapeHtml(
                      comparison.calculatorTitle,
                    )}
                    ·
                    ${escapeHtml(
                      comparison.category,
                    )}
                    ·
                    ${escapeHtml(
                      new Date(
                        comparison.createdAt,
                      ).toLocaleString(
                        'tr-TR',
                      ),
                    )}
                  </p>

                  ${createTagMarkup(
                    comparison.tags,
                  )}

                  ${
                    comparison.description
                      ? `
                        <div class="note">
                          <strong>
                            Comparison description
                          </strong>

                          <p>
                            ${escapeHtml(
                              comparison.description,
                            )}
                          </p>
                        </div>
                      `
                      : ''
                  }

                  <div class="note">
                    <strong>
                      Baseline
                    </strong>

                    <p>
                      ${escapeHtml(
                        snapshots[0]
                          ?.name ??
                          'Not available',
                      )}
                    </p>
                  </div>

                  ${createComparisonTable(
                    'Input comparison',
                    comparison.inputRows,
                    snapshots,
                  )}

                  ${createComparisonTable(
                    'Result comparison',
                    comparison.resultRows,
                    snapshots,
                  )}

                  <h3>
                    Difference from baseline
                  </h3>

                  <div class="difference-grid">
                    ${differences}
                  </div>
                </section>
              `
            },
          )
          .join('')

  reportWindow.document.write(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <title>
          ${escapeHtml(project.name)}
          — ChemE Toolkit
        </title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            max-width: 1080px;
            margin: 0 auto;
            padding: 42px;
            color: #0b3556;
            background: #ffffff;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          header {
            padding-bottom: 24px;
            border-bottom:
              3px solid #049b96;
          }

          .eyebrow,
          .file-type {
            margin: 0 0 8px;
            color: #007b78;
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }

          h1 {
            margin: 0;
            font-family:
              Georgia,
              serif;
            font-size: 38px;
          }

          .description {
            max-width: 780px;
            margin: 12px 0 0;
            color: #516d84;
            line-height: 1.6;
          }

          .meta {
            margin-top: 16px;
            display: grid;
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
            gap: 8px 16px;
            color: #647a8e;
            font-size: 12px;
          }

          .project-notes {
            margin-top: 22px;
            padding: 16px;
            border-left:
              4px solid #049b96;
            background: #eaf6f4;
            white-space: pre-wrap;
          }

          .section-title {
            margin: 34px 0 0;
            padding-bottom: 9px;
            color: #007b78;
            border-bottom:
              2px solid #049b96;
            font-size: 15px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .file-card {
            margin-top: 25px;
            padding-top: 22px;
            border-top:
              1px solid #d9d0bd;
            break-inside: avoid;
          }

          .file-card h2 {
            margin: 0;
            font-family:
              Georgia,
              serif;
            font-size: 25px;
          }

          .file-meta {
            margin: 7px 0 0;
            color: #647a8e;
            font-size: 12px;
          }

          h3 {
            margin: 20px 0 9px;
            color: #007b78;
            font-size: 12px;
            letter-spacing: 0.07em;
            text-transform: uppercase;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          .comparison-table {
            min-width: 720px;
          }

          .table-scroll {
            overflow-x: auto;
          }

          th,
          td {
            padding: 9px 10px;
            border:
              1px solid #d9d0bd;
            text-align: left;
            vertical-align: top;
          }

          th {
            background: #e4f3f0;
            font-size: 11px;
          }

          td:nth-child(2) {
            font-weight: 700;
          }

          .note {
            margin-top: 15px;
            padding: 13px;
            border-left:
              3px solid #049b96;
            background: #f0f8f6;
          }

          .note p {
            margin: 5px 0 0;
            white-space: pre-wrap;
          }

          .tag-list {
            margin-top: 12px;
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }

          .tag {
            padding: 5px 8px;
            border:
              1px solid #c9c0ad;
            border-radius: 999px;
            color: #0b3556;
            background: #f9f6ee;
            font-size: 10px;
            font-weight: 700;
          }

          .difference-grid {
            display: grid;
            grid-template-columns:
              repeat(
                auto-fit,
                minmax(230px, 1fr)
              );
            gap: 10px;
          }

          .difference-card {
            padding: 13px;
            border:
              1px solid #d9d0bd;
            border-radius: 8px;
          }

          .difference-card h4 {
            margin: 0;
          }

          .difference-card h4 small {
            margin-left: 5px;
            color: #647a8e;
          }

          .difference-card div {
            margin-top: 8px;
            padding-top: 8px;
            display: grid;
            gap: 3px;
            border-top:
              1px solid #d9d0bd;
            font-size: 11px;
          }

          .empty {
            margin-top: 18px;
            padding: 20px;
            border:
              1px dashed #d9d0bd;
            text-align: center;
          }

          footer {
            margin-top: 38px;
            padding-top: 16px;
            border-top:
              1px solid #d9d0bd;
            color: #647a8e;
            font-size: 11px;
            line-height: 1.5;
          }

          @media print {
            body {
              max-width: none;
              padding: 14mm;
            }

            @page {
              size: A4;
              margin: 0;
            }
          }
        </style>
      </head>

      <body>
        <header>
          <p class="eyebrow">
            ChemE Toolkit · Combined project report
          </p>

          <h1>
            ${escapeHtml(project.name)}
          </h1>

          <p class="description">
            ${escapeHtml(
              project.description ||
                'No project description.',
            )}
          </p>

          <div class="meta">
            <span>
              <strong>Calculations:</strong>
              ${calculations.length}
            </span>

            <span>
              <strong>Comparisons:</strong>
              ${comparisons.length}
            </span>

            <span>
              <strong>Generated:</strong>
              ${escapeHtml(
                new Date().toLocaleString(
                  'tr-TR',
                ),
              )}
            </span>
          </div>
        </header>

        ${
          project.notes
            ? `
              <div class="project-notes">
                <strong>Project notes</strong>

                <p>
                  ${escapeHtml(
                    project.notes,
                  )}
                </p>
              </div>
            `
            : ''
        }

        <h2 class="section-title">
          Calculations
        </h2>

        ${calculationMarkup}

        <h2 class="section-title">
          Comparison files
        </h2>

        ${comparisonMarkup}

        <footer>
          This combined report contains
          individual calculations and saved
          comparison snapshots stored locally
          in this browser. Final engineering
          decisions must be independently
          verified.
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

export function ProjectFilesPanel() {
  const [
    calculations,
    setCalculations,
  ] = useState<SavedCalculation[]>(
    readCalculations,
  )

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
    selectedProjectId,
    setSelectedProjectId,
  ] = useState('')

  const [
    isExpanded,
    setIsExpanded,
  ] = useState(false)

  const [status, setStatus] =
    useState<Status>('idle')

  const selectedProject =
    useMemo(
      () =>
        projects.find(
          (project) =>
            project.id ===
            selectedProjectId,
        ) ?? null,
      [
        projects,
        selectedProjectId,
      ],
    )

  const projectCalculations =
    useMemo(() => {
      if (!selectedProject) {
        return []
      }

      return selectedProject
        .calculationIds
        .flatMap((id) => {
          const calculation =
            calculations.find(
              (item) =>
                item.id === id,
            )

          return calculation
            ? [calculation]
            : []
        })
    }, [
      calculations,
      selectedProject,
    ])

  const projectComparisons =
    useMemo(() => {
      if (!selectedProject) {
        return []
      }

      return (
        selectedProject.comparisonIds ??
        []
      ).flatMap((id) => {
        const comparison =
          comparisons.find(
            (item) =>
              item.id === id,
          )

        return comparison
          ? [comparison]
          : []
      })
    }, [
      comparisons,
      selectedProject,
    ])

  useEffect(() => {
    function refreshAll() {
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

    window.addEventListener(
      CALCULATIONS_EVENT,
      refreshAll,
    )

    window.addEventListener(
      COMPARISONS_EVENT,
      refreshAll,
    )

    window.addEventListener(
      PROJECTS_EVENT,
      refreshAll,
    )

    window.addEventListener(
      'storage',
      refreshAll,
    )

    window.addEventListener(
      'focus',
      refreshAll,
    )

    return () => {
      window.removeEventListener(
        CALCULATIONS_EVENT,
        refreshAll,
      )

      window.removeEventListener(
        COMPARISONS_EVENT,
        refreshAll,
      )

      window.removeEventListener(
        PROJECTS_EVENT,
        refreshAll,
      )

      window.removeEventListener(
        'storage',
        refreshAll,
      )

      window.removeEventListener(
        'focus',
        refreshAll,
      )
    }
  }, [])

  useEffect(() => {
    const projectExists =
      projects.some(
        (project) =>
          project.id ===
          selectedProjectId,
      )

    if (
      selectedProjectId &&
      projectExists
    ) {
      return
    }

    setSelectedProjectId(
      projects[0]?.id ?? '',
    )
  }, [
    projects,
    selectedProjectId,
  ])

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

  function persistProjects(
    nextProjects: ProjectWorkspace[],
  ) {
    setProjects(nextProjects)

    localStorage.setItem(
      PROJECTS_KEY,
      JSON.stringify(nextProjects),
    )

    window.dispatchEvent(
      new Event(PROJECTS_EVENT),
    )
  }

  function removeCalculation(
    calculationId: string,
  ) {
    if (!selectedProject) {
      return
    }

    const nextProjects =
      projects.map((project) =>
        project.id ===
        selectedProject.id
          ? {
              ...project,
              calculationIds:
                project.calculationIds.filter(
                  (id) =>
                    id !==
                    calculationId,
                ),
              updatedAt:
                new Date().toISOString(),
            }
          : project,
      )

    persistProjects(nextProjects)
    setStatus('removed')
  }

  function removeComparison(
    comparisonId: string,
  ) {
    if (!selectedProject) {
      return
    }

    const nextProjects =
      projects.map((project) =>
        project.id ===
        selectedProject.id
          ? {
              ...project,
              comparisonIds:
                (
                  project.comparisonIds ??
                  []
                ).filter(
                  (id) =>
                    id !==
                    comparisonId,
                ),
              updatedAt:
                new Date().toISOString(),
            }
          : project,
      )

    persistProjects(nextProjects)
    setStatus('removed')
  }

  function handleCsv() {
    if (!selectedProject) {
      setStatus('error')
      return
    }

    downloadProjectCsv(
      selectedProject,
      projectCalculations,
      projectComparisons,
    )

    setStatus('csv')
  }

  function handlePrint() {
    if (!selectedProject) {
      setStatus('error')
      return
    }

    const opened =
      printProjectReport(
        selectedProject,
        projectCalculations,
        projectComparisons,
      )

    setStatus(
      opened
        ? 'print'
        : 'error',
    )
  }

  return (
    <section
      className="project-files-panel"
      aria-label="Project files and reports"
    >
      <div className="project-files-header">
        <div>
          <span>
            Project archive
          </span>

          <h3>
            Project files & reports
          </h3>

          <p>
            Review individual calculations and
            saved comparison snapshots together
            inside the selected project.
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
            ? 'Hide project files'
            : 'Open project files'}
        </button>
      </div>

      <p
        className="project-files-status"
        aria-live="polite"
      >
        {status === 'csv'
          ? 'Combined project CSV downloaded.'
          : null}

        {status === 'print'
          ? 'Combined printable project report opened.'
          : null}

        {status === 'removed'
          ? 'File removed from this project. The original saved file was preserved.'
          : null}

        {status === 'error'
          ? 'Select a project or allow the report window.'
          : null}
      </p>

      {isExpanded ? (
        <div className="project-files-content">
          {projects.length === 0 ? (
            <div className="project-files-empty">
              <strong>
                No project workspaces
              </strong>

              <p>
                Create a project before adding
                calculations or comparisons.
              </p>
            </div>
          ) : (
            <>
              <div className="project-files-toolbar">
                <label>
                  <span>
                    Project
                  </span>

                  <select
                    value={
                      selectedProjectId
                    }
                    onChange={(
                      event,
                    ) =>
                      setSelectedProjectId(
                        event.target.value,
                      )
                    }
                  >
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
                          {project.name}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <div className="project-files-counts">
                  <span>
                    <strong>
                      {
                        projectCalculations.length
                      }
                    </strong>{' '}
                    calculations
                  </span>

                  <span>
                    <strong>
                      {
                        projectComparisons.length
                      }
                    </strong>{' '}
                    comparisons
                  </span>
                </div>

                <div className="project-files-export">
                  <button
                    type="button"
                    onClick={handleCsv}
                  >
                    ↓ Combined CSV
                  </button>

                  <button
                    type="button"
                    className="project-files-primary"
                    onClick={
                      handlePrint
                    }
                  >
                    ▦ Combined PDF
                  </button>
                </div>
              </div>

              {selectedProject ? (
                <div className="project-file-groups">
                  <section className="project-file-group">
                    <div className="project-file-group-heading">
                      <div>
                        <span>
                          Individual files
                        </span>

                        <h4>
                          Calculations
                        </h4>
                      </div>

                      <strong>
                        {
                          projectCalculations.length
                        }
                      </strong>
                    </div>

                    {projectCalculations.length ===
                    0 ? (
                      <div className="project-files-empty project-files-empty-small">
                        No calculations assigned.
                      </div>
                    ) : (
                      <div className="project-file-list">
                        {projectCalculations.map(
                          (
                            calculation,
                          ) => (
                            <article
                              key={
                                calculation.id
                              }
                            >
                              <div>
                                <span>
                                  {
                                    calculation.category
                                  }
                                </span>

                                <h5>
                                  {
                                    calculation.name
                                  }
                                </h5>

                                <p>
                                  {
                                    calculation.calculatorTitle
                                  }
                                </p>

                                <small>
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
                                      calculation.createdAt,
                                    ),
                                  )}
                                </small>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removeCalculation(
                                    calculation.id,
                                  )
                                }
                              >
                                Remove from project
                              </button>
                            </article>
                          ),
                        )}
                      </div>
                    )}
                  </section>

                  <section className="project-file-group project-comparison-files">
                    <div className="project-file-group-heading">
                      <div>
                        <span>
                          Snapshot files
                        </span>

                        <h4>
                          Comparisons
                        </h4>
                      </div>

                      <strong>
                        {
                          projectComparisons.length
                        }
                      </strong>
                    </div>

                    {projectComparisons.length ===
                    0 ? (
                      <div className="project-files-empty project-files-empty-small">
                        No saved comparisons assigned.
                      </div>
                    ) : (
                      <div className="project-file-list">
                        {projectComparisons.map(
                          (
                            comparison,
                          ) => (
                            <article
                              key={
                                comparison.id
                              }
                            >
                              <div>
                                <span>
                                  {
                                    comparison.category
                                  }
                                </span>

                                <h5>
                                  {
                                    comparison.name
                                  }
                                </h5>

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
                                  source calculations ·{' '}
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

                              <button
                                type="button"
                                onClick={() =>
                                  removeComparison(
                                    comparison.id,
                                  )
                                }
                              >
                                Remove from project
                              </button>
                            </article>
                          ),
                        )}
                      </div>
                    )}
                  </section>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </section>
  )
}
