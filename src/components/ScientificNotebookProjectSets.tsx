import {
  useMemo,
  useState,
} from 'react'

import {
  createNotebookProjectSet,
  normalizeProjectDueDate,
  normalizeProjectPriority,
  normalizeProjectProgress,
  normalizeProjectReviewInterval,
  normalizeProjectReviewTimestamp,
  normalizeProjectSetTags,
  type NotebookProjectPriority,
  type NotebookProjectReviewInterval,
  type NotebookProjectSet,
  type NotebookProjectStatus,
  writeNotebookProjectSets,
} from '../lib/scientificNotebookProjectSets'

interface ScientificNotebookProjectSetsProps {
  projectSets: NotebookProjectSet[]
  currentTitle: string
  currentCalculatorIds: string[]
  onProjectSetsChange: (
    projectSets: NotebookProjectSet[],
  ) => void
  onLoad: (
    projectSet: NotebookProjectSet,
  ) => void
}

type ProjectDeadlineState =
  | 'none'
  | 'overdue'
  | 'due-soon'
  | 'scheduled'
  | 'complete'


type ProjectSortMode =
  | 'attention'
  | 'due-date'
  | 'progress'
  | 'updated'
  | 'name'

function getTodayUtcDay(): number {
  const today =
    new Date()

  return Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )
}

function getDeadlineState(
  projectSet:
    NotebookProjectSet,
): ProjectDeadlineState {
  if (
    projectSet.status ===
    'complete'
  ) {
    return 'complete'
  }

  const dueDate =
    normalizeProjectDueDate(
      projectSet.dueDate,
    )

  if (!dueDate) {
    return 'none'
  }

  const [
    year,
    month,
    day,
  ] =
    dueDate
      .split('-')
      .map(Number)

  const dueUtc =
    Date.UTC(
      year,
      month - 1,
      day,
    )

  const daysRemaining =
    Math.round(
      (
        dueUtc
        - getTodayUtcDay()
      )
      / 86_400_000,
    )

  if (
    daysRemaining < 0
  ) {
    return 'overdue'
  }

  if (
    daysRemaining <= 7
  ) {
    return 'due-soon'
  }

  return 'scheduled'
}

function formatDueDate(
  dueDate:
    | string
    | undefined,
): string {
  const normalized =
    normalizeProjectDueDate(
      dueDate,
    )

  if (!normalized) {
    return 'No due date'
  }

  const [
    year,
    month,
    day,
  ] =
    normalized
      .split('-')
      .map(Number)

  return new Intl.DateTimeFormat(
    undefined,
    {
      year:
        'numeric',
      month:
        'short',
      day:
        'numeric',
    },
  ).format(
    new Date(
      year,
      month - 1,
      day,
    ),
  )
}

function getProjectTouchTimestamp(
  projectSet:
    NotebookProjectSet,
): number {
  const updatedAt =
    new Date(
      projectSet.updatedAt,
    ).getTime()

  const reviewedAt =
    projectSet.lastReviewedAt
      ? new Date(
          projectSet.lastReviewedAt,
        ).getTime()
      : Number.NaN

  const safeUpdatedAt =
    Number.isFinite(
      updatedAt,
    )
      ? updatedAt
      : 0

  const safeReviewedAt =
    Number.isFinite(
      reviewedAt,
    )
      ? reviewedAt
      : 0

  return Math.max(
    safeUpdatedAt,
    safeReviewedAt,
  )
}

function getProjectAgeDays(
  projectSet:
    NotebookProjectSet,
): number {
  const touchAt =
    getProjectTouchTimestamp(
      projectSet,
    )

  if (
    touchAt <= 0
  ) {
    return 0
  }

  return Math.max(
    0,
    Math.floor(
      (
        Date.now()
        - touchAt
      )
      / 86_400_000,
    ),
  )
}

function isProjectStale(
  projectSet:
    NotebookProjectSet,
): boolean {
  return (
    projectSet.status !==
      'complete'
    && getProjectAgeDays(
      projectSet,
    ) >=
      normalizeProjectReviewInterval(
        projectSet.reviewIntervalDays,
      )
  )
}

function formatProjectAge(
  projectSet:
    NotebookProjectSet,
): string {
  const days =
    getProjectAgeDays(
      projectSet,
    )

  if (
    days === 0
  ) {
    return 'Last touch today'
  }

  if (
    days === 1
  ) {
    return 'Last touch 1 day ago'
  }

  return `Last touch ${days} days ago`
}

function formatReviewTimestamp(
  value:
    | string
    | undefined,
): string | null {
  const normalized =
    normalizeProjectReviewTimestamp(
      value,
    )

  if (!normalized) {
    return null
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      year:
        'numeric',
      month:
        'short',
      day:
        'numeric',
    },
  ).format(
    new Date(
      normalized,
    ),
  )
}

