import {
  getProjectSetActivityTimestamp,
  normalizeProjectDueDate,
  normalizeProjectPriority,
  normalizeProjectProgress,
  normalizeProjectReviewInterval,
  normalizeProjectReviewTimestamp,
  type NotebookProjectSet,
} from './scientificNotebookProjectSets'

interface PortfolioMetrics {
  total: number
  planned: number
  active: number
  blocked: number
  complete: number
  reviewDue: number
  reviewSoon: number
  averageProgress: number
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

function projectProgress(
  projectSet:
    NotebookProjectSet,
): number {
  return projectSet.status ===
    'complete'
    ? 100
    : normalizeProjectProgress(
        projectSet.progress,
      )
}

type ProjectReviewState =
  | 'complete'
  | 'overdue'
  | 'due-soon'
  | 'scheduled'

function projectReviewInterval(
  projectSet:
    NotebookProjectSet,
): number {
  return normalizeProjectReviewInterval(
    projectSet.reviewIntervalDays,
  )
}

function projectNextReviewTimestamp(
  projectSet:
    NotebookProjectSet,
): number {
  if (
    projectSet.status ===
    'complete'
  ) {
    return Number.POSITIVE_INFINITY
  }

  return (
    getProjectSetActivityTimestamp(
      projectSet,
    )
    + projectReviewInterval(
        projectSet,
      )
      * 86_400_000
  )
}

function projectReviewState(
  projectSet:
    NotebookProjectSet,
): ProjectReviewState {
  if (
    projectSet.status ===
    'complete'
  ) {
    return 'complete'
  }

  const remaining =
    projectNextReviewTimestamp(
      projectSet,
    )
    - Date.now()

  if (
    remaining <= 0
  ) {
    return 'overdue'
  }

  if (
    remaining <=
      3 * 86_400_000
  ) {
    return 'due-soon'
  }

  return 'scheduled'
}

function projectReviewStateLabel(
  projectSet:
    NotebookProjectSet,
): string {
  const state =
    projectReviewState(
      projectSet,
    )

  if (
    state === 'complete'
  ) {
    return 'Complete'
  }

  if (
    state === 'overdue'
  ) {
    return 'Review due'
  }

  if (
    state === 'due-soon'
  ) {
    return 'Review in 3 days'
  }

  return 'Scheduled'
}

function projectLastReviewed(
  projectSet:
    NotebookProjectSet,
): string | undefined {
  return normalizeProjectReviewTimestamp(
    projectSet.lastReviewedAt,
  )
}

function projectNextReview(
  projectSet:
    NotebookProjectSet,
): string | undefined {
  const timestamp =
    projectNextReviewTimestamp(
      projectSet,
    )

  if (
    !Number.isFinite(
      timestamp,
    )
  ) {
    return undefined
  }

  return new Date(
    timestamp,
  ).toISOString()
}

function projectLastActivity(
  projectSet:
    NotebookProjectSet,
): string {
  return new Date(
    getProjectSetActivityTimestamp(
      projectSet,
    ),
  ).toISOString()
}

function buildMetrics(
  projectSets:
    NotebookProjectSet[],
): PortfolioMetrics {
  let planned = 0
  let active = 0
  let blocked = 0
  let complete = 0
  let reviewDue = 0
  let reviewSoon = 0
  let progressTotal = 0

  for (
    const projectSet
    of projectSets
  ) {
    const status =
      projectSet.status
      ?? 'planned'

    if (
      status ===
      'active'
    ) {
      active += 1
    } else if (
      status ===
      'blocked'
    ) {
      blocked += 1
    } else if (
      status ===
      'complete'
    ) {
      complete += 1
    } else {
      planned += 1
    }

    const reviewState =
      projectReviewState(
        projectSet,
      )

    if (
      reviewState ===
      'overdue'
    ) {
      reviewDue += 1
    } else if (
      reviewState ===
      'due-soon'
    ) {
      reviewSoon += 1
    }

    progressTotal +=
      projectProgress(
        projectSet,
      )
  }

  return {
    total:
      projectSets.length,
    planned,
    active,
    blocked,
    complete,
    reviewDue,
    reviewSoon,
    averageProgress:
      projectSets.length
        ? Math.round(
            progressTotal
            / projectSets.length,
          )
        : 0,
  }
}

function markdownCell(
  value:
    | string
    | undefined,
): string {
  return clean(
    value,
  )
    .replace(
      /\|/g,
      '\\|',
    )
    .replace(
      /\r?\n/g,
      ' ',
    )
}

function csvCell(
  value:
    | string
    | number
    | undefined,
): string {
  const text =
    String(
      value
      ?? '',
    )

  return `"${text.replace(
    /"/g,
    '""',
  )}"`
}

function slug(
  value: string,
): string {
  return value
    .toLocaleLowerCase(
      'en-US',
    )
    .normalize(
      'NFD',
    )
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

function downloadText(
  content: string,
  filename: string,
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

  anchor.href =
    url

  anchor.download =
    filename

  document.body.append(
    anchor,
  )

  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(
    url,
  )
}

export function buildProjectPortfolioMarkdown(
  projectSets:
    NotebookProjectSet[],
): string {
  const metrics =
    buildMetrics(
      projectSets,
    )

  const generatedAt =
    new Date()
      .toISOString()

  const lines = [
    '# ChemE Toolkit Project Portfolio',
    '',
    `Generated: ${generatedAt}`,
    '',
    '## Portfolio Summary',
    '',
    `- Total projects: ${metrics.total}`,
    `- Planned: ${metrics.planned}`,
    `- Active: ${metrics.active}`,
    `- Blocked: ${metrics.blocked}`,
    `- Complete: ${metrics.complete}`,
    `- Reviews due: ${metrics.reviewDue}`,
    `- Reviews due soon: ${metrics.reviewSoon}`,
    `- Average progress: ${metrics.averageProgress}%`,
    '',
    '## Project Register',
    '',
    '| Project | Status | Priority | Progress | Due date | Review cadence | Last reviewed | Next review | Review status | Next action | Calculators | Tags |',
    '| --- | --- | --- | ---: | --- | ---: | --- | --- | --- | --- | ---: | --- |',
  ]

  for (
    const projectSet
    of projectSets
  ) {
    lines.push(
      [
        '',
        markdownCell(
          projectSet.name,
        ),
        markdownCell(
          projectSet.status
          ?? 'planned',
        ),
        markdownCell(
          normalizeProjectPriority(
            projectSet.priority,
          ),
        ),
        `${projectProgress(
          projectSet,
        )}%`,
        markdownCell(
          normalizeProjectDueDate(
            projectSet.dueDate,
          ),
        ),
        String(
          projectReviewInterval(
            projectSet,
          ),
        ),
        markdownCell(
          projectLastReviewed(
            projectSet,
          ),
        ),
        markdownCell(
          projectNextReview(
            projectSet,
          ),
        ),
        markdownCell(
          projectReviewStateLabel(
            projectSet,
          ),
        ),
        markdownCell(
          projectSet.nextAction,
        ),
        String(
          projectSet
            .calculatorIds
            .length,
        ),
        markdownCell(
          (
            projectSet.tags
            ?? []
          ).join(
            ', ',
          ),
        ),
        '',
      ].join(
        ' | ',
      ),
    )
  }

  lines.push(
    '',
    '## Project Details',
    '',
  )

  projectSets.forEach(
    (
      projectSet,
      index,
    ) => {
      lines.push(
        `### ${index + 1}. ${projectSet.name}`,
        '',
        `Status: ${projectSet.status ?? 'planned'}`,
        '',
        `Priority: ${normalizeProjectPriority(projectSet.priority)}`,
        '',
        `Progress: ${projectProgress(projectSet)}%`,
        '',
        `Due date: ${clean(normalizeProjectDueDate(projectSet.dueDate))}`,
        '',
        `Review cadence: ${projectReviewInterval(projectSet)} days`,
        '',
        `Last reviewed: ${clean(projectLastReviewed(projectSet))}`,
        '',
        `Next review: ${clean(projectNextReview(projectSet))}`,
        '',
        `Review status: ${projectReviewStateLabel(projectSet)}`,
        '',
        `Last activity: ${projectLastActivity(projectSet)}`,
        '',
        `Next action: ${clean(projectSet.nextAction)}`,
        '',
        `Description: ${clean(projectSet.description)}`,
        '',
        `Report title: ${clean(projectSet.reportTitle)}`,
        '',
        `Calculators: ${projectSet.calculatorIds.length}`,
        '',
        `Tags: ${clean((projectSet.tags ?? []).join(', '))}`,
        '',
        `Last updated: ${projectSet.updatedAt}`,
        '',
      )
    },
  )

  lines.push(
    'Generated with ChemE Toolkit Scientific Notebook.',
    '',
  )

  return lines.join(
    '\n',
  )
}

export function buildProjectPortfolioCsv(
  projectSets:
    NotebookProjectSet[],
): string {
  const rows = [
    [
      'Project',
      'Report Title',
      'Status',
      'Priority',
      'Progress %',
      'Due Date',
      'Review Cadence Days',
      'Last Reviewed At',
      'Next Review At',
      'Review Status',
      'Last Activity At',
      'Next Action',
      'Description',
      'Calculator Count',
      'Tags',
      'Created At',
      'Updated At',
    ],
  ]

  for (
    const projectSet
    of projectSets
  ) {
    rows.push(
      [
        projectSet.name,
        projectSet.reportTitle,
        projectSet.status
        ?? 'planned',
        normalizeProjectPriority(
          projectSet.priority,
        ),
        String(
          projectProgress(
            projectSet,
          ),
        ),
        normalizeProjectDueDate(
          projectSet.dueDate,
        )
        ?? '',
        String(
          projectReviewInterval(
            projectSet,
          ),
        ),
        projectLastReviewed(
          projectSet,
        )
        ?? '',
        projectNextReview(
          projectSet,
        )
        ?? '',
        projectReviewStateLabel(
          projectSet,
        ),
        projectLastActivity(
          projectSet,
        ),
        projectSet.nextAction
        ?? '',
        projectSet.description
        ?? '',
        String(
          projectSet
            .calculatorIds
            .length,
        ),
        (
          projectSet.tags
          ?? []
        ).join(
          ', ',
        ),
        projectSet.createdAt,
        projectSet.updatedAt,
      ],
    )
  }

  return rows
    .map(
      (row) =>
        row
          .map(
            csvCell,
          )
          .join(
            ',',
          ),
    )
    .join(
      '\n',
    )
}

export function downloadProjectPortfolioMarkdown(
  projectSets:
    NotebookProjectSet[],
) {
  const filename =
    `${
      slug(
        'ChemE Toolkit Project Portfolio',
      )
    || 'project-portfolio'
    }.md`

  downloadText(
    buildProjectPortfolioMarkdown(
      projectSets,
    ),
    filename,
    'text/markdown;charset=utf-8',
  )
}

export function downloadProjectPortfolioCsv(
  projectSets:
    NotebookProjectSet[],
) {
  downloadText(
    buildProjectPortfolioCsv(
      projectSets,
    ),
    'cheme-toolkit-project-portfolio.csv',
    'text/csv;charset=utf-8',
  )
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

function titleCase(
  value: string,
): string {
  return value
    .replace(
      /-/g,
      ' ',
    )
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    )
}

export function buildProjectPortfolioHtml(
  projectSets:
    NotebookProjectSet[],
): string {
  const metrics =
    buildMetrics(
      projectSets,
    )

  const generatedAt =
    new Date()
      .toISOString()

  const projectRows =
    projectSets
      .map(
        (projectSet) => `
          <tr>
            <td>
              <strong>
                ${escapeHtml(
                  projectSet.name,
                )}
              </strong>
            </td>

            <td>
              ${escapeHtml(
                titleCase(
                  projectSet.status
                  ?? 'planned',
                ),
              )}
            </td>

            <td>
              ${escapeHtml(
                titleCase(
                  normalizeProjectPriority(
                    projectSet.priority,
                  ),
                ),
              )}
            </td>

            <td>
              ${projectProgress(
                projectSet,
              )}%
            </td>

            <td>
              ${escapeHtml(
                normalizeProjectDueDate(
                  projectSet.dueDate,
                )
                ?? '—',
              )}
            </td>

            <td>
              ${projectReviewInterval(
                projectSet,
              )}d
            </td>

            <td>
              ${escapeHtml(
                clean(
                  projectLastReviewed(
                    projectSet,
                  ),
                ),
              )}
            </td>

            <td>
              ${escapeHtml(
                clean(
                  projectNextReview(
                    projectSet,
                  ),
                ),
              )}
            </td>

            <td>
              ${escapeHtml(
                projectReviewStateLabel(
                  projectSet,
                ),
              )}
            </td>

            <td>
              ${escapeHtml(
                clean(
                  projectSet.nextAction,
                ),
              )}
            </td>
          </tr>
        `,
      )
      .join('')

  const projectDetails =
    projectSets
      .map(
        (
          projectSet,
          index,
        ) => `
          <article class="project-card">
            <header>
              <div>
                <span>
                  Project ${index + 1}
                </span>

                <h2>
                  ${escapeHtml(
                    projectSet.name,
                  )}
                </h2>
              </div>

              <strong>
                ${projectProgress(
                  projectSet,
                )}%
              </strong>
            </header>

            <div class="meta-grid">
              <div>
                <span>Status</span>
                <strong>
                  ${escapeHtml(
                    titleCase(
                      projectSet.status
                      ?? 'planned',
                    ),
                  )}
                </strong>
              </div>

              <div>
                <span>Priority</span>
                <strong>
                  ${escapeHtml(
                    titleCase(
                      normalizeProjectPriority(
                        projectSet.priority,
                      ),
                    ),
                  )}
                </strong>
              </div>

              <div>
                <span>Due date</span>
                <strong>
                  ${escapeHtml(
                    normalizeProjectDueDate(
                      projectSet.dueDate,
                    )
                    ?? '—',
                  )}
                </strong>
              </div>

              <div>
                <span>Calculators</span>
                <strong>
                  ${projectSet.calculatorIds.length}
                </strong>
              </div>

              <div>
                <span>Review cadence</span>
                <strong>
                  ${projectReviewInterval(
                    projectSet,
                  )} days
                </strong>
              </div>

              <div>
                <span>Last reviewed</span>
                <strong>
                  ${escapeHtml(
                    clean(
                      projectLastReviewed(
                        projectSet,
                      ),
                    ),
                  )}
                </strong>
              </div>

              <div>
                <span>Next review</span>
                <strong>
                  ${escapeHtml(
                    clean(
                      projectNextReview(
                        projectSet,
                      ),
                    ),
                  )}
                </strong>
              </div>

              <div>
                <span>Review status</span>
                <strong>
                  ${escapeHtml(
                    projectReviewStateLabel(
                      projectSet,
                    ),
                  )}
                </strong>
              </div>
            </div>

            <section>
              <h3>
                Next action
              </h3>

              <p>
                ${escapeHtml(
                  clean(
                    projectSet.nextAction,
                  ),
                )}
              </p>
            </section>

            <section>
              <h3>
                Description
              </h3>

              <p>
                ${escapeHtml(
                  clean(
                    projectSet.description,
                  ),
                )}
              </p>
            </section>

            <footer>
              <span>
                Tags:
                ${escapeHtml(
                  clean(
                    (
                      projectSet.tags
                      ?? []
                    ).join(
                      ', ',
                    ),
                  ),
                )}
              </span>

              <span>
                Updated:
                ${escapeHtml(
                  projectSet.updatedAt,
                )}
              </span>
            </footer>
          </article>
        `,
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
    ChemE Toolkit Project Portfolio
  </title>

  <style>
    :root {
      font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        sans-serif;
      color: #111827;
      background: #ffffff;
    }

    * {
      box-sizing: border-box;
    }

    body {
      max-width: 1100px;
      margin: 0 auto;
      padding: 42px;
      line-height: 1.45;
    }

    .report-header {
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 3px solid #111827;
    }

    .report-header p,
    .project-card header span,
    .meta-grid span,
    .project-card footer {
      color: #6b7280;
      font-size: 0.78rem;
    }

    .report-header h1 {
      margin: 5px 0;
      font-size: 2rem;
    }

    .summary {
      display: grid;
      grid-template-columns:
        repeat(
          4,
          minmax(0, 1fr)
        );
      gap: 8px;
      margin-bottom: 30px;
    }

    .summary div {
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
    }

    .summary span {
      display: block;
      color: #6b7280;
      font-size: 0.7rem;
    }

    .summary strong {
      display: block;
      margin-top: 4px;
      font-size: 1.15rem;
    }

    table {
      width: 100%;
      margin: 16px 0 32px;
      border-collapse: collapse;
      font-size: 0.8rem;
    }

    th,
    td {
      padding: 8px;
      border: 1px solid #d1d5db;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #f3f4f6;
    }

    .project-card {
      margin-top: 22px;
      padding: 18px;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      break-inside: avoid;
    }

    .project-card header {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 14px;
    }

    .project-card h2 {
      margin: 3px 0 0;
      font-size: 1.15rem;
    }

    .project-card header > strong {
      font-size: 1.2rem;
    }

    .meta-grid {
      display: grid;
      grid-template-columns:
        repeat(
          4,
          minmax(0, 1fr)
        );
      gap: 8px;
      margin-bottom: 16px;
    }

    .meta-grid div {
      padding: 9px;
      background: #f9fafb;
    }

    .meta-grid span,
    .meta-grid strong {
      display: block;
    }

    .project-card section {
      margin-top: 14px;
    }

    .project-card h3 {
      margin: 0 0 4px;
      font-size: 0.82rem;
    }

    .project-card p {
      margin: 0;
      font-size: 0.86rem;
    }

    .project-card footer {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-top: 16px;
      padding-top: 10px;
      border-top: 1px solid #e5e7eb;
    }

    @media print {
      body {
        max-width: none;
        padding: 0;
      }

      .project-card {
        break-inside: avoid;
      }

      table {
        break-inside: auto;
      }

      tr {
        break-inside: avoid;
      }
    }
  </style>
</head>

<body>
  <header class="report-header">
    <p>
      ChemE Toolkit · Scientific Notebook
    </p>

    <h1>
      Project Portfolio Report
    </h1>

    <p>
      Generated:
      ${escapeHtml(
        generatedAt,
      )}
    </p>
  </header>

  <section class="summary">
    <div>
      <span>Total</span>
      <strong>${metrics.total}</strong>
    </div>

    <div>
      <span>Planned</span>
      <strong>${metrics.planned}</strong>
    </div>

    <div>
      <span>Active</span>
      <strong>${metrics.active}</strong>
    </div>

    <div>
      <span>Blocked</span>
      <strong>${metrics.blocked}</strong>
    </div>

    <div>
      <span>Complete</span>
      <strong>${metrics.complete}</strong>
    </div>

    <div>
      <span>Reviews due</span>
      <strong>${metrics.reviewDue}</strong>
    </div>

    <div>
      <span>Review soon</span>
      <strong>${metrics.reviewSoon}</strong>
    </div>

    <div>
      <span>Avg. progress</span>
      <strong>${metrics.averageProgress}%</strong>
    </div>
  </section>

  <section>
    <h2>
      Project Register
    </h2>

    <table>
      <thead>
        <tr>
          <th>Project</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Progress</th>
          <th>Due date</th>
          <th>Review cadence</th>
          <th>Last reviewed</th>
          <th>Next review</th>
          <th>Review status</th>
          <th>Next action</th>
        </tr>
      </thead>

      <tbody>
        ${projectRows}
      </tbody>
    </table>
  </section>

  <section>
    <h2>
      Project Details
    </h2>

    ${projectDetails}
  </section>
</body>
</html>`
}
