export interface ProblemQuickSolution {
  resultLabel: string
  resultValue: string
  numericValue: number
  unit: string
  equation: string
  steps: string[]
  assumptions: string[]
}

interface Measurement {
  value: number
  unit: string
}

const NUMBER_SOURCE =
  '[-+]?(?:\\d+(?:\\.\\d+)?|\\.\\d+)(?:e[-+]?\\d+)?'

const STANDARD_GRAVITY =
  9.80665

const GAS_CONSTANT =
  8.314462618

function normalizeText(
  value: string,
): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .replaceAll('ş', 's')
    .replaceAll('ğ', 'g')
    .replaceAll('ç', 'c')
    .replaceAll('ö', 'o')
    .replaceAll('ü', 'u')
    .replace(/[−–—]/g, '-')
    .replace(/,/g, '.')
    .replace(/²/g, '2')
    .replace(/³/g, '3')
    .replace(/\^/g, '')
    .replace(/°/g, '')
    .replace(/[·*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeRegExp(
  value: string,
): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  )
}

function createAlternatives(
  values: string[],
): string {
  return values
    .map(normalizeText)
    .filter(
      (value) =>
        value.length > 0,
    )
    .sort(
      (first, second) =>
        second.length -
        first.length,
    )
    .map(escapeRegExp)
    .join('|')
}

function extractMeasurement(
  query: string,
  aliases: string[],
  units: string[],
): Measurement | null {
  const cleanQuery =
    normalizeText(query)

  const aliasPattern =
    createAlternatives(
      aliases,
    )

  const unitPattern =
    createAlternatives(
      units,
    )

  if (
    !aliasPattern ||
    !unitPattern
  ) {
    return null
  }

  const patterns = [
    new RegExp(
      `(?:^|\\b)(?:${aliasPattern})(?=\\b|\\s|:|=)\\s*(?:=|:|is)?\\s*(${NUMBER_SOURCE})\\s*(${unitPattern})(?=\\s|$|[.;)])`,
    ),
    new RegExp(
      `(${NUMBER_SOURCE})\\s*(${unitPattern})\\s+(?:for\\s+)?(?:${aliasPattern})(?=\\b|\\s|$|[.;)])`,
    ),
  ]

  for (
    const pattern
    of patterns
  ) {
    const match =
      pattern.exec(
        cleanQuery,
      )

    if (!match) {
      continue
    }

    const value =
      Number(
        match[1],
      )

    if (
      !Number.isFinite(
        value,
      )
    ) {
      return null
    }

    return {
      value,
      unit:
        normalizeText(
          match[2],
        ),
    }
  }

  return null
}

function extractEfficiency(
  query: string,
): number | null {
  const cleanQuery =
    normalizeText(query)

  const aliasPattern =
    createAlternatives([
      'pump efficiency',
      'efficiency',
      'verim',
    ])

  const pattern =
    new RegExp(
      `(?:^|\\b)(?:${aliasPattern})(?=\\b|\\s|:|=)\\s*(?:=|:|is)?\\s*(${NUMBER_SOURCE})\\s*(%|percent)?`,
    )

  const match =
    pattern.exec(
      cleanQuery,
    )

  if (!match) {
    return null
  }

  let value =
    Number(
      match[1],
    )

  if (
    !Number.isFinite(
      value,
    )
  ) {
    return null
  }

  if (
    match[2] ||
    value > 1
  ) {
    value /= 100
  }

  if (
    value <= 0 ||
    value > 1
  ) {
    return null
  }

  return value
}

function readLength(
  query: string,
  aliases: string[],
): number | null {
  const measurement =
    extractMeasurement(
      query,
      aliases,
      [
        'mm',
        'cm',
        'm',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
    'mm'
  ) {
    return (
      measurement.value /
      1000
    )
  }

  if (
    measurement.unit ===
    'cm'
  ) {
    return (
      measurement.value /
      100
    )
  }

  return measurement.value
}

function readDensity(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'fluid density',
        'density',
        'yogunluk',
        'rho',
      ],
      [
        'kg/m3',
        'g/cm3',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
    'g/cm3'
  ) {
    return (
      measurement.value *
      1000
    )
  }

  return measurement.value
}

