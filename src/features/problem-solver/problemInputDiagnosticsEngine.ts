export type ProblemDiagnosticSeverity =
  | 'error'
  | 'warning'

export interface ProblemInputDiagnostic {
  code: string
  severity: ProblemDiagnosticSeverity
  message: string
}

export interface ProblemInputDiagnostics {
  diagnostics: ProblemInputDiagnostic[]
  hasBlockingErrors: boolean
}

interface NamedMeasurement {
  value: number
  unit: string
}

const NUMBER_SOURCE =
  '[-+]?(?:\\d+(?:\\.\\d+)?|\\.\\d+)(?:e[-+]?\\d+)?'

function normalizeText(
  value: string,
): string {
  return value
    .toLocaleLowerCase(
      'tr-TR',
    )
    .replaceAll(
      'ı',
      'i',
    )
    .replaceAll(
      'ş',
      's',
    )
    .replaceAll(
      'ğ',
      'g',
    )
    .replaceAll(
      'ç',
      'c',
    )
    .replaceAll(
      'ö',
      'o',
    )
    .replaceAll(
      'ü',
      'u',
    )
    .replace(
      /[−–—]/g,
      '-',
    )
    .replace(
      /,/g,
      '.',
    )
    .replace(
      /°/g,
      '',
    )
    .replace(
      /²/g,
      '2',
    )
    .replace(
      /³/g,
      '3',
    )
    .replace(
      /\s+/g,
      ' ',
    )
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
    .map(
      normalizeText,
    )
    .filter(
      (value) =>
        value.length > 0,
    )
    .sort(
      (first, second) =>
        second.length -
        first.length,
    )
    .map(
      escapeRegExp,
    )
    .join(
      '|',
    )
}

function readNamedMeasurement(
  query: string,
  aliases: string[],
  units: string[],
): NamedMeasurement | null {
  const cleanQuery =
    normalizeText(
      query,
    )

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

  const pattern =
    new RegExp(
      `(?:^|\\b)(?:${aliasPattern})(?=\\b|\\s|:|=)\\s*(?:=|:|is)?\\s*(${NUMBER_SOURCE})(?:\\s*(${unitPattern}))?(?=\\s|$|[.;,)])`,
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
        match[2] ?? '',
      ),
  }
}

