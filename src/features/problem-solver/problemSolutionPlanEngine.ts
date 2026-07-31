export type SolutionPlanDiagnosticSeverity =
  | 'error'
  | 'warning'

export interface SolutionPlanDiagnostic {
  severity:
    SolutionPlanDiagnosticSeverity
  message: string
}

export interface ProblemSolutionPlanContext {
  calculatorId: string
  title: string
  category: string
  equationHint: string
  requiredInputs: string[]
  detectedInputs: string[]
  missingInputs: string[]
  diagnostics:
    SolutionPlanDiagnostic[]
  hasQuickSolution: boolean
}

interface PlanProfile {
  calculatorIds?: string[]
  categories?: string[]
  titleSignals?: string[]
  steps: string[]
}

function normalize(
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
    .normalize(
      'NFD',
    )
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .replace(
      /[^a-z0-9\s-]/g,
      ' ',
    )
    .replace(
      /\s+/g,
      ' ',
    )
    .trim()
}

const PLAN_PROFILES:
  PlanProfile[] = [
    {
      calculatorIds: [
        'pressureDrop',
      ],
      titleSignals: [
        'pressure drop',
      ],
      steps: [
        'Determine the pipe geometry, fluid properties and flow condition on a consistent unit basis.',
        'Calculate velocity and Reynolds number, then select the appropriate friction-factor relation.',
        'Evaluate major and minor pressure losses using the selected flow model.',
        'Check the resulting pressure loss against the available pressure or pump head.',
      ],
    },
    {
      calculatorIds: [
        'pumpPower',
      ],
      titleSignals: [
        'pump power',
      ],
      steps: [
        'Establish the total required head from elevation, pressure and friction contributions.',
        'Calculate the hydraulic power from density, gravity, flow rate and total head.',
        'Correct hydraulic power using the stated pump efficiency.',
        'Confirm that efficiency, flow direction and pressure basis are physically valid.',
      ],
    },
    {
      calculatorIds: [
        'idealGas',
        'idealGasCalculator',
      ],
      titleSignals: [
        'ideal gas',
      ],
      steps: [
        'Convert temperature to Kelvin and pressure to an absolute-pressure basis.',
        'Select the unknown in PV = nRT and place all supplied data on a compatible unit basis.',
        'Solve the ideal-gas equation for the requested state variable.',
        'Check whether the resulting state is physically reasonable and whether non-ideal behavior may matter.',
      ],
    },
    {
      calculatorIds: [
        'heatExchangerLMTD',
        'heatExchangerAreaSizing',
      ],
      titleSignals: [
        'heat exchanger',
        'lmtd',
      ],
      steps: [
        'Confirm hot- and cold-stream inlet and outlet temperatures and the flow arrangement.',
        'Calculate both terminal temperature differences and verify that neither crosses zero.',
        'Evaluate the log-mean temperature difference and any required correction factor.',
        'Apply Q = UAFΔTlm and check the resulting duty or area against the process specification.',
      ],
    },
    {
      calculatorIds: [
        'cstr',
        'cstrVolume',
        'pfr',
        'pfrVolume',
        'batchReactor',
      ],
      categories: [
        'Reaction Engineering',
      ],
      titleSignals: [
        'cstr',
        'pfr',
        'reactor',
      ],
      steps: [
        'Write the stoichiometry and rate law using a clearly defined reaction and concentration basis.',
        'Relate concentration and molar flow to conversion through the reactor mole balance.',
        'Apply the selected batch, CSTR or PFR design equation.',
        'Check conversion limits, residence time and reactor volume for physical feasibility.',
      ],
    },
    {
      calculatorIds: [
        'ficksFirstLaw',
        'massTransferCoefficient',
      ],
      categories: [
        'Mass Transfer',
      ],
      titleSignals: [
        'fick',
        'diffusion',
        'mass transfer',
      ],
      steps: [
        'Define the transport direction, concentration basis and diffusion length.',
        'Confirm diffusivity, concentration difference and geometry using compatible units.',
        'Apply the appropriate Fick-law or mass-transfer-coefficient relation.',
        'Check the flux sign, driving-force direction and limiting assumptions.',
      ],
    },
    {
      categories: [
        'Numerical Methods',
      ],
      steps: [
        'Write the mathematical problem and specify the required solution interval or initial information.',
        'Select an algorithm appropriate for the equation, data structure and convergence behavior.',
        'Apply the requested tolerance, iteration limit and step-size controls.',
        'Verify convergence and compare the result against an independent residual or error measure.',
      ],
    },
    {
      categories: [
        'Process Safety & Economics',
      ],
      steps: [
        'Define the scenario, reference basis, time horizon and governing assumptions.',
        'Organize the required safety, probability or cash-flow inputs on a consistent basis.',
        'Apply the selected risk or discounted-cash-flow model.',
        'Perform a sensitivity check on the assumptions that most strongly influence the result.',
      ],
    },
  ]

