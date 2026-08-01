import {
  useMemo,
  useState,
} from 'react'

import {
  calculators,
} from '../data/calculators'
import {
  rankProblemSolvers,
} from '../features/problem-solver/problemSolverEngine'

import '../styles/batch-problem-solver-panel.css'

interface BatchProblemSolverPanelProps {
  onLoadCase: (
    problem: string,
  ) => void
}

type BatchCaseStatus =
  | 'solved'
  | 'needs-inputs'
  | 'unmatched'

type BatchFilter =
  | 'all'
  | 'solved'
  | 'issues'

interface BatchCaseResult {
  id: string
  index: number
  problem: string
  calculatorId:
    string | null
  calculatorTitle: string
  category: string
  readinessPercent: number
  status: BatchCaseStatus
  resultLabel: string
  resultValue: string
  resultUnit: string
  missingVariables: string[]
}

const MAXIMUM_CASES =
  25

const DEFAULT_BATCH_CASES = [
  'PV=nRT; P=101325 Pa; n=1 mol; T=300 K; V=?',
  'Re=ρvD/μ; ρ=998 kg/m3; v=2 m/s; D=0.05 m; μ=0.001 Pa s',
  'Q=Av; Q=0.02 m3/s; A=0.01 m2; solve for v',
  'PV=nRT; P=2 bar; n=2 mol; T=350 K; V=?',
] as const

function statusLabel(
  status: BatchCaseStatus,
): string {
  if (
    status ===
    'solved'
  ) {
    return 'Solved'
  }

  if (
    status ===
    'needs-inputs'
  ) {
    return 'Inputs required'
  }

  return 'No match'
}

function csvCell(
  value: string,
): string {
  return `"${value.replace(
    /"/g,
    '""',
  )}"`
}

async function copyText(
  value: string,
): Promise<void> {
  if (
    navigator.clipboard &&
    typeof navigator
      .clipboard
      .writeText ===
      'function'
  ) {
    await navigator
      .clipboard
      .writeText(
        value,
      )

    return
  }

  const textArea =
    document.createElement(
      'textarea',
    )

  textArea.value =
    value

  textArea.setAttribute(
    'readonly',
    '',
  )

  textArea.style.position =
    'fixed'

  textArea.style.opacity =
    '0'

  document.body.appendChild(
    textArea,
  )

  textArea.select()

  const copied =
    document.execCommand(
      'copy',
    )

  textArea.remove()

  if (!copied) {
    throw new Error(
      'Browser copy command failed.',
    )
  }
}

