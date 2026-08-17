export const SECOND_FIVE_NATIVE_CALCULATOR_IDS = [
  'evaporatorBalance',
  'massBalance',
  'phaseChangeEnergyBalance',
  'sensibleHeatBalance',
  'flowRate',
] as const

export type SecondFiveNativeCalculatorId =
  (typeof SECOND_FIVE_NATIVE_CALCULATOR_IDS)[number]

export interface SecondFiveFieldDefinition {
  key: string
  label: string
  unit: string
  initial: string
}

export interface SecondFiveCalculatorDefinition {
  id: SecondFiveNativeCalculatorId
  code: string
  category: string
  icon: string
  title: string
  subtitle: string
  referenceBasis: string
  formula: string
  outputLabel: string
  outputUnit: string
  fields: SecondFiveFieldDefinition[]
  calculate: (
    values: Record<string, number>,
  ) => number
  interpret: (
    result: number,
  ) => string
}

export class SecondFiveCalculatorError extends Error {}

const DEFINITIONS: Record<
  SecondFiveNativeCalculatorId,
  SecondFiveCalculatorDefinition
> = {
  evaporatorBalance: {
    id: 'evaporatorBalance',
    code: 'MEB–09',
    category: 'Material & Energy Balances',
    icon: 'V',
    title: 'Evaporator Balance',
    subtitle:
      'Determine evaporated solvent from a nonvolatile-solute balance',
    referenceBasis:
      'Felder, Rousseau & Bullard · Elementary Principles of Chemical Processes',
    formula:
      'P = F xF/xP; V = F − P',
    outputLabel:
      'Evaporated solvent',
    outputUnit:
      'kg/h',
    fields: [
      {
        key: 'feed',
        label: 'Feed flow',
        unit: 'kg/h',
        initial: '1000',
      },
      {
        key: 'feedSolids',
        label: 'Feed solids fraction',
        unit: '—',
        initial: '0.12',
      },
      {
        key: 'productSolids',
        label: 'Product solids fraction',
        unit: '—',
        initial: '0.40',
      },
    ],
    calculate: (values) =>
      values.feed -
      values.feed *
        values.feedSolids /
        values.productSolids,
    interpret: () =>
      'Single nonvolatile-solute balance with solute-free vapor',
  },

  massBalance: {
    id: 'massBalance',
    code: 'MEB–01',
    category: 'Material & Energy Balances',
    icon: '⇄',
    title: 'Steady-State Mass Balance',
    subtitle:
      'Determine the remaining outlet from feed and product flows',
    referenceBasis:
      'Felder, Rousseau & Bullard · Elementary Principles of Chemical Processes',
    formula:
      'ṁwaste = ṁfeed − ṁproduct',
    outputLabel:
      'Remaining outlet flow',
    outputUnit:
      'kg/h',
    fields: [
      {
        key: 'feed',
        label: 'Feed flow',
        unit: 'kg/h',
        initial: '1250',
      },
      {
        key: 'product',
        label: 'Product flow',
        unit: 'kg/h',
        initial: '930',
      },
    ],
    calculate: (values) =>
      values.feed -
      values.product,
    interpret: (result) =>
      result > 0
        ? 'Balanced secondary outlet'
        : 'Specified product exceeds feed',
  },

  phaseChangeEnergyBalance: {
    id: 'phaseChangeEnergyBalance',
    code: 'MEB–18',
    category: 'Material & Energy Balances',
    icon: 'λ',
    title: 'Phase-Change Energy Balance',
    subtitle:
      'Calculate latent heat duty at a specified phase-change flow',
    referenceBasis:
      'Felder, Rousseau & Bullard · Elementary Principles of Chemical Processes',
    formula:
      'Q̇ = ṁ ΔHph',
    outputLabel:
      'Latent heat duty',
    outputUnit:
      'kW',
    fields: [
      {
        key: 'massFlow',
        label: 'Phase-change flow',
        unit: 'kg/s',
        initial: '0.75',
      },
      {
        key: 'latentHeat',
        label: 'Latent heat',
        unit: 'kJ/kg',
        initial: '2257',
      },
    ],
    calculate: (values) =>
      values.massFlow *
      values.latentHeat,
    interpret: () =>
      'Isothermal phase-change duty on the specified latent-heat basis',
  },

  sensibleHeatBalance: {
    id: 'sensibleHeatBalance',
    code: 'MEB–22',
    category: 'Material & Energy Balances',
    icon: 'ΔT',
    title: 'Sensible Heat Balance',
    subtitle:
      'Calculate sensible heating or cooling duty',
    referenceBasis:
      'Felder, Rousseau & Bullard · Elementary Principles of Chemical Processes',
    formula:
      'Q̇ = ṁ Cp (T₂ − T₁)',
    outputLabel:
      'Sensible heat duty',
    outputUnit:
      'kW',
    fields: [
      {
        key: 'massFlow',
        label: 'Mass flow',
        unit: 'kg/s',
        initial: '2.4',
      },
      {
        key: 'heatCapacity',
        label: 'Heat capacity',
        unit: 'kJ/kg·K',
        initial: '4.18',
      },
      {
        key: 'temperatureIn',
        label: 'Inlet temperature',
        unit: '°C',
        initial: '25',
      },
      {
        key: 'temperatureOut',
        label: 'Outlet temperature',
        unit: '°C',
        initial: '80',
      },
    ],
    calculate: (values) =>
      values.massFlow *
      values.heatCapacity *
      (
        values.temperatureOut -
        values.temperatureIn
      ),
    interpret: (result) =>
      result >= 0
        ? 'Heat added to the stream'
        : 'Heat removed from the stream',
  },

  flowRate: {
    id: 'flowRate',
    code: 'FM–17',
    category: 'Fluid Mechanics',
    icon: '⇥',
    title: 'Volumetric & Mass Flow Rate',
    subtitle:
      'Calculate mass flow from pipe diameter, velocity, and density',
    referenceBasis:
      'Çengel & Cimbala · Fluid Mechanics',
    formula:
      'Q = (πD²/4)v; ṁ = ρQ',
    outputLabel:
      'Mass flow rate',
    outputUnit:
      'kg/s',
    fields: [
      {
        key: 'diameter',
        label: 'Pipe diameter',
        unit: 'm',
        initial: '0.10',
      },
      {
        key: 'velocity',
        label: 'Mean velocity',
        unit: 'm/s',
        initial: '2.0',
      },
      {
        key: 'density',
        label: 'Fluid density',
        unit: 'kg/m³',
        initial: '998.2',
      },
    ],
    calculate: (values) =>
      values.density *
      Math.PI *
      values.diameter ** 2 /
      4 *
      values.velocity,
    interpret: (result) =>
      `${result.toFixed(3)} kg/s from area × velocity`,
  },
}

