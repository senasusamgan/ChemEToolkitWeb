import {
  useState,
} from 'react'

import {
  createNotebookProjectSet,
  type NotebookProjectSet,
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
    status,
    setStatus,
  ] = useState(
    'Save reusable calculator selections for future project reports.',
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
      currentCalculatorIds.length === 0
    ) {
      setStatus(
        'Select at least one notebook before saving a project set.',
      )
      return
    }

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
      const updated: NotebookProjectSet = {
        ...existing,
        name:
          normalizedName,
        reportTitle:
          currentTitle.trim()
          || 'Engineering Project Report',
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

    setName('')
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

        <button
          type="button"
          onClick={
            saveProjectSet
          }
          disabled={
            currentCalculatorIds.length === 0
          }
        >
          Save current selection
        </button>
      </div>

      {projectSets.length > 0 ? (
        <div className="scientific-notebook-project-set-list">
          {projectSets.map(
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
          No saved project sets yet.
        </p>
      )}
    </section>
  )
}
