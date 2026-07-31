import type {
  ProblemEquationAssignment,
} from './problemEquationInputParser.ts'

import type {
  KnownEngineeringEquationId,
  ProblemEquationIntent,
} from './problemEquationIntentEngine.ts'

export type EquationReadinessStatus =
  | 'not-recognized'
  | 'ready'
  | 'needs-inputs'
  | 'ambiguous'

export interface ContextualEquationAssignment
  extends ProblemEquationAssignment {
  variableKey: string
  contextualName: string
  contextualText: string
}

export interface ProblemEquationContext {
  status:
    EquationReadinessStatus
  readinessPercent: number
  targetKey: string | null
  targetName: string | null
  targetProvided: boolean
  providedVariableNames: string[]
  missingVariableNames: string[]
  assignments:
    ContextualEquationAssignment[]
  diagnostics: string[]
  enrichedText: string
}

interface EquationContextVariable {
  key: string
  symbol: string
  name: string
  aliases: string[]
}

interface EquationContextProfile {
  id:
    KnownEngineeringEquationId
  variables:
    EquationContextVariable[]
}

function variable(
  key: string,
  symbol: string,
  name: string,
  aliases: string[],
): EquationContextVariable {
  return {
    key,
    symbol,
    name,
    aliases,
  }
}

const EQUATION_CONTEXT_PROFILES:
  EquationContextProfile[] = [
    {
      id:
        'ideal-gas-law',
      variables: [
        variable(
          'pressure',
          'P',
          'absolute pressure',
          [
            'P',
            'p',
          ],
        ),
        variable(
          'volume',
          'V',
          'gas volume',
          [
            'V',
          ],
        ),
        variable(
          'amount',
          'n',
          'amount of gas',
          [
            'n',
          ],
        ),
        variable(
          'temperature',
          'T',
          'absolute temperature',
          [
            'T',
          ],
        ),
      ],
    },
    {
      id:
        'reynolds-number',
      variables: [
        variable(
          'reynolds-number',
          'Re',
          'Reynolds number',
          [
            'Re',
            're',
          ],
        ),
        variable(
          'density',
          'ρ',
          'fluid density',
          [
            'ρ',
            'rho',
          ],
        ),
        variable(
          'velocity',
          'v',
          'velocity',
          [
            'v',
          ],
        ),
        variable(
          'diameter',
          'D',
          'pipe diameter',
          [
            'D',
          ],
        ),
        variable(
          'viscosity',
          'μ',
          'dynamic viscosity',
          [
            'μ',
            'mu',
          ],
        ),
      ],
    },
    {
      id:
        'flow-continuity',
      variables: [
        variable(
          'flow-rate',
          'Q',
          'volumetric flow rate',
          [
            'Q',
          ],
        ),
        variable(
          'area',
          'A',
          'flow area',
          [
            'A',
          ],
        ),
        variable(
          'velocity',
          'v',
          'average velocity',
          [
            'v',
          ],
        ),
      ],
    },
    {
      id:
        'darcy-weisbach',
      variables: [
        variable(
          'pressure-difference',
          'ΔP',
          'pressure difference',
          [
            'ΔP',
            '∆P',
            'δP',
            'dP',
            'dp',
          ],
        ),
        variable(
          'friction-factor',
          'f',
          'friction factor',
          [
            'f',
          ],
        ),
        variable(
          'length',
          'L',
          'pipe length',
          [
            'L',
          ],
        ),
        variable(
          'diameter',
          'D',
          'pipe diameter',
          [
            'D',
          ],
        ),
        variable(
          'density',
          'ρ',
          'fluid density',
          [
            'ρ',
            'rho',
          ],
        ),
        variable(
          'velocity',
          'v',
          'velocity',
          [
            'v',
          ],
        ),
      ],
    },
    {
      id:
        'pump-power',
      variables: [
        variable(
          'power',
          'W',
          'pump power',
          [
            'W',
            'Ppump',
          ],
        ),
        variable(
          'density',
          'ρ',
          'fluid density',
          [
            'ρ',
            'rho',
          ],
        ),
        variable(
          'flow-rate',
          'Q',
          'volumetric flow rate',
          [
            'Q',
          ],
        ),
        variable(
          'head',
          'H',
          'total head',
          [
            'H',
          ],
        ),
        variable(
          'efficiency',
          'η',
          'pump efficiency',
          [
            'η',
            'eta',
          ],
        ),
      ],
    },
    {
      id:
        'heat-exchanger-duty',
      variables: [
        variable(
          'heat-duty',
          'Q',
          'heat-transfer rate',
          [
            'Q',
          ],
        ),
        variable(
          'overall-u',
          'U',
          'overall heat-transfer coefficient',
          [
            'U',
          ],
        ),
        variable(
          'area',
          'A',
          'heat-transfer area',
          [
            'A',
          ],
        ),
        variable(
          'lmtd',
          'ΔTlm',
          'log-mean temperature difference',
          [
            'ΔTlm',
            'DTlm',
            'LMTD',
          ],
        ),
      ],
    },
    {
      id:
        'ficks-first-law',
      variables: [
        variable(
          'flux',
          'J',
          'molar flux',
          [
            'J',
            'j',
          ],
        ),
        variable(
          'diffusivity',
          'D',
          'diffusivity',
          [
            'D',
          ],
        ),
        variable(
          'concentration-difference',
          'ΔC',
          'concentration difference',
          [
            'ΔC',
            '∆C',
            'dC',
          ],
        ),
        variable(
          'length',
          'L',
          'diffusion length',
          [
            'L',
          ],
        ),
      ],
    },
  ]