function readNamedValue(
  query: string,
  aliases: string[],
): number | null {
  const cleanQuery =
    normalizeText(
      query,
    )

  const aliasPattern =
    createAlternatives(
      aliases,
    )

  if (!aliasPattern) {
    return null
  }

  const pattern =
    new RegExp(
      `(?:^|\\b)(?:${aliasPattern})(?=\\b|\\s|:|=)\\s*(?:=|:|is)?\\s*(${NUMBER_SOURCE})(?=\\s|$|[.;,)a-z/%])`,
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

function readLengthMeters(
  query: string,
  aliases: string[],
): number | null {
  const measurement =
    readNamedMeasurement(
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

function addDiagnostic(
  diagnostics:
    ProblemInputDiagnostic[],
  diagnostic:
    ProblemInputDiagnostic,
): void {
  const exists =
    diagnostics.some(
      (candidate) =>
        candidate.code ===
          diagnostic.code &&
        candidate.message ===
          diagnostic.message,
    )

  if (!exists) {
    diagnostics.push(
      diagnostic,
    )
  }
}

function diagnosePositiveValues(
  query: string,
  diagnostics:
    ProblemInputDiagnostic[],
): void {
  const rules = [
    {
      code:
        'nonpositive-density',
      label:
        'Density',
      aliases: [
        'fluid density',
        'liquid density',
        'density',
        'yogunluk',
      ],
    },
    {
      code:
        'nonpositive-viscosity',
      label:
        'Viscosity',
      aliases: [
        'dynamic viscosity',
        'fluid viscosity',
        'viscosity',
        'viskozite',
      ],
    },
    {
      code:
        'nonpositive-diameter',
      label:
        'Diameter',
      aliases: [
        'inside diameter',
        'internal diameter',
        'pipe diameter',
        'diameter',
        'boru capi',
      ],
    },
    {
      code:
        'nonpositive-length',
      label:
        'Length',
      aliases: [
        'pipe length',
        'characteristic length',
        'diffusion distance',
        'film thickness',
      ],
    },
    {
      code:
        'nonpositive-area',
      label:
        'Area',
      aliases: [
        'surface area',
        'flow area',
        'orifice area',
        'projected area',
      ],
    },
    {
      code:
        'nonpositive-volume',
      label:
        'Volume',
      aliases: [
        'solution volume',
        'total volume',
        'gas volume',
        'volume',
      ],
    },
    {
      code:
        'nonpositive-conductivity',
      label:
        'Thermal conductivity',
      aliases: [
        'thermal conductivity',
        'solid thermal conductivity',
      ],
    },
    {
      code:
        'nonpositive-diffusivity',
      label:
        'Diffusivity',
      aliases: [
        'diffusivity',
        'diffusion coefficient',
      ],
    },
  ] as const

  for (
    const rule
    of rules
  ) {
    const value =
      readNamedValue(
        query,
        [...rule.aliases],
      )

    if (
      value !== null &&
      value <= 0
    ) {
      addDiagnostic(
        diagnostics,
        {
          code:
            rule.code,
          severity:
            'error',
          message:
            `${rule.label} must be greater than zero.`,
        },
      )
    }
  }
}

function diagnoseTemperature(
  query: string,
  diagnostics:
    ProblemInputDiagnostic[],
): void {
  const absoluteTemperature =
    readNamedMeasurement(
      query,
      [
        'absolute temperature',
        'mutlak sicaklik',
      ],
      [
        'celsius',
        'deg c',
        'k',
        'c',
      ],
    )

  if (absoluteTemperature) {
    if (
      absoluteTemperature.unit ===
        'k' &&
      absoluteTemperature.value <= 0
    ) {
      addDiagnostic(
        diagnostics,
        {
          code:
            'invalid-absolute-temperature',
          severity:
            'error',
          message:
            'Absolute temperature must be greater than 0 K.',
        },
      )
    }

    if (
      absoluteTemperature.unit !==
        'k'
    ) {
      if (
        absoluteTemperature.value <=
        -273.15
      ) {
        addDiagnostic(
          diagnostics,
          {
            code:
              'below-absolute-zero',
            severity:
              'error',
            message:
              'Temperature cannot be at or below absolute zero.',
          },
        )
      } else {
        addDiagnostic(
          diagnostics,
          {
            code:
              'absolute-temperature-unit',
            severity:
              'warning',
            message:
              'Convert absolute temperature to Kelvin before applying thermodynamic equations.',
          },
        )
      }
    }
  }

  const generalTemperature =
    readNamedMeasurement(
      query,
      [
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

  if (
    generalTemperature?.unit ===
      'k' &&
    generalTemperature.value <= 0
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'invalid-kelvin-temperature',
        severity:
          'error',
        message:
          'Kelvin temperature must be greater than zero.',
      },
    )
  }

  if (
    generalTemperature &&
    generalTemperature.unit !==
      'k' &&
    generalTemperature.value <=
      -273.15
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'below-absolute-zero',
        severity:
          'error',
        message:
          'Temperature cannot be at or below absolute zero.',
      },
    )
  }
}

function diagnoseEfficiency(
  query: string,
  diagnostics:
    ProblemInputDiagnostic[],
): void {
  const efficiency =
    readNamedMeasurement(
      query,
      [
        'pump efficiency',
        'efficiency',
        'verim',
      ],
      [
        'percent',
        '%',
      ],
    )

  if (!efficiency) {
    return
  }

  if (
    efficiency.value <= 0
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'invalid-efficiency',
        severity:
          'error',
        message:
          'Efficiency must be greater than zero.',
      },
    )

    return
  }

  const percentValue =
    efficiency.unit
      ? efficiency.value
      : efficiency.value <= 1
        ? efficiency.value * 100
        : efficiency.value

  if (
    percentValue > 100
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'efficiency-above-100',
        severity:
          'error',
        message:
          'Efficiency cannot exceed 100%.',
      },
    )
  }
}

