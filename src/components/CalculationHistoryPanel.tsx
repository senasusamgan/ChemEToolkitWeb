import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { CalculatorDefinition } from '../types/calculator'
import '../styles/calculation-history.css'

const STORAGE_KEY =
  'cheme-toolkit.saved-calculations.v1'

const PENDING_RESTORE_KEY =
  'cheme-toolkit.pending-calculation-restore.v1'

const RESTORE_REQUEST_EVENT =
  'cheme-toolkit:calculation-restore-requested'

const WORKSPACE_TARGET_EVENT =
  'cheme-toolkit:workspace-open-target'

const PENDING_WORKSPACE_TARGET_KEY =
  'cheme-toolkit.pending-workspace-target.v1'

const MAX_SAVED_CALCULATIONS = 50

interface CalculationHistoryPanelProps {
  calculator: CalculatorDefinition
  onOpenCalculator: (
    calculatorId: string,
  ) => void
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

type Status =
  | 'idle'
  | 'saved'
  | 'deleted'
  | 'cleared'
  | 'opening'
  | 'restored'
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

function getCalculatorRoot():
  ParentNode | null {
  const stageBody =
    document.querySelector<HTMLElement>(
      '.calculator-stage-body',
    )

  if (!stageBody) {
    return null
  }

  const frame =
    stageBody.querySelector<HTMLIFrameElement>(
      'iframe',
    )

  const frameDocument =
    frame?.contentDocument

  if (frameDocument) {
    return (
      frameDocument.querySelector(
        '.native-calculator',
      ) ??
      frameDocument.querySelector(
        '.calculator-main',
      ) ??
      frameDocument.querySelector(
        '.workbench',
      ) ??
      frameDocument.body
    )
  }

  return (
    stageBody.querySelector(
      '.native-calculator',
    ) ??
    stageBody
  )
}

function getControls(
  root: ParentNode,
): Array<
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
> {
  return Array.from(
    root.querySelectorAll<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >('input, select, textarea'),
  ).filter(
    (control) =>
      control.type !== 'hidden' &&
      control.type !== 'button' &&
      control.type !== 'submit' &&
      control.type !== 'reset',
  )
}

function findInputLabel(
  control:
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement,
): string {
  const label =
    control.closest('label')

  const directLabel =
    label?.querySelector<HTMLElement>(
      ':scope > span:first-child',
    )

  const directText =
    normalizeText(
      directLabel?.textContent,
    )

  if (directText) {
    return directText
  }

  return (
    normalizeText(
      control.getAttribute(
        'aria-label',
      ),
    ) ||
    normalizeText(
      control.getAttribute('name'),
    ) ||
    normalizeText(
      control.getAttribute(
        'placeholder',
      ),
    ) ||
    'Input'
  )
}

function findInputUnit(
  control:
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement,
): string {
  const shell =
    control.closest(
      '.native-input-shell',
    )

  const shellUnit =
    normalizeText(
      shell
        ?.querySelector('b')
        ?.textContent,
    )

  if (shellUnit) {
    return shellUnit
  }

  return normalizeText(
    control.parentElement
      ?.querySelector(
        ':scope > b, :scope > small, :scope > span:last-child',
      )
      ?.textContent,
  )
}

function collectInputs(
  root: ParentNode,
): SavedInput[] {
  return getControls(root).map(
    (control) => {
      const rawValue =
        control.value

      const displayValue =
        control instanceof
        HTMLSelectElement
          ? normalizeText(
              control.selectedOptions[0]
                ?.textContent,
            )
          : normalizeText(
              control.value,
            )

      return {
        label:
          findInputLabel(control),
        value:
          displayValue ||
          'Not entered',
        rawValue,
        unit:
          findInputUnit(control),
      }
    },
  )
}

function collectResults(
  root: ParentNode,
): SavedResult[] {
  const results: SavedResult[] = []

  const resultHeading =
    root.querySelector<HTMLElement>(
      '.native-result-heading',
    )

  if (resultHeading) {
    const label =
      normalizeText(
        resultHeading
          .querySelector('p')
          ?.textContent,
      )

    const value =
      normalizeText(
        resultHeading
          .querySelector('strong')
          ?.textContent,
      )

    const unit =
      normalizeText(
        resultHeading
          .querySelector(
            ':scope > span',
          )
          ?.textContent,
      )

    if (label || value) {
      results.push({
        label:
          label ||
          'Primary result',
        value:
          value ||
          'Not calculated',
        unit,
      })
    }
  }

  root
    .querySelectorAll<HTMLElement>(
      '.native-result-grid article',
    )
    .forEach((article) => {
      results.push({
        label:
          normalizeText(
            article
              .querySelector('p')
              ?.textContent,
          ) || 'Result',

        value:
          normalizeText(
            article
              .querySelector('strong')
              ?.textContent,
          ) || '—',

        unit:
          normalizeText(
            article
              .querySelector('span')
              ?.textContent,
          ),
      })
    })

  if (results.length === 0) {
    const fallback =
      root.querySelector<HTMLElement>(
        [
          '.native-result-panel',
          '.result-panel',
          '.result-card',
          '.calculator-result',
          '[data-result]',
        ].join(','),
      )

    const fallbackText =
      normalizeText(
        fallback?.textContent,
      )

    if (fallbackText) {
      results.push({
        label:
          'Calculated output',
        value: fallbackText,
        unit: '',
      })
    }
  }

  return results
}

function collectCalculation(
  calculator: CalculatorDefinition,
  name: string,
): SavedCalculation | null {
  const root =
    getCalculatorRoot()

  if (!root) {
    return null
  }

  const formula =
    normalizeText(
      root.querySelector<HTMLElement>(
        '.native-formula',
      )?.textContent,
    )

  const reference =
    normalizeText(
      root.querySelector<HTMLElement>(
        '.native-reference',
      )?.textContent,
    )
      .replace(
        /View bibliography\s*↘?/i,
        '',
      )
      .trim()

  return {
    id: createId(),
    name,
    calculatorId:
      calculator.id,
    calculatorTitle:
      calculator.title,
    category:
      calculator.category,
    createdAt:
      new Date().toISOString(),
    inputs:
      collectInputs(root),
    results:
      collectResults(root),
    formula,
    reference,
  }
}

function setControlValue(
  control:
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement,
  value: string,
) {
  const prototype =
    control instanceof
    HTMLInputElement
      ? HTMLInputElement.prototype
      : control instanceof
          HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLTextAreaElement.prototype

  const valueSetter =
    Object.getOwnPropertyDescriptor(
      prototype,
      'value',
    )?.set

  if (valueSetter) {
    valueSetter.call(
      control,
      value,
    )
  } else {
    control.value = value
  }

  control.dispatchEvent(
    new Event('input', {
      bubbles: true,
    }),
  )

  control.dispatchEvent(
    new Event('change', {
      bubbles: true,
    }),
  )
}

function restoreCalculation(
  calculation: SavedCalculation,
): boolean {
  const root =
    getCalculatorRoot()

  if (!root) {
    return false
  }

  const controls =
    getControls(root)

  if (controls.length === 0) {
    return false
  }

  calculation.inputs.forEach(
    (input, index) => {
      const control =
        controls[index]

      if (!control) {
        return
      }

      setControlValue(
        control,
        input.rawValue,
      )
    },
  )

  return true
}

function downloadCalculationCsv(
  calculation: SavedCalculation,
) {
  const rows: string[][] = [
    [
      'ChemE Toolkit Saved Calculation',
      '',
      '',
    ],
    [
      'Name',
      calculation.name,
      '',
    ],
    [
      'Calculator',
      calculation.calculatorTitle,
      '',
    ],
    [
      'Category',
      calculation.category,
      '',
    ],
    [
      'Saved at',
      new Date(
        calculation.createdAt,
      ).toLocaleString('tr-TR'),
      '',
    ],
    ['', '', ''],
    ['Input', 'Value', 'Unit'],
    ...calculation.inputs.map(
      (input) => [
        input.label,
        input.value,
        input.unit,
      ],
    ),
    ['', '', ''],
    ['Result', 'Value', 'Unit'],
    ...calculation.results.map(
      (result) => [
        result.label,
        result.value,
        result.unit,
      ],
    ),
    ['', '', ''],
    [
      'Formula',
      calculation.formula ||
        'Not provided',
      '',
    ],
    [
      'Reference basis',
      calculation.reference ||
        'Not provided',
      '',
    ],
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
      calculation.name,
    ) || 'saved-calculation'}.csv`

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

function createRows(
  rows: Array<{
    label: string
    value: string
    unit: string
  }>,
): string {
  if (rows.length === 0) {
    return `
      <tr>
        <td colspan="3">
          No saved data.
        </td>
      </tr>
    `
  }

  return rows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(
            row.label,
          )}</td>
          <td>${escapeHtml(
            row.value,
          )}</td>
          <td>${escapeHtml(
            row.unit,
          )}</td>
        </tr>
      `,
    )
    .join('')
}

