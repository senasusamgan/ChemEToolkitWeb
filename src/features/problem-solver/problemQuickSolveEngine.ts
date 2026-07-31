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

const STEFAN_BOLTZMANN =
  5.670374419e-8

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

function readFraction(
  query: string,
  aliases: string[],
): number | null {
  const cleanQuery =
    normalizeText(query)

  const aliasPattern =
    createAlternatives(
      aliases,
    )

  const pattern =
    new RegExp(
      '(?:^|\\b)(?:' +
        aliasPattern +
        ')(?=\\b|\\s|:|=)\\s*(?:=|:|is)?\\s*(' +
        NUMBER_SOURCE +
        ')\\s*(%|percent)?',
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
    value < 0 ||
    value > 1
  ) {
    return null
  }

  return value
}

function readTemperatureDifference(
  query: string,
  aliases: string[],
): number | null {
  const measurement =
    extractMeasurement(
      query,
      aliases,
      [
        'deg c',
        'celsius',
        'k',
        'c',
      ],
    )

  if (!measurement) {
    return null
  }

  return Math.abs(
    measurement.value,
  )
}

function readHeatDuty(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'heat duty',
        'heat load',
        'thermal duty',
        'isi yuku',
      ],
      [
        'mw',
        'kw',
        'w',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
    'mw'
  ) {
    return (
      measurement.value *
      1_000_000
    )
  }

  if (
    measurement.unit ===
    'kw'
  ) {
    return (
      measurement.value *
      1000
    )
  }

  return measurement.value
}

function readOverallHeatTransferCoefficient(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'overall heat transfer coefficient',
        'overall u value',
        'u value',
      ],
      [
        'kw/m2 k',
        'kw/m2k',
        'w/m2 k',
        'w/m2k',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
      'kw/m2 k' ||
    measurement.unit ===
      'kw/m2k'
  ) {
    return (
      measurement.value *
      1000
    )
  }

  return measurement.value
}

function readMolarFlow(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'feed molar flow',
        'molar feed rate',
        'feed rate',
        'besleme molar debisi',
      ],
      [
        'kmol/s',
        'mol/s',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
    'kmol/s'
  ) {
    return (
      measurement.value *
      1000
    )
  }

  return measurement.value
}

function readVolumetricReactionRate(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'exit reaction rate',
        'reaction rate',
        'exit rate',
        'reaksiyon hizi',
      ],
      [
        'kmol/m3 s',
        'kmol/m3s',
        'mol/m3 s',
        'mol/m3s',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
      'kmol/m3 s' ||
    measurement.unit ===
      'kmol/m3s'
  ) {
    return (
      measurement.value *
      1000
    )
  }

  return measurement.value
}

function readArea(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'heat transfer area',
        'wall area',
        'surface area',
        'area',
        'alan',
      ],
      [
        'mm2',
        'cm2',
        'm2',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
    'mm2'
  ) {
    return (
      measurement.value /
      1_000_000
    )
  }

  if (
    measurement.unit ===
    'cm2'
  ) {
    return (
      measurement.value /
      10_000
    )
  }

  return measurement.value
}

function readDiffusivity(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'diffusion coefficient',
        'mass diffusivity',
        'diffusivity',
        'difuzyon katsayisi',
      ],
      [
        'cm2/s',
        'm2/s',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
    'cm2/s'
  ) {
    return (
      measurement.value *
      0.0001
    )
  }

  return measurement.value
}

function readConcentrationDifference(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'concentration difference',
        'delta concentration',
        'concentration gradient numerator',
        'derisim farki',
      ],
      [
        'kmol/m3',
        'mol/m3',
        'mol/l',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
      'kmol/m3' ||
    measurement.unit ===
      'mol/l'
  ) {
    return (
      measurement.value *
      1000
    )
  }

  return measurement.value
}

function readDimensionlessValue(
  query: string,
  aliases: string[],
): number | null {
  const cleanQuery =
    normalizeText(query)

  const aliasPattern =
    createAlternatives(
      aliases,
    )

  if (!aliasPattern) {
    return null
  }

  const pattern =
    new RegExp(
      '(?:^|\\b)(?:' +
        aliasPattern +
        ')(?=\\b|\\s|:|=)\\s*(?:=|:|is)?\\s*(' +
        NUMBER_SOURCE +
        ')(?=\\s|$|[.;,)])',
    )

  const match =
    pattern.exec(
      cleanQuery,
    )

  if (!match) {
    return null
  }

  const value =
    Number(
      match[1],
    )

  return Number.isFinite(
    value,
  )
    ? value
    : null
}

function readTemperatureByAliases(
  query: string,
  aliases: string[],
): number | null {
  const measurement =
    extractMeasurement(
      query,
      aliases,
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

function readTimeSeconds(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'elapsed time',
        'process time',
        'time',
        'sure',
      ],
      [
        'hour',
        'hr',
        'min',
        'h',
        's',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
      'hour' ||
    measurement.unit ===
      'hr' ||
    measurement.unit ===
      'h'
  ) {
    return (
      measurement.value *
      3600
    )
  }

  if (
    measurement.unit ===
    'min'
  ) {
    return (
      measurement.value *
      60
    )
  }

  return measurement.value
}

function readThermalDiffusivity(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'thermal diffusivity',
        'heat diffusivity',
        'termal difuzivite',
        'alpha',
      ],
      [
        'cm2/s',
        'mm2/s',
        'm2/s',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
    'cm2/s'
  ) {
    return (
      measurement.value *
      0.0001
    )
  }

  if (
    measurement.unit ===
    'mm2/s'
  ) {
    return (
      measurement.value *
      0.000001
    )
  }

  return measurement.value
}

function readSpecificHeatCapacity(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'specific heat capacity',
        'specific heat',
        'heat capacity',
        'ozgul isi',
        'cp',
      ],
      [
        'kj/kg k',
        'kj/kgk',
        'j/kg k',
        'j/kgk',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
      'kj/kg k' ||
    measurement.unit ===
      'kj/kgk'
  ) {
    return (
      measurement.value *
      1000
    )
  }

  return measurement.value
}

