export const PROJECT_SET_STORAGE_KEY =
  'cheme-toolkit.notebook-project-sets.v1'

export interface NotebookProjectSet {
  id: string
  name: string
  reportTitle: string
  description?: string
  tags?: string[]
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

  return (
    typeof candidate.id === 'string'
    && typeof candidate.name === 'string'
    && typeof candidate.reportTitle === 'string'
    && descriptionValid
    && tagsValid
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
      .map(
        (projectSet) => ({
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
        }),
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
      const normalized: NotebookProjectSet = {
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
      }

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
  calculatorIds,
}: {
  name: string
  reportTitle: string
  description?: string
  tags?: string[]
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

    description:
      description
        ?.trim()
      || undefined,

    tags:
      normalizeProjectSetTags(
        tags
        ?? [],
      ),

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
