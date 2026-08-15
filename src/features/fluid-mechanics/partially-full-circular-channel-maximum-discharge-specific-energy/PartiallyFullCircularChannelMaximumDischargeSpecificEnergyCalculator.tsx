import {
  useState,
} from 'react'

import {
  PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError,
  calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy,
  createPartiallyFullCircularChannelMaximumDischargeSpecificEnergyCsv,
} from './engine'

import type {
  PartiallyFullCircularChannelMaximumDischargeSpecificEnergyInput,
  PartiallyFullCircularChannelMaximumDischargeSpecificEnergyResult,
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

  targetSpecificEnergy:
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
    'targetSpecificEnergy',
    'Available Specific Energy',
    'E',
    'm',
  ],
  [
    'fluidDensity',
    'Fluid Density',
    'ρ',
    'kg/m³',
  ],
] as const


export function PartiallyFullCircularChannelMaximumDischargeSpecificEnergyCalculator() {
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
    PartiallyFullCircularChannelMaximumDischargeSpecificEnergyResult | null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    PartiallyFullCircularChannelMaximumDischargeSpecificEnergyInput | null
  >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')


  function calculate() {
    try {
      const input:
        PartiallyFullCircularChannelMaximumDischargeSpecificEnergyInput = {
        pipeDiameter:
          Number(
            form.pipeDiameter,
          ),

        targetSpecificEnergy:
          Number(
            form.targetSpecificEnergy,
          ),

        fluidDensity:
          Number(
            form.fluidDensity,
          ),
      }

      const next =
        calculatePartiallyFullCircularChannelMaximumDischargeSpecificEnergy(
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
          PartiallyFullCircularChannelMaximumDischargeSpecificEnergyError
          ? error.message
          : 'Maximum circular-channel discharge could not be solved.',
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
      targetSpecificEnergy: '',
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
      createPartiallyFullCircularChannelMaximumDischargeSpecificEnergyCsv(
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
      'circular-channel-maximum-discharge-specific-energy.csv'

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
        code="FM–87"
        icon="≈"
        title="Partially Full Circular Channel Maximum Discharge for Specified Specific Energy"
        subtitle="Determine the critical-control depth and maximum discharge available from a fixed specific-energy budget"
      />

      <ReferenceBasis>
        For a fixed specific energy, discharge is
        maximized at critical flow. The solver
        determines the circular critical depth from
        E = y + A/(2T), then calculates the
        corresponding maximum discharge from
        Qmax² = gA³/T.
      </ReferenceBasis>

      <div className="native-formula">
        E =
        y +
        V²/(2g)
        {'   '}
        ·
        {'   '}
        Fr = 1
        {'   '}
        ·
        {'   '}
        Qmax =
        √(gA³/T)
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
        calculateLabel="Find maximum discharge"
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
            headlineLabel="Maximum discharge"
            headlineValue={`${formatEngineeringNumber(
              result.maximumDischarge,
            )} m³/s`}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Critical Depth"
              value={formatEngineeringNumber(
                result.criticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Depth / Diameter"
              value={formatEngineeringNumber(
                result.depthRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Crown Clearance"
              value={formatEngineeringNumber(
                result.crownClearance,
              )}
              unit="m"
            />

            <ResultItem
              label="Froude Number"
              value={formatEngineeringNumber(
                result.froudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Flow Area"
              value={formatEngineeringNumber(
                result.flowArea,
              )}
              unit="m²"
            />

            <ResultItem
              label="Top Width"
              value={formatEngineeringNumber(
                result.topWidth,
              )}
              unit="m"
            />

            <ResultItem
              label="Wetted Perimeter"
              value={formatEngineeringNumber(
                result.wettedPerimeter,
              )}
              unit="m"
            />

            <ResultItem
              label="Hydraulic Radius"
              value={formatEngineeringNumber(
                result.hydraulicRadius,
              )}
              unit="m"
            />

            <ResultItem
              label="Hydraulic Depth"
              value={formatEngineeringNumber(
                result.hydraulicDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Velocity"
              value={formatEngineeringNumber(
                result.meanVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Velocity Head"
              value={formatEngineeringNumber(
                result.velocityHead,
              )}
              unit="m"
            />

            <ResultItem
              label="Calculated Specific Energy"
              value={formatEngineeringNumber(
                result.calculatedSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Energy Residual"
              value={formatEngineeringNumber(
                result.energyResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Relation Residual"
              value={formatEngineeringNumber(
                result.criticalRelationResidual,
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

            <ResultItem
              label="Hydraulic Power"
              value={formatEngineeringNumber(
                result.hydraulicPower,
              )}
              unit="W"
            />

            <ResultItem
              label="Depth Energy Fraction"
              value={formatEngineeringNumber(
                result.depthEnergyFraction,
              )}
              unit="-"
            />

            <ResultItem
              label="Velocity Energy Fraction"
              value={formatEngineeringNumber(
                result.velocityEnergyFraction,
              )}
              unit="-"
            />

            <ResultItem
              label="Root Iterations"
              value={formatEngineeringNumber(
                result.rootIterations,
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
              Export capacity CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
