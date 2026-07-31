export type EngineeringDiagnosticSeverity =
  | 'error'
  | 'warning'

export interface EngineeringDiagnosticSummary {
  severity:
    EngineeringDiagnosticSeverity
  message: string
}

export interface ProblemAssumptionContext {
  calculatorId: string
  title: string
  category: string
  equationHint: string
  detectedInputs: string[]
  missingInputs: string[]
  diagnostics:
    EngineeringDiagnosticSummary[]
  hasQuickSolution: boolean
}

interface EngineeringProfile {
  calculatorIds?: string[]
  categories?: string[]
  assumptions: string[]
  verificationChecks: string[]
}

const ENGINEERING_PROFILES:
  EngineeringProfile[] = [
    {
      calculatorIds: [
        'pressureDrop',
      ],
      assumptions: [
        'The flow is steady, one-dimensional and fully developed through the evaluated pipe section.',
        'The fluid is treated as single-phase, Newtonian and effectively incompressible.',
        'Pipe diameter, roughness and fluid properties remain constant over the calculation length.',
      ],
      verificationChecks: [
        'Confirm that the Reynolds-number regime matches the selected friction-factor relation.',
        'Check whether major and minor losses have both been included where applicable.',
        'Compare the calculated pressure loss with the available system pressure or pump head.',
      ],
    },
    {
      calculatorIds: [
        'pumpPower',
      ],
      assumptions: [
        'The pump operates at steady state with a single-phase incompressible fluid.',
        'Flow rate, total head and efficiency refer to the same operating point.',
        'Pump efficiency is expressed as a fraction between 0 and 1.',
      ],
      verificationChecks: [
        'Confirm that static, pressure and friction-head contributions use the same reference basis.',
        'Check that hydraulic power is lower than the required shaft power.',
        'Review cavitation and NPSH separately when suction conditions are relevant.',
      ],
    },
    {
      calculatorIds: [
        'idealGas',
        'idealGasCalculator',
      ],
      assumptions: [
        'The gas follows ideal-gas behavior at the stated pressure and temperature.',
        'Pressure is absolute and temperature is expressed in Kelvin.',
        'The gas state is spatially uniform and at thermodynamic equilibrium.',
      ],
      verificationChecks: [
        'Substitute the calculated state variable back into PV = nRT.',
        'Confirm that pressure and volume units match the selected gas constant.',
        'Check whether high pressure or low temperature could require a real-gas model.',
      ],
    },
    {
      calculatorIds: [
        'heatExchangerLMTD',
        'heatExchangerAreaSizing',
      ],
      assumptions: [
        'The heat exchanger operates at steady state.',
        'Heat loss to the surroundings is negligible unless explicitly included.',
        'The overall heat-transfer coefficient is treated as constant over the exchanger.',
        'No unmodelled phase change occurs within either stream.',
      ],
      verificationChecks: [
        'Confirm that both terminal temperature differences remain positive.',
        'Check that hot- and cold-stream duties agree within the expected tolerance.',
        'Apply an LMTD correction factor when the configuration is not true counter-current or parallel flow.',
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
      assumptions: [
        'The selected ideal-reactor model represents the actual mixing and flow pattern.',
        'The supplied rate law and kinetic parameters are valid over the evaluated operating range.',
        'Stoichiometry and concentration relationships use one consistent reaction basis.',
        'Temperature and density remain constant unless an energy or expansion model is included.',
      ],
      verificationChecks: [
        'Verify the reactor mole balance by substituting the calculated conversion or volume.',
        'Check that conversion remains within physically attainable limits.',
        'Review residence time, heat removal and mixing limitations before equipment sizing.',
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
      assumptions: [
        'Mass transfer is one-dimensional in the defined transport direction.',
        'Diffusivity and relevant physical properties remain constant.',
        'The stated concentration difference represents the active driving force.',
        'Steady diffusion is assumed unless a transient model is explicitly selected.',
      ],
      verificationChecks: [
        'Confirm that the flux sign agrees with the concentration-gradient direction.',
        'Check that diffusivity, distance and concentration units form the expected flux units.',
        'Review convection, reaction and interfacial resistances that may be absent from the simplified model.',
      ],
    },
    {
      categories: [
        'Numerical Methods',
      ],
      assumptions: [
        'The mathematical function and supplied data are valid over the requested solution interval.',
        'The selected method is applicable to the continuity, smoothness and conditioning of the problem.',
        'Tolerance and iteration limits are sufficiently strict for the intended engineering decision.',
      ],
      verificationChecks: [
        'Evaluate the residual using the computed numerical solution.',
        'Repeat the calculation with a tighter tolerance or smaller step size.',
        'Compare against an independent method or analytical benchmark where available.',
      ],
    },
    {
      categories: [
        'Process Safety & Economics',
      ],
      assumptions: [
        'The scenario, reference basis and evaluation period are explicitly defined.',
        'Probability, consequence and financial inputs correspond to the same operating case.',
        'Future values and uncertainties follow the stated escalation, discount and risk assumptions.',
      ],
      verificationChecks: [
        'Perform sensitivity analysis on the highest-impact assumptions.',
        'Confirm that probabilities, frequencies and monetary values use compatible time bases.',
        'Compare the result with an independent benchmark, historical case or company criterion.',
      ],
    },
  ]

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
    .normalize(
      'NFD',
    )
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .trim()
}

function profileMatches(
  profile: EngineeringProfile,
  context:
    ProblemAssumptionContext,
): boolean {
  const calculatorMatches =
    !profile.calculatorIds ||
    profile.calculatorIds.includes(
      context.calculatorId,
    )

  const categoryMatches =
    !profile.categories ||
    profile.categories.some(
      (category) =>
        normalizeText(
          category,
        ) ===
        normalizeText(
          context.category,
        ),
    )

  return (
    calculatorMatches &&
    categoryMatches
  )
}

function deduplicate(
  values: string[],
): string[] {
  const seen =
    new Set<string>()

  return values.filter(
    (value) => {
      const cleanValue =
        value.trim()

      if (
        !cleanValue ||
        seen.has(
          cleanValue,
        )
      ) {
        return false
      }

      seen.add(
        cleanValue,
      )

      return true
    },
  )
}

function findProfile(
  context:
    ProblemAssumptionContext,
): EngineeringProfile | undefined {
  return ENGINEERING_PROFILES.find(
    (profile) =>
      profileMatches(
        profile,
        context,
      ),
  )
}

export function buildProblemAssumptions(
  context:
    ProblemAssumptionContext,
): string[] {
  const profile =
    findProfile(
      context,
    )

  const assumptions = [
    'All supplied values refer to one consistent calculation basis and operating case.',
    'Material properties are evaluated at the stated or representative operating condition.',
    'Missing numerical values are not silently estimated by the solver.',
    ...(profile?.assumptions ?? [
      'The governing calculator model and its documented limitations are applicable to the stated problem.',
      'Secondary physical effects are neglected unless they are explicitly represented by the selected calculator.',
    ]),
  ]

  if (
    context.missingInputs.length >
    0
  ) {
    assumptions.push(
      `The calculation remains incomplete until these inputs are supplied: ${
        context.missingInputs.join(
          ', ',
        )
      }.`,
    )
  }

  if (
    context.diagnostics.some(
      (diagnostic) =>
        diagnostic.severity ===
        'error',
    )
  ) {
    assumptions.push(
      'No valid numerical result should be accepted while blocking engineering diagnostics remain unresolved.',
    )
  }

  return deduplicate(
    assumptions,
  ).slice(
    0,
    7,
  )
}

export function buildProblemVerificationChecklist(
  context:
    ProblemAssumptionContext,
): string[] {
  const profile =
    findProfile(
      context,
    )

  const checks = [
    'Confirm that every input has been converted to a mutually compatible unit system.',
    'Check the dimensions of the governing equation and final reported quantity.',
    ...(profile?.verificationChecks ?? [
      'Substitute the calculated result back into the governing relation.',
      'Compare the result with a realistic engineering range or independent estimate.',
    ]),
    'Review sign convention, significant figures and order of magnitude.',
  ]

  if (
    context.missingInputs.length >
    0
  ) {
    checks.unshift(
      `Resolve the missing inputs before final validation: ${
        context.missingInputs.join(
          ', ',
        )
      }.`,
    )
  }

  const blockingDiagnostics =
    context.diagnostics.filter(
      (diagnostic) =>
        diagnostic.severity ===
        'error',
    )

  if (
    blockingDiagnostics.length >
    0
  ) {
    checks.unshift(
      `Resolve each blocking diagnostic: ${
        blockingDiagnostics
          .map(
            (diagnostic) =>
              diagnostic.message,
          )
          .join(
            ' ',
          )
      }`,
    )
  }

  const warningDiagnostics =
    context.diagnostics.filter(
      (diagnostic) =>
        diagnostic.severity ===
        'warning',
    )

  if (
    warningDiagnostics.length >
    0
  ) {
    checks.push(
      `Review the engineering warnings before accepting the result: ${
        warningDiagnostics
          .map(
            (diagnostic) =>
              diagnostic.message,
          )
          .join(
            ' ',
          )
      }`,
    )
  }

  if (
    context.hasQuickSolution
  ) {
    checks.push(
      'Recalculate at least one intermediate value independently from the generated Quick Solve result.',
    )
  }

  return deduplicate(
    checks,
  ).slice(
    0,
    8,
  )
}
