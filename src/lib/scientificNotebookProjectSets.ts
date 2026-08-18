export const PROJECT_SET_STORAGE_KEY =
  'cheme-toolkit.notebook-project-sets.v1'

export type NotebookProjectStatus =
  | 'planned'
  | 'active'
  | 'blocked'
  | 'complete'


export type NotebookProjectPriority =
  | 'low'
  | 'normal'
  | 'high'
  | 'critical'

export interface NotebookProjectSet {
  id: string
  name: string
  reportTitle: string
  description?: string
  tags?: string[]
  status?: NotebookProjectStatus
  progress?: number
  priority?: NotebookProjectPriority
  dueDate?: string
  nextAction?: string
  calculatorIds: string[]
  createdAt: string
  updatedAt: string
}

function createId(): string {
  if (
    typeof crypto !== 'undefined'
    && 'randomUUID' in crypto
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

export function normalizeProjectSetTags(
  tags: string[],
): string[] {
  const unique =
    new Map<
      string,
      string
    >()

  for (
    const tag
    of tags
  ) {
    const normalized =
      tag.trim()

    if (!normalized) {
      continue
    }

    const key =
      normalized
        .toLocaleLowerCase(
          'en-US',
        )

    if (
      !unique.has(
        key,
      )
    ) {
      unique.set(
        key,
        normalized,
      )
    }
  }

  return Array.from(
    unique.values(),
  )
}

export function normalizeProjectProgress(
  progress:
    | number
    | undefined,
): number {
  if (
    typeof progress !==
      'number'
    || !Number.isFinite(
      progress,
    )
  ) {
    return 0
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        progress,
      ),
    ),
  )
}

export function normalizeProjectDueDate(
  dueDate:
    | string
    | undefined,
): string | undefined {
  if (
    typeof dueDate !==
      'string'
  ) {
    return undefined
  }

  const normalized =
    dueDate.trim()

  if (
    normalized.length !== 10
  ) {
    return undefined
  }

  const parts =
    normalized.split('-')

  if (
    parts.length !== 3
  ) {
    return undefined
  }

  const year =
    Number(parts[0])

  const month =
    Number(parts[1])

  const day =
    Number(parts[2])

  if (
    !Number.isInteger(year)
    || !Number.isInteger(month)
    || !Number.isInteger(day)
  ) {
    return undefined
  }

  const candidate =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
      ),
    )

  if (
    candidate.getUTCFullYear() !==
      year
    || candidate.getUTCMonth() !==
      month - 1
    || candidate.getUTCDate() !==
      day
  ) {
    return undefined
  }

  return normalized
}

export function normalizeProjectPriority(
  priority:
    | NotebookProjectPriority
    | undefined,
): NotebookProjectPriority {
  if (
    priority === 'low'
    || priority === 'high'
    || priority === 'critical'
  ) {
    return priority
  }

  return 'normal'
}

export function normalizeProjectStatus(
  status:
    | NotebookProjectStatus
    | undefined,
): NotebookProjectStatus {
  if (
    status === 'active'
    || status === 'blocked'
    || status === 'complete'
  ) {
    return status
  }

  return 'planned'
}

export function isProjectSet(
  value: unknown,
): value is NotebookProjectSet {
  if (
    typeof value !== 'object'
    || value === null
    || Array.isArray(value)
  ) {
    return false
  }

  const candidate =
    value as Partial<NotebookProjectSet>

  const descriptionValid =
    candidate.description ===
      undefined
    || typeof candidate.description ===
      'string'

  const tagsValid =
    candidate.tags ===
      undefined
    || (
      Array.isArray(
        candidate.tags,
      )
      && candidate.tags.every(
        (tag) =>
          typeof tag ===
          'string',
      )
    )

  const statusValid =
    candidate.status ===
      undefined
    || candidate.status ===
      'planned'
    || candidate.status ===
      'active'
    || candidate.status ===
      'blocked'
    || candidate.status ===
      'complete'

  const progressValid =
    candidate.progress ===
      undefined
    || (
      typeof candidate.progress ===
        'number'
      && Number.isFinite(
        candidate.progress,
      )
    )


  const priorityValid =
    candidate.priority ===
      undefined
    || candidate.priority ===
      'low'
    || candidate.priority ===
      'normal'
    || candidate.priority ===
      'high'
    || candidate.priority ===
      'critical'

  const dueDateValid =
    candidate.dueDate ===
      undefined
    || normalizeProjectDueDate(
        candidate.dueDate,
      ) !== undefined


  const nextActionValid =
    candidate.nextAction ===
      undefined
    || typeof candidate.nextAction ===
      'string'

  return (
    typeof candidate.id === 'string'
    && typeof candidate.name === 'string'
    && typeof candidate.reportTitle === 'string'
    && descriptionValid
    && tagsValid
    && statusValid
    && progressValid
    && priorityValid
    && dueDateValid
    && nextActionValid
    && Array.isArray(
      candidate.calculatorIds,
    )
    && candidate.calculatorIds.every(
      (calculatorId) =>
        typeof calculatorId === 'string',
    )
    && typeof candidate.createdAt === 'string'
    && typeof candidate.updatedAt === 'string'
  )
}

