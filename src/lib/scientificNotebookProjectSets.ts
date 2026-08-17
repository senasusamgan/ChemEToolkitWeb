export const PROJECT_SET_STORAGE_KEY =
  'cheme-toolkit.notebook-project-sets.v1'

export interface NotebookProjectSet {
  id: string
  name: string
  reportTitle: string
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

  return (
    typeof candidate.id === 'string'
    && typeof candidate.name === 'string'
    && typeof candidate.reportTitle === 'string'
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
      .sort(
        (left, right) =>
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
  projectSets: NotebookProjectSet[],
) {
  localStorage.setItem(
    PROJECT_SET_STORAGE_KEY,
    JSON.stringify(
      projectSets,
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
      const existing =
        merged.get(
          projectSet.id,
        )

      if (!existing) {
        merged.set(
          projectSet.id,
          projectSet,
        )

        return
      }

      const existingUpdated =
        new Date(
          existing.updatedAt,
        ).getTime()

      const incomingUpdated =
        new Date(
          projectSet.updatedAt,
        ).getTime()

      merged.set(
        projectSet.id,
        incomingUpdated >=
          existingUpdated
          ? projectSet
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
  calculatorIds,
}: {
  name: string
  reportTitle: string
  calculatorIds: string[]
}): NotebookProjectSet {
  const now =
    new Date()
      .toISOString()

  return {
    id:
      createId(),

    name:
      name.trim(),

    reportTitle:
      reportTitle.trim()
      || 'Engineering Project Report',

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
