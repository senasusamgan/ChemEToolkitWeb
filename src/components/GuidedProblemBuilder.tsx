import {
  useMemo,
  useState,
} from 'react'

import '../styles/guided-problem-builder.css'

interface BuilderVariable {
  symbol: string
  label: string
  unit: string
  sample: string
}

interface BuilderPreset {
  id: string
  title: string
  category: string
  equation: string
  description: string
  defaultTarget: string
  variables:
    BuilderVariable[]
}

interface GuidedProblemBuilderProps {
  isOpen: boolean
  onClose: () => void
  onUseProblem: (
    problem: string,
  ) => void
}

const BUILDER_PRESETS:
  BuilderPreset[] = [
    {
      id:
        'ideal-gas',
      title:
        'Ideal gas law',
      category:
        'Thermodynamics',
      equation:
        'PV=nRT',
      description:
        'Solve pressure, volume, gas amount or absolute temperature.',
      defaultTarget:
        'V',
      variables: [
        {
          symbol:
            'P',
          label:
            'Absolute pressure',
          unit:
            'Pa',
          sample:
            '101325',
        },
        {
          symbol:
            'V',
          label:
            'Gas volume',
          unit:
            'm3',
          sample:
            '0.0246',
        },
        {
          symbol:
            'n',
          label:
            'Amount of gas',
          unit:
            'mol',
          sample:
            '1',
        },
        {
          symbol:
            'T',
          label:
            'Absolute temperature',
          unit:
            'K',
          sample:
            '300',
        },
      ],
    },
    {
      id:
        'reynolds-number',
      title:
        'Reynolds number',
      category:
        'Fluid Mechanics',
      equation:
        'Re=ρvD/μ',
      description:
        'Determine flow regime from density, velocity, diameter and viscosity.',
      defaultTarget:
        'Re',
      variables: [
        {
          symbol:
            'Re',
          label:
            'Reynolds number',
          unit:
            '',
          sample:
            '99800',
        },
        {
          symbol:
            'ρ',
          label:
            'Fluid density',
          unit:
            'kg/m3',
          sample:
            '998',
        },
        {
          symbol:
            'v',
          label:
            'Average velocity',
          unit:
            'm/s',
          sample:
            '2',
        },
        {
          symbol:
            'D',
          label:
            'Pipe diameter',
          unit:
            'm',
          sample:
            '0.05',
        },
        {
          symbol:
            'μ',
          label:
            'Dynamic viscosity',
          unit:
            'Pa s',
          sample:
            '0.001',
        },
      ],
    },
    {
      id:
        'flow-continuity',
      title:
        'Flow continuity',
      category:
        'Fluid Mechanics',
      equation:
        'Q=Av',
      description:
        'Solve volumetric flow rate, flow area or average velocity.',
      defaultTarget:
        'v',
      variables: [
        {
          symbol:
            'Q',
          label:
            'Volumetric flow rate',
          unit:
            'm3/s',
          sample:
            '0.02',
        },
        {
          symbol:
            'A',
          label:
            'Flow area',
          unit:
            'm2',
          sample:
            '0.01',
        },
        {
          symbol:
            'v',
          label:
            'Average velocity',
          unit:
            'm/s',
          sample:
            '2',
        },
      ],
    },
    {
      id:
        'darcy-weisbach',
      title:
        'Darcy–Weisbach pressure drop',
      category:
        'Fluid Mechanics',
      equation:
        'ΔP=f(L/D)(ρv²/2)',
      description:
        'Calculate pipe pressure loss or inspect one of its governing variables.',
      defaultTarget:
        'ΔP',
      variables: [
        {
          symbol:
            'ΔP',
          label:
            'Pressure difference',
          unit:
            'Pa',
          sample:
            '4000',
        },
        {
          symbol:
            'f',
          label:
            'Darcy friction factor',
          unit:
            '',
          sample:
            '0.02',
        },
        {
          symbol:
            'L',
          label:
            'Pipe length',
          unit:
            'm',
          sample:
            '10',
        },
        {
          symbol:
            'D',
          label:
            'Pipe diameter',
          unit:
            'm',
          sample:
            '0.1',
        },
        {
          symbol:
            'ρ',
          label:
            'Fluid density',
          unit:
            'kg/m3',
          sample:
            '1000',
        },
        {
          symbol:
            'v',
          label:
            'Average velocity',
          unit:
            'm/s',
          sample:
            '2',
        },
      ],
    },
  ]

