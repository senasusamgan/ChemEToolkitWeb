import {
  solveProblemQuickly,
} from './problemQuickSolveEngine.ts'

import type {
  ProblemQuickSolution,
} from './problemQuickSolveEngine.ts'

export interface ProblemCompositeSolution
  extends ProblemQuickSolution {
  solutionMode: 'composite'
  chain: string[]
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
      /\s+/g,
      ' ',
    )
    .trim()
}

function includesAny(
  query: string,
  signals: string[],
): boolean {
  return signals.some(
    (signal) =>
      query.includes(
        normalizeText(
          signal,
        ),
      ),
  )
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
      .toExponential(
        4,
      )
      .replace(
        /\.?0+e/,
        'e',
      )
  }

  return Number(
    value.toPrecision(
      6,
    ),
  ).toString()
}

function extractStepValue(
  solution:
    ProblemQuickSolution,
  stepLabel: string,
): number | null {
  const normalizedLabel =
    normalizeText(
      stepLabel,
    )

  const step =
    solution.steps.find(
      (candidate) =>
        normalizeText(
          candidate,
        ).startsWith(
          normalizedLabel,
        ),
    )

  if (!step) {
    return null
  }

  const match =
    new RegExp(
      `=\\s*(${NUMBER_SOURCE})`,
      'i',
    ).exec(
      step,
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

function solvePipePumpChain(
  calculatorId: string,
  query: string,
): ProblemCompositeSolution | undefined {
  if (
    calculatorId !==
    'pumpPower'
  ) {
    return undefined
  }

  const cleanQuery =
    normalizeText(
      query,
    )

  const requestsPumpPower =
    includesAny(
      cleanQuery,
      [
        'pump power',
        'required pump power',
        'pump sizing',
        'pompa gucu',
        'pompa gucunu',
      ],
    )

  const includesPipeLoss =
    includesAny(
      cleanQuery,
      [
        'pressure drop',
        'pipe pressure loss',
        'darcy weisbach',
        'basinc dusumu',
        'boru basinc kaybi',
      ],
    )

  if (
    !requestsPumpPower ||
    !includesPipeLoss
  ) {
    return undefined
  }

  const pressureDrop =
    solveProblemQuickly(
      'pressureDrop',
      query,
    )

  if (!pressureDrop) {
    return undefined
  }

  const headLoss =
    extractStepValue(
      pressureDrop,
      'Head loss',
    )

  if (
    headLoss === null ||
    headLoss < 0
  ) {
    return undefined
  }

  const pumpPower =
    solveProblemQuickly(
      'pumpPower',
      [
        query,
        `pump head ${headLoss} m`,
      ].join(
        ' ',
      ),
    )

  if (!pumpPower) {
    return undefined
  }

  return {
    solutionMode:
      'composite',
    chain: [
      'pressureDrop',
      'pumpPower',
    ],
    resultLabel:
      'Composite pipe-flow pump requirement',
    resultValue:
      pumpPower.resultValue,
    numericValue:
      pumpPower.numericValue,
    unit:
      pumpPower.unit,
    equation:
      'ΔP = f(L/D)(ρv²/2) → H = ΔP/(ρg) → P = ρgQH/η',
    steps: [
      `1. Pipe pressure drop = ${pressureDrop.resultValue}`,
      `2. Equivalent head loss = ${formatNumber(
        headLoss,
      )} m`,
      `3. Required pump power = ${pumpPower.resultValue}`,
    ],
    assumptions:
      uniqueValues([
        ...pressureDrop.assumptions,
        ...pumpPower.assumptions,
        'The pump supplies exactly the calculated pipe-friction head.',
      ]),
  }
}

function solveHeatExchangerChain(
  calculatorId: string,
  query: string,
): ProblemCompositeSolution | undefined {
  if (
    calculatorId !==
    'heatExchangerAreaSizing'
  ) {
    return undefined
  }

  const cleanQuery =
    normalizeText(
      query,
    )

  const requestsArea =
    includesAny(
      cleanQuery,
      [
        'heat exchanger area',
        'required exchanger area',
        'size the heat exchanger',
        'exchanger sizing',
        'isi degistirici alani',
      ],
    )

  if (!requestsArea) {
    return undefined
  }

  const lmtd =
    solveProblemQuickly(
      'heatExchangerLMTD',
      query,
    )

  if (!lmtd) {
    return undefined
  }

  const area =
    solveProblemQuickly(
      'heatExchangerAreaSizing',
      [
        query,
        `log mean temperature difference ${lmtd.numericValue} K`,
      ].join(
        ' ',
      ),
    )

  if (!area) {
    return undefined
  }

  return {
    solutionMode:
      'composite',
    chain: [
      'heatExchangerLMTD',
      'heatExchangerAreaSizing',
    ],
    resultLabel:
      'Composite heat-exchanger sizing',
    resultValue:
      area.resultValue,
    numericValue:
      area.numericValue,
    unit:
      area.unit,
    equation:
      'ΔTlm = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂) → A = Q/(UFΔTlm)',
    steps: [
      `1. Log mean temperature difference = ${lmtd.resultValue}`,
      `2. Corrected thermal driving force is applied.`,
      `3. Required heat-exchanger area = ${area.resultValue}`,
    ],
    assumptions:
      uniqueValues([
        ...lmtd.assumptions,
        ...area.assumptions,
      ]),
  }
}

function solveMassTransferChain(
  calculatorId: string,
  query: string,
): ProblemCompositeSolution | undefined {
  if (
    calculatorId !==
    'massTransferCoefficient'
  ) {
    return undefined
  }

  const cleanQuery =
    normalizeText(
      query,
    )

  const requestsCoefficient =
    includesAny(
      cleanQuery,
      [
        'mass transfer coefficient',
        'calculate mass transfer coefficient',
        'kutle transfer katsayisi',
      ],
    )

  const includesDiffusionData =
    includesAny(
      cleanQuery,
      [
        'diffusivity',
        'diffusion coefficient',
        'difuzyon katsayisi',
      ],
    )

  if (
    !requestsCoefficient ||
    !includesDiffusionData
  ) {
    return undefined
  }

  const flux =
    solveProblemQuickly(
      'ficksFirstLaw',
      query,
    )

  if (!flux) {
    return undefined
  }

  const coefficient =
    solveProblemQuickly(
      'massTransferCoefficient',
      [
        query,
        `molar flux ${flux.numericValue} mol/m2 s`,
      ].join(
        ' ',
      ),
    )

  if (!coefficient) {
    return undefined
  }

  return {
    solutionMode:
      'composite',
    chain: [
      'ficksFirstLaw',
      'massTransferCoefficient',
    ],
    resultLabel:
      'Composite diffusion-film coefficient',
    resultValue:
      coefficient.resultValue,
    numericValue:
      coefficient.numericValue,
    unit:
      coefficient.unit,
    equation:
      '|Jₐ| = Dₐᵦ|ΔCₐ|/L → kc = |Jₐ|/|ΔCₐ|',
    steps: [
      `1. Diffusive molar flux = ${flux.resultValue}`,
      `2. Concentration driving force is retained from the problem.`,
      `3. Mass-transfer coefficient = ${coefficient.resultValue}`,
    ],
    assumptions:
      uniqueValues([
        ...flux.assumptions,
        ...coefficient.assumptions,
      ]),
  }
}

function solveNaturalConvectionChain(
  calculatorId: string,
  query: string,
): ProblemCompositeSolution | undefined {
  if (
    calculatorId !==
    'rayleighNumber'
  ) {
    return undefined
  }

  const cleanQuery =
    normalizeText(
      query,
    )

  const requestsRayleigh =
    includesAny(
      cleanQuery,
      [
        'rayleigh number',
        'natural convection rayleigh',
        'rayleigh sayisi',
      ],
    )

  const includesPrandtl =
    includesAny(
      cleanQuery,
      [
        'prandtl number',
        'prandtl',
      ],
    )

  if (
    !requestsRayleigh ||
    !includesPrandtl
  ) {
    return undefined
  }

  const grashof =
    solveProblemQuickly(
      'grashofNumber',
      query,
    )

  if (!grashof) {
    return undefined
  }

  const rayleigh =
    solveProblemQuickly(
      'rayleighNumber',
      [
        query,
        `grashof number ${grashof.numericValue}`,
      ].join(
        ' ',
      ),
    )

  if (!rayleigh) {
    return undefined
  }

  return {
    solutionMode:
      'composite',
    chain: [
      'grashofNumber',
      'rayleighNumber',
    ],
    resultLabel:
      'Composite natural-convection result',
    resultValue:
      rayleigh.resultValue,
    numericValue:
      rayleigh.numericValue,
    unit:
      rayleigh.unit,
    equation:
      'Gr = gβΔTL³/ν² → Ra = GrPr',
    steps: [
      `1. Grashof number = ${grashof.resultValue}`,
      `2. Prandtl number is read from the problem.`,
      `3. Rayleigh number = ${rayleigh.resultValue}`,
    ],
    assumptions:
      uniqueValues([
        ...grashof.assumptions,
        ...rayleigh.assumptions,
      ]),
  }
}

export function solveCompositeProblem(
  calculatorId: string,
  query: string,
): ProblemCompositeSolution | undefined {
  return (
    solvePipePumpChain(
      calculatorId,
      query,
    ) ??
    solveHeatExchangerChain(
      calculatorId,
      query,
    ) ??
    solveMassTransferChain(
      calculatorId,
      query,
    ) ??
    solveNaturalConvectionChain(
      calculatorId,
      query,
    )
  )
}
