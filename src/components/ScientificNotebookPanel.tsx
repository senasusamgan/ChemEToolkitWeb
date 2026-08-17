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

interface SnapshotInput {
  label: string
  value: string
  unit: string
}

interface SnapshotResult {
  label: string
  value: string
  unit: string
}

interface CalculationSnapshot {
  id: string
  capturedAt: string
  inputs: SnapshotInput[]
  results: SnapshotResult[]
  formula: string
  reference: string
}

interface NotebookRecord {
  calculatorId: string
  calculatorTitle: string
  category: string
  objective: string
  assumptions: string
  observations: string
  conclusion: string
  snapshots: CalculationSnapshot[]
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
  | 'captured'
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

function normalizeText(
  value:
    | string
    | null
    | undefined,
): string {
  return (
    value
      ?.replace(
        /\s+/g,
        ' ',
      )
      .trim()
    ?? ''
  )
}

function createId(): string {
  if (
    typeof crypto !==
      'undefined'
    && 'randomUUID'
      in crypto
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

function getCalculatorRoot():
  ParentNode | null {
  const stageBody =
    document.querySelector<HTMLElement>(
      '.calculator-stage-body',
    )

  if (!stageBody) {
    return null
  }

  return (
    stageBody.querySelector(
      '.native-calculator',
    )
    ?? stageBody
  )
}

function getControls(
  root: ParentNode,
): Array<
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
> {
  return Array.from(
    root.querySelectorAll<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >(
      'input, select, textarea',
    ),
  ).filter(
    (control) =>
      control.type !==
        'hidden'
      && control.type !==
        'button'
      && control.type !==
        'submit'
      && control.type !==
        'reset',
  )
}

function findInputLabel(
  control:
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement,
): string {
  const label =
    control.closest(
      'label',
    )

  const directLabel =
    label?.querySelector<HTMLElement>(
      ':scope > span:first-child',
    )

  return (
    normalizeText(
      directLabel?.textContent,
    )
    || normalizeText(
      control.getAttribute(
        'aria-label',
      ),
    )
    || normalizeText(
      control.getAttribute(
        'name',
      ),
    )
    || normalizeText(
      control.getAttribute(
        'placeholder',
      ),
    )
    || 'Input'
  )
}

function findInputUnit(
  control:
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement,
): string {
  const shell =
    control.closest(
      '.native-input-shell',
    )

  return (
    normalizeText(
      shell
        ?.querySelector(
          'b',
        )
        ?.textContent,
    )
    || normalizeText(
      control.parentElement
        ?.querySelector(
          ':scope > b, :scope > small, :scope > span:last-child',
        )
        ?.textContent,
    )
  )
}

function collectInputs(
  root: ParentNode,
): SnapshotInput[] {
  return getControls(
    root,
  ).map(
    (control) => ({
      label:
        findInputLabel(
          control,
        ),

      value:
        control instanceof
        HTMLSelectElement
          ? (
              normalizeText(
                control
                  .selectedOptions[0]
                  ?.textContent,
              )
              || 'Not entered'
            )
          : (
              normalizeText(
                control.value,
              )
              || 'Not entered'
            ),

      unit:
        findInputUnit(
          control,
        ),
    }),
  )
}

function collectResults(
  root: ParentNode,
): SnapshotResult[] {
  const results:
    SnapshotResult[] = []

  const heading =
    root.querySelector<HTMLElement>(
      '.native-result-heading',
    )

  if (heading) {
    const label =
      normalizeText(
        heading
          .querySelector('p')
          ?.textContent,
      )

    const value =
      normalizeText(
        heading
          .querySelector(
            'strong',
          )
          ?.textContent,
      )

    const unit =
      normalizeText(
        heading
          .querySelector(
            ':scope > span',
          )
          ?.textContent,
      )

    if (
      label
      || value
    ) {
      results.push({
        label:
          label
          || 'Primary result',
        value:
          value
          || 'Not calculated',
        unit,
      })
    }
  }

  root
    .querySelectorAll<HTMLElement>(
      '.native-result-grid article',
    )
    .forEach(
      (article) => {
        results.push({
          label:
            normalizeText(
              article
                .querySelector('p')
                ?.textContent,
            )
            || 'Result',

          value:
            normalizeText(
              article
                .querySelector(
                  'strong',
                )
                ?.textContent,
            )
            || '—',

          unit:
            normalizeText(
              article
                .querySelector(
                  'span',
                )
                ?.textContent,
            ),
        })
      },
    )

  if (
    results.length === 0
  ) {
    const fallback =
      root.querySelector<HTMLElement>(
        [
          '.native-result-panel',
          '.result-panel',
          '.result-card',
          '.calculator-result',
          '[data-result]',
        ].join(','),
      )

    const fallbackText =
      normalizeText(
        fallback?.textContent,
      )

    if (fallbackText) {
      results.push({
        label:
          'Calculated output',
        value:
          fallbackText,
        unit: '',
      })
    }
  }

  return results
}

function captureCurrentCalculation():
  CalculationSnapshot | null {
  const root =
    getCalculatorRoot()

  if (!root) {
    return null
  }

  const inputs =
    collectInputs(
      root,
    )

  const results =
    collectResults(
      root,
    )

  if (
    inputs.length === 0
    && results.length === 0
  ) {
    return null
  }

  const formula =
    normalizeText(
      root.querySelector<HTMLElement>(
        '.native-formula',
      )?.textContent,
    )

  const reference =
    normalizeText(
      root.querySelector<HTMLElement>(
        '.native-reference',
      )?.textContent,
    )
      .replace(
        /View bibliography\s*↘?/i,
        '',
      )
      .trim()

  return {
    id:
      createId(),

    capturedAt:
      new Date()
        .toISOString(),

    inputs,
    results,
    formula,
    reference,
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
    snapshots,
    setSnapshots,
  ] = useState<
    CalculationSnapshot[]
  >([])

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

    setSnapshots(
      Array.isArray(
        saved?.snapshots,
      )
        ? saved.snapshots
        : [],
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
    || snapshots.length > 0

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
      snapshots,
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

  function captureCalculation() {
    const snapshot =
      captureCurrentCalculation()

    if (!snapshot) {
      setStatus(
        'error',
      )
      return
    }

    try {
      const nextSnapshots =
        [
          snapshot,
          ...snapshots,
        ].slice(
          0,
          20,
        )

      const store =
        readStore()

      store[
        calculatorId
      ] = {
        ...buildRecord(),
        snapshots:
          nextSnapshots,
        updatedAt:
          new Date()
            .toISOString(),
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          store,
        ),
      )

      setSnapshots(
        nextSnapshots,
      )

      setStatus(
        'captured',
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
      setSnapshots([])

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
      '## Calculation Snapshots',
      '',
      ...(
        record.snapshots.length
          ? record.snapshots.flatMap(
              (
                snapshot,
                index,
              ) => [
                `### Snapshot ${index + 1}`,
                '',
                `Captured: ${snapshot.capturedAt}`,
                '',
                '#### Inputs',
                '',
                ...(
                  snapshot.inputs.length
                    ? snapshot.inputs.map(
                        (input) =>
                          `- **${input.label}:** ${input.value}${input.unit ? ` ${input.unit}` : ''}`,
                      )
                    : ['- No captured inputs.']
                ),
                '',
                '#### Results',
                '',
                ...(
                  snapshot.results.length
                    ? snapshot.results.map(
                        (result) =>
                          `- **${result.label}:** ${result.value}${result.unit ? ` ${result.unit}` : ''}`,
                      )
                    : ['- No captured results.']
                ),
                '',
                snapshot.formula
                  ? `**Formula:** ${snapshot.formula}`
                  : '',
                '',
                snapshot.reference
                  ? `**Reference:** ${snapshot.reference}`
                  : '',
                '',
              ],
            )
          : [
              'No calculation snapshots captured.',
              '',
            ]
      ),
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
      : status === 'captured'
        ? 'Current calculation captured.'
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

      <section
        className="scientific-notebook-snapshots"
        aria-label="Captured calculation snapshots"
      >
        <header>
          <div>
            <span>
              Calculation snapshots
            </span>

            <strong>
              {snapshots.length}
            </strong>
          </div>

          <button
            type="button"
            onClick={captureCalculation}
          >
            Capture current calculation
          </button>
        </header>

        {snapshots.length > 0 ? (
          <div className="scientific-notebook-snapshot-list">
            {snapshots.map(
              (
                snapshot,
                index,
              ) => (
                <article
                  key={snapshot.id}
                >
                  <header>
                    <strong>
                      Snapshot {index + 1}
                    </strong>

                    <time
                      dateTime={snapshot.capturedAt}
                    >
                      {new Date(
                        snapshot.capturedAt,
                      ).toLocaleString()}
                    </time>
                  </header>

                  <div>
                    <section>
                      <span>
                        Inputs
                      </span>

                      <ul>
                        {snapshot.inputs.map(
                          (
                            input,
                            inputIndex,
                          ) => (
                            <li
                              key={`${input.label}:${inputIndex}`}
                            >
                              <strong>
                                {input.label}
                              </strong>

                              <span>
                                {input.value}
                                {input.unit
                                  ? ` ${input.unit}`
                                  : ''}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    </section>

                    <section>
                      <span>
                        Results
                      </span>

                      <ul>
                        {snapshot.results.map(
                          (
                            result,
                            resultIndex,
                          ) => (
                            <li
                              key={`${result.label}:${resultIndex}`}
                            >
                              <strong>
                                {result.label}
                              </strong>

                              <span>
                                {result.value}
                                {result.unit
                                  ? ` ${result.unit}`
                                  : ''}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    </section>
                  </div>

                  {snapshot.formula ? (
                    <p>
                      <strong>
                        Formula
                      </strong>
                      {' '}
                      {snapshot.formula}
                    </p>
                  ) : null}

                  {snapshot.reference ? (
                    <p>
                      <strong>
                        Reference
                      </strong>
                      {' '}
                      {snapshot.reference}
                    </p>
                  ) : null}
                </article>
              ),
            )}
          </div>
        ) : (
          <p className="scientific-notebook-empty">
            Run a calculation, then capture its current inputs and results here.
          </p>
        )}
      </section>

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
