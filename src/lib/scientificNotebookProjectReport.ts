import type {
  NotebookReportRecord,
} from './scientificNotebookReport'

interface ProjectReportOptions {
  title: string
  notebooks: NotebookReportRecord[]
}

interface ReportValue {
  label?: string
  value?: string
  unit?: string
}

function clean(
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
  value: ReportValue,
): string {
  return [
    clean(
      value.value,
    ),
    value.unit
      ?.trim(),
  ]
    .filter(Boolean)
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

function snapshotCount(
  notebooks:
    NotebookReportRecord[],
): number {
  return notebooks.reduce(
    (
      total,
      notebook,
    ) =>
      total
      + (
          notebook.snapshots
            ?.length
          ?? 0
        ),
    0,
  )
}

function categoryCount(
  notebooks:
    NotebookReportRecord[],
): number {
  return new Set(
    notebooks.map(
      (notebook) =>
        notebook.category,
    ),
  ).size
}

export function buildProjectEngineeringReportMarkdown({
  title,
  notebooks,
}: ProjectReportOptions): string {
  const projectTitle =
    title.trim()
    || 'Engineering Project Report'

  const generatedAt =
    new Date()
      .toISOString()

  const lines = [
    `# ${projectTitle}`,
    '',
    '## ChemE Toolkit Engineering Project Report',
    '',
    `**Generated:** ${generatedAt}`,
    '',
    `**Calculators:** ${notebooks.length}`,
    '',
    `**Calculation snapshots:** ${snapshotCount(notebooks)}`,
    '',
    `**Engineering categories:** ${categoryCount(notebooks)}`,
    '',
    '## Report Contents',
    '',
  ]

  notebooks.forEach(
    (
      notebook,
      index,
    ) => {
      lines.push(
        `${index + 1}. ${notebook.calculatorTitle} — ${notebook.category}`,
      )
    },
  )

  lines.push(
    '',
    '---',
    '',
  )

  notebooks.forEach(
    (
      notebook,
      notebookIndex,
    ) => {
      const section =
        notebookIndex + 1

      const snapshots =
        notebook.snapshots
        ?? []

      lines.push(
        `## ${section}. ${notebook.calculatorTitle}`,
        '',
        `**Category:** ${notebook.category}`,
        '',
        `**Calculator ID:** \`${notebook.calculatorId}\``,
        '',
        `### ${section}.1 Objective`,
        '',
        clean(
          notebook.objective,
        ),
        '',
        `### ${section}.2 Assumptions`,
        '',
        clean(
          notebook.assumptions,
        ),
        '',
        `### ${section}.3 Calculation Evidence`,
        '',
      )

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
          snapshotIndex,
        ) => {
          const snapshotTitle =
            snapshot.name
              ?.trim()
            || `Calculation ${snapshotIndex + 1}`

          lines.push(
            `#### ${section}.3.${snapshotIndex + 1} ${snapshotTitle}`,
            '',
            `**Captured:** ${snapshot.capturedAt || '—'}`,
            '',
            '##### Inputs',
            '',
          )

          if (
            snapshot.inputs
              ?.length
          ) {
            snapshot.inputs.forEach(
              (input) => {
                lines.push(
                  `- **${clean(input.label)}:** ${displayValue(input)}`,
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
            '##### Formula / Model',
            '',
            clean(
              snapshot.formula,
            ),
            '',
            '##### Results',
            '',
          )

          if (
            snapshot.results
              ?.length
          ) {
            snapshot.results.forEach(
              (result) => {
                lines.push(
                  `- **${clean(result.label)}:** ${displayValue(result)}`,
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
            '##### Reference',
            '',
            clean(
              snapshot.reference,
            ),
            '',
          )
        },
      )

      lines.push(
        `### ${section}.4 Engineering Observations`,
        '',
        clean(
          notebook.observations,
        ),
        '',
        `### ${section}.5 Conclusion`,
        '',
        clean(
          notebook.conclusion,
        ),
        '',
        '---',
        '',
      )
    },
  )

  lines.push(
    '## Project Record Summary',
    '',
    `This report combines ${notebooks.length} calculator notebooks, ${snapshotCount(notebooks)} calculation snapshots and ${categoryCount(notebooks)} engineering categories.`,
    '',
    'Generated with ChemE Toolkit Scientific Notebook.',
    '',
  )

  return lines.join(
    '\n',
  )
}

function valueRows(
  values:
    | ReportValue[]
    | undefined,
): string {
  if (
    !values?.length
  ) {
    return `
      <tr>
        <td colspan="3">
          No captured values.
        </td>
      </tr>
    `
  }

  return values
    .map(
      (value) => `
        <tr>
          <td>
            ${escapeHtml(
              clean(
                value.label,
              ),
            )}
          </td>

          <td>
            ${escapeHtml(
              clean(
                value.value,
              ),
            )}
          </td>

          <td>
            ${escapeHtml(
              value.unit
              || '',
            )}
          </td>
        </tr>
      `,
    )
    .join('')
}

export function buildProjectEngineeringReportHtml({
  title,
  notebooks,
}: ProjectReportOptions): string {
  const projectTitle =
    title.trim()
    || 'Engineering Project Report'

  const notebookHtml =
    notebooks
      .map(
        (
          notebook,
          notebookIndex,
        ) => {
          const section =
            notebookIndex + 1

          const snapshots =
            notebook.snapshots
            ?? []

          const snapshotsHtml =
            snapshots.length
              ? snapshots
                  .map(
                    (
                      snapshot,
                      snapshotIndex,
                    ) => `
                      <section class="calculation">
                        <h3>
                          ${section}.3.${snapshotIndex + 1}
                          ${escapeHtml(
                            snapshot.name
                              ?.trim()
                            || `Calculation ${snapshotIndex + 1}`,
                          )}
                        </h3>

                        <p class="meta">
                          Captured:
                          ${escapeHtml(
                            snapshot.capturedAt
                            || '—',
                          )}
                        </p>

                        <h4>
                          Inputs
                        </h4>

                        <table>
                          <thead>
                            <tr>
                              <th>Parameter</th>
                              <th>Value</th>
                              <th>Unit</th>
                            </tr>
                          </thead>

                          <tbody>
                            ${valueRows(
                              snapshot.inputs,
                            )}
                          </tbody>
                        </table>

                        <h4>
                          Formula / Model
                        </h4>

                        <pre>${escapeHtml(
                          clean(
                            snapshot.formula,
                          ),
                        )}</pre>

                        <h4>
                          Results
                        </h4>

                        <table>
                          <thead>
                            <tr>
                              <th>Result</th>
                              <th>Value</th>
                              <th>Unit</th>
                            </tr>
                          </thead>

                          <tbody>
                            ${valueRows(
                              snapshot.results,
                            )}
                          </tbody>
                        </table>

                        <h4>
                          Reference
                        </h4>

                        <p>
                          ${escapeHtml(
                            clean(
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

          return `
            <article class="notebook-report">
              <header>
                <p class="section-number">
                  Calculator ${section}
                </p>

                <h2>
                  ${escapeHtml(
                    notebook.calculatorTitle,
                  )}
                </h2>

                <p class="meta">
                  ${escapeHtml(
                    notebook.category,
                  )}
                  ·
                  ${escapeHtml(
                    notebook.calculatorId,
                  )}
                </p>
              </header>

              <section>
                <h3>
                  ${section}.1 Objective
                </h3>

                <p>
                  ${escapeHtml(
                    clean(
                      notebook.objective,
                    ),
                  )}
                </p>
              </section>

              <section>
                <h3>
                  ${section}.2 Assumptions
                </h3>

                <p>
                  ${escapeHtml(
                    clean(
                      notebook.assumptions,
                    ),
                  )}
                </p>
              </section>

              <section>
                <h3>
                  ${section}.3 Calculation Evidence
                </h3>

                ${snapshotsHtml}
              </section>

              <section>
                <h3>
                  ${section}.4 Engineering Observations
                </h3>

                <p>
                  ${escapeHtml(
                    clean(
                      notebook.observations,
                    ),
                  )}
                </p>
              </section>

              <section>
                <h3>
                  ${section}.5 Conclusion
                </h3>

                <p>
                  ${escapeHtml(
                    clean(
                      notebook.conclusion,
                    ),
                  )}
                </p>
              </section>
            </article>
          `
        },
      )
      .join('')

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >

  <title>
    ${escapeHtml(projectTitle)}
  </title>

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
      max-width: 960px;
      margin: 0 auto;
      padding: 48px;
      line-height: 1.55;
    }

    .project-header {
      padding-bottom: 24px;
      border-bottom: 3px solid #111827;
      margin-bottom: 36px;
    }

    .project-header h1 {
      margin: 4px 0;
    }

    .meta,
    .section-number {
      color: #4b5563;
      font-size: 0.88rem;
    }

    .summary {
      display: grid;
      grid-template-columns:
        repeat(
          3,
          minmax(0, 1fr)
        );
      gap: 12px;
      margin: 24px 0;
    }

    .summary div {
      border: 1px solid #d1d5db;
      padding: 12px;
    }

    .summary strong {
      display: block;
      font-size: 1.2rem;
    }

    .notebook-report {
      margin-top: 48px;
      padding-top: 28px;
      border-top: 2px solid #111827;
    }

    .notebook-report > header {
      margin-bottom: 24px;
    }

    .calculation {
      padding-top: 18px;
      margin-top: 24px;
      border-top: 1px solid #d1d5db;
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
      margin-top: 48px;
      padding-top: 20px;
      border-top: 1px solid #d1d5db;
      color: #6b7280;
      font-size: 0.82rem;
    }

    @media print {
      body {
        max-width: none;
        padding: 0;
      }

      .notebook-report {
        break-before: page;
      }

      .notebook-report:first-of-type {
        break-before: auto;
      }

      .calculation {
        break-inside: avoid;
      }
    }
  </style>
</head>

<body>
  <header class="project-header">
    <p class="meta">
      ChemE Toolkit
      ·
      Multi-Notebook Engineering Report
    </p>

    <h1>
      ${escapeHtml(projectTitle)}
    </h1>

    <p class="meta">
      Generated:
      ${escapeHtml(
        new Date()
          .toISOString(),
      )}
    </p>

    <div class="summary">
      <div>
        <strong>
          ${notebooks.length}
        </strong>

        Calculators
      </div>

      <div>
        <strong>
          ${snapshotCount(notebooks)}
        </strong>

        Calculation snapshots
      </div>

      <div>
        <strong>
          ${categoryCount(notebooks)}
        </strong>

        Engineering categories
      </div>
    </div>
  </header>

  ${notebookHtml}

  <footer>
    Generated with
    ChemE Toolkit Scientific Notebook.
  </footer>
</body>
</html>`
}

function downloadText(
  filename: string,
  content: string,
  type: string,
) {
  const blob =
    new Blob(
      [
        content,
      ],
      {
        type,
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
  anchor.download = filename

  document.body.appendChild(
    anchor,
  )

  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(
    url,
  )
}

export function downloadProjectEngineeringReport(
  options: ProjectReportOptions,
) {
  const title =
    options.title.trim()
    || 'engineering-project-report'

  downloadText(
    `${
      slug(title)
      || 'engineering-project-report'
    }.md`,
    buildProjectEngineeringReportMarkdown(
      options,
    ),
    'text/markdown;charset=utf-8',
  )
}

export function printProjectEngineeringReport(
  options: ProjectReportOptions,
): boolean {
  const html =
    buildProjectEngineeringReportHtml(
      options,
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
