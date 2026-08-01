import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  calculators,
} from '../data/calculators'
import {
  rankProblemSolvers,
} from '../features/problem-solver/problemSolverEngine'

import '../styles/uncertainty-analysis-panel.css'

interface UncertaintyAnalysisPanelProps {
  isOpen: boolean
  baseQuery: string
  onClose: () => void
  onApplyProblem: (
    problem: string,
  ) => void
}

interface NumericAssignment {
  symbol: string
  value: number
  unit: string
}

interface SimulationSample {
  index: number
  inputValue: number
  resultValue:
    number | null
  resultText: string
  resultLabel: string
  resultUnit: string
  problem: string
}

interface HistogramBin {
  lower: number
  upper: number
  count: number
}

interface StatisticalSummary {
  mean: number
  median: number
  standardDeviation: number
  p5: number
  p95: number
  minimum: number
  maximum: number
  coefficientOfVariation:
    number | null
}

interface SimulationAnalysis {
  samples:
    SimulationSample[]
  validSamples:
    Array<
      SimulationSample & {
        resultValue: number
      }
    >
  summary:
    StatisticalSummary | null
  histogram:
    HistogramBin[]
  nominalResult:
    number | null
  resultLabel: string
  resultUnit: string
  p5Sample:
    SimulationSample | null
  p95Sample:
    SimulationSample | null
}

type DistributionType =
  | 'normal'
  | 'uniform'

const NUMBER_PATTERN =
  '-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?'

function formatEngineeringNumber(
  value: number,
): string {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return '—'
  }

  const absoluteValue =
    Math.abs(
      value,
    )

  if (
    absoluteValue !==
      0 &&
    (
      absoluteValue >=
        1e6 ||
      absoluteValue <
        1e-4
    )
  ) {
    return value
      .toExponential(
        4,
      )
  }

  return Number(
    value.toPrecision(
      7,
    ),
  ).toLocaleString(
    undefined,
    {
      maximumFractionDigits:
        8,
    },
  )
}

function formatInputValue(
  value: number,
): string {
  return Number(
    value.toPrecision(
      12,
    ),
  ).toString()
}

function parseNumericAssignments(
  query: string,
): NumericAssignment[] {
  const assignments:
    NumericAssignment[] = []

  const seenSymbols =
    new Set<string>()

  for (
    const rawSegment
    of query.split(
      /[;\n]+/,
    )
  ) {
    const segment =
      rawSegment.trim()

    const match =
      segment.match(
        new RegExp(
          `^([A-Za-zΑ-Ωα-ωΔρμνταβγ][A-Za-z0-9_Α-Ωα-ωΔρμνταβγ]*)\\s*=\\s*(${NUMBER_PATTERN})\\s*(.*)$`,
          'i',
        ),
      )

    if (!match) {
      continue
    }

    const symbol =
      match[1]

    const value =
      Number(
        match[2],
      )

    if (
      !Number.isFinite(
        value,
      ) ||
      seenSymbols.has(
        symbol,
      )
    ) {
      continue
    }

    assignments.push({
      symbol,
      value,
      unit:
        match[3]
          .trim()
          .replace(
            /\s+/g,
            ' ',
          ),
    })

    seenSymbols.add(
      symbol,
    )
  }

  return assignments
}

function escapeRegExp(
  value: string,
): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  )
}

function replaceNumericAssignment(
  query: string,
  symbol: string,
  nextValue: number,
): string {
  const escapedSymbol =
    escapeRegExp(
      symbol,
    )

  const pattern =
    new RegExp(
      `^(\\s*)${escapedSymbol}(\\s*=\\s*)${NUMBER_PATTERN}`,
      'i',
    )

  return query
    .split(
      /([;\n]+)/,
    )
    .map(
      (segment) => {
        if (
          !pattern.test(
            segment,
          )
        ) {
          return segment
        }

        return segment.replace(
          pattern,
          `$1${symbol}$2${formatInputValue(nextValue)}`,
        )
      },
    )
    .join('')
}

function createSeededRandom(
  initialSeed: number,
): () => number {
  let state =
    (
      Math.trunc(
        initialSeed,
      ) >>>
      0
    ) ||
    1

  return () => {
    state =
      (
        Math.imul(
          state,
          1664525,
        ) +
        1013904223
      ) >>>
      0

    return state /
      4294967296
  }
}