function printSavedCalculation(
  calculation: SavedCalculation,
): boolean {
  const reportWindow =
    window.open('', '_blank')

  if (!reportWindow) {
    return false
  }

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
            calculation.name,
          )} — ChemE Toolkit
        </title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            max-width: 900px;
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

          .calculator-name {
            margin: 10px 0 0;
            color: #516d84;
          }

          .meta {
            margin-top: 18px;
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 8px 20px;
            color: #516d84;
            font-size: 13px;
          }

          section {
            margin-top: 30px;
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
            border-collapse: collapse;
          }

          th,
          td {
            padding: 11px 12px;
            border:
              1px solid #d9d0bd;
            text-align: left;
          }

          th {
            background: #e4f3f0;
            font-size: 12px;
            text-transform: uppercase;
          }

          td:nth-child(2) {
            font-weight: 700;
          }

          .note {
            padding: 16px;
            border-left:
              4px solid #049b96;
            background: #eaf6f4;
            line-height: 1.6;
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
              padding: 16mm;
            }

            @page {
              size: A4;
              margin: 0;
            }
          }

          @media (max-width: 600px) {
            body {
              padding: 24px 16px;
            }

            h1 {
              font-size: 29px;
            }

            .meta {
              grid-template-columns:
                1fr;
            }
          }
        </style>
      </head>

      <body>
        <header>
          <p class="eyebrow">
            ChemE Toolkit · Saved calculation
          </p>

          <h1>
            ${escapeHtml(
              calculation.name,
            )}
          </h1>

          <p class="calculator-name">
            ${escapeHtml(
              calculation.calculatorTitle,
            )}
          </p>

          <div class="meta">
            <span>
              <strong>Category:</strong>
              ${escapeHtml(
                calculation.category,
              )}
            </span>

            <span>
              <strong>Saved:</strong>
              ${escapeHtml(
                new Date(
                  calculation.createdAt,
                ).toLocaleString(
                  'tr-TR',
                ),
              )}
            </span>
          </div>
        </header>

        <section>
          <h2>Inputs</h2>

          <table>
            <thead>
              <tr>
                <th>Variable</th>
                <th>Value</th>
                <th>Unit</th>
              </tr>
            </thead>

            <tbody>
              ${createRows(
                calculation.inputs,
              )}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Results</h2>

          <table>
            <thead>
              <tr>
                <th>Result</th>
                <th>Value</th>
                <th>Unit / model</th>
              </tr>
            </thead>

            <tbody>
              ${createRows(
                calculation.results,
              )}
            </tbody>
          </table>
        </section>

        ${
          calculation.formula
            ? `
              <section>
                <h2>Formula / model</h2>

                <div class="note">
                  ${escapeHtml(
                    calculation.formula,
                  )}
                </div>
              </section>
            `
            : ''
        }

        ${
          calculation.reference
            ? `
              <section>
                <h2>Reference basis</h2>

                <div class="note">
                  ${escapeHtml(
                    calculation.reference,
                  )}
                </div>
              </section>
            `
            : ''
        }

        <footer>
          Results are intended for education,
          preliminary screening and independent
          engineering checks. Final and
          safety-critical decisions must be
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