function readDensityByAliases(
  query: string,
  aliases: string[],
): number | null {
  const measurement =
    extractMeasurement(
      query,
      aliases,
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

function readAreaByAliases(
  query: string,
  aliases: string[],
): number | null {
  const measurement =
    extractMeasurement(
      query,
      aliases,
      [
        'mm2',
        'cm2',
        'm2',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
    'mm2'
  ) {
    return (
      measurement.value /
      1_000_000
    )
  }

  if (
    measurement.unit ===
    'cm2'
  ) {
    return (
      measurement.value /
      10_000
    )
  }

  return measurement.value
}

function readPressureDifference(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'differential pressure',
        'pressure difference',
        'pressure drop',
        'basinc farki',
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

function readKinematicViscosity(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'kinematic viscosity',
        'kinematik viskozite',
        'nu',
      ],
      [
        'mm2/s',
        'cm2/s',
        'm2/s',
        'cst',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
      'mm2/s' ||
    measurement.unit ===
      'cst'
  ) {
    return (
      measurement.value *
      0.000001
    )
  }

  if (
    measurement.unit ===
    'cm2/s'
  ) {
    return (
      measurement.value *
      0.0001
    )
  }

  return measurement.value
}

function readThermalExpansionCoefficient(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'volumetric thermal expansion coefficient',
        'thermal expansion coefficient',
        'expansion coefficient',
        'genlesme katsayisi',
        'beta',
      ],
      [
        '1/k',
        'k-1',
      ],
    )

  return (
    measurement?.value ??
    null
  )
}

function readMolarFlux(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'molar flux',
        'diffusive flux',
        'mass transfer flux',
        'molar akis',
      ],
      [
        'kmol/m2 s',
        'kmol/m2s',
        'mol/m2 s',
        'mol/m2s',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
      'kmol/m2 s' ||
    measurement.unit ===
      'kmol/m2s'
  ) {
    return (
      measurement.value *
      1000
    )
  }

  return measurement.value
}

