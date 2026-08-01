import {
  useMemo,
  useState,
} from 'react'

import '../styles/missing-input-assistant.css'

interface MissingInputAssistantProps {
  calculatorTitle: string
  targetName:
    string | null
  baseQuery: string
  missingVariables: string[]
  onApplyProblem: (
    completedProblem: string,
  ) => void
}

interface VariableProfile {
  names: string[]
  symbol: string
  unit: string
  sample: string
  description: string
}

interface MissingInputField {
  name: string
  symbol: string
  value: string
  unit: string
  sample: string
  description: string
}

const VARIABLE_PROFILES:
  VariableProfile[] = [
    {
      names: [
        'absolute pressure',
        'pressure',
      ],
      symbol:
        'P',
      unit:
        'Pa',
      sample:
        '101325',
      description:
        'Use absolute pressure unless the equation explicitly requires gauge pressure.',
    },
    {
      names: [
        'gas volume',
        'volume',
      ],
      symbol:
        'V',
      unit:
        'm3',
      sample:
        '0.0246',
      description:
        'Enter the gas or control-volume size.',
    },
    {
      names: [
        'amount of gas',
        'amount',
      ],
      symbol:
        'n',
      unit:
        'mol',
      sample:
        '1',
      description:
        'Amount of substance in moles.',
    },
    {
      names: [
        'absolute temperature',
        'temperature',
      ],
      symbol:
        'T',
      unit:
        'K',
      sample:
        '300',
      description:
        'Thermodynamic temperature must normally be entered in kelvin.',
    },
    {
      names: [
        'Reynolds number',
      ],
      symbol:
        'Re',
      unit:
        '',
      sample:
        '100000',
      description:
        'Dimensionless flow-regime indicator.',
    },
    {
      names: [
        'fluid density',
        'density',
      ],
      symbol:
        'ρ',
      unit:
        'kg/m3',
      sample:
        '998',
      description:
        'Fluid mass per unit volume.',
    },
    {
      names: [
        'velocity',
        'average velocity',
      ],
      symbol:
        'v',
      unit:
        'm/s',
      sample:
        '2',
      description:
        'Average bulk-flow velocity.',
    },
    {
      names: [
        'pipe diameter',
        'diameter',
      ],
      symbol:
        'D',
      unit:
        'm',
      sample:
        '0.05',
      description:
        'Use the internal hydraulic diameter.',
    },
    {
      names: [
        'dynamic viscosity',
        'viscosity',
      ],
      symbol:
        'μ',
      unit:
        'Pa s',
      sample:
        '0.001',
      description:
        'Dynamic viscosity of the fluid.',
    },
    {
      names: [
        'volumetric flow rate',
        'flow rate',
      ],
      symbol:
        'Q',
      unit:
        'm3/s',
      sample:
        '0.02',
      description:
        'Volume transported per unit time.',
    },
    {
      names: [
        'flow area',
      ],
      symbol:
        'A',
      unit:
        'm2',
      sample:
        '0.01',
      description:
        'Cross-sectional area normal to the flow.',
    },
    {
      names: [
        'pressure difference',
      ],
      symbol:
        'ΔP',
      unit:
        'Pa',
      sample:
        '4000',
      description:
        'Pressure loss or pressure change across the system.',
    },
    {
      names: [
        'friction factor',
      ],
      symbol:
        'f',
      unit:
        '',
      sample:
        '0.02',
      description:
        'Dimensionless Darcy friction factor.',
    },
    {
      names: [
        'pipe length',
      ],
      symbol:
        'L',
      unit:
        'm',
      sample:
        '10',
      description:
        'Length of the evaluated pipe section.',
    },
    {
      names: [
        'pump power',
      ],
      symbol:
        'W',
      unit:
        'W',
      sample:
        '1500',
      description:
        'Mechanical or shaft-power requirement.',
    },
    {
      names: [
        'total head',
      ],
      symbol:
        'H',
      unit:
        'm',
      sample:
        '20',
      description:
        'Total pump head expressed as fluid-column height.',
    },
    {
      names: [
        'pump efficiency',
        'efficiency',
      ],
      symbol:
        'η',
      unit:
        '',
      sample:
        '0.8',
      description:
        'Enter efficiency as a decimal fraction between 0 and 1.',
    },
    {
      names: [
        'heat-transfer rate',
        'heat transfer rate',
      ],
      symbol:
        'Q',
      unit:
        'W',
      sample:
        '10000',
      description:
        'Thermal energy transferred per unit time.',
    },
    {
      names: [
        'overall heat-transfer coefficient',
        'overall heat transfer coefficient',
      ],
      symbol:
        'U',
      unit:
        'W/(m2 K)',
      sample:
        '500',
      description:
        'Overall conductance based on the selected heat-transfer area.',
    },
    {
      names: [
        'heat-transfer area',
        'heat transfer area',
      ],
      symbol:
        'A',
      unit:
        'm2',
      sample:
        '12',
      description:
        'Effective exchanger surface area.',
    },
    {
      names: [
        'log-mean temperature difference',
        'log mean temperature difference',
      ],
      symbol:
        'ΔTlm',
      unit:
        'K',
      sample:
        '25',
      description:
        'Log-mean temperature driving force.',
    },
    {
      names: [
        'molar flux',
      ],
      symbol:
        'J',
      unit:
        'mol/(m2 s)',
      sample:
        '0.001',
      description:
        'Molar transfer rate per unit area.',
    },
    {
      names: [
        'diffusivity',
      ],
      symbol:
        'D',
      unit:
        'm2/s',
      sample:
        '1e-9',
      description:
        'Molecular or effective diffusion coefficient.',
    },
    {
      names: [
        'concentration difference',
      ],
      symbol:
        'ΔC',
      unit:
        'mol/m3',
      sample:
        '100',
      description:
        'Concentration driving force across the diffusion distance.',
    },
    {
      names: [
        'diffusion length',
      ],
      symbol:
        'L',
      unit:
        'm',
      sample:
        '0.001',
      description:
        'Characteristic diffusion path length.',
    },
  ]

