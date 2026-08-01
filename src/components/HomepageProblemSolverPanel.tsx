import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { calculators } from '../data/calculators'
import {
  rankProblemSolvers,
} from '../features/problem-solver/problemSolverEngine'
import {
  GuidedProblemBuilder,
} from './GuidedProblemBuilder'
import {
  SensitivitySweepPanel,
} from './SensitivitySweepPanel'
import {
  EngineeringValidationGate,
} from './EngineeringValidationGate'
import {
  MissingInputAssistant,
} from './MissingInputAssistant'
import {
  UncertaintyAnalysisPanel,
} from './UncertaintyAnalysisPanel'
import {
  UnitHarmonizerPanel,
} from './UnitHarmonizerPanel'
import {
  BatchProblemSolverPanel,
} from './BatchProblemSolverPanel'
import {
  DesignEnvelopePanel,
} from './DesignEnvelopePanel'
import {
  TargetOperatingPointPanel,
} from './TargetOperatingPointPanel'

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

interface SavedSolverCase {
  id: string
  query: string
  calculatorId: string
  title: string
  category: string
  result: string
  readinessPercent: number
  savedAt: string
}

const SAVED_SOLVER_CASES_KEY =
  'cheme-toolkit.homepage-problem-solver.saved-cases.v1'

function isSavedSolverCase(
  value: unknown,
): value is SavedSolverCase {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return false
  }

  const candidate =
    value as
      Partial<SavedSolverCase>

  return (
    typeof candidate.id ===
      'string' &&
    typeof candidate.query ===
      'string' &&
    typeof candidate.calculatorId ===
      'string' &&
    typeof candidate.title ===
      'string' &&
    typeof candidate.category ===
      'string' &&
    typeof candidate.result ===
      'string' &&
    typeof candidate.readinessPercent ===
      'number' &&
    typeof candidate.savedAt ===
      'string'
  )
}

function readSavedSolverCases():
  SavedSolverCase[] {
  if (
    typeof window ===
    'undefined'
  ) {
    return []
  }

  try {
    const stored =
      window.localStorage.getItem(
        SAVED_SOLVER_CASES_KEY,
      )

    if (!stored) {
      return []
    }

    const parsed:
      unknown =
        JSON.parse(
          stored,
        )

    if (
      !Array.isArray(
        parsed,
      )
    ) {
      return []
    }

    return parsed
      .filter(
        isSavedSolverCase,
      )
      .slice(
        0,
        6,
      )
  } catch {
    return []
  }
}

function formatSavedDate(
  savedAt: string,
): string {
  const date =
    new Date(
      savedAt,
    )

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Saved previously'
  }

  return date.toLocaleString()
}

const SHARED_PROBLEM_QUERY_PARAM =
  'problem'

const SOLVER_DRAFT_KEY =
  'cheme-toolkit.homepage-problem-solver.draft.v1'

function readSharedProblem():
  string | null {
  if (
    typeof window ===
    'undefined'
  ) {
    return null
  }

  try {
    const parameters =
      new URLSearchParams(
        window.location.search,
      )

    const sharedProblem =
      parameters.get(
        SHARED_PROBLEM_QUERY_PARAM,
      )

    if (
      !sharedProblem ||
      sharedProblem.trim().length ===
        0
    ) {
      return null
    }

    return sharedProblem
      .trim()
      .slice(
        0,
        5000,
      )
  } catch {
    return null
  }
}

function readInitialProblem():
  string {
  const sharedProblem =
    readSharedProblem()

  if (
    sharedProblem
  ) {
    return sharedProblem
  }

  if (
    typeof window !==
    'undefined'
  ) {
    try {
      const draft =
        window.localStorage.getItem(
          SOLVER_DRAFT_KEY,
        )

      if (
        draft &&
        draft.trim().length >
          0
      ) {
        return draft
          .trim()
          .slice(
            0,
            5000,
          )
      }
    } catch {
      // Storage can be unavailable.
    }
  }

  return EXAMPLES[0].query
}

function hasSharedProblem():
  boolean {
  return Boolean(
    readSharedProblem(),
  )
}

