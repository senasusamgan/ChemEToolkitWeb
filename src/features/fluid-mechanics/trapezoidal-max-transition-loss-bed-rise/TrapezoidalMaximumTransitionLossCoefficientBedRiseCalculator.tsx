import {
  useState,
} from 'react'

import {
  TrapezoidalMaximumTransitionLossCoefficientBedRiseError,
  calculateTrapezoidalMaximumTransitionLossCoefficientBedRise,
  createTrapezoidalMaximumTransitionLossCoefficientBedRiseCsv,
} from './engine'

import type {
  TrapezoidalMaximumTransitionLossCoefficientBedRiseInput,
  TrapezoidalMaximumTransitionLossCoefficientBedRiseResult,
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

  upstreamFlowDepth:
    '1.2',

  specifiedBedRise:
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
      'upstreamFlowDepth',

    label:
      'Upstream Flow Depth',

    symbol:
      'y₁',

    unit:
      'm',
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
      'fluidDensity',

    label:
      'Fluid Density',

    symbol:
      'ρ',

    unit:
      'kg/m³',
  },
]

export function TrapezoidalMaximumTransitionLossCoefficientBedRiseCalculator() {
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
      TrapezoidalMaximumTransitionLossCoefficientBedRiseResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalMaximumTransitionLossCoefficientBedRiseInput | null
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
    TrapezoidalMaximumTransitionLossCoefficientBedRiseInput {
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

      upstreamFlowDepth:
        Number(
          form.upstreamFlowDepth,
        ),

      specifiedBedRise:
        Number(
          form.specifiedBedRise,
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
        calculateTrapezoidalMaximumTransitionLossCoefficientBedRise(
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
          TrapezoidalMaximumTransitionLossCoefficientBedRiseError
          ? error.message
          : 'The maximum transition-loss calculation could not be completed.',
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
      createTrapezoidalMaximumTransitionLossCoefficientBedRiseCsv(
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
      'trapezoidal-maximum-transition-loss-bed-rise.csv'

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
        code="FM–65"
        icon="≈"
        title="Maximum Transition Loss with Bed Rise Before Choking"
        subtitle="Determine the largest transition-loss coefficient a raised trapezoidal-channel contraction can tolerate before reaching its choking limit"
      />

      <ReferenceBasis>
        Calculator 448 extends the maximum
        allowable transition-loss design to
        include bed elevation rise. The bed
        rise first consumes upstream
        specific energy; the remaining
        throat capacity determines Kₗ,max.
      </ReferenceBasis>

      <div className="native-formula">
        K
        <sub>L,max</sub>
        =
        (Q
        <sub>max,0</sub>
        /Q)² − 1
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
        calculateLabel="Calculate maximum Kₗ"
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
            headlineLabel="Maximum allowable transition-loss coefficient"
            headlineValue={formatEngineeringNumber(
              result.maximumAllowableTransitionLossCoefficient,
            )}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Maximum Allowable Loss Head"
              value={formatEngineeringNumber(
                result.maximumAllowableTransitionLossHead,
              )}
              unit="m"
            />

            <ResultItem
              label="Upstream Specific Energy"
              value={formatEngineeringNumber(
                result.upstreamSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Available Throat Specific Energy"
              value={formatEngineeringNumber(
                result.availableThroatSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Bed Rise / Upstream Energy"
              value={formatEngineeringNumber(
                result.specifiedBedRiseFractionOfUpstreamEnergy *
                100,
              )}
              unit="%"
            />

            <ResultItem
              label="Lossless Maximum Flow"
              value={formatEngineeringNumber(
                result.losslessMaximumVolumetricFlowRate,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Lossless Flow-Capacity Margin"
              value={formatEngineeringNumber(
                result.losslessFlowCapacityMargin,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Lossless Capacity Ratio"
              value={formatEngineeringNumber(
                result.losslessCapacityRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Upstream Froude Number"
              value={formatEngineeringNumber(
                result.upstreamFroudeNumber,
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
              label="Theoretical Control Froude"
              value={formatEngineeringNumber(
                result.theoreticalControlFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Control Energy Without Loss"
              value={formatEngineeringNumber(
                result.controlSpecificEnergyWithoutLoss,
              )}
              unit="m"
            />

            <ResultItem
              label="Minimum Required Throat Energy"
              value={formatEngineeringNumber(
                result.minimumRequiredThroatEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Loss Head / Available Throat Energy"
              value={formatEngineeringNumber(
                result.transitionLossHeadFractionOfAvailableThroatEnergy *
                100,
              )}
              unit="%"
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
              label="Maximum Loss Dissipation Power"
              value={formatEngineeringNumber(
                result.maximumTransitionLossDissipationPower,
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
              label="Throat Energy Closure Residual"
              value={formatEngineeringNumber(
                result.throatEnergyClosureResidual,
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
              label="Control-Condition Residual"
              value={formatEngineeringNumber(
                result.controlConditionResidual,
              )}
              unit="-"
            />

            <ResultItem
              label="Capacity Solver Iterations"
              value={String(
                result.capacitySolverIterations,
              )}
              unit=""
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
