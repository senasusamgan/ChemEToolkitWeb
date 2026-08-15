import {
  useState,
} from 'react'

import {
  PartiallyFullCircularChannelUpstreamStandardStepProfileError,
  calculatePartiallyFullCircularChannelUpstreamStandardStepProfile,
  createPartiallyFullCircularChannelUpstreamStandardStepProfileCsv,
} from './engine'

import type {
  PartiallyFullCircularChannelUpstreamStandardStepProfileInput,
  PartiallyFullCircularChannelUpstreamStandardStepProfileResult,
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

  maximumReachLength:
    '20',
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
    'maximumReachLength',
    'Maximum Standard-Step Reach',
    'Δxmax',
    'm',
  ],
] as const


export function PartiallyFullCircularChannelUpstreamStandardStepProfileCalculator() {
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
    PartiallyFullCircularChannelUpstreamStandardStepProfileResult | null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    PartiallyFullCircularChannelUpstreamStandardStepProfileInput | null
  >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')


  function calculate() {
    try {
      const input:
        PartiallyFullCircularChannelUpstreamStandardStepProfileInput = {
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

        maximumReachLength:
          Number(
            form.maximumReachLength,
          ),
      }

      const next =
        calculatePartiallyFullCircularChannelUpstreamStandardStepProfile(
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
          PartiallyFullCircularChannelUpstreamStandardStepProfileError
          ? error.message
          : 'Upstream circular-channel backwater profile could not be solved.',
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
      maximumReachLength: '',
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
      createPartiallyFullCircularChannelUpstreamStandardStepProfileCsv(
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
      'circular-channel-upstream-standard-step-backwater-profile.csv'

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
        code="FM–85"
        icon="∿"
        title="Partially Full Circular Channel Upstream Standard-Step GVF Profile"
        subtitle="Compute a backwater profile upstream from a known downstream boundary depth"
      />

      <ReferenceBasis>
        Calculator 468 treats the specified
        downstream depth as the control boundary
        at x = 0 and marches Calculator 466
        upstream. Reported upstream distances are
        positive even though the underlying
        standard-step integration uses negative
        signed distance.
      </ReferenceBasis>

      <div className="native-formula">
        downstream boundary:
        {' '}
        x = 0, y = yb
        {'   '}
        → upstream integration:
        {' '}
        Δx &lt; 0
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
        calculateLabel="Solve upstream profile"
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
              label="Number of Reaches"
              value={formatEngineeringNumber(
                result.numberOfReaches,
              )}
              unit="-"
            />

            <ResultItem
              label="Actual Reach Length"
              value={formatEngineeringNumber(
                result.actualReachLength,
              )}
              unit="m"
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
              label="Upstream Endpoint Froude Number"
              value={formatEngineeringNumber(
                result.upstreamEndpoint.froudeNumber,
              )}
              unit="-"
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
              Export upstream profile CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