function diagnoseFractions(
  query: string,
  diagnostics:
    ProblemInputDiagnostic[],
): void {
  const boundedFractions = [
    {
      code:
        'invalid-conversion',
      label:
        'Conversion',
      aliases: [
        'target conversion',
        'conversion',
        'donusum',
      ],
    },
    {
      code:
        'invalid-mole-fraction',
      label:
        'Mole fraction',
      aliases: [
        'mole fraction',
        'component 1 mole fraction',
        'mol kesri',
      ],
    },
    {
      code:
        'invalid-mass-fraction',
      label:
        'Mass fraction',
      aliases: [
        'mass fraction',
        'kutle kesri',
      ],
    },
  ] as const

  for (
    const rule
    of boundedFractions
  ) {
    const measurement =
      readNamedMeasurement(
        query,
        [...rule.aliases],
        [
          'percent',
          '%',
        ],
      )

    if (!measurement) {
      continue
    }

    const percentValue =
      measurement.unit
        ? measurement.value
        : measurement.value <= 1
          ? measurement.value * 100
          : measurement.value

    if (
      percentValue < 0 ||
      percentValue > 100
    ) {
      addDiagnostic(
        diagnostics,
        {
          code:
            rule.code,
          severity:
            'error',
          message:
            `${rule.label} must remain between 0 and 100%.`,
        },
      )
    }
  }

  const emissivity =
    readNamedValue(
      query,
      [
        'surface emissivity',
        'emissivity',
        'yayinim katsayisi',
      ],
    )

  if (
    emissivity !== null &&
    (
      emissivity < 0 ||
      emissivity > 1
    )
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'invalid-emissivity',
        severity:
          'error',
        message:
          'Emissivity must remain between 0 and 1.',
      },
    )
  }
}

function diagnosePipeRoughness(
  query: string,
  diagnostics:
    ProblemInputDiagnostic[],
): void {
  const diameter =
    readLengthMeters(
      query,
      [
        'inside diameter',
        'internal diameter',
        'pipe diameter',
        'diameter',
      ],
    )

  const roughness =
    readLengthMeters(
      query,
      [
        'surface roughness',
        'absolute roughness',
        'roughness',
        'puruzluluk',
      ],
    )

  if (
    diameter === null ||
    roughness === null ||
    diameter <= 0 ||
    roughness < 0
  ) {
    return
  }

  if (
    roughness >= diameter
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'roughness-exceeds-diameter',
        severity:
          'error',
        message:
          'Pipe roughness cannot be equal to or greater than the pipe diameter.',
      },
    )

    return
  }

  if (
    roughness /
      diameter >
    0.05
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'high-relative-roughness',
        severity:
          'warning',
        message:
          'Relative roughness is unusually high; verify the diameter and roughness units.',
      },
    )
  }
}

function diagnosePressureBasis(
  calculatorId: string,
  query: string,
  diagnostics:
    ProblemInputDiagnostic[],
): void {
  if (
    calculatorId !==
      'idealGas' &&
    calculatorId !==
      'idealGasCalculator'
  ) {
    return
  }

  const cleanQuery =
    normalizeText(
      query,
    )

  const mentionsPressure =
    cleanQuery.includes(
      'pressure',
    ) ||
    cleanQuery.includes(
      'basinc',
    )

  const declaresBasis = [
    'absolute pressure',
    'gauge pressure',
    'atmospheric pressure',
    'barometric pressure',
    'mutlak basinc',
    'gosterge basinci',
    'bara',
    'psia',
  ].some(
    (signal) =>
      cleanQuery.includes(
        normalizeText(
          signal,
        ),
      ),
  )

  if (
    mentionsPressure &&
    !declaresBasis
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'pressure-basis-ambiguous',
        severity:
          'warning',
        message:
          'Ideal-gas calculations require absolute pressure; confirm that the supplied pressure is not gauge pressure.',
      },
    )
  }
}

function readTemperatureKelvin(
  query: string,
  aliases: string[],
): number | null {
  const measurement =
    readNamedMeasurement(
      query,
      aliases,
      [
        'celsius',
        'deg c',
        'k',
        'c',
      ],
    )

  if (
    !measurement ||
    !measurement.unit
  ) {
    return null
  }

  if (
    measurement.unit ===
    'k'
  ) {
    return measurement.value
  }

  return (
    measurement.value +
    273.15
  )
}

function readFractionValue(
  query: string,
  aliases: string[],
): number | null {
  const measurement =
    readNamedMeasurement(
      query,
      aliases,
      [
        'percent',
        '%',
      ],
    )

  if (!measurement) {
    return null
  }

  if (measurement.unit) {
    return (
      measurement.value /
      100
    )
  }

  return measurement.value > 1
    ? measurement.value / 100
    : measurement.value
}

