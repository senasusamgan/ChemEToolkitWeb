import { solveProblemQuickly } from './problemQuickSolveEngine.ts'
import type { ProblemQuickSolution } from './problemQuickSolveEngine.ts'
import { solveCompositeProblem } from './problemCompositeSolveEngine.ts'
import { diagnoseProblemInput } from './problemInputDiagnosticsEngine.ts'
import type { ProblemInputDiagnostic } from './problemInputDiagnosticsEngine.ts'
import { buildProblemSolutionPlan } from './problemSolutionPlanEngine.ts'
import {
  buildProblemAssumptions,
  buildProblemVerificationChecklist,
} from './problemAssumptionEngine.ts'
import { buildProblemEngineeringReport } from './problemEngineeringReportEngine.ts'
import type { ProblemEngineeringReport } from './problemEngineeringReportEngine.ts'
import { parseEquationAwareInput } from './problemEquationInputParser.ts'
import type { ProblemEquationAssignment } from './problemEquationInputParser.ts'
import { inferProblemEquationIntent } from './problemEquationIntentEngine.ts'
import type { ProblemEquationIntent } from './problemEquationIntentEngine.ts'
import { resolveProblemEquationContext } from './problemEquationContextEngine.ts'
import type { ProblemEquationContext } from './problemEquationContextEngine.ts'

export interface ProblemSolverCalculator {
  id: string
  title: string
  category: string
  available: boolean
}

export type ProblemSolverConfidence =
  | 'high'
  | 'medium'
  | 'low'

export interface ProblemSolverMatch {
  calculatorId: string
  title: string
  category: string
  score: number
  confidence: ProblemSolverConfidence
  reasons: string[]
  guidance: string
  requiredInputs: string[]
  equationHint: string
  detectedInputs: string[]
  missingInputs: string[]
  readinessPercent: number
  diagnostics: ProblemInputDiagnostic[]
  solutionPlan: string[]
  assumptions: string[]
  verificationChecklist: string[]
  engineeringReport: ProblemEngineeringReport
  equationAssignments: ProblemEquationAssignment[]
  equationIntent: ProblemEquationIntent
  equationContext: ProblemEquationContext
  quickSolution?: ProblemQuickSolution
}

interface ProblemSolverGuidance {
  guidance: string
  requiredInputs: string[]
  equationHint: string
}

interface GuidanceProfile
  extends ProblemSolverGuidance {
  calculatorIds: string[]
  titleTerms: string[]
  querySignals?: string[]
}

interface IntentProfile {
  label: string
  categories: string[]
  signals: string[]
  titleTerms: string[]
  score: number
}

const CATEGORY_SIGNALS:
  Record<string, string[]> = {
    'Engineering Fundamentals': [
      'unit conversion',
      'convert units',
      'molecular weight',
      'mole fraction',
      'mass fraction',
      'density',
      'specific gravity',
      'interpolation',
      'weighted average',
      'birim donusumu',
      'molekul agirligi',
      'yogunluk',
    ],

    'Material & Energy Balances': [
      'mass balance',
      'material balance',
      'energy balance',
      'mixer',
      'splitter',
      'recycle',
      'purge',
      'evaporator',
      'dryer',
      'kutle dengesi',
      'enerji dengesi',
      'geri devir',
    ],

    Thermodynamics: [
      'ideal gas',
      'real gas',
      'entropy',
      'enthalpy',
      'vapor pressure',
      'bubble point',
      'dew point',
      'phase equilibrium',
      'ideal gaz',
      'entropi',
      'entalpi',
      'buhar basinci',
    ],

    'Fluid Mechanics': [
      'pipe flow',
      'pressure drop',
      'reynolds',
      'bernoulli',
      'pump',
      'friction factor',
      'head loss',
      'flow regime',
      'boru akisi',
      'basinc dusum',
      'reynolds sayisi',
      'pompa',
    ],

    'Heat Transfer': [
      'heat transfer',
      'conduction',
      'convection',
      'radiation',
      'heat exchanger',
      'lmtd',
      'ntu',
      'biot',
      'fin',
      'boiling',
      'condensation',
      'isi transferi',
      'isi degistirici',
      'iletim',
      'tasinim',
    ],

    'Mass Transfer': [
      'mass transfer',
      'diffusion',
      'fick',
      'diffusivity',
      'membrane',
      'stagnant film',
      'kutle transferi',
      'difüzyon',
      'difuzyon',
      'membran',
    ],

    'Reaction Engineering': [
      'reaction rate',
      'reactor',
      'cstr',
      'pfr',
      'batch reactor',
      'arrhenius',
      'activation energy',
      'conversion',
      'selectivity',
      'reaktor',
      'reaksiyon hizi',
      'aktivasyon enerjisi',
      'donusum',
    ],

    'Separation Processes': [
      'distillation',
      'absorption',
      'stripping',
      'extraction',
      'filtration',
      'drying',
      'adsorption',
      'crystallization',
      'cyclone',
      'distilasyon',
      'absorpsiyon',
      'ekstraksiyon',
      'filtrasyon',
      'kurutma',
    ],

    'Process Control': [
      'process control',
      'pid',
      'controller',
      'control valve',
      'transfer function',
      'tank dynamics',
      'closed loop',
      'tuning',
      'proses kontrol',
      'kontrolor',
      'pid ayar',
      'transfer fonksiyonu',
    ],

    'Numerical Methods': [
      'root finding',
      'numerical integration',
      'numerical differentiation',
      'differential equation',
      'linear system',
      'regression',
      'optimization',
      'finite difference',
      'kok bulma',
      'sayisal integral',
      'sayisal turev',
      'diferansiyel denklem',
    ],

    'Process Safety & Economics': [
      'process safety',
      'risk',
      'leak',
      'relief',
      'equipment cost',
      'npv',
      'irr',
      'payback',
      'roi',
      'break even',
      'proses guvenligi',
      'sizinti',
      'ekipman maliyeti',
      'geri odeme',
    ],
  }