function getProjectAttentionReasons(
  projectSet:
    NotebookProjectSet,
): string[] {
  if (
    projectSet.status ===
    'complete'
  ) {
    return []
  }

  const reasons:
    string[] = []

  const projectPriority =
    normalizeProjectPriority(
      projectSet.priority,
    )

  const deadlineState =
    getDeadlineState(
      projectSet,
    )

  if (
    projectSet.status ===
    'blocked'
  ) {
    reasons.push(
      'Blocked',
    )
  }

  if (
    deadlineState ===
    'overdue'
  ) {
    reasons.push(
      'Overdue',
    )
  } else if (
    deadlineState ===
    'due-soon'
  ) {
    reasons.push(
      'Due soon',
    )
  }

  if (
    projectPriority ===
    'critical'
  ) {
    reasons.push(
      'Critical priority',
    )
  } else if (
    projectPriority ===
    'high'
  ) {
    reasons.push(
      'High priority',
    )
  }

  if (
    (
      projectSet.status ===
        'active'
      || projectSet.status ===
        'blocked'
    )
    && !projectSet.nextAction
      ?.trim()
  ) {
    reasons.push(
      'Next action missing',
    )
  }

  if (
    isProjectStale(
      projectSet,
    )
  ) {
    reasons.push(
      'Review due',
    )
  }

  return reasons
}

function getProjectAttentionScore(
  projectSet:
    NotebookProjectSet,
): number {
  if (
    projectSet.status ===
    'complete'
  ) {
    return 0
  }

  let score = 0

  const projectPriority =
    normalizeProjectPriority(
      projectSet.priority,
    )

  const deadlineState =
    getDeadlineState(
      projectSet,
    )

  if (
    projectPriority ===
    'critical'
  ) {
    score += 40
  } else if (
    projectPriority ===
    'high'
  ) {
    score += 20
  }

  if (
    projectSet.status ===
    'blocked'
  ) {
    score += 35
  }

  if (
    deadlineState ===
    'overdue'
  ) {
    score += 45
  } else if (
    deadlineState ===
    'due-soon'
  ) {
    score += 25
  }

  if (
    projectSet.status ===
      'active'
    && normalizeProjectProgress(
      projectSet.progress,
    ) <= 25
  ) {
    score += 10
  }

  if (
    (
      projectSet.status ===
        'active'
      || projectSet.status ===
        'blocked'
    )
    && !projectSet.nextAction
      ?.trim()
  ) {
    score += 15
  }

  if (
    isProjectStale(
      projectSet,
    )
  ) {
    score += 10
  }

  return score
}

function getDueDateSortValue(
  projectSet:
    NotebookProjectSet,
): string {
  return (
    normalizeProjectDueDate(
      projectSet.dueDate,
    )
    ?? '9999-12-31'
  )
}

function parseTags(
  value: string,
): string[] {
  return normalizeProjectSetTags(
    value.split(','),
  )
}