function diagnoseAbsolutePressure(
  query: string,
  diagnostics:
    ProblemInputDiagnostic[],
): void {
  const measurement =
    readNamedMeasurement(
      query,
      [
        'absolute pressure',
        'mutlak basinc',
      ],
      [
        'mpa',
        'kpa',
        'bar',
        'atm',
        'pa',
      ],
    )

  if (
    measurement &&
    measurement.value <= 0
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'nonpositive-absolute-pressure',
        severity:
          'error',
        message:
          'Absolute pressure must be greater than zero.',
      },
    )
  }
}

function diagnoseFlowRate(
  query: string,
  diagnostics:
    ProblemInputDiagnostic[],
): void {
  const measurement =
    readNamedMeasurement(
      query,
      [
        'volumetric flow rate',
        'mass flow rate',
        'molar flow rate',
        'flow rate',
        'debi',
      ],
      [
        'kmol/h',
        'mol/s',
        'kg/h',
        'kg/s',
        'm3/h',
        'm3/s',
        'l/min',
        'l/s',
      ],
    )

  if (
    measurement &&
    measurement.value <= 0
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'nonpositive-flow-rate',
        severity:
          'error',
        message:
          'Flow rate must be greater than zero.',
      },
    )
  }
}

function diagnoseHeatExchangerTemperatures(
  calculatorId: string,
  query: string,
  diagnostics:
    ProblemInputDiagnostic[],
): void {
  if (
    calculatorId !==
      'heatExchangerLMTD' &&
    calculatorId !==
      'heatExchangerAreaSizing'
  ) {
    return
  }

  const hotInlet =
    readTemperatureKelvin(
      query,
      [
        'hot inlet temperature',
        'hot fluid inlet temperature',
        'sicak akis giris sicakligi',
      ],
    )

  const hotOutlet =
    readTemperatureKelvin(
      query,
      [
        'hot outlet temperature',
        'hot fluid outlet temperature',
        'sicak akis cikis sicakligi',
      ],
    )

  const coldInlet =
    readTemperatureKelvin(
      query,
      [
        'cold inlet temperature',
        'cold fluid inlet temperature',
        'soguk akis giris sicakligi',
      ],
    )

  const coldOutlet =
    readTemperatureKelvin(
      query,
      [
        'cold outlet temperature',
        'cold fluid outlet temperature',
        'soguk akis cikis sicakligi',
      ],
    )

  if (
    hotInlet === null ||
    hotOutlet === null ||
    coldInlet === null ||
    coldOutlet === null
  ) {
    return
  }

  if (
    hotInlet <= hotOutlet
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'invalid-hot-stream-order',
        severity:
          'error',
        message:
          'Hot-stream inlet temperature must exceed its outlet temperature.',
      },
    )
  }

  if (
    coldOutlet <= coldInlet
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'invalid-cold-stream-order',
        severity:
          'error',
        message:
          'Cold-stream outlet temperature must exceed its inlet temperature.',
      },
    )
  }

  const cleanQuery =
    normalizeText(
      query,
    )

  const parallelFlow =
    cleanQuery.includes(
      'parallel flow',
    ) ||
    cleanQuery.includes(
      'co current',
    ) ||
    cleanQuery.includes(
      'es yonlu',
    )

  const firstTerminalDifference =
    parallelFlow
      ? hotInlet -
        coldInlet
      : hotInlet -
        coldOutlet

  const secondTerminalDifference =
    parallelFlow
      ? hotOutlet -
        coldOutlet
      : hotOutlet -
        coldInlet

  if (
    firstTerminalDifference <= 0 ||
    secondTerminalDifference <= 0
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'heat-exchanger-temperature-cross',
        severity:
          'error',
        message:
          'Heat-exchanger terminal temperature differences must both remain positive.',
      },
    )
  }
}