const INTENT_PROFILES:
  IntentProfile[] = [
    {
      label:
        'Pipe pressure-drop calculation',
      categories: [
        'Fluid Mechanics',
      ],
      signals: [
        'pressure drop',
        'pipe pressure loss',
        'darcy weisbach',
        'basinc dusum',
        'boru basinc kaybi',
      ],
      titleTerms: [
        'pressure',
        'drop',
      ],
      score: 160,
    },

    {
      label:
        'Reynolds number and flow regime',
      categories: [
        'Fluid Mechanics',
      ],
      signals: [
        'reynolds number',
        'flow regime',
        'laminar or turbulent',
        'reynolds sayisi',
        'laminer veya turbulent',
      ],
      titleTerms: [
        'reynolds',
      ],
      score: 160,
    },

    {
      label:
        'Pump power calculation',
      categories: [
        'Fluid Mechanics',
      ],
      signals: [
        'pump power',
        'hydraulic power',
        'pompa gucu',
      ],
      titleTerms: [
        'pump',
        'power',
      ],
      score: 145,
    },

    {
      label:
        'Heat-exchanger area sizing',
      categories: [
        'Heat Transfer',
      ],
      signals: [
        'required heat exchanger area',
        'size the heat exchanger',
        'heat exchanger area',
        'isi degistirici alani',
        'isi degistirici boyutlandir',
      ],
      titleTerms: [
        'heat',
        'exchanger',
        'area',
      ],
      score: 165,
    },

    {
      label:
        'LMTD calculation',
      categories: [
        'Heat Transfer',
      ],
      signals: [
        'lmtd',
        'log mean temperature difference',
        'logaritmik ortalama sicaklik farki',
      ],
      titleTerms: [
        'lmtd',
      ],
      score: 135,
    },

    {
      label:
        'Biot-number calculation',
      categories: [
        'Heat Transfer',
      ],
      signals: [
        'biot number',
        'lumped capacitance',
        'biot sayisi',
      ],
      titleTerms: [
        'biot',
      ],
      score: 145,
    },

    {
      label:
        'Ideal-gas calculation',
      categories: [
        'Thermodynamics',
      ],
      signals: [
        'ideal gas law',
        'pv nrt',
        'ideal gaz denklemi',
      ],
      titleTerms: [
        'ideal',
        'gas',
      ],
      score: 145,
    },

    {
      label:
        'CSTR reactor design',
      categories: [
        'Reaction Engineering',
      ],
      signals: [
        'cstr volume',
        'cstr design',
        'continuous stirred tank reactor',
        'cstr hacmi',
        'surekli karistirmali tank reaktoru',
      ],
      titleTerms: [
        'cstr',
      ],
      score: 160,
    },

    {
      label:
        'PFR reactor design',
      categories: [
        'Reaction Engineering',
      ],
      signals: [
        'pfr volume',
        'pfr design',
        'plug flow reactor',
        'pfr hacmi',
        'tapa akisli reaktor',
      ],
      titleTerms: [
        'pfr',
      ],
      score: 160,
    },

    {
      label:
        'Batch-reactor calculation',
      categories: [
        'Reaction Engineering',
      ],
      signals: [
        'batch reactor',
        'batch reaction time',
        'kesikli reaktor',
        'reaksiyon suresi',
      ],
      titleTerms: [
        'batch',
      ],
      score: 145,
    },

    {
      label:
        'PID-controller calculation',
      categories: [
        'Process Control',
      ],
      signals: [
        'pid controller',
        'pid tuning',
        'tune a pid',
        'pid kontrolor',
        'pid ayar',
      ],
      titleTerms: [
        'pid',
      ],
      score: 160,
    },

    {
      label:
        'Numerical root finding',
      categories: [
        'Numerical Methods',
      ],
      signals: [
        'find the root',
        'solve nonlinear equation',
        'root finding',
        'kok bul',
        'dogrusal olmayan denklem',
      ],
      titleTerms: [
        'root',
      ],
      score: 145,
    },

    {
      label:
        'Numerical integration',
      categories: [
        'Numerical Methods',
      ],
      signals: [
        'numerical integration',
        'simpson rule',
        'trapezoidal rule',
        'area under the curve',
        'sayisal integral',
        'simpson kurali',
        'yamuk kurali',
      ],
      titleTerms: [
        'integration',
      ],
      score: 145,
    },

    {
      label:
        'Bubble-point calculation',
      categories: [
        'Thermodynamics',
      ],
      signals: [
        'bubble point',
        'bubble point pressure',
        'kabarcik noktasi',
      ],
      titleTerms: [
        'bubble',
        'point',
      ],
      score: 150,
    },

    {
      label:
        'Net-present-value analysis',
      categories: [
        'Process Safety & Economics',
      ],
      signals: [
        'net present value',
        'npv',
        'net bugunku deger',
      ],
      titleTerms: [
        'net',
        'present',
        'value',
      ],
      score: 150,
    },
  ]

