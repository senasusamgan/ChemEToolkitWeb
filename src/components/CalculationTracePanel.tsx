import {
  useMemo,
  useState,
} from 'react'

import '../styles/calculation-trace-panel.css'

interface TraceAssignment {
  symbol: string
  canonicalName: string
  value: number
  unit: string
}

interface TraceQuickSolution {
  resultLabel: string
  resultValue: string
  numericValue: number
  unit: string
  equation: string
}

interface CalculationTracePanelProps {
  calculatorTitle: string
  equationLabel: string
  equation: string
  targetName:
    string | null
  readinessPercent: number
  assignments:
    TraceAssignment[]
  quickSolution:
    TraceQuickSolution | null
}

interface FormulaTarget {
  targetKeywords: string[]
  targetSymbol: string
  rearrangedFormula: string
  requiredSymbols: string[]
  explanation: string
}

interface FormulaProfile {
  modelKeywords: string[]
  governingEquation: string
  basisNote: string
  targets: FormulaTarget[]
}

interface TraceValue {
  symbol: string
  value: number
  unit: string
  name: string
  source:
    'input' | 'constant'
}

interface CalculationTrace {
  governingEquation: string
  rearrangedFormula: string
  numericExpression: string
  explanation: string
  basisNote: string
  values: TraceValue[]
  unresolvedSymbols: string[]
  isSpecialized: boolean
}

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
    'eta',
  ])

const SYMBOL_ALIASES:
  Record<
    string,
    string[]
  > = {
    P: [
      'P',
      'p',
    ],
    V: [
      'V',
    ],
    n: [
      'n',
    ],
    T: [
      'T',
      't',
    ],
    Re: [
      'Re',
      're',
    ],
    ρ: [
      'ρ',
      'rho',
    ],
    v: [
      'v',
    ],
    D: [
      'D',
      'd',
    ],
    μ: [
      'μ',
      'mu',
    ],
    Q: [
      'Q',
      'q',
    ],
    A: [
      'A',
      'a',
    ],
    ΔP: [
      'ΔP',
      '∆P',
      'dP',
      'dp',
    ],
    f: [
      'f',
    ],
    L: [
      'L',
      'l',
    ],
    W: [
      'W',
      'Ppump',
    ],
    H: [
      'H',
      'h',
    ],
    η: [
      'η',
      'eta',
    ],
    U: [
      'U',
      'u',
    ],
    ΔTlm: [
      'ΔTlm',
      'DTlm',
      'LMTD',
    ],
    J: [
      'J',
      'j',
    ],
    ΔC: [
      'ΔC',
      '∆C',
      'dC',
      'dc',
    ],
  }

const CONSTANT_VALUES:
  Record<
    string,
    TraceValue
  > = {
    R: {
      symbol:
        'R',
      value:
        8.314462618,
      unit:
        'J/(mol K)',
      name:
        'universal gas constant',
      source:
        'constant',
    },
    g: {
      symbol:
        'g',
      value:
        9.80665,
      unit:
        'm/s2',
      name:
        'standard gravitational acceleration',
      source:
        'constant',
    },
  }

