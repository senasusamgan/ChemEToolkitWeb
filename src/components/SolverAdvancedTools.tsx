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
  | 'robustness'
  | 'calibration'
  | 'doe'
  | 'surface'
  | 'scaleup'
  | 'mixing'
  | 'pump'
  | 'target'
  | 'design'
  | 'constraint'
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

const loadRobustnessCornerAnalysisPanel =
  () =>
    import(
      './RobustnessCornerAnalysisPanel'
    )

const loadParameterCalibrationPanel =
  () =>
    import(
      './ParameterCalibrationPanel'
    )

const loadFullFactorialDoePanel =
  () =>
    import(
      './FullFactorialDoePanel'
    )

const loadResponseSurfacePanel =
  () =>
    import(
      './ResponseSurfacePanel'
    )

const loadScaleUpSimilarityPanel =
  () =>
    import(
      './ScaleUpSimilarityPanel'
    )

const loadAgitatedVesselScaleUpPanel =
  () =>
    import(
      './AgitatedVesselScaleUpPanel'
    )

const loadPumpAffinitySystemPanel =
  () =>
    import(
      './PumpAffinitySystemPanel'
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

const loadConstraintOperatingWindowPanel =
  () =>
    import(
      './ConstraintOperatingWindowPanel'
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

const RobustnessCornerAnalysisPanel =
  lazy(
    async () => {
      const module =
        await loadRobustnessCornerAnalysisPanel()

      return {
        default:
          module
            .RobustnessCornerAnalysisPanel,
      }
    },
  )

const ParameterCalibrationPanel =
  lazy(
    async () => {
      const module =
        await loadParameterCalibrationPanel()

      return {
        default:
          module
            .ParameterCalibrationPanel,
      }
    },
  )

const FullFactorialDoePanel =
  lazy(
    async () => {
      const module =
        await loadFullFactorialDoePanel()

      return {
        default:
          module
            .FullFactorialDoePanel,
      }
    },
  )

const ResponseSurfacePanel =
  lazy(
    async () => {
      const module =
        await loadResponseSurfacePanel()

      return {
        default:
          module
            .ResponseSurfacePanel,
      }
    },
  )

const ScaleUpSimilarityPanel =
  lazy(
    async () => {
      const module =
        await loadScaleUpSimilarityPanel()

      return {
        default:
          module
            .ScaleUpSimilarityPanel,
      }
    },
  )

const AgitatedVesselScaleUpPanel =
  lazy(
    async () => {
      const module =
        await loadAgitatedVesselScaleUpPanel()

      return {
        default:
          module
            .AgitatedVesselScaleUpPanel,
      }
    },
  )

const PumpAffinitySystemPanel =
  lazy(
    async () => {
      const module =
        await loadPumpAffinitySystemPanel()

      return {
        default:
          module
            .PumpAffinitySystemPanel,
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

const ConstraintOperatingWindowPanel =
  lazy(
    async () => {
      const module =
        await loadConstraintOperatingWindowPanel()

      return {
        default:
          module
            .ConstraintOperatingWindowPanel,
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

export const TOOL_PREFETCHERS =
  'explicit-click-loading-v8' as const

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
        'robustness',
      label:
        'Worst-case tolerance',
      description:
        'Evaluate deterministic low–high input corners.',
    },
    {
      id:
        'calibration',
      label:
        'Parameter calibration',
      description:
        'Fit a shared parameter to observed engineering data.',
    },
    {
      id:
        'doe',
      label:
        'Factorial DOE',
      description:
        'Measure factor and interaction effects across structured runs.',
    },
    {
      id:
        'surface',
      label:
        'Response surface',
      description:
        'Fit a quadratic model and predict an optimum operating point.',
    },
    {
      id:
        'scaleup',
      label:
        'Scale-up similarity',
      description:
        'Preserve Reynolds, Froude or Weber similarity during scale-up.',
    },
    {
      id:
        'mixing',
      label:
        'Agitator scale-up',
      description:
        'Scale mixing speed by tip speed, P/V, Reynolds or Froude similarity.',
    },
    {
      id:
        'pump',
      label:
        'Pump operating point',
      description:
        'Apply affinity laws and intersect pump and process-system curves.',
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
        'constraint',
      label:
        'Constraint window',
      description:
        'Find feasible operating points within output limits.',
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
            Tools download only after explicit selection.
            Moving the pointer across the workspace does not start background downloads.
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
      'robustness' ? (
        <Suspense
          fallback={
            <ToolChunkLoading label="Worst-case tolerance" />
          }
        >
          <RobustnessCornerAnalysisPanel
            key={
              baseQuery
            }
            baseQuery={
              baseQuery
            }
            onApplyProblem={(
              selectedProblem,
            ) =>
              applyProblem(
                selectedProblem,
                'Worst-case tolerance scenario loaded.',
              )
            }
          />
        </Suspense>
      ) : null}

      {activeTool ===
      'calibration' ? (
        <Suspense
          fallback={
            <ToolChunkLoading label="Parameter calibration" />
          }
        >
          <ParameterCalibrationPanel
            key={
              baseQuery
            }
            baseQuery={
              baseQuery
            }
            onApplyProblem={(
              calibratedProblem,
            ) =>
              applyProblem(
                calibratedProblem,
                'Calibrated parameter loaded.',
              )
            }
          />
        </Suspense>
      ) : null}

      {activeTool ===
      'doe' ? (
        <Suspense
          fallback={
            <ToolChunkLoading label="Factorial DOE" />
          }
        >
          <FullFactorialDoePanel
            key={
              baseQuery
            }
            baseQuery={
              baseQuery
            }
            onApplyProblem={(
              experimentalProblem,
            ) =>
              applyProblem(
                experimentalProblem,
                'Selected factorial DOE run loaded.',
              )
            }
          />
        </Suspense>
      ) : null}

      {activeTool ===
      'surface' ? (
        <Suspense
          fallback={
            <ToolChunkLoading label="Response surface" />
          }
        >
          <ResponseSurfacePanel
            key={
              baseQuery
            }
            baseQuery={
              baseQuery
            }
            onApplyProblem={(
              optimumProblem,
            ) =>
              applyProblem(
                optimumProblem,
                'Predicted response-surface optimum loaded.',
              )
            }
          />
        </Suspense>
      ) : null}

      {activeTool ===
      'scaleup' ? (
        <Suspense
          fallback={
            <ToolChunkLoading label="Scale-up similarity" />
          }
        >
          <ScaleUpSimilarityPanel
            key={
              baseQuery
            }
            baseQuery={
              baseQuery
            }
            onApplyProblem={(
              scaledProblem,
            ) =>
              applyProblem(
                scaledProblem,
                'Scaled similarity case loaded.',
              )
            }
          />
        </Suspense>
      ) : null}

      {activeTool ===
      'mixing' ? (
        <Suspense
          fallback={
            <ToolChunkLoading label="Agitator scale-up" />
          }
        >
          <AgitatedVesselScaleUpPanel
            key={
              baseQuery
            }
            baseQuery={
              baseQuery
            }
            onApplyProblem={(
              scaledProblem,
            ) =>
              applyProblem(
                scaledProblem,
                'Scaled agitator case loaded.',
              )
            }
          />
        </Suspense>
      ) : null}

      {activeTool ===
      'pump' ? (
        <Suspense
          fallback={
            <ToolChunkLoading label="Pump operating point" />
          }
        >
          <PumpAffinitySystemPanel
            key={
              baseQuery
            }
            baseQuery={
              baseQuery
            }
            onApplyProblem={(
              operatingProblem,
            ) =>
              applyProblem(
                operatingProblem,
                'Pump operating point loaded.',
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
      'constraint' ? (
        <Suspense
          fallback={
            <ToolChunkLoading label="Constraint window" />
          }
        >
          <ConstraintOperatingWindowPanel
            key={
              baseQuery
            }
            baseQuery={
              baseQuery
            }
            onApplyProblem={(
              selectedProblem,
            ) =>
              applyProblem(
                selectedProblem,
                'Feasible constraint-window operating point loaded.',
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
