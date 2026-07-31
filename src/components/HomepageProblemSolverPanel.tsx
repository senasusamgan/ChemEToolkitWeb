import {
  useMemo,
  useState,
} from 'react'

import { calculators } from '../data/calculators'
import {
  rankProblemSolvers,
} from '../features/problem-solver/problemSolverEngine'

import '../styles/homepage-problem-solver.css'

interface HomepageProblemSolverPanelProps {
  onOpenCalculator: (
    calculatorId: string,
  ) => void
}

const EXAMPLES = [
  {
    label:
      'Ideal gas volume',
    query:
      'PV=nRT; P=101325 Pa; n=1 mol; T=300 K; V=?',
  },
  {
    label:
      'Reynolds number',
    query:
      'Re=ρvD/μ; ρ=998 kg/m3; v=2 m/s; D=0.05 m; μ=0.001 Pa s',
  },
  {
    label:
      'Flow velocity',
    query:
      'Q=Av; Q=0.02 m3/s; A=0.01 m2; solve for v',
  },
  {
    label:
      'Fick diffusion',
    query:
      'J=-DΔC/L, solve for D',
  },
] as const

function statusLabel(
  status: string,
): string {
  if (status === 'ready') {
    return 'Ready to solve'
  }

  if (status === 'needs-inputs') {
    return 'More inputs needed'
  }

  if (status === 'ambiguous') {
    return 'Review required'
  }

  return 'Problem identified'
}