const FORMULA_PROFILES:
  FormulaProfile[] = [
    {
      modelKeywords: [
        'ideal gas',
        'pv=nrt',
        'pv = nrt',
      ],
      governingEquation:
        'P·V = n·R·T',
      basisNote:
        'R = 8.314462618 J/(mol K). Absolute pressure and absolute temperature are required.',
      targets: [
        {
          targetKeywords: [
            'pressure',
          ],
          targetSymbol:
            'P',
          rearrangedFormula:
            'P=(n·R·T)/V',
          requiredSymbols: [
            'n',
            'R',
            'T',
            'V',
          ],
          explanation:
            'Divide the ideal-gas relation by volume.',
        },
        {
          targetKeywords: [
            'volume',
            'gas volume',
          ],
          targetSymbol:
            'V',
          rearrangedFormula:
            'V=(n·R·T)/P',
          requiredSymbols: [
            'n',
            'R',
            'T',
            'P',
          ],
          explanation:
            'Divide the ideal-gas relation by pressure.',
        },
        {
          targetKeywords: [
            'amount',
            'amount of gas',
            'moles',
          ],
          targetSymbol:
            'n',
          rearrangedFormula:
            'n=(P·V)/(R·T)',
          requiredSymbols: [
            'P',
            'V',
            'R',
            'T',
          ],
          explanation:
            'Divide pressure–volume by the gas constant and temperature.',
        },
        {
          targetKeywords: [
            'temperature',
            'absolute temperature',
          ],
          targetSymbol:
            'T',
          rearrangedFormula:
            'T=(P·V)/(n·R)',
          requiredSymbols: [
            'P',
            'V',
            'n',
            'R',
          ],
          explanation:
            'Divide pressure–volume by amount and the gas constant.',
        },
      ],
    },
    {
      modelKeywords: [
        'reynolds',
        're=ρvd/μ',
        're=rhovd/mu',
      ],
      governingEquation:
        'Re=(ρ·v·D)/μ',
      basisNote:
        'Fluid properties and velocity should describe the same operating temperature and flow condition.',
      targets: [
        {
          targetKeywords: [
            'reynolds',
          ],
          targetSymbol:
            'Re',
          rearrangedFormula:
            'Re=(ρ·v·D)/μ',
          requiredSymbols: [
            'ρ',
            'v',
            'D',
            'μ',
          ],
          explanation:
            'Multiply density, velocity and diameter, then divide by dynamic viscosity.',
        },
        {
          targetKeywords: [
            'density',
            'fluid density',
          ],
          targetSymbol:
            'ρ',
          rearrangedFormula:
            'ρ=(Re·μ)/(v·D)',
          requiredSymbols: [
            'Re',
            'μ',
            'v',
            'D',
          ],
          explanation:
            'Rearrange the Reynolds relation for fluid density.',
        },
        {
          targetKeywords: [
            'velocity',
          ],
          targetSymbol:
            'v',
          rearrangedFormula:
            'v=(Re·μ)/(ρ·D)',
          requiredSymbols: [
            'Re',
            'μ',
            'ρ',
            'D',
          ],
          explanation:
            'Rearrange the Reynolds relation for average velocity.',
        },
        {
          targetKeywords: [
            'diameter',
            'pipe diameter',
          ],
          targetSymbol:
            'D',
          rearrangedFormula:
            'D=(Re·μ)/(ρ·v)',
          requiredSymbols: [
            'Re',
            'μ',
            'ρ',
            'v',
          ],
          explanation:
            'Rearrange the Reynolds relation for characteristic diameter.',
        },
        {
          targetKeywords: [
            'viscosity',
            'dynamic viscosity',
          ],
          targetSymbol:
            'μ',
          rearrangedFormula:
            'μ=(ρ·v·D)/Re',
          requiredSymbols: [
            'ρ',
            'v',
            'D',
            'Re',
          ],
          explanation:
            'Rearrange the Reynolds relation for dynamic viscosity.',
        },
      ],
    },
    {
      modelKeywords: [
        'continuity',
        'q=av',
        'q = av',
        'flow velocity',
      ],
      governingEquation:
        'Q=A·v',
      basisNote:
        'The relation assumes average velocity across the selected flow area.',
      targets: [
        {
          targetKeywords: [
            'flow rate',
            'volumetric flow',
          ],
          targetSymbol:
            'Q',
          rearrangedFormula:
            'Q=A·v',
          requiredSymbols: [
            'A',
            'v',
          ],
          explanation:
            'Multiply cross-sectional area by average velocity.',
        },
        {
          targetKeywords: [
            'flow area',
            'area',
          ],
          targetSymbol:
            'A',
          rearrangedFormula:
            'A=Q/v',
          requiredSymbols: [
            'Q',
            'v',
          ],
          explanation:
            'Divide volumetric flow rate by average velocity.',
        },
        {
          targetKeywords: [
            'velocity',
            'average velocity',
          ],
          targetSymbol:
            'v',
          rearrangedFormula:
            'v=Q/A',
          requiredSymbols: [
            'Q',
            'A',
          ],
          explanation:
            'Divide volumetric flow rate by cross-sectional area.',
        },
      ],
    },
    {
      modelKeywords: [
        'darcy',
        'weisbach',
        'pressure difference',
      ],
      governingEquation:
        'ΔP=f·(L/D)·(ρ·v²/2)',
      basisNote:
        'The equation uses the Darcy friction factor and fully developed internal-flow assumptions.',
      targets: [
        {
          targetKeywords: [
            'pressure difference',
            'pressure drop',
          ],
          targetSymbol:
            'ΔP',
          rearrangedFormula:
            'ΔP=(f·L·ρ·v²)/(2·D)',
          requiredSymbols: [
            'f',
            'L',
            'ρ',
            'v',
            'D',
          ],
          explanation:
            'Evaluate the Darcy–Weisbach pressure-loss expression.',
        },
        {
          targetKeywords: [
            'friction factor',
          ],
          targetSymbol:
            'f',
          rearrangedFormula:
            'f=(2·ΔP·D)/(L·ρ·v²)',
          requiredSymbols: [
            'ΔP',
            'D',
            'L',
            'ρ',
            'v',
          ],
          explanation:
            'Isolate the Darcy friction factor.',
        },
        {
          targetKeywords: [
            'pipe length',
            'length',
          ],
          targetSymbol:
            'L',
          rearrangedFormula:
            'L=(2·ΔP·D)/(f·ρ·v²)',
          requiredSymbols: [
            'ΔP',
            'D',
            'f',
            'ρ',
            'v',
          ],
          explanation:
            'Isolate pipe length from the pressure-loss equation.',
        },
        {
          targetKeywords: [
            'diameter',
            'pipe diameter',
          ],
          targetSymbol:
            'D',
          rearrangedFormula:
            'D=(f·L·ρ·v²)/(2·ΔP)',
          requiredSymbols: [
            'f',
            'L',
            'ρ',
            'v',
            'ΔP',
          ],
          explanation:
            'Isolate internal diameter from the pressure-loss equation.',
        },
        {
          targetKeywords: [
            'density',
            'fluid density',
          ],
          targetSymbol:
            'ρ',
          rearrangedFormula:
            'ρ=(2·ΔP·D)/(f·L·v²)',
          requiredSymbols: [
            'ΔP',
            'D',
            'f',
            'L',
            'v',
          ],
          explanation:
            'Isolate fluid density from the pressure-loss equation.',
        },
        {
          targetKeywords: [
            'velocity',
          ],
          targetSymbol:
            'v',
          rearrangedFormula:
            'v=√((2·ΔP·D)/(f·L·ρ))',
          requiredSymbols: [
            'ΔP',
            'D',
            'f',
            'L',
            'ρ',
          ],
          explanation:
            'Isolate velocity and take the positive engineering root.',
        },
      ],
    },
    {
      modelKeywords: [
        'pump power',
        'pump',
        'ρgqh',
      ],
      governingEquation:
        'W=(ρ·g·Q·H)/η',
      basisNote:
        'g = 9.80665 m/s². Efficiency must be entered as a decimal fraction.',
      targets: [
        {
          targetKeywords: [
            'pump power',
            'power',
          ],
          targetSymbol:
            'W',
          rearrangedFormula:
            'W=(ρ·g·Q·H)/η',
          requiredSymbols: [
            'ρ',
            'g',
            'Q',
            'H',
            'η',
          ],
          explanation:
            'Calculate hydraulic power and divide by pump efficiency.',
        },
        {
          targetKeywords: [
            'density',
            'fluid density',
          ],
          targetSymbol:
            'ρ',
          rearrangedFormula:
            'ρ=(W·η)/(g·Q·H)',
          requiredSymbols: [
            'W',
            'η',
            'g',
            'Q',
            'H',
          ],
          explanation:
            'Rearrange the pump-power relation for density.',
        },
        {
          targetKeywords: [
            'flow rate',
            'volumetric flow',
          ],
          targetSymbol:
            'Q',
          rearrangedFormula:
            'Q=(W·η)/(ρ·g·H)',
          requiredSymbols: [
            'W',
            'η',
            'ρ',
            'g',
            'H',
          ],
          explanation:
            'Rearrange the pump-power relation for volumetric flow.',
        },
        {
          targetKeywords: [
            'head',
            'total head',
          ],
          targetSymbol:
            'H',
          rearrangedFormula:
            'H=(W·η)/(ρ·g·Q)',
          requiredSymbols: [
            'W',
            'η',
            'ρ',
            'g',
            'Q',
          ],
          explanation:
            'Rearrange the pump-power relation for total head.',
        },
        {
          targetKeywords: [
            'efficiency',
            'pump efficiency',
          ],
          targetSymbol:
            'η',
          rearrangedFormula:
            'η=(ρ·g·Q·H)/W',
          requiredSymbols: [
            'ρ',
            'g',
            'Q',
            'H',
            'W',
          ],
          explanation:
            'Rearrange the pump-power relation for efficiency.',
        },
      ],
    },
    {
      modelKeywords: [
        'heat exchanger',
        'heat-transfer rate',
        'heat transfer rate',
        'lmtd',
        'uat',
      ],
      governingEquation:
        'Q=U·A·ΔTlm',
      basisNote:
        'U, area and the log-mean temperature difference must use a consistent heat-transfer basis.',
      targets: [
        {
          targetKeywords: [
            'heat-transfer rate',
            'heat transfer rate',
            'heat duty',
          ],
          targetSymbol:
            'Q',
          rearrangedFormula:
            'Q=U·A·ΔTlm',
          requiredSymbols: [
            'U',
            'A',
            'ΔTlm',
          ],
          explanation:
            'Multiply overall conductance, area and temperature driving force.',
        },
        {
          targetKeywords: [
            'overall heat-transfer coefficient',
            'overall heat transfer coefficient',
          ],
          targetSymbol:
            'U',
          rearrangedFormula:
            'U=Q/(A·ΔTlm)',
          requiredSymbols: [
            'Q',
            'A',
            'ΔTlm',
          ],
          explanation:
            'Divide heat-transfer rate by area and temperature driving force.',
        },
        {
          targetKeywords: [
            'heat-transfer area',
            'heat transfer area',
            'area',
          ],
          targetSymbol:
            'A',
          rearrangedFormula:
            'A=Q/(U·ΔTlm)',
          requiredSymbols: [
            'Q',
            'U',
            'ΔTlm',
          ],
          explanation:
            'Divide heat-transfer rate by overall coefficient and temperature driving force.',
        },
        {
          targetKeywords: [
            'log-mean temperature difference',
            'log mean temperature difference',
          ],
          targetSymbol:
            'ΔTlm',
          rearrangedFormula:
            'ΔTlm=Q/(U·A)',
          requiredSymbols: [
            'Q',
            'U',
            'A',
          ],
          explanation:
            'Divide heat-transfer rate by overall conductance and area.',
        },
      ],
    },
    {
      modelKeywords: [
        'fick',
        'diffusion',
        'molar flux',
      ],
      governingEquation:
        'J=−D·ΔC/L',
      basisNote:
        'The negative sign indicates transport toward decreasing concentration.',
      targets: [
        {
          targetKeywords: [
            'molar flux',
            'flux',
          ],
          targetSymbol:
            'J',
          rearrangedFormula:
            'J=−(D·ΔC)/L',
          requiredSymbols: [
            'D',
            'ΔC',
            'L',
          ],
          explanation:
            'Apply Fick’s first law across the diffusion length.',
        },
        {
          targetKeywords: [
            'diffusivity',
          ],
          targetSymbol:
            'D',
          rearrangedFormula:
            'D=−(J·L)/ΔC',
          requiredSymbols: [
            'J',
            'L',
            'ΔC',
          ],
          explanation:
            'Rearrange Fick’s first law for diffusivity.',
        },
        {
          targetKeywords: [
            'concentration difference',
          ],
          targetSymbol:
            'ΔC',
          rearrangedFormula:
            'ΔC=−(J·L)/D',
          requiredSymbols: [
            'J',
            'L',
            'D',
          ],
          explanation:
            'Rearrange Fick’s first law for concentration difference.',
        },
        {
          targetKeywords: [
            'diffusion length',
            'length',
          ],
          targetSymbol:
            'L',
          rearrangedFormula:
            'L=−(D·ΔC)/J',
          requiredSymbols: [
            'D',
            'ΔC',
            'J',
          ],
          explanation:
            'Rearrange Fick’s first law for diffusion path length.',
        },
      ],
    },
  ]