function readVelocity(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'fluid velocity',
        'velocity',
        'hiz',
      ],
      [
        'cm/s',
        'm/s',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
    'cm/s'
  ) {
    return (
      measurement.value /
      100
    )
  }

  return measurement.value
}

function readFlowRate(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'volumetric flow rate',
        'flow rate',
        'debi',
      ],
      [
        'm3/s',
        'm3/h',
        'l/min',
        'l/s',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
    'm3/h'
  ) {
    return (
      measurement.value /
      3600
    )
  }

  if (
    measurement.unit ===
    'l/s'
  ) {
    return (
      measurement.value /
      1000
    )
  }

  if (
    measurement.unit ===
    'l/min'
  ) {
    return (
      measurement.value /
      60000
    )
  }

  return measurement.value
}

function readViscosity(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'dynamic viscosity',
        'fluid viscosity',
        'viscosity',
        'viskozite',
        'mu',
      ],
      [
        'mpa s',
        'pa s',
        'pas',
        'cp',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
      'mpa s' ||
    measurement.unit ===
      'cp'
  ) {
    return (
      measurement.value /
      1000
    )
  }

  return measurement.value
}

function readPressure(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'absolute pressure',
        'pressure',
        'basinc',
      ],
      [
        'mpa',
        'kpa',
        'bar',
        'pa',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
    'mpa'
  ) {
    return (
      measurement.value *
      1_000_000
    )
  }

  if (
    measurement.unit ===
    'kpa'
  ) {
    return (
      measurement.value *
      1000
    )
  }

  if (
    measurement.unit ===
    'bar'
  ) {
    return (
      measurement.value *
      100_000
    )
  }

  return measurement.value
}

function readVolume(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'gas volume',
        'volume',
        'hacim',
      ],
      [
        'm3',
        'ml',
        'l',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
    'l'
  ) {
    return (
      measurement.value /
      1000
    )
  }

  if (
    measurement.unit ===
    'ml'
  ) {
    return (
      measurement.value /
      1_000_000
    )
  }

  return measurement.value
}

function readMoles(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'amount of gas',
        'number of moles',
        'moles',
        'mol sayisi',
      ],
      [
        'kmol',
        'mol',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
    'kmol'
  ) {
    return (
      measurement.value *
      1000
    )
  }

  return measurement.value
}

function readTemperature(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'absolute temperature',
        'temperature',
        'sicaklik',
      ],
      [
        'celsius',
        'deg c',
        'k',
        'c',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
      'c' ||
    measurement.unit ===
      'deg c' ||
    measurement.unit ===
      'celsius'
  ) {
    return (
      measurement.value +
      273.15
    )
  }

  return measurement.value
}

function readHeatTransferCoefficient(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'convection coefficient',
        'heat transfer coefficient',
        'tasinim katsayisi',
      ],
      [
        'w/m2 k',
        'w/m2k',
      ],
    )

  return (
    measurement?.value ??
    null
  )
}

function readThermalConductivity(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'solid thermal conductivity',
        'thermal conductivity',
        'isi iletim katsayisi',
      ],
      [
        'w/m k',
        'w/mk',
      ],
    )

  return (
    measurement?.value ??
    null
  )
}

function formatNumber(
  value: number,
): string {
  const absoluteValue =
    Math.abs(
      value,
    )

  if (absoluteValue === 0) {
    return '0'
  }

  if (
    absoluteValue >=
      100_000 ||
    absoluteValue <
      0.001
  ) {
    return value
      .toExponential(4)
      .replace(
        /\.?0+e/,
        'e',
      )
  }

  return Number(
    value.toPrecision(6),
  ).toString()
}

