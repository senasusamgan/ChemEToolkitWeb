import {
  useState,
} from 'react'

import {
  AssumptionReviewPanel,
} from './AssumptionReviewPanel'
import {
  CalculationTracePanel,
} from './CalculationTracePanel'
import {
  EngineeringValidationGate,
} from './EngineeringValidationGate'
import {
  MissingInputAssistant,
} from './MissingInputAssistant'
import {
  ResultUnitConverterPanel,
} from './ResultUnitConverterPanel'

type TraceProps =
  Parameters<
    typeof CalculationTracePanel
  >[0]

type ValidationProps =
  Parameters<
    typeof EngineeringValidationGate
  >[0]

type MissingInputProps =
  Parameters<
    typeof MissingInputAssistant
  >[0]

type ResultTool =
  | 'missing'
  | 'convert'
  | 'trace'
  | 'assumptions'
  | 'validation'

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
  >(
    missingVariables.length >
    0
      ? 'missing'
      : quickSolution
        ? 'convert'
        : 'validation',
  )

  const options: Array<{
    id: ResultTool
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
            Only one detailed result tool is rendered at
            a time.
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
        'missing' &&
      missingVariables.length >
        0 ? (
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
      ) : null}

      {activeTool ===
        'convert' &&
      quickSolution ? (
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
      ) : null}

      {activeTool ===
        'trace' &&
      quickSolution ? (
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
      ) : null}

      {activeTool ===
      'assumptions' ? (
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
      ) : null}

      {activeTool ===
      'validation' ? (
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
      ) : null}
    </section>
  )
}
