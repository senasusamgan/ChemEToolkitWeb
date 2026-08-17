interface ReportValue {
  label?: string
  value?: string
  unit?: string
}

interface ReportSnapshot {
  id?: string
  name?: string
  favorite?: boolean
  capturedAt?: string
  inputs?: ReportValue[]
  results?: ReportValue[]
  formula?: string
  reference?: string
}

export interface NotebookReportRecord {
  calculatorId: string
  calculatorTitle: string
  category: string
  objective?: string
  assumptions?: string
  observations?: string
  conclusion?: string
  snapshots?: ReportSnapshot[]
  updatedAt?: string
}

function text(
  value:
    | string
    | undefined,
): string {
  return (
    value
      ?.trim()
    || '—'
  )
}

function displayValue(
  item: ReportValue,
): string {
  return [
    text(
      item.value,
    ),
    item.unit
      ?.trim(),
  ]
    .filter(
      Boolean,
    )
    .join(' ')
}

function escapeHtml(
  value:
    | string
    | undefined,
): string {
  return (
    value
    ?? ''
  )
    .replace(
      /&/g,
      '&amp;',
    )
    .replace(
      /</g,
      '&lt;',
    )
    .replace(
      />/g,
      '&gt;',
    )
    .replace(
      /"/g,
      '&quot;',
    )
    .replace(
      /'/g,
      '&#039;',
    )
}

