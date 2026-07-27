import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { CalculatorDefinition } from '../types/calculator'
import '../styles/calculation-comparison.css'

const STORAGE_KEY =
  'cheme-toolkit.saved-calculations.v1'

const CHANGE_EVENT =
  'cheme-toolkit:saved-calculations-changed'

const MAX_SELECTIONS = 4

interface CalculationComparisonPanelProps {
  calculator: CalculatorDefinition
}

interface SavedInput {
  label: string
  value: string
  rawValue: string
  unit: string
}

interface SavedResult {
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
  inputs: SavedInput[]
  results: SavedResult[]
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

type Status =
  | 'idle'
  | 'maximum'
  | 'minimum'
  | 'csv'
  | 'print'
  | 'error'

function normalizeText(
  value: string | null | undefined,
): string {
  return (
    value
      ?.replace(/\s+/g, ' ')
      .trim() ?? ''
  )
}

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

function readSavedCalculations():
  SavedCalculation[] {
  try {
    const stored =
      localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return []
    }

    const parsed: unknown =
      JSON.parse(stored)

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
          typeof candidate.calculatorId ===
            'string' &&
          typeof candidate.calculatorTitle ===
            'string' &&
          typeof candidate.category ===
            'string' &&
          typeof candidate.createdAt ===
            'string' &&
          Array.isArray(
            candidate.inputs,
          ) &&
          Array.isArray(
            candidate.results,
          )
        )
      },
    )
  } catch {
    return []
  }
}

function buildComparisonRows(
  calculations: SavedCalculation[],
  type: 'inputs' | 'results',
): ComparisonRow[] {
  const rows =
    new Map<string, ComparisonRow>()

  calculations.forEach(
    (calculation) => {
      const items =
        calculation[type]

      const occurrences =
        new Map<string, number>()

      items.forEach((item) => {
        const baseKey = [
          normalizeText(item.label),
          normalizeText(item.unit),
        ].join('::')

        const occurrence =
          (occurrences.get(baseKey) ?? 0) +
          1

        occurrences.set(
          baseKey,
          occurrence,
        )

        const key =
          `${baseKey}::${occurrence}`

        const existing =
          rows.get(key)

        if (existing) {
          existing.values[
            calculation.id
          ] = item.value
          return
        }

        rows.set(key, {
          key,
          label:
            normalizeText(item.label) ||
            (type === 'inputs'
              ? 'Input'
              : 'Result'),
          unit:
            normalizeText(item.unit),
          values: {
            [calculation.id]:
              item.value,
          },
        })
      })
    },
  )

  return Array.from(rows.values())
}

function parseNumericValue(
  value: string,
): number | null {
  let normalized =
    value
      .replace(/\s+/g, '')
      .replace(/[−–—]/g, '-')

  const hasComma =
    normalized.includes(',')

  const hasDot =
    normalized.includes('.')

  if (hasComma && hasDot) {
    normalized =
      normalized.replaceAll(',', '')
  } else if (
    hasComma &&
    !hasDot
  ) {
    normalized =
      normalized.replace(',', '.')
  }

  const match =
    normalized.match(
      /[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/i,
    )

  if (!match) {
    return null
  }

  const parsed =
    Number(match[0])

  return Number.isFinite(parsed)
    ? parsed
    : null
}

function formatNumber(
  value: number,
): string {
  return new Intl.NumberFormat(
    'tr-TR',
    {
      maximumSignificantDigits: 9,
    },
  ).format(value)
}

function buildDifferenceRows(
  resultRows: ComparisonRow[],
  calculations: SavedCalculation[],
): DifferenceRow[] {
  const baseline =
    calculations[0]

  if (!baseline) {
    return []
  }

  return resultRows.map((row) => {
    const baselineValue =
      row.values[baseline.id] ?? '—'

    const baselineNumber =
      parseNumericValue(
        baselineValue,
      )

    const comparisons =
      calculations
        .slice(1)
        .map((calculation) => {
          const value =
            row.values[
              calculation.id
            ] ?? '—'

          const numericValue =
            parseNumericValue(value)

          const difference =
            baselineNumber !== null &&
            numericValue !== null
              ? numericValue -
                baselineNumber
              : null

          const percentage =
            difference !== null &&
            baselineNumber !== null &&
            baselineNumber !== 0
              ? (
                  difference /
                  Math.abs(
                    baselineNumber,
                  )
                ) * 100
              : null

          return {
            calculationId:
              calculation.id,
            calculationName:
              calculation.name,
            value,
            difference,
            percentage,
          }
        })

    return {
      key: row.key,
      label: row.label,
      unit: row.unit,
      baselineValue,
      comparisons,
    }
  })
}

function createComparisonCsv(
  calculations: SavedCalculation[],
  inputRows: ComparisonRow[],
  resultRows: ComparisonRow[],
  differenceRows: DifferenceRow[],
): string {
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
      'ChemE Toolkit Calculation Comparison',
      '',
    ],
    [
      'Calculator',
      calculations[0]
        ?.calculatorTitle ?? '',
    ],
    [
      'Category',
      calculations[0]
        ?.category ?? '',
    ],
    [
      'Generated',
      new Date().toLocaleString(
        'tr-TR',
      ),
    ],
    [],
    ['INPUTS'],
    header,
    ...inputRows.map((row) => [
      row.label,
      row.unit,
      ...calculations.map(
        (calculation) =>
          row.values[
            calculation.id
          ] ?? '—',
      ),
    ]),
    [],
    ['RESULTS'],
    header,
    ...resultRows.map((row) => [
      row.label,
      row.unit,
      ...calculations.map(
        (calculation) =>
          row.values[
            calculation.id
          ] ?? '—',
      ),
    ]),
    [],
    ['DIFFERENCES FROM BASELINE'],
    [
      'Result',
      'Unit',
      'Comparison',
      'Value',
      'Absolute difference',
      'Percentage change',
    ],
    ...differenceRows.flatMap(
      (row) =>
        row.comparisons.map(
          (comparison) => [
            row.label,
            row.unit,
            comparison.calculationName,
            comparison.value,
            comparison.difference ===
            null
              ? 'Not numeric'
              : formatNumber(
                  comparison.difference,
                ),
            comparison.percentage ===
            null
              ? 'Not available'
              : `${formatNumber(
                  comparison.percentage,
                )}%`,
          ],
        ),
    ),
  ]

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