export function HomepageProblemSolverPanel({
  onOpenCalculator,
}: HomepageProblemSolverPanelProps) {
  const [
    query,
    setQuery,
  ] = useState<string>(
    EXAMPLES[0].query,
  )

  const matches =
    useMemo(
      () =>
        query.trim().length >=
        3
          ? rankProblemSolvers(
              query,
              calculators,
              3,
            )
          : [],
      [query],
    )

  const bestMatch =
    matches[0]

  return (
    <section
      id="problem-solver"
      className="homepage-problem-solver notebook-grid"
      aria-labelledby="homepage-problem-solver-title"
    >
      <div className="homepage-problem-solver-inner">
        <header className="homepage-problem-solver-header">
          <div>
            <p className="eyebrow">
              Equation-aware engineering
            </p>

            <h2 id="homepage-problem-solver-title">
              Solve an engineering problem
            </h2>

            <p>
              Enter a written problem, equation or symbolic
              variable set. ChemE Toolkit identifies the
              governing model, checks the inputs and solves
              supported cases locally.
            </p>
          </div>

          <div className="homepage-problem-solver-badge">
            <strong>
              32
            </strong>

            <span>
              Quick Solve models
            </span>
          </div>
        </header>

        <div className="homepage-problem-solver-layout">
          <div className="homepage-problem-solver-editor">
            <label htmlFor="homepage-problem-query">
              Describe your problem
            </label>

            <textarea
              id="homepage-problem-query"
              value={query}
              rows={7}
              spellCheck={false}
              onChange={(event) =>
                setQuery(
                  event.target.value,
                )
              }
            />

            <div className="homepage-problem-solver-examples">
              <span>
                Try an example:
              </span>

              <div>
                {EXAMPLES.map(
                  (example) => (
                    <button
                      key={
                        example.label
                      }
                      type="button"
                      onClick={() =>
                        setQuery(
                          example.query,
                        )
                      }
                    >
                      {example.label}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="homepage-problem-solver-privacy">
              <strong>
                Local engineering analysis
              </strong>

              <span>
                Your problem is processed inside this
                browser.
              </span>
            </div>
          </div>

          <div
            className="homepage-problem-solver-result"
            aria-live="polite"
          >
            {bestMatch ? (
              <>
                <header className="homepage-problem-result-header">
                  <div>
                    <span>
                      Best calculator match
                    </span>

                    <h3>
                      {bestMatch.title}
                    </h3>

                    <p>
                      {bestMatch.category}
                    </p>
                  </div>

                  <div
                    className="homepage-problem-readiness"
                    data-status={
                      bestMatch
                        .equationContext
                        .status
                    }
                  >
                    <strong>
                      {
                        bestMatch
                          .equationContext
                          .readinessPercent
                      }%
                    </strong>

                    <span>
                      {
                        statusLabel(
                          bestMatch
                            .equationContext
                            .status,
                        )
                      }
                    </span>
                  </div>
                </header>

                <div className="homepage-problem-equation">
                  <span>
                    Recognized model
                  </span>

                  <strong>
                    {
                      bestMatch
                        .equationIntent
                        .equationLabel ??
                      bestMatch
                        .equationHint ??
                      'Engineering calculator model'
                    }
                  </strong>

                  <code>
                    {
                      bestMatch
                        .equationIntent
                        .equation ??
                      bestMatch
                        .equationHint ??
                      'Model inferred from the written problem'
                    }
                  </code>
                </div>

                <div className="homepage-problem-result-grid">
                  <article>
                    <span>
                      Requested unknown
                    </span>

                    <strong>
                      {
                        bestMatch
                          .equationIntent
                          .targetName ??
                        'Not explicitly identified'
                      }
                    </strong>

                    <small>
                      {
                        bestMatch
                          .equationIntent
                          .targetSource
                          ? `Detected from ${bestMatch.equationIntent.targetSource}`
                          : 'Use “solve for” or add ?'
                      }
                    </small>
                  </article>

                  <article className="homepage-problem-quick-result">
                    <span>
                      Quick Solve
                    </span>

                    {bestMatch.quickSolution ? (
                      <>
                        <strong>
                          {
                            bestMatch
                              .quickSolution
                              .resultLabel
                          }
                          {' = '}
                          {
                            bestMatch
                              .quickSolution
                              .resultValue
                          }
                        </strong>

                        <small>
                          {
                            bestMatch
                              .quickSolution
                              .equation
                          }
                        </small>
                      </>
                    ) : (
                      <>
                        <strong>
                          Waiting for complete inputs
                        </strong>

                        <small>
                          Add the missing engineering
                          variables.
                        </small>
                      </>
                    )}
                  </article>
                </div>

                <div className="homepage-problem-input-section">
                  <span>
                    Parsed symbolic inputs
                  </span>

                  {bestMatch
                    .equationAssignments
                    .length > 0 ? (
                    <div className="homepage-problem-input-chips">
                      {
                        bestMatch
                          .equationAssignments
                          .slice(
                            0,
                            10,
                          )
                          .map(
                            (
                              assignment,
                              index,
                            ) => (
                              <span
                                key={
                                  assignment.symbol +
                                  index
                                }
                              >
                                <b>
                                  {
                                    assignment.symbol
                                  }
                                </b>
                                {' = '}
                                {
                                  assignment.value
                                }
                                {
                                  assignment.unit
                                    ? ` ${assignment.unit}`
                                    : ''
                                }
                              </span>
                            ),
                          )
                      }
                    </div>
                  ) : (
                    <p>
                      No symbolic assignments detected yet.
                    </p>
                  )}
                </div>

                <div className="homepage-problem-input-check">
                  <span>
                    Input check
                  </span>

                  <strong>
                    {
                      bestMatch
                        .equationContext
                        .missingVariableNames
                        .length > 0
                        ? `Missing: ${bestMatch.equationContext.missingVariableNames.join(', ')}`
                        : 'All equation inputs are available'
                    }
                  </strong>

                  <small>
                    {
                      bestMatch
                        .equationContext
                        .diagnostics[0] ??
                      'No contextual equation conflicts detected.'
                    }
                  </small>
                </div>

                {bestMatch
                  .solutionPlan
                  .length > 0 ? (
                  <div className="homepage-problem-solution-plan">
                    <span>
                      Solution blueprint
                    </span>

                    <ol>
                      {
                        bestMatch
                          .solutionPlan
                          .slice(
                            0,
                            4,
                          )
                          .map(
                            (
                              step,
                              index,
                            ) => (
                              <li
                                key={
                                  step +
                                  index
                                }
                              >
                                {step}
                              </li>
                            ),
                          )
                      }
                    </ol>
                  </div>
                ) : null}

                <footer className="homepage-problem-result-footer">
                  <div>
                    <strong>
                      {
                        bestMatch
                          .confidence
                      }
                      {' confidence'}
                    </strong>

                    <span>
                      {
                        bestMatch
                          .reasons
                          .slice(
                            0,
                            2,
                          )
                          .join(
                            ' · ',
                          )
                      }
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onOpenCalculator(
                        bestMatch
                          .calculatorId,
                      )
                    }
                  >
                    Open calculator →
                  </button>
                </footer>

                {matches.length > 1 ? (
                  <div className="homepage-problem-alternatives">
                    <span>
                      Other matches
                    </span>

                    <div>
                      {matches
                        .slice(
                          1,
                        )
                        .map(
                          (match) => (
                            <button
                              key={
                                match
                                  .calculatorId
                              }
                              type="button"
                              onClick={() =>
                                onOpenCalculator(
                                  match
                                    .calculatorId,
                                )
                              }
                            >
                              <strong>
                                {
                                  match.title
                                }
                              </strong>

                              <small>
                                {
                                  match.category
                                }
                              </small>
                            </button>
                          ),
                        )}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="homepage-problem-empty">
                <strong>
                  Start typing an engineering problem
                </strong>

                <p>
                  Add a calculator name, equation,
                  known values and the requested
                  unknown.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
