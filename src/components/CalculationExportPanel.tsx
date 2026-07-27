import { useState } from 'react'
import type { CalculatorDefinition } from '../types/calculator'
import '../styles/calculation-export.css'

interface CalculationExportPanelProps {
  calculator: CalculatorDefinition
}

interface ExportRow {
  section: string
  label: string
  value: string
  unit: string
}

interface CalculationSnapshot {
  calculatorTitle: string
  category: string
  generatedAt: string
  inputs: ExportRow[]
  results: ExportRow[]
  formula: string
  reference: string
}

function normalizeText(value: string | null | undefined): string {
  return value
    ?.replace(/\s+/g, ' ')
    .trim() ?? ''
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

function createFileSlug(value: string): string {
  return value
    .toLocaleLowerCase('en-US')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getCalculatorRoot(): ParentNode | null {
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

function findLabelText(
  control: HTMLInputElement |
    HTMLSelectElement |
    HTMLTextAreaElement,
): string {
  const label = control.closest('label')

  if (label) {
    const directLabel =
      label.querySelector<HTMLElement>(
        ':scope > span:first-child',
      )

    const directLabelText =
      normalizeText(directLabel?.textContent)

    if (directLabelText) {
      return directLabelText
    }

    const labelText =
      normalizeText(label.textContent)

    if (labelText) {
      return labelText
        .replace(
          normalizeText(control.value),
          '',
        )
        .trim()
    }
  }

  return (
    control.getAttribute('aria-label') ??
    control.getAttribute('name') ??
    control.getAttribute('placeholder') ??
    'Input'
  )
}

function findUnit(
  control: HTMLInputElement |
    HTMLSelectElement |
    HTMLTextAreaElement,
): string {
  const inputShell =
    control.closest('.native-input-shell')

  const shellUnit =
    normalizeText(
      inputShell?.querySelector('b')
        ?.textContent,
    )

  if (shellUnit) {
    return shellUnit
  }

  const parentUnit =
    normalizeText(
      control.parentElement
        ?.querySelector(
          ':scope > b, :scope > span:last-child',
        )
        ?.textContent,
    )

  return parentUnit
}

function collectSnapshot(
  calculator: CalculatorDefinition,
): CalculationSnapshot | null {
  const root = getCalculatorRoot()

  if (!root) {
    return null
  }

  const inputs: ExportRow[] = []

  root
    .querySelectorAll<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >('input, select, textarea')
    .forEach((control) => {
      if (
        control.type === 'hidden' ||
        control.type === 'button' ||
        control.type === 'submit'
      ) {
        return
      }

      const value =
        control instanceof HTMLSelectElement
          ? normalizeText(
              control.selectedOptions[0]
                ?.textContent,
            )
          : normalizeText(control.value)

      inputs.push({
        section: 'Input',
        label: findLabelText(control),
        value: value || 'Not entered',
        unit: findUnit(control),
      })
    })

  const results: ExportRow[] = []

  const headline =
    root.querySelector<HTMLElement>(
      '.native-result-heading',
    )

  if (headline) {
    const headlineLabel =
      normalizeText(
        headline.querySelector('p')
          ?.textContent,
      )

    const headlineValue =
      normalizeText(
        headline.querySelector('strong')
          ?.textContent,
      )

    const headlineUnit =
      normalizeText(
        headline.querySelector(
          ':scope > span',
        )?.textContent,
      )

    if (headlineLabel || headlineValue) {
      results.push({
        section: 'Primary result',
        label:
          headlineLabel ||
          'Calculated result',
        value:
          headlineValue ||
          'Not calculated',
        unit: headlineUnit,
      })
    }
  }

  root
    .querySelectorAll<HTMLElement>(
      '.native-result-grid article',
    )
    .forEach((article) => {
      results.push({
        section: 'Result',
        label:
          normalizeText(
            article.querySelector('p')
              ?.textContent,
          ) || 'Result',
        value:
          normalizeText(
            article.querySelector('strong')
              ?.textContent,
          ) || '—',
        unit: normalizeText(
          article.querySelector('span')
            ?.textContent,
        ),
      })
    })

  if (results.length === 0) {
    const resultPanel =
      root.querySelector<HTMLElement>(
        '.native-result-panel',
      )

    const resultText =
      normalizeText(resultPanel?.textContent)

    if (resultText) {
      results.push({
        section: 'Result',
        label: 'Calculated output',
        value: resultText,
        unit: '',
      })
    }
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
    calculatorTitle: calculator.title,
    category: calculator.category,
    generatedAt:
      new Intl.DateTimeFormat(
        'tr-TR',
        {
          dateStyle: 'long',
          timeStyle: 'short',
        },
      ).format(new Date()),
    inputs,
    results,
    formula,
    reference,
  }
}

function downloadCsv(
  snapshot: CalculationSnapshot,
) {
  const rows: string[][] = [
    [
      'ChemE Toolkit Calculation Report',
      '',
      '',
      '',
    ],
    [
      'Calculator',
      snapshot.calculatorTitle,
      '',
      '',
    ],
    [
      'Category',
      snapshot.category,
      '',
      '',
    ],
    [
      'Generated at',
      snapshot.generatedAt,
      '',
      '',
    ],
    ['', '', '', ''],
    ['Section', 'Label', 'Value', 'Unit'],
    ...snapshot.inputs.map((row) => [
      row.section,
      row.label,
      row.value,
      row.unit,
    ]),
    ...snapshot.results.map((row) => [
      row.section,
      row.label,
      row.value,
      row.unit,
    ]),
    ['', '', '', ''],
    [
      'Formula',
      snapshot.formula ||
        'Not provided',
      '',
      '',
    ],
    [
      'Reference basis',
      snapshot.reference ||
        'Not provided',
      '',
      '',
    ],
  ]

  const csv =
    '\uFEFF' +
    rows
      .map((row) =>
        row.map(escapeCsv).join(';'),
      )
      .join('\n')

  const blob =
    new Blob(
      [csv],
      {
        type:
          'text/csv;charset=utf-8;',
      },
    )

  const url =
    URL.createObjectURL(blob)

  const link =
    document.createElement('a')

  const date =
    new Date()
      .toISOString()
      .slice(0, 10)

  link.href = url
  link.download =
    `${createFileSlug(
      snapshot.calculatorTitle,
    )}-${date}.csv`

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

function createTableRows(
  rows: ExportRow[],
): string {
  if (rows.length === 0) {
    return `
      <tr>
        <td colspan="3">
          No data available.
        </td>
      </tr>
    `
  }

  return rows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.label)}</td>
          <td>${escapeHtml(row.value)}</td>
          <td>${escapeHtml(row.unit)}</td>
        </tr>
      `,
    )
    .join('')
}

function printReport(
  snapshot: CalculationSnapshot,
) {
  const reportWindow =
    window.open('', '_blank')

  if (!reportWindow) {
    return false
  }

  const formulaBlock =
    snapshot.formula
      ? `
        <section>
          <h2>Formula / model</h2>
          <div class="note">
            ${escapeHtml(snapshot.formula)}
          </div>
        </section>
      `
      : ''

  const referenceBlock =
    snapshot.reference
      ? `
        <section>
          <h2>Reference basis</h2>
          <div class="note">
            ${escapeHtml(snapshot.reference)}
          </div>
        </section>
      `
      : ''

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
            snapshot.calculatorTitle,
          )} — ChemE Toolkit
        </title>

        <style>
          :root {
            color: #0b3556;
            background: #ffffff;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          * {
            box-sizing: border-box;
          }

          body {
            max-width: 900px;
            margin: 0 auto;
            padding: 42px;
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
            font-size: 38px;
            line-height: 1.05;
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
              font-size: 30px;
            }

            .meta {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>

      <body>
        <header>
          <p class="eyebrow">
            ChemE Toolkit · Engineering calculation report
          </p>

          <h1>
            ${escapeHtml(
              snapshot.calculatorTitle,
            )}
          </h1>

          <div class="meta">
            <span>
              <strong>Category:</strong>
              ${escapeHtml(snapshot.category)}
            </span>

            <span>
              <strong>Generated:</strong>
              ${escapeHtml(
                snapshot.generatedAt,
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
              ${createTableRows(
                snapshot.inputs,
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
              ${createTableRows(
                snapshot.results,
              )}
            </tbody>
          </table>
        </section>

        ${formulaBlock}
        ${referenceBlock}

        <footer>
          Results are intended for education,
          preliminary screening and independent
          engineering checks. Safety-critical and
          final design decisions must be verified
          against applicable codes, standards,
          property data and qualified engineering
          review.
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

export function CalculationExportPanel({
  calculator,
}: CalculationExportPanelProps) {
  const [status, setStatus] =
    useState<
      'idle' |
      'csv' |
      'print' |
      'error'
    >('idle')

  function createSnapshot() {
    const snapshot =
      collectSnapshot(calculator)

    if (!snapshot) {
      setStatus('error')
      return null
    }

    return snapshot
  }

  function handleCsvExport() {
    const snapshot = createSnapshot()

    if (!snapshot) {
      return
    }

    downloadCsv(snapshot)
    setStatus('csv')

    window.setTimeout(
      () => setStatus('idle'),
      2200,
    )
  }

  function handlePrintReport() {
    const snapshot = createSnapshot()

    if (!snapshot) {
      return
    }

    const opened =
      printReport(snapshot)

    setStatus(
      opened
        ? 'print'
        : 'error',
    )

    window.setTimeout(
      () => setStatus('idle'),
      2600,
    )
  }

  return (
    <section
      className="calculation-export-panel"
      aria-label="Calculation export tools"
    >
      <div className="calculation-export-copy">
        <span>Calculation report</span>
        <p>
          Export the current values and results,
          or open a print-ready report that can
          be saved as PDF.
        </p>
      </div>

      <div className="calculation-export-actions">
        <button
          type="button"
          onClick={handleCsvExport}
        >
          ↓ Export CSV
        </button>

        <button
          type="button"
          className="calculation-export-primary"
          onClick={handlePrintReport}
        >
          ▦ Print / Save PDF
        </button>
      </div>

      <p
        className="calculation-export-status"
        aria-live="polite"
      >
        {status === 'csv'
          ? 'CSV downloaded.'
          : null}

        {status === 'print'
          ? 'Print report opened.'
          : null}

        {status === 'error'
          ? 'The calculation data could not be read. Calculate once and try again.'
          : null}
      </p>
    </section>
  )
}