const GUIDANCE_PROFILES:
  GuidanceProfile[] = [
    {
      calculatorIds: [
        'pressureDrop',
      ],
      titleTerms: [
        'pressure',
        'drop',
      ],
      querySignals: [
        'pressure drop',
        'basinc dusum',
        'pipe pressure loss',
      ],
      guidance:
        'Use a pipe-flow pressure-loss model after checking the flow regime and friction factor.',
      requiredInputs: [
        'pipe length',
        'inside diameter',
        'flow rate or velocity',
        'fluid density',
        'fluid viscosity',
        'roughness',
      ],
      equationHint:
        'Darcy–Weisbach: ΔP = f(L/D)(ρv²/2)',
    },
    {
      calculatorIds: [
        'reynoldsNumber',
      ],
      titleTerms: [
        'reynolds',
      ],
      guidance:
        'Calculate the Reynolds number first to identify laminar, transitional or turbulent flow.',
      requiredInputs: [
        'fluid density',
        'velocity',
        'characteristic diameter',
        'dynamic viscosity',
      ],
      equationHint:
        'Re = ρvD/μ',
    },
    {
      calculatorIds: [
        'pumpPower',
      ],
      titleTerms: [
        'pump',
        'power',
      ],
      guidance:
        'Determine hydraulic power and then correct it using the pump efficiency.',
      requiredInputs: [
        'flow rate',
        'total head',
        'fluid density',
        'pump efficiency',
      ],
      equationHint:
        'P = ρgQH/η',
    },
    {
      calculatorIds: [
        'heatExchangerAreaSizing',
      ],
      titleTerms: [
        'heat',
        'exchanger',
        'area',
      ],
      guidance:
        'Calculate heat duty and the effective temperature driving force before sizing the exchanger area.',
      requiredInputs: [
        'heat duty',
        'overall U value',
        'hot inlet and outlet temperatures',
        'cold inlet and outlet temperatures',
        'correction factor',
      ],
      equationHint:
        'A = Q/(UFΔTlm)',
    },
    {
      calculatorIds: [
        'heatExchangerLMTD',
      ],
      titleTerms: [
        'lmtd',
      ],
      guidance:
        'Build both terminal temperature differences using a consistent parallel- or counter-current basis.',
      requiredInputs: [
        'hot inlet temperature',
        'hot outlet temperature',
        'cold inlet temperature',
        'cold outlet temperature',
        'flow arrangement',
      ],
      equationHint:
        'ΔTlm = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂)',
    },
    {
      calculatorIds: [
        'biotNumber',
      ],
      titleTerms: [
        'biot',
      ],
      guidance:
        'Use the Biot number to test whether the lumped-capacitance approximation is appropriate.',
      requiredInputs: [
        'convection coefficient',
        'characteristic length',
        'solid thermal conductivity',
      ],
      equationHint:
        'Bi = hLc/k',
    },
    {
      calculatorIds: [
        'idealGas',
      ],
      titleTerms: [
        'ideal',
        'gas',
      ],
      guidance:
        'Use a consistent absolute-temperature and pressure basis before applying the ideal-gas equation.',
      requiredInputs: [
        'pressure',
        'volume',
        'amount of gas',
        'absolute temperature',
        'gas constant basis',
      ],
      equationHint:
        'PV = nRT',
    },
    {
      calculatorIds: [
        'reactorDesign',
      ],
      titleTerms: [
        'cstr',
      ],
      guidance:
        'Evaluate the reaction rate at the reactor-exit composition before applying the CSTR design equation.',
      requiredInputs: [
        'feed molar flow',
        'conversion',
        'exit reaction rate',
        'stoichiometry',
      ],
      equationHint:
        'V = Fₐ₀X/(−rₐ)exit',
    },
    {
      calculatorIds: [
        'pfrSections',
      ],
      titleTerms: [
        'pfr',
      ],
      guidance:
        'Integrate the reciprocal reaction rate over the requested conversion range.',
      requiredInputs: [
        'feed molar flow',
        'rate law',
        'initial composition',
        'target conversion',
        'temperature basis',
      ],
      equationHint:
        'V = Fₐ₀∫dX/(−rₐ)',
    },
    {
      calculatorIds: [
        'batchReactor',
      ],
      titleTerms: [
        'batch',
        'reactor',
      ],
      guidance:
        'Integrate the batch material balance from the initial state to the target conversion.',
      requiredInputs: [
        'initial concentration',
        'rate law',
        'rate constant',
        'target conversion',
      ],
      equationHint:
        't = Cₐ₀∫dX/(−rₐ)',
    },
    {
      calculatorIds: [
        'pidController',
      ],
      titleTerms: [
        'pid',
      ],
      guidance:
        'Identify the process gain and dynamic parameters before selecting a tuning correlation.',
      requiredInputs: [
        'process gain',
        'time constant',
        'dead time',
        'controller form',
        'tuning objective',
      ],
      equationHint:
        'Gc(s) = Kc[1 + 1/(τI s) + τD s]',
    },
    {
      calculatorIds: [
        'ficksFirstLaw',
      ],
      titleTerms: [
        'fick',
        'first',
      ],
      guidance:
        'Define the diffusion direction and concentration gradient sign before calculating flux.',
      requiredInputs: [
        'diffusivity',
        'concentration difference',
        'diffusion distance',
        'area when total rate is required',
      ],
      equationHint:
        'Jₐ = −Dₐᵦ dCₐ/dz',
    },
    {
      calculatorIds: [
        'netPresentValueAnalysis',
      ],
      titleTerms: [
        'net',
        'present',
        'value',
      ],
      guidance:
        'Discount each cash flow to the selected reference year and include the initial investment.',
      requiredInputs: [
        'initial investment',
        'annual cash flows',
        'discount rate',
        'project life',
        'terminal value',
      ],
      equationHint:
        'NPV = Σ CFₜ/(1+i)ᵗ',
    },
  ]