function createNormalRandom(
  random: () => number,
): () => number {
  let storedValue:
    number | null =
      null

  return () => {
    if (
      storedValue !==
      null
    ) {
      const value =
        storedValue

      storedValue =
        null

      return value
    }

    const first =
      Math.max(
        random(),
        Number.EPSILON,
      )

    const second =
      random()

    const magnitude =
      Math.sqrt(
        -2 *
          Math.log(
            first,
          ),
      )

    const angle =
      2 *
      Math.PI *
      second

    storedValue =
      magnitude *
      Math.sin(
        angle,
      )

    return magnitude *
      Math.cos(
        angle,
      )
  }
}

function percentile(
  sortedValues: number[],
  probability: number,
): number {
  if (
    sortedValues.length ===
    0
  ) {
    return Number.NaN
  }

  if (
    sortedValues.length ===
    1
  ) {
    return sortedValues[0]
  }

  const position =
    (
      sortedValues.length -
      1
    ) *
    probability

  const lowerIndex =
    Math.floor(
      position,
    )

  const upperIndex =
    Math.ceil(
      position,
    )

  const fraction =
    position -
    lowerIndex

  const lowerValue =
    sortedValues[
      lowerIndex
    ]

  const upperValue =
    sortedValues[
      upperIndex
    ]

  return lowerValue +
    (
      upperValue -
      lowerValue
    ) *
    fraction
}

function nearestSample(
  samples:
    Array<
      SimulationSample & {
        resultValue: number
      }
    >,
  targetResult: number,
): SimulationSample | null {
  if (
    samples.length ===
    0
  ) {
    return null
  }

  return samples.reduce(
    (
      nearest,
      sample,
    ) =>
      Math.abs(
        sample.resultValue -
          targetResult,
      ) <
      Math.abs(
        nearest.resultValue -
          targetResult,
      )
        ? sample
        : nearest,
  )
}

function createHistogram(
  values: number[],
  binCount: number,
): HistogramBin[] {
  if (
    values.length ===
    0
  ) {
    return []
  }

  const minimum =
    Math.min(
      ...values,
    )

  const maximum =
    Math.max(
      ...values,
    )

  if (
    minimum ===
    maximum
  ) {
    return [
      {
        lower:
          minimum,
        upper:
          maximum,
        count:
          values.length,
      },
    ]
  }

  const width =
    (
      maximum -
      minimum
    ) /
    binCount

  const bins =
    Array.from(
      {
        length:
          binCount,
      },
      (
        _,
        index,
      ): HistogramBin => ({
        lower:
          minimum +
          index *
            width,
        upper:
          minimum +
          (
            index +
            1
          ) *
            width,
        count:
          0,
      }),
    )

  for (
    const value
    of values
  ) {
    const rawIndex =
      Math.floor(
        (
          value -
          minimum
        ) /
          width,
      )

    const safeIndex =
      Math.min(
        binCount -
          1,
        Math.max(
          0,
          rawIndex,
        ),
      )

    bins[
      safeIndex
    ].count +=
      1
  }

  return bins
}

function csvCell(
  value: string,
): string {
  return `"${value.replace(
    /"/g,
    '""',
  )}"`
}

