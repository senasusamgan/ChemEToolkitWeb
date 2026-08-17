import {
  useMemo,
  useState,
} from 'react'

import {
  createNotebookProjectSet,
  normalizeProjectProgress,
  normalizeProjectSetTags,
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
              !normalizedQuery
            ) {
              return true
            }

            const searchable =
              [
                projectSet.name,
                projectSet.reportTitle,
                projectSet.description,
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
      ],
    )

  const portfolioMetrics =
    useMemo(
      () => {
        let planned = 0
        let active = 0
        let blocked = 0
        let complete = 0
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
          averageProgress,
        }
      },
      [
        projectSets,
      ],
    )

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

    setStatus(
      `Editing "${projectSet.name}". Save current selection to update it.`,
    )
  }

  function clearFilters() {
    setQuery('')
    setTagFilter('all')
    setStatusFilter('all')
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
          }
        >
          Clear filters
        </button>

        <span>
          {visibleProjectSets.length}
          {' '}
          visible
        </span>
      </div>

      {visibleProjectSets.length > 0 ? (
        <div className="scientific-notebook-project-set-list">
          {visibleProjectSets.map(
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
            ? 'No project sets match the current search or tag filter.'
            : 'No saved project sets yet.'}
        </p>
      )}
    </section>
  )
}