function downloadCsv(
  calculations: SavedCalculation[],
  inputRows: ComparisonRow[],
  resultRows: ComparisonRow[],
  differenceRows: DifferenceRow[],
) {
  const csv =
    createComparisonCsv(
      calculations,
      inputRows,
      resultRows,
      differenceRows,
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
    `${createSlug(
      calculations[0]
        ?.calculatorTitle ??
        'calculation-comparison',
    )}-comparison.csv`

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

function createComparisonTable(
  title: string,
  rows: ComparisonRow[],
  calculations: SavedCalculation[],
): string {
  const calculationHeaders =
    calculations
      .map(
        (calculation) => `
          <th>
            ${escapeHtml(
              calculation.name,
            )}
          </th>
        `,
      )
      .join('')

  const bodyRows =
    rows.length === 0
      ? `
        <tr>
          <td colspan="${
            calculations.length + 2
          }">
            No comparison data.
          </td>
        </tr>
      `
      : rows
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
                    (
                      calculation,
                    ) => `
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
          .join('')

  return `
    <section>
      <h2>${escapeHtml(title)}</h2>

      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Unit</th>
            ${calculationHeaders}
          </tr>
        </thead>

        <tbody>
          ${bodyRows}
        </tbody>
      </table>
    </section>
  `
}

function printComparison(
  calculations: SavedCalculation[],
  inputRows: ComparisonRow[],
  resultRows: ComparisonRow[],
  differenceRows: DifferenceRow[],
): boolean {
  const reportWindow =
    window.open('', '_blank')

  if (!reportWindow) {
    return false
  }

  const baseline =
    calculations[0]

  const differenceMarkup =
    differenceRows.length === 0
      ? `
        <p class="empty">
          No numerical result differences
          were available.
        </p>
      `
      : differenceRows
          .map(
            (row) => `
              <article class="difference-card">
                <h3>
                  ${escapeHtml(
                    row.label,
                  )}
                  ${
                    row.unit
                      ? `<small>${escapeHtml(
                          row.unit,
                        )}</small>`
                      : ''
                  }
                </h3>

                <p>
                  <strong>Baseline:</strong>
                  ${escapeHtml(
                    row.baselineValue,
                  )}
                </p>

                ${row.comparisons
                  .map(
                    (
                      comparison,
                    ) => `
                      <div>
                        <strong>
                          ${escapeHtml(
                            comparison.calculationName,
                          )}
                        </strong>

                        <span>
                          Difference:
                          ${
                            comparison.difference ===
                            null
                              ? 'Not numeric'
                              : escapeHtml(
                                  formatNumber(
                                    comparison.difference,
                                  ),
                                )
                          }
                        </span>

                        <span>
                          Change:
                          ${
                            comparison.percentage ===
                            null
                              ? 'Not available'
                              : `${escapeHtml(
                                  formatNumber(
                                    comparison.percentage,
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

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <title>
          ${escapeHtml(
            baseline?.calculatorTitle ??
              'Calculation comparison',
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
            background: #ffffff;
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
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }

          h1 {
            margin: 0;
            font-family:
              Georgia,
              serif;
            font-size: 36px;
            line-height: 1.08;
          }

          .meta {
            margin-top: 16px;
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 8px 20px;
            color: #516d84;
            font-size: 13px;
          }

          section {
            margin-top: 28px;
            overflow-x: auto;
          }

          h2 {
            margin: 0 0 12px;
            color: #007b78;
            font-size: 14px;
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
            padding: 10px 11px;
            border:
              1px solid #d9d0bd;
            text-align: left;
            vertical-align: top;
          }

          th {
            background: #e4f3f0;
            font-size: 11px;
            text-transform: uppercase;
          }

          td:first-child {
            font-weight: 700;
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

          .difference-card {
            padding: 15px;
            border:
              1px solid #d9d0bd;
            border-radius: 8px;
            break-inside: avoid;
          }

          .difference-card h3 {
            margin: 0 0 10px;
            font-size: 15px;
          }

          .difference-card h3 small {
            margin-left: 6px;
            color: #647a8e;
            font-size: 11px;
          }

          .difference-card p {
            margin: 0 0 10px;
          }

          .difference-card div {
            display: grid;
            gap: 4px;
            padding: 9px 0;
            border-top:
              1px solid #e4ded1;
            font-size: 12px;
          }

          footer {
            margin-top: 36px;
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
            ChemE Toolkit · Calculation comparison
          </p>

          <h1>
            ${escapeHtml(
              baseline?.calculatorTitle ??
                'Calculation comparison',
            )}
          </h1>

          <div class="meta">
            <span>
              <strong>Category:</strong>
              ${escapeHtml(
                baseline?.category ?? '',
              )}
            </span>

            <span>
              <strong>Baseline:</strong>
              ${escapeHtml(
                baseline?.name ?? '',
              )}
            </span>

            <span>
              <strong>Calculations:</strong>
              ${calculations.length}
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

        ${createComparisonTable(
          'Input comparison',
          inputRows,
          calculations,
        )}

        ${createComparisonTable(
          'Result comparison',
          resultRows,
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
          The first selected calculation is
          used as the baseline. Percentage
          change is unavailable when the
          baseline is zero or when values
          cannot be interpreted numerically.
          Final engineering decisions must
          be independently verified.
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

export function CalculationComparisonPanel({
  calculator,
}: CalculationComparisonPanelProps) {
  const [
    calculations,
    setCalculations,
  ] = useState<SavedCalculation[]>(
    readSavedCalculations,
  )

  const [
    filterCalculatorId,
    setFilterCalculatorId,
  ] = useState(calculator.id)

  const [
    selectedIds,
    setSelectedIds,
  ] = useState<string[]>([])

  const [isExpanded, setIsExpanded] =
    useState(false)

  const [status, setStatus] =
    useState<Status>('idle')

  const calculatorOptions =
    useMemo(() => {
      const options =
        new Map<
          string,
          {
            id: string
            title: string
            category: string
          }
        >()

      calculations.forEach(
        (calculation) => {
          if (
            !options.has(
              calculation.calculatorId,
            )
          ) {
            options.set(
              calculation.calculatorId,
              {
                id:
                  calculation.calculatorId,
                title:
                  calculation.calculatorTitle,
                category:
                  calculation.category,
              },
            )
          }
        },
      )

      return Array.from(
        options.values(),
      )
    }, [calculations])

  const filteredCalculations =
    useMemo(
      () =>
        calculations.filter(
          (calculation) =>
            calculation.calculatorId ===
            filterCalculatorId,
        ),
      [
        calculations,
        filterCalculatorId,
      ],
    )

  const selectedCalculations =
    useMemo(
      () =>
        selectedIds.flatMap(
          (id) => {
            const calculation =
              calculations.find(
                (item) =>
                  item.id === id,
              )

            return calculation
              ? [calculation]
              : []
          },
        ),
      [
        calculations,
        selectedIds,
      ],
    )

  const inputRows =
    useMemo(
      () =>
        buildComparisonRows(
          selectedCalculations,
          'inputs',
        ),
      [selectedCalculations],
    )

  const resultRows =
    useMemo(
      () =>
        buildComparisonRows(
          selectedCalculations,
          'results',
        ),
      [selectedCalculations],
    )

  const differenceRows =
    useMemo(
      () =>
        buildDifferenceRows(
          resultRows,
          selectedCalculations,
        ),
      [
        resultRows,
        selectedCalculations,
      ],
    )

  useEffect(() => {
    function refreshCalculations() {
      setCalculations(
        readSavedCalculations(),
      )
    }

    window.addEventListener(
      CHANGE_EVENT,
      refreshCalculations,
    )

    window.addEventListener(
      'storage',
      refreshCalculations,
    )

    window.addEventListener(
      'focus',
      refreshCalculations,
    )

    return () => {
      window.removeEventListener(
        CHANGE_EVENT,
        refreshCalculations,
      )

      window.removeEventListener(
        'storage',
        refreshCalculations,
      )

      window.removeEventListener(
        'focus',
        refreshCalculations,
      )
    }
  }, [])

  useEffect(() => {
    const currentHasHistory =
      calculations.some(
        (calculation) =>
          calculation.calculatorId ===
          calculator.id,
      )

    if (currentHasHistory) {
      setFilterCalculatorId(
        calculator.id,
      )
      setSelectedIds([])
      return
    }

    const filterStillExists =
      calculations.some(
        (calculation) =>
          calculation.calculatorId ===
          filterCalculatorId,
      )

    if (!filterStillExists) {
      setFilterCalculatorId(
        calculations[0]
          ?.calculatorId ??
          calculator.id,
      )
      setSelectedIds([])
    }
  }, [
    calculator.id,
    calculations,
    filterCalculatorId,
  ])

  useEffect(() => {
    setSelectedIds(
      (current) =>
        current.filter((id) =>
          filteredCalculations.some(
            (calculation) =>
              calculation.id === id,
          ),
        ),
    )
  }, [filteredCalculations])

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

  function toggleSelection(
    calculationId: string,
  ) {
    setSelectedIds((current) => {
      if (
        current.includes(
          calculationId,
        )
      ) {
        return current.filter(
          (id) =>
            id !== calculationId,
        )
      }

      if (
        current.length >=
        MAX_SELECTIONS
      ) {
        setStatus('maximum')
        return current
      }

      return [
        ...current,
        calculationId,
      ]
    })
  }

  function handleCsvExport() {
    if (
      selectedCalculations.length <
      2
    ) {
      setStatus('minimum')
      return
    }

    downloadCsv(
      selectedCalculations,
      inputRows,
      resultRows,
      differenceRows,
    )

    setStatus('csv')
  }

  function handlePrint() {
    if (
      selectedCalculations.length <
      2
    ) {
      setStatus('minimum')
      return
    }

    const opened =
      printComparison(
        selectedCalculations,
        inputRows,
        resultRows,
        differenceRows,
      )

    setStatus(
      opened
        ? 'print'
        : 'error',
    )
  }

  const baseline =
    selectedCalculations[0]

  return (
    <section
      className="calculation-comparison-panel"
      aria-label="Calculation comparison"
    >
      <div className="calculation-comparison-header">
        <div>
          <span>
            Engineering comparison
          </span>

          <h3>
            Compare saved calculations
          </h3>

          <p>
            Select between two and four
            saved calculations from the
            same calculator.
          </p>
        </div>

        <button
          type="button"
          className="comparison-expand-button"
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
            ? 'Hide comparison'
            : 'Open comparison'}
        </button>
      </div>

      {isExpanded ? (
        <div className="calculation-comparison-content">
          {calculations.length ===
          0 ? (
            <div className="comparison-empty">
              <strong>
                No saved calculations
              </strong>

              <p>
                Save at least two
                calculations before
                creating a comparison.
              </p>
            </div>
          ) : (
            <>
              <div className="comparison-filter-row">
                <label>
                  <span>
                    Calculator
                  </span>

                  <select
                    value={
                      filterCalculatorId
                    }
                    onChange={(
                      event,
                    ) => {
                      setFilterCalculatorId(
                        event.target.value,
                      )
                      setSelectedIds([])
                    }}
                  >
                    {calculatorOptions.map(
                      (option) => (
                        <option
                          key={
                            option.id
                          }
                          value={
                            option.id
                          }
                        >
                          {
                            option.title
                          }{' '}
                          —{' '}
                          {
                            option.category
                          }
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <div className="comparison-selection-count">
                  <strong>
                    {
                      selectedIds.length
                    }
                    /{MAX_SELECTIONS}
                  </strong>

                  <span>
                    selected
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedIds(
                      [],
                    )
                  }
                  disabled={
                    selectedIds.length ===
                    0
                  }
                >
                  Clear selection
                </button>
              </div>

              {filteredCalculations.length ===
              0 ? (
                <div className="comparison-empty">
                  <strong>
                    No records for this calculator
                  </strong>

                  <p>
                    Create and save two
                    calculations first.
                  </p>
                </div>
              ) : (
                <div className="comparison-record-grid">
                  {filteredCalculations.map(
                    (
                      calculation,
                    ) => {
                      const isSelected =
                        selectedIds.includes(
                          calculation.id,
                        )

                      const selectionIndex =
                        selectedIds.indexOf(
                          calculation.id,
                        )

                      return (
                        <label
                          key={
                            calculation.id
                          }
                          className={
                            isSelected
                              ? 'is-selected'
                              : ''
                          }
                        >
                          <input
                            type="checkbox"
                            checked={
                              isSelected
                            }
                            onChange={() =>
                              toggleSelection(
                                calculation.id,
                              )
                            }
                          />

                          <div>
                            <span>
                              {selectionIndex ===
                              0
                                ? 'Baseline'
                                : isSelected
                                  ? `Comparison ${
                                      selectionIndex
                                    }`
                                  : calculation.category}
                            </span>

                            <strong>
                              {
                                calculation.name
                              }
                            </strong>

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
                        </label>
                      )
                    },
                  )}
                </div>
              )}

              <p
                className="calculation-comparison-status"
                aria-live="polite"
              >
                {status ===
                'maximum'
                  ? 'A maximum of four calculations can be compared.'
                  : null}

                {status ===
                'minimum'
                  ? 'Select at least two saved calculations.'
                  : null}

                {status === 'csv'
                  ? 'Comparison CSV downloaded.'
                  : null}

                {status ===
                'print'
                  ? 'Printable comparison report opened.'
                  : null}

                {status ===
                'error'
                  ? 'The report window was blocked by the browser.'
                  : null}
              </p>

              {selectedCalculations.length >=
              2 ? (
                <div className="comparison-results">
                  <div className="comparison-toolbar">
                    <div>
                      <span>
                        Baseline
                      </span>

                      <strong>
                        {
                          baseline?.name
                        }
                      </strong>
                    </div>

                    <div className="comparison-export-actions">
                      <button
                        type="button"
                        onClick={
                          handleCsvExport
                        }
                      >
                        ↓ Export CSV
                      </button>

                      <button
                        type="button"
                        className="comparison-primary-button"
                        onClick={
                          handlePrint
                        }
                      >
                        ▦ Print / Save PDF
                      </button>
                    </div>
                  </div>

                  <div className="comparison-table-section">
                    <h4>
                      Input comparison
                    </h4>

                    <div className="comparison-table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>
                              Variable
                            </th>

                            <th>
                              Unit
                            </th>

                            {selectedCalculations.map(
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
                          {inputRows.map(
                            (row) => (
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

                                {selectedCalculations.map(
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
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="comparison-table-section">
                    <h4>
                      Result comparison
                    </h4>

                    <div className="comparison-table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>
                              Result
                            </th>

                            <th>
                              Unit
                            </th>

                            {selectedCalculations.map(
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
                          {resultRows.map(
                            (row) => (
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

                                {selectedCalculations.map(
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
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="comparison-difference-section">
                    <h4>
                      Difference from baseline
                    </h4>

                    <div className="comparison-difference-grid">
                      {differenceRows.map(
                        (row) => (
                          <article
                            key={
                              row.key
                            }
                          >
                            <div className="comparison-difference-heading">
                              <span>
                                {
                                  row.label
                                }
                              </span>

                              <small>
                                {
                                  row.unit
                                }
                              </small>
                            </div>

                            <p>
                              Baseline:{' '}
                              <strong>
                                {
                                  row.baselineValue
                                }
                              </strong>
                            </p>

                            {row.comparisons.map(
                              (
                                comparison,
                              ) => (
                                <div
                                  key={
                                    comparison.calculationId
                                  }
                                  className="comparison-difference-item"
                                >
                                  <strong>
                                    {
                                      comparison.calculationName
                                    }
                                  </strong>

                                  <span>
                                    Difference:{' '}
                                    {comparison.difference ===
                                    null
                                      ? 'Not numeric'
                                      : formatNumber(
                                          comparison.difference,
                                        )}
                                  </span>

                                  <span>
                                    Change:{' '}
                                    {comparison.percentage ===
                                    null
                                      ? 'Not available'
                                      : `${formatNumber(
                                          comparison.percentage,
                                        )}%`}
                                  </span>
                                </div>
                              ),
                            )}
                          </article>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="comparison-selection-hint">
                  <strong>
                    Select at least two records
                  </strong>

                  <p>
                    The first selection
                    becomes the baseline
                    calculation.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      ) : null}
    </section>
  )
}