function slug(
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

function snapshotTitle(
  snapshot: ReportSnapshot,
  index: number,
): string {
  return (
    snapshot.name
      ?.trim()
    || `Calculation ${index + 1}`
  )
}

export function buildNotebookEngineeringReportMarkdown(
  record: NotebookReportRecord,
): string {
  const snapshots =
    record.snapshots
    ?? []

  const lines = [
    `# ${record.calculatorTitle}`,
    '',
    '## Engineering Calculation Report',
    '',
    `**Category:** ${record.category}`,
    '',
    `**Calculator ID:** \`${record.calculatorId}\``,
    '',
    `**Report generated:** ${new Date().toISOString()}`,
    '',
    `**Notebook updated:** ${record.updatedAt || '—'}`,
    '',
    '## 1. Objective',
    '',
    text(
      record.objective,
    ),
    '',
    '## 2. Assumptions',
    '',
    text(
      record.assumptions,
    ),
    '',
    '## 3. Calculation Record',
    '',
  ]

  if (
    snapshots.length === 0
  ) {
    lines.push(
      'No calculation snapshots have been captured.',
      '',
    )
  }

  snapshots.forEach(
    (
      snapshot,
      index,
    ) => {
      lines.push(
        `### 3.${index + 1} ${snapshotTitle(snapshot, index)}`,
        '',
        `**Captured:** ${snapshot.capturedAt || '—'}`,
        '',
        `**Favorite:** ${snapshot.favorite ? 'Yes' : 'No'}`,
        '',
        '#### Inputs',
        '',
      )

      if (
        snapshot.inputs?.length
      ) {
        snapshot.inputs.forEach(
          (input) => {
            lines.push(
              `- **${text(input.label)}:** ${displayValue(input)}`,
            )
          },
        )
      } else {
        lines.push(
          '- No captured inputs.',
        )
      }

      lines.push(
        '',
        '#### Formula / Model',
        '',
        text(
          snapshot.formula,
        ),
        '',
        '#### Results',
        '',
      )

      if (
        snapshot.results?.length
      ) {
        snapshot.results.forEach(
          (result) => {
            lines.push(
              `- **${text(result.label)}:** ${displayValue(result)}`,
            )
          },
        )
      } else {
        lines.push(
          '- No captured results.',
        )
      }

      lines.push(
        '',
        '#### Reference',
        '',
        text(
          snapshot.reference,
        ),
        '',
      )
    },
  )

  lines.push(
    '## 4. Engineering Observations',
    '',
    text(
      record.observations,
    ),
    '',
    '## 5. Conclusion',
    '',
    text(
      record.conclusion,
    ),
    '',
    '---',
    '',
    'Generated with ChemE Toolkit Scientific Notebook.',
    '',
  )

  return lines.join(
    '\n',
  )
}

function tableRows(
  values:
    | ReportValue[]
    | undefined,
): string {
  if (
    !values?.length
  ) {
    return `
      <tr>
        <td colspan="3">No captured values.</td>
      </tr>
    `
  }

  return values
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(text(item.label))}</td>
          <td>${escapeHtml(text(item.value))}</td>
          <td>${escapeHtml(item.unit || '')}</td>
        </tr>
      `,
    )
    .join('')
}

export function buildNotebookEngineeringReportHtml(
  record: NotebookReportRecord,
): string {
  const snapshots =
    record.snapshots
    ?? []

  const snapshotHtml =
    snapshots.length
      ? snapshots
          .map(
            (
              snapshot,
              index,
            ) => `
              <section class="calculation">
                <h3>
                  3.${index + 1}
                  ${escapeHtml(
                    snapshotTitle(
                      snapshot,
                      index,
                    ),
                  )}
                </h3>

                <p class="meta">
                  Captured:
                  ${escapeHtml(
                    snapshot.capturedAt
                    || '—',
                  )}
                </p>

                <h4>Inputs</h4>

                <table>
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Value</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRows(
                      snapshot.inputs,
                    )}
                  </tbody>
                </table>

                <h4>Formula / Model</h4>
                <pre>${escapeHtml(
                  text(
                    snapshot.formula,
                  ),
                )}</pre>

                <h4>Results</h4>

                <table>
                  <thead>
                    <tr>
                      <th>Result</th>
                      <th>Value</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRows(
                      snapshot.results,
                    )}
                  </tbody>
                </table>

                <h4>Reference</h4>

                <p>
                  ${escapeHtml(
                    text(
                      snapshot.reference,
                    ),
                  )}
                </p>
              </section>
            `,
          )
          .join('')
      : `
          <p>
            No calculation snapshots have been captured.
          </p>
        `

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >
  <title>${escapeHtml(record.calculatorTitle)} — Engineering Report</title>

  <style>
    :root {
      font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        sans-serif;
      color: #111827;
    }

    body {
      max-width: 920px;
      margin: 0 auto;
      padding: 48px;
      line-height: 1.55;
    }

    header {
      border-bottom: 2px solid #111827;
      padding-bottom: 20px;
      margin-bottom: 28px;
    }

    h1,
    h2,
    h3,
    h4 {
      break-after: avoid;
    }

    h1 {
      margin-bottom: 4px;
    }

    .meta {
      color: #4b5563;
      font-size: 0.9rem;
    }

    section {
      margin: 28px 0;
    }

    .calculation {
      border-top: 1px solid #d1d5db;
      padding-top: 20px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 20px;
    }

    th,
    td {
      border: 1px solid #d1d5db;
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #f3f4f6;
    }

    pre {
      padding: 12px;
      border: 1px solid #d1d5db;
      background: #f9fafb;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #d1d5db;
      color: #6b7280;
      font-size: 0.82rem;
    }

    @media print {
      body {
        max-width: none;
        padding: 0;
      }

      .calculation {
        break-inside: avoid;
      }
    }
  </style>
</head>

<body>
  <header>
    <p class="meta">
      ChemE Toolkit — Engineering Calculation Report
    </p>

    <h1>
      ${escapeHtml(record.calculatorTitle)}
    </h1>

    <p>
      ${escapeHtml(record.category)}
    </p>

    <p class="meta">
      Calculator ID:
      ${escapeHtml(record.calculatorId)}
    </p>
  </header>

  <section>
    <h2>1. Objective</h2>
    <p>${escapeHtml(text(record.objective))}</p>
  </section>

  <section>
    <h2>2. Assumptions</h2>
    <p>${escapeHtml(text(record.assumptions))}</p>
  </section>

  <section>
    <h2>3. Calculation Record</h2>
    ${snapshotHtml}
  </section>

  <section>
    <h2>4. Engineering Observations</h2>
    <p>${escapeHtml(text(record.observations))}</p>
  </section>

  <section>
    <h2>5. Conclusion</h2>
    <p>${escapeHtml(text(record.conclusion))}</p>
  </section>

  <footer>
    Generated with ChemE Toolkit Scientific Notebook
    on ${escapeHtml(new Date().toISOString())}.
  </footer>
</body>
</html>`
}

export function downloadNotebookEngineeringReport(
  record: NotebookReportRecord,
) {
  const content =
    buildNotebookEngineeringReportMarkdown(
      record,
    )

  const blob =
    new Blob(
      [
        content,
      ],
      {
        type:
          'text/markdown;charset=utf-8',
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
    `${
      slug(
        record.calculatorTitle,
      )
      || record.calculatorId
    }-engineering-report.md`

  document.body.appendChild(
    anchor,
  )

  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(
    url,
  )
}

export function printNotebookEngineeringReport(
  record: NotebookReportRecord,
): boolean {
  const html =
    buildNotebookEngineeringReportHtml(
      record,
    )

  const blob =
    new Blob(
      [
        html,
      ],
      {
        type:
          'text/html;charset=utf-8',
      },
    )

  const url =
    URL.createObjectURL(
      blob,
    )

  const reportWindow =
    window.open(
      url,
      '_blank',
    )

  if (!reportWindow) {
    URL.revokeObjectURL(
      url,
    )

    return false
  }

  reportWindow.opener =
    null

  reportWindow.addEventListener(
    'load',
    () => {
      reportWindow.focus()
      reportWindow.print()

      window.setTimeout(
        () =>
          URL.revokeObjectURL(
            url,
          ),
        1000,
      )
    },
    {
      once: true,
    },
  )

  return true
}
