import type {
  ProblemEquationAssignment,
} from './problemEquationInputParser.ts'

export type KnownEngineeringEquationId =
  | 'ideal-gas-law'
  | 'reynolds-number'
  | 'flow-continuity'
  | 'darcy-weisbach'
  | 'pump-power'
  | 'heat-exchanger-duty'
  | 'ficks-first-law'

export type EquationTargetSource =
  | 'explicit'
  | 'missing-variable'
  | 'text'
  | null

export interface ProblemEquationIntent {
  equationId:
    KnownEngineeringEquationId | null
  equationLabel:
    string | null
  equation:
    string | null
  targetSymbol:
    string | null
  targetName:
    string | null
  targetSource:
    EquationTargetSource
  referencedSymbols: string[]
  suggestedCalculatorIds: string[]
  suggestedCategories: string[]
  enrichedText: string
}

interface EquationVariable {
  key: string
  symbol: string
  name: string
  aliases: string[]
}

interface EquationProfile {
  id:
    KnownEngineeringEquationId
  label: string
  equation: string
  variables:
    EquationVariable[]
  suggestedCalculatorIds: string[]
  suggestedCategories: string[]
  matches:
    (compactQuery: string) =>
      boolean
}

interface GlobalTargetProfile {
  symbol: string
  name: string
  aliases: string[]
  textSignals: string[]
}

function normalizeDashes(
  value: string,
): string {
  return value.replace(
    /[−–—]/g,
    '-',
  )
}

function compactEquationText(
  value: string,
): string {
  return normalizeDashes(
    value,
  )
    .replaceAll(
      'ρ',
      'rho',
    )
    .replaceAll(
      'μ',
      'mu',
    )
    .replaceAll(
      'η',
      'eta',
    )
    .replaceAll(
      'Δ',
      'delta',
    )
    .replaceAll(
      '∆',
      'delta',
    )
    .replaceAll(
      'δ',
      'delta',
    )
    .replaceAll(
      '²',
      '2',
    )
    .replaceAll(
      '³',
      '3',
    )
    .replace(
      /\^/g,
      '',
    )
    .replace(
      /[·×*]/g,
      '',
    )
    .replace(
      /\s+/g,
      '',
    )
    .toLocaleLowerCase(
      'en-US',
    )
}

function normalizeWords(
  value: string,
): string {
  return normalizeDashes(
    value,
  )
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
      /[^a-z0-9ρμνηεΔ∆δ\s-]/g,
      ' ',
    )
    .replace(
      /\s+/g,
      ' ',
    )
    .trim()
}

function normalizeSymbol(
  value: string,
): string {
  return normalizeDashes(
    value,
  )
    .replace(
      /\s+/g,
      '',
    )
    .trim()
}

function aliasesMatch(
  candidate: string,
  alias: string,
): boolean {
  const cleanCandidate =
    normalizeSymbol(
      candidate,
    )

  const cleanAlias =
    normalizeSymbol(
      alias,
    )

  if (
    /^[A-Za-z]$/.test(
      cleanAlias,
    )
  ) {
    return (
      cleanCandidate ===
      cleanAlias
    )
  }

  return (
    cleanCandidate.toLocaleLowerCase(
      'en-US',
    ) ===
    cleanAlias.toLocaleLowerCase(
      'en-US',
    )
  )
}

