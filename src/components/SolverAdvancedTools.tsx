import {
  lazy,
  Suspense,
  useState,
} from 'react'

type AdvancedToolId =
  | 'guided'
  | 'unit'
  | 'sensitivity'
  | 'uncertainty'
  | 'target'
  | 'design'
  | 'batch'

type AdvancedTool =
  | AdvancedToolId
  | null

interface SolverAdvancedToolsProps {
  baseQuery: string
  onApplyProblem: (
    problem: string,
    message: string,
  ) => void
  onClose: () => void
}

interface ToolOption {
  id: AdvancedToolId
  label: string
  description: string
}

const loadGuidedProblemBuilder =
  () =>
    import(
      './GuidedProblemBuilder'
    )

const loadUnitHarmonizerPanel =
  () =>
    import(
      './UnitHarmonizerPanel'
    )

const loadSensitivitySweepPanel =
  () =>
    import(
      './SensitivitySweepPanel'
    )

const loadUncertaintyAnalysisPanel =
  () =>
    import(
      './UncertaintyAnalysisPanel'
    )

const loadTargetOperatingPointPanel =
  () =>
    import(
      './TargetOperatingPointPanel'
    )

const loadDesignEnvelopePanel =
  () =>
    import(
      './DesignEnvelopePanel'
    )

const loadBatchProblemSolverPanel =
  () =>
    import(
      './BatchProblemSolverPanel'
    )

const GuidedProblemBuilder =
  lazy(
    async () => {
      const module =
        await loadGuidedProblemBuilder()

      return {
        default:
          module
            .GuidedProblemBuilder,
      }
    },
  )

const UnitHarmonizerPanel =
  lazy(
    async () => {
      const module =
        await loadUnitHarmonizerPanel()

      return {
        default:
          module
            .UnitHarmonizerPanel,
      }
    },
  )

const SensitivitySweepPanel =
  lazy(
    async () => {
      const module =
        await loadSensitivitySweepPanel()

      return {
        default:
          module
            .SensitivitySweepPanel,
      }
    },
  )

const UncertaintyAnalysisPanel =
  lazy(
    async () => {
      const module =
        await loadUncertaintyAnalysisPanel()

      return {
        default:
          module
            .UncertaintyAnalysisPanel,
      }
    },
  )

const TargetOperatingPointPanel =
  lazy(
    async () => {
      const module =
        await loadTargetOperatingPointPanel()

      return {
        default:
          module
            .TargetOperatingPointPanel,
      }
    },
  )

const DesignEnvelopePanel =
  lazy(
    async () => {
      const module =
        await loadDesignEnvelopePanel()

      return {
        default:
          module
            .DesignEnvelopePanel,
      }
    },
  )

const BatchProblemSolverPanel =
  lazy(
    async () => {
      const module =
        await loadBatchProblemSolverPanel()

      return {
        default:
          module
            .BatchProblemSolverPanel,
      }
    },
  )

const TOOL_PREFETCHERS:
  Record<
    AdvancedToolId,
    () =>
      Promise<unknown>
  > = {
    guided:
      loadGuidedProblemBuilder,
    unit:
      loadUnitHarmonizerPanel,
    sensitivity:
      loadSensitivitySweepPanel,
    uncertainty:
      loadUncertaintyAnalysisPanel,
    target:
      loadTargetOperatingPointPanel,
    design:
      loadDesignEnvelopePanel,
    batch:
      loadBatchProblemSolverPanel,
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

const TOOL_OPTIONS:
  ToolOption[] = [
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

function ToolChunkLoading({
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
        Loading selected engineering tool…
      </span>

      <strong>
        {label}
      </strong>
    </div>
  )
}

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

  function prefetchTool(
    toolId:
      AdvancedToolId,
  ) {
    void TOOL_PREFETCHERS[
      toolId
    ]()
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
            Each engineering tool loads in its own
            JavaScript chunk. Only the selected analysis
            is downloaded and mounted.
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
              onPointerEnter={() =>
                prefetchTool(
                  tool.id,
                )
              }
              onFocus={() =>
                prefetchTool(
                  tool.id,
                )
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
            Hovering or focusing a tool prepares only
            that tool’s chunk. Other analyses remain
            unloaded.
          </p>
        </div>
      ) : null}

      {activeTool ===
      'guided' ? (
        <Suspense
          fallback={
            <ToolChunkLoading label="Guided input" />
          }
        >
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
        </Suspense>
      ) : null}

      {activeTool ===
      'unit' ? (
        <Suspense
          fallback={
            <ToolChunkLoading label="Unit harmonizer" />
          }
        >
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
        </Suspense>
      ) : null}

      {activeTool ===
      'sensitivity' ? (
        <Suspense
          fallback={
            <ToolChunkLoading label="Sensitivity sweep" />
          }
        >
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
        </Suspense>
      ) : null}

      {activeTool ===
      'uncertainty' ? (
        <Suspense
          fallback={
            <ToolChunkLoading label="Uncertainty analysis" />
          }
        >
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
        </Suspense>
      ) : null}

      {activeTool ===
      'target' ? (
        <Suspense
          fallback={
            <ToolChunkLoading label="Target finder" />
          }
        >
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
        </Suspense>
      ) : null}

      {activeTool ===
      'design' ? (
        <Suspense
          fallback={
            <ToolChunkLoading label="Design envelope" />
          }
        >
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
        </Suspense>
      ) : null}

      {activeTool ===
      'batch' ? (
        <Suspense
          fallback={
            <ToolChunkLoading label="Batch solver" />
          }
        >
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
        </Suspense>
      ) : null}
    </section>
  )
}
