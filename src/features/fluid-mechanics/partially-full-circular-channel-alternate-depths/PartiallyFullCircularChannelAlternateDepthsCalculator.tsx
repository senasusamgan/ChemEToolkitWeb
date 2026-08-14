import {
  useState,
} from 'react'

import {
  PartiallyFullCircularChannelAlternateDepthsError,
  calculatePartiallyFullCircularChannelAlternateDepths,
  createPartiallyFullCircularChannelAlternateDepthsCsv,
} from './engine'

import type {
  PartiallyFullCircularChannelAlternateDepthsInput,
  PartiallyFullCircularChannelAlternateDepthsResult,
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

  specificEnergy:
    '1',

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
      'specificEnergy',

    label:
      'Specific Energy',

    symbol:
      'E',

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


export function PartiallyFullCircularChannelAlternateDepthsCalculator() {
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
      PartiallyFullCircularChannelAlternateDepthsResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      PartiallyFullCircularChannelAlternateDepthsInput | null
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
    PartiallyFullCircularChannelAlternateDepthsInput {
    return {
      pipeDiameter:
        Number(
          form.pipeDiameter,
        ),

      volumetricFlowRate:
        Number(
          form.volumetricFlowRate,
        ),

      specificEnergy:
        Number(
          form.specificEnergy,
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
        calculatePartiallyFullCircularChannelAlternateDepths(
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
          PartiallyFullCircularChannelAlternateDepthsError
          ? error.message
          : 'Circular-channel alternate depths could not be solved.',
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
      createPartiallyFullCircularChannelAlternateDepthsCsv(
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
      'partially-full-circular-channel-alternate-depths.csv'

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
        code="FM–75"
        icon="≈"
        title="Partially Full Circular Channel Alternate Depths from Specific Energy"
        subtitle="Solve shallow supercritical and deep subcritical circular-channel depths that share the same discharge and specific energy"
      />

      <ReferenceBasis>
        Calculator 458 uses Calculator 457
        to determine the minimum specific
        energy and critical depth. It then
        searches the shallow and deep sides
        of the specific-energy curve for
        physically valid free-surface roots.
      </ReferenceBasis>

      <div className="native-formula">
        E =
        y +
        Q² / (2gA²)
        {'   → solve for y'}
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
        calculateLabel="Solve alternate depths"
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
            headlineLabel="Shallow alternate depth"
            headlineValue={`${formatEngineeringNumber(
              result.shallowSolution.flowDepth,
            )} m`}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Solution Multiplicity"
              value={
                result.solutionMultiplicity
              }
              unit=""
            />

            <ResultItem
              label="Critical Depth"
              value={formatEngineeringNumber(
                result.criticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Specific Energy"
              value={formatEngineeringNumber(
                result.criticalSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Energy Above Critical"
              value={formatEngineeringNumber(
                result.energyExcessAboveCritical,
              )}
              unit="m"
            />

            <ResultItem
              label="Full-Depth Limit Specific Energy"
              value={formatEngineeringNumber(
                result.fullDepthLimitSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Shallow Depth Ratio y/D"
              value={formatEngineeringNumber(
                result.shallowSolution.depthRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Shallow Velocity"
              value={formatEngineeringNumber(
                result.shallowSolution.meanVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Shallow Froude Number"
              value={formatEngineeringNumber(
                result.shallowSolution.froudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Shallow Flow Regime"
              value={
                result.shallowSolution.flowRegime
              }
              unit=""
            />

            <ResultItem
              label="Shallow Energy Residual"
              value={formatEngineeringNumber(
                result.shallowSolution.specificEnergyResidual,
              )}
              unit="m"
            />

            {result.deepSolution ? (
              <>
                <ResultItem
                  label="Deep Alternate Depth"
                  value={formatEngineeringNumber(
                    result.deepSolution.flowDepth,
                  )}
                  unit="m"
                />

                <ResultItem
                  label="Deep Depth Ratio y/D"
                  value={formatEngineeringNumber(
                    result.deepSolution.depthRatio,
                  )}
                  unit="-"
                />

                <ResultItem
                  label="Deep Velocity"
                  value={formatEngineeringNumber(
                    result.deepSolution.meanVelocity,
                  )}
                  unit="m/s"
                />

                <ResultItem
                  label="Deep Froude Number"
                  value={formatEngineeringNumber(
                    result.deepSolution.froudeNumber,
                  )}
                  unit="-"
                />

                <ResultItem
                  label="Deep Flow Regime"
                  value={
                    result.deepSolution.flowRegime
                  }
                  unit=""
                />

                <ResultItem
                  label="Alternate Depth Separation"
                  value={formatEngineeringNumber(
                    result.alternateDepthSeparation!,
                  )}
                  unit="m"
                />
              </>
            ) : null}

            <ResultItem
              label="E / Ec"
              value={formatEngineeringNumber(
                result.requestedEnergyToCriticalRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="E / Ecrown"
              value={formatEngineeringNumber(
                result.requestedEnergyToFullDepthLimitRatio,
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