const EQUATION_PROFILES:
  EquationProfile[] = [
    {
      id:
        'ideal-gas-law',
      label:
        'Ideal gas law',
      equation:
        'PV = nRT',
      variables: [
        {
          key:
            'pressure',
          symbol:
            'P',
          name:
            'pressure',
          aliases: [
            'P',
            'p',
          ],
        },
        {
          key:
            'volume',
          symbol:
            'V',
          name:
            'volume',
          aliases: [
            'V',
          ],
        },
        {
          key:
            'amount',
          symbol:
            'n',
          name:
            'amount of gas',
          aliases: [
            'n',
          ],
        },
        {
          key:
            'temperature',
          symbol:
            'T',
          name:
            'absolute temperature',
          aliases: [
            'T',
          ],
        },
      ],
      suggestedCalculatorIds: [
        'idealGas',
        'idealGasCalculator',
      ],
      suggestedCategories: [
        'Thermodynamics',
      ],
      matches:
        (query) =>
          query.includes(
            'pv=nrt',
          ),
    },
    {
      id:
        'reynolds-number',
      label:
        'Reynolds-number relation',
      equation:
        'Re = ρvD/μ',
      variables: [
        {
          key:
            'reynolds-number',
          symbol:
            'Re',
          name:
            'Reynolds number',
          aliases: [
            'Re',
            're',
          ],
        },
        {
          key:
            'density',
          symbol:
            'ρ',
          name:
            'fluid density',
          aliases: [
            'ρ',
            'rho',
          ],
        },
        {
          key:
            'velocity',
          symbol:
            'v',
          name:
            'velocity',
          aliases: [
            'v',
          ],
        },
        {
          key:
            'diameter',
          symbol:
            'D',
          name:
            'pipe diameter',
          aliases: [
            'D',
          ],
        },
        {
          key:
            'viscosity',
          symbol:
            'μ',
          name:
            'dynamic viscosity',
          aliases: [
            'μ',
            'mu',
          ],
        },
      ],
      suggestedCalculatorIds: [
        'reynoldsNumber',
      ],
      suggestedCategories: [
        'Fluid Mechanics',
      ],
      matches:
        (query) =>
          query.includes(
            're=rhovd/mu',
          ),
    },
    {
      id:
        'flow-continuity',
      label:
        'Flow continuity relation',
      equation:
        'Q = Av',
      variables: [
        {
          key:
            'flow-rate',
          symbol:
            'Q',
          name:
            'volumetric flow rate',
          aliases: [
            'Q',
          ],
        },
        {
          key:
            'area',
          symbol:
            'A',
          name:
            'flow area',
          aliases: [
            'A',
          ],
        },
        {
          key:
            'velocity',
          symbol:
            'v',
          name:
            'velocity',
          aliases: [
            'v',
          ],
        },
      ],
      suggestedCalculatorIds: [
        'flowRate',
        'velocity',
      ],
      suggestedCategories: [
        'Fluid Mechanics',
      ],
      matches:
        (query) =>
          query.includes(
            'q=av',
          ),
    },
    {
      id:
        'darcy-weisbach',
      label:
        'Darcy–Weisbach equation',
      equation:
        'ΔP = f(L/D)(ρv²/2)',
      variables: [
        {
          key:
            'pressure-difference',
          symbol:
            'ΔP',
          name:
            'pressure difference',
          aliases: [
            'ΔP',
            '∆P',
            'δP',
            'dP',
            'dp',
          ],
        },
        {
          key:
            'friction-factor',
          symbol:
            'f',
          name:
            'friction factor',
          aliases: [
            'f',
          ],
        },
        {
          key:
            'length',
          symbol:
            'L',
          name:
            'pipe length',
          aliases: [
            'L',
          ],
        },
        {
          key:
            'diameter',
          symbol:
            'D',
          name:
            'pipe diameter',
          aliases: [
            'D',
          ],
        },
        {
          key:
            'density',
          symbol:
            'ρ',
          name:
            'fluid density',
          aliases: [
            'ρ',
            'rho',
          ],
        },
        {
          key:
            'velocity',
          symbol:
            'v',
          name:
            'velocity',
          aliases: [
            'v',
          ],
        },
      ],
      suggestedCalculatorIds: [
        'pressureDrop',
      ],
      suggestedCategories: [
        'Fluid Mechanics',
      ],
      matches:
        (query) =>
          query.includes(
            'deltap=',
          ) &&
          query.includes(
            'f(l/d)',
          ) &&
          query.includes(
            'rhov2/2',
          ),
    },
    {
      id:
        'pump-power',
      label:
        'Pump-power relation',
      equation:
        'W = ρgQH/η',
      variables: [
        {
          key:
            'power',
          symbol:
            'W',
          name:
            'pump power',
          aliases: [
            'W',
            'Ppump',
          ],
        },
        {
          key:
            'density',
          symbol:
            'ρ',
          name:
            'fluid density',
          aliases: [
            'ρ',
            'rho',
          ],
        },
        {
          key:
            'flow-rate',
          symbol:
            'Q',
          name:
            'volumetric flow rate',
          aliases: [
            'Q',
          ],
        },
        {
          key:
            'head',
          symbol:
            'H',
          name:
            'total head',
          aliases: [
            'H',
          ],
        },
        {
          key:
            'efficiency',
          symbol:
            'η',
          name:
            'pump efficiency',
          aliases: [
            'η',
            'eta',
          ],
        },
      ],
      suggestedCalculatorIds: [
        'pumpPower',
      ],
      suggestedCategories: [
        'Fluid Mechanics',
      ],
      matches:
        (query) =>
          query.includes(
            'w=rhogqh/eta',
          ) ||
          query.includes(
            'ppump=rhogqh/eta',
          ),
    },
    {
      id:
        'heat-exchanger-duty',
      label:
        'Heat-exchanger duty relation',
      equation:
        'Q = UAΔTlm',
      variables: [
        {
          key:
            'heat-duty',
          symbol:
            'Q',
          name:
            'heat-transfer rate',
          aliases: [
            'Q',
          ],
        },
        {
          key:
            'overall-u',
          symbol:
            'U',
          name:
            'overall heat-transfer coefficient',
          aliases: [
            'U',
          ],
        },
        {
          key:
            'area',
          symbol:
            'A',
          name:
            'heat-transfer area',
          aliases: [
            'A',
          ],
        },
        {
          key:
            'lmtd',
          symbol:
            'ΔTlm',
          name:
            'log-mean temperature difference',
          aliases: [
            'ΔTlm',
            'DTlm',
            'LMTD',
          ],
        },
      ],
      suggestedCalculatorIds: [
        'heatExchangerLMTD',
        'heatExchangerAreaSizing',
      ],
      suggestedCategories: [
        'Heat Transfer',
      ],
      matches:
        (query) =>
          query.includes(
            'q=uadeltatlm',
          ) ||
          query.includes(
            'q=ualmtd',
          ),
    },
    {
      id:
        'ficks-first-law',
      label:
        "Fick's first law",
      equation:
        'J = -DΔC/L',
      variables: [
        {
          key:
            'flux',
          symbol:
            'J',
          name:
            'molar flux',
          aliases: [
            'J',
            'j',
          ],
        },
        {
          key:
            'diffusivity',
          symbol:
            'D',
          name:
            'diffusivity',
          aliases: [
            'D',
          ],
        },
        {
          key:
            'concentration-difference',
          symbol:
            'ΔC',
          name:
            'concentration difference',
          aliases: [
            'ΔC',
            '∆C',
            'dC',
          ],
        },
        {
          key:
            'length',
          symbol:
            'L',
          name:
            'diffusion length',
          aliases: [
            'L',
          ],
        },
      ],
      suggestedCalculatorIds: [
        'ficksFirstLaw',
      ],
      suggestedCategories: [
        'Mass Transfer',
      ],
      matches:
        (query) =>
          query.includes(
            'j=-ddeltac/l',
          ),
    },
  ]

