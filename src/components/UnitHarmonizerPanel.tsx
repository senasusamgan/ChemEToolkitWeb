import {
  useMemo,
  useState,
} from 'react'

import '../styles/unit-harmonizer-panel.css'

interface UnitHarmonizerPanelProps {
  isOpen: boolean
  baseQuery: string
  onClose: () => void
  onApplyProblem: (
    normalizedProblem: string,
  ) => void
}

type HarmonizationStatus =
  | 'converted'
  | 'already-si'
  | 'dimensionless'
  | 'unknown'

interface UnitDefinition {
  quantity: string
  targetUnit: string
  aliases: string[]
  convert: (
    value: number,
  ) => number
}

interface ParsedAssignment {
  segmentIndex: number
  originalSegment: string
  leadingWhitespace: string
  symbol: string
  equalsText: string
  value: number
  unit: string
  trailingWhitespace: string
}

interface HarmonizedAssignment
  extends ParsedAssignment {
  quantity: string
  normalizedValue:
    number | null
  normalizedUnit: string
  status: HarmonizationStatus
}

interface HarmonizationAnalysis {
  assignments:
    HarmonizedAssignment[]
  normalizedQuery: string
  convertedCount: number
  alreadySiCount: number
  dimensionlessCount: number
  unknownCount: number
}

const NUMBER_PATTERN =
  '[-+]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[-+]?\\d+)?'

const DIMENSIONLESS_SYMBOLS =
  new Set([
    'Re',
    'Pr',
    'Sc',
    'Nu',
    'Sh',
    'Bi',
    'Fo',
    'Pe',
    'Da',
    'f',
    'x',
    'y',
    'z',
    'η',
    'epsilon',
  ])

function linearUnit(
  quantity: string,
  targetUnit: string,
  aliases: string[],
  factor: number,
): UnitDefinition {
  return {
    quantity,
    targetUnit,
    aliases,
    convert:
      (value) =>
        value *
        factor,
  }
}