function diagnoseFractionClosure(
  query: string,
  diagnostics:
    ProblemInputDiagnostic[],
): void {
  const rules = [
    {
      basis:
        'mole',
      firstAliases: [
        'component 1 mole fraction',
        'mole fraction 1',
        'x1',
      ],
      secondAliases: [
        'component 2 mole fraction',
        'mole fraction 2',
        'x2',
      ],
    },
    {
      basis:
        'mass',
      firstAliases: [
        'component 1 mass fraction',
        'mass fraction 1',
        'w1',
      ],
      secondAliases: [
        'component 2 mass fraction',
        'mass fraction 2',
        'w2',
      ],
    },
  ] as const

  for (
    const rule
    of rules
  ) {
    const firstFraction =
      readFractionValue(
        query,
        [...rule.firstAliases],
      )

    const secondFraction =
      readFractionValue(
        query,
        [...rule.secondAliases],
      )

    if (
      firstFraction === null ||
      secondFraction === null
    ) {
      continue
    }

    const total =
      firstFraction +
      secondFraction

    if (
      total >
      1.000001
    ) {
      addDiagnostic(
        diagnostics,
        {
          code:
            `${rule.basis}-fraction-sum-above-one`,
          severity:
            'error',
          message:
            `Specified component ${rule.basis} fractions exceed a total of 1.`,
        },
      )

      continue
    }

    if (
      Math.abs(
        total -
        1,
      ) >
      0.01
    ) {
      addDiagnostic(
        diagnostics,
        {
          code:
            `${rule.basis}-fraction-closure`,
          severity:
            'warning',
          message:
            `Specified component ${rule.basis} fractions do not sum to 1; additional components may be missing.`,
        },
      )
    }
  }
}

function diagnoseGaugePressureBasis(
  calculatorId: string,
  query: string,
  diagnostics:
    ProblemInputDiagnostic[],
): void {
  if (
    calculatorId !==
      'idealGas' &&
    calculatorId !==
      'idealGasCalculator'
  ) {
    return
  }

  const cleanQuery =
    normalizeText(
      query,
    )

  const usesGaugePressure =
    cleanQuery.includes(
      'gauge pressure',
    ) ||
    cleanQuery.includes(
      'gage pressure',
    ) ||
    cleanQuery.includes(
      'gosterge basinci',
    )

  const suppliesAtmosphericPressure =
    cleanQuery.includes(
      'atmospheric pressure',
    ) ||
    cleanQuery.includes(
      'barometric pressure',
    ) ||
    cleanQuery.includes(
      'atmosfer basinci',
    )

  if (
    usesGaugePressure &&
    !suppliesAtmosphericPressure
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'gauge-pressure-conversion-missing',
        severity:
          'warning',
        message:
          'Convert gauge pressure to absolute pressure by adding atmospheric pressure.',
      },
    )
  }
}

const DIAGNOSTIC_GAS_CONSTANT =
  8.314462618