function profileMatches(
  profile: PlanProfile,
  context:
    ProblemSolutionPlanContext,
): boolean {
  const cleanTitle =
    normalize(
      context.title,
    )

  const calculatorMatches =
    !profile.calculatorIds ||
    profile.calculatorIds.includes(
      context.calculatorId,
    )

  const categoryMatches =
    !profile.categories ||
    profile.categories.includes(
      context.category,
    )

  const titleMatches =
    !profile.titleSignals ||
    profile.titleSignals.some(
      (signal) =>
        cleanTitle.includes(
          normalize(
            signal,
          ),
        ),
    )

  return (
    calculatorMatches &&
    categoryMatches &&
    titleMatches
  )
}

function formatInputStep(
  context:
    ProblemSolutionPlanContext,
): string {
  if (
    context.missingInputs.length >
    0
  ) {
    return (
      `Collect or derive the missing inputs: ${
        context.missingInputs.join(
          ', ',
        )
      }.`
    )
  }

  if (
    context.detectedInputs.length >
    0
  ) {
    return (
      `Confirm the detected inputs and their units: ${
        context.detectedInputs.join(
          ', ',
        )
      }.`
    )
  }

  if (
    context.requiredInputs.length >
    0
  ) {
    return (
      `Define the required inputs: ${
        context.requiredInputs.join(
          ', ',
        )
      }.`
    )
  }

  return (
    'List the known variables, requested unknown and calculation basis.'
  )
}

function formatDiagnosticStep(
  context:
    ProblemSolutionPlanContext,
): string | null {
  const blocking =
    context.diagnostics.filter(
      (diagnostic) =>
        diagnostic.severity ===
        'error',
    )

  if (
    blocking.length >
    0
  ) {
    return (
      `Resolve the blocking input issues before calculating: ${
        blocking
          .map(
            (diagnostic) =>
              diagnostic.message,
          )
          .join(
            ' ',
          )
      }`
    )
  }

  const warnings =
    context.diagnostics.filter(
      (diagnostic) =>
        diagnostic.severity ===
        'warning',
    )

  if (
    warnings.length >
    0
  ) {
    return (
      `Review the engineering warnings before accepting the result: ${
        warnings
          .map(
            (diagnostic) =>
              diagnostic.message,
          )
          .join(
            ' ',
          )
      }`
    )
  }

  return null
}

function formatEquationStep(
  equationHint: string,
): string {
  const cleanHint =
    equationHint.trim()

  if (!cleanHint) {
    return (
      'Apply the governing equation documented by the selected calculator.'
    )
  }

  return (
    `Apply the governing relation: ${cleanHint}`
  )
}

function deduplicateSteps(
  steps: string[],
): string[] {
  const seen =
    new Set<string>()

  return steps.filter(
    (step) => {
      const cleanStep =
        step.trim()

      if (
        !cleanStep ||
        seen.has(
          cleanStep,
        )
      ) {
        return false
      }

      seen.add(
        cleanStep,
      )

      return true
    },
  )
}

export function buildProblemSolutionPlan(
  context:
    ProblemSolutionPlanContext,
): string[] {
  const profile =
    PLAN_PROFILES.find(
      (candidate) =>
        profileMatches(
          candidate,
          context,
        ),
    )

  const diagnosticStep =
    formatDiagnosticStep(
      context,
    )

  const domainSteps =
    profile?.steps ?? [
      'Define the calculation basis, requested unknown and governing assumptions.',
      formatEquationStep(
        context.equationHint,
      ),
      'Solve the governing relation using a consistent unit system.',
      'Check dimensions, significant figures and physical plausibility.',
    ]

  const steps = [
    `Define the target calculation for ${context.title}.`,
    formatInputStep(
      context,
    ),
    diagnosticStep ?? '',
    ...domainSteps,
  ]

  if (
    context.hasQuickSolution
  ) {
    steps.push(
      'Compare the generated Quick Solve result with the governing equation and input assumptions.',
    )
  } else {
    steps.push(
      formatEquationStep(
        context.equationHint,
      ),
    )
  }

  steps.push(
    'Verify units, signs, order of magnitude and the physical meaning of the final result.',
  )

  return deduplicateSteps(
    steps,
  ).slice(
    0,
    7,
  )
}
