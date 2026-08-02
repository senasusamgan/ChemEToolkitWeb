import {
  useMemo,
  useState,
} from 'react'

import '../styles/result-unit-converter-panel.css'

interface ResultUnitConverterPanelProps {
  calculatorTitle: string
  resultLabel: string
  numericValue:
    number | null
  sourceUnit: string
}

type NumberFormatMode =
  | 'engineering'
  | 'scientific'
  | 'decimal'

interface UnitOption {
  unit: string
  aliases: string[]
  toBase: (
    value: number,
  ) => number
  fromBase: (
    value: number,
  ) => number
}

interface UnitFamily {
  id: string
  label: string
  baseUnit: string
  options: UnitOption[]
}

interface ResolvedUnit {
  family: UnitFamily
  sourceOption:
    UnitOption
}

function linearOption(
  unit: string,
  aliases: string[],
  factorToBase: number,
): UnitOption {
  return {
    unit,
    aliases: [
      unit,
      ...aliases,
    ],
    toBase:
      (value) =>
        value *
        factorToBase,
    fromBase:
      (value) =>
        value /
        factorToBase,
  }
}

const UNIT_FAMILIES:
  UnitFamily[] = [
    {
      id:
        'pressure',
      label:
        'Pressure',
      baseUnit:
        'Pa',
      options: [
        linearOption(
          'Pa',
          [],
          1,
        ),
        linearOption(
          'kPa',
          [],
          1000,
        ),
        linearOption(
          'MPa',
          [],
          1e6,
        ),
        linearOption(
          'bar',
          [],
          1e5,
        ),
        linearOption(
          'mbar',
          [],
          100,
        ),
        linearOption(
          'atm',
          [],
          101325,
        ),
        linearOption(
          'psi',
          [],
          6894.757293168,
        ),
        linearOption(
          'mmHg',
          [
            'torr',
          ],
          133.3223684211,
        ),
      ],
    },
    {
      id:
        'temperature',
      label:
        'Temperature',
      baseUnit:
        'K',
      options: [
        {
          unit:
            'K',
          aliases: [
            'K',
            'kelvin',
          ],
          toBase:
            (value) =>
              value,
          fromBase:
            (value) =>
              value,
        },
        {
          unit:
            '°C',
          aliases: [
            '°C',
            'C',
            'degC',
            'celsius',
          ],
          toBase:
            (value) =>
              value +
              273.15,
          fromBase:
            (value) =>
              value -
              273.15,
        },
        {
          unit:
            '°F',
          aliases: [
            '°F',
            'F',
            'degF',
            'fahrenheit',
          ],
          toBase:
            (value) =>
              (
                value -
                32
              ) *
                5 /
                9 +
              273.15,
          fromBase:
            (value) =>
              (
                value -
                273.15
              ) *
                9 /
                5 +
              32,
        },
        {
          unit:
            '°R',
          aliases: [
            '°R',
            'R',
            'rankine',
          ],
          toBase:
            (value) =>
              value *
              5 /
              9,
          fromBase:
            (value) =>
              value *
              9 /
              5,
        },
      ],
    },
    {
      id:
        'length',
      label:
        'Length',
      baseUnit:
        'm',
      options: [
        linearOption(
          'm',
          [],
          1,
        ),
        linearOption(
          'cm',
          [],
          0.01,
        ),
        linearOption(
          'mm',
          [],
          0.001,
        ),
        linearOption(
          'km',
          [],
          1000,
        ),
        linearOption(
          'ft',
          [
            'feet',
            'foot',
          ],
          0.3048,
        ),
        linearOption(
          'in',
          [
            'inch',
            'inches',
          ],
          0.0254,
        ),
      ],
    },
    {
      id:
        'area',
      label:
        'Area',
      baseUnit:
        'm²',
      options: [
        linearOption(
          'm²',
          [
            'm2',
            'm^2',
          ],
          1,
        ),
        linearOption(
          'cm²',
          [
            'cm2',
            'cm^2',
          ],
          1e-4,
        ),
        linearOption(
          'mm²',
          [
            'mm2',
            'mm^2',
          ],
          1e-6,
        ),
        linearOption(
          'ft²',
          [
            'ft2',
            'ft^2',
          ],
          0.09290304,
        ),
        linearOption(
          'in²',
          [
            'in2',
            'in^2',
          ],
          0.00064516,
        ),
      ],
    },
    {
      id:
        'volume',
      label:
        'Volume',
      baseUnit:
        'm³',
      options: [
        linearOption(
          'm³',
          [
            'm3',
            'm^3',
          ],
          1,
        ),
        linearOption(
          'L',
          [
            'liter',
            'litre',
          ],
          0.001,
        ),
        linearOption(
          'mL',
          [
            'ml',
            'cm3',
            'cm³',
          ],
          1e-6,
        ),
        linearOption(
          'ft³',
          [
            'ft3',
            'ft^3',
          ],
          0.028316846592,
        ),
        linearOption(
          'gal US',
          [
            'gal',
            'usgal',
          ],
          0.003785411784,
        ),
      ],
    },
    {
      id:
        'volumetric-flow',
      label:
        'Volumetric flow rate',
      baseUnit:
        'm³/s',
      options: [
        linearOption(
          'm³/s',
          [
            'm3/s',
          ],
          1,
        ),
        linearOption(
          'm³/h',
          [
            'm3/h',
          ],
          1 /
            3600,
        ),
        linearOption(
          'L/s',
          [
            'l/s',
          ],
          0.001,
        ),
        linearOption(
          'L/min',
          [
            'l/min',
          ],
          0.001 /
            60,
        ),
        linearOption(
          'L/h',
          [
            'l/h',
          ],
          0.001 /
            3600,
        ),
        linearOption(
          'ft³/s',
          [
            'ft3/s',
          ],
          0.028316846592,
        ),
        linearOption(
          'cfm',
          [
            'ft3/min',
            'ft³/min',
          ],
          0.028316846592 /
            60,
        ),
        linearOption(
          'gpm US',
          [
            'gpm',
          ],
          0.003785411784 /
            60,
        ),
      ],
    },
    {
      id:
        'velocity',
      label:
        'Velocity',
      baseUnit:
        'm/s',
      options: [
        linearOption(
          'm/s',
          [],
          1,
        ),
        linearOption(
          'cm/s',
          [],
          0.01,
        ),
        linearOption(
          'km/h',
          [
            'kph',
          ],
          1 /
            3.6,
        ),
        linearOption(
          'ft/s',
          [],
          0.3048,
        ),
        linearOption(
          'mph',
          [],
          0.44704,
        ),
      ],
    },
    {
      id:
        'mass',
      label:
        'Mass',
      baseUnit:
        'kg',
      options: [
        linearOption(
          'kg',
          [],
          1,
        ),
        linearOption(
          'g',
          [],
          0.001,
        ),
        linearOption(
          'mg',
          [],
          1e-6,
        ),
        linearOption(
          'lb',
          [
            'lbs',
            'lbm',
          ],
          0.45359237,
        ),
      ],
    },
    {
      id:
        'mass-flow',
      label:
        'Mass flow rate',
      baseUnit:
        'kg/s',
      options: [
        linearOption(
          'kg/s',
          [],
          1,
        ),
        linearOption(
          'kg/h',
          [],
          1 /
            3600,
        ),
        linearOption(
          'g/s',
          [],
          0.001,
        ),
        linearOption(
          'g/min',
          [],
          0.001 /
            60,
        ),
        linearOption(
          'lb/h',
          [
            'lbm/h',
          ],
          0.45359237 /
            3600,
        ),
      ],
    },
    {
      id:
        'amount',
      label:
        'Amount of substance',
      baseUnit:
        'mol',
      options: [
        linearOption(
          'mol',
          [],
          1,
        ),
        linearOption(
          'kmol',
          [],
          1000,
        ),
        linearOption(
          'mmol',
          [],
          0.001,
        ),
      ],
    },
    {
      id:
        'molar-flow',
      label:
        'Molar flow rate',
      baseUnit:
        'mol/s',
      options: [
        linearOption(
          'mol/s',
          [],
          1,
        ),
        linearOption(
          'mol/min',
          [],
          1 /
            60,
        ),
        linearOption(
          'mol/h',
          [],
          1 /
            3600,
        ),
        linearOption(
          'kmol/s',
          [],
          1000,
        ),
        linearOption(
          'kmol/h',
          [],
          1000 /
            3600,
        ),
      ],
    },
    {
      id:
        'time',
      label:
        'Time',
      baseUnit:
        's',
      options: [
        linearOption(
          's',
          [
            'sec',
            'second',
            'seconds',
          ],
          1,
        ),
        linearOption(
          'min',
          [
            'minute',
            'minutes',
          ],
          60,
        ),
        linearOption(
          'h',
          [
            'hr',
            'hour',
            'hours',
          ],
          3600,
        ),
        linearOption(
          'day',
          [
            'days',
          ],
          86400,
        ),
      ],
    },
    {
      id:
        'energy',
      label:
        'Energy',
      baseUnit:
        'J',
      options: [
        linearOption(
          'J',
          [],
          1,
        ),
        linearOption(
          'kJ',
          [],
          1000,
        ),
        linearOption(
          'MJ',
          [],
          1e6,
        ),
        linearOption(
          'Wh',
          [],
          3600,
        ),
        linearOption(
          'kWh',
          [],
          3.6e6,
        ),
        linearOption(
          'Btu',
          [
            'BTU',
          ],
          1055.05585262,
        ),
        linearOption(
          'kcal',
          [],
          4184,
        ),
      ],
    },
    {
      id:
        'power',
      label:
        'Power',
      baseUnit:
        'W',
      options: [
        linearOption(
          'W',
          [],
          1,
        ),
        linearOption(
          'kW',
          [],
          1000,
        ),
        linearOption(
          'MW',
          [],
          1e6,
        ),
        linearOption(
          'hp',
          [],
          745.699871582,
        ),
        linearOption(
          'Btu/h',
          [],
          0.293071070172,
        ),
      ],
    },
    {
      id:
        'density',
      label:
        'Density',
      baseUnit:
        'kg/m³',
      options: [
        linearOption(
          'kg/m³',
          [
            'kg/m3',
          ],
          1,
        ),
        linearOption(
          'g/cm³',
          [
            'g/cm3',
            'g/mL',
            'g/ml',
          ],
          1000,
        ),
        linearOption(
          'kg/L',
          [],
          1000,
        ),
        linearOption(
          'lb/ft³',
          [
            'lb/ft3',
            'lbm/ft3',
          ],
          16.01846337396,
        ),
      ],
    },
    {
      id:
        'dynamic-viscosity',
      label:
        'Dynamic viscosity',
      baseUnit:
        'Pa·s',
      options: [
        linearOption(
          'Pa·s',
          [
            'Pa s',
            'Pa*s',
          ],
          1,
        ),
        linearOption(
          'mPa·s',
          [
            'mPa s',
            'mPa*s',
          ],
          0.001,
        ),
        linearOption(
          'cP',
          [
            'cp',
            'centipoise',
          ],
          0.001,
        ),
        linearOption(
          'P',
          [
            'poise',
          ],
          0.1,
        ),
      ],
    },
    {
      id:
        'force',
      label:
        'Force',
      baseUnit:
        'N',
      options: [
        linearOption(
          'N',
          [],
          1,
        ),
        linearOption(
          'kN',
          [],
          1000,
        ),
        linearOption(
          'lbf',
          [],
          4.448221615261,
        ),
      ],
    },
    {
      id:
        'heat-transfer-coefficient',
      label:
        'Heat-transfer coefficient',
      baseUnit:
        'W/(m²·K)',
      options: [
        linearOption(
          'W/(m²·K)',
          [
            'W/(m2 K)',
            'W/m2K',
            'W/(m² K)',
          ],
          1,
        ),
        linearOption(
          'kW/(m²·K)',
          [
            'kW/(m2 K)',
            'kW/m2K',
          ],
          1000,
        ),
        linearOption(
          'Btu/(h·ft²·°F)',
          [
            'Btu/(h ft2 F)',
            'Btu/h ft2 F',
            'Btu/(hr ft2 F)',
          ],
          5.678263341,
        ),
      ],
    },
    {
      id:
        'heat-flux',
      label:
        'Heat flux',
      baseUnit:
        'W/m²',
      options: [
        linearOption(
          'W/m²',
          [
            'W/m2',
          ],
          1,
        ),
        linearOption(
          'kW/m²',
          [
            'kW/m2',
          ],
          1000,
        ),
        linearOption(
          'Btu/(h·ft²)',
          [
            'Btu/(h ft2)',
            'Btu/h ft2',
          ],
          3.154590745,
        ),
      ],
    },
    {
      id:
        'concentration',
      label:
        'Molar concentration',
      baseUnit:
        'mol/m³',
      options: [
        linearOption(
          'mol/m³',
          [
            'mol/m3',
          ],
          1,
        ),
        linearOption(
          'kmol/m³',
          [
            'kmol/m3',
          ],
          1000,
        ),
        linearOption(
          'mol/L',
          [],
          1000,
        ),
        linearOption(
          'mmol/L',
          [],
          1,
        ),
      ],
    },
    {
      id:
        'molar-flux',
      label:
        'Molar flux',
      baseUnit:
        'mol/(m²·s)',
      options: [
        linearOption(
          'mol/(m²·s)',
          [
            'mol/(m2 s)',
            'mol/m2/s',
            'mol/(m² s)',
          ],
          1,
        ),
        linearOption(
          'kmol/(m²·h)',
          [
            'kmol/(m2 h)',
            'kmol/m2/h',
          ],
          1000 /
            3600,
        ),
        linearOption(
          'mol/(cm²·s)',
          [
            'mol/(cm2 s)',
          ],
          10000,
        ),
      ],
    },
  ]