const UNIT_DEFINITIONS:
  UnitDefinition[] = [
    linearUnit(
      'Pressure',
      'Pa',
      [
        'Pa',
      ],
      1,
    ),
    linearUnit(
      'Pressure',
      'Pa',
      [
        'kPa',
      ],
      1000,
    ),
    linearUnit(
      'Pressure',
      'Pa',
      [
        'MPa',
      ],
      1e6,
    ),
    linearUnit(
      'Pressure',
      'Pa',
      [
        'bar',
      ],
      1e5,
    ),
    linearUnit(
      'Pressure',
      'Pa',
      [
        'mbar',
      ],
      100,
    ),
    linearUnit(
      'Pressure',
      'Pa',
      [
        'atm',
      ],
      101325,
    ),
    linearUnit(
      'Pressure',
      'Pa',
      [
        'psi',
      ],
      6894.757293168,
    ),
    linearUnit(
      'Pressure',
      'Pa',
      [
        'mmHg',
        'torr',
      ],
      133.3223684211,
    ),

    {
      quantity:
        'Temperature',
      targetUnit:
        'K',
      aliases: [
        'K',
      ],
      convert:
        (value) =>
          value,
    },
    {
      quantity:
        'Temperature',
      targetUnit:
        'K',
      aliases: [
        'C',
        '°C',
        'degC',
        'celsius',
      ],
      convert:
        (value) =>
          value +
          273.15,
    },
    {
      quantity:
        'Temperature',
      targetUnit:
        'K',
      aliases: [
        'F',
        '°F',
        'degF',
        'fahrenheit',
      ],
      convert:
        (value) =>
          (
            value -
            32
          ) *
            5 /
            9 +
          273.15,
    },
    {
      quantity:
        'Temperature',
      targetUnit:
        'K',
      aliases: [
        'R',
        '°R',
        'rankine',
      ],
      convert:
        (value) =>
          value *
          5 /
          9,
    },

    linearUnit(
      'Length',
      'm',
      [
        'm',
      ],
      1,
    ),
    linearUnit(
      'Length',
      'm',
      [
        'cm',
      ],
      0.01,
    ),
    linearUnit(
      'Length',
      'm',
      [
        'mm',
      ],
      0.001,
    ),
    linearUnit(
      'Length',
      'm',
      [
        'km',
      ],
      1000,
    ),
    linearUnit(
      'Length',
      'm',
      [
        'in',
        'inch',
        'inches',
      ],
      0.0254,
    ),
    linearUnit(
      'Length',
      'm',
      [
        'ft',
        'foot',
        'feet',
      ],
      0.3048,
    ),

    linearUnit(
      'Area',
      'm2',
      [
        'm2',
        'm²',
      ],
      1,
    ),
    linearUnit(
      'Area',
      'm2',
      [
        'cm2',
        'cm²',
      ],
      1e-4,
    ),
    linearUnit(
      'Area',
      'm2',
      [
        'mm2',
        'mm²',
      ],
      1e-6,
    ),
    linearUnit(
      'Area',
      'm2',
      [
        'ft2',
        'ft²',
      ],
      0.09290304,
    ),
    linearUnit(
      'Area',
      'm2',
      [
        'in2',
        'in²',
      ],
      0.00064516,
    ),

    linearUnit(
      'Volume',
      'm3',
      [
        'm3',
        'm³',
      ],
      1,
    ),
    linearUnit(
      'Volume',
      'm3',
      [
        'L',
        'liter',
        'litre',
      ],
      0.001,
    ),
    linearUnit(
      'Volume',
      'm3',
      [
        'mL',
        'ml',
        'cm3',
        'cm³',
      ],
      1e-6,
    ),
    linearUnit(
      'Volume',
      'm3',
      [
        'ft3',
        'ft³',
      ],
      0.028316846592,
    ),

    linearUnit(
      'Volumetric flow',
      'm3/s',
      [
        'm3/s',
        'm³/s',
      ],
      1,
    ),
    linearUnit(
      'Volumetric flow',
      'm3/s',
      [
        'm3/h',
        'm³/h',
      ],
      1 /
        3600,
    ),
    linearUnit(
      'Volumetric flow',
      'm3/s',
      [
        'L/s',
        'l/s',
      ],
      0.001,
    ),
    linearUnit(
      'Volumetric flow',
      'm3/s',
      [
        'L/min',
        'l/min',
      ],
      0.001 /
        60,
    ),
    linearUnit(
      'Volumetric flow',
      'm3/s',
      [
        'L/h',
        'l/h',
      ],
      0.001 /
        3600,
    ),
    linearUnit(
      'Volumetric flow',
      'm3/s',
      [
        'ft3/s',
        'ft³/s',
      ],
      0.028316846592,
    ),
    linearUnit(
      'Volumetric flow',
      'm3/s',
      [
        'cfm',
        'ft3/min',
        'ft³/min',
      ],
      0.028316846592 /
        60,
    ),

    linearUnit(
      'Velocity',
      'm/s',
      [
        'm/s',
      ],
      1,
    ),
    linearUnit(
      'Velocity',
      'm/s',
      [
        'cm/s',
      ],
      0.01,
    ),
    linearUnit(
      'Velocity',
      'm/s',
      [
        'km/h',
        'kph',
      ],
      1 /
        3.6,
    ),
    linearUnit(
      'Velocity',
      'm/s',
      [
        'ft/s',
      ],
      0.3048,
    ),

    linearUnit(
      'Mass',
      'kg',
      [
        'kg',
      ],
      1,
    ),
    linearUnit(
      'Mass',
      'kg',
      [
        'g',
      ],
      0.001,
    ),
    linearUnit(
      'Mass',
      'kg',
      [
        'mg',
      ],
      1e-6,
    ),
    linearUnit(
      'Mass',
      'kg',
      [
        'lb',
        'lbs',
        'lbm',
      ],
      0.45359237,
    ),

    linearUnit(
      'Mass flow',
      'kg/s',
      [
        'kg/s',
      ],
      1,
    ),
    linearUnit(
      'Mass flow',
      'kg/s',
      [
        'kg/h',
      ],
      1 /
        3600,
    ),
    linearUnit(
      'Mass flow',
      'kg/s',
      [
        'g/s',
      ],
      0.001,
    ),
    linearUnit(
      'Mass flow',
      'kg/s',
      [
        'lb/h',
        'lbm/h',
      ],
      0.45359237 /
        3600,
    ),

    linearUnit(
      'Amount',
      'mol',
      [
        'mol',
      ],
      1,
    ),
    linearUnit(
      'Amount',
      'mol',
      [
        'kmol',
      ],
      1000,
    ),

    linearUnit(
      'Molar flow',
      'mol/s',
      [
        'mol/s',
      ],
      1,
    ),
    linearUnit(
      'Molar flow',
      'mol/s',
      [
        'mol/min',
      ],
      1 /
        60,
    ),
    linearUnit(
      'Molar flow',
      'mol/s',
      [
        'kmol/h',
      ],
      1000 /
        3600,
    ),

    linearUnit(
      'Time',
      's',
      [
        's',
        'sec',
        'second',
        'seconds',
      ],
      1,
    ),
    linearUnit(
      'Time',
      's',
      [
        'min',
        'minute',
        'minutes',
      ],
      60,
    ),
    linearUnit(
      'Time',
      's',
      [
        'h',
        'hr',
        'hour',
        'hours',
      ],
      3600,
    ),

    linearUnit(
      'Energy',
      'J',
      [
        'J',
      ],
      1,
    ),
    linearUnit(
      'Energy',
      'J',
      [
        'kJ',
      ],
      1000,
    ),
    linearUnit(
      'Energy',
      'J',
      [
        'MJ',
      ],
      1e6,
    ),
    linearUnit(
      'Energy',
      'J',
      [
        'Wh',
      ],
      3600,
    ),
    linearUnit(
      'Energy',
      'J',
      [
        'kWh',
      ],
      3.6e6,
    ),
    linearUnit(
      'Energy',
      'J',
      [
        'Btu',
        'BTU',
      ],
      1055.05585262,
    ),

    linearUnit(
      'Power',
      'W',
      [
        'W',
      ],
      1,
    ),
    linearUnit(
      'Power',
      'W',
      [
        'kW',
      ],
      1000,
    ),
    linearUnit(
      'Power',
      'W',
      [
        'MW',
      ],
      1e6,
    ),
    linearUnit(
      'Power',
      'W',
      [
        'hp',
      ],
      745.699871582,
    ),

    linearUnit(
      'Density',
      'kg/m3',
      [
        'kg/m3',
        'kg/m³',
      ],
      1,
    ),
    linearUnit(
      'Density',
      'kg/m3',
      [
        'g/cm3',
        'g/cm³',
        'g/mL',
        'g/ml',
      ],
      1000,
    ),
    linearUnit(
      'Density',
      'kg/m3',
      [
        'lb/ft3',
        'lb/ft³',
      ],
      16.01846337396,
    ),

    linearUnit(
      'Dynamic viscosity',
      'Pa s',
      [
        'Pa s',
        'Pa·s',
        'Pa*s',
      ],
      1,
    ),
    linearUnit(
      'Dynamic viscosity',
      'Pa s',
      [
        'mPa s',
        'mPa·s',
        'mPa*s',
        'cP',
        'cp',
      ],
      0.001,
    ),

    linearUnit(
      'Force',
      'N',
      [
        'N',
      ],
      1,
    ),
    linearUnit(
      'Force',
      'N',
      [
        'kN',
      ],
      1000,
    ),
    linearUnit(
      'Force',
      'N',
      [
        'lbf',
      ],
      4.448221615261,
    ),
  ]