function buildProblemShareUrl(
  problem: string,
): string {
  const url =
    new URL(
      window.location.href,
    )

  url.searchParams.delete(
    'release',
  )

  url.searchParams.set(
    SHARED_PROBLEM_QUERY_PARAM,
    problem,
  )

  url.hash =
    'problem-solver'

  return url.toString()
}

function formatComparisonValue(
  value: number,
): string {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return '—'
  }

  return Number(
    value.toPrecision(
      6,
    ),
  ).toLocaleString()
}

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
    readInitialProblem,
  )

  const [
    sharedProblemLoaded,
    setSharedProblemLoaded,
  ] = useState(
    hasSharedProblem,
  )

  const [
    actionMessage,
    setActionMessage,
  ] = useState('')

  const [
    isGuidedBuilderOpen,
    setIsGuidedBuilderOpen,
  ] = useState(false)

  const [
    isSensitivitySweepOpen,
    setIsSensitivitySweepOpen,
  ] = useState(false)

  const [
    isUncertaintyAnalysisOpen,
    setIsUncertaintyAnalysisOpen,
  ] = useState(false)

  const [
    isUnitHarmonizerOpen,
    setIsUnitHarmonizerOpen,
  ] = useState(false)

  const [
    isComparisonOpen,
    setIsComparisonOpen,
  ] = useState(false)

  const [
    comparisonQuery,
    setComparisonQuery,
  ] = useState<string>('')

  const [
    savedCases,
    setSavedCases,
  ] = useState<
    SavedSolverCase[]
  >(
    readSavedSolverCases,
  )

  useEffect(
    () => {
      try {
        window.localStorage.setItem(
          SAVED_SOLVER_CASES_KEY,
          JSON.stringify(
            savedCases,
          ),
        )
      } catch {
        // Storage can be unavailable in private browsing.
      }
    },
    [
      savedCases,
    ],
  )

  useEffect(
    () => {
      try {
        if (
          query.trim().length >
          0
        ) {
          window.localStorage.setItem(
            SOLVER_DRAFT_KEY,
            query,
          )
        } else {
          window.localStorage.removeItem(
            SOLVER_DRAFT_KEY,
          )
        }
      } catch {
        // Storage can be unavailable.
      }
    },
    [
      query,
    ],
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

  const comparisonMatches =
    useMemo(
      () =>
        comparisonQuery
          .trim()
          .length >=
        3
          ? rankProblemSolvers(
              comparisonQuery,
              calculators,
              1,
            )
          : [],
      [
        comparisonQuery,
      ],
    )

  const comparisonBestMatch =
    comparisonMatches[0]

  const scenarioDifference =
    useMemo(
      () => {
        const firstValue =
          bestMatch
            ?.quickSolution
            ?.numericValue

        const secondValue =
          comparisonBestMatch
            ?.quickSolution
            ?.numericValue

        const firstUnit =
          bestMatch
            ?.quickSolution
            ?.unit

        const secondUnit =
          comparisonBestMatch
            ?.quickSolution
            ?.unit

        if (
          typeof firstValue !==
            'number' ||
          typeof secondValue !==
            'number' ||
          !Number.isFinite(
            firstValue,
          ) ||
          !Number.isFinite(
            secondValue,
          ) ||
          !firstUnit ||
          firstUnit !==
            secondUnit
        ) {
          return null
        }

        const absoluteDifference =
          secondValue -
          firstValue

        const percentageDifference =
          firstValue ===
          0
            ? null
            : (
                absoluteDifference /
                Math.abs(
                  firstValue,
                )
              ) *
              100

        return {
          absoluteDifference,
          percentageDifference,
          unit:
            firstUnit,
        }
      },
      [
        bestMatch,
        comparisonBestMatch,
      ],
    )

  function openScenarioComparison() {
    const startingQuery =
      query.trim().length >
      0
        ? query
        : EXAMPLES[0].query

    setComparisonQuery(
      startingQuery,
    )

    setIsComparisonOpen(
      true,
    )

    setActionMessage(
      'Scenario comparison opened.',
    )

    window.setTimeout(
      () => {
        document
          .getElementById(
            'homepage-comparison-query',
          )
          ?.focus()
      },
      0,
    )
  }

  function closeScenarioComparison() {
    setIsComparisonOpen(
      false,
    )

    setActionMessage(
      'Scenario comparison closed.',
    )
  }

  function useComparisonAsMain() {
    if (
      comparisonQuery
        .trim()
        .length ===
      0
    ) {
      return
    }

    setQuery(
      comparisonQuery,
    )

    setIsComparisonOpen(
      false,
    )

    setSharedProblemLoaded(
      false,
    )

    setActionMessage(
      'Scenario B loaded as the main problem.',
    )
  }

  function buildSolverReport(): string {
    if (!bestMatch) {
      return [
        'ChemE Toolkit Engineering Solution Report',
        '',
        'Problem',
        query || 'No problem entered.',
        '',
        'No calculator match is currently available.',
      ].join('\n')
    }

    const assignmentLines =
      bestMatch
        .equationAssignments
        .map(
          (assignment) =>
            assignment.symbol +
            ' = ' +
            assignment.value +
            (
              assignment.unit
                ? ' ' +
                  assignment.unit
                : ''
            ) +
            ' — ' +
            assignment.canonicalName,
        )
        .join('\n')

    const solutionLines =
      bestMatch
        .solutionPlan
        .map(
          (step, index) =>
            String(index + 1) +
            '. ' +
            step,
        )
        .join('\n')

    const assumptionLines =
      bestMatch
        .assumptions
        .map(
          (assumption) =>
            '- ' +
            assumption,
        )
        .join('\n')

    const verificationLines =
      bestMatch
        .verificationChecklist
        .map(
          (check) =>
            '- ' +
            check,
        )
        .join('\n')

    const missingInputs =
      bestMatch
        .equationContext
        .missingVariableNames
        .length > 0
        ? bestMatch
            .equationContext
            .missingVariableNames
            .join(', ')
        : 'None'

    const quickResult =
      bestMatch.quickSolution
        ? bestMatch
            .quickSolution
            .resultLabel +
          ' = ' +
          bestMatch
            .quickSolution
            .resultValue
        : 'Quick Solve result is not available.'

    return [
      'ChemE Toolkit Engineering Solution Report',
      '',
      'PROBLEM',
      query,
      '',
      'CALCULATOR',
      bestMatch.title +
        ' — ' +
        bestMatch.category,
      '',
      'RECOGNIZED MODEL',
      bestMatch
        .equationIntent
        .equationLabel ??
        bestMatch
          .equationHint ??
        'Engineering calculator model',
      bestMatch
        .equationIntent
        .equation ??
        bestMatch
          .equationHint ??
        '',
      '',
      'REQUESTED UNKNOWN',
      bestMatch
        .equationIntent
        .targetName ??
        'Not explicitly identified',
      '',
      'READINESS',
      String(
        bestMatch
          .equationContext
          .readinessPercent,
      ) +
        '% — ' +
        statusLabel(
          bestMatch
            .equationContext
            .status,
        ),
      '',
      'PARSED INPUTS',
      assignmentLines ||
        'No symbolic assignments detected.',
      '',
      'MISSING INPUTS',
      missingInputs,
      '',
      'QUICK SOLVE',
      quickResult,
      '',
      'SOLUTION BLUEPRINT',
      solutionLines ||
        'No solution blueprint available.',
      '',
      'ENGINEERING ASSUMPTIONS',
      assumptionLines ||
        'Review the calculator documentation.',
      '',
      'VERIFICATION CHECKLIST',
      verificationLines ||
        'Verify units and physical plausibility.',
      '',
      'ENGINEERING SUMMARY',
      bestMatch
        .engineeringReport
        .summary,
      '',
      'Generated locally by ChemE Toolkit.',
    ].join('\n')
  }

  async function copySolverReport() {
    const report =
      buildSolverReport()

    try {
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
            report,
          )
      } else {
        const textArea =
          document.createElement(
            'textarea',
          )

        textArea.value =
          report

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

      setActionMessage(
        'Engineering report copied.',
      )
    } catch {
      setActionMessage(
        'Copy failed. Use Download .txt instead.',
      )
    }
  }

  function downloadSolverReport() {
    if (!bestMatch) {
      return
    }

    const report =
      buildSolverReport()

    const blob =
      new Blob(
        [
          report,
        ],
        {
          type:
            'text/plain;charset=utf-8',
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

    const fileName =
      (
        'cheme-toolkit-' +
        bestMatch.calculatorId +
        '-solution.txt'
      ).replace(
        /[^a-z0-9._-]/gi,
        '-',
      )

    link.href =
      objectUrl

    link.download =
      fileName

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

    setActionMessage(
      'Engineering report downloaded.',
    )
  }

  async function copyShareLink(
    shareUrl: string,
  ) {
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
          shareUrl,
        )

      return
    }

    const textArea =
      document.createElement(
        'textarea',
      )

    textArea.value =
      shareUrl

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

  async function shareCurrentProblem() {
    const cleanProblem =
      query.trim()

    if (
      cleanProblem.length ===
      0
    ) {
      setActionMessage(
        'Enter a problem before sharing.',
      )
      return
    }

    const shareUrl =
      buildProblemShareUrl(
        cleanProblem,
      )

    if (
      shareUrl.length >
      8000
    ) {
      setActionMessage(
        'This problem is too long for a share link. Download the report instead.',
      )
      return
    }

    try {
      if (
        typeof navigator.share ===
        'function'
      ) {
        await navigator.share({
          title:
            'ChemE Toolkit Engineering Problem',
          text:
            bestMatch
              ? bestMatch.title +
                ' engineering problem'
              : 'ChemE Toolkit engineering problem',
          url:
            shareUrl,
        })

        setActionMessage(
          'Problem shared.',
        )
        return
      }

      await copyShareLink(
        shareUrl,
      )

      setActionMessage(
        'Share link copied.',
      )
    } catch (
      error
    ) {
      if (
        error instanceof
          DOMException &&
        error.name ===
          'AbortError'
      ) {
        return
      }

      try {
        await copyShareLink(
          shareUrl,
        )

        setActionMessage(
          'Share link copied.',
        )
      } catch {
        setActionMessage(
          'Sharing failed. Download the report instead.',
        )
      }
    }
  }

  function clearProblem() {
    setQuery('')
    setSharedProblemLoaded(
      false,
    )

    try {
      window.localStorage.removeItem(
        SOLVER_DRAFT_KEY,
      )

      const url =
        new URL(
          window.location.href,
        )

      url.searchParams.delete(
        SHARED_PROBLEM_QUERY_PARAM,
      )

      window.history.replaceState(
        null,
        '',
        url.toString(),
      )
    } catch {
      // URL or storage updates can be unavailable.
    }

    setActionMessage(
      'Problem cleared.',
    )
  }

  function saveCurrentSolution() {
    if (
      !bestMatch ||
      query.trim().length ===
        0
    ) {
      setActionMessage(
        'Enter a problem before saving.',
      )
      return
    }

    const quickResult =
      bestMatch.quickSolution
        ? bestMatch
            .quickSolution
            .resultLabel +
          ' = ' +
          bestMatch
            .quickSolution
            .resultValue
        : 'Awaiting complete inputs'

    const savedCase:
      SavedSolverCase = {
        id:
          String(
            Date.now(),
          ) +
          '-' +
          bestMatch.calculatorId,
        query:
          query.trim(),
        calculatorId:
          bestMatch.calculatorId,
        title:
          bestMatch.title,
        category:
          bestMatch.category,
        result:
          quickResult,
        readinessPercent:
          bestMatch
            .equationContext
            .readinessPercent,
        savedAt:
          new Date()
            .toISOString(),
      }

    setSavedCases(
      (currentCases) => [
        savedCase,
        ...currentCases.filter(
          (currentCase) =>
            currentCase.query !==
            savedCase.query,
        ),
      ].slice(
        0,
        6,
      ),
    )

    setActionMessage(
      'Solution saved to Recent solutions.',
    )
  }

  function loadSavedCase(
    savedCase:
      SavedSolverCase,
  ) {
    setQuery(
      savedCase.query,
    )

    setActionMessage(
      'Saved problem loaded.',
    )

    window.requestAnimationFrame(
      () => {
        document
          .getElementById(
            'homepage-problem-query',
          )
          ?.focus()
      },
    )
  }

  function removeSavedCase(
    savedCaseId: string,
  ) {
    setSavedCases(
      (currentCases) =>
        currentCases.filter(
          (savedCase) =>
            savedCase.id !==
            savedCaseId,
        ),
    )

    setActionMessage(
      'Saved problem removed.',
    )
  }

  function clearSavedCases() {
    setSavedCases(
      [],
    )

    setActionMessage(
      'Saved solutions cleared.',
    )
  }

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

        <TargetOperatingPointPanel
          baseQuery={
            query
          }
          onApplyProblem={(
            selectedProblem,
          ) => {
            setQuery(
              selectedProblem,
            )

            setSharedProblemLoaded(
              false,
            )

            setActionMessage(
              'Target operating point loaded.',
            )

            window.requestAnimationFrame(
              () => {
                document
                  .getElementById(
                    'homepage-problem-query',
                  )
                  ?.focus()
              },
            )
          }}
        />

        <DesignEnvelopePanel
          baseQuery={
            query
          }
          onApplyProblem={(
            selectedProblem,
          ) => {
            setQuery(
              selectedProblem,
            )

            setSharedProblemLoaded(
              false,
            )

            setActionMessage(
              'Design-envelope operating point loaded.',
            )

            window.requestAnimationFrame(
              () => {
                document
                  .getElementById(
                    'homepage-problem-query',
                  )
                  ?.focus()
              },
            )
          }}
        />

        <BatchProblemSolverPanel
          onLoadCase={(
            selectedProblem,
          ) => {
            setQuery(
              selectedProblem,
            )

            setSharedProblemLoaded(
              false,
            )

            setActionMessage(
              'Batch engineering case loaded.',
            )

            window.requestAnimationFrame(
              () => {
                document
                  .getElementById(
                    'homepage-problem-query',
                  )
                  ?.focus()
              },
            )
          }}
        />

        <UnitHarmonizerPanel
          isOpen={
            isUnitHarmonizerOpen
          }
          baseQuery={
            query
          }
          onClose={() =>
            setIsUnitHarmonizerOpen(
              false,
            )
          }
          onApplyProblem={(
            normalizedProblem,
          ) => {
            setQuery(
              normalizedProblem,
            )

            setSharedProblemLoaded(
              false,
            )

            setActionMessage(
              'SI-normalized problem loaded.',
            )
          }}
        />

        <UncertaintyAnalysisPanel
          isOpen={
            isUncertaintyAnalysisOpen
          }
          baseQuery={
            query
          }
          onClose={() =>
            setIsUncertaintyAnalysisOpen(
              false,
            )
          }
          onApplyProblem={(
            generatedProblem,
          ) => {
            setQuery(
              generatedProblem,
            )

            setSharedProblemLoaded(
              false,
            )

            setActionMessage(
              'Uncertainty operating case loaded.',
            )
          }}
        />

        <SensitivitySweepPanel
          isOpen={
            isSensitivitySweepOpen
          }
          baseQuery={
            query
          }
          onClose={() =>
            setIsSensitivitySweepOpen(
              false,
            )
          }
          onUseProblem={(
            generatedProblem,
          ) => {
            setQuery(
              generatedProblem,
            )

            setSharedProblemLoaded(
              false,
            )

            setActionMessage(
              'Sensitivity operating point loaded.',
            )
          }}
        />

        <GuidedProblemBuilder
          isOpen={
            isGuidedBuilderOpen
          }
          onClose={() =>
            setIsGuidedBuilderOpen(
              false,
            )
          }
          onUseProblem={(
            generatedProblem,
          ) => {
            setQuery(
              generatedProblem,
            )

            setSharedProblemLoaded(
              false,
            )

            setActionMessage(
              'Guided engineering problem loaded.',
            )
          }}
        />

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
              onChange={(event) => {
                setQuery(
                  event.target.value,
                )

                setSharedProblemLoaded(
                  false,
                )

                setActionMessage(
                  '',
                )
              }}
            />

            {sharedProblemLoaded ? (
              <div
                className="homepage-problem-share-notice"
                role="status"
              >
                <strong>
                  Shared problem loaded
                </strong>

                <span>
                  The equation and variables were restored
                  from a ChemE Toolkit link.
                </span>
              </div>
            ) : null}

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

            <div className="homepage-problem-editor-actions">
              <div>
                <button
                  type="button"
                  className="is-compare"
                  disabled={
                    query.trim().length ===
                    0
                  }
                  onClick={() => {
                    setIsUnitHarmonizerOpen(
                      true,
                    )

                    setIsUncertaintyAnalysisOpen(
                      false,
                    )

                    setIsSensitivitySweepOpen(
                      false,
                    )

                    setIsGuidedBuilderOpen(
                      false,
                    )

                    setIsComparisonOpen(
                      false,
                    )
                  }}
                >
                  Unit harmonizer
                </button>

                <button
                  type="button"
                  className="is-compare"
                  disabled={
                    query.trim().length ===
                    0
                  }
                  onClick={() => {
                    setIsUncertaintyAnalysisOpen(
                      true,
                    )

                    setIsUnitHarmonizerOpen(
                      false,
                    )

                    setIsSensitivitySweepOpen(
                      false,
                    )

                    setIsGuidedBuilderOpen(
                      false,
                    )

                    setIsComparisonOpen(
                      false,
                    )
                  }}
                >
                  Uncertainty analysis
                </button>

                <button
                  type="button"
                  className="is-compare"
                  disabled={
                    query.trim().length ===
                    0
                  }
                  onClick={() => {
                    setIsSensitivitySweepOpen(
                      true,
                    )

                    setIsUnitHarmonizerOpen(
                      false,
                    )

                    setIsUncertaintyAnalysisOpen(
                      false,
                    )

                    setIsGuidedBuilderOpen(
                      false,
                    )
                  }}
                >
                  Sensitivity sweep
                </button>

                <button
                  type="button"
                  className="is-compare"
                  onClick={() => {
                    setIsGuidedBuilderOpen(
                      true,
                    )

                    setIsUnitHarmonizerOpen(
                      false,
                    )

                    setIsSensitivitySweepOpen(
                      false,
                    )

                    setIsUncertaintyAnalysisOpen(
                      false,
                    )
                  }}
                >
                  Guided input
                </button>

                <button
                  type="button"
                  className="is-compare"
                  disabled={
                    query.trim().length ===
                    0
                  }
                  onClick={() => {
                    setIsUnitHarmonizerOpen(
                      false,
                    )

                    setIsUncertaintyAnalysisOpen(
                      false,
                    )

                    setIsSensitivitySweepOpen(
                      false,
                    )

                    setIsGuidedBuilderOpen(
                      false,
                    )

                    openScenarioComparison()
                  }}
                >
                  Compare scenarios
                </button>

                <button
                  type="button"
                  onClick={
                    clearProblem
                  }
                >
                  Clear problem
                </button>
              </div>

              <span>
                Compare operating conditions or start a
                new engineering case.
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

                <MissingInputAssistant
                  key={
                    bestMatch
                      .equationContext
                      .missingVariableNames
                      .join('|')
                  }
                  calculatorTitle={
                    bestMatch.title
                  }
                  targetName={
                    bestMatch
                      .equationContext
                      .targetName
                  }
                  baseQuery={
                    query
                  }
                  missingVariables={
                    bestMatch
                      .equationContext
                      .missingVariableNames
                  }
                  onApplyProblem={(
                    completedProblem,
                  ) => {
                    setQuery(
                      completedProblem,
                    )

                    setSharedProblemLoaded(
                      false,
                    )

                    setActionMessage(
                      'Missing inputs added and problem recalculated.',
                    )
                  }}
                />

                <EngineeringValidationGate
                  calculatorTitle={
                    bestMatch.title
                  }
                  category={
                    bestMatch.category
                  }
                  targetName={
                    bestMatch
                      .equationIntent
                      .targetName ??
                    null
                  }
                  readinessPercent={
                    bestMatch
                      .equationContext
                      .readinessPercent
                  }
                  status={
                    bestMatch
                      .equationContext
                      .status
                  }
                  missingVariables={
                    bestMatch
                      .equationContext
                      .missingVariableNames
                  }
                  diagnostics={
                    bestMatch
                      .equationContext
                      .diagnostics
                  }
                  assignments={
                    bestMatch
                      .equationAssignments
                  }
                  quickSolution={
                    bestMatch
                      .quickSolution ??
                    null
                  }
                />

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

                  <div className="homepage-problem-result-actions">
                    <button
                      type="button"
                      className="is-secondary"
                      onClick={
                        shareCurrentProblem
                      }
                    >
                      Share case
                    </button>

                    <button
                      type="button"
                      className="is-secondary"
                      onClick={
                        saveCurrentSolution
                      }
                    >
                      Save solution
                    </button>

                    <button
                      type="button"
                      className="is-secondary"
                      onClick={
                        copySolverReport
                      }
                    >
                      Copy report
                    </button>

                    <button
                      type="button"
                      className="is-secondary"
                      onClick={
                        downloadSolverReport
                      }
                    >
                      Download .txt
                    </button>

                    <button
                      type="button"
                      className="is-primary"
                      onClick={() =>
                        onOpenCalculator(
                          bestMatch
                            .calculatorId,
                        )
                      }
                    >
                      Open calculator →
                    </button>
                  </div>
                </footer>

                {actionMessage ? (
                  <p
                    className="homepage-problem-action-feedback"
                    role="status"
                  >
                    {actionMessage}
                  </p>
                ) : null}

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

        {isComparisonOpen ? (
          <section
            className="homepage-problem-comparison"
            aria-labelledby="homepage-problem-comparison-title"
          >
            <header className="homepage-problem-comparison-header">
              <div>
                <span>
                  Engineering sensitivity study
                </span>

                <h3 id="homepage-problem-comparison-title">
                  Compare scenarios
                </h3>

                <p>
                  Change the variables in Scenario B and
                  compare the calculated result with the
                  current problem.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeScenarioComparison
                }
              >
                Close comparison
              </button>
            </header>

            <div className="homepage-problem-comparison-grid">
              <article className="homepage-problem-scenario-card">
                <header>
                  <span>
                    Scenario A
                  </span>

                  <strong>
                    Current problem
                  </strong>
                </header>

                <div className="homepage-problem-scenario-query">
                  {query}
                </div>

                {bestMatch ? (
                  <div className="homepage-problem-scenario-summary">
                    <div>
                      <span>
                        Calculator
                      </span>

                      <strong>
                        {bestMatch.title}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Readiness
                      </span>

                      <strong>
                        {
                          bestMatch
                            .equationContext
                            .readinessPercent
                        }%
                      </strong>
                    </div>

                    <div>
                      <span>
                        Result
                      </span>

                      <strong>
                        {
                          bestMatch
                            .quickSolution
                            ? bestMatch
                                .quickSolution
                                .resultLabel +
                              ' = ' +
                              bestMatch
                                .quickSolution
                                .resultValue
                            : 'Waiting for inputs'
                        }
                      </strong>
                    </div>
                  </div>
                ) : (
                  <p className="homepage-problem-scenario-empty">
                    No Scenario A match available.
                  </p>
                )}
              </article>

              <article className="homepage-problem-scenario-card is-editable">
                <header>
                  <span>
                    Scenario B
                  </span>

                  <strong>
                    Alternative conditions
                  </strong>
                </header>

                <label htmlFor="homepage-comparison-query">
                  Edit variables or operating conditions
                </label>

                <textarea
                  id="homepage-comparison-query"
                  value={
                    comparisonQuery
                  }
                  rows={6}
                  spellCheck={false}
                  onChange={(event) =>
                    setComparisonQuery(
                      event.target.value,
                    )
                  }
                />

                {comparisonBestMatch ? (
                  <div className="homepage-problem-scenario-summary">
                    <div>
                      <span>
                        Calculator
                      </span>

                      <strong>
                        {
                          comparisonBestMatch
                            .title
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Readiness
                      </span>

                      <strong>
                        {
                          comparisonBestMatch
                            .equationContext
                            .readinessPercent
                        }%
                      </strong>
                    </div>

                    <div>
                      <span>
                        Result
                      </span>

                      <strong>
                        {
                          comparisonBestMatch
                            .quickSolution
                            ? comparisonBestMatch
                                .quickSolution
                                .resultLabel +
                              ' = ' +
                              comparisonBestMatch
                                .quickSolution
                                .resultValue
                            : 'Waiting for inputs'
                        }
                      </strong>
                    </div>
                  </div>
                ) : (
                  <p className="homepage-problem-scenario-empty">
                    Enter a complete Scenario B problem.
                  </p>
                )}

                <button
                  type="button"
                  className="homepage-problem-use-scenario"
                  disabled={
                    comparisonQuery
                      .trim()
                      .length ===
                    0
                  }
                  onClick={
                    useComparisonAsMain
                  }
                >
                  Use Scenario B as main
                </button>
              </article>
            </div>

            <div className="homepage-problem-comparison-result">
              <div>
                <span>
                  Result comparison
                </span>

                <h4>
                  Scenario B versus Scenario A
                </h4>
              </div>

              {scenarioDifference ? (
                <div className="homepage-problem-comparison-metrics">
                  <article>
                    <span>
                      Absolute change
                    </span>

                    <strong>
                      {
                        scenarioDifference
                          .absoluteDifference >
                        0
                          ? '+'
                          : ''
                      }
                      {
                        formatComparisonValue(
                          scenarioDifference
                            .absoluteDifference,
                        )
                      }
                      {' '}
                      {
                        scenarioDifference
                          .unit
                      }
                    </strong>
                  </article>

                  <article>
                    <span>
                      Percentage change
                    </span>

                    <strong>
                      {
                        scenarioDifference
                          .percentageDifference ===
                        null
                          ? 'Not available'
                          : (
                              scenarioDifference
                                .percentageDifference >
                              0
                                ? '+'
                                : ''
                            ) +
                            formatComparisonValue(
                              scenarioDifference
                                .percentageDifference,
                            ) +
                            '%'
                      }
                    </strong>
                  </article>

                  <article>
                    <span>
                      Direction
                    </span>

                    <strong>
                      {
                        scenarioDifference
                          .absoluteDifference >
                        0
                          ? 'Scenario B is higher'
                          : scenarioDifference
                                .absoluteDifference <
                              0
                            ? 'Scenario B is lower'
                            : 'No calculated change'
                      }
                    </strong>
                  </article>
                </div>
              ) : (
                <p>
                  Complete both scenarios with Quick Solve
                  results using the same output unit to
                  calculate the difference.
                </p>
              )}
            </div>
          </section>
        ) : null}

        <section
          className="homepage-problem-history"
          aria-labelledby="homepage-problem-history-title"
        >
          <header className="homepage-problem-history-header">
            <div>
              <span>
                Saved engineering cases
              </span>

              <h3 id="homepage-problem-history-title">
                Recent solutions
              </h3>

              <p>
                Keep up to six engineering problems in
                this browser and reopen them without
                entering the variables again.
              </p>
            </div>

            <button
              type="button"
              disabled={
                savedCases.length ===
                0
              }
              onClick={
                clearSavedCases
              }
            >
              Clear saved
            </button>
          </header>

          {savedCases.length > 0 ? (
            <div className="homepage-problem-history-grid">
              {savedCases.map(
                (savedCase) => (
                  <article
                    key={
                      savedCase.id
                    }
                  >
                    <div className="homepage-problem-history-meta">
                      <span>
                        {
                          savedCase.category
                        }
                      </span>

                      <time
                        dateTime={
                          savedCase.savedAt
                        }
                      >
                        {
                          formatSavedDate(
                            savedCase.savedAt,
                          )
                        }
                      </time>
                    </div>

                    <h4>
                      {
                        savedCase.title
                      }
                    </h4>

                    <p>
                      {
                        savedCase.query
                      }
                    </p>

                    <div className="homepage-problem-history-result">
                      <strong>
                        {
                          savedCase.result
                        }
                      </strong>

                      <span>
                        {
                          savedCase
                            .readinessPercent
                        }
                        % ready
                      </span>
                    </div>

                    <div className="homepage-problem-history-actions">
                      <button
                        type="button"
                        className="is-primary"
                        onClick={() =>
                          loadSavedCase(
                            savedCase,
                          )
                        }
                      >
                        Load case
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onOpenCalculator(
                            savedCase
                              .calculatorId,
                          )
                        }
                      >
                        Open calculator
                      </button>

                      <button
                        type="button"
                        className="is-danger"
                        aria-label={
                          'Remove ' +
                          savedCase.title
                        }
                        onClick={() =>
                          removeSavedCase(
                            savedCase.id,
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ),
              )}
            </div>
          ) : (
            <div className="homepage-problem-history-empty">
              <strong>
                No saved solutions yet
              </strong>

              <p>
                Solve a problem and press
                “Save solution” to keep it here.
              </p>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}
