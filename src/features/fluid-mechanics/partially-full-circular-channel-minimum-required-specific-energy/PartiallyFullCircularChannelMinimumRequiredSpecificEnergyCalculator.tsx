import {
  useState,
} from 'react'

import {
  PartiallyFullCircularChannelMinimumRequiredSpecificEnergyError,
  calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy,
  createPartiallyFullCircularChannelMinimumRequiredSpecificEnergyCsv,
} from './engine'

import type {
  PartiallyFullCircularChannelMinimumRequiredSpecificEnergyInput,
  PartiallyFullCircularChannelMinimumRequiredSpecificEnergyResult,
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

  requiredDischarge:
    '1.0',

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
    'requiredDischarge',
    'Required Discharge',
    'Q',
    'm³/s',
  ],
  [
    'fluidDensity',
    'Fluid Density',
    'ρ',
    'kg/m³',
  ],
] as const


export function PartiallyFullCircularChannelMinimumRequiredSpecificEnergyCalculator() {
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
    PartiallyFullCircularChannelMinimumRequiredSpecificEnergyResult | null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    PartiallyFullCircularChannelMinimumRequiredSpecificEnergyInput | null
  >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')


  function calculate() {
    try {
      const input:
        PartiallyFullCircularChannelMinimumRequiredSpecificEnergyInput = {
        pipeDiameter:
          Number(
            form.pipeDiameter,
          ),

        requiredDischarge:
          Number(
            form.requiredDischarge,
          ),

        fluidDensity:
          Number(
            form.fluidDensity,
          ),
      }

      const next =
        calculatePartiallyFullCircularChannelMinimumRequiredSpecificEnergy(
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
          PartiallyFullCircularChannelMinimumRequiredSpecificEnergyError
          ? error.message
          : 'Minimum required specific energy could not be solved.',
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
      requiredDischarge: '',
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
      createPartiallyFullCircularChannelMinimumRequiredSpecificEnergyCsv(
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
      'circular-channel-minimum-required-specific-energy.csv'

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
        code="FM–89"
        icon="≈"
        title="Partially Full Circular Channel Minimum Specific Energy for Required Discharge"
        subtitle="Determine the theoretical minimum energy needed to convey a specified discharge through a fixed circular conduit"
      />

      <ReferenceBasis>
        Calculator 472 uses Calculator 457 to
        determine critical depth for the specified
        diameter and discharge. Since specific
        energy reaches its minimum at critical flow,
        the required minimum is Emin = yc +
        Vc²/(2g).
      </ReferenceBasis>

      <div className="native-formula">
        Emin =
        yc +
        Vc²/(2g)
        {'   '}
        ·
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
              key={key}
              label={label}
              symbol={symbol}
              value={
                form[
                  key as FormField
                ]
              }
              unit={unit}
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
        calculateLabel="Calculate minimum energy"
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
            headlineLabel="Minimum required specific energy"
            headlineValue={`${formatEngineeringNumber(
              result.minimumSpecificEnergy,
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
              label="Geometry-Based Critical Energy"
              value={formatEngineeringNumber(
                result.criticalGeometrySpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Energy Closure Residual"
              value={formatEngineeringNumber(
                result.specificEnergyClosureResidual,
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
              label="Central Angle"
              value={formatEngineeringNumber(
                result.centralAngleDegrees,
              )}
              unit="deg"
            />
          </ResultPanel>

          <div className="native-actions">
            <button
              type="button"
              onClick={
                exportCsv
              }
            >
              Export energy-design CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
