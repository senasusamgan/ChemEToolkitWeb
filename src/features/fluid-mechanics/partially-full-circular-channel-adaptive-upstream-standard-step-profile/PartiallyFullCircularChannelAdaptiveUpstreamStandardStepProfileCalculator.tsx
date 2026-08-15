import {
  useState,
} from 'react'

import {
  PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError,
  calculatePartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile,
  createPartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileCsv,
} from './engine'

import type {
  PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileInput,
  PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileResult,
} from './types'

import {
  ActionBar,
  CalculatorHeader,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../../mass-transfer/shared/NativeCalculatorPrimitives'


const exampleForm = {
  pipeDiameter:
    '1.2',

  volumetricFlowRate:
    '0.6',

  manningRoughness:
    '0.013',

  channelSlope:
    '0.001',

  downstreamBoundaryDepth:
    '0.6',

  upstreamProfileLength:
    '100',

  initialReachLength:
    '40',

  minimumReachLength:
    '1',

  maximumReachLength:
    '50',

  absoluteTolerance:
    '1e-6',

  relativeTolerance:
    '1e-6',
}


type FormField =
  keyof typeof exampleForm


const fields = [
  [
    'pipeDiameter',
    'Circular Channel Diameter',
    'D',
    'm',
  ],
  [
    'volumetricFlowRate',
    'Volumetric Flow Rate',
    'Q',
    'm³/s',
  ],
  [
    'manningRoughness',
    'Manning Roughness',
    'n',
    '-',
  ],
  [
    'channelSlope',
    'Channel Bed Slope',
    'S₀',
    'm/m',
  ],
  [
    'downstreamBoundaryDepth',
    'Downstream Boundary Depth',
    'yb',
    'm',
  ],
  [
    'upstreamProfileLength',
    'Upstream Profile Length',
    'Lup',
    'm',
  ],
  [
    'initialReachLength',
    'Initial Reach Length',
    'Δx₀',
    'm',
  ],
  [
    'minimumReachLength',
    'Minimum Reach Length',
    'Δxmin',
    'm',
  ],
  [
    'maximumReachLength',
    'Maximum Reach Length',
    'Δxmax',
    'm',
  ],
  [
    'absoluteTolerance',
    'Absolute Depth Tolerance',
    'ATOL',
    'm',
  ],
  [
    'relativeTolerance',
    'Relative Depth Tolerance',
    'RTOL',
    '-',
  ],
] as const


export function PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileCalculator() {
  const [
    form,
    setForm,
  ] = useState(
    exampleForm,
  )

  const [
    result,
    setResult,
  ] = useState<
    PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileResult | null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileInput | null
  >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')


  function calculate() {
    try {
      const input:
        PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileInput = {
        pipeDiameter:
          Number(
            form.pipeDiameter,
          ),

        volumetricFlowRate:
          Number(
            form.volumetricFlowRate,
          ),

        manningRoughness:
          Number(
            form.manningRoughness,
          ),

        channelSlope:
          Number(
            form.channelSlope,
          ),

        downstreamBoundaryDepth:
          Number(
            form.downstreamBoundaryDepth,
          ),

        upstreamProfileLength:
          Number(
            form.upstreamProfileLength,
          ),

        initialReachLength:
          Number(
            form.initialReachLength,
          ),

        minimumReachLength:
          Number(
            form.minimumReachLength,
          ),

        maximumReachLength:
          Number(
            form.maximumReachLength,
          ),

        absoluteTolerance:
          Number(
            form.absoluteTolerance,
          ),

        relativeTolerance:
          Number(
            form.relativeTolerance,
          ),
      }

      const next =
        calculatePartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile(
          input,
        )

      setResult(
        next,
      )

      setCalculatedInput(
        input,
      )

      setErrorMessage('')
    } catch (error) {
      setResult(
        null,
      )

      setCalculatedInput(
        null,
      )

      setErrorMessage(
        error instanceof
          PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileError
          ? error.message
          : 'Adaptive upstream circular-channel profile could not be solved.',
      )
    }
  }


  function loadExample() {
    setForm(
      exampleForm,
    )

    setResult(
      null,
    )

    setCalculatedInput(
      null,
    )

    setErrorMessage('')
  }


  function clearInputs() {
    setForm({
      pipeDiameter: '',
      volumetricFlowRate: '',
      manningRoughness: '',
      channelSlope: '',
      downstreamBoundaryDepth: '',
      upstreamProfileLength: '',
      initialReachLength: '',
      minimumReachLength: '',
      maximumReachLength: '',
      absoluteTolerance: '',
      relativeTolerance: '',
    })

    setResult(
      null,
    )

    setCalculatedInput(
      null,
    )

    setErrorMessage('')
  }


  function exportCsv() {
    if (
      !result ||
      !calculatedInput
    ) {
      return
    }

    const csv =
      createPartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileCsv(
        calculatedInput,
        result,
      )

    const blob =
      new Blob(
        [csv],
        {
          type:
            'text/csv;charset=utf-8',
        },
      )

    const url =
      URL.createObjectURL(
        blob,
      )

    const link =
      document.createElement(
        'a',
      )

    link.href =
      url

    link.download =
      'circular-channel-adaptive-upstream-backwater-profile.csv'

    document.body.appendChild(
      link,
    )

    link.click()
    link.remove()

    URL.revokeObjectURL(
      url,
    )
  }


  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="FM–86"
        icon="∿"
        title="Partially Full Circular Channel Adaptive Upstream Standard-Step GVF Profile"
        subtitle="Compute an adaptive backwater profile upstream from a known downstream boundary depth"
      />

      <ReferenceBasis>
        Calculator 469 combines downstream-boundary
        backwater analysis with Calculator 467's
        adaptive standard-step solver. Each trial
        compares one full reach with two half reaches
        and automatically adjusts reach size to meet
        ATOL and RTOL.
      </ReferenceBasis>

      <div className="native-formula">
        xup = −x
        {'   '}
        ·
        {'   '}
        error ≈
        |y₂×Δx/2 − yΔx| / 3
      </div>

      <div className="native-input-grid">
        {fields.map(
          (
            [
              key,
              label,
              symbol,
              unit,
            ],
          ) => (
            <NumericInput
              key={
                key
              }
              label={
                label
              }
              symbol={
                symbol
              }
              value={
                form[
                  key as FormField
                ]
              }
              unit={
                unit
              }
              onChange={
                value =>
                  setForm(
                    current => ({
                      ...current,

                      [key]:
                        value,
                    }),
                  )
              }
            />
          ),
        )}
      </div>

      <ActionBar
        onLoadExample={
          loadExample
        }
        onClear={
          clearInputs
        }
        onCalculate={
          calculate
        }
        calculateLabel="Solve adaptive upstream profile"
      />

      {errorMessage ? (
        <div
          className="native-error"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <>
          <ResultPanel
            headlineLabel="Upstream endpoint depth"
            headlineValue={`${formatEngineeringNumber(
              result.upstreamEndpoint.flowDepth,
            )} m`}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Flow Regime"
              value={
                result.flowRegime
              }
              unit=""
            />

            <ResultItem
              label="Upstream Profile Length"
              value={formatEngineeringNumber(
                result.upstreamProfileLength,
              )}
              unit="m"
            />

            <ResultItem
              label="Accepted Reaches"
              value={formatEngineeringNumber(
                result.acceptedReaches,
              )}
              unit="-"
            />

            <ResultItem
              label="Rejected Trials"
              value={formatEngineeringNumber(
                result.rejectedTrials,
              )}
              unit="-"
            />

            <ResultItem
              label="Attempted Trials"
              value={formatEngineeringNumber(
                result.attemptedTrials,
              )}
              unit="-"
            />

            <ResultItem
              label="Completed Standard-Step Solves"
              value={formatEngineeringNumber(
                result.completedStandardStepSolves,
              )}
              unit="-"
            />

            <ResultItem
              label="Minimum Accepted Reach"
              value={formatEngineeringNumber(
                result.minimumAcceptedReachLength,
              )}
              unit="m"
            />

            <ResultItem
              label="Maximum Accepted Reach"
              value={formatEngineeringNumber(
                result.maximumAcceptedReachLength,
              )}
              unit="m"
            />

            <ResultItem
              label="Mean Accepted Reach"
              value={formatEngineeringNumber(
                result.meanAcceptedReachLength,
              )}
              unit="m"
            />

            <ResultItem
              label="Maximum Error Ratio"
              value={formatEngineeringNumber(
                result.maximumAcceptedErrorRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Critical Depth"
              value={formatEngineeringNumber(
                result.criticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Downstream Boundary Depth"
              value={formatEngineeringNumber(
                result.downstreamBoundary.flowDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Upstream Endpoint Depth"
              value={formatEngineeringNumber(
                result.upstreamEndpoint.flowDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Upstream Depth Change"
              value={formatEngineeringNumber(
                result.upstreamDepthChange,
              )}
              unit="m"
            />

            <ResultItem
              label="Minimum Depth"
              value={formatEngineeringNumber(
                result.minimumDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Maximum Depth"
              value={formatEngineeringNumber(
                result.maximumDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Bed Rise to Upstream Endpoint"
              value={formatEngineeringNumber(
                result.bedRiseToUpstreamEndpoint,
              )}
              unit="m"
            />

            <ResultItem
              label="Water-Surface Elevation Change"
              value={formatEngineeringNumber(
                result.waterSurfaceElevationChange,
              )}
              unit="m"
            />

            <ResultItem
              label="Friction Head Loss"
              value={formatEngineeringNumber(
                result.frictionHeadLossMagnitude,
              )}
              unit="m"
            />

            <ResultItem
              label="Total Head Rise Moving Upstream"
              value={formatEngineeringNumber(
                result.totalHeadRiseMovingUpstream,
              )}
              unit="m"
            />

            <ResultItem
              label="Energy Closure Residual"
              value={formatEngineeringNumber(
                result.energyClosureResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Total Root Iterations"
              value={formatEngineeringNumber(
                result.totalRootIterations,
              )}
              unit="-"
            />
          </ResultPanel>

          <div className="native-actions">
            <button
              type="button"
              onClick={
                exportCsv
              }
            >
              Export adaptive upstream profile CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
