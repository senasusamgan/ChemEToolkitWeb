import {
  lazy,
  Suspense,
  useState,
  type ComponentProps,
} from 'react'

type ResultToolId =
  | 'missing'
  | 'convert'
  | 'trace'
  | 'assumptions'
  | 'validation'

type ResultTool =
  | ResultToolId
  | null

const loadAssumptionReviewPanel =
  () =>
    import(
      './AssumptionReviewPanel'
    )

const loadCalculationTracePanel =
  () =>
    import(
      './CalculationTracePanel'
    )

const loadEngineeringValidationGate =
  () =>
    import(
      './EngineeringValidationGate'
    )

const loadMissingInputAssistant =
  () =>
    import(
      './MissingInputAssistant'
    )

const loadResultUnitConverterPanel =
  () =>
    import(
      './ResultUnitConverterPanel'
    )

const AssumptionReviewPanel =
  lazy(
    async () => {
      const module =
        await loadAssumptionReviewPanel()

      return {
        default:
          module
            .AssumptionReviewPanel,
      }
    },
  )

const CalculationTracePanel =
  lazy(
    async () => {
      const module =
        await loadCalculationTracePanel()

      return {
        default:
          module
            .CalculationTracePanel,
      }
    },
  )

const EngineeringValidationGate =
  lazy(
    async () => {
      const module =
        await loadEngineeringValidationGate()

      return {
        default:
          module
            .EngineeringValidationGate,
      }
    },
  )

const MissingInputAssistant =
  lazy(
    async () => {
      const module =
        await loadMissingInputAssistant()

      return {
        default:
          module
            .MissingInputAssistant,
      }
    },
  )

const ResultUnitConverterPanel =
  lazy(
    async () => {
      const module =
        await loadResultUnitConverterPanel()

      return {
        default:
          module
            .ResultUnitConverterPanel,
      }
    },
  )

export const RESULT_TOOL_PREFETCHERS =
  'explicit-click-loading-v8' as const

type TraceProps =
  ComponentProps<
    typeof CalculationTracePanel
  >

type ValidationProps =
  ComponentProps<
    typeof EngineeringValidationGate
  >

type MissingInputProps =
  ComponentProps<
    typeof MissingInputAssistant
  >

interface SolverResultToolsProps {
  baseQuery: string
  calculatorTitle: string
  category: string
  equationLabel: string
  equation: string
  targetName:
    string | null
  contextTargetName:
    MissingInputProps[
      'targetName'
    ]
  readinessPercent: number
  status:
    ValidationProps[
      'status'
    ]
  missingVariables:
    ValidationProps[
      'missingVariables'
    ]
  diagnostics:
    ValidationProps[
      'diagnostics'
    ]
  assignments:
    TraceProps[
      'assignments'
    ]
  quickSolution:
    TraceProps[
      'quickSolution'
    ]
  onApplyProblem: (
    problem: string,
  ) => void
  onClose: () => void
}

function ResultToolLoading({
  label,
}: {
  label: string
}) {
  return (
    <div
      className="solver-tool-chunk-loading"
      role="status"
    >
      <span>
        Loading selected result tool…
      </span>

      <strong>
        {label}
      </strong>
    </div>
  )
}