export function UncertaintyAnalysisPanel({
  isOpen,
  baseQuery,
  onClose,
  onApplyProblem,
}: UncertaintyAnalysisPanelProps) {
  const assignments =
    useMemo(
      () =>
        parseNumericAssignments(
          baseQuery,
        ),
      [
        baseQuery,
      ],
    )

  const [
    selectedSymbol,
    setSelectedSymbol,
  ] = useState(
    assignments[0]
      ?.symbol ??
      '',
  )

  const [
    uncertaintyPercent,
    setUncertaintyPercent,
  ] = useState('5')

  const [
    distribution,
    setDistribution,
  ] = useState<
    DistributionType
  >('normal')

  const [
    sampleCount,
    setSampleCount,
  ] = useState(250)

  const [
    seed,
    setSeed,
  ] = useState('2026')

  const [
    feedbackMessage,
    setFeedbackMessage,
  ] = useState('')

  useEffect(
    () => {
      if (
        assignments.length ===
        0
      ) {
        setSelectedSymbol(
          '',
        )
        return
      }

      const symbolExists =
        assignments.some(
          (assignment) =>
            assignment.symbol ===
            selectedSymbol,
        )

      if (
        !symbolExists
      ) {
        setSelectedSymbol(
          assignments[0]
            .symbol,
        )
      }
    },
    [
      assignments,
      selectedSymbol,
    ],
  )

  const selectedAssignment =
    assignments.find(
      (assignment) =>
        assignment.symbol ===
        selectedSymbol,
    )

  const analysis:
    SimulationAnalysis | null =
      useMemo(
        () => {
          if (
            !isOpen ||
            !selectedAssignment
          ) {
            return null
          }

          const parsedUncertainty =
            Number(
              uncertaintyPercent,
            )

          const parsedSeed =
            Number(
              seed,
            )

          if (
            !Number.isFinite(
              parsedUncertainty,
            ) ||
            parsedUncertainty <=
              0 ||
            !Number.isFinite(
              parsedSeed,
            )
          ) {
            return null
          }

          const safeUncertainty =
            Math.min(
              100,
              parsedUncertainty,
            ) /
            100

          const safeSampleCount =
            Math.max(
              100,
              Math.min(
                500,
                Math.round(
                  sampleCount,
                ),
              ),
            )

          const random =
            createSeededRandom(
              parsedSeed,
            )

          const normalRandom =
            createNormalRandom(
              random,
            )

          const samples:
            SimulationSample[] = []

          for (
            let index =
              0;
            index <
            safeSampleCount;
            index +=
              1
          ) {
            const variation =
              distribution ===
              'normal'
                ? normalRandom() *
                  safeUncertainty
                : (
                    random() *
                      2 -
                    1
                  ) *
                  safeUncertainty

            const inputValue =
              selectedAssignment
                .value *
              (
                1 +
                variation
              )

            const problem =
              replaceNumericAssignment(
                baseQuery,
                selectedAssignment
                  .symbol,
                inputValue,
              )

            const match =
              rankProblemSolvers(
                problem,
                calculators,
                1,
              )[0]

            const quickSolution =
              match
                ?.quickSolution

            const numericResult =
              quickSolution
                ?.numericValue

            const validResult =
              typeof numericResult ===
                'number' &&
              Number.isFinite(
                numericResult,
              )

            samples.push({
              index:
                index +
                1,
              inputValue,
              resultValue:
                validResult
                  ? numericResult
                  : null,
              resultText:
                quickSolution
                  ?.resultValue ??
                'Not solved',
              resultLabel:
                quickSolution
                  ?.resultLabel ??
                'Result',
              resultUnit:
                quickSolution
                  ?.unit ??
                '',
              problem,
            })
          }

          const validSamples =
            samples.filter(
              (
                sample,
              ): sample is
                SimulationSample & {
                  resultValue: number
                } =>
                sample.resultValue !==
                null,
            )

          const nominalMatch =
            rankProblemSolvers(
              baseQuery,
              calculators,
              1,
            )[0]

          const nominalValue =
            nominalMatch
              ?.quickSolution
              ?.numericValue

          const nominalResult =
            typeof nominalValue ===
              'number' &&
            Number.isFinite(
              nominalValue,
            )
              ? nominalValue
              : null

          if (
            validSamples.length ===
            0
          ) {
            return {
              samples,
              validSamples,
              summary:
                null,
              histogram:
                [],
              nominalResult,
              resultLabel:
                'Result',
              resultUnit:
                '',
              p5Sample:
                null,
              p95Sample:
                null,
            }
          }

          const sortedValues =
            validSamples
              .map(
                (sample) =>
                  sample.resultValue,
              )
              .sort(
                (
                  first,
                  second,
                ) =>
                  first -
                  second,
              )

          const mean =
            sortedValues.reduce(
              (
                total,
                value,
              ) =>
                total +
                value,
              0,
            ) /
            sortedValues.length

          const variance =
            sortedValues.reduce(
              (
                total,
                value,
              ) =>
                total +
                (
                  value -
                  mean
                ) **
                  2,
              0,
            ) /
            Math.max(
              1,
              sortedValues.length -
                1,
            )

          const standardDeviation =
            Math.sqrt(
              variance,
            )

          const p5 =
            percentile(
              sortedValues,
              0.05,
            )

          const p95 =
            percentile(
              sortedValues,
              0.95,
            )

          const summary:
            StatisticalSummary = {
              mean,
              median:
                percentile(
                  sortedValues,
                  0.5,
                ),
              standardDeviation,
              p5,
              p95,
              minimum:
                sortedValues[0],
              maximum:
                sortedValues[
                  sortedValues.length -
                    1
                ],
              coefficientOfVariation:
                mean ===
                0
                  ? null
                  : Math.abs(
                      standardDeviation /
                        mean,
                    ) *
                    100,
            }

          return {
            samples,
            validSamples,
            summary,
            histogram:
              createHistogram(
                sortedValues,
                12,
              ),
            nominalResult,
            resultLabel:
              validSamples[0]
                .resultLabel,
            resultUnit:
              validSamples[0]
                .resultUnit,
            p5Sample:
              nearestSample(
                validSamples,
                p5,
              ),
            p95Sample:
              nearestSample(
                validSamples,
                p95,
              ),
          }
        },
        [
          baseQuery,
          distribution,
          isOpen,
          sampleCount,
          seed,
          selectedAssignment,
          uncertaintyPercent,
        ],
      )

  if (!isOpen) {
    return null
  }

  const summary =
    analysis
      ?.summary

  const maximumBinCount =
    Math.max(
      1,
      ...(
        analysis
          ?.histogram
          .map(
            (bin) =>
              bin.count,
          ) ??
        []
      ),
    )

  const successRate =
    analysis &&
    analysis.samples.length >
      0
      ? (
          analysis
            .validSamples
            .length /
          analysis
            .samples
            .length
        ) *
        100
      : 0

  const intervalWidth =
    summary &&
    summary.mean !==
      0
      ? Math.abs(
          (
            summary.p95 -
            summary.p5
          ) /
            summary.mean,
        ) *
        100
      : null

  const stabilityLabel =
    intervalWidth ===
    null
      ? 'Not available'
      : intervalWidth <
          10
        ? 'Low output sensitivity'
        : intervalWidth <
            30
          ? 'Moderate output sensitivity'
          : 'High output sensitivity'

  function exportSimulationCsv() {
    if (
      !analysis ||
      analysis.samples.length ===
        0
    ) {
      setFeedbackMessage(
        'No simulation data is available.',
      )
      return
    }

    const rows = [
      [
        'Sample',
        'Variable',
        'Input value',
        'Input unit',
        'Result label',
        'Result value',
        'Result unit',
        'Generated problem',
      ],
      ...analysis.samples.map(
        (sample) => [
          String(
            sample.index,
          ),
          selectedSymbol,
          formatInputValue(
            sample.inputValue,
          ),
          selectedAssignment
            ?.unit ??
            '',
          sample.resultLabel,
          sample.resultText,
          sample.resultUnit,
          sample.problem,
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
      `cheme-toolkit-${selectedSymbol || 'input'}-uncertainty.csv`
        .replace(
          /[^a-z0-9._-]/gi,
          '-',
        )

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
      'Monte Carlo samples exported as CSV.',
    )
  }

  function applySimulationSample(
    sample:
      SimulationSample | null,
    label: string,
  ) {
    if (!sample) {
      return
    }

    onApplyProblem(
      sample.problem,
    )

    setFeedbackMessage(
      `${label} loaded into the main solver.`,
    )

    onClose()
  }

  return (
    <section
      className="uncertainty-analysis-panel"
      aria-labelledby="uncertainty-analysis-title"
    >
      <header className="uncertainty-analysis-header">
        <div>
          <span>
            Probabilistic engineering analysis
          </span>

          <h3 id="uncertainty-analysis-title">
            Monte Carlo uncertainty
          </h3>

          <p>
            Perturb one measured input and observe the
            resulting output distribution.
          </p>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
        >
          Close analysis
        </button>
      </header>

      {assignments.length >
      0 ? (
        <>
          <div className="uncertainty-analysis-controls">
            <label>
              <span>
                Uncertain variable
              </span>

              <select
                value={
                  selectedSymbol
                }
                onChange={(event) => {
                  setSelectedSymbol(
                    event.target.value,
                  )

                  setFeedbackMessage(
                    '',
                  )
                }}
              >
                {assignments.map(
                  (assignment) => (
                    <option
                      key={
                        assignment.symbol
                      }
                      value={
                        assignment.symbol
                      }
                    >
                      {
                        assignment.symbol
                      }
                      {' = '}
                      {
                        formatEngineeringNumber(
                          assignment.value,
                        )
                      }
                      {
                        assignment.unit
                          ? ` ${assignment.unit}`
                          : ''
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              <span>
                Relative uncertainty
              </span>

              <div className="uncertainty-percent-input">
                <input
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.1"
                  value={
                    uncertaintyPercent
                  }
                  onChange={(event) =>
                    setUncertaintyPercent(
                      event.target.value,
                    )
                  }
                />

                <span>
                  %
                </span>
              </div>
            </label>

            <label>
              <span>
                Distribution
              </span>

              <select
                value={
                  distribution
                }
                onChange={(event) =>
                  setDistribution(
                    event.target.value as
                      DistributionType,
                  )
                }
              >
                <option value="normal">
                  Normal
                </option>

                <option value="uniform">
                  Uniform
                </option>
              </select>
            </label>

            <label>
              <span>
                Samples
              </span>

              <select
                value={
                  sampleCount
                }
                onChange={(event) =>
                  setSampleCount(
                    Number(
                      event.target.value,
                    ),
                  )
                }
              >
                <option value="100">
                  100
                </option>

                <option value="250">
                  250
                </option>

                <option value="500">
                  500
                </option>
              </select>
            </label>

            <label>
              <span>
                Random seed
              </span>

              <input
                type="number"
                step="1"
                value={
                  seed
                }
                onChange={(event) =>
                  setSeed(
                    event.target.value,
                  )
                }
              />
            </label>
          </div>

          <div className="uncertainty-analysis-summary">
            <article>
              <span>
                Nominal result
              </span>

              <strong>
                {
                  analysis
                    ?.nominalResult !==
                  null &&
                  analysis
                    ?.nominalResult !==
                  undefined
                    ? `${formatEngineeringNumber(analysis.nominalResult)} ${analysis.resultUnit}`.trim()
                    : 'Not available'
                }
              </strong>
            </article>

            <article>
              <span>
                Simulated mean
              </span>

              <strong>
                {
                  summary
                    ? `${formatEngineeringNumber(summary.mean)} ${analysis?.resultUnit ?? ''}`.trim()
                    : 'Not available'
                }
              </strong>
            </article>

            <article>
              <span>
                Standard deviation
              </span>

              <strong>
                {
                  summary
                    ? `${formatEngineeringNumber(summary.standardDeviation)} ${analysis?.resultUnit ?? ''}`.trim()
                    : 'Not available'
                }
              </strong>
            </article>

            <article>
              <span>
                90% interval
              </span>

              <strong>
                {
                  summary
                    ? `${formatEngineeringNumber(summary.p5)} – ${formatEngineeringNumber(summary.p95)} ${analysis?.resultUnit ?? ''}`.trim()
                    : 'Not available'
                }
              </strong>
            </article>

            <article>
              <span>
                Coefficient of variation
              </span>

              <strong>
                {
                  summary
                    ?.coefficientOfVariation ===
                  null ||
                  summary
                    ?.coefficientOfVariation ===
                  undefined
                    ? 'Not available'
                    : `${formatEngineeringNumber(summary.coefficientOfVariation)}%`
                }
              </strong>
            </article>

            <article>
              <span>
                Successful samples
              </span>

              <strong>
                {
                  formatEngineeringNumber(
                    successRate,
                  )
                }%
              </strong>
            </article>
          </div>

          <div className="uncertainty-analysis-interpretation">
            <div>
              <span>
                Uncertainty interpretation
              </span>

              <h4>
                {stabilityLabel}
              </h4>
            </div>

            <p>
              {
                intervalWidth ===
                null
                  ? 'Complete a Quick Solve-compatible problem to estimate output uncertainty.'
                  : `The P5–P95 interval spans approximately ${formatEngineeringNumber(intervalWidth)}% of the simulated mean.`
              }
            </p>
          </div>

          <div className="uncertainty-histogram-section">
            <header>
              <div>
                <span>
                  Output distribution
                </span>

                <h4>
                  {
                    analysis
                      ?.resultLabel ??
                    'Calculated result'
                  }
                </h4>
              </div>

              <span>
                {
                  distribution ===
                  'normal'
                    ? 'Normal input uncertainty'
                    : 'Uniform input uncertainty'
                }
              </span>
            </header>

            {analysis &&
            analysis.histogram.length >
              0 ? (
              <div className="uncertainty-histogram">
                <svg
                  viewBox="0 0 720 280"
                  role="img"
                  aria-label="Monte Carlo output histogram"
                >
                  <line
                    x1="45"
                    y1="240"
                    x2="695"
                    y2="240"
                    className="uncertainty-axis"
                  />

                  {analysis.histogram.map(
                    (
                      bin,
                      index,
                    ) => {
                      const availableWidth =
                        630

                      const barGap =
                        4

                      const barWidth =
                        availableWidth /
                          analysis
                            .histogram
                            .length -
                        barGap

                      const x =
                        50 +
                        index *
                          (
                            barWidth +
                            barGap
                          )

                      const height =
                        (
                          bin.count /
                          maximumBinCount
                        ) *
                        190

                      const y =
                        240 -
                        height

                      return (
                        <g
                          key={
                            `${bin.lower}-${bin.upper}`
                          }
                        >
                          <rect
                            x={
                              x
                            }
                            y={
                              y
                            }
                            width={
                              Math.max(
                                1,
                                barWidth,
                              )
                            }
                            height={
                              height
                            }
                            rx="3"
                            className="uncertainty-bar"
                          />

                          <title>
                            {
                              formatEngineeringNumber(
                                bin.lower,
                              )
                            }
                            {' – '}
                            {
                              formatEngineeringNumber(
                                bin.upper,
                              )
                            }
                            {': '}
                            {bin.count}
                            {' samples'}
                          </title>

                          {(
                            index ===
                              0 ||
                            index ===
                              analysis
                                .histogram
                                .length -
                                1
                          ) ? (
                            <text
                              x={
                                x
                              }
                              y="260"
                              textAnchor={
                                index ===
                                0
                                  ? 'start'
                                  : 'end'
                              }
                            >
                              {
                                formatEngineeringNumber(
                                  index ===
                                  0
                                    ? bin.lower
                                    : bin.upper,
                                )
                              }
                            </text>
                          ) : null}
                        </g>
                      )
                    },
                  )}
                </svg>
              </div>
            ) : (
              <div className="uncertainty-analysis-empty">
                <strong>
                  No numerical distribution available
                </strong>

                <p>
                  The current problem must produce a
                  numeric Quick Solve result.
                </p>
              </div>
            )}
          </div>

          <div className="uncertainty-percentile-grid">
            <article>
              <span>
                Minimum
              </span>

              <strong>
                {
                  summary
                    ? formatEngineeringNumber(
                        summary.minimum,
                      )
                    : '—'
                }
              </strong>
            </article>

            <article>
              <span>
                P5
              </span>

              <strong>
                {
                  summary
                    ? formatEngineeringNumber(
                        summary.p5,
                      )
                    : '—'
                }
              </strong>
            </article>

            <article>
              <span>
                Median
              </span>

              <strong>
                {
                  summary
                    ? formatEngineeringNumber(
                        summary.median,
                      )
                    : '—'
                }
              </strong>
            </article>

            <article>
              <span>
                P95
              </span>

              <strong>
                {
                  summary
                    ? formatEngineeringNumber(
                        summary.p95,
                      )
                    : '—'
                }
              </strong>
            </article>

            <article>
              <span>
                Maximum
              </span>

              <strong>
                {
                  summary
                    ? formatEngineeringNumber(
                        summary.maximum,
                      )
                    : '—'
                }
              </strong>
            </article>
          </div>

          {feedbackMessage ? (
            <p
              className="uncertainty-analysis-feedback"
              role="status"
            >
              {feedbackMessage}
            </p>
          ) : null}

          <footer className="uncertainty-analysis-actions">
            <div>
              <button
                type="button"
                onClick={
                  exportSimulationCsv
                }
              >
                Export samples CSV
              </button>

              <button
                type="button"
                disabled={
                  !analysis
                    ?.p5Sample
                }
                onClick={() =>
                  applySimulationSample(
                    analysis
                      ?.p5Sample ??
                      null,
                    'P5 operating case',
                  )
                }
              >
                Use P5 case
              </button>

              <button
                type="button"
                disabled={
                  !analysis
                    ?.p95Sample
                }
                onClick={() =>
                  applySimulationSample(
                    analysis
                      ?.p95Sample ??
                      null,
                    'P95 operating case',
                  )
                }
              >
                Use P95 case
              </button>
            </div>

            <span>
              The same seed reproduces the same simulation.
            </span>
          </footer>
        </>
      ) : (
        <div className="uncertainty-analysis-empty">
          <strong>
            No numerical inputs detected
          </strong>

          <p>
            Add assignments such as P=101325 Pa,
            T=300 K or v=2 m/s before opening this tool.
          </p>
        </div>
      )}
    </section>
  )
}