const GLOBAL_TARGETS:
  GlobalTargetProfile[] = [
    {
      symbol:
        'ΔP',
      name:
        'pressure difference',
      aliases: [
        'ΔP',
        '∆P',
        'δP',
        'dP',
        'dp',
      ],
      textSignals: [
        'pressure drop',
        'pressure difference',
        'basinc dusumu',
      ],
    },
    {
      symbol:
        'Re',
      name:
        'Reynolds number',
      aliases: [
        'Re',
        're',
      ],
      textSignals: [
        'reynolds number',
        'reynolds sayisi',
      ],
    },
    {
      symbol:
        'Q',
      name:
        'volumetric flow rate',
      aliases: [
        'Q',
      ],
      textSignals: [
        'volumetric flow rate',
        'flow rate',
        'debi',
      ],
    },
    {
      symbol:
        'V',
      name:
        'volume',
      aliases: [
        'V',
      ],
      textSignals: [
        'volume',
        'hacim',
      ],
    },
    {
      symbol:
        'v',
      name:
        'velocity',
      aliases: [
        'v',
      ],
      textSignals: [
        'velocity',
        'average velocity',
        'hiz',
      ],
    },
    {
      symbol:
        'P',
      name:
        'pressure',
      aliases: [
        'P',
        'p',
      ],
      textSignals: [
        'pressure',
        'basinc',
      ],
    },
    {
      symbol:
        'T',
      name:
        'absolute temperature',
      aliases: [
        'T',
      ],
      textSignals: [
        'temperature',
        'sicaklik',
      ],
    },
    {
      symbol:
        'n',
      name:
        'amount of gas',
      aliases: [
        'n',
      ],
      textSignals: [
        'amount of gas',
        'number of moles',
        'mole amount',
        'mol sayisi',
      ],
    },
    {
      symbol:
        'ρ',
      name:
        'fluid density',
      aliases: [
        'ρ',
        'rho',
      ],
      textSignals: [
        'density',
        'fluid density',
        'yogunluk',
      ],
    },
    {
      symbol:
        'μ',
      name:
        'dynamic viscosity',
      aliases: [
        'μ',
        'mu',
      ],
      textSignals: [
        'dynamic viscosity',
        'viscosity',
        'dinamik viskozite',
      ],
    },
    {
      symbol:
        'η',
      name:
        'efficiency',
      aliases: [
        'η',
        'eta',
      ],
      textSignals: [
        'efficiency',
        'verim',
      ],
    },
    {
      symbol:
        'A',
      name:
        'area',
      aliases: [
        'A',
      ],
      textSignals: [
        'area',
        'flow area',
        'surface area',
        'alan',
      ],
    },
    {
      symbol:
        'D',
      name:
        'diameter',
      aliases: [
        'D',
      ],
      textSignals: [
        'diameter',
        'pipe diameter',
        'cap',
      ],
    },
    {
      symbol:
        'm',
      name:
        'mass',
      aliases: [
        'm',
      ],
      textSignals: [
        'mass',
        'kutle',
      ],
    },
    {
      symbol:
        'X_A',
      name:
        'conversion',
      aliases: [
        'X_A',
        'XA',
        'xA',
        'xa',
      ],
      textSignals: [
        'conversion',
        'donusum',
      ],
    },
  ]

