export interface ProblemEquationAssignment {
  symbol: string
  canonicalName: string
  value: number
  unit: string
  canonicalText: string
}

export interface ProblemEquationParseResult {
  originalQuery: string
  enrichedQuery: string
  assignments:
    ProblemEquationAssignment[]
}

interface SymbolProfile {
  aliases: string[]
  canonicalName: string
  units: string[]
  allowUnitless?: boolean
}

const NUMBER_SOURCE =
  '[-+]?(?:\\d+(?:\\.\\d+)?|\\.\\d+)(?:e[-+]?\\d+)?'

const SYMBOL_PROFILES:
  SymbolProfile[] = [
    {
      aliases: [
        'ρ',
        'rho',
      ],
      canonicalName:
        'fluid density',
      units: [
        'kg/m3',
        'g/cm3',
      ],
    },
    {
      aliases: [
        'μ',
        'mu',
      ],
      canonicalName:
        'dynamic viscosity',
      units: [
        'pa s',
        'mpa s',
        'cp',
      ],
    },
    {
      aliases: [
        'ν',
        'nu_kin',
        'nuk',
      ],
      canonicalName:
        'kinematic viscosity',
      units: [
        'm2/s',
        'cm2/s',
      ],
    },
    {
      aliases: [
        'D',
      ],
      canonicalName:
        'pipe diameter',
      units: [
        'm',
        'cm',
        'mm',
      ],
    },
    {
      aliases: [
        'L',
      ],
      canonicalName:
        'pipe length',
      units: [
        'm',
        'cm',
        'mm',
      ],
    },
    {
      aliases: [
        'ε',
        'eps',
        'epsilon',
      ],
      canonicalName:
        'surface roughness',
      units: [
        'm',
        'cm',
        'mm',
      ],
    },
    {
      aliases: [
        'v',
      ],
      canonicalName:
        'velocity',
      units: [
        'm/s',
        'cm/s',
        'km/h',
      ],
    },
    {
      aliases: [
        'Q',
      ],
      canonicalName:
        'volumetric flow rate',
      units: [
        'm3/s',
        'm3/h',
        'l/s',
        'l/min',
      ],
    },
    {
      aliases: [
        'ΔP',
        '∆P',
        'δP',
        'dP',
        'dp',
      ],
      canonicalName:
        'pressure difference',
      units: [
        'pa',
        'kpa',
        'mpa',
        'bar',
        'atm',
      ],
    },
    {
      aliases: [
        'P',
      ],
      canonicalName:
        'pressure',
      units: [
        'pa',
        'kpa',
        'mpa',
        'bar',
        'atm',
      ],
    },
    {
      aliases: [
        'T',
      ],
      canonicalName:
        'absolute temperature',
      units: [
        'k',
        'c',
        'deg c',
        'celsius',
      ],
    },
    {
      aliases: [
        'n',
      ],
      canonicalName:
        'amount of gas',
      units: [
        'mol',
        'kmol',
      ],
    },
    {
      aliases: [
        'V',
      ],
      canonicalName:
        'volume',
      units: [
        'm3',
        'l',
        'ml',
        'cm3',
      ],
    },
    {
      aliases: [
        'm',
      ],
      canonicalName:
        'mass',
      units: [
        'kg',
        'g',
        'mg',
      ],
    },
    {
      aliases: [
        'MW',
        'Mw',
        'mw',
      ],
      canonicalName:
        'molecular weight',
      units: [
        'g/mol',
        'kg/mol',
        'kg/kmol',
      ],
    },
    {
      aliases: [
        'Cp',
        'cp',
        'C_p',
        'c_p',
      ],
      canonicalName:
        'specific heat capacity',
      units: [
        'j/kg k',
        'kj/kg k',
        'j/mol k',
        'kj/mol k',
      ],
    },
    {
      aliases: [
        'A',
      ],
      canonicalName:
        'area',
      units: [
        'm2',
        'cm2',
        'mm2',
      ],
    },
    {
      aliases: [
        'η',
        'eta',
      ],
      canonicalName:
        'efficiency',
      units: [
        '%',
        'percent',
      ],
      allowUnitless:
        true,
    },
    {
      aliases: [
        'Re',
        're',
      ],
      canonicalName:
        'Reynolds number',
      units: [],
      allowUnitless:
        true,
    },
    {
      aliases: [
        'f',
      ],
      canonicalName:
        'friction factor',
      units: [],
      allowUnitless:
        true,
    },
    {
      aliases: [
        'X_A',
        'XA',
        'xA',
        'xa',
      ],
      canonicalName:
        'conversion',
      units: [
        '%',
        'percent',
      ],
      allowUnitless:
        true,
    },
    {
      aliases: [
        'C_A0',
        'CA0',
        'ca0',
      ],
      canonicalName:
        'inlet concentration',
      units: [
        'mol/m3',
        'kmol/m3',
        'mol/l',
      ],
    },
    {
      aliases: [
        '-r_A',
        '-rA',
        'r_A',
        'rA',
      ],
      canonicalName:
        'reaction rate',
      units: [
        'mol/m3 s',
        'kmol/m3 s',
        'mol/l s',
      ],
    },
  ]