function normalizeUnitToken(
  unit: string,
): string {
  return unit
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
      '^',
      '',
    )
    .replaceAll(
      '·',
      '',
    )
    .replaceAll(
      '*',
      '',
    )
    .replace(
      /\s+/g,
      '',
    )
}

function findUnitDefinition(
  unit: string,
): UnitDefinition | null {
  const normalizedUnit =
    normalizeUnitToken(
      unit,
    )

  for (
    const definition
    of UNIT_DEFINITIONS
  ) {
    const matches =
      definition.aliases.some(
        (alias) =>
          normalizeUnitToken(
            alias,
          ) ===
          normalizedUnit,
      )

    if (matches) {
      return definition
    }
  }

  return null
}

function formatEngineeringNumber(
  value: number,
): string {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return '—'
  }

  const absoluteValue =
    Math.abs(
      value,
    )

  if (
    absoluteValue !==
      0 &&
    (
      absoluteValue >=
        1e7 ||
      absoluteValue <
        1e-5
    )
  ) {
    return value
      .toExponential(
        6,
      )
  }

  return Number(
    value.toPrecision(
      10,
    ),
  ).toLocaleString(
    'en-US',
    {
      useGrouping:
        false,
      maximumFractionDigits:
        10,
    },
  )
}

function formatQueryNumber(
  value: number,
): string {
  return Number(
    value.toPrecision(
      12,
    ),
  ).toString()
}

