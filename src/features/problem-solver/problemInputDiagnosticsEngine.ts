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
