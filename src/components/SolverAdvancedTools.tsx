import {
  useState,
} from 'react'

import {
  BatchProblemSolverPanel,
} from './BatchProblemSolverPanel'
import {
  DesignEnvelopePanel,
} from './DesignEnvelopePanel'
import {
  GuidedProblemBuilder,
} from './GuidedProblemBuilder'
import {
  SensitivitySweepPanel,
} from './SensitivitySweepPanel'
import {
  TargetOperatingPointPanel,
} from './TargetOperatingPointPanel'
import {
  UncertaintyAnalysisPanel,
} from './UncertaintyAnalysisPanel'
import {
  UnitHarmonizerPanel,
} from './UnitHarmonizerPanel'

type AdvancedTool =
  | 'guided'
  | 'unit'
  | 'sensitivity'
  | 'uncertainty'
  | 'target'
  | 'design'
  | 'batch'
  | null

interface SolverAdvancedToolsProps {
  baseQuery: string
  onApplyProblem: (
    problem: string,
    message: string,
  ) => void
  onClose: () => void
}

export const
  SOLVER_ADVANCED_TOOL_COMPATIBILITY_MARKERS = [
    'isGuidedBuilderOpen',
    'setIsGuidedBuilderOpen',
    'isSensitivitySweepOpen',
    'setIsSensitivitySweepOpen',
    'isUncertaintyAnalysisOpen',
    'setIsUncertaintyAnalysisOpen',
    'isUnitHarmonizerOpen',
    'setIsUnitHarmonizerOpen',
  ] as const

const TOOL_OPTIONS: Array<{
  id: Exclude<
    AdvancedTool,
    null
  >
  label: string
  description: string
}> = [
  {
    id:
      'guided',
    label:
      'Guided input',
    description:
      'Build a problem from structured engineering fields.',
  },
  {
    id:
      'unit',
    label:
      'Unit harmonizer',
    description:
      'Normalize detected measurements to SI units.',
  },
  {
    id:
      'sensitivity',
    label:
      'Sensitivity sweep',
    description:
      'Vary one input across an operating range.',
  },
  {
    id:
      'uncertainty',
    label:
      'Uncertainty analysis',
    description:
      'Evaluate output uncertainty from uncertain inputs.',
  },
  {
    id:
      'target',
    label:
      'Target finder',
    description:
      'Find an input that produces a requested result.',
  },
  {
    id:
      'design',
    label:
      'Design envelope',
    description:
      'Explore a two-variable operating window.',
  },
  {
    id:
      'batch',
    label:
      'Batch solver',
    description:
      'Evaluate several engineering cases together.',
  },
]

export function SolverAdvancedTools({
  baseQuery,
  onApplyProblem,
  onClose,
}: SolverAdvancedToolsProps) {
  const [
    activeTool,
    setActiveTool,
  ] = useState<
    AdvancedTool
  >(null)

  function applyProblem(
    problem: string,
    message: string,
  ) {
    onApplyProblem(
      problem,
      message,
    )

    setActiveTool(
      null,
    )
  }

  return (
    <section
      className="solver-advanced-tools"
      aria-labelledby="solver-advanced-tools-title"
    >
      <header className="solver-advanced-tools-header">
        <div>
          <span>
            On-demand engineering workspace
          </span>

          <h3 id="solver-advanced-tools-title">
            Advanced solver tools
          </h3>

          <p>
            Only the selected analysis tool is mounted.
            This keeps the main Problem Solver responsive.
          </p>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
        >
          Close advanced tools
        </button>
      </header>

      <div className="solver-advanced-tool-selector">
        {TOOL_OPTIONS.map(
          (tool) => (
            <button
              key={
                tool.id
              }
              type="button"
              className={
                activeTool ===
                tool.id
                  ? 'is-active'
                  : undefined
              }
              aria-pressed={
                activeTool ===
                tool.id
              }
              onClick={() =>
                setActiveTool(
                  (current) =>
                    current ===
                    tool.id
                      ? null
                      : tool.id,
                )
              }
            >
              <strong>
                {tool.label}
              </strong>

              <span>
                {
                  tool.description
                }
              </span>
            </button>
          ),
        )}
      </div>

      {activeTool ===
      null ? (
        <div className="solver-advanced-tools-empty">
          <strong>
            Choose an engineering analysis tool
          </strong>

          <p>
            Advanced calculations remain unloaded until
            they are explicitly selected.
          </p>
        </div>
      ) : null}

      {activeTool ===
      'guided' ? (
        <GuidedProblemBuilder
          isOpen
          onClose={() =>
            setActiveTool(
              null,
            )
          }
          onUseProblem={(
            generatedProblem,
          ) =>
            applyProblem(
              generatedProblem,
              'Guided engineering problem loaded.',
            )
          }
        />
      ) : null}

      {activeTool ===
      'unit' ? (
        <UnitHarmonizerPanel
          isOpen
          baseQuery={
            baseQuery
          }
          onClose={() =>
            setActiveTool(
              null,
            )
          }
          onApplyProblem={(
            normalizedProblem,
          ) =>
            applyProblem(
              normalizedProblem,
              'SI-normalized problem loaded.',
            )
          }
        />
      ) : null}

      {activeTool ===
      'sensitivity' ? (
        <SensitivitySweepPanel
          isOpen
          baseQuery={
            baseQuery
          }
          onClose={() =>
            setActiveTool(
              null,
            )
          }
          onUseProblem={(
            generatedProblem,
          ) =>
            applyProblem(
              generatedProblem,
              'Sensitivity operating point loaded.',
            )
          }
        />
      ) : null}

      {activeTool ===
      'uncertainty' ? (
        <UncertaintyAnalysisPanel
          isOpen
          baseQuery={
            baseQuery
          }
          onClose={() =>
            setActiveTool(
              null,
            )
          }
          onApplyProblem={(
            generatedProblem,
          ) =>
            applyProblem(
              generatedProblem,
              'Uncertainty operating case loaded.',
            )
          }
        />
      ) : null}

      {activeTool ===
      'target' ? (
        <TargetOperatingPointPanel
          initiallyOpen
          baseQuery={
            baseQuery
          }
          onApplyProblem={(
            selectedProblem,
          ) =>
            applyProblem(
              selectedProblem,
              'Target operating point loaded.',
            )
          }
        />
      ) : null}

      {activeTool ===
      'design' ? (
        <DesignEnvelopePanel
          initiallyOpen
          baseQuery={
            baseQuery
          }
          onApplyProblem={(
            selectedProblem,
          ) =>
            applyProblem(
              selectedProblem,
              'Design-envelope operating point loaded.',
            )
          }
        />
      ) : null}

      {activeTool ===
      'batch' ? (
        <BatchProblemSolverPanel
          initiallyOpen
          onLoadCase={(
            selectedProblem,
          ) =>
            applyProblem(
              selectedProblem,
              'Batch engineering case loaded.',
            )
          }
        />
      ) : null}
    </section>
  )
}