function parseAssignment(
  segment: string,
  segmentIndex: number,
): ParsedAssignment | null {
  const pattern =
    new RegExp(
      `^(\\s*)([A-Za-zΑ-Ωα-ωΔρμνταβγ][A-Za-z0-9_Α-Ωα-ωΔρμνταβγ]*)(\\s*=\\s*)(${NUMBER_PATTERN})(\\s*)(.*?)(\\s*)$`,
      'i',
    )

  const match =
    segment.match(
      pattern,
    )

  if (!match) {
    return null
  }

  const value =
    Number(
      match[4],
    )

  if (
    !Number.isFinite(
      value,
    )
  ) {
    return null
  }

  return {
    segmentIndex,
    originalSegment:
      segment,
    leadingWhitespace:
      match[1],
    symbol:
      match[2],
    equalsText:
      match[3],
    value,
    unit:
      match[6].trim(),
    trailingWhitespace:
      match[7],
  }
}

function harmonizeQuery(
  query: string,
): HarmonizationAnalysis {
  const segments =
    query.split(
      /([;\n]+)/,
    )

  const assignments:
    HarmonizedAssignment[] = []

  for (
    let segmentIndex =
      0;
    segmentIndex <
    segments.length;
    segmentIndex +=
      1
  ) {
    const parsed =
      parseAssignment(
        segments[
          segmentIndex
        ],
        segmentIndex,
      )

    if (!parsed) {
      continue
    }

    const definition =
      findUnitDefinition(
        parsed.unit,
      )

    if (
      parsed.unit.length ===
        0 &&
      DIMENSIONLESS_SYMBOLS.has(
        parsed.symbol,
      )
    ) {
      assignments.push({
        ...parsed,
        quantity:
          'Dimensionless',
        normalizedValue:
          parsed.value,
        normalizedUnit:
          '',
        status:
          'dimensionless',
      })

      continue
    }

    if (!definition) {
      assignments.push({
        ...parsed,
        quantity:
          parsed.unit.length >
          0
            ? 'Unrecognized unit'
            : 'Unit required',
        normalizedValue:
          null,
        normalizedUnit:
          '',
        status:
          'unknown',
      })

      continue
    }

    const normalizedValue =
      definition.convert(
        parsed.value,
      )

    const sourceIsSi =
      normalizeUnitToken(
        parsed.unit,
      ) ===
      normalizeUnitToken(
        definition.targetUnit,
      )

    assignments.push({
      ...parsed,
      quantity:
        definition.quantity,
      normalizedValue,
      normalizedUnit:
        definition.targetUnit,
      status:
        sourceIsSi
          ? 'already-si'
          : 'converted',
    })
  }

  const normalizedSegments =
    [
      ...segments,
    ]

  for (
    const assignment
    of assignments
  ) {
    if (
      assignment.status !==
        'converted' ||
      assignment.normalizedValue ===
        null
    ) {
      continue
    }

    normalizedSegments[
      assignment.segmentIndex
    ] =
      assignment.leadingWhitespace +
      assignment.symbol +
      assignment.equalsText +
      formatQueryNumber(
        assignment.normalizedValue,
      ) +
      (
        assignment.normalizedUnit
          ? ` ${assignment.normalizedUnit}`
          : ''
      ) +
      assignment.trailingWhitespace
  }

  return {
    assignments,
    normalizedQuery:
      normalizedSegments.join(
        '',
      ),
    convertedCount:
      assignments.filter(
        (assignment) =>
          assignment.status ===
          'converted',
      ).length,
    alreadySiCount:
      assignments.filter(
        (assignment) =>
          assignment.status ===
          'already-si',
      ).length,
    dimensionlessCount:
      assignments.filter(
        (assignment) =>
          assignment.status ===
          'dimensionless',
      ).length,
    unknownCount:
      assignments.filter(
        (assignment) =>
          assignment.status ===
          'unknown',
      ).length,
  }
}