function solveReynoldsNumber(
  query: string,
): ProblemQuickSolution | undefined {
  const density =
    readDensity(
      query,
    )

  const velocity =
    readVelocity(
      query,
    )

  const diameter =
    readLength(
      query,
      [
        'characteristic diameter',
        'hydraulic diameter',
        'inside diameter',
        'pipe diameter',
        'diameter',
        'boru capi',
      ],
    )

  const viscosity =
    readViscosity(
      query,
    )

  if (
    density === null ||
    velocity === null ||
    diameter === null ||
    viscosity === null
  ) {
    return undefined
  }

  if (
    density <= 0 ||
    velocity < 0 ||
    diameter <= 0 ||
    viscosity <= 0
  ) {
    return undefined
  }

  const reynoldsNumber =
    (
      density *
      velocity *
      diameter
    ) /
    viscosity

  const regime =
    reynoldsNumber < 2300
      ? 'Laminar'
      : reynoldsNumber < 4000
        ? 'Transitional'
        : 'Turbulent'

  return {
    resultLabel:
      'Reynolds number',
    resultValue:
      `${formatNumber(
        reynoldsNumber,
      )} (${regime})`,
    numericValue:
      reynoldsNumber,
    unit: 'dimensionless',
    equation:
      'Re = ρvD/μ',
    steps: [
      `Multiply ρvD: ${formatNumber(
        density *
        velocity *
        diameter,
      )}`,
      `Divide by μ: ${formatNumber(
        viscosity,
      )} Pa s`,
      `Classify the regime: ${regime}`,
    ],
    assumptions: [
      'Single-phase flow',
      'Properties evaluated at the stated operating condition',
    ],
  }
}

function solvePressureDrop(
  query: string,
): ProblemQuickSolution | undefined {
  const pipeLength =
    readLength(
      query,
      [
        'pipe length',
        'boru uzunlugu',
      ],
    )

  const diameter =
    readLength(
      query,
      [
        'inside diameter',
        'internal diameter',
        'pipe diameter',
        'diameter',
        'boru capi',
      ],
    )

  const density =
    readDensity(
      query,
    )

  const viscosity =
    readViscosity(
      query,
    )

  const roughness =
    readLength(
      query,
      [
        'surface roughness',
        'absolute roughness',
        'roughness',
        'puruzluluk',
      ],
    )

  const statedVelocity =
    readVelocity(
      query,
    )

  const flowRate =
    readFlowRate(
      query,
    )

  if (
    pipeLength === null ||
    diameter === null ||
    density === null ||
    viscosity === null ||
    roughness === null ||
    (
      statedVelocity === null &&
      flowRate === null
    )
  ) {
    return undefined
  }

  if (
    pipeLength <= 0 ||
    diameter <= 0 ||
    density <= 0 ||
    viscosity <= 0 ||
    roughness < 0
  ) {
    return undefined
  }

  const velocity =
    statedVelocity ??
    (
      4 *
      (flowRate as number)
    ) /
    (
      Math.PI *
      diameter *
      diameter
    )

  if (
    !Number.isFinite(
      velocity,
    ) ||
    velocity < 0
  ) {
    return undefined
  }

  const reynoldsNumber =
    (
      density *
      velocity *
      diameter
    ) /
    viscosity

  if (
    !Number.isFinite(
      reynoldsNumber,
    ) ||
    reynoldsNumber <= 0
  ) {
    return undefined
  }

  const laminar =
    reynoldsNumber < 2300

  const transitional =
    reynoldsNumber >= 2300 &&
    reynoldsNumber < 4000

  const frictionFactor =
    laminar
      ? 64 /
        reynoldsNumber
      : 0.25 /
        (
          Math.log10(
            roughness /
              (
                3.7 *
                diameter
              ) +
              5.74 /
                Math.pow(
                  reynoldsNumber,
                  0.9,
                ),
          ) ** 2
        )

  const pressureDrop =
    frictionFactor *
    (
      pipeLength /
      diameter
    ) *
    (
      density *
      velocity *
      velocity /
      2
    )

  const headLoss =
    pressureDrop /
    (
      density *
      STANDARD_GRAVITY
    )

  const displayedResult =
    pressureDrop >= 1000
      ? `${formatNumber(
          pressureDrop /
          1000,
        )} kPa`
      : `${formatNumber(
          pressureDrop,
        )} Pa`

  return {
    resultLabel:
      'Pipe pressure drop',
    resultValue:
      displayedResult,
    numericValue:
      pressureDrop,
    unit: 'Pa',
    equation:
      'ΔP = f(L/D)(ρv²/2)',
    steps: [
      `Velocity = ${formatNumber(
        velocity,
      )} m/s`,
      `Re = ${formatNumber(
        reynoldsNumber,
      )}`,
      `Darcy friction factor = ${formatNumber(
        frictionFactor,
      )}`,
      `Head loss = ${formatNumber(
        headLoss,
      )} m`,
    ],
    assumptions: [
      'Steady incompressible flow',
      'Fully developed circular-pipe flow',
      laminar
        ? 'Laminar relation f = 64/Re'
        : 'Swamee–Jain turbulent friction-factor correlation',
      ...(transitional
        ? [
            'The Reynolds number is transitional; verify the friction factor carefully.',
          ]
        : []),
    ],
  }
}

