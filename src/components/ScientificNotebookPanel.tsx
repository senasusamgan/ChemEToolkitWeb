import {
  useEffect,
  useState,
} from 'react'

import '../styles/scientific-notebook.css'

const STORAGE_KEY =
  'cheme-toolkit.scientific-notebook.v1'

interface ScientificNotebookPanelProps {
  calculatorId: string
  calculatorTitle: string
  category: string
  onClose: () => void
}

interface NotebookRecord {
  calculatorId: string
  calculatorTitle: string
  category: string
  objective: string
  assumptions: string
  observations: string
  conclusion: string
  updatedAt: string
}

type NotebookStore =
  Record<
    string,
    NotebookRecord
  >

type Status =
  | 'idle'
  | 'saved'
  | 'exported'
  | 'cleared'
  | 'error'

function readStore(): NotebookStore {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY,
      )

    if (!raw) {
      return {}
    }

    const parsed: unknown =
      JSON.parse(raw)

    if (
      typeof parsed !== 'object'
      || parsed === null
      || Array.isArray(parsed)
    ) {
      return {}
    }

    return parsed as NotebookStore
  } catch {
    return {}
  }
}

function createSlug(
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

export function ScientificNotebookPanel({
  calculatorId,
  calculatorTitle,
  category,
  onClose,
}: ScientificNotebookPanelProps) {
  const [
    objective,
    setObjective,
  ] = useState('')

  const [
    assumptions,
    setAssumptions,
  ] = useState('')

  const [
    observations,
    setObservations,
  ] = useState('')

  const [
    conclusion,
    setConclusion,
  ] = useState('')

  const [
    status,
    setStatus,
  ] = useState<Status>(
    'idle',
  )

  useEffect(() => {
    const saved =
      readStore()[
        calculatorId
      ]

    setObjective(
      saved?.objective ?? '',
    )

    setAssumptions(
      saved?.assumptions ?? '',
    )

    setObservations(
      saved?.observations ?? '',
    )

    setConclusion(
      saved?.conclusion ?? '',
    )

    setStatus(
      'idle',
    )
  }, [calculatorId])

  const hasContent =
    [
      objective,
      assumptions,
      observations,
      conclusion,
    ].some(
      (value) =>
        value.trim().length > 0,
    )

  function buildRecord():
    NotebookRecord {
    return {
      calculatorId,
      calculatorTitle,
      category,
      objective:
        objective.trim(),
      assumptions:
        assumptions.trim(),
      observations:
        observations.trim(),
      conclusion:
        conclusion.trim(),
      updatedAt:
        new Date().toISOString(),
    }
  }

  function saveNotebook() {
    try {
      const store =
        readStore()

      store[
        calculatorId
      ] = buildRecord()

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          store,
        ),
      )

      setStatus(
        'saved',
      )
    } catch {
      setStatus(
        'error',
      )
    }
  }

  function clearNotebook() {
    if (
      hasContent
      && !window.confirm(
        'Clear the notebook for this calculator?',
      )
    ) {
      return
    }

    try {
      const store =
        readStore()

      delete store[
        calculatorId
      ]

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          store,
        ),
      )

      setObjective('')
      setAssumptions('')
      setObservations('')
      setConclusion('')

      setStatus(
        'cleared',
      )
    } catch {
      setStatus(
        'error',
      )
    }
  }

  function exportNotebook() {
    const record =
      buildRecord()

    const markdown = [
      `# ${record.calculatorTitle}`,
      '',
      `**Category:** ${record.category}`,
      '',
      `**Calculator ID:** \`${record.calculatorId}\``,
      '',
      `**Updated:** ${record.updatedAt}`,
      '',
      '## Objective',
      '',
      record.objective || '—',
      '',
      '## Assumptions',
      '',
      record.assumptions || '—',
      '',
      '## Observations',
      '',
      record.observations || '—',
      '',
      '## Conclusion',
      '',
      record.conclusion || '—',
      '',
      '---',
      '',
      'Generated with ChemE Toolkit Scientific Notebook.',
      '',
    ].join('\n')

    const blob =
      new Blob(
        [
          markdown,
        ],
        {
          type:
            'text/markdown;charset=utf-8',
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

    anchor.download =
      `${
        createSlug(
          calculatorTitle,
        )
        || calculatorId
      }-notebook.md`

    document.body.appendChild(
      anchor,
    )

    anchor.click()
    anchor.remove()

    URL.revokeObjectURL(
      url,
    )

    setStatus(
      'exported',
    )
  }

  const statusText =
    status === 'saved'
      ? 'Notebook saved locally.'
      : status === 'exported'
        ? 'Markdown exported.'
        : status === 'cleared'
          ? 'Notebook cleared.'
          : status === 'error'
            ? 'Notebook action failed.'
            : 'Stored locally on this device.'

  return (
    <aside
      id="scientific-notebook-panel"
      className="scientific-notebook"
      aria-label={`${calculatorTitle} scientific notebook`}
    >
      <header className="scientific-notebook-header">
        <div>
          <span>
            Scientific Notebook
          </span>

          <h3>
            {calculatorTitle}
          </h3>

          <p>
            Capture the engineering
            reasoning behind the
            calculation.
          </p>
        </div>

        <button
          type="button"
          className="scientific-notebook-close"
          onClick={onClose}
          aria-label="Close scientific notebook"
        >
          ×
        </button>
      </header>

      <div className="scientific-notebook-grid">
        <label>
          <span>
            Objective
          </span>

          <textarea
            value={objective}
            onChange={(event) => {
              setObjective(
                event.target.value,
              )

              setStatus(
                'idle',
              )
            }}
            placeholder="What are you trying to determine?"
            rows={4}
          />
        </label>

        <label>
          <span>
            Assumptions
          </span>

          <textarea
            value={assumptions}
            onChange={(event) => {
              setAssumptions(
                event.target.value,
              )

              setStatus(
                'idle',
              )
            }}
            placeholder="Steady state, ideal behavior, negligible losses…"
            rows={4}
          />
        </label>

        <label>
          <span>
            Observations
          </span>

          <textarea
            value={observations}
            onChange={(event) => {
              setObservations(
                event.target.value,
              )

              setStatus(
                'idle',
              )
            }}
            placeholder="Trends, sensitivities, unexpected results…"
            rows={4}
          />
        </label>

        <label>
          <span>
            Conclusion
          </span>

          <textarea
            value={conclusion}
            onChange={(event) => {
              setConclusion(
                event.target.value,
              )

              setStatus(
                'idle',
              )
            }}
            placeholder="What engineering decision follows from the result?"
            rows={4}
          />
        </label>
      </div>

      <footer className="scientific-notebook-footer">
        <span
          role="status"
          aria-live="polite"
        >
          {statusText}
        </span>

        <div>
          <button
            type="button"
            onClick={clearNotebook}
          >
            Clear
          </button>

          <button
            type="button"
            onClick={exportNotebook}
          >
            Export .md
          </button>

          <button
            type="button"
            className="scientific-notebook-primary"
            onClick={saveNotebook}
          >
            Save notebook
          </button>
        </div>
      </footer>
    </aside>
  )
}
