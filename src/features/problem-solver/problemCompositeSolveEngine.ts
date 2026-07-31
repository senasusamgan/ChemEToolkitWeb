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

const COMPOSITE_STANDARD_GRAVITY =
  9.80665

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

function escapeCompositeRegExp(
  value: string,
): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  )
}

function createCompositeAlternatives(
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
      escapeCompositeRegExp,
    )
    .join(
      '|',
    )
}

function readCompositeFraction(
  query: string,
  aliases: string[],
): number | null {
  const cleanQuery =
    normalizeText(
      query,
    )

  const aliasPattern =
    createCompositeAlternatives(
      aliases,
    )

  if (!aliasPattern) {
    return null
  }

  const pattern =
    new RegExp(
      `(?:^|\\b)(?:${aliasPattern})(?=\\b|\\s|:|=)\\s*(?:=|:|is)?\\s*(${NUMBER_SOURCE})\\s*(%|percent)?`,
      'i',
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

function readCompositeReactionRate(
  query: string,
): number | null {
  const cleanQuery =
    normalizeText(
      query,
    )

  const aliasPattern =
    createCompositeAlternatives([
      'exit reaction rate',
      'reaction rate at exit',
      'volumetric reaction rate',
      'reaction rate',
      'cikis reaksiyon hizi',
      'reaksiyon hizi',
    ])

  const unitPattern =
    createCompositeAlternatives([
      'kmol/m3 s',
      'kmol/m3s',
      'mol/m3 s',
      'mol/m3s',
    ])

  const pattern =
    new RegExp(
      `(?:^|\\b)(?:${aliasPattern})(?=\\b|\\s|:|=)\\s*(?:=|:|is)?\\s*(${NUMBER_SOURCE})\\s*(${unitPattern})(?=\\s|$|[.;,)])`,
      'i',
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
    ) ||
    value <= 0
  ) {
    return null
  }

  const unit =
    normalizeText(
      match[2],
    )

  if (
    unit ===
      'kmol/m3 s' ||
    unit ===
      'kmol/m3s'
  ) {
    value *= 1000
  }

  return value
}

function readCompositePressure(
  query: string,
): number | null {
  const cleanQuery =
    normalizeText(
      query,
    )

  const aliasPattern =
    createCompositeAlternatives([
      'differential pressure',
      'pressure difference',
      'pressure drop',
      'basinc farki',
    ])

  const unitPattern =
    createCompositeAlternatives([
      'mpa',
      'kpa',
      'bar',
      'pa',
    ])

  const pattern =
    new RegExp(
      `(?:^|\\b)(?:${aliasPattern})(?=\\b|\\s|:|=)\\s*(?:=|:|is)?\\s*(${NUMBER_SOURCE})\\s*(${unitPattern})(?=\\s|$|[.;,)])`,
      'i',
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

  const unit =
    normalizeText(
      match[2],
    )

  if (
    unit ===
    'mpa'
  ) {
    value *=
      1_000_000
  } else if (
    unit ===
    'kpa'
  ) {
    value *=
      1000
  } else if (
    unit ===
    'bar'
  ) {
    value *=
      100_000
  }

  return value
}

function readCompositeDensity(
  query: string,
): number | null {
  const cleanQuery =
    normalizeText(
      query,
    )

  const aliasPattern =
    createCompositeAlternatives([
      'fluid density',
      'liquid density',
      'density',
      'yogunluk',
    ])

  const unitPattern =
    createCompositeAlternatives([
      'kg/m3',
      'g/cm3',
    ])

  const pattern =
    new RegExp(
      `(?:^|\\b)(?:${aliasPattern})(?=\\b|\\s|:|=)\\s*(?:=|:|is)?\\s*(${NUMBER_SOURCE})\\s*(${unitPattern})(?=\\s|$|[.;,)])`,
      'i',
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
    normalizeText(
      match[2],
    ) ===
    'g/cm3'
  ) {
    value *=
      1000
  }

  return value
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

function solveTotalPumpPowerChain(
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
      ],
    )

  const includesMajorLoss =
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

  const includesMinorLoss =
    includesAny(
      cleanQuery,
      [
        'minor loss',
        'minor losses',
        'loss coefficient',
        'total loss coefficient',
        'fittings',
        'valves',
        'minor kayip',
        'yerel kayip',
      ],
    )

  if (
    !requestsPumpPower ||
    !includesMajorLoss ||
    !includesMinorLoss
  ) {
    return undefined
  }

  const majorLoss =
    solveProblemQuickly(
      'pressureDrop',
      query,
    )

  const minorLoss =
    solveProblemQuickly(
      'minorLosses',
      query,
    )

  if (
    !majorLoss ||
    !minorLoss
  ) {
    return undefined
  }

  const majorHead =
    extractStepValue(
      majorLoss,
      'Head loss',
    )

  const minorHead =
    extractStepValue(
      minorLoss,
      'Head loss',
    )

  if (
    majorHead === null ||
    minorHead === null ||
    majorHead < 0 ||
    minorHead < 0
  ) {
    return undefined
  }

  const totalHead =
    majorHead +
    minorHead

  const pumpPower =
    solveProblemQuickly(
      'pumpPower',
      [
        `pump head ${totalHead} m`,
        query,
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
      'minorLosses',
      'pumpPower',
    ],
    resultLabel:
      'Total-loss pump requirement',
    resultValue:
      pumpPower.resultValue,
    numericValue:
      pumpPower.numericValue,
    unit:
      pumpPower.unit,
    equation:
      'Htotal = Hmajor + Hminor → P = ρgQHtotal/η',
    steps: [
      `1. Major pipe loss = ${majorLoss.resultValue}`,
      `2. Minor-loss pressure drop = ${minorLoss.resultValue}`,
      `3. Total required pump head = ${formatNumber(
        totalHead,
      )} m`,
      `4. Required pump power = ${pumpPower.resultValue}`,
    ],
    assumptions:
      uniqueValues([
        ...majorLoss.assumptions,
        ...minorLoss.assumptions,
        ...pumpPower.assumptions,
        'Static elevation and equipment pressure requirements are not included.',
      ]),
  }
}

function solveMassFlowCstrChain(
  calculatorId: string,
  query: string,
): ProblemCompositeSolution | undefined {
  if (
    calculatorId !==
    'cstrVolume'
  ) {
    return undefined
  }

  const cleanQuery =
    normalizeText(
      query,
    )

  const requestsReactorVolume =
    includesAny(
      cleanQuery,
      [
        'cstr volume',
        'reactor volume',
        'required cstr volume',
        'reaktor hacmi',
      ],
    )

  const includesMassFlow =
    includesAny(
      cleanQuery,
      [
        'mass flow',
        'mass flow rate',
        'mass feed rate',
        'kutlesel debi',
      ],
    )

  const includesMolecularWeight =
    includesAny(
      cleanQuery,
      [
        'molecular weight',
        'molar mass',
        'molekuler agirlik',
        'mol kutlesi',
      ],
    )

  if (
    !requestsReactorVolume ||
    !includesMassFlow ||
    !includesMolecularWeight
  ) {
    return undefined
  }

  const molarFlow =
    solveProblemQuickly(
      'massFlowMolarFlowConversion',
      query,
    )

  if (!molarFlow) {
    return undefined
  }

  const conversion =
    readCompositeFraction(
      query,
      [
        'target conversion',
        'conversion',
        'hedef donusum',
        'donusum',
      ],
    )

  const exitReactionRate =
    readCompositeReactionRate(
      query,
    )

  if (
    conversion === null ||
    exitReactionRate === null
  ) {
    return undefined
  }

  const reactedMolarFlow =
    molarFlow.numericValue *
    conversion

  const reactorVolume =
    reactedMolarFlow /
    exitReactionRate

  if (
    !Number.isFinite(
      reactorVolume,
    ) ||
    reactorVolume < 0
  ) {
    return undefined
  }

  return {
    solutionMode:
      'composite',
    chain: [
      'massFlowMolarFlowConversion',
      'cstrVolume',
    ],
    resultLabel:
      'Mass-feed CSTR sizing',
    resultValue:
      `${formatNumber(
        reactorVolume,
      )} m3`,
    numericValue:
      reactorVolume,
    unit:
      'm3',
    equation:
      'Fₐ₀ = ṁ/MW → V = Fₐ₀X/(−rₐ)exit',
    steps: [
      `1. Feed molar flow = ${molarFlow.resultValue}`,
      `2. Reacted molar flow = ${formatNumber(
        reactedMolarFlow,
      )} mol/s`,
      `3. Exit reaction rate = ${formatNumber(
        exitReactionRate,
      )} mol/(m3 s)`,
      `4. Required CSTR volume = ${formatNumber(
        reactorVolume,
      )} m3`,
    ],
    assumptions:
      uniqueValues([
        ...molarFlow.assumptions,
        'Steady-state operation',
        'Perfect mixing',
        'The reaction rate is evaluated at the CSTR exit condition.',
      ]),
  }
}

function solveSolutionPreparationChain(
  calculatorId: string,
  query: string,
): ProblemCompositeSolution | undefined {
  if (
    calculatorId !==
    'solutionConcentration'
  ) {
    return undefined
  }

  const cleanQuery =
    normalizeText(
      query,
    )

  const requestsConcentration =
    includesAny(
      cleanQuery,
      [
        'solution molarity',
        'calculate molarity',
        'solution concentration',
        'cozelti molaritesi',
        'molarite',
      ],
    )

  const includesSoluteMass =
    includesAny(
      cleanQuery,
      [
        'solute mass',
        'sample mass',
        'material mass',
        'cozunen kutlesi',
      ],
    )

  const includesMolecularWeight =
    includesAny(
      cleanQuery,
      [
        'molecular weight',
        'molar mass',
        'molekuler agirlik',
        'mol kutlesi',
      ],
    )

  if (
    !requestsConcentration ||
    !includesSoluteMass ||
    !includesMolecularWeight
  ) {
    return undefined
  }

  const amount =
    solveProblemQuickly(
      'massMoleConversion',
      query,
    )

  if (!amount) {
    return undefined
  }

  const concentration =
    solveProblemQuickly(
      'solutionConcentration',
      [
        `moles ${amount.numericValue} mol`,
        query,
      ].join(
        ' ',
      ),
    )

  if (!concentration) {
    return undefined
  }

  return {
    solutionMode:
      'composite',
    chain: [
      'massMoleConversion',
      'solutionConcentration',
    ],
    resultLabel:
      'Mass-based solution molarity',
    resultValue:
      concentration.resultValue,
    numericValue:
      concentration.numericValue,
    unit:
      concentration.unit,
    equation:
      'n = m/MW → C = n/Vsolution',
    steps: [
      `1. Solute amount = ${amount.resultValue}`,
      `2. Final solution volume is read from the problem.`,
      `3. Solution molarity = ${concentration.resultValue}`,
    ],
    assumptions:
      uniqueValues([
        ...amount.assumptions,
        ...concentration.assumptions,
      ]),
  }
}

function solveMixtureMolarFlowChain(
  calculatorId: string,
  query: string,
): ProblemCompositeSolution | undefined {
  if (
    calculatorId !==
    'massFlowMolarFlowConversion'
  ) {
    return undefined
  }

  const cleanQuery =
    normalizeText(
      query,
    )

  const requestsMolarFlow =
    includesAny(
      cleanQuery,
      [
        'molar flow',
        'molar flow rate',
        'convert mass flow',
        'molar debi',
      ],
    )

  const includesMixture =
    includesAny(
      cleanQuery,
      [
        'binary mixture',
        'mixture molecular weight',
        'component 1 mole fraction',
        'mole fraction 1',
        'ikili karisim',
        'karisim',
      ],
    )

  if (
    !requestsMolarFlow ||
    !includesMixture
  ) {
    return undefined
  }

  const averageMolecularWeight =
    solveProblemQuickly(
      'averageMolecularWeight',
      query,
    )

  if (!averageMolecularWeight) {
    return undefined
  }

  const molarFlow =
    solveProblemQuickly(
      'massFlowMolarFlowConversion',
      [
        `molecular weight ${averageMolecularWeight.numericValue} g/mol`,
        query,
      ].join(
        ' ',
      ),
    )

  if (!molarFlow) {
    return undefined
  }

  return {
    solutionMode:
      'composite',
    chain: [
      'averageMolecularWeight',
      'massFlowMolarFlowConversion',
    ],
    resultLabel:
      'Mixture molar flow rate',
    resultValue:
      molarFlow.resultValue,
    numericValue:
      molarFlow.numericValue,
    unit:
      molarFlow.unit,
    equation:
      'MWavg = ΣxiMWi → ṅ = ṁ/MWavg',
    steps: [
      `1. Average molecular weight = ${averageMolecularWeight.resultValue}`,
      `2. Mixture mass flow is converted using MWavg.`,
      `3. Mixture molar flow = ${molarFlow.resultValue}`,
    ],
    assumptions:
      uniqueValues([
        ...averageMolecularWeight.assumptions,
        ...molarFlow.assumptions,
      ]),
  }
}

function solveMassBasedIdealGasChain(
  calculatorId: string,
  query: string,
): ProblemCompositeSolution | undefined {
  if (
    calculatorId !==
      'idealGas' &&
    calculatorId !==
      'idealGasCalculator'
  ) {
    return undefined
  }

  const cleanQuery =
    normalizeText(
      query,
    )

  const requestsGasVolume =
    includesAny(
      cleanQuery,
      [
        'ideal gas volume',
        'gas volume',
        'calculate gas volume',
        'ideal gaz hacmi',
        'gaz hacmi',
      ],
    )

  const includesMass =
    includesAny(
      cleanQuery,
      [
        'sample mass',
        'gas mass',
        'material mass',
        'kutle',
      ],
    )

  const includesMolecularWeight =
    includesAny(
      cleanQuery,
      [
        'molecular weight',
        'molar mass',
        'molekuler agirlik',
        'mol kutlesi',
      ],
    )

  if (
    !requestsGasVolume ||
    !includesMass ||
    !includesMolecularWeight
  ) {
    return undefined
  }

  const amount =
    solveProblemQuickly(
      'massMoleConversion',
      query,
    )

  if (!amount) {
    return undefined
  }

  const augmentedQuery = [
    `amount of gas ${amount.numericValue} mol`,
    query,
  ].join(
    ' ',
  )

  const gasVolume =
    solveProblemQuickly(
      calculatorId,
      augmentedQuery,
    ) ??
    solveProblemQuickly(
      'idealGas',
      augmentedQuery,
    ) ??
    solveProblemQuickly(
      'idealGasCalculator',
      augmentedQuery,
    )

  if (!gasVolume) {
    return undefined
  }

  return {
    solutionMode:
      'composite',
    chain: [
      'massMoleConversion',
      calculatorId,
    ],
    resultLabel:
      'Mass-based ideal-gas volume',
    resultValue:
      gasVolume.resultValue,
    numericValue:
      gasVolume.numericValue,
    unit:
      gasVolume.unit,
    equation:
      'n = m/MW → V = nRT/P',
    steps: [
      `1. Amount of gas = ${amount.resultValue}`,
      '2. The supplied pressure and temperature are converted to absolute SI units.',
      `3. Ideal-gas volume = ${gasVolume.resultValue}`,
    ],
    assumptions:
      uniqueValues([
        ...amount.assumptions,
        ...gasVolume.assumptions,
      ]),
  }
}

function solveMixtureHydrostaticChain(
  calculatorId: string,
  query: string,
): ProblemCompositeSolution | undefined {
  if (
    calculatorId !==
    'hydrostaticPressure'
  ) {
    return undefined
  }

  const cleanQuery =
    normalizeText(
      query,
    )

  const requestsPressure =
    includesAny(
      cleanQuery,
      [
        'hydrostatic pressure',
        'liquid pressure',
        'static liquid pressure',
        'hidrostatik basinc',
      ],
    )

  const includesMixtureData =
    includesAny(
      cleanQuery,
      [
        'mixture mass',
        'total mixture mass',
        'mixture density',
        'karisim kutlesi',
      ],
    )

  if (
    !requestsPressure ||
    !includesMixtureData
  ) {
    return undefined
  }

  const mixtureDensity =
    solveProblemQuickly(
      'mixtureDensityCalculator',
      query,
    )

  if (!mixtureDensity) {
    return undefined
  }

  const pressure =
    solveProblemQuickly(
      'hydrostaticPressure',
      [
        `fluid density ${mixtureDensity.numericValue} kg/m3`,
        query,
      ].join(
        ' ',
      ),
    )

  if (!pressure) {
    return undefined
  }

  return {
    solutionMode:
      'composite',
    chain: [
      'mixtureDensityCalculator',
      'hydrostaticPressure',
    ],
    resultLabel:
      'Mixture hydrostatic pressure',
    resultValue:
      pressure.resultValue,
    numericValue:
      pressure.numericValue,
    unit:
      pressure.unit,
    equation:
      'ρmix = mtotal/Vtotal → ΔP = ρmixgh',
    steps: [
      `1. Mixture density = ${mixtureDensity.resultValue}`,
      '2. The mixture density is applied over the stated liquid depth.',
      `3. Hydrostatic pressure = ${pressure.resultValue}`,
    ],
    assumptions:
      uniqueValues([
        ...mixtureDensity.assumptions,
        ...pressure.assumptions,
      ]),
  }
}

function solveTankOrificeChain(
  calculatorId: string,
  query: string,
): ProblemCompositeSolution | undefined {
  if (
    calculatorId !==
    'orificeMeter'
  ) {
    return undefined
  }

  const cleanQuery =
    normalizeText(
      query,
    )

  const requestsOutletFlow =
    includesAny(
      cleanQuery,
      [
        'tank outlet flow',
        'tank orifice flow',
        'orifice discharge',
        'outlet orifice flow',
        'tank cikis debisi',
        'orifis debisi',
      ],
    )

  const includesHydrostaticHead =
    includesAny(
      cleanQuery,
      [
        'liquid depth',
        'liquid height',
        'hydrostatic head',
        'sivi derinligi',
        'sivi yuksekligi',
      ],
    )

  if (
    !requestsOutletFlow ||
    !includesHydrostaticHead
  ) {
    return undefined
  }

  const pressure =
    solveProblemQuickly(
      'hydrostaticPressure',
      query,
    )

  if (!pressure) {
    return undefined
  }

  const flowRate =
    solveProblemQuickly(
      'orificeMeter',
      [
        `pressure difference ${pressure.numericValue} Pa`,
        query,
      ].join(
        ' ',
      ),
    )

  if (!flowRate) {
    return undefined
  }

  return {
    solutionMode:
      'composite',
    chain: [
      'hydrostaticPressure',
      'orificeMeter',
    ],
    resultLabel:
      'Hydrostatic tank-outlet flow',
    resultValue:
      flowRate.resultValue,
    numericValue:
      flowRate.numericValue,
    unit:
      flowRate.unit,
    equation:
      'ΔP = ρgh → Q = CdA√(2ΔP/ρ)',
    steps: [
      `1. Hydrostatic pressure difference = ${pressure.resultValue}`,
      '2. The hydrostatic pressure is applied across the outlet orifice.',
      `3. Tank outlet flow rate = ${flowRate.resultValue}`,
    ],
    assumptions:
      uniqueValues([
        ...pressure.assumptions,
        ...flowRate.assumptions,
        'The receiving side is at the reference pressure.',
      ]),
  }
}

function solveOrificePumpChain(
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
        'orifice pump power',
        'pompa gucu',
      ],
    )

  const includesOrifice =
    includesAny(
      cleanQuery,
      [
        'orifice',
        'orifice flow',
        'discharge coefficient',
        'orifis',
      ],
    )

  if (
    !requestsPumpPower ||
    !includesOrifice
  ) {
    return undefined
  }

  const orificeFlow =
    solveProblemQuickly(
      'orificeMeter',
      query,
    )

  const pressureDifference =
    readCompositePressure(
      query,
    )

  const density =
    readCompositeDensity(
      query,
    )

  if (
    !orificeFlow ||
    pressureDifference === null ||
    density === null ||
    pressureDifference < 0 ||
    density <= 0
  ) {
    return undefined
  }

  const equivalentHead =
    pressureDifference /
    (
      density *
      COMPOSITE_STANDARD_GRAVITY
    )

  const pumpPower =
    solveProblemQuickly(
      'pumpPower',
      [
        `volumetric flow rate ${orificeFlow.numericValue} m3/s`,
        `pump head ${equivalentHead} m`,
        query,
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
      'orificeMeter',
      'pumpPower',
    ],
    resultLabel:
      'Orifice-flow pump requirement',
    resultValue:
      pumpPower.resultValue,
    numericValue:
      pumpPower.numericValue,
    unit:
      pumpPower.unit,
    equation:
      'Q = CdA√(2ΔP/ρ) → H = ΔP/(ρg) → P = ρgQH/η',
    steps: [
      `1. Orifice flow rate = ${orificeFlow.resultValue}`,
      `2. Equivalent pressure head = ${formatNumber(
        equivalentHead,
      )} m`,
      `3. Required pump power = ${pumpPower.resultValue}`,
    ],
    assumptions:
      uniqueValues([
        ...orificeFlow.assumptions,
        ...pumpPower.assumptions,
        'The pump supplies the stated differential pressure.',
      ]),
  }
}

export function solveCompositeProblem(
  calculatorId: string,
  query: string,
): ProblemCompositeSolution | undefined {
  return (
    solveMassBasedIdealGasChain(
      calculatorId,
      query,
    ) ??
    solveMixtureHydrostaticChain(
      calculatorId,
      query,
    ) ??
    solveTankOrificeChain(
      calculatorId,
      query,
    ) ??
    solveOrificePumpChain(
      calculatorId,
      query,
    ) ??
    solveTotalPumpPowerChain(
      calculatorId,
      query,
    ) ??
    solveMassFlowCstrChain(
      calculatorId,
      query,
    ) ??
    solveSolutionPreparationChain(
      calculatorId,
      query,
    ) ??
    solveMixtureMolarFlowChain(
      calculatorId,
      query,
    ) ??
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