export function CalculationHistoryPanel({
  calculator,
  onOpenCalculator,
}: CalculationHistoryPanelProps) {
  const [
    calculations,
    setCalculations,
  ] = useState<SavedCalculation[]>(
    readSavedCalculations,
  )

  const [name, setName] =
    useState('')

  const [isExpanded, setIsExpanded] =
    useState(false)

  const [status, setStatus] =
    useState<Status>('idle')

  const currentCalculatorHistory =
    useMemo(
      () =>
        calculations.filter(
          (calculation) =>
            calculation.calculatorId ===
            calculator.id,
        ),
      [
        calculations,
        calculator.id,
      ],
    )

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(calculations),
    )

    window.dispatchEvent(
      new Event(
        'cheme-toolkit:saved-calculations-changed',
      ),
    )
  }, [calculations])

  useEffect(() => {
    setName('')
  }, [calculator.id])

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
          'calculation' ||
        typeof detail.id !==
          'string' ||
        !calculations.some(
          (calculation) =>
            calculation.id ===
            detail.id,
        )
      ) {
        return
      }

      setIsExpanded(true)

      sessionStorage.removeItem(
        PENDING_WORKSPACE_TARGET_KEY,
      )

      window.setTimeout(() => {
        const element =
          document.getElementById(
            `saved-calculation-${detail.id}`,
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
      }, 280)
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
  }, [calculations])

  useEffect(() => {
    const pendingRaw =
      sessionStorage.getItem(
        PENDING_RESTORE_KEY,
      )

    if (!pendingRaw) {
      return
    }

    let pending:
      | SavedCalculation
      | null = null

    try {
      pending =
        JSON.parse(
          pendingRaw,
        ) as SavedCalculation
    } catch {
      sessionStorage.removeItem(
        PENDING_RESTORE_KEY,
      )
      return
    }

    if (
      pending.calculatorId !==
      calculator.id
    ) {
      return
    }

    const timers = [
      window.setTimeout(
        () => {
          if (
            pending &&
            restoreCalculation(
              pending,
            )
          ) {
            sessionStorage.removeItem(
              PENDING_RESTORE_KEY,
            )
            setStatus('restored')
          }
        },
        300,
      ),

      window.setTimeout(
        () => {
          if (
            pending &&
            sessionStorage.getItem(
              PENDING_RESTORE_KEY,
            ) &&
            restoreCalculation(
              pending,
            )
          ) {
            sessionStorage.removeItem(
              PENDING_RESTORE_KEY,
            )
            setStatus('restored')
          }
        },
        900,
      ),
    ]

    return () => {
      timers.forEach(
        (timer) =>
          window.clearTimeout(
            timer,
          ),
      )
    }
  }, [calculator.id])

  useEffect(() => {
    function handleRestoreRequest() {
      const pendingRaw =
        sessionStorage.getItem(
          PENDING_RESTORE_KEY,
        )

      if (!pendingRaw) {
        return
      }

      let pending:
        | SavedCalculation
        | null = null

      try {
        pending =
          JSON.parse(
            pendingRaw,
          ) as SavedCalculation
      } catch {
        sessionStorage.removeItem(
          PENDING_RESTORE_KEY,
        )
        return
      }

      if (
        pending.calculatorId !==
        calculator.id
      ) {
        return
      }

      if (
        restoreCalculation(
          pending,
        )
      ) {
        sessionStorage.removeItem(
          PENDING_RESTORE_KEY,
        )
        setStatus('restored')
      }
    }

    window.addEventListener(
      RESTORE_REQUEST_EVENT,
      handleRestoreRequest,
    )

    return () => {
      window.removeEventListener(
        RESTORE_REQUEST_EVENT,
        handleRestoreRequest,
      )
    }
  }, [calculator.id])

  useEffect(() => {
    if (status === 'idle') {
      return
    }

    const timer =
      window.setTimeout(
        () => setStatus('idle'),
        2800,
      )

    return () =>
      window.clearTimeout(timer)
  }, [status])

  function handleSave() {
    const trimmedName =
      name.trim()

    const fallbackName =
      `${calculator.title} · ${
        new Intl.DateTimeFormat(
          'tr-TR',
          {
            dateStyle: 'short',
            timeStyle: 'short',
          },
        ).format(new Date())
      }`

    const calculation =
      collectCalculation(
        calculator,
        trimmedName ||
          fallbackName,
      )

    if (!calculation) {
      setStatus('error')
      return
    }

    setCalculations(
      (current) => [
        calculation,
        ...current,
      ].slice(
        0,
        MAX_SAVED_CALCULATIONS,
      ),
    )

    setName('')
    setIsExpanded(true)
    setStatus('saved')
  }

  function handleOpen(
    calculation: SavedCalculation,
  ) {
    sessionStorage.setItem(
      PENDING_RESTORE_KEY,
      JSON.stringify(calculation),
    )

    setStatus('opening')

    onOpenCalculator(
      calculation.calculatorId,
    )

    window.setTimeout(
      () => {
        if (
          restoreCalculation(
            calculation,
          )
        ) {
          sessionStorage.removeItem(
            PENDING_RESTORE_KEY,
          )
          setStatus('restored')
        }
      },
      350,
    )
  }

  function handleDelete(
    calculationId: string,
  ) {
    setCalculations(
      (current) =>
        current.filter(
          (calculation) =>
            calculation.id !==
            calculationId,
        ),
    )

    setStatus('deleted')
  }

  function handleClearAll() {
    const confirmed =
      window.confirm(
        'Delete all saved calculations? This cannot be undone.',
      )

    if (!confirmed) {
      return
    }

    setCalculations([])
    setStatus('cleared')
  }

  function handleCsv(
    calculation: SavedCalculation,
  ) {
    downloadCalculationCsv(
      calculation,
    )

    setStatus('csv')
  }

  function handlePrint(
    calculation: SavedCalculation,
  ) {
    const opened =
      printSavedCalculation(
        calculation,
      )

    setStatus(
      opened
        ? 'print'
        : 'error',
    )
  }

  return (
    <section
      className="calculation-history-panel"
      aria-label="Saved calculations"
    >
      <div className="calculation-history-header">
        <div>
          <span>
            Saved calculations
          </span>

          <h3>
            Calculation history
          </h3>

          <p>
            Save the current inputs and
            results locally in this
            browser.
          </p>
        </div>

        <button
          type="button"
          className="history-expand-button"
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
            ? 'Hide history'
            : `View history (${calculations.length})`}
        </button>
      </div>

      <div className="calculation-save-row">
        <label>
          <span>
            Calculation name
          </span>

          <input
            type="text"
            value={name}
            placeholder={`${calculator.title} — optional name`}
            onChange={(event) =>
              setName(
                event.target.value,
              )
            }
            maxLength={80}
          />
        </label>

        <button
          type="button"
          className="calculation-save-button"
          onClick={handleSave}
        >
          ＋ Save calculation
        </button>
      </div>

      <p
        className="calculation-history-status"
        aria-live="polite"
      >
        {status === 'saved'
          ? 'Calculation saved locally.'
          : null}

        {status === 'deleted'
          ? 'Saved calculation deleted.'
          : null}

        {status === 'cleared'
          ? 'Calculation history cleared.'
          : null}

        {status === 'opening'
          ? 'Opening saved calculator…'
          : null}

        {status === 'restored'
          ? 'Saved input values restored. Run the calculation again to refresh the result.'
          : null}

        {status === 'csv'
          ? 'Saved calculation exported as CSV.'
          : null}

        {status === 'print'
          ? 'Printable saved report opened.'
          : null}

        {status === 'error'
          ? 'The calculation could not be read or the report window was blocked.'
          : null}
      </p>

      {isExpanded ? (
        <div className="calculation-history-content">
          <div className="calculation-history-summary">
            <p>
              <strong>
                {calculations.length}
              </strong>{' '}
              saved calculation
              {calculations.length === 1
                ? ''
                : 's'}
            </p>

            <p>
              <strong>
                {
                  currentCalculatorHistory.length
                }
              </strong>{' '}
              for this calculator
            </p>

            {calculations.length > 0 ? (
              <button
                type="button"
                onClick={handleClearAll}
              >
                Clear all
              </button>
            ) : null}
          </div>

          {calculations.length === 0 ? (
            <div className="calculation-history-empty">
              <strong>
                No saved calculations yet
              </strong>

              <p>
                Complete a calculation,
                give it an optional name
                and select Save
                calculation.
              </p>
            </div>
          ) : (
            <div className="calculation-history-list">
              {calculations.map(
                (calculation) => {
                  const primaryResult =
                    calculation.results[0]

                  return (
                    <article
                      id={`saved-calculation-${calculation.id}`}
                      key={
                        calculation.id
                      }
                      className={
                        calculation.calculatorId ===
                        calculator.id
                          ? 'is-current-calculator'
                          : ''
                      }
                    >
                      <div className="history-record-main">
                        <span>
                          {
                            calculation.category
                          }
                        </span>

                        <h4>
                          {
                            calculation.name
                          }
                        </h4>

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

                      <div className="history-record-result">
                        <span>
                          Saved result
                        </span>

                        <strong>
                          {primaryResult
                            ? primaryResult.value
                            : 'No result'}
                        </strong>

                        <small>
                          {primaryResult?.unit ??
                            ''}
                        </small>
                      </div>

                      <div className="history-record-actions">
                        <button
                          type="button"
                          className="history-open-button"
                          onClick={() =>
                            handleOpen(
                              calculation,
                            )
                          }
                        >
                          Open & restore
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleCsv(
                              calculation,
                            )
                          }
                        >
                          CSV
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handlePrint(
                              calculation,
                            )
                          }
                        >
                          Print / PDF
                        </button>

                        <button
                          type="button"
                          className="history-delete-button"
                          onClick={() =>
                            handleDelete(
                              calculation.id,
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
        </div>
      ) : null}
    </section>
  )
}