function normalizeUnit(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase(
      'en-US',
    )
    .replaceAll(
      '°',
      'deg',
    )
    .replaceAll(
      'º',
      'deg',
    )
    .replaceAll(
      '²',
      '2',
    )
    .replaceAll(
      '³',
      '3',
    )
    .replaceAll(
      '·',
      '',
    )
    .replaceAll(
      '*',
      '',
    )
    .replaceAll(
      '^',
      '',
    )
    .replace(
      /[()[\]{}\s]/g,
      '',
    )
}

function resolveUnit(
  sourceUnit: string,
): ResolvedUnit | null {
  const normalizedSource =
    normalizeUnit(
      sourceUnit,
    )

  if (
    normalizedSource.length ===
    0
  ) {
    return null
  }

  for (
    const family
    of UNIT_FAMILIES
  ) {
    for (
      const option
      of family.options
    ) {
      const matches =
        option.aliases.some(
          (alias) =>
            normalizeUnit(
              alias,
            ) ===
            normalizedSource,
        )

      if (matches) {
        return {
          family,
          sourceOption:
            option,
        }
      }
    }
  }

  return null
}

function formatDecimal(
  value: number,
  digits: number,
): string {
  return Number(
    value.toFixed(
      digits,
    ),
  ).toLocaleString(
    undefined,
    {
      maximumFractionDigits:
        digits,
    },
  )
}