function findPreset(
  presetId: string,
): BuilderPreset {
  return (
    BUILDER_PRESETS.find(
      (preset) =>
        preset.id ===
        presetId,
    ) ??
    BUILDER_PRESETS[0]
  )
}

function emptyValues(
  preset: BuilderPreset,
): Record<string, string> {
  return Object.fromEntries(
    preset.variables.map(
      (variable) => [
        variable.symbol,
        '',
      ],
    ),
  )
}

export function GuidedProblemBuilder({
  isOpen,
  onClose,
  onUseProblem,
}: GuidedProblemBuilderProps) {
  const [
    selectedPresetId,
    setSelectedPresetId,
  ] = useState(
    BUILDER_PRESETS[0].id,
  )

  const preset =
    useMemo(
      () =>
        findPreset(
          selectedPresetId,
        ),
      [
        selectedPresetId,
      ],
    )

  const [
    targetSymbol,
    setTargetSymbol,
  ] = useState(
    BUILDER_PRESETS[0]
      .defaultTarget,
  )

  const [
    values,
    setValues,
  ] = useState<
    Record<string, string>
  >(
    () =>
      emptyValues(
        BUILDER_PRESETS[0],
      ),
  )

  const [
    validationMessage,
    setValidationMessage,
  ] = useState('')

  const requiredVariables =
    useMemo(
      () =>
        preset.variables.filter(
          (variable) =>
            variable.symbol !==
            targetSymbol,
        ),
      [
        preset,
        targetSymbol,
      ],
    )

  const completedCount =
    requiredVariables.filter(
      (variable) =>
        (
          values[
            variable.symbol
          ] ??
          ''
        )
          .trim()
          .length >
        0,
    ).length

  const isComplete =
    requiredVariables.length >
      0 &&
    completedCount ===
      requiredVariables.length

  const generatedProblem =
    useMemo(
      () => {
        const assignments =
          preset.variables
            .filter(
              (variable) =>
                variable.symbol !==
                targetSymbol,
            )
            .map(
              (variable) => {
                const value =
                  (
                    values[
                      variable.symbol
                    ] ??
                    ''
                  ).trim()

                const displayedValue =
                  value ||
                  '?'

                return [
                  `${variable.symbol}=${displayedValue}`,
                  variable.unit,
                ]
                  .filter(
                    Boolean,
                  )
                  .join(
                    ' ',
                  )
              },
            )

        return [
          preset.equation,
          ...assignments,
          `${targetSymbol}=?`,
        ].join(
          '; ',
        )
      },
      [
        preset,
        targetSymbol,
        values,
      ],
    )

  if (!isOpen) {
    return null
  }

  function changePreset(
    nextPresetId: string,
  ) {
    const nextPreset =
      findPreset(
        nextPresetId,
      )

    setSelectedPresetId(
      nextPreset.id,
    )

    setTargetSymbol(
      nextPreset.defaultTarget,
    )

    setValues(
      emptyValues(
        nextPreset,
      ),
    )

    setValidationMessage(
      '',
    )
  }

  function changeTarget(
    nextTarget: string,
  ) {
    setTargetSymbol(
      nextTarget,
    )

    setValues(
      (currentValues) => ({
        ...currentValues,
        [nextTarget]:
          '',
      }),
    )

    setValidationMessage(
      '',
    )
  }

  function updateValue(
    symbol: string,
    value: string,
  ) {
    setValues(
      (currentValues) => ({
        ...currentValues,
        [symbol]:
          value,
      }),
    )

    setValidationMessage(
      '',
    )
  }

  function fillSampleValues() {
    setValues(
      Object.fromEntries(
        preset.variables.map(
          (variable) => [
            variable.symbol,
            variable.symbol ===
              targetSymbol
              ? ''
              : variable.sample,
          ],
        ),
      ),
    )

    setValidationMessage(
      'Sample engineering values loaded.',
    )
  }

  function clearValues() {
    setValues(
      emptyValues(
        preset,
      ),
    )

    setValidationMessage(
      'Input fields cleared.',
    )
  }

  function useGeneratedProblem() {
    if (!isComplete) {
      setValidationMessage(
        'Complete every known variable before using this problem.',
      )
      return
    }

    onUseProblem(
      generatedProblem,
    )

    setValidationMessage(
      '',
    )

    onClose()
  }

  return (
    <section
      className="guided-problem-builder"
      aria-labelledby="guided-problem-builder-title"
    >
      <header className="guided-problem-builder-header">
        <div>
          <span>
            No equation typing required
          </span>

          <h3 id="guided-problem-builder-title">
            Guided input builder
          </h3>

          <p>
            Select an engineering model, choose the
            unknown and enter the known variables.
          </p>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
        >
          Close builder
        </button>
      </header>

      <div className="guided-problem-builder-layout">
        <aside className="guided-problem-models">
          <span>
            Engineering model
          </span>

          <div>
            {BUILDER_PRESETS.map(
              (availablePreset) => (
                <button
                  key={
                    availablePreset.id
                  }
                  type="button"
                  className={
                    availablePreset.id ===
                    preset.id
                      ? 'is-active'
                      : undefined
                  }
                  onClick={() =>
                    changePreset(
                      availablePreset.id,
                    )
                  }
                >
                  <strong>
                    {
                      availablePreset.title
                    }
                  </strong>

                  <small>
                    {
                      availablePreset.category
                    }
                  </small>

                  <code>
                    {
                      availablePreset.equation
                    }
                  </code>
                </button>
              ),
            )}
          </div>
        </aside>

        <div className="guided-problem-fields">
          <div className="guided-problem-model-summary">
            <div>
              <span>
                Selected equation
              </span>

              <strong>
                {preset.title}
              </strong>

              <code>
                {preset.equation}
              </code>
            </div>

            <p>
              {preset.description}
            </p>
          </div>

          <label
            className="guided-problem-target"
            htmlFor="guided-problem-target"
          >
            <span>
              Solve for
            </span>

            <select
              id="guided-problem-target"
              value={
                targetSymbol
              }
              onChange={(event) =>
                changeTarget(
                  event.target.value,
                )
              }
            >
              {preset.variables.map(
                (variable) => (
                  <option
                    key={
                      variable.symbol
                    }
                    value={
                      variable.symbol
                    }
                  >
                    {variable.symbol}
                    {' — '}
                    {variable.label}
                  </option>
                ),
              )}
            </select>
          </label>

          <div className="guided-problem-variable-grid">
            {preset.variables.map(
              (variable) => {
                const isTarget =
                  variable.symbol ===
                  targetSymbol

                return (
                  <label
                    key={
                      variable.symbol
                    }
                    className={
                      isTarget
                        ? 'is-target'
                        : undefined
                    }
                  >
                    <span>
                      <b>
                        {variable.symbol}
                      </b>

                      {variable.label}
                    </span>

                    {isTarget ? (
                      <div className="guided-problem-unknown">
                        Unknown
                      </div>
                    ) : (
                      <div className="guided-problem-value-input">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={
                            values[
                              variable.symbol
                            ] ??
                            ''
                          }
                          placeholder={
                            variable.sample
                          }
                          onChange={(event) =>
                            updateValue(
                              variable.symbol,
                              event.target.value,
                            )
                          }
                        />

                        {variable.unit ? (
                          <span>
                            {variable.unit}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </label>
                )
              },
            )}
          </div>

          <div className="guided-problem-progress">
            <div>
              <span>
                Input completion
              </span>

              <strong>
                {completedCount}
                {' / '}
                {
                  requiredVariables.length
                }
              </strong>
            </div>

            <progress
              max={
                requiredVariables.length
              }
              value={
                completedCount
              }
            />
          </div>

          <div className="guided-problem-preview">
            <span>
              Generated problem
            </span>

            <code>
              {generatedProblem}
            </code>
          </div>

          {validationMessage ? (
            <p
              className="guided-problem-message"
              role="status"
            >
              {validationMessage}
            </p>
          ) : null}

          <footer className="guided-problem-actions">
            <div>
              <button
                type="button"
                onClick={
                  fillSampleValues
                }
              >
                Fill sample values
              </button>

              <button
                type="button"
                onClick={
                  clearValues
                }
              >
                Clear fields
              </button>
            </div>

            <button
              type="button"
              className="is-primary"
              disabled={
                !isComplete
              }
              onClick={
                useGeneratedProblem
              }
            >
              Use in solver →
            </button>
          </footer>
        </div>
      </div>
    </section>
  )
}