export function SolverResultTools({
  baseQuery,
  calculatorTitle,
  category,
  equationLabel,
  equation,
  targetName,
  contextTargetName,
  readinessPercent,
  status,
  missingVariables,
  diagnostics,
  assignments,
  quickSolution,
  onApplyProblem,
  onClose,
}: SolverResultToolsProps) {
  const [
    activeTool,
    setActiveTool,
  ] = useState<
    ResultTool
  >(null)

  const options: Array<{
    id: ResultToolId
    label: string
    disabled: boolean
  }> = [
    {
      id:
        'missing',
      label:
        `Complete inputs (${missingVariables.length})`,
      disabled:
        missingVariables.length ===
        0,
    },
    {
      id:
        'convert',
      label:
        'Convert result',
      disabled:
        !quickSolution ||
        quickSolution.unit
          .trim()
          .length ===
          0,
    },
    {
      id:
        'trace',
      label:
        'Calculation trace',
      disabled:
        !quickSolution,
    },
    {
      id:
        'assumptions',
      label:
        'Assumption review',
      disabled:
        false,
    },
    {
      id:
        'validation',
      label:
        'Validation gate',
      disabled:
        false,
    },
  ]

  return (
    <section
      className="solver-result-tools"
      aria-labelledby="solver-result-tools-title"
    >
      <header className="solver-result-tools-header">
        <div>
          <span>
            On-demand result inspection
          </span>

          <h4 id="solver-result-tools-title">
            Result review tools
          </h4>

          <p>
            Each result review tool has an independent
            JavaScript chunk and remains unloaded until
            selected.
          </p>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
        >
          Close result tools
        </button>
      </header>

      <div
        className="solver-result-tool-tabs"
        role="tablist"
        aria-label="Result review tools"
      >
        {options.map(
          (option) => (
            <button
              key={
                option.id
              }
              type="button"
              role="tab"
              disabled={
                option.disabled
              }
              aria-selected={
                activeTool ===
                option.id
              }
              className={
                activeTool ===
                option.id
                  ? 'is-active'
                  : undefined
              }
              onClick={() =>
                setActiveTool(
                  option.id,
                )
              }
            >
              {option.label}
            </button>
          ),
        )}
      </div>

      {activeTool ===
      null ? (
        <div className="solver-result-tools-empty">
          <strong>
            Choose a result review tool
          </strong>

          <p>
            Result tools download only after explicit selection.
            Hover and keyboard navigation do not start background downloads.
          </p>
        </div>
      ) : null}

      {activeTool ===
        'missing' &&
      missingVariables.length >
        0 ? (
        <Suspense
          fallback={
            <ResultToolLoading label="Complete inputs" />
          }
        >
          <MissingInputAssistant
            key={
              missingVariables.join(
                '|',
              )
            }
            calculatorTitle={
              calculatorTitle
            }
            targetName={
              contextTargetName
            }
            baseQuery={
              baseQuery
            }
            missingVariables={
              missingVariables
            }
            onApplyProblem={(
              completedProblem,
            ) => {
              onApplyProblem(
                completedProblem,
              )
            }}
          />
        </Suspense>
      ) : null}

      {activeTool ===
        'convert' &&
      quickSolution ? (
        <Suspense
          fallback={
            <ResultToolLoading label="Result unit converter" />
          }
        >
          <ResultUnitConverterPanel
            key={[
              quickSolution
                .resultLabel,
              quickSolution
                .numericValue,
              quickSolution
                .unit,
            ].join('|')}
            calculatorTitle={
              calculatorTitle
            }
            resultLabel={
              quickSolution
                .resultLabel
            }
            numericValue={
              quickSolution
                .numericValue
            }
            sourceUnit={
              quickSolution.unit
            }
          />
        </Suspense>
      ) : null}

      {activeTool ===
        'trace' &&
      quickSolution ? (
        <Suspense
          fallback={
            <ResultToolLoading label="Calculation trace" />
          }
        >
          <CalculationTracePanel
            calculatorTitle={
              calculatorTitle
            }
            equationLabel={
              equationLabel
            }
            equation={
              equation
            }
            targetName={
              targetName
            }
            readinessPercent={
              readinessPercent
            }
            assignments={
              assignments
            }
            quickSolution={
              quickSolution
            }
          />
        </Suspense>
      ) : null}

      {activeTool ===
      'assumptions' ? (
        <Suspense
          fallback={
            <ResultToolLoading label="Assumption review" />
          }
        >
          <AssumptionReviewPanel
            baseQuery={
              baseQuery
            }
            calculatorTitle={
              calculatorTitle
            }
            equationLabel={
              equationLabel
            }
            equation={
              equation
            }
            targetName={
              targetName
            }
            assignments={
              assignments
            }
            quickSolution={
              quickSolution
            }
          />
        </Suspense>
      ) : null}

      {activeTool ===
      'validation' ? (
        <Suspense
          fallback={
            <ResultToolLoading label="Validation gate" />
          }
        >
          <EngineeringValidationGate
            calculatorTitle={
              calculatorTitle
            }
            category={
              category
            }
            targetName={
              targetName
            }
            readinessPercent={
              readinessPercent
            }
            status={
              status
            }
            missingVariables={
              missingVariables
            }
            diagnostics={
              diagnostics
            }
            assignments={
              assignments
            }
            quickSolution={
              quickSolution
            }
          />
        </Suspense>
      ) : null}
    </section>
  )
}
