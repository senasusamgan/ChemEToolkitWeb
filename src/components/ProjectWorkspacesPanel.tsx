import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { CalculatorDefinition } from '../types/calculator'
import '../styles/project-workspaces.css'

const CALCULATIONS_KEY =
  'cheme-toolkit.saved-calculations.v1'

const PROJECTS_KEY =
  'cheme-toolkit.project-workspaces.v1'

const CALCULATIONS_CHANGE_EVENT =
  'cheme-toolkit:saved-calculations-changed'

const WORKSPACE_TARGET_EVENT =
  'cheme-toolkit:workspace-open-target'

const PENDING_WORKSPACE_TARGET_KEY =
  'cheme-toolkit.pending-workspace-target.v1'

interface ProjectWorkspacesPanelProps {
  calculator: CalculatorDefinition
}

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
}

interface ProjectWorkspace {
  id: string
  name: string
  description: string
  notes: string
  createdAt: string
  updatedAt: string
  calculationIds: string[]
}

type Status =
  | 'idle'
  | 'created'
  | 'updated'
  | 'assigned'
  | 'removed'
  | 'deleted'
  | 'csv'
  | 'print'
  | 'error'

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
    const raw =
      localStorage.getItem(
        CALCULATIONS_KEY,
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
          Array.isArray(candidate.inputs) &&
          Array.isArray(candidate.results)
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
          typeof candidate.description ===
            'string' &&
          typeof candidate.notes ===
            'string' &&
          typeof candidate.createdAt ===
            'string' &&
          typeof candidate.updatedAt ===
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
): string {
  const rows: string[][] = [
    [
      'ChemE Toolkit Project Workspace',
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
      'Notes',
      project.notes ||
        'Not provided',
      '',
      '',
    ],
    [
      'Updated',
      new Date(
        project.updatedAt,
      ).toLocaleString('tr-TR'),
      '',
      '',
    ],
    ['', '', '', ''],
  ]

  calculations.forEach(
    (calculation, index) => {
      rows.push(
        [
          `Calculation ${index + 1}`,
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
) {
  const csv =
    createProjectCsv(
      project,
      calculations,
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
      'cheme-project'}.csv`

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

function createValueRows(
  values: SavedValue[],
): string {
  if (values.length === 0) {
    return `
      <tr>
        <td colspan="3">
          No saved data.
        </td>
      </tr>
    `
  }

  return values
    .map(
      (value) => `
        <tr>
          <td>
            ${escapeHtml(value.label)}
          </td>

          <td>
            ${escapeHtml(value.value)}
          </td>

          <td>
            ${escapeHtml(value.unit)}
          </td>
        </tr>
      `,
    )
    .join('')
}

function printProjectReport(
  project: ProjectWorkspace,
  calculations: SavedCalculation[],
): boolean {
  const reportWindow =
    window.open('', '_blank')

  if (!reportWindow) {
    return false
  }

  const calculationMarkup =
    calculations.length === 0
      ? `
        <section class="empty">
          No calculations have been assigned
          to this project.
        </section>
      `
      : calculations
          .map(
            (
              calculation,
              index,
            ) => `
              <section class="calculation">
                <div class="calculation-heading">
                  <div>
                    <span>
                      Calculation ${index + 1}
                    </span>

                    <h2>
                      ${escapeHtml(
                        calculation.name,
                      )}
                    </h2>

                    <p>
                      ${escapeHtml(
                        calculation.calculatorTitle,
                      )}
                      ·
                      ${escapeHtml(
                        calculation.category,
                      )}
                    </p>
                  </div>

                  <small>
                    ${escapeHtml(
                      new Date(
                        calculation.createdAt,
                      ).toLocaleString(
                        'tr-TR',
                      ),
                    )}
                  </small>
                </div>

                <h3>Inputs</h3>

                <table>
                  <thead>
                    <tr>
                      <th>Variable</th>
                      <th>Value</th>
                      <th>Unit</th>
                    </tr>
                  </thead>

                  <tbody>
                    ${createValueRows(
                      calculation.inputs,
                    )}
                  </tbody>
                </table>

                <h3>Results</h3>

                <table>
                  <thead>
                    <tr>
                      <th>Result</th>
                      <th>Value</th>
                      <th>Unit</th>
                    </tr>
                  </thead>

                  <tbody>
                    ${createValueRows(
                      calculation.results,
                    )}
                  </tbody>
                </table>

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
            max-width: 980px;
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
          }

          .description {
            max-width: 760px;
            margin: 12px 0 0;
            color: #516d84;
            line-height: 1.6;
          }

          .project-meta {
            margin-top: 16px;
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 8px 20px;
            color: #647a8e;
            font-size: 12px;
          }

          .project-notes {
            margin-top: 24px;
            padding: 16px;
            border-left:
              4px solid #049b96;
            background: #eaf6f4;
            white-space: pre-wrap;
            line-height: 1.6;
          }

          .calculation {
            margin-top: 34px;
            padding-top: 26px;
            border-top:
              1px solid #d9d0bd;
            break-inside: avoid;
          }

          .calculation-heading {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
          }

          .calculation-heading span {
            color: #007b78;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .calculation-heading h2 {
            margin: 5px 0 0;
            font-family:
              Georgia,
              serif;
            font-size: 25px;
          }

          .calculation-heading p {
            margin: 7px 0 0;
            color: #647a8e;
            font-size: 12px;
          }

          .calculation-heading small {
            color: #647a8e;
            font-size: 11px;
          }

          h3 {
            margin: 22px 0 9px;
            color: #007b78;
            font-size: 12px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            padding: 10px 11px;
            border:
              1px solid #d9d0bd;
            text-align: left;
          }

          th {
            background: #e4f3f0;
            font-size: 11px;
            text-transform: uppercase;
          }

          td:nth-child(2) {
            font-weight: 700;
          }

          .note {
            margin-top: 16px;
            padding: 14px;
            border-left:
              3px solid #049b96;
            background: #f0f8f6;
          }

          .note p {
            margin: 6px 0 0;
            line-height: 1.5;
          }

          .empty {
            margin-top: 30px;
            padding: 24px;
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
              padding: 15mm;
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
            ChemE Toolkit · Project workspace
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

          <div class="project-meta">
            <span>
              <strong>Calculations:</strong>
              ${calculations.length}
            </span>

            <span>
              <strong>Updated:</strong>
              ${escapeHtml(
                new Date(
                  project.updatedAt,
                ).toLocaleString(
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

        ${calculationMarkup}

        <footer>
          This report combines calculations
          stored locally in this browser.
          Final engineering and safety-critical
          decisions must be independently
          verified against applicable standards,
          property data and qualified review.
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

export function ProjectWorkspacesPanel({
  calculator,
}: ProjectWorkspacesPanelProps) {
  const [
    projects,
    setProjects,
  ] = useState<ProjectWorkspace[]>(
    readProjects,
  )

  const [
    calculations,
    setCalculations,
  ] = useState<SavedCalculation[]>(
    readSavedCalculations,
  )

  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState('')

  const [
    isExpanded,
    setIsExpanded,
  ] = useState(false)

  const [
    newProjectName,
    setNewProjectName,
  ] = useState('')

  const [
    newProjectDescription,
    setNewProjectDescription,
  ] = useState('')

  const [
    draftName,
    setDraftName,
  ] = useState('')

  const [
    draftDescription,
    setDraftDescription,
  ] = useState('')

  const [
    draftNotes,
    setDraftNotes,
  ] = useState('')

  const [
    calculatorFilter,
    setCalculatorFilter,
  ] = useState('all')

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

  const assignmentMap =
    useMemo(() => {
      const assignments =
        new Map<string, string>()

      projects.forEach((project) => {
        project.calculationIds.forEach(
          (calculationId) => {
            assignments.set(
              calculationId,
              project.name,
            )
          },
        )
      })

      return assignments
    }, [projects])

  const calculatorOptions =
    useMemo(() => {
      const options =
        new Map<string, string>()

      calculations.forEach(
        (calculation) => {
          options.set(
            calculation.calculatorId,
            calculation.calculatorTitle,
          )
        },
      )

      return Array.from(
        options.entries(),
      )
    }, [calculations])

  const filteredCalculations =
    useMemo(
      () =>
        calculations.filter(
          (calculation) =>
            calculatorFilter ===
              'all' ||
            calculation.calculatorId ===
              calculatorFilter,
        ),
      [
        calculations,
        calculatorFilter,
      ],
    )

  const projectCalculations =
    useMemo(() => {
      if (!selectedProject) {
        return []
      }

      return selectedProject
        .calculationIds
        .flatMap(
          (calculationId) => {
            const calculation =
              calculations.find(
                (item) =>
                  item.id ===
                  calculationId,
              )

            return calculation
              ? [calculation]
              : []
          },
        )
    }, [
      calculations,
      selectedProject,
    ])

  const currentCalculatorCount =
    useMemo(
      () =>
        calculations.filter(
          (calculation) =>
            calculation.calculatorId ===
            calculator.id,
        ).length,
      [
        calculations,
        calculator.id,
      ],
    )

  useEffect(() => {
    localStorage.setItem(
      PROJECTS_KEY,
      JSON.stringify(projects),
    )
  }, [projects])

  useEffect(() => {
    function refreshCalculations() {
      setCalculations(
        readSavedCalculations(),
      )
    }

    window.addEventListener(
      CALCULATIONS_CHANGE_EVENT,
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
        CALCULATIONS_CHANGE_EVENT,
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
          'project' ||
        typeof detail.id !==
          'string' ||
        !projects.some(
          (project) =>
            project.id ===
            detail.id,
        )
      ) {
        return
      }

      setIsExpanded(true)
      setSelectedProjectId(
        detail.id,
      )

      sessionStorage.removeItem(
        PENDING_WORKSPACE_TARGET_KEY,
      )

      window.setTimeout(() => {
        const element =
          document.getElementById(
            `project-workspace-${detail.id}`,
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
  }, [projects])

  useEffect(() => {
    const projectStillExists =
      projects.some(
        (project) =>
          project.id ===
          selectedProjectId,
      )

    if (
      selectedProjectId &&
      projectStillExists
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
    setDraftName(
      selectedProject?.name ?? '',
    )

    setDraftDescription(
      selectedProject?.description ??
        '',
    )

    setDraftNotes(
      selectedProject?.notes ?? '',
    )
  }, [selectedProject])

  useEffect(() => {
    if (status === 'idle') {
      return
    }

    const timer =
      window.setTimeout(
        () => setStatus('idle'),
        2700,
      )

    return () =>
      window.clearTimeout(timer)
  }, [status])

  function handleCreateProject() {
    const name =
      newProjectName.trim()

    if (!name) {
      setStatus('error')
      return
    }

    const now =
      new Date().toISOString()

    const project: ProjectWorkspace = {
      id: createId(),
      name,
      description:
        newProjectDescription.trim(),
      notes: '',
      createdAt: now,
      updatedAt: now,
      calculationIds: [],
    }

    setProjects(
      (current) => [
        project,
        ...current,
      ],
    )

    setSelectedProjectId(
      project.id,
    )

    setNewProjectName('')
    setNewProjectDescription('')
    setIsExpanded(true)
    setStatus('created')
  }

  function handleUpdateProject() {
    if (!selectedProject) {
      setStatus('error')
      return
    }

    const name =
      draftName.trim()

    if (!name) {
      setStatus('error')
      return
    }

    setProjects((current) =>
      current.map((project) =>
        project.id ===
        selectedProject.id
          ? {
              ...project,
              name,
              description:
                draftDescription.trim(),
              notes:
                draftNotes.trim(),
              updatedAt:
                new Date().toISOString(),
            }
          : project,
      ),
    )

    setStatus('updated')
  }

  function toggleCalculation(
    calculationId: string,
  ) {
    if (!selectedProject) {
      setStatus('error')
      return
    }

    const alreadyAssigned =
      selectedProject.calculationIds.includes(
        calculationId,
      )

    const now =
      new Date().toISOString()

    setProjects((current) =>
      current.map((project) => {
        const withoutCalculation =
          project.calculationIds.filter(
            (id) =>
              id !== calculationId,
          )

        if (
          project.id !==
          selectedProject.id
        ) {
          return {
            ...project,
            calculationIds:
              withoutCalculation,
          }
        }

        return {
          ...project,
          calculationIds:
            alreadyAssigned
              ? withoutCalculation
              : [
                  ...withoutCalculation,
                  calculationId,
                ],
          updatedAt: now,
        }
      }),
    )

    setStatus(
      alreadyAssigned
        ? 'removed'
        : 'assigned',
    )
  }

  function handleDeleteProject() {
    if (!selectedProject) {
      return
    }

    const confirmed =
      window.confirm(
        `Delete project "${selectedProject.name}"? Saved calculations will not be deleted.`,
      )

    if (!confirmed) {
      return
    }

    setProjects((current) =>
      current.filter(
        (project) =>
          project.id !==
          selectedProject.id,
      ),
    )

    setSelectedProjectId('')
    setStatus('deleted')
  }

  function handleCsvExport() {
    if (!selectedProject) {
      setStatus('error')
      return
    }

    downloadProjectCsv(
      selectedProject,
      projectCalculations,
    )

    setStatus('csv')
  }

  function handlePrintReport() {
    if (!selectedProject) {
      setStatus('error')
      return
    }

    const opened =
      printProjectReport(
        selectedProject,
        projectCalculations,
      )

    setStatus(
      opened
        ? 'print'
        : 'error',
    )
  }

  return (
    <section
      className="project-workspaces-panel"
      aria-label="Project workspaces"
    >
      <div className="project-workspaces-header">
        <div>
          <span>
            Engineering workspace
          </span>

          <h3>
            Project workspaces
          </h3>

          <p>
            Group saved calculations into
            named engineering projects and
            export one combined report.
          </p>
        </div>

        <button
          type="button"
          className="workspace-expand-button"
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
            ? 'Hide projects'
            : `Open projects (${projects.length})`}
        </button>
      </div>

      <div className="workspace-current-summary">
        <span>
          Current calculator
        </span>

        <strong>
          {calculator.title}
        </strong>

        <small>
          {currentCalculatorCount}{' '}
          saved calculation
          {currentCalculatorCount === 1
            ? ''
            : 's'}
        </small>
      </div>

      {isExpanded ? (
        <div className="project-workspaces-content">
          <div className="workspace-create-form">
            <label>
              <span>
                New project name
              </span>

              <input
                type="text"
                value={newProjectName}
                placeholder="Example: Heat exchanger design"
                maxLength={80}
                onChange={(event) =>
                  setNewProjectName(
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>
                Short description
              </span>

              <input
                type="text"
                value={
                  newProjectDescription
                }
                placeholder="Optional project purpose"
                maxLength={160}
                onChange={(event) =>
                  setNewProjectDescription(
                    event.target.value,
                  )
                }
              />
            </label>

            <button
              type="button"
              onClick={
                handleCreateProject
              }
            >
              ＋ Create project
            </button>
          </div>

          <p
            className="workspace-status"
            aria-live="polite"
          >
            {status === 'created'
              ? 'Project created.'
              : null}

            {status === 'updated'
              ? 'Project details saved.'
              : null}

            {status === 'assigned'
              ? 'Calculation moved into this project.'
              : null}

            {status === 'removed'
              ? 'Calculation removed from this project.'
              : null}

            {status === 'deleted'
              ? 'Project deleted. Saved calculations were preserved.'
              : null}

            {status === 'csv'
              ? 'Project CSV downloaded.'
              : null}

            {status === 'print'
              ? 'Printable project report opened.'
              : null}

            {status === 'error'
              ? 'Complete the required project information or allow the report window.'
              : null}
          </p>

          {projects.length === 0 ? (
            <div className="workspace-empty">
              <strong>
                No project workspaces yet
              </strong>

              <p>
                Create a project, then move
                saved calculations into it.
              </p>
            </div>
          ) : (
            <div className="workspace-layout">
              <aside className="workspace-project-list">
                <span>
                  Projects
                </span>

                {projects.map(
                  (project) => (
                    <button
                      id={`project-workspace-${project.id}`}
                      key={project.id}
                      type="button"
                      className={
                        project.id ===
                        selectedProjectId
                          ? 'is-selected'
                          : ''
                      }
                      onClick={() =>
                        setSelectedProjectId(
                          project.id,
                        )
                      }
                    >
                      <strong>
                        {project.name}
                      </strong>

                      <small>
                        {
                          project
                            .calculationIds
                            .length
                        }{' '}
                        calculation
                        {project
                          .calculationIds
                          .length === 1
                          ? ''
                          : 's'}
                      </small>
                    </button>
                  ),
                )}
              </aside>

              {selectedProject ? (
                <div className="workspace-project-detail">
                  <div className="workspace-detail-heading">
                    <div>
                      <span>
                        Selected project
                      </span>

                      <h4>
                        {
                          selectedProject.name
                        }
                      </h4>
                    </div>

                    <button
                      type="button"
                      className="workspace-delete-button"
                      onClick={
                        handleDeleteProject
                      }
                    >
                      Delete project
                    </button>
                  </div>

                  <div className="workspace-detail-form">
                    <label>
                      <span>
                        Project name
                      </span>

                      <input
                        type="text"
                        value={draftName}
                        maxLength={80}
                        onChange={(
                          event,
                        ) =>
                          setDraftName(
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label>
                      <span>
                        Description
                      </span>

                      <input
                        type="text"
                        value={
                          draftDescription
                        }
                        maxLength={160}
                        onChange={(
                          event,
                        ) =>
                          setDraftDescription(
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label className="workspace-notes-field">
                      <span>
                        Project notes
                      </span>

                      <textarea
                        value={draftNotes}
                        rows={5}
                        maxLength={2500}
                        placeholder="Assumptions, decisions, limitations and next steps…"
                        onChange={(
                          event,
                        ) =>
                          setDraftNotes(
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <button
                      type="button"
                      className="workspace-save-button"
                      onClick={
                        handleUpdateProject
                      }
                    >
                      Save project details
                    </button>
                  </div>

                  <div className="workspace-export-row">
                    <div>
                      <span>
                        Combined project report
                      </span>

                      <p>
                        {
                          projectCalculations.length
                        }{' '}
                        calculation
                        {projectCalculations.length ===
                        1
                          ? ''
                          : 's'}{' '}
                        included
                      </p>
                    </div>

                    <div>
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
                        className="workspace-primary-button"
                        onClick={
                          handlePrintReport
                        }
                      >
                        ▦ Print / Save PDF
                      </button>
                    </div>
                  </div>

                  <div className="workspace-calculation-manager">
                    <div className="workspace-manager-heading">
                      <div>
                        <span>
                          Saved calculations
                        </span>

                        <h5>
                          Add or move calculations
                        </h5>
                      </div>

                      <select
                        value={
                          calculatorFilter
                        }
                        onChange={(
                          event,
                        ) =>
                          setCalculatorFilter(
                            event.target.value,
                          )
                        }
                      >
                        <option value="all">
                          All calculators
                        </option>

                        {calculatorOptions.map(
                          ([
                            id,
                            title,
                          ]) => (
                            <option
                              key={id}
                              value={id}
                            >
                              {title}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    {filteredCalculations.length ===
                    0 ? (
                      <div className="workspace-empty workspace-empty-small">
                        <strong>
                          No saved calculations
                        </strong>

                        <p>
                          Save a calculation
                          before assigning it to
                          a project.
                        </p>
                      </div>
                    ) : (
                      <div className="workspace-calculation-list">
                        {filteredCalculations.map(
                          (
                            calculation,
                          ) => {
                            const isIncluded =
                              selectedProject.calculationIds.includes(
                                calculation.id,
                              )

                            const assignedProject =
                              assignmentMap.get(
                                calculation.id,
                              )

                            return (
                              <article
                                key={
                                  calculation.id
                                }
                                className={
                                  isIncluded
                                    ? 'is-included'
                                    : ''
                                }
                              >
                                <div>
                                  <span>
                                    {
                                      calculation.category
                                    }
                                  </span>

                                  <strong>
                                    {
                                      calculation.name
                                    }
                                  </strong>

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

                                <div className="workspace-assignment">
                                  <span>
                                    {isIncluded
                                      ? 'In this project'
                                      : assignedProject
                                        ? `In ${assignedProject}`
                                        : 'Unassigned'}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleCalculation(
                                        calculation.id,
                                      )
                                    }
                                  >
                                    {isIncluded
                                      ? 'Remove'
                                      : assignedProject
                                        ? 'Move here'
                                        : 'Add to project'}
                                  </button>
                                </div>
                              </article>
                            )
                          },
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </section>
  )
}