function findEquationProfile(
  query: string,
): EquationProfile | null {
  const compactQuery =
    compactEquationText(
      query,
    )

  return (
    EQUATION_PROFILES.find(
      (profile) =>
        profile.matches(
          compactQuery,
        ),
    ) ??
    null
  )
}

function findEquationVariable(
  symbol: string,
  profile:
    EquationProfile | null,
): EquationVariable | null {
  if (!profile) {
    return null
  }

  return (
    profile.variables.find(
      (variable) =>
        variable.aliases.some(
          (alias) =>
            aliasesMatch(
              symbol,
              alias,
            ),
        ),
    ) ??
    null
  )
}

function findGlobalTargetBySymbol(
  symbol: string,
): GlobalTargetProfile | null {
  return (
    GLOBAL_TARGETS.find(
      (target) =>
        target.aliases.some(
          (alias) =>
            aliasesMatch(
              symbol,
              alias,
            ),
        ),
    ) ??
    null
  )
}

function detectExplicitTargetSymbol(
  query: string,
): string | null {
  const unknownAssignment =
    /(?:^|[\s,;([])(-?[A-Za-zΑ-ωΆ-ώΔ∆δρμνηε]+(?:_[A-Za-z0-9]+)?)\s*=\s*\?/u.exec(
      query,
    )

  if (
    unknownAssignment
  ) {
    return normalizeSymbol(
      unknownAssignment[1],
    )
  }

  const phraseTarget =
    /(?:solve\s+for|find|determine|unknown(?:\s+is)?|target(?:\s+is)?)\s+(?:the\s+)?(-?[A-Za-zΑ-ωΆ-ώΔ∆δρμνηε]+(?:_[A-Za-z0-9]+)?)/iu.exec(
      query,
    )

  if (
    phraseTarget
  ) {
    return normalizeSymbol(
      phraseTarget[1],
    )
  }

  return null
}

function targetFromSymbol(
  symbol: string,
  profile:
    EquationProfile | null,
): {
  symbol: string
  name: string
} | null {
  const equationVariable =
    findEquationVariable(
      symbol,
      profile,
    )

  if (
    equationVariable
  ) {
    return {
      symbol:
        equationVariable.symbol,
      name:
        equationVariable.name,
    }
  }

  const globalTarget =
    findGlobalTargetBySymbol(
      symbol,
    )

  if (
    !globalTarget
  ) {
    return null
  }

  return {
    symbol:
      globalTarget.symbol,
    name:
      globalTarget.name,
  }
}

function inferMissingVariable(
  assignments:
    ProblemEquationAssignment[],
  profile:
    EquationProfile | null,
): EquationVariable | null {
  if (!profile) {
    return null
  }

  const assignedKeys =
    new Set<string>()

  for (
    const assignment
    of assignments
  ) {
    const variable =
      findEquationVariable(
        assignment.symbol,
        profile,
      )

    if (
      variable
    ) {
      assignedKeys.add(
        variable.key,
      )
    }
  }

  const missingVariables =
    profile.variables.filter(
      (variable) =>
        !assignedKeys.has(
          variable.key,
        ),
    )

  if (
    missingVariables.length !==
    1
  ) {
    return null
  }

  return missingVariables[0]
}

function detectTextTarget(
  query: string,
): GlobalTargetProfile | null {
  const cleanQuery =
    normalizeWords(
      query,
    )

  return (
    GLOBAL_TARGETS.find(
      (target) =>
        target.textSignals.some(
          (signal) =>
            cleanQuery.includes(
              normalizeWords(
                signal,
              ),
            ),
        ),
    ) ??
    null
  )
}

export function inferProblemEquationIntent(
  query: string,
  assignments:
    ProblemEquationAssignment[],
): ProblemEquationIntent {
  const equationProfile =
    findEquationProfile(
      query,
    )

  const explicitSymbol =
    detectExplicitTargetSymbol(
      query,
    )

  const explicitTarget =
    explicitSymbol
      ? targetFromSymbol(
          explicitSymbol,
          equationProfile,
        )
      : null

  const missingVariable =
    explicitTarget
      ? null
      : inferMissingVariable(
          assignments,
          equationProfile,
        )

  const textTarget =
    explicitTarget ||
    missingVariable
      ? null
      : detectTextTarget(
          query,
        )

  const targetSymbol =
    explicitTarget?.symbol ??
    missingVariable?.symbol ??
    textTarget?.symbol ??
    null

  const targetName =
    explicitTarget?.name ??
    missingVariable?.name ??
    textTarget?.name ??
    null

  const targetSource:
    EquationTargetSource =
      explicitTarget
        ? 'explicit'
        : missingVariable
          ? 'missing-variable'
          : textTarget
            ? 'text'
            : null

  const enrichedSections:
    string[] = []

  if (
    equationProfile
  ) {
    enrichedSections.push(
      `Recognized equation: ${equationProfile.label} (${equationProfile.equation}).`,
    )
  }

  if (
    targetName
  ) {
    enrichedSections.push(
      `Requested unknown: ${targetName}.`,
    )
  }

  return {
    equationId:
      equationProfile?.id ??
      null,
    equationLabel:
      equationProfile?.label ??
      null,
    equation:
      equationProfile?.equation ??
      null,
    targetSymbol,
    targetName,
    targetSource,
    referencedSymbols:
      equationProfile?.variables.map(
        (variable) =>
          variable.symbol,
      ) ?? [],
    suggestedCalculatorIds:
      equationProfile
        ?.suggestedCalculatorIds ??
      [],
    suggestedCategories:
      equationProfile
        ?.suggestedCategories ??
      [],
    enrichedText:
      enrichedSections.join(
        ' ',
      ),
  }
}