function normalizeProjectSet(
  projectSet:
    NotebookProjectSet,
): NotebookProjectSet {
  const status =
    normalizeProjectStatus(
      projectSet.status,
    )

  const progress =
    status === 'complete'
      ? 100
      : normalizeProjectProgress(
          projectSet.progress,
        )

  return {
    ...projectSet,

    description:
      projectSet.description
        ?.trim()
      || undefined,

    tags:
      normalizeProjectSetTags(
        projectSet.tags
        ?? [],
      ),

    status,
    progress,

    priority:
      normalizeProjectPriority(
        projectSet.priority,
      ),

    dueDate:
      normalizeProjectDueDate(
        projectSet.dueDate,
      ),

    nextAction:
      projectSet.nextAction
        ?.trim()
      || undefined,
  }
}

export function readNotebookProjectSets():
  NotebookProjectSet[] {
  try {
    const raw =
      localStorage.getItem(
        PROJECT_SET_STORAGE_KEY,
      )

    if (!raw) {
      return []
    }

    const parsed: unknown =
      JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter(
        isProjectSet,
      )
      .map(
        normalizeProjectSet,
      )
      .sort(
        (
          left,
          right,
        ) =>
          new Date(
            right.updatedAt,
          ).getTime()
          - new Date(
              left.updatedAt,
            ).getTime(),
      )
  } catch {
    return []
  }
}

export function writeNotebookProjectSets(
  projectSets:
    NotebookProjectSet[],
) {
  localStorage.setItem(
    PROJECT_SET_STORAGE_KEY,
    JSON.stringify(
      projectSets.map(
        normalizeProjectSet,
      ),
    ),
  )
}

export function mergeNotebookProjectSets(
  current: NotebookProjectSet[],
  incoming: NotebookProjectSet[],
): NotebookProjectSet[] {
  const merged =
    new Map<
      string,
      NotebookProjectSet
    >()

  const addProjectSet =
    (
      projectSet:
        NotebookProjectSet,
    ) => {
      const normalized =
        normalizeProjectSet(
          projectSet,
        )

      const existing =
        merged.get(
          normalized.id,
        )

      if (!existing) {
        merged.set(
          normalized.id,
          normalized,
        )

        return
      }

      const existingUpdated =
        new Date(
          existing.updatedAt,
        ).getTime()

      const incomingUpdated =
        new Date(
          normalized.updatedAt,
        ).getTime()

      merged.set(
        normalized.id,
        incomingUpdated >=
          existingUpdated
          ? normalized
          : existing,
      )
    }

  current.forEach(
    addProjectSet,
  )

  incoming.forEach(
    addProjectSet,
  )

  return Array.from(
    merged.values(),
  ).sort(
    (
      left,
      right,
    ) =>
      new Date(
        right.updatedAt,
      ).getTime()
      - new Date(
          left.updatedAt,
        ).getTime(),
  )
}

export function createNotebookProjectSet({
  name,
  reportTitle,
  description,
  tags,
  status,
  progress,
  priority,
  dueDate,
  nextAction,
  calculatorIds,
}: {
  name: string
  reportTitle: string
  description?: string
  tags?: string[]
  status?: NotebookProjectStatus
  progress?: number
  priority?: NotebookProjectPriority
  dueDate?: string
  nextAction?: string
  calculatorIds: string[]
}): NotebookProjectSet {
  const now =
    new Date()
      .toISOString()

  const normalizedStatus =
    normalizeProjectStatus(
      status,
    )

  return {
    id:
      createId(),

    name:
      name.trim(),

    reportTitle:
      reportTitle.trim()
      || 'Engineering Project Report',

    description:
      description
        ?.trim()
      || undefined,

    tags:
      normalizeProjectSetTags(
        tags
        ?? [],
      ),

    status:
      normalizedStatus,

    progress:
      normalizedStatus ===
        'complete'
        ? 100
        : normalizeProjectProgress(
            progress,
          ),

    priority:
      normalizeProjectPriority(
        priority,
      ),

    dueDate:
      normalizeProjectDueDate(
        dueDate,
      ),

    nextAction:
      nextAction
        ?.trim()
      || undefined,

    calculatorIds:
      Array.from(
        new Set(
          calculatorIds,
        ),
      ),

    createdAt:
      now,

    updatedAt:
      now,
  }
}