export function BatchProblemSolverPanel({
  onLoadCase,
}: BatchProblemSolverPanelProps) {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false)

  const [
    batchText,
    setBatchText,
  ] = useState(
    DEFAULT_BATCH_CASES.join(
      '\n',
    ),
  )

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<
    BatchFilter
  >('all')

  const [
    feedbackMessage,
    setFeedbackMessage,
  ] = useState('')

  const caseLines =
    useMemo(
      () =>
        batchText
          .split(
            /\r?\n/,
          )
          .map(
            (line) =>
              line.trim(),
          )
          .filter(
            Boolean,
          )
          .slice(
            0,
            MAXIMUM_CASES,
          ),
      [
        batchText,
      ],
    )

  const results =
    useMemo<
      BatchCaseResult[]
    >(
      () =>
        caseLines.map(
          (
            problem,
            index,
          ) => {
            const match =
              rankProblemSolvers(
                problem,
                calculators,
                1,
              )[0]

            if (!match) {
              return {
                id:
                  `${index}-${problem}`,
                index:
                  index +
                  1,
                problem,
                calculatorId:
                  null,
                calculatorTitle:
                  'No calculator match',
                category:
                  'Unrecognized',
                readinessPercent:
                  0,
                status:
                  'unmatched',
                resultLabel:
                  'Result',
                resultValue:
                  'Not available',
                resultUnit:
                  '',
                missingVariables:
                  [],
              }
            }

            const quickSolution =
              match.quickSolution

            return {
              id:
                `${index}-${problem}`,
              index:
                index +
                1,
              problem,
              calculatorId:
                match.calculatorId,
              calculatorTitle:
                match.title,
              category:
                match.category,
              readinessPercent:
                match
                  .equationContext
                  .readinessPercent,
              status:
                quickSolution
                  ? 'solved'
                  : 'needs-inputs',
              resultLabel:
                quickSolution
                  ?.resultLabel ??
                'Result',
              resultValue:
                quickSolution
                  ?.resultValue ??
                'Waiting for inputs',
              resultUnit:
                quickSolution
                  ?.unit ??
                '',
              missingVariables:
                match
                  .equationContext
                  .missingVariableNames,
            }
          },
        ),
      [
        caseLines,
      ],
    )

  const solvedCount =
    results.filter(
      (result) =>
        result.status ===
        'solved',
    ).length

  const inputIssueCount =
    results.filter(
      (result) =>
        result.status ===
        'needs-inputs',
    ).length

  const unmatchedCount =
    results.filter(
      (result) =>
        result.status ===
        'unmatched',
    ).length

  const averageReadiness =
    results.length ===
    0
      ? 0
      : Math.round(
          results.reduce(
            (
              total,
              result,
            ) =>
              total +
              result.readinessPercent,
            0,
          ) /
            results.length,
        )

  const filteredResults =
    useMemo(
      () => {
        if (
          activeFilter ===
          'solved'
        ) {
          return results.filter(
            (result) =>
              result.status ===
              'solved',
          )
        }

        if (
          activeFilter ===
          'issues'
        ) {
          return results.filter(
            (result) =>
              result.status !==
              'solved',
          )
        }

        return results
      },
      [
        activeFilter,
        results,
      ],
    )

  function loadSampleCases() {
    setBatchText(
      DEFAULT_BATCH_CASES.join(
        '\n',
      ),
    )

    setActiveFilter(
      'all',
    )

    setFeedbackMessage(
      'Sample engineering cases loaded.',
    )
  }

  function clearCases() {
    setBatchText('')
    setActiveFilter(
      'all',
    )

    setFeedbackMessage(
      'Batch cases cleared.',
    )
  }

  function loadCase(
    result: BatchCaseResult,
  ) {
    onLoadCase(
      result.problem,
    )

    setFeedbackMessage(
      `Case ${result.index} loaded into the main Solver.`,
    )
  }

  async function copyBatchSummary() {
    if (
      results.length ===
      0
    ) {
      setFeedbackMessage(
        'Add at least one engineering case first.',
      )
      return
    }

    const summary = [
      'ChemE Toolkit Batch Engineering Results',
      '',
      `Cases: ${results.length}`,
      `Solved: ${solvedCount}`,
      `Inputs required: ${inputIssueCount}`,
      `Unmatched: ${unmatchedCount}`,
      `Average readiness: ${averageReadiness}%`,
      '',
      ...results.flatMap(
        (result) => [
          `CASE ${result.index}`,
          result.problem,
          `Calculator: ${result.calculatorTitle}`,
          `Category: ${result.category}`,
          `Status: ${statusLabel(result.status)}`,
          `Readiness: ${result.readinessPercent}%`,
          `Result: ${
            result.status ===
            'solved'
              ? `${result.resultLabel} = ${result.resultValue}`
              : result.missingVariables.length >
                  0
                ? `Missing ${result.missingVariables.join(', ')}`
                : 'Not available'
          }`,
          '',
        ],
      ),
    ].join(
      '\n',
    )

    try {
      await copyText(
        summary,
      )

      setFeedbackMessage(
        'Batch result summary copied.',
      )
    } catch {
      setFeedbackMessage(
        'Batch summary could not be copied.',
      )
    }
  }

  function exportBatchCsv() {
    if (
      results.length ===
      0
    ) {
      setFeedbackMessage(
        'Add at least one engineering case first.',
      )
      return
    }

    const rows = [
      [
        'Case',
        'Problem',
        'Calculator',
        'Category',
        'Status',
        'Readiness percent',
        'Result label',
        'Result value',
        'Result unit',
        'Missing variables',
      ],
      ...results.map(
        (result) => [
          String(
            result.index,
          ),
          result.problem,
          result.calculatorTitle,
          result.category,
          statusLabel(
            result.status,
          ),
          String(
            result.readinessPercent,
          ),
          result.resultLabel,
          result.resultValue,
          result.resultUnit,
          result.missingVariables.join(
            ', ',
          ),
        ],
      ),
    ]

    const csv =
      rows
        .map(
          (row) =>
            row
              .map(
                csvCell,
              )
              .join(','),
        )
        .join('\n')

    const blob =
      new Blob(
        [
          csv,
        ],
        {
          type:
            'text/csv;charset=utf-8',
        },
      )

    const objectUrl =
      URL.createObjectURL(
        blob,
      )

    const link =
      document.createElement(
        'a',
      )

    link.href =
      objectUrl

    link.download =
      'cheme-toolkit-batch-results.csv'

    document.body.appendChild(
      link,
    )

    link.click()
    link.remove()

    window.setTimeout(
      () =>
        URL.revokeObjectURL(
          objectUrl,
        ),
      0,
    )

    setFeedbackMessage(
      'Batch results exported as CSV.',
    )
  }

  return (
    <section
      className="batch-problem-solver-panel"
      data-open={
        isOpen
          ? 'true'
          : 'false'
      }
      aria-labelledby="batch-problem-solver-title"
    >
      <header className="batch-problem-solver-launcher">
        <div>
          <span>
            Multi-case engineering workflow
          </span>

          <h3 id="batch-problem-solver-title">
            Batch case solver
          </h3>

          <p>
            Evaluate up to 25 engineering cases and
            compare their calculator matches, readiness
            and Quick Solve results.
          </p>
        </div>

        <div className="batch-problem-solver-launcher-actions">
          <strong>
            {results.length}
            {' cases · '}
            {solvedCount}
            {' solved'}
          </strong>

          <button
            type="button"
            aria-expanded={
              isOpen
            }
            onClick={() =>
              setIsOpen(
                (current) =>
                  !current,
              )
            }
          >
            {
              isOpen
                ? 'Close batch solver'
                : 'Open batch solver'
            }
          </button>
        </div>
      </header>

      {isOpen ? (
        <div className="batch-problem-solver-content">
          <div className="batch-problem-solver-editor">
            <div className="batch-problem-editor-header">
              <div>
                <span>
                  Engineering cases
                </span>

                <strong>
                  One problem per line
                </strong>
              </div>

              <span>
                {
                  caseLines.length
                }
                {' / '}
                {MAXIMUM_CASES}
              </span>
            </div>

            <label htmlFor="batch-problem-cases">
              Enter equations and known values
            </label>

            <textarea
              id="batch-problem-cases"
              value={
                batchText
              }
              rows={10}
              spellCheck={false}
              placeholder="PV=nRT; P=101325 Pa; n=1 mol; T=300 K; V=?"
              onChange={(event) => {
                setBatchText(
                  event.target.value,
                )

                setFeedbackMessage(
                  '',
                )
              }}
            />

            <div className="batch-problem-editor-actions">
              <button
                type="button"
                onClick={
                  loadSampleCases
                }
              >
                Load sample batch
              </button>

              <button
                type="button"
                className="is-danger"
                onClick={
                  clearCases
                }
              >
                Clear cases
              </button>
            </div>

            <p>
              Blank lines are ignored. Only the first
              25 non-empty lines are evaluated.
            </p>
          </div>

          <div className="batch-problem-solver-results">
            <div className="batch-problem-summary">
              <article>
                <span>
                  Total cases
                </span>

                <strong>
                  {results.length}
                </strong>
              </article>

              <article data-state="solved">
                <span>
                  Solved
                </span>

                <strong>
                  {solvedCount}
                </strong>
              </article>

              <article data-state="review">
                <span>
                  Inputs required
                </span>

                <strong>
                  {inputIssueCount}
                </strong>
              </article>

              <article data-state="blocked">
                <span>
                  Unmatched
                </span>

                <strong>
                  {unmatchedCount}
                </strong>
              </article>

              <article>
                <span>
                  Average readiness
                </span>

                <strong>
                  {averageReadiness}%
                </strong>
              </article>
            </div>

            <div className="batch-problem-filter-bar">
              <span>
                Show results
              </span>

              <div>
                <button
                  type="button"
                  className={
                    activeFilter ===
                    'all'
                      ? 'is-active'
                      : undefined
                  }
                  onClick={() =>
                    setActiveFilter(
                      'all',
                    )
                  }
                >
                  All ({results.length})
                </button>

                <button
                  type="button"
                  className={
                    activeFilter ===
                    'solved'
                      ? 'is-active'
                      : undefined
                  }
                  onClick={() =>
                    setActiveFilter(
                      'solved',
                    )
                  }
                >
                  Solved ({solvedCount})
                </button>

                <button
                  type="button"
                  className={
                    activeFilter ===
                    'issues'
                      ? 'is-active'
                      : undefined
                  }
                  onClick={() =>
                    setActiveFilter(
                      'issues',
                    )
                  }
                >
                  Issues ({
                    inputIssueCount +
                    unmatchedCount
                  })
                </button>
              </div>
            </div>

            {filteredResults.length >
            0 ? (
              <div className="batch-problem-table-wrap">
                <table className="batch-problem-table">
                  <thead>
                    <tr>
                      <th>
                        Case
                      </th>

                      <th>
                        Problem
                      </th>

                      <th>
                        Calculator
                      </th>

                      <th>
                        Readiness
                      </th>

                      <th>
                        Result
                      </th>

                      <th>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredResults.map(
                      (result) => (
                        <tr
                          key={
                            result.id
                          }
                          data-status={
                            result.status
                          }
                        >
                          <td>
                            <strong>
                              #{result.index}
                            </strong>

                            <span>
                              {
                                statusLabel(
                                  result.status,
                                )
                              }
                            </span>
                          </td>

                          <td>
                            <code>
                              {result.problem}
                            </code>
                          </td>

                          <td>
                            <strong>
                              {
                                result.calculatorTitle
                              }
                            </strong>

                            <span>
                              {result.category}
                            </span>
                          </td>

                          <td>
                            <div className="batch-problem-readiness">
                              <strong>
                                {
                                  result.readinessPercent
                                }%
                              </strong>

                              <progress
                                max="100"
                                value={
                                  result.readinessPercent
                                }
                              />
                            </div>
                          </td>

                          <td>
                            {result.status ===
                            'solved' ? (
                              <div className="batch-problem-result-value">
                                <strong>
                                  {
                                    result.resultLabel
                                  }
                                  {' = '}
                                  {
                                    result.resultValue
                                  }
                                </strong>

                                {result.resultUnit ? (
                                  <span>
                                    {
                                      result.resultUnit
                                    }
                                  </span>
                                ) : null}
                              </div>
                            ) : result.missingVariables.length >
                              0 ? (
                              <div className="batch-problem-result-issue">
                                <strong>
                                  Missing inputs
                                </strong>

                                <span>
                                  {
                                    result
                                      .missingVariables
                                      .join(
                                        ', ',
                                      )
                                  }
                                </span>
                              </div>
                            ) : (
                              <div className="batch-problem-result-issue">
                                <strong>
                                  Result unavailable
                                </strong>

                                <span>
                                  Review the problem text.
                                </span>
                              </div>
                            )}
                          </td>

                          <td>
                            <button
                              type="button"
                              onClick={() =>
                                loadCase(
                                  result,
                                )
                              }
                            >
                              Load in Solver
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="batch-problem-empty">
                <strong>
                  No cases match this filter
                </strong>

                <p>
                  Change the filter or enter additional
                  engineering problems.
                </p>
              </div>
            )}

            {feedbackMessage ? (
              <p
                className="batch-problem-feedback"
                role="status"
              >
                {feedbackMessage}
              </p>
            ) : null}

            <footer className="batch-problem-footer">
              <div>
                <button
                  type="button"
                  disabled={
                    results.length ===
                    0
                  }
                  onClick={
                    copyBatchSummary
                  }
                >
                  Copy batch summary
                </button>

                <button
                  type="button"
                  className="is-primary"
                  disabled={
                    results.length ===
                    0
                  }
                  onClick={
                    exportBatchCsv
                  }
                >
                  Export batch CSV
                </button>
              </div>

              <span>
                All cases are evaluated locally in this
                browser.
              </span>
            </footer>
          </div>
        </div>
      ) : null}
    </section>
  )
}
