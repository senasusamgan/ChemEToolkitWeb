export const TOP_FIVE_NATIVE_CALCULATOR_IDS = [
  'heatExchangerEnergyBalance',
  'activationEnergyTwoPoint',
  'adiabaticMixingTemperature',
  'doublePipeHeatExchanger',
  'dryerBalance',
] as const

export type TopFiveNativeCalculatorId =
  (typeof TOP_FIVE_NATIVE_CALCULATOR_IDS)[number]

export interface MigratedFieldDefinition {
  key: string
  label: string
  unit: string
  initial: string
}

export interface MigratedCalculatorDefinition {
  id: TopFiveNativeCalculatorId
  code: string
  category: string
  icon: string
  title: string
  subtitle: string
  referenceBasis: string
  formula: string
  outputLabel: string
  outputUnit: string
  fields: MigratedFieldDefinition[]
  calculate: (
    values: Record<string, number>,
  ) => number
  interpret: (
    result: number,
  ) => string
}

export class TopFiveLegacyCalculatorError extends Error {}

const DEFINITIONS: Record<
  TopFiveNativeCalculatorId,
  MigratedCalculatorDefinition
> = {
  heatExchangerEnergyBalance: {
    id: 'heatExchangerEnergyBalance',
    code: 'MEB–12',
    category: 'Material & Energy Balances',
    icon: 'Q',
    title: 'Heat Exchanger Energy Balance',
    subtitle:
      'Calculate steady sensible heat transfer from a hot stream',
    referenceBasis:
      'Felder, Rousseau & Bullard · Elementary Principles of Chemical Processes',
    formula:
      'Q̇ = ṁ Cp (Tin − Tout)',
    outputLabel:
      'Heat transferred',
    outputUnit:
      'kW',
    fields: [
      {
        key: 'massFlow',
        label: 'Hot-stream flow',
        unit: 'kg/s',
        initial: '2.5',
      },
      {
        key: 'heatCapacity',
        label: 'Heat capacity',
        unit: 'kJ/kg·K',
        initial: '4.18',
      },
      {
        key: 'inletTemperature',
        label: 'Hot inlet',
        unit: '°C',
        initial: '90',
      },
      {
        key: 'outletTemperature',
        label: 'Hot outlet',
        unit: '°C',
        initial: '55',
      },
    ],
    calculate: (values) =>
      values.massFlow *
      values.heatCapacity *
      (
        values.inletTemperature -
        values.outletTemperature
      ),
    interpret: () =>
      'Steady state · negligible heat loss and phase change',
  },

  activationEnergyTwoPoint: {
    id: 'activationEnergyTwoPoint',
    code: 'RE–13',
    category: 'Reaction Engineering',
    icon: '⚗',
    title: 'Activation Energy from Two Temperatures',
    subtitle:
      'Estimate Arrhenius activation energy from two rate constants',
    referenceBasis:
      'Fogler · Elements of Chemical Reaction Engineering',
    formula:
      'Eₐ = R ln(k₂/k₁)/(1/T₁ − 1/T₂)',
    outputLabel:
      'Activation energy',
    outputUnit:
      'J/mol',
    fields: [
      {
        key: 'rateConstantOne',
        label: 'Rate constant k₁',
        unit: 'consistent',
        initial: '0.015',
      },
      {
        key: 'temperatureOne',
        label: 'Temperature T₁',
        unit: 'K',
        initial: '300',
      },
      {
        key: 'rateConstantTwo',
        label: 'Rate constant k₂',
        unit: 'consistent',
        initial: '0.085',
      },
      {
        key: 'temperatureTwo',
        label: 'Temperature T₂',
        unit: 'K',
        initial: '340',
      },
    ],
    calculate: (values) =>
      8.314462618 *
      Math.log(
        values.rateConstantTwo /
        values.rateConstantOne,
      ) /
      (
        1 / values.temperatureOne -
        1 / values.temperatureTwo
      ),
    interpret: (result) =>
      `${(result / 1000).toFixed(2)} kJ/mol Arrhenius activation energy`,
  },

  adiabaticMixingTemperature: {
    id: 'adiabaticMixingTemperature',
    code: 'MEB–01',
    category: 'Material & Energy Balances',
    icon: 'Tₘ',
    title: 'Adiabatic Mixing Temperature',
    subtitle:
      'Calculate the mixed temperature of two adiabatic streams',
    referenceBasis:
      'Felder, Rousseau & Bullard · Elementary Principles of Chemical Processes',
    formula:
      'Tₘ = (ṁ₁cₚ₁T₁ + ṁ₂cₚ₂T₂)/(ṁ₁cₚ₁ + ṁ₂cₚ₂)',
    outputLabel:
      'Adiabatic mixed temperature',
    outputUnit:
      '°C',
    fields: [
      {
        key: 'flowOne',
        label: 'Stream 1 mass flow',
        unit: 'kg/s',
        initial: '2.0',
      },
      {
        key: 'cpOne',
        label: 'Stream 1 heat capacity',
        unit: 'kJ/kg·K',
        initial: '4.18',
      },
      {
        key: 'temperatureOne',
        label: 'Stream 1 temperature',
        unit: '°C',
        initial: '80',
      },
      {
        key: 'flowTwo',
        label: 'Stream 2 mass flow',
        unit: 'kg/s',
        initial: '3.0',
      },
      {
        key: 'cpTwo',
        label: 'Stream 2 heat capacity',
        unit: 'kJ/kg·K',
        initial: '4.18',
      },
      {
        key: 'temperatureTwo',
        label: 'Stream 2 temperature',
        unit: '°C',
        initial: '20',
      },
    ],
    calculate: (values) =>
      (
        values.flowOne *
          values.cpOne *
          values.temperatureOne +
        values.flowTwo *
          values.cpTwo *
          values.temperatureTwo
      ) /
      (
        values.flowOne *
          values.cpOne +
        values.flowTwo *
          values.cpTwo
      ),
    interpret: () =>
      'Steady adiabatic mixer with negligible kinetic and potential-energy changes',
  },

  doublePipeHeatExchanger: {
    id: 'doublePipeHeatExchanger',
    code: 'HT–27',
    category: 'Heat Transfer',
    icon: '♨',
    title: 'Double-Pipe Heat Exchanger',
    subtitle:
      'Calculate counter-current heat duty using the LMTD method',
    referenceBasis:
      'Incropera, DeWitt, Bergman & Lavine · Fundamentals of Heat and Mass Transfer',
    formula:
      'Q̇ = UA·LMTD (counter-current)',
    outputLabel:
      'Heat duty',
    outputUnit:
      'W',
    fields: [
      {
        key: 'coefficient',
        label: 'Overall U',
        unit: 'W/m²·K',
        initial: '420',
      },
      {
        key: 'area',
        label: 'Transfer area',
        unit: 'm²',
        initial: '12',
      },
      {
        key: 'hotIn',
        label: 'Hot inlet temperature',
        unit: '°C',
        initial: '150',
      },
      {
        key: 'hotOut',
        label: 'Hot outlet temperature',
        unit: '°C',
        initial: '90',
      },
      {
        key: 'coldIn',
        label: 'Cold inlet temperature',
        unit: '°C',
        initial: '25',
      },
      {
        key: 'coldOut',
        label: 'Cold outlet temperature',
        unit: '°C',
        initial: '70',
      },
    ],
    calculate: (values) => {
      const deltaOne =
        values.hotIn -
        values.coldOut

      const deltaTwo =
        values.hotOut -
        values.coldIn

      const lmtd =
        (
          deltaOne -
          deltaTwo
        ) /
        Math.log(
          deltaOne /
          deltaTwo,
        )

      return (
        values.coefficient *
        values.area *
        lmtd
      )
    },
    interpret: (result) =>
      `${(result / 1000).toFixed(2)} kW counter-current duty`,
  },

  dryerBalance: {
    id: 'dryerBalance',
    code: 'MEB–12',
    category: 'Material & Energy Balances',
    icon: '⇄',
    title: 'Dryer Balance',
    subtitle:
      'Determine evaporated water from dry-solids conservation',
    referenceBasis:
      'Felder, Rousseau & Bullard · Elementary Principles of Chemical Processes',
    formula:
      'P = F(1−xf)/(1−xp); W = F−P',
    outputLabel:
      'Water evaporated',
    outputUnit:
      'kg/h',
    fields: [
      {
        key: 'wetFeed',
        label: 'Wet feed',
        unit: 'kg/h',
        initial: '1000',
      },
      {
        key: 'feedMoisture',
        label: 'Feed moisture',
        unit: 'fraction',
        initial: '0.30',
      },
      {
        key: 'productMoisture',
        label: 'Product moisture',
        unit: 'fraction',
        initial: '0.05',
      },
    ],
    calculate: (values) =>
      values.wetFeed -
      values.wetFeed *
        (
          1 -
          values.feedMoisture
        ) /
        (
          1 -
          values.productMoisture
        ),
    interpret: () =>
      'Dry solids are conserved across the dryer',
  },
}