const CATEGORY_GUIDANCE:
  Record<string, ProblemSolverGuidance> = {
    'Engineering Fundamentals': {
      guidance:
        'Confirm the unit basis and identify the requested converted or averaged property.',
      requiredInputs: [
        'known values',
        'current units',
        'target units or property',
      ],
      equationHint:
        'Apply the calculator-specific definition with a consistent unit basis.',
    },
    'Material & Energy Balances': {
      guidance:
        'Draw the process boundary, list all streams and state the accumulation and reaction assumptions.',
      requiredInputs: [
        'stream flow rates',
        'stream compositions',
        'process connections',
        'steady or unsteady state',
        'reaction information',
      ],
      equationHint:
        'Input + generation − output − consumption = accumulation',
    },
    Thermodynamics: {
      guidance:
        'Define the thermodynamic state, phase and property model before evaluating the unknown.',
      requiredInputs: [
        'temperature',
        'pressure',
        'composition',
        'phase',
        'property-model assumptions',
      ],
      equationHint:
        'Use the selected equation of state or property relation.',
    },
    'Fluid Mechanics': {
      guidance:
        'Define the geometry, fluid properties and flow conditions before applying the momentum or energy balance.',
      requiredInputs: [
        'geometry',
        'flow rate or velocity',
        'density',
        'viscosity',
        'boundary conditions',
      ],
      equationHint:
        'Use continuity with the appropriate momentum or mechanical-energy equation.',
    },
    'Heat Transfer': {
      guidance:
        'Identify the heat-transfer mode, geometry and temperature driving force.',
      requiredInputs: [
        'temperatures',
        'geometry',
        'thermal properties',
        'heat-transfer coefficients',
        'boundary conditions',
      ],
      equationHint:
        'Q = driving force / total thermal resistance',
    },
    'Mass Transfer': {
      guidance:
        'Define the transferring species, phases and concentration driving-force basis.',
      requiredInputs: [
        'compositions or concentrations',
        'diffusivity',
        'geometry',
        'phase conditions',
        'mass-transfer coefficients',
      ],
      equationHint:
        'Transfer rate = coefficient × area × driving force',
    },
    'Reaction Engineering': {
      guidance:
        'Specify the rate law, stoichiometry and reactor model before calculating conversion, time or volume.',
      requiredInputs: [
        'rate law',
        'kinetic parameters',
        'feed conditions',
        'stoichiometry',
        'target conversion',
      ],
      equationHint:
        'Apply the mole balance for the selected reactor type.',
    },
    'Separation Processes': {
      guidance:
        'Define feed condition, product specifications and the equilibrium or transport model.',
      requiredInputs: [
        'feed flow and composition',
        'operating pressure',
        'temperature or thermal condition',
        'product specification',
        'equilibrium data',
      ],
      equationHint:
        'Combine component balances with equilibrium-stage or rate-based relations.',
    },
    'Process Control': {
      guidance:
        'Identify the process model, manipulated variable, controlled variable and control objective.',
      requiredInputs: [
        'process gain',
        'dynamic parameters',
        'set point',
        'controller structure',
        'disturbance assumptions',
      ],
      equationHint:
        'Evaluate the closed-loop transfer function or selected tuning relation.',
    },
    'Numerical Methods': {
      guidance:
        'State the mathematical problem, initial information, tolerance and valid solution interval.',
      requiredInputs: [
        'equation or data',
        'initial guess or interval',
        'tolerance',
        'iteration limit',
        'step size when required',
      ],
      equationHint:
        'Apply the selected numerical algorithm and verify convergence.',
    },
    'Process Safety & Economics': {
      guidance:
        'Define the scenario, reference basis and financial or safety assumptions before evaluating the result.',
      requiredInputs: [
        'scenario data',
        'equipment or project basis',
        'time horizon',
        'rates or probabilities',
        'reference-year assumptions',
      ],
      equationHint:
        'Apply the selected risk, cost or discounted-cash-flow model.',
    },
  }