function normalizeName(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase(
      'en-US',
    )
    .replace(
      /[–—−]/g,
      '-',
    )
    .replace(
      /\s+/g,
      ' ',
    )
}

function findVariableProfile(
  variableName: string,
  index: number,
): VariableProfile {
  const normalizedName =
    normalizeName(
      variableName,
    )

  const matchedProfile =
    VARIABLE_PROFILES.find(
      (profile) =>
        profile.names.some(
          (name) =>
            normalizeName(
              name,
            ) ===
            normalizedName,
        ),
    )

  if (matchedProfile) {
    return matchedProfile
  }

  return {
    names: [
      variableName,
    ],
    symbol:
      `input${index + 1}`,
    unit:
      '',
    sample:
      '1',
    description:
      'Confirm the variable symbol and engineering unit before solving.',
  }
}

function createFields(
  missingVariables: string[],
): MissingInputField[] {
  return missingVariables.map(
    (
      variableName,
      index,
    ) => {
      const profile =
        findVariableProfile(
          variableName,
          index,
        )

      return {
        name:
          variableName,
        symbol:
          profile.symbol,
        value:
          '',
        unit:
          profile.unit,
        sample:
          profile.sample,
        description:
          profile.description,
      }
    },
  )
}

function appendAssignments(
  baseQuery: string,
  fields:
    MissingInputField[],
): string {
  const assignments =
    fields.map(
      (field) =>
        [
          `${field.symbol}=${field.value.trim()}`,
          field.unit.trim(),
        ]
          .filter(
            Boolean,
          )
          .join(
            ' ',
          ),
    )

  const cleanQuery =
    baseQuery
      .trim()
      .replace(
        /[;\s]+$/,
        '',
      )

  return [
    cleanQuery,
    ...assignments,
  ]
    .filter(
      Boolean,
    )
    .join(
      '; ',
    )
}

