import {
  useState,
} from 'react'

import {
  TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossError,
  calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss,
  createTrapezoidalMinimumUpstreamDepthBedRiseTransitionLossCsv,
} from './engine'

import type {
  TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossInput,
  TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossResult,
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
  upstreamBottomWidth:
    '3',

  contractedBottomWidth:
    '2',

  sideSlopeHorizontalPerVertical:
    '1',

  volumetricFlowRate:
    '5',

  specifiedBedRise:
    '0.1',

  transitionLossCoefficient:
    '0.1',

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
      'upstreamBottomWidth',

    label:
      'Upstream Bottom Width',

    symbol:
      'b₁',

    unit:
      'm',
  },
  {
    key:
      'contractedBottomWidth',

    label:
      'Contracted Bottom Width',

    symbol:
      'b₂',

    unit:
      'm',
  },
  {
    key:
      'sideSlopeHorizontalPerVertical',

    label:
      'Side Slope Horizontal : Vertical',

    symbol:
      'z',

    unit:
      'H:V',
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
      'specifiedBedRise',

    label:
      'Specified Bed Rise',

    symbol:
      'Δz',

    unit:
      'm',
  },
  {
    key:
      'transitionLossCoefficient',

    label:
      'Transition Loss Coefficient',

    symbol:
      'Kₗ',

    unit:
      '-',
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

export function TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossCalculator() {
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
      TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossInput | null
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
    TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossInput {
    return {
      upstreamBottomWidth:
        Number(
          form.upstreamBottomWidth,
        ),

      contractedBottomWidth:
        Number(
          form.contractedBottomWidth,
        ),

      sideSlopeHorizontalPerVertical:
        Number(
          form.sideSlopeHorizontalPerVertical,
        ),

      volumetricFlowRate:
        Number(
          form.volumetricFlowRate,
        ),

      specifiedBedRise:
        Number(
          form.specifiedBedRise,
        ),

      transitionLossCoefficient:
        Number(
          form.transitionLossCoefficient,
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
        calculateTrapezoidalMinimumUpstreamDepthBedRiseTransitionLoss(
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
          TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossError
          ? error.message
          : 'The combined minimum upstream-depth calculation could not be completed.',
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
      createTrapezoidalMinimumUpstreamDepthBedRiseTransitionLossCsv(
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
      'trapezoidal-minimum-upstream-depth-bed-rise-transition-loss.csv'

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
        code="FM–66"
        icon="≈"
        title="Minimum Upstream Depth with Contraction, Bed Rise & Transition Loss"
        subtitle="Determine the minimum subcritical approach depth required to pass a raised trapezoidal-channel contraction at its loss-adjusted choking limit"
      />

      <ReferenceBasis>
        Calculator 449 extends the minimum
        upstream-depth design by including
        both bed elevation rise and
        transition loss. The deep
        specific-energy root is selected
        as the minimum subcritical
        approach depth.
      </ReferenceBasis>

      <div className="native-formula">
        E
        <sub>1,min</sub>
        =
        Δz +
        y
        <sub>c,L</sub>
        +
        (1 + K
        <sub>L</sub>
        )V
        <sub>c,L</sub>
        ²/(2g)
      </div>

      <div className="native-input-grid">
        {fields.map(
          field => (
            <NumericInput
              key={field.key}
              label={field.label}
              symbol={field.symbol}
              value={form[field.key]}
              unit={field.unit}
              onChange={updateField(
                field.key,
              )}
            />
          ),
        )}
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate minimum upstream depth"
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
            headlineLabel="Minimum subcritical upstream depth"
            headlineValue={`${formatEngineeringNumber(
              result.minimumSubcriticalUpstreamDepth,
            )} m`}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Zero-Bed-Rise Minimum Depth"
              value={formatEngineeringNumber(
                result.zeroBedRiseMinimumSubcriticalUpstreamDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Bed-Rise Depth Penalty"
              value={formatEngineeringNumber(
                result.bedRiseDepthPenalty,
              )}
              unit="m"
            />

            <ResultItem
              label="Bed-Rise Depth Penalty"
              value={formatEngineeringNumber(
                result.bedRiseDepthPenaltyPercent,
              )}
              unit="%"
            />

            <ResultItem
              label="Alternate Supercritical Depth"
              value={formatEngineeringNumber(
                result.alternateSupercriticalUpstreamDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Upstream Critical Depth"
              value={formatEngineeringNumber(
                result.upstreamCriticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Required Upstream Specific Energy"
              value={formatEngineeringNumber(
                result.requiredUpstreamSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Throat Required Specific Energy"
              value={formatEngineeringNumber(
                result.throatRequiredSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Required Upstream Velocity"
              value={formatEngineeringNumber(
                result.requiredUpstreamVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Required Upstream Froude"
              value={formatEngineeringNumber(
                result.requiredUpstreamFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Alternate Upstream Froude"
              value={formatEngineeringNumber(
                result.alternateUpstreamFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Loss-Adjusted Control Depth"
              value={formatEngineeringNumber(
                result.lossAdjustedControlDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Loss-Adjusted Control Velocity"
              value={formatEngineeringNumber(
                result.lossAdjustedControlVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Loss-Adjusted Control Froude"
              value={formatEngineeringNumber(
                result.lossAdjustedControlFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Transition-Loss Head"
              value={formatEngineeringNumber(
                result.transitionLossHeadAtThreshold,
              )}
              unit="m"
            />

            <ResultItem
              label="Crest Water-Surface Elevation"
              value={formatEngineeringNumber(
                result.crestWaterSurfaceElevationRelativeToUpstreamBed,
              )}
              unit="m"
            />

            <ResultItem
              label="Water-Surface Elevation Change"
              value={formatEngineeringNumber(
                result.waterSurfaceElevationChangeAtThreshold,
              )}
              unit="m"
            />

            <ResultItem
              label="Transition-Loss Dissipation Power"
              value={formatEngineeringNumber(
                result.transitionLossDissipationPower,
              )}
              unit="W"
            />

            <ResultItem
              label="Bed-Rise Potential Power"
              value={formatEngineeringNumber(
                result.bedRisePotentialPower,
              )}
              unit="W"
            />

            <ResultItem
              label="Combined Bed-Rise + Loss Power"
              value={formatEngineeringNumber(
                result.combinedBedRiseAndLossPower,
              )}
              unit="W"
            />

            <ResultItem
              label="Subcritical Energy Residual"
              value={formatEngineeringNumber(
                result.subcriticalEnergyResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Alternate Energy Residual"
              value={formatEngineeringNumber(
                result.alternateEnergyResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Total Energy Closure Residual"
              value={formatEngineeringNumber(
                result.totalEnergyClosureResidual,
              )}
              unit="m"
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
              onClick={exportCsv}
            >
              Export calculation CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