export function ScientificNotebookProjectSets({
  projectSets,
  currentTitle,
  currentCalculatorIds,
  onProjectSetsChange,
  onLoad,
}: ScientificNotebookProjectSetsProps) {
  const [
    name,
    setName,
  ] = useState('')

  const [
    description,
    setDescription,
  ] = useState('')

  const [
    tags,
    setTags,
  ] = useState('')


  const [
    projectStatus,
    setProjectStatus,
  ] = useState<
    NotebookProjectStatus
  >(
    'planned',
  )

  const [
    progress,
    setProgress,
  ] = useState(0)


  const [
    priority,
    setPriority,
  ] = useState<
    NotebookProjectPriority
  >(
    'normal',
  )


  const [
    dueDate,
    setDueDate,
  ] = useState('')


  const [
    nextAction,
    setNextAction,
  ] = useState('')


  const [
    reviewIntervalDays,
    setReviewIntervalDays,
  ] = useState<
    NotebookProjectReviewInterval
  >(
    14,
  )

  const [
    query,
    setQuery,
  ] = useState('')

  const [
    tagFilter,
    setTagFilter,
  ] = useState('all')


  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all')


  const [
    priorityFilter,
    setPriorityFilter,
  ] = useState('all')


  const [
    deadlineFilter,
    setDeadlineFilter,
  ] = useState('all')


  const [
    attentionOnly,
    setAttentionOnly,
  ] = useState(false)


  const [
    staleOnly,
    setStaleOnly,
  ] = useState(false)

  const [
    sortMode,
    setSortMode,
  ] = useState<
    ProjectSortMode
  >(
    'attention',
  )

  const [
    status,
    setStatus,
  ] = useState(
    'Save reusable calculator selections for future project reports.',
  )

  const availableTags =
    useMemo(
      () =>
        Array.from(
          new Set(
            projectSets.flatMap(
              (projectSet) =>
                projectSet.tags
                ?? [],
            ),
          ),
        ).sort(
          (
            left,
            right,
          ) =>
            left.localeCompare(
              right,
            ),
        ),
      [
        projectSets,
      ],
    )

  const visibleProjectSets =
    useMemo(
      () => {
        const normalizedQuery =
          query
            .trim()
            .toLocaleLowerCase(
              'en-US',
            )

        return projectSets.filter(
          (projectSet) => {
            if (
              tagFilter !==
                'all'
              && !(
                projectSet.tags
                ?? []
              ).some(
                (tag) =>
                  tag ===
                  tagFilter,
              )
            ) {
              return false
            }


            if (
              statusFilter !==
                'all'
              && (
                projectSet.status
                ?? 'planned'
              ) !==
                statusFilter
            ) {
              return false
            }


            if (
              priorityFilter !==
                'all'
              && normalizeProjectPriority(
                projectSet.priority,
              ) !==
                priorityFilter
            ) {
              return false
            }


            const deadlineState =
              getDeadlineState(
                projectSet,
              )

            if (
              deadlineFilter !==
                'all'
              && deadlineState !==
                deadlineFilter
            ) {
              return false
            }

            if (
              !normalizedQuery
            ) {
              return true
            }

            const searchable =
              [
                projectSet.name,
                projectSet.reportTitle,
                projectSet.description,
                projectSet.nextAction,
                ...(
                  projectSet.tags
                  ?? []
                ),
              ]
                .filter(
                  (
                    value,
                  ): value is string =>
                    typeof value ===
                    'string',
                )
                .join(' ')
                .toLocaleLowerCase(
                  'en-US',
                )

            return searchable.includes(
              normalizedQuery,
            )
          },
        )
      },
      [
        projectSets,
        query,
        tagFilter,
        statusFilter,
        priorityFilter,
        deadlineFilter,
      ],
    )

  const displayedProjectSets =
    useMemo(
      () => {
        const next =
          visibleProjectSets.filter(
            (projectSet) => {
              if (
                attentionOnly
                && getProjectAttentionReasons(
                  projectSet,
                ).length === 0
              ) {
                return false
              }

              if (
                staleOnly
                && !isProjectStale(
                  projectSet,
                )
              ) {
                return false
              }

              return true
            },
          )

        return [
          ...next,
        ].sort(
          (
            left,
            right,
          ) => {
            if (
              sortMode ===
              'attention'
            ) {
              const scoreDifference =
                getProjectAttentionScore(
                  right,
                )
                - getProjectAttentionScore(
                    left,
                  )

              if (
                scoreDifference !== 0
              ) {
                return scoreDifference
              }

              return (
                new Date(
                  right.updatedAt,
                ).getTime()
                - new Date(
                    left.updatedAt,
                  ).getTime()
              )
            }

            if (
              sortMode ===
              'due-date'
            ) {
              return getDueDateSortValue(
                left,
              ).localeCompare(
                getDueDateSortValue(
                  right,
                ),
              )
            }

            if (
              sortMode ===
              'progress'
            ) {
              return (
                normalizeProjectProgress(
                  left.progress,
                )
                - normalizeProjectProgress(
                    right.progress,
                  )
              )
            }

            if (
              sortMode ===
              'name'
            ) {
              return left.name.localeCompare(
                right.name,
              )
            }

            return (
              getProjectTouchTimestamp(
                right,
              )
              - getProjectTouchTimestamp(
                  left,
                )
            )
          },
        )
      },
      [
        attentionOnly,
        staleOnly,
        sortMode,
        visibleProjectSets,
      ],
    )

  const portfolioMetrics =
    useMemo(
      () => {
        let planned = 0
        let active = 0
        let blocked = 0
        let complete = 0
        let overdue = 0
        let dueSoon = 0
        let progressTotal = 0

        for (
          const projectSet
          of projectSets
        ) {
          const projectStatus =
            projectSet.status
            ?? 'planned'

          if (
            projectStatus ===
            'active'
          ) {
            active += 1
          } else if (
            projectStatus ===
            'blocked'
          ) {
            blocked += 1
          } else if (
            projectStatus ===
            'complete'
          ) {
            complete += 1
          } else {
            planned += 1
          }

          const deadlineState =
            getDeadlineState(
              projectSet,
            )

          if (
            deadlineState ===
            'overdue'
          ) {
            overdue += 1
          } else if (
            deadlineState ===
            'due-soon'
          ) {
            dueSoon += 1
          }

          progressTotal +=
            normalizeProjectProgress(
              projectStatus ===
                'complete'
                ? 100
                : projectSet.progress,
            )
        }

        const averageProgress =
          projectSets.length > 0
            ? Math.round(
                progressTotal
                / projectSets.length,
              )
            : 0

        return {
          total:
            projectSets.length,
          planned,
          active,
          blocked,
          complete,
          overdue,
          dueSoon,
          averageProgress,
        }
      },
      [
        projectSets,
      ],
    )

  const priorityMetrics =
    useMemo(
      () => {
        let high = 0
        let critical = 0

        for (
          const projectSet
          of projectSets
        ) {
          const projectPriority =
            normalizeProjectPriority(
              projectSet.priority,
            )

          if (
            projectPriority ===
            'critical'
          ) {
            critical += 1
          } else if (
            projectPriority ===
            'high'
          ) {
            high += 1
          }
        }

        return {
          high,
          critical,
        }
      },
      [
        projectSets,
      ],
    )

  const attentionMetrics =
    useMemo(
      () => {
        let needsAttention = 0
        let urgent = 0
        let missingNextAction = 0
        let stale = 0

        for (
          const projectSet
          of projectSets
        ) {
          const reasons =
            getProjectAttentionReasons(
              projectSet,
            )

          if (
            reasons.length > 0
          ) {
            needsAttention += 1
          }

          if (
            getProjectAttentionScore(
              projectSet,
            ) >= 60
          ) {
            urgent += 1
          }


          if (
            (
              projectSet.status ===
                'active'
              || projectSet.status ===
                'blocked'
            )
            && !projectSet.nextAction
              ?.trim()
          ) {
            missingNextAction += 1
          }

          if (
            isProjectStale(
              projectSet,
            )
          ) {
            stale += 1
          }
        }

        return {
          needsAttention,
          urgent,
          missingNextAction,
          stale,
        }
      },
      [
        projectSets,
      ],
    )

  async function exportPortfolioMarkdown() {
    if (
      projectSets.length ===
      0
    ) {
      setStatus(
        'Save at least one project set before exporting the portfolio.',
      )

      return
    }

    const {
      downloadProjectPortfolioMarkdown,
    } =
      await import(
        '../lib/scientificNotebookPortfolioReport'
      )

    downloadProjectPortfolioMarkdown(
      projectSets,
    )

    setStatus(
      'Project portfolio exported as Markdown.',
    )
  }

  async function exportPortfolioCsv() {
    if (
      projectSets.length ===
      0
    ) {
      setStatus(
        'Save at least one project set before exporting the portfolio.',
      )

      return
    }

    const {
      downloadProjectPortfolioCsv,
    } =
      await import(
        '../lib/scientificNotebookPortfolioReport'
      )

    downloadProjectPortfolioCsv(
      projectSets,
    )

    setStatus(
      'Project portfolio exported as CSV.',
    )
  }

  async function printPortfolioReport() {
    if (
      projectSets.length ===
      0
    ) {
      setStatus(
        'Save at least one project set before printing the portfolio.',
      )

      return
    }

    const printWindow =
      window.open(
        '',
        '_blank',
      )

    if (!printWindow) {
      setStatus(
        'Allow pop-ups to open the printable portfolio report.',
      )

      return
    }

    printWindow.document.open()

    printWindow.document.write(
      '<!doctype html><title>Preparing portfolio</title><p>Preparing portfolio report…</p>',
    )

    printWindow.document.close()

    try {
      const {
        buildProjectPortfolioHtml,
      } =
        await import(
          '../lib/scientificNotebookPortfolioReport'
        )

      printWindow.document.open()

      printWindow.document.write(
        buildProjectPortfolioHtml(
          projectSets,
        ),
      )

      printWindow.document.close()
      printWindow.focus()

      window.setTimeout(
        () => {
          printWindow.print()
        },
        150,
      )

      setStatus(
        'Portfolio opened for printing or PDF export.',
      )
    } catch {
      printWindow.close()

      setStatus(
        'Portfolio print report could not be generated.',
      )
    }
  }

  function persist(
    nextProjectSets:
      NotebookProjectSet[],
  ) {
    writeNotebookProjectSets(
      nextProjectSets,
    )

    onProjectSetsChange(
      nextProjectSets,
    )
  }

  function clearEditor() {
    setName('')
    setDescription('')
    setTags('')
    setProjectStatus(
      'planned',
    )
    setProgress(0)
    setPriority(
      'normal',
    )
    setDueDate('')
    setNextAction('')
    setReviewIntervalDays(
      14,
    )
  }

  function saveProjectSet() {
    const normalizedName =
      name.trim()

    if (!normalizedName) {
      setStatus(
        'Enter a project set name.',
      )

      return
    }

    if (
      currentCalculatorIds.length ===
      0
    ) {
      setStatus(
        'Select at least one notebook before saving a project set.',
      )

      return
    }

    const normalizedTags =
      parseTags(
        tags,
      )

    const normalizedDescription =
      description.trim()

    const existing =
      projectSets.find(
        (projectSet) =>
          projectSet.name
            .toLocaleLowerCase(
              'en-US',
            )
          === normalizedName
            .toLocaleLowerCase(
              'en-US',
            ),
      )

    let nextProjectSets:
      NotebookProjectSet[]

    if (existing) {
      const updated:
        NotebookProjectSet = {
          ...existing,

          name:
            normalizedName,

          reportTitle:
            currentTitle.trim()
            || 'Engineering Project Report',

          description:
            normalizedDescription
            || undefined,

          tags:
            normalizedTags,

          status:
            projectStatus,

          progress:
            projectStatus ===
              'complete'
              ? 100
              : normalizeProjectProgress(
                  progress,
                ),

          priority:
            priority,

          dueDate:
            normalizeProjectDueDate(
              dueDate,
            ),

          nextAction:
            nextAction.trim()
            || undefined,

          reviewIntervalDays:
            reviewIntervalDays,

          calculatorIds:
            Array.from(
              new Set(
                currentCalculatorIds,
              ),
            ),

          updatedAt:
            new Date()
              .toISOString(),
        }

      nextProjectSets =
        projectSets.map(
          (projectSet) =>
            projectSet.id ===
              existing.id
              ? updated
              : projectSet,
        )

      setStatus(
        `Project set "${normalizedName}" updated.`,
      )
    } else {
      const created =
        createNotebookProjectSet({
          name:
            normalizedName,

          reportTitle:
            currentTitle,

          description:
            normalizedDescription,

          tags:
            normalizedTags,

          status:
            projectStatus,

          progress:
            projectStatus ===
              'complete'
              ? 100
              : progress,

          priority:
            priority,

          dueDate:
            dueDate,

          nextAction:
            nextAction,

          reviewIntervalDays:
            reviewIntervalDays,

          calculatorIds:
            currentCalculatorIds,
        })

      nextProjectSets = [
        created,
        ...projectSets,
      ]

      setStatus(
        `Project set "${normalizedName}" saved.`,
      )
    }

    persist(
      nextProjectSets,
    )

    clearEditor()
  }

  function quickUpdateProject(
    projectSet:
      NotebookProjectSet,
    updates:
      Partial<
        Pick<
          NotebookProjectSet,
          'status'
          | 'progress'
        >
      >,
  ) {
    const nextStatus =
      updates.status
      ?? projectSet.status
      ?? 'planned'

    const nextProgress =
      nextStatus ===
        'complete'
        ? 100
        : normalizeProjectProgress(
            updates.progress
            ?? projectSet.progress,
          )

    const updated:
      NotebookProjectSet = {
        ...projectSet,

        status:
          nextStatus,

        progress:
          nextProgress,

        updatedAt:
          new Date()
            .toISOString(),
      }

    persist(
      projectSets.map(
        (item) =>
          item.id ===
            projectSet.id
            ? updated
            : item,
      ),
    )

    setStatus(
      `Project "${projectSet.name}" updated.`,
    )
  }

  function increaseProjectProgress(
    projectSet:
      NotebookProjectSet,
  ) {
    if (
      projectSet.status ===
      'complete'
    ) {
      return
    }

    const nextProgress =
      normalizeProjectProgress(
        (
          projectSet.progress
          ?? 0
        )
        + 10,
      )

    quickUpdateProject(
      projectSet,
      {
        progress:
          nextProgress,

        status:
          projectSet.status ===
            'planned'
            ? 'active'
            : (
                projectSet.status
                ?? 'active'
              ),
      },
    )
  }

  function toggleBlockedProject(
    projectSet:
      NotebookProjectSet,
  ) {
    if (
      projectSet.status ===
      'complete'
    ) {
      return
    }

    quickUpdateProject(
      projectSet,
      {
        status:
          projectSet.status ===
            'blocked'
            ? 'active'
            : 'blocked',
      },
    )
  }

  function toggleCompleteProject(
    projectSet:
      NotebookProjectSet,
  ) {
    if (
      projectSet.status ===
      'complete'
    ) {
      quickUpdateProject(
        projectSet,
        {
          status:
            'active',

          progress:
            Math.min(
              90,
              normalizeProjectProgress(
                projectSet.progress,
              ),
            ),
        },
      )

      return
    }

    quickUpdateProject(
      projectSet,
      {
        status:
          'complete',

        progress:
          100,
      },
    )
  }

  function markProjectReviewed(
    projectSet:
      NotebookProjectSet,
  ) {
    if (
      projectSet.status ===
      'complete'
  ) {
      return
    }

    const reviewed:
      NotebookProjectSet = {
        ...projectSet,

        lastReviewedAt:
          new Date()
            .toISOString(),
      }

    persist(
      projectSets.map(
        (item) =>
          item.id ===
            projectSet.id
            ? reviewed
            : item,
      ),
    )

    setStatus(
      `Project "${projectSet.name}" reviewed.`,
    )
  }

  function deleteProjectSet(
    projectSet:
      NotebookProjectSet,
  ) {
    if (
      !window.confirm(
        `Delete project set "${projectSet.name}"?`,
      )
    ) {
      return
    }

    persist(
      projectSets.filter(
        (item) =>
          item.id !==
          projectSet.id,
      ),
    )

    setStatus(
      `Project set "${projectSet.name}" deleted.`,
    )
  }

  function editProjectSet(
    projectSet:
      NotebookProjectSet,
  ) {
    setName(
      projectSet.name,
    )

    setDescription(
      projectSet.description
      ?? '',
    )

    setTags(
      (
        projectSet.tags
        ?? []
      ).join(', '),
    )

    setProjectStatus(
      projectSet.status
      ?? 'planned',
    )

    setProgress(
      normalizeProjectProgress(
        projectSet.progress,
      ),
    )

    setPriority(
      normalizeProjectPriority(
        projectSet.priority,
      ),
    )

    setDueDate(
      projectSet.dueDate
      ?? '',
    )

    setNextAction(
      projectSet.nextAction
      ?? '',
    )

    setReviewIntervalDays(
      normalizeProjectReviewInterval(
        projectSet.reviewIntervalDays,
      ),
    )

    setStatus(
      `Editing "${projectSet.name}". Save current selection to update it.`,
    )
  }

  function clearFilters() {
    setQuery('')
    setTagFilter('all')
    setStatusFilter('all')
    setPriorityFilter('all')
    setDeadlineFilter('all')
    setAttentionOnly(false)
    setStaleOnly(false)
  }

  return (
    <section
      className="scientific-notebook-project-sets"
      aria-label="Saved project report sets"
    >
      <header>
        <div>
          <span>
            Saved project sets
          </span>

          <strong>
            {projectSets.length}
          </strong>
        </div>

        <p>
          {status}
        </p>
      </header>

      <div
        className="scientific-notebook-project-portfolio-actions"
        aria-label="Project portfolio export"
      >
        <div>
          <strong>
            Portfolio snapshot
          </strong>

          <span>
            Export project status, priority, progress, deadlines and next actions.
          </span>
        </div>

        <div>
          <button
            type="button"
            disabled={
              projectSets.length ===
              0
            }
            onClick={
              exportPortfolioMarkdown
            }
          >
            Export Markdown
          </button>

          <button
            type="button"
            disabled={
              projectSets.length ===
              0
            }
            onClick={
              exportPortfolioCsv
            }
          >
            Export CSV
          </button>


          <button
            type="button"
            disabled={
              projectSets.length ===
              0
            }
            onClick={
              printPortfolioReport
            }
          >
            Print / PDF
          </button>
        </div>
      </div>

      <section
        className="scientific-notebook-project-portfolio"
        aria-label="Project portfolio overview"
      >
        <div className="scientific-notebook-project-portfolio-metrics">
          <button
            type="button"
            aria-pressed={
              statusFilter ===
              'all'
            }
            onClick={() =>
              setStatusFilter(
                'all',
              )
            }
          >
            <span>
              All
            </span>

            <strong>
              {portfolioMetrics.total}
            </strong>
          </button>

          <button
            type="button"
            aria-pressed={
              statusFilter ===
              'planned'
            }
            onClick={() =>
              setStatusFilter(
                'planned',
              )
            }
          >
            <span>
              Planned
            </span>

            <strong>
              {portfolioMetrics.planned}
            </strong>
          </button>

          <button
            type="button"
            aria-pressed={
              statusFilter ===
              'active'
            }
            onClick={() =>
              setStatusFilter(
                'active',
              )
            }
          >
            <span>
              Active
            </span>

            <strong>
              {portfolioMetrics.active}
            </strong>
          </button>

          <button
            type="button"
            aria-pressed={
              statusFilter ===
              'blocked'
            }
            onClick={() =>
              setStatusFilter(
                'blocked',
              )
            }
          >
            <span>
              Blocked
            </span>

            <strong>
              {portfolioMetrics.blocked}
            </strong>
          </button>

          <button
            type="button"
            aria-pressed={
              statusFilter ===
              'complete'
            }
            onClick={() =>
              setStatusFilter(
                'complete',
              )
            }
          >
            <span>
              Complete
            </span>

            <strong>
              {portfolioMetrics.complete}
            </strong>
          </button>
        </div>

        <div className="scientific-notebook-project-attention-summary">
          <button
            type="button"
            aria-pressed={
              attentionOnly
            }
            onClick={() =>
              setAttentionOnly(
                (current) =>
                  !current,
              )
            }
          >
            <span>
              Needs attention
            </span>

            <strong>
              {attentionMetrics.needsAttention}
            </strong>
          </button>

          <div>
            <span>
              Urgent
            </span>

            <strong>
              {attentionMetrics.urgent}
            </strong>
          </div>


          <div>
            <span>
              Missing next action
            </span>

            <strong>
              {attentionMetrics.missingNextAction}
            </strong>
          </div>


          <button
            type="button"
            aria-pressed={
              staleOnly
            }
            onClick={() =>
              setStaleOnly(
                (current) =>
                  !current,
              )
            }
          >
            <span>
              Review due
            </span>

            <strong>
              {attentionMetrics.stale}
            </strong>
          </button>
        </div>

        <div className="scientific-notebook-project-priority-summary">
          <button
            type="button"
            aria-pressed={
              priorityFilter ===
              'critical'
            }
            onClick={() =>
              setPriorityFilter(
                'critical',
              )
            }
          >
            <span>
              Critical
            </span>

            <strong>
              {priorityMetrics.critical}
            </strong>
          </button>

          <button
            type="button"
            aria-pressed={
              priorityFilter ===
              'high'
            }
            onClick={() =>
              setPriorityFilter(
                'high',
              )
            }
          >
            <span>
              High
            </span>

            <strong>
              {priorityMetrics.high}
            </strong>
          </button>
        </div>

        <div className="scientific-notebook-project-deadline-summary">
          <button
            type="button"
            aria-pressed={
              deadlineFilter ===
              'overdue'
            }
            onClick={() =>
              setDeadlineFilter(
                'overdue',
              )
            }
          >
            <span>
              Overdue
            </span>

            <strong>
              {portfolioMetrics.overdue}
            </strong>
          </button>

          <button
            type="button"
            aria-pressed={
              deadlineFilter ===
              'due-soon'
            }
            onClick={() =>
              setDeadlineFilter(
                'due-soon',
              )
            }
          >
            <span>
              Due in 7 days
            </span>

            <strong>
              {portfolioMetrics.dueSoon}
            </strong>
          </button>
        </div>

        <div className="scientific-notebook-project-portfolio-progress">
          <div>
            <span>
              Portfolio progress
            </span>

            <strong>
              {portfolioMetrics.averageProgress}
              %
            </strong>
          </div>

          <progress
            max={100}
            value={
              portfolioMetrics.averageProgress
            }
            aria-label="Average project portfolio progress"
          />
        </div>
      </section>

      <div className="scientific-notebook-project-set-create">
        <label>
          <span>
            Set name
          </span>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(
                event.target.value,
              )
            }
            placeholder="e.g. Distillation Design"
          />
        </label>

        <label>
          <span>
            Description
          </span>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            placeholder="Short project scope or purpose"
            rows={2}
          />
        </label>

        <label>
          <span>
            Tags
          </span>

          <input
            type="text"
            value={tags}
            onChange={(event) =>
              setTags(
                event.target.value,
              )
            }
            placeholder="distillation, design, thesis"
          />
        </label>

        <label>
          <span>
            Status
          </span>

          <select
            value={
              projectStatus
            }
            onChange={(event) => {
              const nextStatus =
                event.target.value as NotebookProjectStatus

              setProjectStatus(
                nextStatus,
              )

              if (
                nextStatus ===
                'complete'
              ) {
                setProgress(
                  100,
                )
              }
            }}
          >
            <option value="planned">
              Planned
            </option>

            <option value="active">
              Active
            </option>

            <option value="blocked">
              Blocked
            </option>

            <option value="complete">
              Complete
            </option>
          </select>
        </label>

        <label>
          <span>
            Progress
            {' '}
            {projectStatus ===
              'complete'
              ? 100
              : progress}
            %
          </span>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={
              projectStatus ===
                'complete'
                ? 100
                : progress
            }
            disabled={
              projectStatus ===
              'complete'
            }
            onChange={(event) =>
              setProgress(
                normalizeProjectProgress(
                  Number(
                    event.target.value,
                  ),
                ),
              )
            }
          />
        </label>

        <label>
          <span>
            Priority
          </span>

          <select
            value={
              priority
            }
            onChange={(event) =>
              setPriority(
                event.target.value as NotebookProjectPriority,
              )
            }
          >
            <option value="low">
              Low
            </option>

            <option value="normal">
              Normal
            </option>

            <option value="high">
              High
            </option>

            <option value="critical">
              Critical
            </option>
          </select>
        </label>

        <label>
          <span>
            Review cadence
          </span>

          <select
            value={
              reviewIntervalDays
            }
            onChange={(event) =>
              setReviewIntervalDays(
                Number(
                  event.target.value,
                ) as NotebookProjectReviewInterval,
              )
            }
          >
            <option value={7}>
              Every 7 days
            </option>

            <option value={14}>
              Every 14 days
            </option>

            <option value={30}>
              Every 30 days
            </option>

            <option value={60}>
              Every 60 days
            </option>
          </select>
        </label>

        <label className="scientific-notebook-project-next-action-field">
          <span>
            Next action
          </span>

          <input
            type="text"
            value={
              nextAction
            }
            onChange={(event) =>
              setNextAction(
                event.target.value,
              )
            }
            placeholder="e.g. Validate heat-duty assumptions"
          />
        </label>

        <label>
          <span>
            Due date
          </span>

          <input
            type="date"
            value={
              dueDate
            }
            onChange={(event) =>
              setDueDate(
                event.target.value,
              )
            }
          />
        </label>

        <button
          type="button"
          onClick={
            saveProjectSet
          }
          disabled={
            currentCalculatorIds.length ===
            0
          }
        >
          Save current selection
        </button>
      </div>

      <div
        className="scientific-notebook-project-set-discovery"
        aria-label="Project set search and filters"
      >
        <label>
          <span>
            Search sets
          </span>

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value,
              )
            }
            placeholder="Name, description, title or tag…"
          />
        </label>

        <label>
          <span>
            Tag
          </span>

          <select
            value={tagFilter}
            onChange={(event) =>
              setTagFilter(
                event.target.value,
              )
            }
          >
            <option value="all">
              All tags
            </option>

            {availableTags.map(
              (tag) => (
                <option
                  key={tag}
                  value={tag}
                >
                  {tag}
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          <span>
            Status
          </span>

          <select
            value={
              statusFilter
            }
            onChange={(event) =>
              setStatusFilter(
                event.target.value,
              )
            }
          >
            <option value="all">
              All statuses
            </option>

            <option value="planned">
              Planned
            </option>

            <option value="active">
              Active
            </option>

            <option value="blocked">
              Blocked
            </option>

            <option value="complete">
              Complete
            </option>
          </select>
        </label>

        <label>
          <span>
            Priority
          </span>

          <select
            value={
              priorityFilter
            }
            onChange={(event) =>
              setPriorityFilter(
                event.target.value,
              )
            }
          >
            <option value="all">
              All priorities
            </option>

            <option value="critical">
              Critical
            </option>

            <option value="high">
              High
            </option>

            <option value="normal">
              Normal
            </option>

            <option value="low">
              Low
            </option>
          </select>
        </label>

        <label>
          <span>
            Deadline
          </span>

          <select
            value={
              deadlineFilter
            }
            onChange={(event) =>
              setDeadlineFilter(
                event.target.value,
              )
            }
          >
            <option value="all">
              All deadlines
            </option>

            <option value="overdue">
              Overdue
            </option>

            <option value="due-soon">
              Due in 7 days
            </option>

            <option value="scheduled">
              Later
            </option>

            <option value="none">
              No due date
            </option>
          </select>
        </label>

        <label>
          <span>
            Sort
          </span>

          <select
            value={
              sortMode
            }
            onChange={(event) =>
              setSortMode(
                event.target.value as ProjectSortMode,
              )
            }
          >
            <option value="attention">
              Attention first
            </option>

            <option value="due-date">
              Due date
            </option>

            <option value="progress">
              Lowest progress
            </option>

            <option value="updated">
              Recent touch
            </option>

            <option value="name">
              Name
            </option>
          </select>
        </label>

        <button
          type="button"
          aria-pressed={
            attentionOnly
          }
          onClick={() =>
            setAttentionOnly(
              (current) =>
                !current,
            )
          }
        >
          Attention only
        </button>

        <button
          type="button"
          onClick={
            clearFilters
          }
          disabled={
            !query
            && tagFilter ===
              'all'
            && statusFilter ===
              'all'
            && priorityFilter ===
              'all'
            && deadlineFilter ===
              'all'
            && !attentionOnly
            && !staleOnly
          }
        >
          Clear filters
        </button>

        <span>
          {displayedProjectSets.length}
          {' '}
          visible
        </span>
      </div>

      {displayedProjectSets.length > 0 ? (
        <div className="scientific-notebook-project-set-list">
          {displayedProjectSets.map(
            (projectSet) => (
              <article
                key={
                  projectSet.id
                }
              >
                <div>
                  <strong>
                    {projectSet.name}
                  </strong>

                  <span>
                    {projectSet.calculatorIds.length}
                    {' '}
                    calculators
                  </span>

                  <small>
                    {projectSet.reportTitle}
                  </small>


                  {getProjectAttentionReasons(
                    projectSet,
                  ).length > 0 ? (
                    <div className="scientific-notebook-project-set-attention">
                      {getProjectAttentionReasons(
                        projectSet,
                      ).map(
                        (reason) => (
                          <span
                            key={
                              reason
                            }
                          >
                            {reason}
                          </span>
                        ),
                      )}
                    </div>
                  ) : null}

                  {projectSet.nextAction ? (
                    <div className="scientific-notebook-project-set-next-action">
                      <span>
                        Next action
                      </span>

                      <strong>
                        {projectSet.nextAction}
                      </strong>
                    </div>
                  ) : null}

                  {projectSet.lastReviewedAt ? (
                    <div className="scientific-notebook-project-set-reviewed">
                      <span>
                        Reviewed
                      </span>

                      <strong>
                        {formatReviewTimestamp(
                          projectSet.lastReviewedAt,
                        )}
                      </strong>
                    </div>
                  ) : null}

                  <div className="scientific-notebook-project-set-review-cadence">
                    <span>
                      Review every
                    </span>

                    <strong>
                      {normalizeProjectReviewInterval(
                        projectSet.reviewIntervalDays,
                      )}
                      d
                    </strong>
                  </div>

                  <div
                    className="scientific-notebook-project-set-updated"
                    data-project-stale={
                      isProjectStale(
                        projectSet,
                      )
                    }
                  >
                    <span>
                      {formatProjectAge(
                        projectSet,
                      )}
                    </span>
                  </div>

                  <div
                    className="scientific-notebook-project-set-priority"
                    data-project-priority={
                      normalizeProjectPriority(
                        projectSet.priority,
                      )
                    }
                  >
                    <span>
                      Priority
                    </span>

                    <strong>
                      {normalizeProjectPriority(
                        projectSet.priority,
                      ).replace(
                        /^./,
                        (value) =>
                          value.toUpperCase(),
                      )}
                    </strong>
                  </div>

                  {projectSet.dueDate ? (
                    <div
                      className="scientific-notebook-project-set-deadline"
                      data-deadline-state={
                        getDeadlineState(
                          projectSet,
                        )
                      }
                    >
                      <span>
                        Due
                      </span>

                      <strong>
                        {formatDueDate(
                          projectSet.dueDate,
                        )}
                      </strong>
                    </div>
                  ) : null}

                  <div className="scientific-notebook-project-set-progress">
                    <div>
                      <span
                        data-project-status={
                          projectSet.status
                          ?? 'planned'
                        }
                      >
                        {(projectSet.status
                          ?? 'planned')
                          .replace(
                            /^./,
                            (value) =>
                              value.toUpperCase(),
                          )}
                      </span>

                      <strong>
                        {normalizeProjectProgress(
                          projectSet.status ===
                            'complete'
                            ? 100
                            : projectSet.progress,
                        )}
                        %
                      </strong>
                    </div>

                    <progress
                      max={100}
                      value={
                        normalizeProjectProgress(
                          projectSet.status ===
                            'complete'
                            ? 100
                            : projectSet.progress,
                        )
                      }
                      aria-label={`${projectSet.name} progress`}
                    />
                  </div>

                  {projectSet.description ? (
                    <p>
                      {projectSet.description}
                    </p>
                  ) : null}

                  {projectSet.tags?.length ? (
                    <div className="scientific-notebook-project-set-tags">
                      {projectSet.tags.map(
                        (tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() =>
                              setTagFilter(
                                tag,
                              )
                            }
                          >
                            {tag}
                          </button>
                        ),
                      )}
                    </div>
                  ) : null}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      onLoad(
                        projectSet,
                      )
                    }
                  >
                    Load
                  </button>

                  <div
                    className="scientific-notebook-project-quick-actions"
                    aria-label={`${projectSet.name} quick project updates`}
                  >
                    {projectSet.status ===
                      'planned' ? (
                      <button
                        type="button"
                        onClick={() =>
                          quickUpdateProject(
                            projectSet,
                            {
                              status:
                                'active',
                            },
                          )
                        }
                      >
                        Start
                      </button>
                    ) : null}

                    <button
                      type="button"
                      disabled={
                        projectSet.status ===
                        'complete'
                      }
                      onClick={() =>
                        increaseProjectProgress(
                          projectSet,
                        )
                      }
                    >
                      +10%
                    </button>

                    <button
                      type="button"
                      disabled={
                        projectSet.status ===
                        'complete'
                      }
                      onClick={() =>
                        toggleBlockedProject(
                          projectSet,
                        )
                      }
                    >
                      {projectSet.status ===
                        'blocked'
                        ? 'Resume'
                        : 'Block'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleCompleteProject(
                          projectSet,
                        )
                      }
                    >
                      {projectSet.status ===
                        'complete'
                        ? 'Reopen'
                        : 'Complete'}
                    </button>


                    {isProjectStale(
                      projectSet,
                    ) ? (
                      <button
                        type="button"
                        onClick={() =>
                          markProjectReviewed(
                            projectSet,
                          )
                        }
                      >
                        Mark reviewed
                      </button>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      editProjectSet(
                        projectSet,
                      )
                    }
                  >
                    Edit metadata
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteProjectSet(
                        projectSet,
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              </article>
            ),
          )}
        </div>
      ) : (
        <p className="scientific-notebook-project-set-empty">
          {projectSets.length > 0
            ? 'No project sets match the current filters.'
            : 'No saved project sets yet.'}
        </p>
      )}
    </section>
  )
}
