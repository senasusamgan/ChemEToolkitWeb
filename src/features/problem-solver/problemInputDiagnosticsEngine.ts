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