function normalizeDash(
  value: string,
): string {
  return value.replace(
    /[−–—]/g,
    '-',
  )
}

function normalizeSymbol(
  value: string,
): string {
  return normalizeDash(
    value,
  )
    .replace(
      /\s+/g,
      '',
    )
    .trim()
}

function symbolsMatch(
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

function findProfile(
  equationId:
    KnownEngineeringEquationId | null,
): EquationContextProfile | null {
  if (!equationId) {
    return null
  }

  return (
    EQUATION_CONTEXT_PROFILES.find(
      (profile) =>
        profile.id ===
        equationId,
    ) ??
    null
  )
}

function findVariableBySymbol(
  profile:
    EquationContextProfile,
  symbol: string,
): EquationContextVariable | null {
  return (
    profile.variables.find(
      (candidate) =>
        candidate.aliases.some(
          (alias) =>
            symbolsMatch(
              symbol,
              alias,
            ),
        ),
    ) ??
    null
  )
}

function findTargetVariable(
  profile:
    EquationContextProfile,
  intent:
    ProblemEquationIntent,
): EquationContextVariable | null {
  if (
    intent.targetSymbol
  ) {
    const symbolMatch =
      findVariableBySymbol(
        profile,
        intent.targetSymbol,
      )

    if (
      symbolMatch
    ) {
      return symbolMatch
    }
  }

  if (
    intent.targetName
  ) {
    const cleanTargetName =
      intent.targetName
        .toLocaleLowerCase(
          'en-US',
        )
        .trim()

    return (
      profile.variables.find(
        (candidate) =>
          candidate.name
            .toLocaleLowerCase(
              'en-US',
            ) ===
          cleanTargetName,
      ) ??
      null
    )
  }

  return null
}

function contextualizeAssignments(
  profile:
    EquationContextProfile,
  assignments:
    ProblemEquationAssignment[],
): ContextualEquationAssignment[] {
  const contextualized:
    ContextualEquationAssignment[] = []

  for (
    const assignment
    of assignments
  ) {
    const equationVariable =
      findVariableBySymbol(
        profile,
        assignment.symbol,
      )

    if (
      !equationVariable
    ) {
      continue
    }

    contextualized.push({
      ...assignment,
      variableKey:
        equationVariable.key,
      contextualName:
        equationVariable.name,
      contextualText: [
        equationVariable.name,
        String(
          assignment.value,
        ),
        assignment.unit,
      ]
        .filter(
          (part) =>
            part.length > 0,
        )
        .join(
          ' ',
        ),
    })
  }

  return contextualized
}

function conflictingVariableKeys(
  assignments:
    ContextualEquationAssignment[],
): string[] {
  const grouped =
    new Map<
      string,
      ContextualEquationAssignment[]
    >()

  for (
    const assignment
    of assignments
  ) {
    const existing =
      grouped.get(
        assignment.variableKey,
      ) ?? []

    existing.push(
      assignment,
    )

    grouped.set(
      assignment.variableKey,
      existing,
    )
  }

  const conflicts:
    string[] = []

  for (
    const [
      variableKey,
      values,
    ]
    of grouped
  ) {
    if (
      values.length <
      2
    ) {
      continue
    }

    const signatures =
      new Set(
        values.map(
          (assignment) =>
            [
              assignment.value,
              assignment.unit,
            ].join(
              '|',
            ),
        ),
      )

    if (
      signatures.size >
      1
    ) {
      conflicts.push(
        variableKey,
      )
    }
  }

  return conflicts
}

function uniqueValues(
  values: string[],
): string[] {
  return Array.from(
    new Set(
      values,
    ),
  )
}

export function resolveProblemEquationContext(
  intent:
    ProblemEquationIntent,
  assignments:
    ProblemEquationAssignment[],
): ProblemEquationContext {
  const profile =
    findProfile(
      intent.equationId,
    )

  if (
    !profile
  ) {
    return {
      status:
        'not-recognized',
      readinessPercent:
        0,
      targetKey:
        null,
      targetName:
        intent.targetName,
      targetProvided:
        false,
      providedVariableNames:
        [],
      missingVariableNames:
        [],
      assignments: [],
      diagnostics: [],
      enrichedText:
        '',
    }
  }

  const contextualAssignments =
    contextualizeAssignments(
      profile,
      assignments,
    )

  const targetVariable =
    findTargetVariable(
      profile,
      intent,
    )

  const providedKeys =
    new Set(
      contextualAssignments.map(
        (assignment) =>
          assignment.variableKey,
      ),
    )

  const requiredVariables =
    targetVariable
      ? profile.variables.filter(
          (candidate) =>
            candidate.key !==
            targetVariable.key,
        )
      : profile.variables

  const providedVariableNames =
    uniqueValues(
      contextualAssignments.map(
        (assignment) =>
          assignment.contextualName,
      ),
    )

  const missingVariables =
    requiredVariables.filter(
      (candidate) =>
        !providedKeys.has(
          candidate.key,
        ),
    )

  const missingVariableNames =
    missingVariables.map(
      (candidate) =>
        candidate.name,
    )

  const conflictKeys =
    conflictingVariableKeys(
      contextualAssignments,
    )

  const targetProvided =
    Boolean(
      targetVariable &&
      providedKeys.has(
        targetVariable.key,
      ),
    )

  const requiredCount =
    requiredVariables.length

  const suppliedRequiredCount =
    requiredVariables.filter(
      (candidate) =>
        providedKeys.has(
          candidate.key,
        ),
    ).length

  const readinessPercent =
    requiredCount ===
    0
      ? 100
      : Math.round(
          (
            suppliedRequiredCount /
            requiredCount
          ) *
          100,
        )

  const diagnostics:
    string[] = []

  if (
    !targetVariable
  ) {
    diagnostics.push(
      'The equation was recognized, but the requested unknown could not be identified.',
    )
  }

  if (
    conflictKeys.length >
    0
  ) {
    diagnostics.push(
      `Conflicting assignments were detected for: ${
        conflictKeys.join(
          ', ',
        )
      }.`,
    )
  }

  if (
    missingVariableNames.length >
    0
  ) {
    diagnostics.push(
      `Missing equation inputs: ${
        missingVariableNames.join(
          ', ',
        )
      }.`,
    )
  }

  if (
    targetProvided
  ) {
    diagnostics.push(
      'The requested target is already supplied; treat the equation as a verification problem.',
    )
  }

  let status:
    EquationReadinessStatus

  if (
    !targetVariable ||
    conflictKeys.length >
      0
  ) {
    status =
      'ambiguous'
  } else if (
    missingVariableNames.length >
    0
  ) {
    status =
      'needs-inputs'
  } else {
    status =
      'ready'
  }

  const enrichedSections = [
    `Equation readiness: ${status} (${readinessPercent}%).`,
  ]

  if (
    contextualAssignments.length >
    0
  ) {
    enrichedSections.push(
      `Contextual equation inputs: ${
        contextualAssignments
          .map(
            (assignment) =>
              assignment.contextualText,
          )
          .join(
            '; ',
          )
      }.`,
    )
  }

  if (
    missingVariableNames.length >
    0
  ) {
    enrichedSections.push(
      `Required equation inputs still missing: ${
        missingVariableNames.join(
          ', ',
        )
      }.`,
    )
  }

  return {
    status,
    readinessPercent,
    targetKey:
      targetVariable?.key ??
      null,
    targetName:
      targetVariable?.name ??
      intent.targetName,
    targetProvided,
    providedVariableNames,
    missingVariableNames,
    assignments:
      contextualAssignments,
    diagnostics,
    enrichedText:
      enrichedSections.join(
        ' ',
      ),
  }
}