const DEFAULT_GUIDANCE:
  ProblemSolverGuidance = {
    guidance:
      'Confirm the known variables, requested unknown and calculation assumptions before opening the calculator.',
    requiredInputs: [
      'known variables',
      'target quantity',
      'units',
      'model assumptions',
    ],
    equationHint:
      'Use the equation documented by the selected calculator.',
  }

const INPUT_ALIASES:
  Record<string, string[]> = {
    'pipe length': [
      'pipe length',
      'length',
      'boru uzunlugu',
    ],
    'inside diameter': [
      'inside diameter',
      'internal diameter',
      'pipe diameter',
      'diameter',
      'boru capi',
      'cap',
    ],
    'characteristic diameter': [
      'characteristic diameter',
      'hydraulic diameter',
      'diameter',
      'boru capi',
      'cap',
    ],
    'characteristic length': [
      'characteristic length',
      'length',
      'karakteristik uzunluk',
    ],
    'flow rate': [
      'flow rate',
      'volumetric flow',
      'mass flow',
      'debi',
    ],
    'flow rate or velocity': [
      'flow rate',
      'velocity',
      'volumetric flow',
      'mass flow',
      'debi',
      'hiz',
    ],
    velocity: [
      'velocity',
      'fluid velocity',
      'hiz',
    ],
    'fluid density': [
      'fluid density',
      'density',
      'yogunluk',
      'rho',
    ],
    density: [
      'density',
      'fluid density',
      'yogunluk',
      'rho',
    ],
    'fluid viscosity': [
      'fluid viscosity',
      'dynamic viscosity',
      'viscosity',
      'viskozite',
      'mu',
    ],
    'dynamic viscosity': [
      'dynamic viscosity',
      'fluid viscosity',
      'viscosity',
      'viskozite',
      'mu',
    ],
    viscosity: [
      'viscosity',
      'dynamic viscosity',
      'viskozite',
      'mu',
    ],
    roughness: [
      'roughness',
      'surface roughness',
      'puruzluluk',
      'epsilon',
    ],
    pressure: [
      'pressure',
      'basinc',
    ],
    volume: [
      'volume',
      'hacim',
    ],
    'amount of gas': [
      'amount of gas',
      'number of moles',
      'moles',
      'mol sayisi',
    ],
    'absolute temperature': [
      'absolute temperature',
      'temperature',
      'sicaklik',
    ],
    temperature: [
      'temperature',
      'sicaklik',
    ],
    'heat duty': [
      'heat duty',
      'heat load',
      'thermal duty',
      'isi yuku',
    ],
    'overall U value': [
      'overall u value',
      'overall heat transfer coefficient',
      'u value',
    ],
    'correction factor': [
      'correction factor',
      'duzeltme faktoru',
    ],
    'convection coefficient': [
      'convection coefficient',
      'heat transfer coefficient',
      'tasinim katsayisi',
    ],
    'solid thermal conductivity': [
      'solid thermal conductivity',
      'thermal conductivity',
      'isi iletim katsayisi',
    ],
    'feed molar flow': [
      'feed molar flow',
      'molar feed rate',
      'besleme molar debisi',
    ],
    conversion: [
      'conversion',
      'donusum',
    ],
    'target conversion': [
      'target conversion',
      'conversion',
      'hedef donusum',
    ],
    'exit reaction rate': [
      'exit reaction rate',
      'reaction rate',
      'reaksiyon hizi',
    ],
    'initial concentration': [
      'initial concentration',
      'initial molarity',
      'baslangic derisimi',
    ],
    'rate constant': [
      'rate constant',
      'kinetic constant',
      'hiz sabiti',
    ],
    'process gain': [
      'process gain',
      'gain',
      'proses kazanci',
    ],
    'time constant': [
      'time constant',
      'zaman sabiti',
    ],
    'dead time': [
      'dead time',
      'delay time',
      'olu zaman',
      'gecikme',
    ],
    diffusivity: [
      'diffusivity',
      'diffusion coefficient',
      'difuzyon katsayisi',
    ],
    'concentration difference': [
      'concentration difference',
      'concentration gradient',
      'derisim farki',
    ],
    'diffusion distance': [
      'diffusion distance',
      'film thickness',
      'difuzyon mesafesi',
    ],
    'discount rate': [
      'discount rate',
      'iskonto orani',
    ],
    'initial investment': [
      'initial investment',
      'capital investment',
      'ilk yatirim',
    ],
    'project life': [
      'project life',
      'project duration',
      'proje omru',
    ],
  }

const QUALITATIVE_INPUTS =
  new Set([
    'flow arrangement',
    'gas constant basis',
    'rate law',
    'stoichiometry',
    'temperature basis',
    'controller form',
    'tuning objective',
    'phase',
    'property-model assumptions',
    'process connections',
    'steady or unsteady state',
    'reaction information',
    'boundary conditions',
  ])