function normalizeText(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase(
      'en-US',
    )
    .replace(
      /[–—−]/g,
      '-',
    )
    .replace(
      /\s+/g,
      ' ',
    )
}

function normalizeSymbol(
  value: string,
): string {
  return value
    .trim()
    .replace(
      /\s+/g,
      '',
    )
    .toLocaleLowerCase(
      'en-US',
    )
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
        1e6 ||
      absoluteValue <
        1e-4
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
    undefined,
    {
      maximumFractionDigits:
        10,
    },
  )
}

function formatTraceValue(
  traceValue:
    TraceValue,
): string {
  return [
    formatEngineeringNumber(
      traceValue.value,
    ),
    traceValue.unit,
  ]
    .filter(
      Boolean,
    )
    .join(
      ' ',
    )
}

function findAssignment(
  symbol: string,
  assignments:
    TraceAssignment[],
): TraceAssignment | null {
  const aliases =
    SYMBOL_ALIASES[
      symbol
    ] ?? [
      symbol,
    ]

  const normalizedAliases =
    aliases.map(
      normalizeSymbol,
    )

  return assignments.find(
    (assignment) =>
      normalizedAliases.includes(
        normalizeSymbol(
          assignment.symbol,
        ),
      ),
  ) ??
    null
}

function findFormulaTarget(
  calculatorTitle: string,
  equationLabel: string,
  equation: string,
  targetName:
    string | null,
  resultLabel: string,
): {
  profile:
    FormulaProfile
  target:
    FormulaTarget
} | null {
  const modelText =
    normalizeText(
      [
        calculatorTitle,
        equationLabel,
        equation,
      ].join(
        ' ',
      ),
    )

  const targetText =
    normalizeText(
      [
        targetName ?? '',
        resultLabel,
      ].join(
        ' ',
      ),
    )

  const profile =
    FORMULA_PROFILES.find(
      (candidate) =>
        candidate
          .modelKeywords
          .some(
            (keyword) =>
              modelText.includes(
                normalizeText(
                  keyword,
                ),
              ),
          ),
    )

  if (!profile) {
    return null
  }

  const target =
    profile.targets.find(
      (candidate) =>
        candidate
          .targetKeywords
          .some(
            (keyword) =>
              targetText.includes(
                normalizeText(
                  keyword,
                ),
              ),
          ),
    )

  if (!target) {
    return null
  }

  return {
    profile,
    target,
  }
}

