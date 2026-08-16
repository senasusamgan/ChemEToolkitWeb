import {
  useState,
} from 'react'

import {
  PartiallyFullCircularChannelMinimumDiameterSpecificEnergyError,
  calculatePartiallyFullCircularChannelMinimumDiameterSpecificEnergy,
  createPartiallyFullCircularChannelMinimumDiameterSpecificEnergyCsv,
} from './engine'

import type {
  PartiallyFullCircularChannelMinimumDiameterSpecificEnergyInput,
  PartiallyFullCircularChannelMinimumDiameterSpecificEnergyResult,
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
  requiredDischarge:
    '1.0',

  availableSpecificEnergy:
    '0.8',

  fluidDensity:
    '998',
}


type FormField =
  keyof typeof exampleForm


const fields = [
  [
    'requiredDischarge',
    'Required Discharge',
    'Qreq',
    'm³/s',
  ],
  [
    'availableSpecificEnergy',
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


export function PartiallyFullCircularChannelMinimumDiameterSpecificEnergyCalculator() {
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
    PartiallyFullCircularChannelMinimumDiameterSpecificEnergyResult | null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    PartiallyFullCircularChannelMinimumDiameterSpecificEnergyInput | null
  >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')


  function calculate() {
    try {
      const input:
        PartiallyFullCircularChannelMinimumDiameterSpecificEnergyInput = {
        requiredDischarge:
          Number(
            form.requiredDischarge,
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
        calculatePartiallyFullCircularChannelMinimumDiameterSpecificEnergy(
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
          PartiallyFullCircularChannelMinimumDiameterSpecificEnergyError
          ? error.message
          : 'Minimum circular-channel diameter could not be solved.',
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
      requiredDischarge: '',
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
      createPartiallyFullCircularChannelMinimumDiameterSpecificEnergyCsv(
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
      'circular-channel-minimum-diameter-specific-energy.csv'

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
        code="FM–88"
        icon="⌀"
        title="Partially Full Circular Channel Minimum Diameter for Required Discharge & Specific Energy"
        subtitle="Size the minimum circular conduit that can carry a required discharge within a fixed specific-energy budget"
      />

      <ReferenceBasis>
        Calculator 471 inverts Calculator 470.
        Each trial diameter is evaluated at its
        maximum critical-flow capacity for the
        available specific energy. Bisection then
        finds the minimum diameter whose capacity
        reaches the required discharge.
      </ReferenceBasis>

      <div className="native-formula">
        Qmax(D, E) =
        Qreq
        {'   '}
        at
        {'   '}
        Fr = 1
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
        calculateLabel="Size minimum diameter"
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
            headlineLabel="Minimum circular-channel diameter"
            headlineValue={`${formatEngineeringNumber(
              result.minimumDiameter,
            )} m`}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Required Discharge"
              value={formatEngineeringNumber(
                result.requiredDischarge,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Design Critical-Flow Capacity"
              value={formatEngineeringNumber(
                result.designCapacity,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Capacity Residual"
              value={formatEngineeringNumber(
                result.capacityResidual,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Capacity Utilization"
              value={formatEngineeringNumber(
                result.capacityUtilization,
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
              label="Critical Depth"
              value={formatEngineeringNumber(
                result.criticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Depth / Diameter"
              value={formatEngineeringNumber(
                result.criticalDepthRatio,
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
              label="Diameter / Specific Energy"
              value={formatEngineeringNumber(
                result.diameterSpecificEnergyRatio,
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
              label="Froude Number"
              value={formatEngineeringNumber(
                result.froudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Velocity Head"
              value={formatEngineeringNumber(
                result.velocityHead,
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
              label="Diameter Iterations"
              value={formatEngineeringNumber(
                result.diameterIterations,
              )}
              unit="-"
            />

            <ResultItem
              label="Capacity Solver Calls"
              value={formatEngineeringNumber(
                result.capacitySolverCalls,
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
              Export diameter-design CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