function normalize(
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
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .replace(
      /[^a-z0-9\s-]/g,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim()
}

function phraseMatches(
  query: string,
  phrase: string,
): boolean {
  const cleanPhrase =
    normalize(phrase)

  return (
    cleanPhrase.length > 1 &&
    query.includes(
      cleanPhrase,
    )
  )
}

function buildProblemGuidance(
  calculator: ProblemSolverCalculator,
  query: string,
): ProblemSolverGuidance {
  const cleanTitle =
    normalize(
      calculator.title,
    )

  const exactProfile =
    GUIDANCE_PROFILES.find(
      (profile) =>
        profile.calculatorIds.includes(
          calculator.id,
        ),
    )

  if (exactProfile) {
    return exactProfile
  }

  const titleProfile =
    GUIDANCE_PROFILES.find(
      (profile) => {
        const titleMatches =
          profile.titleTerms.every(
            (term) =>
              cleanTitle.includes(
                normalize(term),
              ),
          )

        const queryMatches =
          !profile.querySignals ||
          profile.querySignals.some(
            (signal) =>
              phraseMatches(
                query,
                signal,
              ),
          )

        return (
          titleMatches &&
          queryMatches
        )
      },
    )

  return (
    titleProfile ??
    CATEGORY_GUIDANCE[
      calculator.category
    ] ??
    DEFAULT_GUIDANCE
  )
}

function escapeRegExp(
  value: string,
): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  )
}

function hasInputEvidence(
  query: string,
  input: string,
): boolean {
  const aliases = [
    ...(
      INPUT_ALIASES[input] ??
      []
    ),
    ...input.split(
      /\s+or\s+/,
    ),
    input,
  ]

  const qualitative =
    QUALITATIVE_INPUTS.has(
      input,
    )

  return aliases.some(
    (alias) => {
      const cleanAlias =
        normalize(alias)

      if (
        cleanAlias.length < 2 ||
        !query.includes(
          cleanAlias,
        )
      ) {
        return false
      }

      if (qualitative) {
        return true
      }

      const aliasPattern =
        escapeRegExp(
          cleanAlias,
        ).replace(
          /\s+/g,
          '\\s+',
        )

      const valueAfter =
        new RegExp(
          `${aliasPattern}(?:\\s+[a-z]+){0,3}\\s+[-+]?\\d`,
        )

      const valueBefore =
        new RegExp(
          `[-+]?\\d(?:\\s+[a-z0-9]+){0,3}\\s+${aliasPattern}`,
        )

      return (
        valueAfter.test(
          query,
        ) ||
        valueBefore.test(
          query,
        )
      )
    },
  )
}

function detectInputReadiness(
  query: string,
  requiredInputs: string[],
): {
  detectedInputs: string[]
  missingInputs: string[]
  readinessPercent: number
} {
  if (requiredInputs.length === 0) {
    return {
      detectedInputs: [],
      missingInputs: [],
      readinessPercent: 100,
    }
  }

  const cleanQuery =
    normalize(query)

  const detectedInputs =
    requiredInputs.filter(
      (input) =>
        hasInputEvidence(
          cleanQuery,
          input,
        ),
    )

  const detectedSet =
    new Set(
      detectedInputs,
    )

  const missingInputs =
    requiredInputs.filter(
      (input) =>
        !detectedSet.has(
          input,
        ),
    )

  return {
    detectedInputs,
    missingInputs,
    readinessPercent:
      Math.round(
        (
          detectedInputs.length /
          requiredInputs.length
        ) *
        100,
      ),
  }
}

function confidenceForScore(
  score: number,
): ProblemSolverConfidence {
  if (score >= 120) {
    return 'high'
  }

  if (score >= 55) {
    return 'medium'
  }

  return 'low'
}

interface ProblemSolverCalculatorIndex {
  cleanTitle: string
  cleanCategory: string
  titleTokens:
    Set<string>
}

interface ProblemSolverCandidate {
  calculator:
    ProblemSolverCalculator
  score: number
  reasons: string[]
}

export const
  PROBLEM_SOLVER_RANKING_PIPELINE =
    'two-stage-shortlist' as const

const
  PROBLEM_SOLVER_CALCULATOR_INDEX_CACHE =
    new WeakMap<
      ProblemSolverCalculator,
      ProblemSolverCalculatorIndex
    >()

function indexProblemSolverCalculator(
  calculator:
    ProblemSolverCalculator,
): ProblemSolverCalculatorIndex {
  const cachedIndex =
    PROBLEM_SOLVER_CALCULATOR_INDEX_CACHE.get(
      calculator,
    )

  if (cachedIndex) {
    return cachedIndex
  }

  const cleanTitle =
    normalize(
      calculator.title,
    )

  const index = {
    cleanTitle,
    cleanCategory:
      normalize(
        calculator.category,
      ),
    titleTokens:
      new Set(
        cleanTitle
          .split(
            ' ',
          )
          .filter(
            (token) =>
              token.length > 1,
          ),
      ),
  }

  PROBLEM_SOLVER_CALCULATOR_INDEX_CACHE.set(
    calculator,
    index,
  )

  return index
}