function normalizeSymbol(
  value: string,
): string {
  return value
    .replace(
      /[−–—]/g,
      '-',
    )
    .replace(
      /\s+/g,
      '',
    )
}

function normalizeUnit(
  value: string,
): string {
  return value
    .toLocaleLowerCase(
      'en-US',
    )
    .replace(
      /[−–—]/g,
      '-',
    )
    .replace(
      /³/g,
      '3',
    )
    .replace(
      /²/g,
      '2',
    )
    .replace(
      /\^/g,
      '',
    )
    .replace(
      /°/g,
      '',
    )
    .replace(
      /[·*]/g,
      ' ',
    )
    .replace(
      /[()[\]]/g,
      ' ',
    )
    .replace(
      /\s*\/\s*/g,
      '/',
    )
    .replace(
      /\s+/g,
      ' ',
    )
    .replace(
      /[.,]+$/g,
      '',
    )
    .trim()
}

function findProfile(
  symbol: string,
): SymbolProfile | undefined {
  const cleanSymbol =
    normalizeSymbol(
      symbol,
    )

  return SYMBOL_PROFILES.find(
    (profile) =>
      profile.aliases.some(
        (alias) =>
          normalizeSymbol(
            alias,
          ) ===
          cleanSymbol,
      ),
  )
}

function unitIsAccepted(
  profile: SymbolProfile,
  unit: string,
): boolean {
  if (!unit) {
    return Boolean(
      profile.allowUnitless,
    )
  }

  return profile.units.includes(
    unit,
  )
}

function createCanonicalText(
  profile: SymbolProfile,
  value: number,
  unit: string,
): string {
  return [
    profile.canonicalName,
    String(
      value,
    ),
    unit,
  ]
    .filter(
      (part) =>
        part.length > 0,
    )
    .join(
      ' ',
    )
}

function deduplicateAssignments(
  assignments:
    ProblemEquationAssignment[],
): ProblemEquationAssignment[] {
  const seen =
    new Set<string>()

  return assignments.filter(
    (assignment) => {
      const key = [
        assignment.canonicalName,
        assignment.value,
        assignment.unit,
      ].join(
        '|',
      )

      if (
        seen.has(
          key,
        )
      ) {
        return false
      }

      seen.add(
        key,
      )

      return true
    },
  )
}

export function parseEquationAwareInput(
  query: string,
): ProblemEquationParseResult {
  const assignmentPattern =
    new RegExp(
      `(?:^|[\\s,;([])(-?[A-Za-zΑ-ωΆ-ώΔ∆δρμνηε]+(?:_[A-Za-z0-9]+)?)\\s*(?:=|:)\\s*(${NUMBER_SOURCE})\\s*([^,;\\n]*)`,
      'gu',
    )

  const assignments:
    ProblemEquationAssignment[] = []

  for (
    const match
    of query.matchAll(
      assignmentPattern,
    )
  ) {
    const symbol =
      normalizeSymbol(
        match[1],
      )

    const profile =
      findProfile(
        symbol,
      )

    if (!profile) {
      continue
    }

    const value =
      Number(
        match[2],
      )

    if (
      !Number.isFinite(
        value,
      )
    ) {
      continue
    }

    const unit =
      normalizeUnit(
        match[3] ?? '',
      )

    if (
      !unitIsAccepted(
        profile,
        unit,
      )
    ) {
      continue
    }

    assignments.push({
      symbol,
      canonicalName:
        profile.canonicalName,
      value,
      unit,
      canonicalText:
        createCanonicalText(
          profile,
          value,
          unit,
        ),
    })
  }

  const uniqueAssignments =
    deduplicateAssignments(
      assignments,
    )

  if (
    uniqueAssignments.length ===
    0
  ) {
    return {
      originalQuery:
        query,
      enrichedQuery:
        query,
      assignments: [],
    }
  }

  const canonicalInputText =
    uniqueAssignments
      .map(
        (assignment) =>
          assignment.canonicalText,
      )
      .join(
        '; ',
      )

  return {
    originalQuery:
      query,
    enrichedQuery:
      `${query}\nParsed symbolic inputs: ${canonicalInputText}.`,
    assignments:
      uniqueAssignments,
  }
}