function readPressurePascals(
  query: string,
  aliases: string[],
): number | null {
  const measurement =
    readNamedMeasurement(
      query,
      aliases,
      [
        'mpa',
        'kpa',
        'bar',
        'atm',
        'pa',
      ],
    )

  if (
    !measurement ||
    !measurement.unit
  ) {
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

  if (
    measurement.unit ===
    'atm'
  ) {
    return (
      measurement.value *
      101_325
    )
  }

  return measurement.value
}

function readVolumeCubicMeters(
  query: string,
  aliases: string[],
): number | null {
  const measurement =
    readNamedMeasurement(
      query,
      aliases,
      [
        'cm3',
        'ml',
        'm3',
        'l',
      ],
    )

  if (
    !measurement ||
    !measurement.unit
  ) {
    return null
  }

  if (
    measurement.unit ===
      'cm3' ||
    measurement.unit ===
      'ml'
  ) {
    return (
      measurement.value /
      1_000_000
    )
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

  return measurement.value
}

function readAmountMoles(
  query: string,
): number | null {
  const measurement =
    readNamedMeasurement(
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

  if (
    !measurement ||
    !measurement.unit
  ) {
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

function readMassKilograms(
  query: string,
): number | null {
  const measurement =
    readNamedMeasurement(
      query,
      [
        'total mixture mass',
        'mixture mass',
        'total mass',
        'mass',
        'kutle',
      ],
      [
        'mg',
        'kg',
        'g',
      ],
    )

  if (
    !measurement ||
    !measurement.unit
  ) {
    return null
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

  if (
    measurement.unit ===
    'g'
  ) {
    return (
      measurement.value /
      1000
    )
  }

  return measurement.value
}

function readDensityKilogramsPerCubicMeter(
  query: string,
): number | null {
  const measurement =
    readNamedMeasurement(
      query,
      [
        'mixture density',
        'fluid density',
        'liquid density',
        'density',
        'yogunluk',
      ],
      [
        'g/cm3',
        'kg/m3',
      ],
    )

  if (
    !measurement ||
    !measurement.unit
  ) {
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

function readAreaSquareMeters(
  query: string,
): number | null {
  const measurement =
    readNamedMeasurement(
      query,
      [
        'flow area',
        'cross sectional area',
        'cross-sectional area',
        'pipe area',
        'area',
        'akis alani',
      ],
      [
        'mm2',
        'cm2',
        'm2',
      ],
    )

  if (
    !measurement ||
    !measurement.unit
  ) {
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

function readVelocityMetersPerSecond(
  query: string,
): number | null {
  const measurement =
    readNamedMeasurement(
      query,
      [
        'average velocity',
        'fluid velocity',
        'velocity',
        'hiz',
      ],
      [
        'km/h',
        'cm/s',
        'm/s',
      ],
    )

  if (
    !measurement ||
    !measurement.unit
  ) {
    return null
  }

  if (
    measurement.unit ===
    'km/h'
  ) {
    return (
      measurement.value /
      3.6
    )
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

function readVolumetricFlowCubicMetersPerSecond(
  query: string,
): number | null {
  const measurement =
    readNamedMeasurement(
      query,
      [
        'volumetric flow rate',
        'volumetric flow',
        'flow rate',
        'debi',
      ],
      [
        'm3/h',
        'l/min',
        'm3/s',
        'l/s',
      ],
    )

  if (
    !measurement ||
    !measurement.unit
  ) {
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
    'l/min'
  ) {
    return (
      measurement.value /
      60_000
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

  return measurement.value
}

function relativeMismatch(
  first: number,
  second: number,
): number {
  return (
    Math.abs(
      first -
      second,
    ) /
    Math.max(
      Math.abs(
        first,
      ),
      Math.abs(
        second,
      ),
      Number.EPSILON,
    )
  )
}

function diagnoseIdealGasStateConsistency(
  calculatorId: string,
  query: string,
  diagnostics:
    ProblemInputDiagnostic[],
): void {
  if (
    calculatorId !==
      'idealGas' &&
    calculatorId !==
      'idealGasCalculator'
  ) {
    return
  }

  const pressure =
    readPressurePascals(
      query,
      [
        'absolute pressure',
        'pressure',
        'mutlak basinc',
      ],
    )

  const volume =
    readVolumeCubicMeters(
      query,
      [
        'gas volume',
        'volume',
        'gaz hacmi',
      ],
    )

  const amount =
    readAmountMoles(
      query,
    )

  const temperature =
    readTemperatureKelvin(
      query,
      [
        'absolute temperature',
        'temperature',
        'mutlak sicaklik',
        'sicaklik',
      ],
    )

  if (
    pressure === null ||
    volume === null ||
    amount === null ||
    temperature === null ||
    pressure <= 0 ||
    volume <= 0 ||
    amount <= 0 ||
    temperature <= 0
  ) {
    return
  }

  const pressureVolume =
    pressure *
    volume

  const moleTemperature =
    amount *
    DIAGNOSTIC_GAS_CONSTANT *
    temperature

  const mismatch =
    relativeMismatch(
      pressureVolume,
      moleTemperature,
    )

  if (
    mismatch >
    0.25
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'ideal-gas-state-inconsistent',
        severity:
          'error',
        message:
          'The supplied pressure, volume, amount and temperature do not satisfy PV = nRT.',
      },
    )

    return
  }

  if (
    mismatch >
    0.05
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'ideal-gas-state-check',
        severity:
          'warning',
        message:
          'The supplied ideal-gas state differs from PV = nRT by more than 5%; verify units or non-ideal behavior.',
      },
    )
  }
}

function diagnoseMassVolumeDensityConsistency(
  query: string,
  diagnostics:
    ProblemInputDiagnostic[],
): void {
  const mass =
    readMassKilograms(
      query,
    )

  const volume =
    readVolumeCubicMeters(
      query,
      [
        'total mixture volume',
        'mixture volume',
        'total volume',
        'volume',
        'hacim',
      ],
    )

  const density =
    readDensityKilogramsPerCubicMeter(
      query,
    )

  if (
    mass === null ||
    volume === null ||
    density === null ||
    mass <= 0 ||
    volume <= 0 ||
    density <= 0
  ) {
    return
  }

  const calculatedDensity =
    mass /
    volume

  if (
    relativeMismatch(
      calculatedDensity,
      density,
    ) >
    0.1
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'density-mass-volume-inconsistent',
        severity:
          'warning',
        message:
          'The supplied mass, volume and density differ from ρ = m/V by more than 10%.',
      },
    )
  }
}

function diagnoseFlowContinuityConsistency(
  query: string,
  diagnostics:
    ProblemInputDiagnostic[],
): void {
  const area =
    readAreaSquareMeters(
      query,
    )

  const velocity =
    readVelocityMetersPerSecond(
      query,
    )

  const flowRate =
    readVolumetricFlowCubicMetersPerSecond(
      query,
    )

  if (
    area === null ||
    velocity === null ||
    flowRate === null ||
    area <= 0 ||
    velocity <= 0 ||
    flowRate <= 0
  ) {
    return
  }

  const calculatedFlowRate =
    area *
    velocity

  if (
    relativeMismatch(
      calculatedFlowRate,
      flowRate,
    ) >
    0.1
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'flow-area-velocity-inconsistent',
        severity:
          'warning',
        message:
          'The supplied flow rate, area and velocity differ from Q = Av by more than 10%.',
      },
    )
  }
}

function diagnoseDrivingForces(
  query: string,
  diagnostics:
    ProblemInputDiagnostic[],
): void {
  const temperatureDifference =
    readNamedValue(
      query,
      [
        'temperature difference',
        'delta temperature',
        'delta t',
        'sicaklik farki',
      ],
    )

  if (
    temperatureDifference !== null &&
    temperatureDifference === 0
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'zero-temperature-driving-force',
        severity:
          'warning',
        message:
          'A zero temperature difference produces no sensible heat-transfer driving force.',
      },
    )
  }

  const concentrationDifference =
    readNamedValue(
      query,
      [
        'concentration difference',
        'concentration gradient',
        'derisim farki',
      ],
    )

  if (
    concentrationDifference !== null &&
    concentrationDifference === 0
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'zero-concentration-driving-force',
        severity:
          'warning',
        message:
          'A zero concentration difference produces no diffusive mass-transfer driving force.',
      },
    )
  }

  const pressureDifference =
    readNamedValue(
      query,
      [
        'pressure difference',
        'differential pressure',
        'pressure drop',
        'basinc farki',
      ],
    )

  if (
    pressureDifference !== null &&
    pressureDifference === 0
  ) {
    addDiagnostic(
      diagnostics,
      {
        code:
          'zero-pressure-driving-force',
        severity:
          'warning',
        message:
          'A zero pressure difference produces no pressure-driven flow.',
      },
    )
  }
}

export function diagnoseProblemInput(
  calculatorId: string,
  query: string,
): ProblemInputDiagnostics {
  const diagnostics:
    ProblemInputDiagnostic[] = []

  diagnosePositiveValues(
    query,
    diagnostics,
  )

  diagnoseTemperature(
    query,
    diagnostics,
  )

  diagnoseEfficiency(
    query,
    diagnostics,
  )

  diagnoseFractions(
    query,
    diagnostics,
  )

  diagnosePipeRoughness(
    query,
    diagnostics,
  )

  diagnosePressureBasis(
    calculatorId,
    query,
    diagnostics,
  )

  diagnoseAbsolutePressure(
    query,
    diagnostics,
  )

  diagnoseFlowRate(
    query,
    diagnostics,
  )

  diagnoseHeatExchangerTemperatures(
    calculatorId,
    query,
    diagnostics,
  )

  diagnoseFractionClosure(
    query,
    diagnostics,
  )

  diagnoseGaugePressureBasis(
    calculatorId,
    query,
    diagnostics,
  )

  diagnoseIdealGasStateConsistency(
    calculatorId,
    query,
    diagnostics,
  )

  diagnoseMassVolumeDensityConsistency(
    query,
    diagnostics,
  )

  diagnoseFlowContinuityConsistency(
    query,
    diagnostics,
  )

  diagnoseDrivingForces(
    query,
    diagnostics,
  )

  diagnostics.sort(
    (first, second) => {
      if (
        first.severity ===
        second.severity
      ) {
        return first.code.localeCompare(
          second.code,
        )
      }

      return first.severity ===
        'error'
        ? -1
        : 1
    },
  )

  return {
    diagnostics,
    hasBlockingErrors:
      diagnostics.some(
        (diagnostic) =>
          diagnostic.severity ===
          'error',
      ),
  }
}
