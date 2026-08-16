import {
  useState,
} from 'react'

import {
  PartiallyFullCircularChannelCapacityChokingMarginError,
  calculatePartiallyFullCircularChannelCapacityChokingMargin,
  createPartiallyFullCircularChannelCapacityChokingMarginCsv,
} from './engine'

import type {
  PartiallyFullCircularChannelCapacityChokingMarginInput,
  PartiallyFullCircularChannelCapacityChokingMarginResult,
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

  actualDischarge:
    '0.9',

  availableSpecificEnergy:
    '0.8',

  fluidDensity:
    '998',
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
    'actualDischarge',
    'Actual / Design Discharge',
    'Q',
    'm³/s',
  ],
  [
    'availableSpecificEnergy',
    'Available Specific Energy',
    'Eavail',
    'm',
  ],
  [
    'fluidDensity',
    'Fluid Density',
    'ρ',
    'kg/m³',
  ],
] as const


export function PartiallyFullCircularChannelCapacityChokingMarginCalculator() {
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
    PartiallyFullCircularChannelCapacityChokingMarginResult | null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    PartiallyFullCircularChannelCapacityChokingMarginInput | null
  >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')


  function calculate() {
    try {
      const input:
        PartiallyFullCircularChannelCapacityChokingMarginInput = {
        pipeDiameter:
          Number(
            form.pipeDiameter,
          ),

        actualDischarge:
          Number(
            form.actualDischarge,
          ),

        availableSpecificEnergy:
          Number(
            form.availableSpecificEnergy,
          ),

        fluidDensity:
          Number(
            form.fluidDensity,
          ),
      }

      const next =
        calculatePartiallyFullCircularChannelCapacityChokingMargin(
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
          PartiallyFullCircularChannelCapacityChokingMarginError
          ? error.message
          : 'Capacity and choking margin could not be evaluated.',
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
      actualDischarge: '',
      availableSpecificEnergy: '',
      fluidDensity: '',
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
      createPartiallyFullCircularChannelCapacityChokingMarginCsv(
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
      'circular-channel-capacity-choking-margin.csv'

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
        code="FM–90"
        icon="≈"
        title="Partially Full Circular Channel Capacity & Choking Margin"
        subtitle="Compare actual discharge and available specific energy against the circular-channel critical-flow capacity"
      />

      <ReferenceBasis>
        Calculator 473 combines Calculator 470
        and Calculator 472. The available-energy
        capacity Qmax is compared with actual
        discharge, while the minimum energy Emin
        required by that discharge is compared
        with the available specific energy.
      </ReferenceBasis>

      <div className="native-formula">
        ΔQ =
        Qmax − Q
        {'   '}
        ·
        {'   '}
        ΔE =
        Eavail − Emin
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
        calculateLabel="Evaluate choking margin"
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
            headlineLabel="Capacity state"
            headlineValue={
              result.capacityState
            }
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Maximum Discharge"
              value={formatEngineeringNumber(
                result.maximumDischarge,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Actual Discharge"
              value={formatEngineeringNumber(
                result.actualDischarge,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Discharge Margin"
              value={formatEngineeringNumber(
                result.dischargeMargin,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Discharge Reserve"
              value={formatEngineeringNumber(
                result.dischargeReserve,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Discharge Overload"
              value={formatEngineeringNumber(
                result.dischargeOverload,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Capacity Utilization"
              value={formatEngineeringNumber(
                result.dischargeUtilization *
                100,
              )}
              unit="%"
            />

            <ResultItem
              label="Discharge Reserve"
              value={formatEngineeringNumber(
                result.dischargeReservePercent,
              )}
              unit="%"
            />

            <ResultItem
              label="Capacity Factor"
              value={formatEngineeringNumber(
                result.capacityFactor,
              )}
              unit="-"
            />

            <ResultItem
              label="Choking Margin Index"
              value={formatEngineeringNumber(
                result.chokingMarginIndex,
              )}
              unit="-"
            />

            <ResultItem
              label="Available Specific Energy"
              value={formatEngineeringNumber(
                result.availableSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Minimum Required Specific Energy"
              value={formatEngineeringNumber(
                result.minimumRequiredSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Specific Energy Margin"
              value={formatEngineeringNumber(
                result.specificEnergyMargin,
              )}
              unit="m"
            />

            <ResultItem
              label="Specific Energy Reserve"
              value={formatEngineeringNumber(
                result.specificEnergyReservePercent,
              )}
              unit="%"
            />

            <ResultItem
              label="Specific Energy Deficit"
              value={formatEngineeringNumber(
                result.specificEnergyDeficit,
              )}
              unit="m"
            />

            <ResultItem
              label="Energy Adequacy Ratio"
              value={formatEngineeringNumber(
                result.energyAdequacyRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Critical Depth — Actual Q"
              value={formatEngineeringNumber(
                result.actualCriticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Depth — Capacity"
              value={formatEngineeringNumber(
                result.capacityCriticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Actual Mass Flow Rate"
              value={formatEngineeringNumber(
                result.actualMassFlowRate,
              )}
              unit="kg/s"
            />

            <ResultItem
              label="Maximum Mass Flow Capacity"
              value={formatEngineeringNumber(
                result.maximumMassFlowCapacity,
              )}
              unit="kg/s"
            />

            <ResultItem
              label="Available Hydraulic Power"
              value={formatEngineeringNumber(
                result.availableHydraulicPower,
              )}
              unit="W"
            />

            <ResultItem
              label="Minimum Required Hydraulic Power"
              value={formatEngineeringNumber(
                result.minimumRequiredHydraulicPower,
              )}
              unit="W"
            />

            <ResultItem
              label="Hydraulic Power Margin"
              value={formatEngineeringNumber(
                result.hydraulicPowerMargin,
              )}
              unit="W"
            />

            <ResultItem
              label="Inverse Discharge Residual"
              value={formatEngineeringNumber(
                result.inverseDischargeResidual,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Inverse Energy Residual"
              value={formatEngineeringNumber(
                result.inverseEnergyResidual,
              )}
              unit="m"
            />
          </ResultPanel>

          <div className="native-actions">
            <button
              type="button"
              onClick={
                exportCsv
              }
            >
              Export margin analysis CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
