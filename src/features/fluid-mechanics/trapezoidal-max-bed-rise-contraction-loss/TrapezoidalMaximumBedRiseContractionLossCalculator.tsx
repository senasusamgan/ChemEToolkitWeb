import {
  useState,
} from 'react'

import {
  TrapezoidalMaximumBedRiseContractionLossError,
  calculateTrapezoidalMaximumBedRiseContractionLoss,
  createTrapezoidalMaximumBedRiseContractionLossCsv,
} from './engine'

import type {
  TrapezoidalMaximumBedRiseContractionLossInput,
  TrapezoidalMaximumBedRiseContractionLossResult,
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

export function TrapezoidalMaximumBedRiseContractionLossCalculator() {
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
      TrapezoidalMaximumBedRiseContractionLossResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalMaximumBedRiseContractionLossInput | null
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
    TrapezoidalMaximumBedRiseContractionLossInput {
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
        calculateTrapezoidalMaximumBedRiseContractionLoss(
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
          TrapezoidalMaximumBedRiseContractionLossError
          ? error.message
          : 'The maximum bed-rise contraction calculation could not be completed.',
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
      createTrapezoidalMaximumBedRiseContractionLossCsv(
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
      'trapezoidal-maximum-bed-rise-contraction-loss.csv'

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
        code="FM–62"
        icon="≈"
        title="Maximum Bed Rise Through a Contraction with Transition Loss"
        subtitle="Determine the maximum crest elevation increase that can be combined with a trapezoidal-channel contraction before choking occurs"
      />

      <ReferenceBasis>
        Calculator 445 combines lateral
        contraction, transition loss and bed
        elevation change. The available
        specific-energy reserve from the
        loss-adjusted throat becomes the
        allowable crest rise.
      </ReferenceBasis>

      <div className="native-formula">
        Δz
        <sub>max</sub>
        =
        E₁ − E
        <sub>control,L</sub>
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
        calculateLabel="Calculate maximum bed rise"
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
            headlineLabel="Bed-rise status"
            headlineValue={
              result.bedRiseStatus
            }
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Maximum Allowable Bed Rise"
              value={formatEngineeringNumber(
                result.maximumAllowableBedRise,
              )}
              unit="m"
            />

            <ResultItem
              label="Required Bed Lowering"
              value={formatEngineeringNumber(
                result.requiredBedLowering,
              )}
              unit="m"
            />

            <ResultItem
              label="Signed Bed-Elevation Allowance"
              value={formatEngineeringNumber(
                result.signedBedElevationAllowance,
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
              label="Specific-Energy Reserve"
              value={formatEngineeringNumber(
                result.specificEnergyReserve,
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
              label="Transition-Loss Head at Threshold"
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
              label="Loss-Adjusted Minimum Contracted Width"
              value={formatEngineeringNumber(
                result.lossAdjustedMinimumContractedBottomWidth,
              )}
              unit="m"
            />

            <ResultItem
              label="Current Width Safety Margin"
              value={formatEngineeringNumber(
                result.widthSafetyMarginAtCurrentBed,
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
              label="Maximum Bed-Rise Potential Power"
              value={formatEngineeringNumber(
                result.maximumBedRisePotentialPower,
              )}
              unit="W"
            />

            <ResultItem
              label="Required Bed-Lowering Potential Power"
              value={formatEngineeringNumber(
                result.requiredBedLoweringPotentialPower,
              )}
              unit="W"
            />

            <ResultItem
              label="Energy Closure Residual"
              value={formatEngineeringNumber(
                result.exactThresholdEnergyResidual,
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