function replaceFormulaSymbols(
  formula: string,
  values:
    TraceValue[],
): string {
  let expression =
    formula

  const sortedValues =
    [
      ...values,
    ].sort(
      (
        first,
        second,
      ) =>
        second
          .symbol
          .length -
        first
          .symbol
          .length,
    )

  for (
    const traceValue
    of sortedValues
  ) {
    expression =
      expression.replaceAll(
        traceValue.symbol,
        `(${formatEngineeringNumber(traceValue.value)})`,
      )
  }

  return expression
}

function createCalculationTrace(
  calculatorTitle: string,
  equationLabel: string,
  equation: string,
  targetName:
    string | null,
  assignments:
    TraceAssignment[],
  quickSolution:
    TraceQuickSolution,
): CalculationTrace {
  const formulaMatch =
    findFormulaTarget(
      calculatorTitle,
      equationLabel,
      equation,
      targetName,
      quickSolution
        .resultLabel,
    )

  if (!formulaMatch) {
    const values =
      assignments.map(
        (
          assignment,
        ): TraceValue => ({
          symbol:
            assignment.symbol,
          value:
            assignment.value,
          unit:
            assignment.unit,
          name:
            assignment
              .canonicalName,
          source:
            'input',
        }),
      )

    return {
      governingEquation:
        equation ||
        quickSolution
          .equation,
      rearrangedFormula:
        quickSolution
          .equation,
      numericExpression:
        'The selected Quick Solve model evaluated the parsed engineering inputs directly.',
      explanation:
        'A specialized symbolic rearrangement is not yet registered for this calculator.',
      basisNote:
        'Review the matched calculator documentation for equation-specific assumptions.',
      values,
      unresolvedSymbols:
        [],
      isSpecialized:
        false,
    }
  }

  const {
    profile,
    target,
  } = formulaMatch

  const values:
    TraceValue[] = []

  const unresolvedSymbols:
    string[] = []

  for (
    const symbol
    of target
      .requiredSymbols
  ) {
    const constant =
      CONSTANT_VALUES[
        symbol
      ]

    if (constant) {
      values.push(
        constant,
      )
      continue
    }

    const assignment =
      findAssignment(
        symbol,
        assignments,
      )

    if (!assignment) {
      unresolvedSymbols.push(
        symbol,
      )
      continue
    }

    values.push({
      symbol,
      value:
        assignment.value,
      unit:
        assignment.unit,
      name:
        assignment
          .canonicalName,
      source:
        'input',
    })
  }

  return {
    governingEquation:
      profile
        .governingEquation,
    rearrangedFormula:
      target
        .rearrangedFormula,
    numericExpression:
      unresolvedSymbols
        .length ===
      0
        ? replaceFormulaSymbols(
            target
              .rearrangedFormula,
            values,
          )
        : 'Complete every required symbol before generating the numerical substitution.',
    explanation:
      target.explanation,
    basisNote:
      profile.basisNote,
    values,
    unresolvedSymbols,
    isSpecialized:
      true,
  }
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

export function CalculationTracePanel({
  calculatorTitle,
  equationLabel,
  equation,
  targetName,
  readinessPercent,
  assignments,
  quickSolution,
}: CalculationTracePanelProps) {
  const [
    isExpanded,
    setIsExpanded,
  ] = useState(false)

  const [
    feedbackMessage,
    setFeedbackMessage,
  ] = useState('')

  const trace =
    useMemo(
      () =>
        quickSolution
          ? createCalculationTrace(
              calculatorTitle,
              equationLabel,
              equation,
              targetName,
              assignments,
              quickSolution,
            )
          : null,
      [
        assignments,
        calculatorTitle,
        equation,
        equationLabel,
        quickSolution,
        targetName,
      ],
    )

  if (
    !quickSolution ||
    !trace
  ) {
    return null
  }

  const resolvedTrace =
    trace

  const resolvedQuickSolution =
    quickSolution

  const missingUnitAssignments =
    assignments.filter(
      (assignment) =>
        assignment.unit
          .trim()
          .length ===
          0 &&
        !DIMENSIONLESS_SYMBOLS.has(
          assignment.symbol,
        ),
    )

  const dimensionedCount =
    assignments.filter(
      (assignment) =>
        assignment.unit
          .trim()
          .length >
        0,
    ).length

  const dimensionlessCount =
    assignments.length -
    dimensionedCount -
    missingUnitAssignments.length

  const unitCoverage =
    assignments.length ===
    0
      ? 0
      : Math.round(
          (
            assignments.length -
            missingUnitAssignments.length
          ) /
            assignments.length *
            100,
        )

  const resultIsFinite =
    Number.isFinite(
      quickSolution
        .numericValue,
    )

  async function copyCalculationTrace() {
    const traceText = [
      'ChemE Toolkit Step-by-Step Calculation Trace',
      '',
      `Calculator: ${calculatorTitle}`,
      `Model: ${equationLabel}`,
      `Requested target: ${targetName ?? resolvedQuickSolution.resultLabel}`,
      `Readiness: ${readinessPercent}%`,
      '',
      '1. GOVERNING EQUATION',
      resolvedTrace.governingEquation,
      '',
      '2. REARRANGED EQUATION',
      resolvedTrace.rearrangedFormula,
      resolvedTrace.explanation,
      '',
      '3. INPUT VALUES',
      ...resolvedTrace.values.map(
        (value) =>
          `- ${value.symbol} = ${formatTraceValue(value)} (${value.name}; ${value.source})`,
      ),
      ...(
        resolvedTrace
          .unresolvedSymbols
          .length >
        0
          ? [
              `- Unresolved symbols: ${resolvedTrace.unresolvedSymbols.join(', ')}`,
            ]
          : []
      ),
      '',
      '4. NUMERICAL SUBSTITUTION',
      resolvedTrace.numericExpression,
      '',
      '5. RESULT',
      `${resolvedQuickSolution.resultLabel} = ${resolvedQuickSolution.resultValue}`,
      `Numeric value: ${formatEngineeringNumber(resolvedQuickSolution.numericValue)}${resolvedQuickSolution.unit ? ` ${resolvedQuickSolution.unit}` : ''}`,
      '',
      '6. UNIT REVIEW',
      `Unit coverage: ${unitCoverage}%`,
      `Dimensioned inputs: ${dimensionedCount}`,
      `Dimensionless inputs: ${dimensionlessCount}`,
      `Inputs requiring unit review: ${missingUnitAssignments.length}`,
      '',
      'ENGINEERING BASIS',
      resolvedTrace.basisNote,
      '',
      'Verify model assumptions and operating ranges before design use.',
    ].join(
      '\n',
    )

    try {
      await copyText(
        traceText,
      )

      setFeedbackMessage(
        'Step-by-step calculation trace copied.',
      )
    } catch {
      setFeedbackMessage(
        'Calculation trace could not be copied.',
      )
    }
  }

  return (
    <section
      className="calculation-trace-panel"
      data-expanded={
        isExpanded
          ? 'true'
          : 'false'
      }
      aria-labelledby="calculation-trace-title"
    >
      <header className="calculation-trace-launcher">
        <div>
          <span>
            Transparent numerical solution
          </span>

          <h4 id="calculation-trace-title">
            Step-by-step calculation trace
          </h4>

          <p>
            {
              trace.isSpecialized
                ? 'Equation rearrangement, value substitution and unit review are available.'
                : 'The Quick Solve calculation inputs and result are available for review.'
            }
          </p>
        </div>

        <div className="calculation-trace-launcher-result">
          <div>
            <span>
              Calculated result
            </span>

            <strong>
              {
                quickSolution
                  .resultLabel
              }
              {' = '}
              {
                quickSolution
                  .resultValue
              }
            </strong>
          </div>

          <button
            type="button"
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
                ? 'Hide calculation'
                : 'Show calculation'
            }
          </button>
        </div>
      </header>

      {isExpanded ? (
        <div className="calculation-trace-content">
          <div className="calculation-trace-summary">
            <article>
              <span>
                Target variable
              </span>

              <strong>
                {
                  targetName ??
                  quickSolution
                    .resultLabel
                }
              </strong>
            </article>

            <article>
              <span>
                Parsed inputs
              </span>

              <strong>
                {
                  assignments.length
                }
              </strong>
            </article>

            <article>
              <span>
                Unit coverage
              </span>

              <strong>
                {unitCoverage}%
              </strong>
            </article>

            <article>
              <span>
                Solver readiness
              </span>

              <strong>
                {readinessPercent}%
              </strong>
            </article>
          </div>

          <ol className="calculation-trace-steps">
            <li>
              <div className="calculation-trace-step-number">
                1
              </div>

              <div>
                <span>
                  Governing equation
                </span>

                <strong>
                  {
                    trace
                      .governingEquation
                  }
                </strong>

                <p>
                  {
                    trace
                      .basisNote
                  }
                </p>
              </div>
            </li>

            <li>
              <div className="calculation-trace-step-number">
                2
              </div>

              <div>
                <span>
                  Rearrange for the requested unknown
                </span>

                <strong>
                  {
                    trace
                      .rearrangedFormula
                  }
                </strong>

                <p>
                  {
                    trace
                      .explanation
                  }
                </p>
              </div>
            </li>

            <li>
              <div className="calculation-trace-step-number">
                3
              </div>

              <div>
                <span>
                  Numerical substitution
                </span>

                <code>
                  {
                    trace
                      .numericExpression
                  }
                </code>

                {trace
                  .unresolvedSymbols
                  .length > 0 ? (
                  <p className="calculation-trace-warning">
                    Missing substitution symbols:
                    {' '}
                    {
                      trace
                        .unresolvedSymbols
                        .join(
                          ', ',
                        )
                    }
                  </p>
                ) : null}
              </div>
            </li>

            <li>
              <div className="calculation-trace-step-number">
                4
              </div>

              <div>
                <span>
                  Computed result
                </span>

                <strong className="calculation-trace-final-result">
                  {
                    quickSolution
                      .resultLabel
                  }
                  {' = '}
                  {
                    quickSolution
                      .resultValue
                  }
                </strong>

                <p>
                  Scientific value:
                  {' '}
                  {
                    resultIsFinite
                      ? quickSolution
                          .numericValue
                          .toExponential(
                            6,
                          )
                      : 'Not finite'
                  }
                  {
                    quickSolution
                      .unit
                      ? ` ${quickSolution.unit}`
                      : ''
                  }
                </p>
              </div>
            </li>
          </ol>

          <div className="calculation-trace-input-table-wrap">
            <table className="calculation-trace-input-table">
              <thead>
                <tr>
                  <th>
                    Symbol
                  </th>

                  <th>
                    Engineering quantity
                  </th>

                  <th>
                    Value
                  </th>

                  <th>
                    Unit
                  </th>

                  <th>
                    Source
                  </th>
                </tr>
              </thead>

              <tbody>
                {trace.values.map(
                  (
                    value,
                    index,
                  ) => (
                    <tr
                      key={
                        value.symbol +
                        value.source +
                        index
                      }
                    >
                      <td>
                        <code>
                          {value.symbol}
                        </code>
                      </td>

                      <td>
                        {value.name}
                      </td>

                      <td>
                        {
                          formatEngineeringNumber(
                            value.value,
                          )
                        }
                      </td>

                      <td>
                        {
                          value.unit ||
                          'dimensionless'
                        }
                      </td>

                      <td>
                        {
                          value.source ===
                          'constant'
                            ? 'Equation constant'
                            : 'Parsed problem input'
                        }
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div className="calculation-trace-unit-audit">
            <article>
              <span>
                Dimensioned inputs
              </span>

              <strong>
                {dimensionedCount}
              </strong>
            </article>

            <article>
              <span>
                Dimensionless inputs
              </span>

              <strong>
                {dimensionlessCount}
              </strong>
            </article>

            <article
              data-state={
                missingUnitAssignments
                  .length ===
                0
                  ? 'pass'
                  : 'review'
              }
            >
              <span>
                Unit review
              </span>

              <strong>
                {
                  missingUnitAssignments
                    .length ===
                  0
                    ? 'No missing units'
                    : `${missingUnitAssignments.length} input(s)`
                }
              </strong>
            </article>

            <article
              data-state={
                resultIsFinite
                  ? 'pass'
                  : 'review'
              }
            >
              <span>
                Numerical result
              </span>

              <strong>
                {
                  resultIsFinite
                    ? 'Finite'
                    : 'Review required'
                }
              </strong>
            </article>
          </div>

          {feedbackMessage ? (
            <p
              className="calculation-trace-feedback"
              role="status"
            >
              {feedbackMessage}
            </p>
          ) : null}

          <footer className="calculation-trace-footer">
            <div>
              <strong>
                Calculation transparency
              </strong>

              <span>
                Verify correlation limits and physical assumptions before final engineering use.
              </span>
            </div>

            <button
              type="button"
              onClick={
                copyCalculationTrace
              }
            >
              Copy calculation trace
            </button>
          </footer>
        </div>
      ) : null}
    </section>
  )
}