export function rankProblemSolvers(
  query: string,
  calculators:
    ProblemSolverCalculator[],
  limit = 8,
): ProblemSolverMatch[] {
  const equationParse =
    parseEquationAwareInput(
      query,
    )

  const equationIntent =
    inferProblemEquationIntent(
      query,
      equationParse.assignments,
    )

  const equationContext =
    resolveProblemEquationContext(
      equationIntent,
      equationParse.assignments,
    )

  const solverQuery =
    [
      equationParse.enrichedQuery,
      equationIntent.enrichedText,
      equationContext.enrichedText,
    ]
      .filter(
        (section) =>
          section.length > 0,
      )
      .join(
        '\n',
      )

  const cleanQuery =
    normalize(
      solverQuery,
    )

  if (
    cleanQuery.length < 3 ||
    limit <= 0
  ) {
    return []
  }

  const safeLimit =
    Math.max(
      1,
      limit,
    )

  const queryTokens =
    cleanQuery
      .split(
        ' ',
      )
      .filter(
        (token) =>
          token.length > 1,
      )

  const equationCalculatorIds =
    new Set(
      equationIntent
        .suggestedCalculatorIds,
    )

  const equationCategories =
    new Set(
      equationIntent
        .suggestedCategories,
    )

  const normalizedTargetName =
    equationIntent.targetName
      ? normalize(
          equationIntent
            .targetName,
        )
      : ''

  const equationAssignmentReason =
    equationParse
      .assignments
      .length > 0
      ? `Parsed symbolic inputs: ${equationParse.assignments
          .map(
            (assignment) =>
              assignment.symbol,
          )
          .join(', ')}`
      : ''

  const matchedCategorySignals =
    new Map<
      string,
      string[]
    >()

  for (
    const [
      category,
      signals,
    ]
    of Object.entries(
      CATEGORY_SIGNALS,
    )
  ) {
    matchedCategorySignals.set(
      category,
      signals.filter(
        (signal) =>
          phraseMatches(
            cleanQuery,
            signal,
          ),
      ),
    )
  }

  const matchedIntentProfiles =
    INTENT_PROFILES.filter(
      (profile) =>
        profile.signals.some(
          (signal) =>
            phraseMatches(
              cleanQuery,
              signal,
            ),
        ),
    )

  /*
   * Stage 1:
   * Score every available calculator using only
   * inexpensive title, category, equation and intent
   * signals. No diagnostics, Quick Solve, report or
   * assumption generation is performed here.
   */
  const rankedCandidates:
    ProblemSolverCandidate[] =
    calculators
      .filter(
        (calculator) =>
          calculator.available,
      )
      .map(
        (
          calculator,
        ):
          ProblemSolverCandidate => {
          const calculatorIndex =
            indexProblemSolverCalculator(
              calculator,
            )

          const {
            cleanTitle,
            cleanCategory,
            titleTokens,
          } =
            calculatorIndex

          const reasons =
            new Set<string>()

          let score =
            0

          if (
            equationParse
              .assignments
              .length > 0
          ) {
            score +=
              Math.min(
                30,
                equationParse
                  .assignments
                  .length *
                  5,
              )

            reasons.add(
              equationAssignmentReason,
            )
          }

          const equationCalculatorMatches =
            equationCalculatorIds.has(
              calculator.id,
            )

          const equationCategoryMatches =
            equationCategories.has(
              calculator.category,
            )

          if (
            equationIntent.equationId &&
            (
              equationCalculatorMatches ||
              equationCategoryMatches
            )
          ) {
            score +=
              equationCalculatorMatches
                ? 42
                : 24

            reasons.add(
              `Recognized equation: ${equationIntent.equationLabel}`,
            )
          }

          if (
            normalizedTargetName &&
            cleanTitle.includes(
              normalizedTargetName,
            )
          ) {
            score +=
              20

            reasons.add(
              `Requested unknown: ${equationIntent.targetName}`,
            )
          }

          if (
            equationContext.status ===
              'ready' &&
            (
              equationCalculatorMatches ||
              equationCategoryMatches
            )
          ) {
            score +=
              18

            reasons.add(
              `Equation inputs ready: ${equationContext.readinessPercent}%`,
            )
          } else if (
            equationContext.status ===
              'needs-inputs' &&
            (
              equationCalculatorMatches ||
              equationCategoryMatches
            )
          ) {
            score +=
              6

            reasons.add(
              `Equation inputs missing: ${equationContext.missingVariableNames.join(', ')}`,
            )
          }

          if (
            cleanTitle ===
            cleanQuery
          ) {
            score +=
              180

            reasons.add(
              'Exact calculator-title match',
            )
          } else if (
            cleanQuery.includes(
              cleanTitle,
            )
          ) {
            score +=
              110

            reasons.add(
              'Calculator title appears in the problem',
            )
          }

          for (
            const token
            of queryTokens
          ) {
            if (
              titleTokens.has(
                token,
              )
            ) {
              score +=
                18

              reasons.add(
                `Title term matched: ${token}`,
              )
            } else if (
              cleanCategory.includes(
                token,
              )
            ) {
              score +=
                5
            }
          }

          const categorySignals =
            matchedCategorySignals.get(
              calculator.category,
            ) ?? []

          for (
            const signal
            of categorySignals
          ) {
            score +=
              24

            reasons.add(
              `Discipline signal matched: ${signal}`,
            )
          }

          for (
            const profile
            of matchedIntentProfiles
          ) {
            if (
              !profile
                .categories
                .includes(
                  calculator.category,
                )
            ) {
              continue
            }

            const titleMatched =
              profile
                .titleTerms
                .every(
                  (term) =>
                    cleanTitle.includes(
                      normalize(
                        term,
                      ),
                    ),
                )

            if (!titleMatched) {
              continue
            }

            score +=
              profile.score

            reasons.add(
              profile.label,
            )
          }

          return {
            calculator,
            score,
            reasons:
              Array.from(
                reasons,
              ),
          }
        },
      )
      .filter(
        (candidate) =>
          candidate.score > 0,
      )
      .sort(
        (
          first,
          second,
        ) =>
          second.score -
            first.score ||
          first
            .calculator
            .title
            .localeCompare(
              second
                .calculator
                .title,
            ),
      )
      .slice(
        0,
        safeLimit,
      )

  /*
   * Stage 2:
   * Run expensive engineering enrichment only for
   * candidates that will actually be returned.
   */
  return rankedCandidates.map(
    (
      candidate,
    ) => {
      const {
        calculator,
        score,
        reasons,
      } =
        candidate

      const guidance =
        buildProblemGuidance(
          calculator,
          cleanQuery,
        )

      const readiness =
        detectInputReadiness(
          cleanQuery,
          guidance.requiredInputs,
        )

      const diagnostics =
        diagnoseProblemInput(
          calculator.id,
          solverQuery,
        )

      const diagnosticReasons =
        diagnostics
          .diagnostics
          .map(
            (diagnostic) =>
              `Input ${diagnostic.severity}: ${diagnostic.message}`,
          )

      const diagnosticGuidance =
        diagnostics
          .diagnostics
          .length > 0
          ? `${guidance.guidance} Input check: ${diagnostics.diagnostics
              .map(
                (diagnostic) =>
                  diagnostic.message,
              )
              .join(' ')}`
          : guidance.guidance

      const quickSolution =
        diagnostics.hasBlockingErrors
          ? undefined
          : solveCompositeProblem(
              calculator.id,
              solverQuery,
            ) ??
            solveProblemQuickly(
              calculator.id,
              solverQuery,
            )

      const solutionPlan =
        buildProblemSolutionPlan({
          calculatorId:
            calculator.id,
          title:
            calculator.title,
          category:
            calculator.category,
          equationHint:
            guidance.equationHint,
          requiredInputs:
            guidance.requiredInputs,
          detectedInputs:
            readiness.detectedInputs,
          missingInputs:
            readiness.missingInputs,
          diagnostics:
            diagnostics.diagnostics,
          hasQuickSolution:
            Boolean(
              quickSolution,
            ),
        })

      const assumptionContext = {
        calculatorId:
          calculator.id,
        title:
          calculator.title,
        category:
          calculator.category,
        equationHint:
          guidance.equationHint,
        detectedInputs:
          readiness.detectedInputs,
        missingInputs:
          readiness.missingInputs,
        diagnostics:
          diagnostics.diagnostics,
        hasQuickSolution:
          Boolean(
            quickSolution,
          ),
      }

      const assumptions =
        buildProblemAssumptions(
          assumptionContext,
        )

      const verificationChecklist =
        buildProblemVerificationChecklist(
          assumptionContext,
        )

      const engineeringReport =
        buildProblemEngineeringReport({
          title:
            calculator.title,
          category:
            calculator.category,
          readinessPercent:
            readiness
              .readinessPercent,
          detectedInputs:
            readiness
              .detectedInputs,
          missingInputs:
            readiness
              .missingInputs,
          diagnostics:
            diagnostics
              .diagnostics,
          solutionPlan,
          assumptions,
          verificationChecklist,
          hasQuickSolution:
            Boolean(
              quickSolution,
            ),
        })

      const plannedGuidance =
        solutionPlan.length > 0
          ? `${diagnosticGuidance} Solution plan: ${solutionPlan
              .map(
                (
                  step,
                  index,
                ) =>
                  `${index + 1}. ${step}`,
              )
              .join(' ')}`
          : diagnosticGuidance

      const enrichedGuidance =
        [
          plannedGuidance,
          `Engineering report: ${engineeringReport.headline}. ${engineeringReport.summary}`,
          assumptions.length > 0
            ? `Assumptions: ${assumptions
                .map(
                  (
                    assumption,
                    index,
                  ) =>
                    `${index + 1}. ${assumption}`,
                )
                .join(' ')}`
            : '',
          verificationChecklist
            .length > 0
            ? `Verification checklist: ${verificationChecklist
                .map(
                  (
                    check,
                    index,
                  ) =>
                    `${index + 1}. ${check}`,
                )
                .join(' ')}`
            : '',
        ]
          .filter(
            (section) =>
              section.length >
              0,
          )
          .join(
            ' ',
          )

      return {
        calculatorId:
          calculator.id,
        title:
          calculator.title,
        category:
          calculator.category,
        score,
        confidence:
          confidenceForScore(
            score,
          ),
        reasons:
          [
            ...reasons,
            ...diagnosticReasons,
          ].slice(
            0,
            3,
          ),
        guidance:
          enrichedGuidance,
        requiredInputs:
          guidance.requiredInputs,
        equationHint:
          guidance.equationHint,
        detectedInputs:
          readiness.detectedInputs,
        missingInputs:
          readiness.missingInputs,
        readinessPercent:
          readiness
            .readinessPercent,
        diagnostics:
          diagnostics.diagnostics,
        solutionPlan,
        assumptions,
        verificationChecklist,
        engineeringReport,
        equationAssignments:
          equationParse.assignments,
        equationIntent,
        equationContext,
        quickSolution,
      }
    },
  )
}