function solvePumpPower(
  query: string,
): ProblemQuickSolution | undefined {
  const density =
    readDensity(
      query,
    )

  const flowRate =
    readFlowRate(
      query,
    )

  const head =
    readLength(
      query,
      [
        'total head',
        'pump head',
        'head',
        'basma yuksekligi',
      ],
    )

  const efficiency =
    extractEfficiency(
      query,
    )

  if (
    density === null ||
    flowRate === null ||
    head === null ||
    efficiency === null
  ) {
    return undefined
  }

  if (
    density <= 0 ||
    flowRate < 0 ||
    head < 0
  ) {
    return undefined
  }

  const hydraulicPower =
    density *
    STANDARD_GRAVITY *
    flowRate *
    head

  const shaftPower =
    hydraulicPower /
    efficiency

  const displayedResult =
    shaftPower >= 1000
      ? `${formatNumber(
          shaftPower /
          1000,
        )} kW`
      : `${formatNumber(
          shaftPower,
        )} W`

  return {
    resultLabel:
      'Required pump power',
    resultValue:
      displayedResult,
    numericValue:
      shaftPower,
    unit: 'W',
    equation:
      'P = ρgQH/η',
    steps: [
      `Hydraulic power = ${formatNumber(
        hydraulicPower,
      )} W`,
      `Pump efficiency = ${formatNumber(
        efficiency *
        100,
      )}%`,
      `Required shaft power = ${displayedResult}`,
    ],
    assumptions: [
      'Steady incompressible flow',
      'The supplied head is the total dynamic head',
    ],
  }
}

function solveBiotNumber(
  query: string,
): ProblemQuickSolution | undefined {
  const coefficient =
    readHeatTransferCoefficient(
      query,
    )

  const characteristicLength =
    readLength(
      query,
      [
        'characteristic length',
        'karakteristik uzunluk',
      ],
    )

  const conductivity =
    readThermalConductivity(
      query,
    )

  if (
    coefficient === null ||
    characteristicLength === null ||
    conductivity === null
  ) {
    return undefined
  }

  if (
    coefficient < 0 ||
    characteristicLength <= 0 ||
    conductivity <= 0
  ) {
    return undefined
  }

  const biotNumber =
    (
      coefficient *
      characteristicLength
    ) /
    conductivity

  const interpretation =
    biotNumber < 0.1
      ? 'Lumped-capacitance approximation is generally appropriate.'
      : 'Internal temperature gradients may be important.'

  return {
    resultLabel:
      'Biot number',
    resultValue:
      formatNumber(
        biotNumber,
      ),
    numericValue:
      biotNumber,
    unit: 'dimensionless',
    equation:
      'Bi = hLc/k',
    steps: [
      `Calculate hLc: ${formatNumber(
        coefficient *
        characteristicLength,
      )}`,
      `Divide by k: ${formatNumber(
        conductivity,
      )} W/m K`,
      interpretation,
    ],
    assumptions: [
      'Uniform convection coefficient',
      'Constant solid thermal conductivity',
    ],
  }
}