export function MissingInputAssistant({
  calculatorTitle,
  targetName,
  baseQuery,
  missingVariables,
  onApplyProblem,
}: MissingInputAssistantProps) {
  const initialFields =
    useMemo(
      () =>
        createFields(
          missingVariables,
        ),
      [
        missingVariables,
      ],
    )

  const [
    fields,
    setFields,
  ] = useState<
    MissingInputField[]
  >(
    initialFields,
  )

  const [
    feedbackMessage,
    setFeedbackMessage,
  ] = useState('')

  if (
    missingVariables.length ===
    0
  ) {
    return null
  }

  const validFields =
    fields.filter(
      (field) => {
        const parsedValue =
          Number(
            field.value,
          )

        return (
          field.symbol
            .trim()
            .length >
            0 &&
          field.value
            .trim()
            .length >
            0 &&
          Number.isFinite(
            parsedValue,
          )
        )
      },
    )

  const completionPercent =
    Math.round(
      validFields.length /
        Math.max(
          1,
          fields.length,
        ) *
        100,
    )

  const generatedProblem =
    appendAssignments(
      baseQuery,
      fields,
    )

  function updateField(
    index: number,
    key:
      'symbol'
      | 'value'
      | 'unit',
    value: string,
  ) {
    setFields(
      (currentFields) =>
        currentFields.map(
          (
            field,
            fieldIndex,
          ) =>
            fieldIndex ===
            index
              ? {
                  ...field,
                  [key]:
                    value,
                }
              : field,
        ),
    )

    setFeedbackMessage(
      '',
    )
  }

  function fillExampleValues() {
    setFields(
      (currentFields) =>
        currentFields.map(
          (field) => ({
            ...field,
            value:
              field.sample,
          }),
        ),
    )

    setFeedbackMessage(
      'Example engineering values loaded. Review them before solving.',
    )
  }

  function clearInputValues() {
    setFields(
      (currentFields) =>
        currentFields.map(
          (field) => ({
            ...field,
            value:
              '',
          }),
        ),
    )

    setFeedbackMessage(
      'Missing-input values cleared.',
    )
  }

  function applyCompletedInputs() {
    if (
      validFields.length !==
      fields.length
    ) {
      setFeedbackMessage(
        'Enter a valid numeric value and symbol for every missing input.',
      )
      return
    }

    onApplyProblem(
      generatedProblem,
    )

    setFeedbackMessage(
      'Missing inputs added. Problem Solver recalculated the case.',
    )
  }

  return (
    <section
      className="missing-input-assistant"
      aria-labelledby="missing-input-assistant-title"
    >
      <header className="missing-input-assistant-header">
        <div>
          <span>
            Solver completion assistant
          </span>

          <h4 id="missing-input-assistant-title">
            Complete the missing inputs
          </h4>

          <p>
            {calculatorTitle}
            {' needs '}
            {missingVariables.length}
            {' additional '}
            {
              missingVariables.length ===
              1
                ? 'value'
                : 'values'
            }
            {
              targetName
                ? ` before solving for ${targetName}.`
                : ' before Quick Solve can run.'
            }
          </p>
        </div>

        <div className="missing-input-assistant-score">
          <strong>
            {completionPercent}%
          </strong>

          <span>
            complete
          </span>
        </div>
      </header>

      <div className="missing-input-assistant-progress">
        <div>
          <span>
            Input readiness
          </span>

          <strong>
            {validFields.length}
            {' / '}
            {fields.length}
          </strong>
        </div>

        <progress
          max={
            Math.max(
              1,
              fields.length,
            )
          }
          value={
            validFields.length
          }
        />
      </div>

      <div className="missing-input-assistant-grid">
        {fields.map(
          (
            field,
            index,
          ) => (
            <article
              key={
                field.name +
                index
              }
            >
              <header>
                <div>
                  <span>
                    Missing variable
                  </span>

                  <strong>
                    {field.name}
                  </strong>
                </div>

                <code>
                  {field.symbol}
                </code>
              </header>

              <p>
                {field.description}
              </p>

              <div className="missing-input-assistant-field-row">
                <label>
                  <span>
                    Symbol
                  </span>

                  <input
                    type="text"
                    value={
                      field.symbol
                    }
                    onChange={(event) =>
                      updateField(
                        index,
                        'symbol',
                        event
                          .target
                          .value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    Value
                  </span>

                  <input
                    type="text"
                    inputMode="decimal"
                    value={
                      field.value
                    }
                    placeholder={
                      field.sample
                    }
                    onChange={(event) =>
                      updateField(
                        index,
                        'value',
                        event
                          .target
                          .value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    Unit
                  </span>

                  <input
                    type="text"
                    value={
                      field.unit
                    }
                    placeholder="dimensionless"
                    onChange={(event) =>
                      updateField(
                        index,
                        'unit',
                        event
                          .target
                          .value,
                      )
                    }
                  />
                </label>
              </div>
            </article>
          ),
        )}
      </div>

      <div className="missing-input-assistant-preview">
        <span>
          Completed problem preview
        </span>

        <code>
          {generatedProblem}
        </code>
      </div>

      {feedbackMessage ? (
        <p
          className="missing-input-assistant-feedback"
          role="status"
        >
          {feedbackMessage}
        </p>
      ) : null}

      <footer className="missing-input-assistant-actions">
        <div>
          <button
            type="button"
            onClick={
              fillExampleValues
            }
          >
            Fill example values
          </button>

          <button
            type="button"
            onClick={
              clearInputValues
            }
          >
            Clear values
          </button>
        </div>

        <button
          type="button"
          className="is-primary"
          disabled={
            validFields.length !==
            fields.length
          }
          onClick={
            applyCompletedInputs
          }
        >
          Add inputs and solve →
        </button>
      </footer>
    </section>
  )
}
