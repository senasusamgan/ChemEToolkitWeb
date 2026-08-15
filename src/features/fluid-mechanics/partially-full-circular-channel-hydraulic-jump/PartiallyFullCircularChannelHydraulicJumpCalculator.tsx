import {
  useState,
} from 'react'

import {
  PartiallyFullCircularChannelHydraulicJumpError,
  calculatePartiallyFullCircularChannelHydraulicJump,
  createPartiallyFullCircularChannelHydraulicJumpCsv,
} from './engine'

import type {
  PartiallyFullCircularChannelHydraulicJumpInput,
  PartiallyFullCircularChannelHydraulicJumpResult,
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
    '1.2',

  upstreamFlowDepth:
    '0.35',

  fluidDensity:
    '998',
}

type FormField =
  keyof typeof exampleForm

const fields: Array<{
  key: FormField
  label: string
  symbol: string
  unit: string
}> = [
  {
    key:
      'pipeDiameter',

    label:
      'Circular Channel Diameter',

    symbol:
      'D',

    unit:
      'm',
  },
  {
    key:
      'volumetricFlowRate',

    label:
      'Volumetric Flow Rate',

    symbol:
      'Q',

    unit:
      'm³/s',
  },
  {
    key:
      'upstreamFlowDepth',

    label:
      'Upstream Supercritical Depth',

    symbol:
      'y₁',

    unit:
      'm',
  },
  {
    key:
      'fluidDensity',

    label:
      'Fluid Density',

    symbol:
      'ρ',

    unit:
      'kg/m³',
  },
]


export function PartiallyFullCircularChannelHydraulicJumpCalculator() {
  const [
    form,
    setForm,
  ] =
    useState(
      exampleForm,
    )

  const [
    result,
    setResult,
  ] =
    useState<
      PartiallyFullCircularChannelHydraulicJumpResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      PartiallyFullCircularChannelHydraulicJumpInput | null
    >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('')


  function updateField(
    field: FormField,
  ) {
    return (
      value: string,
    ) => {
      setForm(
        current => ({
          ...current,

          [field]:
            value,
        }),
      )
    }
  }


  function currentInput():
    PartiallyFullCircularChannelHydraulicJumpInput {
    return {
      pipeDiameter:
        Number(
          form.pipeDiameter,
        ),

      volumetricFlowRate:
        Number(
          form.volumetricFlowRate,
        ),

      upstreamFlowDepth:
        Number(
          form.upstreamFlowDepth,
        ),

      fluidDensity:
        Number(
          form.fluidDensity,
        ),
    }
  }


  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculatePartiallyFullCircularChannelHydraulicJump(
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
          PartiallyFullCircularChannelHydraulicJumpError
          ? error.message
          : 'Circular-channel hydraulic jump could not be solved.',
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
    setForm(
      Object.fromEntries(
        Object.keys(
          exampleForm,
        ).map(
          key => [
            key,
            '',
          ],
        ),
      ) as typeof exampleForm,
    )

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
      createPartiallyFullCircularChannelHydraulicJumpCsv(
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
      'partially-full-circular-channel-hydraulic-jump.csv'

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
        code="FM–77"
        icon="≈"
        title="Partially Full Circular Channel Hydraulic Jump"
        subtitle="Solve the momentum-conjugate downstream depth and irreversible energy dissipation of a circular-channel hydraulic jump"
      />

      <ReferenceBasis>
        Calculator 460 applies the momentum
        specific-force equation to the
        partially full circular section.
        Calculator 457 supplies the critical
        depth that separates the upstream and
        downstream conjugate roots.
      </ReferenceBasis>

      <div className="native-formula">
        M =
        Q²/(gA) + I
        {'   '}
        →
        {'   '}
        M₁ = M₂
      </div>

      <div className="native-input-grid">
        {fields.map(
          field => (
            <NumericInput
              key={
                field.key
              }
              label={
                field.label
              }
              symbol={
                field.symbol
              }
              value={
                form[
                  field.key
                ]
              }
              unit={
                field.unit
              }
              onChange={
                updateField(
                  field.key,
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
        calculateLabel="Solve hydraulic jump"
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
            headlineLabel="Downstream conjugate depth"
            headlineValue={`${formatEngineeringNumber(
              result.downstreamState.flowDepth,
            )} m`}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Upstream Depth"
              value={formatEngineeringNumber(
                result.upstreamState.flowDepth,
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
              label="Jump Height"
              value={formatEngineeringNumber(
                result.jumpHeight,
              )}
              unit="m"
            />

            <ResultItem
              label="Sequent Depth Ratio y₂/y₁"
              value={formatEngineeringNumber(
                result.sequentDepthRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Upstream Velocity"
              value={formatEngineeringNumber(
                result.upstreamState.meanVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Downstream Velocity"
              value={formatEngineeringNumber(
                result.downstreamState.meanVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Upstream Froude Number"
              value={formatEngineeringNumber(
                result.upstreamState.froudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Downstream Froude Number"
              value={formatEngineeringNumber(
                result.downstreamState.froudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Upstream Specific Force"
              value={formatEngineeringNumber(
                result.upstreamSpecificForce,
              )}
              unit="m³"
            />

            <ResultItem
              label="Downstream Specific Force"
              value={formatEngineeringNumber(
                result.downstreamSpecificForce,
              )}
              unit="m³"
            />

            <ResultItem
              label="Momentum Closure Residual"
              value={formatEngineeringNumber(
                result.momentumClosureResidual,
              )}
              unit="m³"
            />

            <ResultItem
              label="Upstream Specific Energy"
              value={formatEngineeringNumber(
                result.upstreamState.specificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Downstream Specific Energy"
              value={formatEngineeringNumber(
                result.downstreamState.specificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Specific Energy Loss"
              value={formatEngineeringNumber(
                result.specificEnergyLoss,
              )}
              unit="m"
            />

            <ResultItem
              label="Energy Loss"
              value={formatEngineeringNumber(
                result.energyLossPercent,
              )}
              unit="%"
            />

            <ResultItem
              label="Hydrostatic Force Increase"
              value={formatEngineeringNumber(
                result.hydrostaticForceIncrease,
              )}
              unit="N"
            />

            <ResultItem
              label="Momentum-Flux Change Force"
              value={formatEngineeringNumber(
                result.momentumFluxChangeForce,
              )}
              unit="N"
            />

            <ResultItem
              label="Force-Balance Residual"
              value={formatEngineeringNumber(
                result.forceBalanceResidual,
              )}
              unit="N"
            />

            <ResultItem
              label="Hydraulic Power Dissipated"
              value={formatEngineeringNumber(
                result.hydraulicPowerDissipated,
              )}
              unit="W"
            />

            <ResultItem
              label="Mass Flow Rate"
              value={formatEngineeringNumber(
                result.massFlowRate,
              )}
              unit="kg/s"
            />
          </ResultPanel>

          <div className="native-actions">
            <button
              type="button"
              onClick={
                exportCsv
              }
            >
              Export calculation CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