function formatScientific(
  value: number,
  digits: number,
): string {
  return value.toExponential(
    digits,
  )
}

function formatEngineering(
  value: number,
  digits: number,
): string {
  if (
    value ===
    0
  ) {
    return '0'
  }

  const exponent =
    Math.floor(
      Math.log10(
        Math.abs(
          value,
        ),
      ) /
        3,
    ) *
    3

  const mantissa =
    value /
    10 ** exponent

  const formattedMantissa =
    Number(
      mantissa.toFixed(
        digits,
      ),
    ).toLocaleString(
      undefined,
      {
        maximumFractionDigits:
          digits,
      },
    )

  return exponent ===
    0
    ? formattedMantissa
    : `${formattedMantissa} × 10^${exponent}`
}

function formatConvertedValue(
  value: number,
  mode:
    NumberFormatMode,
  digits: number,
): string {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return 'Not finite'
  }

  if (
    mode ===
    'scientific'
  ) {
    return formatScientific(
      value,
      digits,
    )
  }

  if (
    mode ===
    'decimal'
  ) {
    return formatDecimal(
      value,
      digits,
    )
  }

  return formatEngineering(
    value,
    digits,
  )
}

async function copyText(
  value: string,
): Promise<void> {
  if (
    navigator.clipboard &&
    typeof navigator
      .clipboard
      .writeText ===
      'function'
  ) {
    await navigator
      .clipboard
      .writeText(
        value,
      )

    return
  }

  const textArea =
    document.createElement(
      'textarea',
    )

  textArea.value =
    value

  textArea.setAttribute(
    'readonly',
    '',
  )

  textArea.style.position =
    'fixed'

  textArea.style.opacity =
    '0'

  document.body.appendChild(
    textArea,
  )

  textArea.select()

  const copied =
    document.execCommand(
      'copy',
    )

  textArea.remove()

  if (!copied) {
    throw new Error(
      'Browser copy command failed.',
    )
  }
}