function readMassKilograms(
  query: string,
  aliases: string[],
): number | null {
  const measurement =
    extractMeasurement(
      query,
      aliases,
      [
        'kg',
        'mg',
        'g',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
    'g'
  ) {
    return (
      measurement.value /
      1000
    )
  }

  if (
    measurement.unit ===
    'mg'
  ) {
    return (
      measurement.value /
      1_000_000
    )
  }

  return measurement.value
}

function readMolecularWeightValue(
  query: string,
  aliases: string[],
): number | null {
  const measurement =
    extractMeasurement(
      query,
      aliases,
      [
        'kg/kmol',
        'kg/mol',
        'g/mol',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
    'kg/mol'
  ) {
    return (
      measurement.value *
      1000
    )
  }

  return measurement.value
}

function readMassFlowKilogramsPerSecond(
  query: string,
): number | null {
  const measurement =
    extractMeasurement(
      query,
      [
        'mass flow rate',
        'mass flow',
        'mass feed rate',
        'kutlesel debi',
      ],
      [
        'kg/min',
        'kg/h',
        'kg/s',
        'g/min',
        'g/s',
      ],
    )

  if (!measurement) {
    return null
  }

  if (
    measurement.unit ===
    'kg/h'
  ) {
    return (
      measurement.value /
      3600
    )
  }

  if (
    measurement.unit ===
    'kg/min'
  ) {
    return (
      measurement.value /
      60
    )
  }

  if (
    measurement.unit ===
    'g/s'
  ) {
    return (
      measurement.value /
      1000
    )
  }

  if (
    measurement.unit ===
    'g/min'
  ) {
    return (
      measurement.value /
      60_000
    )
  }

  return measurement.value
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

function solveHeatExchangerLmtd(
  query: string,
): ProblemQuickSolution | undefined {
  const deltaT1 =
    readTemperatureDifference(
      query,
      [
        'terminal temperature difference 1',
        'temperature difference 1',
        'delta t1',
        'dt1',
        'sicaklik farki 1',
      ],
    )

  const deltaT2 =
    readTemperatureDifference(
      query,
      [
        'terminal temperature difference 2',
        'temperature difference 2',
        'delta t2',
        'dt2',
        'sicaklik farki 2',
      ],
    )

  if (
    deltaT1 === null ||
    deltaT2 === null ||
    deltaT1 <= 0 ||
    deltaT2 <= 0
  ) {
    return undefined
  }

  const lmtd =
    Math.abs(
      deltaT1 -
      deltaT2,
    ) < 1e-12
      ? deltaT1
      : (
          deltaT1 -
          deltaT2
        ) /
        Math.log(
          deltaT1 /
          deltaT2,
        )

  if (
    !Number.isFinite(
      lmtd,
    ) ||
    lmtd <= 0
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Log mean temperature difference',
    resultValue:
      `${formatNumber(
        lmtd,
      )} K`,
    numericValue:
      lmtd,
    unit: 'K',
    equation:
      'ΔTlm = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂)',
    steps: [
      `ΔT₁ = ${formatNumber(
        deltaT1,
      )} K`,
      `ΔT₂ = ${formatNumber(
        deltaT2,
      )} K`,
      `LMTD = ${formatNumber(
        lmtd,
      )} K`,
    ],
    assumptions: [
      'Both terminal temperature differences are positive',
      'A consistent flow arrangement is used',
    ],
  }
}

function solveHeatExchangerArea(
  query: string,
): ProblemQuickSolution | undefined {
  const heatDuty =
    readHeatDuty(
      query,
    )

  const overallCoefficient =
    readOverallHeatTransferCoefficient(
      query,
    )

  const lmtd =
    readTemperatureDifference(
      query,
      [
        'log mean temperature difference',
        'lmtd',
      ],
    )

  const correctionFactor =
    readFraction(
      query,
      [
        'correction factor',
        'lmtd correction factor',
        'duzeltme faktoru',
      ],
    )

  if (
    heatDuty === null ||
    overallCoefficient === null ||
    lmtd === null ||
    correctionFactor === null ||
    heatDuty < 0 ||
    overallCoefficient <= 0 ||
    lmtd <= 0 ||
    correctionFactor <= 0
  ) {
    return undefined
  }

  const area =
    heatDuty /
    (
      overallCoefficient *
      correctionFactor *
      lmtd
    )

  if (
    !Number.isFinite(
      area,
    )
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Required heat-exchanger area',
    resultValue:
      `${formatNumber(
        area,
      )} m2`,
    numericValue:
      area,
    unit: 'm2',
    equation:
      'A = Q/(UFΔTlm)',
    steps: [
      `Heat duty = ${formatNumber(
        heatDuty,
      )} W`,
      `Effective driving force = ${formatNumber(
        correctionFactor *
        lmtd,
      )} K`,
      `Required area = ${formatNumber(
        area,
      )} m2`,
    ],
    assumptions: [
      'Overall heat-transfer coefficient is constant',
      'The supplied LMTD correction factor is applicable',
      'Heat losses are neglected',
    ],
  }
}

function solveCstrVolume(
  query: string,
): ProblemQuickSolution | undefined {
  const feedMolarFlow =
    readMolarFlow(
      query,
    )

  const conversion =
    readFraction(
      query,
      [
        'target conversion',
        'conversion',
        'donusum',
      ],
    )

  const exitReactionRate =
    readVolumetricReactionRate(
      query,
    )

  if (
    feedMolarFlow === null ||
    conversion === null ||
    exitReactionRate === null ||
    feedMolarFlow < 0 ||
    conversion < 0 ||
    conversion > 1 ||
    exitReactionRate <= 0
  ) {
    return undefined
  }

  const volume =
    (
      feedMolarFlow *
      conversion
    ) /
    exitReactionRate

  if (
    !Number.isFinite(
      volume,
    )
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Required CSTR volume',
    resultValue:
      `${formatNumber(
        volume,
      )} m3`,
    numericValue:
      volume,
    unit: 'm3',
    equation:
      'V = Fₐ₀X/(−rₐ)exit',
    steps: [
      `Reacted molar flow = ${formatNumber(
        feedMolarFlow *
        conversion,
      )} mol/s`,
      `Exit reaction rate = ${formatNumber(
        exitReactionRate,
      )} mol/(m3 s)`,
      `CSTR volume = ${formatNumber(
        volume,
      )} m3`,
    ],
    assumptions: [
      'Steady-state operation',
      'Perfect mixing',
      'The reaction rate is evaluated at exit conditions',
    ],
  }
}

function solveHydrostaticPressure(
  query: string,
): ProblemQuickSolution | undefined {
  const density =
    readDensity(
      query,
    )

  const depth =
    readLength(
      query,
      [
        'liquid depth',
        'fluid depth',
        'liquid height',
        'fluid height',
        'depth',
        'derinlik',
        'sivi yuksekligi',
      ],
    )

  if (
    density === null ||
    depth === null ||
    density <= 0 ||
    depth < 0
  ) {
    return undefined
  }

  const pressure =
    density *
    STANDARD_GRAVITY *
    depth

  if (
    !Number.isFinite(
      pressure,
    )
  ) {
    return undefined
  }

  const displayedResult =
    pressure >= 1000
      ? `${formatNumber(
          pressure /
          1000,
        )} kPa`
      : `${formatNumber(
          pressure,
        )} Pa`

  return {
    resultLabel:
      'Hydrostatic gauge pressure',
    resultValue:
      displayedResult,
    numericValue:
      pressure,
    unit: 'Pa',
    equation:
      'ΔP = ρgh',
    steps: [
      `Density = ${formatNumber(
        density,
      )} kg/m3`,
      `Liquid depth = ${formatNumber(
        depth,
      )} m`,
      `Gauge pressure = ${displayedResult}`,
    ],
    assumptions: [
      'Constant fluid density',
      'Standard gravitational acceleration',
      'Pressure is reported relative to the free surface',
    ],
  }
}

function solvePlaneWallConduction(
  query: string,
): ProblemQuickSolution | undefined {
  const conductivity =
    readThermalConductivity(
      query,
    )

  const area =
    readArea(
      query,
    )

  const temperatureDifference =
    readTemperatureDifference(
      query,
      [
        'wall temperature difference',
        'temperature difference',
        'delta temperature',
        'delta t',
        'sicaklik farki',
      ],
    )

  const thickness =
    readLength(
      query,
      [
        'plane wall thickness',
        'wall thickness',
        'thickness',
        'duvar kalinligi',
        'kalinlik',
      ],
    )

  if (
    conductivity === null ||
    area === null ||
    temperatureDifference === null ||
    thickness === null ||
    conductivity <= 0 ||
    area < 0 ||
    temperatureDifference < 0 ||
    thickness <= 0
  ) {
    return undefined
  }

  const heatTransferRate =
    (
      conductivity *
      area *
      temperatureDifference
    ) /
    thickness

  if (
    !Number.isFinite(
      heatTransferRate,
    )
  ) {
    return undefined
  }

  const displayedResult =
    heatTransferRate >= 1000
      ? `${formatNumber(
          heatTransferRate /
          1000,
        )} kW`
      : `${formatNumber(
          heatTransferRate,
        )} W`

  return {
    resultLabel:
      'Plane-wall heat-transfer rate',
    resultValue:
      displayedResult,
    numericValue:
      heatTransferRate,
    unit: 'W',
    equation:
      'Q = kAΔT/L',
    steps: [
      `Conductive factor kA/L = ${formatNumber(
        (
          conductivity *
          area
        ) /
        thickness,
      )} W/K`,
      `Temperature difference = ${formatNumber(
        temperatureDifference,
      )} K`,
      `Heat-transfer rate = ${displayedResult}`,
    ],
    assumptions: [
      'Steady one-dimensional conduction',
      'Constant thermal conductivity',
      'No internal heat generation',
    ],
  }
}

function solveFicksFirstLaw(
  query: string,
): ProblemQuickSolution | undefined {
  const diffusivity =
    readDiffusivity(
      query,
    )

  const concentrationDifference =
    readConcentrationDifference(
      query,
    )

  const diffusionDistance =
    readLength(
      query,
      [
        'diffusion distance',
        'film thickness',
        'membrane thickness',
        'diffusion length',
        'difuzyon mesafesi',
      ],
    )

  if (
    diffusivity === null ||
    concentrationDifference === null ||
    diffusionDistance === null ||
    diffusivity <= 0 ||
    diffusionDistance <= 0
  ) {
    return undefined
  }

  const flux =
    (
      diffusivity *
      Math.abs(
        concentrationDifference,
      )
    ) /
    diffusionDistance

  if (
    !Number.isFinite(
      flux,
    )
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Diffusive molar flux magnitude',
    resultValue:
      `${formatNumber(
        flux,
      )} mol/(m2 s)`,
    numericValue:
      flux,
    unit: 'mol/(m2 s)',
    equation:
      '|Jₐ| = Dₐᵦ|ΔCₐ|/L',
    steps: [
      `Concentration gradient magnitude = ${formatNumber(
        Math.abs(
          concentrationDifference,
        ) /
        diffusionDistance,
      )} mol/m4`,
      `Diffusivity = ${formatNumber(
        diffusivity,
      )} m2/s`,
      `Flux magnitude = ${formatNumber(
        flux,
      )} mol/(m2 s)`,
    ],
    assumptions: [
      'Steady one-dimensional diffusion',
      'Constant diffusivity',
      'A linear concentration profile',
    ],
  }
}

function solveConvectionHeatTransfer(
  query: string,
): ProblemQuickSolution | undefined {
  const coefficient =
    readHeatTransferCoefficient(
      query,
    )

  const area =
    readArea(
      query,
    )

  const temperatureDifference =
    readTemperatureDifference(
      query,
      [
        'surface fluid temperature difference',
        'convection temperature difference',
        'temperature difference',
        'delta temperature',
        'delta t',
        'sicaklik farki',
      ],
    )

  if (
    coefficient === null ||
    area === null ||
    temperatureDifference === null ||
    coefficient < 0 ||
    area < 0 ||
    temperatureDifference < 0
  ) {
    return undefined
  }

  const heatTransferRate =
    coefficient *
    area *
    temperatureDifference

  if (
    !Number.isFinite(
      heatTransferRate,
    )
  ) {
    return undefined
  }

  const displayedResult =
    heatTransferRate >= 1000
      ? `${formatNumber(
          heatTransferRate /
          1000,
        )} kW`
      : `${formatNumber(
          heatTransferRate,
        )} W`

  return {
    resultLabel:
      'Convective heat-transfer rate',
    resultValue:
      displayedResult,
    numericValue:
      heatTransferRate,
    unit: 'W',
    equation:
      'Q = hAΔT',
    steps: [
      `Convection coefficient = ${formatNumber(
        coefficient,
      )} W/(m2 K)`,
      `Area × temperature difference = ${formatNumber(
        area *
        temperatureDifference,
      )} m2 K`,
      `Heat-transfer rate = ${displayedResult}`,
    ],
    assumptions: [
      'Uniform convection coefficient',
      'Uniform surface and bulk-fluid temperatures',
      'Steady heat transfer',
    ],
  }
}

function solveNusseltNumber(
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
        'hydraulic diameter',
        'characteristic diameter',
        'length',
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
    conductivity === null ||
    coefficient < 0 ||
    characteristicLength <= 0 ||
    conductivity <= 0
  ) {
    return undefined
  }

  const nusseltNumber =
    (
      coefficient *
      characteristicLength
    ) /
    conductivity

  if (
    !Number.isFinite(
      nusseltNumber,
    )
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Nusselt number',
    resultValue:
      formatNumber(
        nusseltNumber,
      ),
    numericValue:
      nusseltNumber,
    unit: 'dimensionless',
    equation:
      'Nu = hL/k',
    steps: [
      `hL = ${formatNumber(
        coefficient *
        characteristicLength,
      )} W/(m K)`,
      `Fluid thermal conductivity = ${formatNumber(
        conductivity,
      )} W/(m K)`,
      `Nusselt number = ${formatNumber(
        nusseltNumber,
      )}`,
    ],
    assumptions: [
      'The stated length is the applicable characteristic length',
      'The thermal conductivity belongs to the fluid',
      'Properties are evaluated at the stated operating condition',
    ],
  }
}

function solveFroudeNumber(
  query: string,
): ProblemQuickSolution | undefined {
  const velocity =
    readVelocity(
      query,
    )

  const characteristicLength =
    readLength(
      query,
      [
        'hydraulic depth',
        'flow depth',
        'characteristic length',
        'liquid depth',
        'depth',
        'derinlik',
      ],
    )

  if (
    velocity === null ||
    characteristicLength === null ||
    velocity < 0 ||
    characteristicLength <= 0
  ) {
    return undefined
  }

  const froudeNumber =
    velocity /
    Math.sqrt(
      STANDARD_GRAVITY *
      characteristicLength,
    )

  if (
    !Number.isFinite(
      froudeNumber,
    )
  ) {
    return undefined
  }

  const regime =
    Math.abs(
      froudeNumber -
      1,
    ) <= 0.05
      ? 'Near-critical'
      : froudeNumber < 1
        ? 'Subcritical'
        : 'Supercritical'

  return {
    resultLabel:
      'Froude number',
    resultValue:
      `${formatNumber(
        froudeNumber,
      )} (${regime})`,
    numericValue:
      froudeNumber,
    unit: 'dimensionless',
    equation:
      'Fr = v/√(gL)',
    steps: [
      `Gravity-wave velocity scale = ${formatNumber(
        Math.sqrt(
          STANDARD_GRAVITY *
          characteristicLength,
        ),
      )} m/s`,
      `Flow velocity = ${formatNumber(
        velocity,
      )} m/s`,
      `Flow regime = ${regime}`,
    ],
    assumptions: [
      'Gravity is the dominant restoring force',
      'The supplied length is the applicable hydraulic depth or characteristic length',
      'Standard gravitational acceleration',
    ],
  }
}

function solveVolumetricFlowRate(
  query: string,
): ProblemQuickSolution | undefined {
  const area =
    readArea(
      query,
    )

  const velocity =
    readVelocity(
      query,
    )

  if (
    area === null ||
    velocity === null ||
    area < 0 ||
    velocity < 0
  ) {
    return undefined
  }

  const flowRate =
    area *
    velocity

  if (
    !Number.isFinite(
      flowRate,
    )
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Volumetric flow rate',
    resultValue:
      `${formatNumber(
        flowRate,
      )} m3/s`,
    numericValue:
      flowRate,
    unit: 'm3/s',
    equation:
      'Q = Av',
    steps: [
      `Flow area = ${formatNumber(
        area,
      )} m2`,
      `Average velocity = ${formatNumber(
        velocity,
      )} m/s`,
      `Volumetric flow rate = ${formatNumber(
        flowRate,
      )} m3/s`,
    ],
    assumptions: [
      'Uniform average velocity',
      'The area is normal to the flow direction',
      'Steady flow',
    ],
  }
}

function solveDragForce(
  query: string,
): ProblemQuickSolution | undefined {
  const dragCoefficient =
    readDimensionlessValue(
      query,
      [
        'drag coefficient',
        'coefficient of drag',
        'suruklenme katsayisi',
      ],
    )

  const density =
    readDensity(
      query,
    )

  const velocity =
    readVelocity(
      query,
    )

  const area =
    readArea(
      query,
    )

  if (
    dragCoefficient === null ||
    density === null ||
    velocity === null ||
    area === null ||
    dragCoefficient < 0 ||
    density <= 0 ||
    velocity < 0 ||
    area < 0
  ) {
    return undefined
  }

  const dragForce =
    0.5 *
    dragCoefficient *
    density *
    velocity *
    velocity *
    area

  if (
    !Number.isFinite(
      dragForce,
    )
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Drag force',
    resultValue:
      `${formatNumber(
        dragForce,
      )} N`,
    numericValue:
      dragForce,
    unit: 'N',
    equation:
      'Fᴅ = ½Cᴅρv²A',
    steps: [
      `Dynamic pressure = ${formatNumber(
        0.5 *
        density *
        velocity *
        velocity,
      )} Pa`,
      `CᴅA = ${formatNumber(
        dragCoefficient *
        area,
      )} m2`,
      `Drag force = ${formatNumber(
        dragForce,
      )} N`,
    ],
    assumptions: [
      'Constant drag coefficient',
      'Uniform approach velocity',
      'The area is the applicable projected reference area',
    ],
  }
}

function solveMinorLosses(
  query: string,
): ProblemQuickSolution | undefined {
  const lossCoefficient =
    readDimensionlessValue(
      query,
      [
        'total loss coefficient',
        'minor loss coefficient',
        'loss coefficient',
        'toplam kayip katsayisi',
      ],
    )

  const density =
    readDensity(
      query,
    )

  const velocity =
    readVelocity(
      query,
    )

  if (
    lossCoefficient === null ||
    density === null ||
    velocity === null ||
    lossCoefficient < 0 ||
    density <= 0 ||
    velocity < 0
  ) {
    return undefined
  }

  const headLoss =
    (
      lossCoefficient *
      velocity *
      velocity
    ) /
    (
      2 *
      STANDARD_GRAVITY
    )

  const pressureDrop =
    lossCoefficient *
    density *
    velocity *
    velocity /
    2

  if (
    !Number.isFinite(
      pressureDrop,
    )
  ) {
    return undefined
  }

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
      'Minor-loss pressure drop',
    resultValue:
      displayedResult,
    numericValue:
      pressureDrop,
    unit: 'Pa',
    equation:
      'ΔP = Kρv²/2',
    steps: [
      `Velocity head = ${formatNumber(
        velocity *
        velocity /
        (
          2 *
          STANDARD_GRAVITY
        ),
      )} m`,
      `Head loss = ${formatNumber(
        headLoss,
      )} m`,
      `Pressure drop = ${displayedResult}`,
    ],
    assumptions: [
      'Steady incompressible flow',
      'The supplied K value is the total minor-loss coefficient',
      'Velocity corresponds to the applicable pipe section',
    ],
  }
}

function solveThermalRadiation(
  query: string,
): ProblemQuickSolution | undefined {
  const emissivity =
    readFraction(
      query,
      [
        'surface emissivity',
        'emissivity',
        'yayinim katsayisi',
      ],
    )

  const area =
    readArea(
      query,
    )

  const surfaceTemperature =
    readTemperatureByAliases(
      query,
      [
        'surface temperature',
        'wall temperature',
        'yuzey sicakligi',
      ],
    )

  const surroundingsTemperature =
    readTemperatureByAliases(
      query,
      [
        'surroundings temperature',
        'ambient radiation temperature',
        'environment temperature',
        'cevre sicakligi',
      ],
    )

  if (
    emissivity === null ||
    area === null ||
    surfaceTemperature === null ||
    surroundingsTemperature === null ||
    emissivity < 0 ||
    emissivity > 1 ||
    area < 0 ||
    surfaceTemperature <= 0 ||
    surroundingsTemperature <= 0
  ) {
    return undefined
  }

  const netHeatTransfer =
    emissivity *
    STEFAN_BOLTZMANN *
    area *
    (
      Math.pow(
        surfaceTemperature,
        4,
      ) -
      Math.pow(
        surroundingsTemperature,
        4,
      )
    )

  if (
    !Number.isFinite(
      netHeatTransfer,
    )
  ) {
    return undefined
  }

  const displayedResult =
    Math.abs(
      netHeatTransfer,
    ) >= 1000
      ? `${formatNumber(
          netHeatTransfer /
          1000,
        )} kW`
      : `${formatNumber(
          netHeatTransfer,
        )} W`

  return {
    resultLabel:
      'Net radiative heat-transfer rate',
    resultValue:
      displayedResult,
    numericValue:
      netHeatTransfer,
    unit: 'W',
    equation:
      'Q = εσA(Tₛ⁴ − Tsur⁴)',
    steps: [
      `Surface temperature = ${formatNumber(
        surfaceTemperature,
      )} K`,
      `Surroundings temperature = ${formatNumber(
        surroundingsTemperature,
      )} K`,
      `Net radiation = ${displayedResult}`,
    ],
    assumptions: [
      'Diffuse gray surface',
      'Large isothermal surroundings',
      'View factor to the surroundings equals one',
    ],
  }
}

function solveFourierNumber(
  query: string,
): ProblemQuickSolution | undefined {
  const thermalDiffusivity =
    readThermalDiffusivity(
      query,
    )

  const time =
    readTimeSeconds(
      query,
    )

  const characteristicLength =
    readLength(
      query,
      [
        'characteristic length',
        'half thickness',
        'characteristic distance',
        'karakteristik uzunluk',
      ],
    )

  if (
    thermalDiffusivity === null ||
    time === null ||
    characteristicLength === null ||
    thermalDiffusivity <= 0 ||
    time < 0 ||
    characteristicLength <= 0
  ) {
    return undefined
  }

  const fourierNumber =
    (
      thermalDiffusivity *
      time
    ) /
    (
      characteristicLength *
      characteristicLength
    )

  if (
    !Number.isFinite(
      fourierNumber,
    )
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Fourier number',
    resultValue:
      formatNumber(
        fourierNumber,
      ),
    numericValue:
      fourierNumber,
    unit: 'dimensionless',
    equation:
      'Fo = αt/Lc²',
    steps: [
      `αt = ${formatNumber(
        thermalDiffusivity *
        time,
      )} m2`,
      `Lc² = ${formatNumber(
        characteristicLength *
        characteristicLength,
      )} m2`,
      `Fourier number = ${formatNumber(
        fourierNumber,
      )}`,
    ],
    assumptions: [
      'Constant thermal diffusivity',
      'The stated length is the applicable characteristic length',
      'Transient conduction model',
    ],
  }
}

function solvePrandtlNumber(
  query: string,
): ProblemQuickSolution | undefined {
  const specificHeat =
    readSpecificHeatCapacity(
      query,
    )

  const viscosity =
    readViscosity(
      query,
    )

  const conductivity =
    readThermalConductivity(
      query,
    )

  if (
    specificHeat === null ||
    viscosity === null ||
    conductivity === null ||
    specificHeat <= 0 ||
    viscosity <= 0 ||
    conductivity <= 0
  ) {
    return undefined
  }

  const prandtlNumber =
    (
      specificHeat *
      viscosity
    ) /
    conductivity

  if (
    !Number.isFinite(
      prandtlNumber,
    )
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Prandtl number',
    resultValue:
      formatNumber(
        prandtlNumber,
      ),
    numericValue:
      prandtlNumber,
    unit: 'dimensionless',
    equation:
      'Pr = cpμ/k',
    steps: [
      `cpμ = ${formatNumber(
        specificHeat *
        viscosity,
      )} W/(m K)`,
      `Thermal conductivity = ${formatNumber(
        conductivity,
      )} W/(m K)`,
      `Prandtl number = ${formatNumber(
        prandtlNumber,
      )}`,
    ],
    assumptions: [
      'Fluid properties are evaluated at one consistent temperature',
      'Dynamic viscosity is supplied',
      'The thermal conductivity belongs to the fluid',
    ],
  }
}

function solveUTubeManometer(
  query: string,
): ProblemQuickSolution | undefined {
  const manometerDensity =
    readDensityByAliases(
      query,
      [
        'manometer fluid density',
        'manometer liquid density',
        'manometre sivisi yogunlugu',
      ],
    )

  const processDensity =
    readDensityByAliases(
      query,
      [
        'process fluid density',
        'pipe fluid density',
        'system fluid density',
        'proses sivisi yogunlugu',
      ],
    )

  const levelDifference =
    readLength(
      query,
      [
        'manometer level difference',
        'column height difference',
        'level difference',
        'seviye farki',
      ],
    )

  if (
    manometerDensity === null ||
    processDensity === null ||
    levelDifference === null ||
    manometerDensity <= 0 ||
    processDensity <= 0 ||
    levelDifference < 0
  ) {
    return undefined
  }

  const pressureDifference =
    Math.abs(
      manometerDensity -
      processDensity,
    ) *
    STANDARD_GRAVITY *
    levelDifference

  if (
    !Number.isFinite(
      pressureDifference,
    )
  ) {
    return undefined
  }

  const displayedResult =
    pressureDifference >= 1000
      ? `${formatNumber(
          pressureDifference /
          1000,
        )} kPa`
      : `${formatNumber(
          pressureDifference,
        )} Pa`

  return {
    resultLabel:
      'Manometer pressure difference',
    resultValue:
      displayedResult,
    numericValue:
      pressureDifference,
    unit: 'Pa',
    equation:
      'ΔP = |ρm − ρf|gh',
    steps: [
      `Density difference = ${formatNumber(
        Math.abs(
          manometerDensity -
          processDensity,
        ),
      )} kg/m3`,
      `Column difference = ${formatNumber(
        levelDifference,
      )} m`,
      `Pressure difference = ${displayedResult}`,
    ],
    assumptions: [
      'Both pressure taps are at the same elevation',
      'Fluids are incompressible',
      'Capillary effects are neglected',
    ],
  }
}

function solveOrificeMeter(
  query: string,
): ProblemQuickSolution | undefined {
  const dischargeCoefficient =
    readDimensionlessValue(
      query,
      [
        'discharge coefficient',
        'orifice coefficient',
        'flow coefficient',
        'desarj katsayisi',
      ],
    )

  const orificeArea =
    readAreaByAliases(
      query,
      [
        'orifice opening area',
        'orifice area',
        'opening area',
        'orifis alani',
      ],
    )

  const pressureDifference =
    readPressureDifference(
      query,
    )

  const density =
    readDensity(
      query,
    )

  if (
    dischargeCoefficient === null ||
    orificeArea === null ||
    pressureDifference === null ||
    density === null ||
    dischargeCoefficient <= 0 ||
    orificeArea <= 0 ||
    pressureDifference < 0 ||
    density <= 0
  ) {
    return undefined
  }

  const flowRate =
    dischargeCoefficient *
    orificeArea *
    Math.sqrt(
      (
        2 *
        pressureDifference
      ) /
      density,
    )

  if (
    !Number.isFinite(
      flowRate,
    )
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Orifice volumetric flow rate',
    resultValue:
      `${formatNumber(
        flowRate,
      )} m3/s`,
    numericValue:
      flowRate,
    unit: 'm3/s',
    equation:
      'Q = CdA√(2ΔP/ρ)',
    steps: [
      `Ideal velocity = ${formatNumber(
        Math.sqrt(
          (
            2 *
            pressureDifference
          ) /
          density,
        ),
      )} m/s`,
      `Effective area = ${formatNumber(
        dischargeCoefficient *
        orificeArea,
      )} m2`,
      `Flow rate = ${formatNumber(
        flowRate,
      )} m3/s`,
    ],
    assumptions: [
      'Steady incompressible flow',
      'The supplied discharge coefficient includes contraction effects',
      'Pipe-diameter beta correction is not separately applied',
    ],
  }
}

function solveTankDrainTime(
  query: string,
): ProblemQuickSolution | undefined {
  const tankArea =
    readAreaByAliases(
      query,
      [
        'tank cross-sectional area',
        'tank area',
        'vessel area',
        'tank alani',
      ],
    )

  const orificeArea =
    readAreaByAliases(
      query,
      [
        'drain orifice area',
        'outlet area',
        'orifice area',
        'cikis alani',
      ],
    )

  const dischargeCoefficient =
    readDimensionlessValue(
      query,
      [
        'discharge coefficient',
        'drain coefficient',
        'desarj katsayisi',
      ],
    )

  const initialHeight =
    readLength(
      query,
      [
        'initial liquid height',
        'initial head',
        'starting liquid height',
        'baslangic sivi yuksekligi',
      ],
    )

  if (
    tankArea === null ||
    orificeArea === null ||
    dischargeCoefficient === null ||
    initialHeight === null ||
    tankArea <= 0 ||
    orificeArea <= 0 ||
    dischargeCoefficient <= 0 ||
    initialHeight < 0
  ) {
    return undefined
  }

  const drainTime =
    (
      tankArea /
      (
        dischargeCoefficient *
        orificeArea
      )
    ) *
    Math.sqrt(
      (
        2 *
        initialHeight
      ) /
      STANDARD_GRAVITY,
    )

  if (
    !Number.isFinite(
      drainTime,
    )
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Tank drain time',
    resultValue:
      `${formatNumber(
        drainTime,
      )} s`,
    numericValue:
      drainTime,
    unit: 's',
    equation:
      't = At/(CdAo)√(2h₀/g)',
    steps: [
      `Area ratio At/(CdAo) = ${formatNumber(
        tankArea /
        (
          dischargeCoefficient *
          orificeArea
        ),
      )}`,
      `Gravity term = ${formatNumber(
        Math.sqrt(
          (
            2 *
            initialHeight
          ) /
          STANDARD_GRAVITY,
        ),
      )} s`,
      `Drain time = ${formatNumber(
        drainTime,
      )} s`,
    ],
    assumptions: [
      'Constant tank cross-sectional area',
      'Small outlet relative to the tank area',
      'The tank drains to zero liquid head',
    ],
  }
}

function solveGrashofNumber(
  query: string,
): ProblemQuickSolution | undefined {
  const expansionCoefficient =
    readThermalExpansionCoefficient(
      query,
    )

  const temperatureDifference =
    readTemperatureDifference(
      query,
      [
        'surface fluid temperature difference',
        'temperature difference',
        'delta temperature',
        'delta t',
        'sicaklik farki',
      ],
    )

  const characteristicLength =
    readLength(
      query,
      [
        'characteristic length',
        'vertical length',
        'karakteristik uzunluk',
      ],
    )

  const kinematicViscosity =
    readKinematicViscosity(
      query,
    )

  if (
    expansionCoefficient === null ||
    temperatureDifference === null ||
    characteristicLength === null ||
    kinematicViscosity === null ||
    expansionCoefficient <= 0 ||
    temperatureDifference < 0 ||
    characteristicLength <= 0 ||
    kinematicViscosity <= 0
  ) {
    return undefined
  }

  const grashofNumber =
    (
      STANDARD_GRAVITY *
      expansionCoefficient *
      temperatureDifference *
      Math.pow(
        characteristicLength,
        3,
      )
    ) /
    Math.pow(
      kinematicViscosity,
      2,
    )

  if (
    !Number.isFinite(
      grashofNumber,
    )
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Grashof number',
    resultValue:
      formatNumber(
        grashofNumber,
      ),
    numericValue:
      grashofNumber,
    unit: 'dimensionless',
    equation:
      'Gr = gβΔTL³/ν²',
    steps: [
      `Buoyancy numerator = ${formatNumber(
        STANDARD_GRAVITY *
        expansionCoefficient *
        temperatureDifference *
        Math.pow(
          characteristicLength,
          3,
        ),
      )}`,
      `ν² = ${formatNumber(
        Math.pow(
          kinematicViscosity,
          2,
        ),
      )} m4/s2`,
      `Grashof number = ${formatNumber(
        grashofNumber,
      )}`,
    ],
    assumptions: [
      'Boussinesq approximation',
      'Fluid properties are evaluated at film temperature',
      'The supplied length matches the natural-convection geometry',
    ],
  }
}

function solveRayleighNumber(
  query: string,
): ProblemQuickSolution | undefined {
  const grashofNumber =
    readDimensionlessValue(
      query,
      [
        'grashof number',
        'grashof',
        'gr',
      ],
    )

  const prandtlNumber =
    readDimensionlessValue(
      query,
      [
        'prandtl number',
        'prandtl',
        'pr',
      ],
    )

  if (
    grashofNumber === null ||
    prandtlNumber === null ||
    grashofNumber < 0 ||
    prandtlNumber < 0
  ) {
    return undefined
  }

  const rayleighNumber =
    grashofNumber *
    prandtlNumber

  if (
    !Number.isFinite(
      rayleighNumber,
    )
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Rayleigh number',
    resultValue:
      formatNumber(
        rayleighNumber,
      ),
    numericValue:
      rayleighNumber,
    unit: 'dimensionless',
    equation:
      'Ra = GrPr',
    steps: [
      `Gr = ${formatNumber(
        grashofNumber,
      )}`,
      `Pr = ${formatNumber(
        prandtlNumber,
      )}`,
      `Rayleigh number = ${formatNumber(
        rayleighNumber,
      )}`,
    ],
    assumptions: [
      'Grashof and Prandtl numbers use consistent properties and length scales',
      'Natural-convection interpretation',
    ],
  }
}

function solveMassTransferCoefficient(
  query: string,
): ProblemQuickSolution | undefined {
  const molarFlux =
    readMolarFlux(
      query,
    )

  const concentrationDifference =
    readConcentrationDifference(
      query,
    )

  if (
    molarFlux === null ||
    concentrationDifference === null ||
    concentrationDifference === 0
  ) {
    return undefined
  }

  const coefficient =
    Math.abs(
      molarFlux,
    ) /
    Math.abs(
      concentrationDifference,
    )

  if (
    !Number.isFinite(
      coefficient,
    )
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Mass-transfer coefficient',
    resultValue:
      `${formatNumber(
        coefficient,
      )} m/s`,
    numericValue:
      coefficient,
    unit: 'm/s',
    equation:
      'kc = |NA|/|ΔCA|',
    steps: [
      `Molar flux magnitude = ${formatNumber(
        Math.abs(
          molarFlux,
        ),
      )} mol/(m2 s)`,
      `Concentration difference = ${formatNumber(
        Math.abs(
          concentrationDifference,
        ),
      )} mol/m3`,
      `Mass-transfer coefficient = ${formatNumber(
        coefficient,
      )} m/s`,
    ],
    assumptions: [
      'Linear concentration driving-force model',
      'The coefficient and concentrations use the same phase basis',
      'Steady mass transfer',
    ],
  }
}

function solveMassMoleConversion(
  query: string,
): ProblemQuickSolution | undefined {
  const mass =
    readMassKilograms(
      query,
      [
        'sample mass',
        'material mass',
        'mass',
        'kutle',
      ],
    )

  const molecularWeight =
    readMolecularWeightValue(
      query,
      [
        'molecular weight',
        'molar mass',
        'molekuler agirlik',
        'mol kutlesi',
      ],
    )

  if (
    mass === null ||
    molecularWeight === null ||
    mass < 0 ||
    molecularWeight <= 0
  ) {
    return undefined
  }

  const moles =
    (
      mass /
      molecularWeight
    ) *
    1000

  if (
    !Number.isFinite(
      moles,
    )
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Amount of substance',
    resultValue:
      `${formatNumber(
        moles,
      )} mol`,
    numericValue:
      moles,
    unit: 'mol',
    equation:
      'n = m/MW',
    steps: [
      `Mass = ${formatNumber(
        mass,
      )} kg`,
      `Molecular weight = ${formatNumber(
        molecularWeight,
      )} kg/kmol`,
      `Amount = ${formatNumber(
        moles,
      )} mol`,
    ],
    assumptions: [
      'The material is pure',
      'Mass and molecular weight use a consistent chemical species',
    ],
  }
}

function solveSpecificGravity(
  query: string,
): ProblemQuickSolution | undefined {
  const density =
    readDensity(
      query,
    )

  if (
    density === null ||
    density < 0
  ) {
    return undefined
  }

  const specificGravity =
    density /
    1000

  if (
    !Number.isFinite(
      specificGravity,
    )
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Specific gravity',
    resultValue:
      formatNumber(
        specificGravity,
      ),
    numericValue:
      specificGravity,
    unit: 'dimensionless',
    equation:
      'SG = ρ/ρwater',
    steps: [
      `Material density = ${formatNumber(
        density,
      )} kg/m3`,
      'Reference water density = 1000 kg/m3',
      `Specific gravity = ${formatNumber(
        specificGravity,
      )}`,
    ],
    assumptions: [
      'Reference water density is 1000 kg/m3',
      'Both densities correspond to the intended reference temperature',
    ],
  }
}

function solveSolutionMolarity(
  query: string,
): ProblemQuickSolution | undefined {
  const moles =
    readMoles(
      query,
    )

  const solutionVolume =
    readVolume(
      query,
    )

  if (
    moles === null ||
    solutionVolume === null ||
    moles < 0 ||
    solutionVolume <= 0
  ) {
    return undefined
  }

  const molarity =
    moles /
    (
      solutionVolume *
      1000
    )

  if (
    !Number.isFinite(
      molarity,
    )
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Solution molarity',
    resultValue:
      `${formatNumber(
        molarity,
      )} mol/L`,
    numericValue:
      molarity,
    unit: 'mol/L',
    equation:
      'C = n/V',
    steps: [
      `Solute amount = ${formatNumber(
        moles,
      )} mol`,
      `Solution volume = ${formatNumber(
        solutionVolume *
        1000,
      )} L`,
      `Molarity = ${formatNumber(
        molarity,
      )} mol/L`,
    ],
    assumptions: [
      'The supplied volume is the final solution volume',
      'The solute amount is expressed in moles',
    ],
  }
}

function solveMixtureDensity(
  query: string,
): ProblemQuickSolution | undefined {
  const totalMass =
    readMassKilograms(
      query,
      [
        'total mixture mass',
        'mixture mass',
        'total mass',
        'karisim kutlesi',
      ],
    )

  const totalVolume =
    readVolume(
      query,
    )

  if (
    totalMass === null ||
    totalVolume === null ||
    totalMass < 0 ||
    totalVolume <= 0
  ) {
    return undefined
  }

  const density =
    totalMass /
    totalVolume

  if (
    !Number.isFinite(
      density,
    )
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Mixture density',
    resultValue:
      `${formatNumber(
        density,
      )} kg/m3`,
    numericValue:
      density,
    unit: 'kg/m3',
    equation:
      'ρmix = mtotal/Vtotal',
    steps: [
      `Total mass = ${formatNumber(
        totalMass,
      )} kg`,
      `Total volume = ${formatNumber(
        totalVolume,
      )} m3`,
      `Mixture density = ${formatNumber(
        density,
      )} kg/m3`,
    ],
    assumptions: [
      'The stated mass and volume refer to the same mixture',
      'The total mixture volume is supplied directly',
    ],
  }
}

function solveAverageMolecularWeight(
  query: string,
): ProblemQuickSolution | undefined {
  const firstMoleFraction =
    readFraction(
      query,
      [
        'component 1 mole fraction',
        'first component mole fraction',
        'mole fraction 1',
        'x1',
      ],
    )

  const firstMolecularWeight =
    readMolecularWeightValue(
      query,
      [
        'component 1 molecular weight',
        'first component molecular weight',
        'molecular weight 1',
        'mw1',
      ],
    )

  const secondMolecularWeight =
    readMolecularWeightValue(
      query,
      [
        'component 2 molecular weight',
        'second component molecular weight',
        'molecular weight 2',
        'mw2',
      ],
    )

  if (
    firstMoleFraction === null ||
    firstMolecularWeight === null ||
    secondMolecularWeight === null ||
    firstMoleFraction < 0 ||
    firstMoleFraction > 1 ||
    firstMolecularWeight <= 0 ||
    secondMolecularWeight <= 0
  ) {
    return undefined
  }

  const secondMoleFraction =
    1 -
    firstMoleFraction

  const averageMolecularWeight =
    (
      firstMoleFraction *
      firstMolecularWeight
    ) +
    (
      secondMoleFraction *
      secondMolecularWeight
    )

  if (
    !Number.isFinite(
      averageMolecularWeight,
    )
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Average molecular weight',
    resultValue:
      `${formatNumber(
        averageMolecularWeight,
      )} g/mol`,
    numericValue:
      averageMolecularWeight,
    unit: 'g/mol',
    equation:
      'MWavg = x₁MW₁ + x₂MW₂',
    steps: [
      `Second mole fraction = ${formatNumber(
        secondMoleFraction,
      )}`,
      `First contribution = ${formatNumber(
        firstMoleFraction *
        firstMolecularWeight,
      )} g/mol`,
      `Second contribution = ${formatNumber(
        secondMoleFraction *
        secondMolecularWeight,
      )} g/mol`,
    ],
    assumptions: [
      'Binary mixture',
      'Mole fractions sum to one',
      'Molecular weights use the same unit basis',
    ],
  }
}

function solveMassFlowMolarFlowConversion(
  query: string,
): ProblemQuickSolution | undefined {
  const massFlow =
    readMassFlowKilogramsPerSecond(
      query,
    )

  const molecularWeight =
    readMolecularWeightValue(
      query,
      [
        'molecular weight',
        'molar mass',
        'molekuler agirlik',
        'mol kutlesi',
      ],
    )

  if (
    massFlow === null ||
    molecularWeight === null ||
    massFlow < 0 ||
    molecularWeight <= 0
  ) {
    return undefined
  }

  const molarFlow =
    (
      massFlow /
      molecularWeight
    ) *
    1000

  if (
    !Number.isFinite(
      molarFlow,
    )
  ) {
    return undefined
  }

  return {
    resultLabel:
      'Molar flow rate',
    resultValue:
      `${formatNumber(
        molarFlow,
      )} mol/s`,
    numericValue:
      molarFlow,
    unit: 'mol/s',
    equation:
      'ṅ = ṁ/MW',
    steps: [
      `Mass flow = ${formatNumber(
        massFlow,
      )} kg/s`,
      `Molecular weight = ${formatNumber(
        molecularWeight,
      )} kg/kmol`,
      `Molar flow = ${formatNumber(
        molarFlow,
      )} mol/s`,
    ],
    assumptions: [
      'Single chemical species or known average molecular weight',
      'Mass flow and molecular weight use consistent species definitions',
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

    case 'heatExchangerLMTD':
      return solveHeatExchangerLmtd(
        query,
      )

    case 'heatExchangerAreaSizing':
      return solveHeatExchangerArea(
        query,
      )

    case 'reactorDesign':
      return solveCstrVolume(
        query,
      )

    case 'hydrostaticPressure':
      return solveHydrostaticPressure(
        query,
      )

    case 'planeWallConduction':
      return solvePlaneWallConduction(
        query,
      )

    case 'ficksFirstLaw':
      return solveFicksFirstLaw(
        query,
      )

    case 'convectionHeatTransfer':
      return solveConvectionHeatTransfer(
        query,
      )

    case 'nusseltNumber':
      return solveNusseltNumber(
        query,
      )

    case 'froudeNumber':
      return solveFroudeNumber(
        query,
      )

    case 'flowRate':
      return solveVolumetricFlowRate(
        query,
      )

    case 'dragForce':
      return solveDragForce(
        query,
      )

    case 'minorLosses':
      return solveMinorLosses(
        query,
      )

    case 'thermalRadiation':
      return solveThermalRadiation(
        query,
      )

    case 'fourierNumber':
      return solveFourierNumber(
        query,
      )

    case 'prandtlNumber':
      return solvePrandtlNumber(
        query,
      )

    case 'uTubeManometer':
      return solveUTubeManometer(
        query,
      )

    case 'orificeMeter':
      return solveOrificeMeter(
        query,
      )

    case 'tankDrainTime':
      return solveTankDrainTime(
        query,
      )

    case 'grashofNumber':
      return solveGrashofNumber(
        query,
      )

    case 'rayleighNumber':
      return solveRayleighNumber(
        query,
      )

    case 'massTransferCoefficient':
      return solveMassTransferCoefficient(
        query,
      )

    case 'massMoleConversion':
      return solveMassMoleConversion(
        query,
      )

    case 'densitySpecificGravity':
      return solveSpecificGravity(
        query,
      )

    case 'solutionConcentration':
      return solveSolutionMolarity(
        query,
      )

    case 'mixtureDensityCalculator':
      return solveMixtureDensity(
        query,
      )

    case 'averageMolecularWeight':
      return solveAverageMolecularWeight(
        query,
      )

    case 'massFlowMolarFlowConversion':
      return solveMassFlowMolarFlowConversion(
        query,
      )

    default:
      return undefined
  }
}