function solveIdealGas(
  query: string,
): ProblemQuickSolution | undefined {
  const pressure =
    readPressure(
      query,
    )

  const volume =
    readVolume(
      query,
    )

  const moles =
    readMoles(
      query,
    )

  const temperature =
    readTemperature(
      query,
    )

  const suppliedCount = [
    pressure,
    volume,
    moles,
    temperature,
  ].filter(
    (value) =>
      value !== null,
  ).length

  if (
    suppliedCount !== 3
  ) {
    return undefined
  }

  if (
    (
      pressure !== null &&
      pressure <= 0
    ) ||
    (
      volume !== null &&
      volume <= 0
    ) ||
    (
      moles !== null &&
      moles <= 0
    ) ||
    (
      temperature !== null &&
      temperature <= 0
    )
  ) {
    return undefined
  }

  let resultLabel = ''
  let resultValue = ''
  let numericValue = 0
  let unit = ''
  let substitution = ''

  if (pressure === null) {
    numericValue =
      (
        (moles as number) *
        GAS_CONSTANT *
        (temperature as number)
      ) /
      (volume as number)

    resultLabel =
      'Gas pressure'

    resultValue =
      numericValue >= 1000
        ? `${formatNumber(
            numericValue /
            1000,
          )} kPa`
        : `${formatNumber(
            numericValue,
          )} Pa`

    unit = 'Pa'

    substitution =
      'P = nRT/V'
  } else if (volume === null) {
    numericValue =
      (
        moles as number
      ) *
      GAS_CONSTANT *
      (
        temperature as number
      ) /
      pressure

    resultLabel =
      'Gas volume'

    resultValue =
      `${formatNumber(
        numericValue,
      )} m3`

    unit = 'm3'

    substitution =
      'V = nRT/P'
  } else if (moles === null) {
    numericValue =
      (
        pressure *
        volume
      ) /
      (
        GAS_CONSTANT *
        (temperature as number)
      )

    resultLabel =
      'Amount of gas'

    resultValue =
      `${formatNumber(
        numericValue,
      )} mol`

    unit = 'mol'

    substitution =
      'n = PV/(RT)'
  } else {
    numericValue =
      (
        pressure *
        volume
      ) /
      (
        moles *
        GAS_CONSTANT
      )

    resultLabel =
      'Absolute temperature'

    resultValue =
      `${formatNumber(
        numericValue,
      )} K`

    unit = 'K'

    substitution =
      'T = PV/(nR)'
  }

  if (
    !Number.isFinite(
      numericValue,
    )
  ) {
    return undefined
  }

  return {
    resultLabel,
    resultValue,
    numericValue,
    unit,
    equation:
      'PV = nRT',
    steps: [
      'Convert all values to SI units.',
      `Rearrange the equation: ${substitution}`,
      `Use R = ${GAS_CONSTANT} J/(mol K).`,
    ],
    assumptions: [
      'Ideal-gas behavior',
      'Absolute pressure',
      'Absolute temperature',
    ],
  }
}

export function solveProblemQuickly(
  calculatorId: string,
  query: string,
): ProblemQuickSolution | undefined {
  switch (calculatorId) {
    case 'pressureDrop':
      return solvePressureDrop(
        query,
      )

    case 'reynoldsNumber':
      return solveReynoldsNumber(
        query,
      )

    case 'pumpPower':
      return solvePumpPower(
        query,
      )

    case 'biotNumber':
      return solveBiotNumber(
        query,
      )

    case 'idealGas':
      return solveIdealGas(
        query,
      )

    default:
      return undefined
  }
}