export function ResultUnitConverterPanel({
  calculatorTitle,
  resultLabel,
  numericValue,
  sourceUnit,
}: ResultUnitConverterPanelProps) {
  const resolvedUnit =
    useMemo(
      () =>
        resolveUnit(
          sourceUnit,
        ),
      [
        sourceUnit,
      ],
    )

  const [
    selectedUnit,
    setSelectedUnit,
  ] = useState(
    resolvedUnit
      ?.sourceOption
      .unit ??
      sourceUnit,
  )

  const [
    formatMode,
    setFormatMode,
  ] = useState<
    NumberFormatMode
  >('engineering')

  const [
    digits,
    setDigits,
  ] = useState(5)

  const [
    isExpanded,
    setIsExpanded,
  ] = useState(false)

  const [
    feedbackMessage,
    setFeedbackMessage,
  ] = useState('')

  const selectedOption =
    resolvedUnit
      ?.family
      .options
      .find(
        (option) =>
          option.unit ===
          selectedUnit,
      ) ??
    resolvedUnit
      ?.sourceOption

  const convertedValue =
    useMemo(
      () => {
        if (
          numericValue ===
            null ||
          !Number.isFinite(
            numericValue,
          ) ||
          !resolvedUnit ||
          !selectedOption
        ) {
          return null
        }

        const baseValue =
          resolvedUnit
            .sourceOption
            .toBase(
              numericValue,
            )

        return selectedOption.fromBase(
          baseValue,
        )
      },
      [
        numericValue,
        resolvedUnit,
        selectedOption,
      ],
    )

  if (
    numericValue ===
      null ||
    !Number.isFinite(
      numericValue,
    ) ||
    sourceUnit
      .trim()
      .length ===
      0
  ) {
    return null
  }

  const originalFormatted =
    formatConvertedValue(
      numericValue,
      formatMode,
      digits,
    )

  const convertedFormatted =
    convertedValue ===
    null
      ? 'Unsupported unit'
      : formatConvertedValue(
          convertedValue,
          formatMode,
          digits,
        )

  async function copyConvertedResult() {
    if (
      convertedValue ===
        null ||
      !selectedOption
    ) {
      setFeedbackMessage(
        'This result unit is not yet supported.',
      )
      return
    }

    const report = [
      'ChemE Toolkit Converted Result',
      '',
      `Calculator: ${calculatorTitle}`,
      `Result: ${resultLabel}`,
      `Original: ${originalFormatted} ${sourceUnit}`,
      `Converted: ${convertedFormatted} ${selectedOption.unit}`,
      `Unit family: ${resolvedUnit?.family.label ?? 'Unknown'}`,
      `Number format: ${formatMode}`,
      `Displayed precision: ${digits} digits`,
    ].join(
      '\n',
    )

    try {
      await copyText(
        report,
      )

      setFeedbackMessage(
        'Converted result copied.',
      )
    } catch {
      setFeedbackMessage(
        'Converted result could not be copied.',
      )
    }
  }

  return (
    <section
      className="result-unit-converter-panel"
      data-supported={
        resolvedUnit
          ? 'true'
          : 'false'
      }
      data-expanded={
        isExpanded
          ? 'true'
          : 'false'
      }
      aria-labelledby="result-unit-converter-title"
    >
      <header className="result-unit-converter-launcher">
        <div>
          <span>
            Result presentation tool
          </span>

          <h4 id="result-unit-converter-title">
            Result unit converter
          </h4>

          <p>
            {
              resolvedUnit
                ? `${resolvedUnit.family.label} result detected · ${resolvedUnit.family.options.length} compatible units`
                : `The result unit “${sourceUnit}” is not yet registered.`
            }
          </p>
        </div>

        <div className="result-unit-converter-launcher-actions">
          <div>
            <span>
              Current result
            </span>

            <strong>
              {resultLabel}
              {' = '}
              {originalFormatted}
              {' '}
              {sourceUnit}
            </strong>
          </div>

          <button
            type="button"
            disabled={
              !resolvedUnit
            }
            aria-expanded={
              isExpanded
            }
            onClick={() => {
              setIsExpanded(
                (current) =>
                  !current,
              )

              setFeedbackMessage(
                '',
              )
            }}
          >
            {
              isExpanded
                ? 'Hide converter'
                : 'Convert result'
            }
          </button>
        </div>
      </header>

      {isExpanded &&
      resolvedUnit &&
      selectedOption ? (
        <div className="result-unit-converter-content">
          <div className="result-unit-converter-controls">
            <label>
              <span>
                Output unit
              </span>

              <select
                value={
                  selectedOption.unit
                }
                onChange={(event) => {
                  setSelectedUnit(
                    event.target.value,
                  )

                  setFeedbackMessage(
                    '',
                  )
                }}
              >
                {resolvedUnit
                  .family
                  .options
                  .map(
                    (option) => (
                      <option
                        key={
                          option.unit
                        }
                        value={
                          option.unit
                        }
                      >
                        {option.unit}
                      </option>
                    ),
                  )}
              </select>
            </label>

            <label>
              <span>
                Number format
              </span>

              <select
                value={
                  formatMode
                }
                onChange={(event) => {
                  setFormatMode(
                    event.target.value as
                      NumberFormatMode,
                  )

                  setFeedbackMessage(
                    '',
                  )
                }}
              >
                <option value="engineering">
                  Engineering notation
                </option>

                <option value="scientific">
                  Scientific notation
                </option>

                <option value="decimal">
                  Decimal notation
                </option>
              </select>
            </label>

            <label>
              <span>
                Display precision
              </span>

              <select
                value={
                  digits
                }
                onChange={(event) =>
                  setDigits(
                    Number(
                      event.target.value,
                    ),
                  )
                }
              >
                {[
                  3,
                  4,
                  5,
                  6,
                  7,
                  8,
                ].map(
                  (value) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {value} digits
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>

          <div className="result-unit-converter-comparison">
            <article>
              <span>
                Original Solver result
              </span>

              <strong>
                {originalFormatted}
              </strong>

              <small>
                {sourceUnit}
              </small>
            </article>

            <div className="result-unit-converter-arrow">
              →
            </div>

            <article className="is-converted">
              <span>
                Converted engineering result
              </span>

              <strong>
                {convertedFormatted}
              </strong>

              <small>
                {
                  selectedOption.unit
                }
              </small>
            </article>
          </div>

          <div className="result-unit-converter-family">
            <div>
              <span>
                Conversion family
              </span>

              <strong>
                {
                  resolvedUnit
                    .family
                    .label
                }
              </strong>
            </div>

            <div>
              <span>
                SI base unit
              </span>

              <strong>
                {
                  resolvedUnit
                    .family
                    .baseUnit
                }
              </strong>
            </div>

            <div>
              <span>
                Source unit
              </span>

              <strong>
                {
                  resolvedUnit
                    .sourceOption
                    .unit
                }
              </strong>
            </div>

            <div>
              <span>
                Selected unit
              </span>

              <strong>
                {
                  selectedOption.unit
                }
              </strong>
            </div>
          </div>

          <div className="result-unit-converter-options">
            <header>
              <span>
                Compatible result units
              </span>

              <strong>
                Select an alternative
              </strong>
            </header>

            <div>
              {resolvedUnit
                .family
                .options
                .map(
                  (option) => {
                    const baseValue =
                      resolvedUnit
                        .sourceOption
                        .toBase(
                          numericValue,
                        )

                    const optionValue =
                      option.fromBase(
                        baseValue,
                      )

                    const isActive =
                      option.unit ===
                      selectedOption.unit

                    return (
                      <button
                        key={
                          option.unit
                        }
                        type="button"
                        className={
                          isActive
                            ? 'is-active'
                            : undefined
                        }
                        onClick={() => {
                          setSelectedUnit(
                            option.unit,
                          )

                          setFeedbackMessage(
                            '',
                          )
                        }}
                      >
                        <span>
                          {option.unit}
                        </span>

                        <strong>
                          {
                            formatConvertedValue(
                              optionValue,
                              formatMode,
                              digits,
                            )
                          }
                        </strong>
                      </button>
                    )
                  },
                )}
            </div>
          </div>

          {feedbackMessage ? (
            <p
              className="result-unit-converter-feedback"
              role="status"
            >
              {feedbackMessage}
            </p>
          ) : null}

          <footer className="result-unit-converter-actions">
            <div>
              <strong>
                {calculatorTitle}
              </strong>

              <span>
                The numerical Solver result is unchanged; only its unit representation is converted.
              </span>
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  setSelectedUnit(
                    resolvedUnit
                      .sourceOption
                      .unit,
                  )

                  setFormatMode(
                    'engineering',
                  )

                  setDigits(
                    5,
                  )

                  setFeedbackMessage(
                    'Original unit and default formatting restored.',
                  )
                }}
              >
                Restore original
              </button>

              <button
                type="button"
                className="is-primary"
                onClick={
                  copyConvertedResult
                }
              >
                Copy converted result
              </button>
            </div>
          </footer>
        </div>
      ) : null}
    </section>
  )
}
