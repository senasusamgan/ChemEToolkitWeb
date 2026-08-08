import {
  useState,
} from 'react'

import {
  PackedColumnRedistributorError,
  calculatePackedColumnRedistributorSpacing,
  createPackedColumnRedistributorCsv,
} from './engine'

import type {
  PackedColumnRedistributorInput,
  PackedColumnRedistributorResult,
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
  packedBedHeight: '12',
  columnDiameter: '2',
  maximumSectionHeight: '5',
}

type FormField =
  keyof typeof exampleForm

export function PackedColumnRedistributorCalculator() {
  const [
    form,
    setForm,
  ] = useState(exampleForm)

  const [
    result,
    setResult,
  ] = useState<
    PackedColumnRedistributorResult | null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    PackedColumnRedistributorInput | null
  >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  function updateField(
    field: FormField,
  ) {
    return (
      value: string,
    ) => {
      setForm(
        current => ({
          ...current,
          [field]: value,
        }),
      )
    }
  }

  function currentInput():
    PackedColumnRedistributorInput {
    return {
      packedBedHeight:
        Number(
          form.packedBedHeight,
        ),

      columnDiameter:
        Number(
          form.columnDiameter,
        ),

      maximumSectionHeight:
        Number(
          form.maximumSectionHeight,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const nextResult =
        calculatePackedColumnRedistributorSpacing(
          input,
        )

      setResult(nextResult)
      setCalculatedInput(input)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setCalculatedInput(null)

      setErrorMessage(
        error instanceof
          PackedColumnRedistributorError
          ? error.message
          : 'The packed-column redistributor calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setForm(exampleForm)
    setResult(null)
    setCalculatedInput(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setForm({
      packedBedHeight: '',
      columnDiameter: '',
      maximumSectionHeight: '',
    })

    setResult(null)
    setCalculatedInput(null)
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
      createPackedColumnRedistributorCsv(
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
      URL.createObjectURL(blob)

    const link =
      document.createElement('a')

    link.href = url

    link.download =
      'packed-column-redistributor-spacing.csv'

    document.body.appendChild(link)

    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–50"
        icon="⌄"
        title="Packed Column Redistributor Spacing & Count"
        subtitle="Packed-bed segmentation, redistributor count and elevation screening"
      />

      <ReferenceBasis>
        Geometric packed-bed screening
        based on total packing height
        and a user-defined maximum
        uninterrupted packed section height.
      </ReferenceBasis>

      <div className="native-formula">
        Nsec = ceil(Hp/Hmax) ·
        Nred = max(Nsec − 1, 0) ·
        Hsec = Hp/Nsec
      </div>

      <div className="native-input-grid">
        <NumericInput
          label="Packed Bed Height"
          symbol="Hp"
          value={
            form.packedBedHeight
          }
          unit="m"
          onChange={
            updateField(
              'packedBedHeight',
            )
          }
        />

        <NumericInput
          label="Column Diameter"
          symbol="D"
          value={
            form.columnDiameter
          }
          unit="m"
          onChange={
            updateField(
              'columnDiameter',
            )
          }
        />

        <NumericInput
          label="Maximum Section Height"
          symbol="Hmax"
          value={
            form.maximumSectionHeight
          }
          unit="m"
          onChange={
            updateField(
              'maximumSectionHeight',
            )
          }
        />
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
        calculateLabel="Evaluate redistributors"
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
            headlineLabel="Required redistributors"
            headlineValue={
              String(
                result
                  .requiredRedistributorCount,
              )
            }
            modelName={
              result.modelName
            }
            note={
              result
                .limitationDescription
            }
          >
            <ResultItem
              label="Required Bed Sections"
              value={
                String(
                  result
                    .requiredBedSections,
                )
              }
              unit="sections"
            />

            <ResultItem
              label="Column Area"
              value={
                formatEngineeringNumber(
                  result.columnArea,
                )
              }
              unit="m²"
            />

            <ResultItem
              label="Total Packing Volume"
              value={
                formatEngineeringNumber(
                  result
                    .totalPackingVolume,
                )
              }
              unit="m³"
            />

            <ResultItem
              label="Actual Section Height"
              value={
                formatEngineeringNumber(
                  result
                    .actualSectionHeight,
                )
              }
              unit="m"
            />

            <ResultItem
              label="Section Packing Volume"
              value={
                formatEngineeringNumber(
                  result
                    .sectionPackingVolume,
                )
              }
              unit="m³"
            />

            <ResultItem
              label="Section Height Utilization"
              value={
                formatEngineeringNumber(
                  result
                    .sectionHeightUtilization *
                  100,
                )
              }
              unit="% of maximum"
            />
          </ResultPanel>

          <div className="native-result-panel">
            <div className="native-result-heading">
              <div>
                <p>
                  Redistributor layout
                </p>

                <strong>
                  Bed segmentation elevations
                </strong>
              </div>

              <span>
                Elevations are measured
                upward from the bottom
                of the packed bed.
              </span>
            </div>

            {result
              .redistributorElevations
              .length > 0 ? (
              <ol className="native-stage-list">
                {result
                  .redistributorElevations
                  .map(
                    (
                      elevation,
                      index,
                    ) => (
                      <li key={elevation}>
                        <strong>
                          Redistributor {
                            index + 1
                          }
                        </strong>

                        {' — elevation = '}

                        {
                          formatEngineeringNumber(
                            elevation,
                          )
                        } m
                      </li>
                    ),
                  )}
              </ol>
            ) : (
              <p>
                No internal redistributor
                is required by the selected
                maximum section-height
                criterion.
              </p>
            )}
          </div>

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
