import {
  normalizeProjectDueDate,
  normalizeProjectPriority,
  normalizeProjectProgress,
  type NotebookProjectSet,
} from './scientificNotebookProjectSets'

interface PortfolioMetrics {
  total: number
  planned: number
  active: number
  blocked: number
  complete: number
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

function buildMetrics(
  projectSets:
    NotebookProjectSet[],
): PortfolioMetrics {
  let planned = 0
  let active = 0
  let blocked = 0
  let complete = 0
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
    `- Average progress: ${metrics.averageProgress}%`,
    '',
    '## Project Register',
    '',
    '| Project | Status | Priority | Progress | Due date | Next action | Calculators | Tags |',
    '| --- | --- | --- | ---: | --- | --- | ---: | --- |',
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