export function isTopFiveNativeCalculatorId(
  value: string,
): value is TopFiveNativeCalculatorId {
  return (
    TOP_FIVE_NATIVE_CALCULATOR_IDS as readonly string[]
  ).includes(value)
}

export function getTopFiveCalculatorDefinition(
  calculatorId: TopFiveNativeCalculatorId,
): MigratedCalculatorDefinition {
  return DEFINITIONS[calculatorId]
}

function validatePositiveFiniteInputs(
  definition: MigratedCalculatorDefinition,
  values: Record<string, number>,
): void {
  for (
    const field
    of definition.fields
  ) {
    const value =
      values[field.key]

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {
      throw new TopFiveLegacyCalculatorError(
        `Enter a positive, finite value for ${field.label}.`,
      )
    }
  }
}

export function calculateTopFiveCalculator(
  calculatorId: TopFiveNativeCalculatorId,
  values: Record<string, number>,
): number {
  const definition =
    DEFINITIONS[calculatorId]

  validatePositiveFiniteInputs(
    definition,
    values,
  )

  if (
    calculatorId ===
      'activationEnergyTwoPoint' &&
    values.temperatureOne ===
      values.temperatureTwo
  ) {
    throw new TopFiveLegacyCalculatorError(
      'The two temperatures must be different.',
    )
  }

  if (
    calculatorId ===
    'dryerBalance'
  ) {
    if (
      values.feedMoisture > 1 ||
      values.productMoisture >= 1 ||
      values.productMoisture >=
        values.feedMoisture
    ) {
      throw new TopFiveLegacyCalculatorError(
        'Fractions must remain between 0 and 1 and satisfy the stated process direction.',
      )
    }
  }

  if (
    calculatorId ===
    'doublePipeHeatExchanger'
  ) {
    const deltaOne =
      values.hotIn -
      values.coldOut

    const deltaTwo =
      values.hotOut -
      values.coldIn

    if (
      deltaOne <= 0 ||
      deltaTwo <= 0
    ) {
      throw new TopFiveLegacyCalculatorError(
        'Both counter-current terminal temperature differences must be positive.',
      )
    }
  }

  const result =
    definition.calculate(
      values,
    )

  if (
    !Number.isFinite(result)
  ) {
    throw new TopFiveLegacyCalculatorError(
      'The supplied values do not produce a finite engineering result.',
    )
  }

  return result
}