function statusLabel(
  status:
    HarmonizationStatus,
): string {
  if (
    status ===
    'converted'
  ) {
    return 'Converted'
  }

  if (
    status ===
    'already-si'
  ) {
    return 'Already SI'
  }

  if (
    status ===
    'dimensionless'
  ) {
    return 'Dimensionless'
  }

  return 'Review unit'
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
      'Copy command failed.',
    )
  }
}

export function UnitHarmonizerPanel({
  isOpen,
  baseQuery,
  onClose,
  onApplyProblem,
}: UnitHarmonizerPanelProps) {
  const [
    feedbackMessage,
    setFeedbackMessage,
  ] = useState('')

  const analysis =
    useMemo(
      () =>
        harmonizeQuery(
          baseQuery,
        ),
      [
        baseQuery,
      ],
    )

  if (!isOpen) {
    return null
  }

  const supportedCount =
    analysis.convertedCount +
    analysis.alreadySiCount +
    analysis.dimensionlessCount

  const canApply =
    analysis.convertedCount >
    0

  async function copyNormalizedProblem() {
    try {
      await copyText(
        analysis.normalizedQuery,
      )

      setFeedbackMessage(
        'Normalized SI problem copied.',
      )
    } catch {
      setFeedbackMessage(
        'Normalized problem could not be copied.',
      )
    }
  }

  function applyNormalizedProblem() {
    if (!canApply) {
      setFeedbackMessage(
        'No convertible units were detected.',
      )
      return
    }

    onApplyProblem(
      analysis.normalizedQuery,
    )

    setFeedbackMessage(
      'SI-normalized problem loaded into the Solver.',
    )

    onClose()
  }

  return (
    <section
      className="unit-harmonizer-panel"
      aria-labelledby="unit-harmonizer-title"
    >
      <header className="unit-harmonizer-header">
        <div>
          <span>
            Dimensional consistency assistant
          </span>

          <h3 id="unit-harmonizer-title">
            Unit harmonizer
          </h3>

          <p>
            Detect engineering measurements, convert
            supported values to SI and flag units that
            require review.
          </p>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
        >
          Close harmonizer
        </button>
      </header>

      <div className="unit-harmonizer-summary">
        <article>
          <span>
            Parsed values
          </span>

          <strong>
            {
              analysis
                .assignments
                .length
            }
          </strong>
        </article>

        <article>
          <span>
            Converted to SI
          </span>

          <strong>
            {
              analysis
                .convertedCount
            }
          </strong>
        </article>

        <article>
          <span>
            Already SI
          </span>

          <strong>
            {
              analysis
                .alreadySiCount
            }
          </strong>
        </article>

        <article>
          <span>
            Dimensionless
          </span>

          <strong>
            {
              analysis
                .dimensionlessCount
            }
          </strong>
        </article>

        <article>
          <span>
            Unit review
          </span>

          <strong>
            {
              analysis
                .unknownCount
            }
          </strong>
        </article>
      </div>

      {analysis.assignments.length >
      0 ? (
        <>
          <div className="unit-harmonizer-table-wrap">
            <table className="unit-harmonizer-table">
              <thead>
                <tr>
                  <th>
                    Variable
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Original
                  </th>

                  <th>
                    SI value
                  </th>

                  <th>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {analysis.assignments.map(
                  (
                    assignment,
                    index,
                  ) => (
                    <tr
                      key={
                        assignment.symbol +
                        index
                      }
                      data-status={
                        assignment.status
                      }
                    >
                      <td>
                        <strong>
                          {
                            assignment.symbol
                          }
                        </strong>
                      </td>

                      <td>
                        {
                          assignment.quantity
                        }
                      </td>

                      <td>
                        {
                          formatEngineeringNumber(
                            assignment.value,
                          )
                        }
                        {
                          assignment.unit
                            ? ` ${assignment.unit}`
                            : ''
                        }
                      </td>

                      <td>
                        {
                          assignment.normalizedValue ===
                          null
                            ? '—'
                            : `${formatEngineeringNumber(assignment.normalizedValue)}${assignment.normalizedUnit ? ` ${assignment.normalizedUnit}` : ''}`
                        }
                      </td>

                      <td>
                        <span>
                          {
                            statusLabel(
                              assignment.status,
                            )
                          }
                        </span>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div className="unit-harmonizer-coverage">
            <div>
              <span>
                Supported assignments
              </span>

              <strong>
                {supportedCount}
                {' / '}
                {
                  analysis
                    .assignments
                    .length
                }
              </strong>
            </div>

            <progress
              max={
                Math.max(
                  1,
                  analysis
                    .assignments
                    .length,
                )
              }
              value={
                supportedCount
              }
            />
          </div>

          <div className="unit-harmonizer-preview">
            <span>
              SI-normalized problem
            </span>

            <code>
              {
                analysis
                  .normalizedQuery
              }
            </code>
          </div>

          {analysis.unknownCount >
          0 ? (
            <div className="unit-harmonizer-warning">
              <strong>
                Some units require manual review
              </strong>

              <p>
                The original text was preserved for
                unrecognized or unitless dimensional
                values.
              </p>
            </div>
          ) : (
            <div className="unit-harmonizer-clear">
              <strong>
                Unit coverage complete
              </strong>

              <p>
                Every parsed assignment is either
                normalized, already SI or dimensionless.
              </p>
            </div>
          )}

          <div className="unit-harmonizer-reference">
            <span>
              Supported SI families
            </span>

            <div>
              {[
                'Pressure',
                'Temperature',
                'Length',
                'Area',
                'Volume',
                'Flow rate',
                'Velocity',
                'Mass',
                'Molar flow',
                'Energy',
                'Power',
                'Density',
                'Viscosity',
                'Force',
              ].map(
                (quantity) => (
                  <span
                    key={
                      quantity
                    }
                  >
                    {quantity}
                  </span>
                ),
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="unit-harmonizer-empty">
          <strong>
            No numeric assignments detected
          </strong>

          <p>
            Add entries such as P=1 bar, T=25 °C,
            D=50 mm or Q=120 L/min.
          </p>
        </div>
      )}

      {feedbackMessage ? (
        <p
          className="unit-harmonizer-feedback"
          role="status"
        >
          {feedbackMessage}
        </p>
      ) : null}

      <footer className="unit-harmonizer-actions">
        <div>
          <button
            type="button"
            disabled={
              analysis
                .assignments
                .length ===
              0
            }
            onClick={
              copyNormalizedProblem
            }
          >
            Copy normalized problem
          </button>

          <button
            type="button"
            className="is-primary"
            disabled={
              !canApply
            }
            onClick={
              applyNormalizedProblem
            }
          >
            Normalize and solve →
          </button>
        </div>

        <span>
          Original unknown units remain unchanged.
        </span>
      </footer>
    </section>
  )
}