export function getSecondFiveCalculatorDefinition(
  calculatorId: SecondFiveNativeCalculatorId,
): SecondFiveCalculatorDefinition {
  return DEFINITIONS[calculatorId]
}

export function calculateSecondFiveCalculator(
  calculatorId: SecondFiveNativeCalculatorId,
  values: Record<string, number>,
): number {
  const definition =
    DEFINITIONS[calculatorId]

  for (
    const field
    of definition.fields
  ) {
    const value =
      values[field.key]

    const temperatureField =
      calculatorId ===
        'sensibleHeatBalance' &&
      (
        field.key ===
          'temperatureIn' ||
        field.key ===
          'temperatureOut'
      )

    if (
      !Number.isFinite(value) ||
      (
        !temperatureField &&
        value <= 0
      )
    ) {
      throw new SecondFiveCalculatorError(
        `Enter a valid value for ${field.label}.`,
      )
    }
  }

  if (
    calculatorId ===
    'evaporatorBalance'
  ) {
    if (
      values.feedSolids >= 1 ||
      values.productSolids > 1 ||
      values.productSolids <=
        values.feedSolids
    ) {
      throw new SecondFiveCalculatorError(
        'Use 0 < feed solids < product solids ≤ 1.',
      )
    }
  }

  if (
    calculatorId ===
      'massBalance' &&
    values.product >
      values.feed
  ) {
    throw new SecondFiveCalculatorError(
      'Product flow cannot exceed feed flow on this balance basis.',
    )
  }

  const result =
    definition.calculate(
      values,
    )

  if (
    !Number.isFinite(result)
  ) {
    throw new SecondFiveCalculatorError(
      'The supplied values do not produce a finite engineering result.',
    )
  }

  return result
}
