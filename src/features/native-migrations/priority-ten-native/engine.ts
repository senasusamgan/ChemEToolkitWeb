export const PRIORITY_TEN_NATIVE_CALCULATOR_IDS = [
  'bernoulliEquation',
  'binarySeparatorBalance',
  'boilingHeatTransfer',
  'bypassMixingBalance',
  'combustionAirRequirement',
  'condensationHeatTransfer',
  'condenserBalance',
  'convectionHeatTransfer',
  'reactionPerformanceBalance',
  'criticalDepth',
] as const

export type PriorityTenNativeCalculatorId =
  (typeof PRIORITY_TEN_NATIVE_CALCULATOR_IDS)[number]

export interface PriorityTenFieldDefinition {
  key: string
  label: string
  unit: string
  initial: string
}

export interface PriorityTenCalculatorDefinition {
  id: PriorityTenNativeCalculatorId
  code: string
  category: string
  icon: string
  title: string
  subtitle: string
  referenceBasis: string
  formula: string
  outputLabel: string
  outputUnit: string
  fields: PriorityTenFieldDefinition[]
  calculate: (
    values: Record<string, number>,
  ) => number
  interpret: (
    result: number,
  ) => string
}

export class PriorityTenCalculatorError extends Error {}

const DEFINITIONS: Record<
  PriorityTenNativeCalculatorId,
  PriorityTenCalculatorDefinition
> = {
  bernoulliEquation: {
    id: 'bernoulliEquation',
    code: 'FM–02',
    category: 'Fluid Mechanics',
    icon: 'H',
    title: 'Bernoulli Equation & Energy Head',
    subtitle:
      'Combine pressure, velocity, and elevation heads on one basis',
    referenceBasis:
      'Çengel & Cimbala · Fluid Mechanics',
    formula:
      'H = P/(ρg) + v²/(2g) + z',
    outputLabel:
      'Total energy head',
    outputUnit:
      'm',
    fields: [
      {
        key: 'pressure',
        label: 'Pressure',
        unit: 'Pa',
        initial: '200000',
      },
      {
        key: 'density',
        label: 'Density',
        unit: 'kg/m³',
        initial: '998.2',
      },
      {
        key: 'velocity',
        label: 'Velocity',
        unit: 'm/s',
        initial: '3.0',
      },
      {
        key: 'elevation',
        label: 'Elevation',
        unit: 'm',
        initial: '8.0',
      },
    ],
    calculate: (values) =>
      values.pressure /
        (
          values.density *
          9.80665
        ) +
      values.velocity ** 2 /
        (
          2 *
          9.80665
        ) +
      values.elevation,
    interpret: () =>
      'Pressure, velocity and elevation head on a common basis',
  },

  binarySeparatorBalance: {
    id: 'binarySeparatorBalance',
    code: 'MB–04',
    category: 'Material & Energy Balances',
    icon: '⇄',
    title: 'Binary Separator Balance',
    subtitle:
      'Solve total and component balances for an enriched product',
    referenceBasis:
      'Felder, Rousseau & Bullard · Elementary Principles of Chemical Processes',
    formula:
      'D = F(zF − xB)/(xD − xB)',
    outputLabel:
      'Product flow',
    outputUnit:
      'kg/h',
    fields: [
      {
        key: 'feedFlow',
        label: 'Feed flow',
        unit: 'kg/h',
        initial: '1000',
      },
      {
        key: 'feedFraction',
        label: 'Feed mass fraction A',
        unit: 'fraction',
        initial: '0.40',
      },
      {
        key: 'distillateFraction',
        label: 'Product mass fraction A',
        unit: 'fraction',
        initial: '0.90',
      },
      {
        key: 'bottomsFraction',
        label: 'Bottoms mass fraction A',
        unit: 'fraction',
        initial: '0.10',
      },
    ],
    calculate: (values) =>
      values.feedFlow *
      (
        values.feedFraction -
        values.bottomsFraction
      ) /
      (
        values.distillateFraction -
        values.bottomsFraction
      ),
    interpret: () =>
      'Binary total and component balances solved for the enriched product',
  },

  boilingHeatTransfer: {
    id: 'boilingHeatTransfer',
    code: 'HT–25',
    category: 'Heat Transfer',
    icon: '♨',
    title: 'Boiling Heat Transfer',
    subtitle:
      'Calculate boiling duty from an imposed boiling coefficient',
    referenceBasis:
      'Incropera, DeWitt, Bergman & Lavine · Fundamentals of Heat and Mass Transfer',
    formula:
      'Q̇ = hA(Ts − Tsat)',
    outputLabel:
      'Boiling heat rate',
    outputUnit:
      'W',
    fields: [
      {
        key: 'coefficient',
        label: 'Boiling coefficient',
        unit: 'W/m²·K',
        initial: '6500',
      },
      {
        key: 'surfaceTemperature',
        label: 'Surface temperature',
        unit: '°C',
        initial: '112',
      },
      {
        key: 'saturationTemperature',
        label: 'Saturation temperature',
        unit: '°C',
        initial: '100',
      },
      {
        key: 'area',
        label: 'Heated area',
        unit: 'm²',
        initial: '0.80',
      },
    ],
    calculate: (values) =>
      values.coefficient *
      values.area *
      (
        values.surfaceTemperature -
        values.saturationTemperature
      ),
    interpret: (result) =>
      `${(result / 1000).toFixed(2)} kW using the supplied boiling coefficient`,
  },

  bypassMixingBalance: {
    id: 'bypassMixingBalance',
    code: 'MB–05',
    category: 'Material & Energy Balances',
    icon: '⇄',
    title: 'Bypass Mixing Balance',
    subtitle:
      'Determine bypass fraction from feed, processed, and target properties',
    referenceBasis:
      'Felder, Rousseau & Bullard · Elementary Principles of Chemical Processes',
    formula:
      'b = (Pp − Pt)/(Pp − Pf)',
    outputLabel:
      'Bypass fraction',
    outputUnit:
      '',
    fields: [
      {
        key: 'feedProperty',
        label: 'Feed property',
        unit: 'basis unit',
        initial: '20',
      },
      {
        key: 'processedProperty',
        label: 'Processed-stream property',
        unit: 'basis unit',
        initial: '80',
      },
      {
        key: 'targetProperty',
        label: 'Mixed-product property',
        unit: 'basis unit',
        initial: '50',
      },
    ],
    calculate: (values) =>
      (
        values.processedProperty -
        values.targetProperty
      ) /
      (
        values.processedProperty -
        values.feedProperty
      ),
    interpret: (result) =>
      `${(result * 100).toFixed(2)}% of the feed bypasses the process`,
  },

  combustionAirRequirement: {
    id: 'combustionAirRequirement',
    code: 'MB–09',
    category: 'Material & Energy Balances',
    icon: '⇄',
    title: 'Combustion Air Requirement',
    subtitle:
      'Estimate complete-combustion air demand for a C-H-O fuel',
    referenceBasis:
      'Felder, Rousseau & Bullard · Elementary Principles of Chemical Processes',
    formula:
      'nair = nfuel(a+b/4−c/2)(1+EA/100)/0.21',
    outputLabel:
      'Required air flow',
    outputUnit:
      'kmol/h',
    fields: [
      {
        key: 'fuelFlow',
        label: 'Fuel flow',
        unit: 'kmol/h',
        initial: '100',
      },
      {
        key: 'carbonAtoms',
        label: 'Carbon atoms, a',
        unit: '—',
        initial: '1',
      },
      {
        key: 'hydrogenAtoms',
        label: 'Hydrogen atoms, b',
        unit: '—',
        initial: '4',
      },
      {
        key: 'oxygenAtoms',
        label: 'Oxygen atoms, c',
        unit: '—',
        initial: '0',
      },
      {
        key: 'excessAir',
        label: 'Excess air',
        unit: '%',
        initial: '15',
      },
    ],
    calculate: (values) =>
      values.fuelFlow *
      (
        values.carbonAtoms +
        values.hydrogenAtoms / 4 -
        values.oxygenAtoms / 2
      ) *
      (
        1 +
        values.excessAir / 100
      ) /
      0.21,
    interpret: () =>
      'Complete-combustion basis for CₐHᵦO𝒸 with dry air at 21 mol% O₂',
  },

  condensationHeatTransfer: {
    id: 'condensationHeatTransfer',
    code: 'HT–26',
    category: 'Heat Transfer',
    icon: '♨',
    title: 'Condensation Heat Transfer',
    subtitle:
      'Estimate laminar film-condensation coefficient on a vertical plate',
    referenceBasis:
      'Incropera, DeWitt, Bergman & Lavine · Fundamentals of Heat and Mass Transfer',
    formula:
      'h̄ = 0.943[ρl(ρl−ρv)ghfgk³/(μLΔT)]¹⁄⁴',
    outputLabel:
      'Mean condensation coefficient',
    outputUnit:
      'W/m²·K',
    fields: [
      {
        key: 'liquidDensity',
        label: 'Liquid density',
        unit: 'kg/m³',
        initial: '958',
      },
      {
        key: 'vaporDensity',
        label: 'Vapor density',
        unit: 'kg/m³',
        initial: '0.60',
      },
      {
        key: 'latentHeat',
        label: 'Latent heat',
        unit: 'J/kg',
        initial: '2257000',
      },
      {
        key: 'conductivity',
        label: 'Liquid conductivity',
        unit: 'W/m·K',
        initial: '0.68',
      },
      {
        key: 'viscosity',
        label: 'Liquid viscosity',
        unit: 'Pa·s',
        initial: '0.000282',
      },
      {
        key: 'plateLength',
        label: 'Vertical plate length',
        unit: 'm',
        initial: '1.0',
      },
      {
        key: 'temperatureDifference',
        label: 'Tsat − Ts',
        unit: 'K',
        initial: '10',
      },
    ],
    calculate: (values) =>
      0.943 *
      (
        values.liquidDensity *
        (
          values.liquidDensity -
          values.vaporDensity
        ) *
        9.80665 *
        values.latentHeat *
        values.conductivity ** 3 /
        (
          values.viscosity *
          values.plateLength *
          values.temperatureDifference
        )
      ) ** 0.25,
    interpret: () =>
      'Nusselt laminar film-condensation estimate for a vertical plate',
  },

  condenserBalance: {
    id: 'condenserBalance',
    code: 'MEB–11',
    category: 'Material & Energy Balances',
    icon: '⇄',
    title: 'Condenser Balance',
    subtitle:
      'Calculate condenser duty from vapor and liquid enthalpies',
    referenceBasis:
      'Felder, Rousseau & Bullard · Elementary Principles of Chemical Processes',
    formula:
      'Q̇ = ṁ(hv − hl)',
    outputLabel:
      'Condenser duty',
    outputUnit:
      'kJ/h',
    fields: [
      {
        key: 'vaporFlow',
        label: 'Vapor feed',
        unit: 'kg/h',
        initial: '1200',
      },
      {
        key: 'vaporEnthalpy',
        label: 'Vapor enthalpy',
        unit: 'kJ/kg',
        initial: '2750',
      },
      {
        key: 'liquidEnthalpy',
        label: 'Condensate enthalpy',
        unit: 'kJ/kg',
        initial: '500',
      },
    ],
    calculate: (values) =>
      values.vaporFlow *
      (
        values.vaporEnthalpy -
        values.liquidEnthalpy
      ),
    interpret: (result) =>
      `${(result / 3600).toFixed(2)} kW of heat must be removed`,
  },

  convectionHeatTransfer: {
    id: 'convectionHeatTransfer',
    code: 'HT–06',
    category: 'Heat Transfer',
    icon: '♨',
    title: 'Convection Heat Transfer',
    subtitle:
      'Calculate convective heat transfer from Newton’s cooling relation',
    referenceBasis:
      'Incropera, DeWitt, Bergman & Lavine · Fundamentals of Heat and Mass Transfer',
    formula:
      'Q̇ = hA(Ts − T∞)',
    outputLabel:
      'Convection heat rate',
    outputUnit:
      'W',
    fields: [
      {
        key: 'coefficient',
        label: 'Convection coefficient',
        unit: 'W/m²·K',
        initial: '85',
      },
      {
        key: 'area',
        label: 'Surface area',
        unit: 'm²',
        initial: '2.4',
      },
      {
        key: 'surfaceTemperature',
        label: 'Surface temperature',
        unit: '°C',
        initial: '95',
      },
      {
        key: 'fluidTemperature',
        label: 'Bulk-fluid temperature',
        unit: '°C',
        initial: '25',
      },
    ],
    calculate: (values) =>
      values.coefficient *
      values.area *
      (
        values.surfaceTemperature -
        values.fluidTemperature
      ),
    interpret: (result) =>
      `${(result / 1000).toFixed(2)} kW transferred from the surface to the fluid`,
  },

  reactionPerformanceBalance: {
    id: 'reactionPerformanceBalance',
    code: 'MEB–17',
    category: 'Material & Energy Balances',
    icon: '⇄',
    title: 'Conversion–Yield–Selectivity',
    subtitle:
      'Determine reactant conversion from feed and outlet flows',
    referenceBasis:
      'Felder, Rousseau & Bullard · Elementary Principles of Chemical Processes',
    formula:
      'X = (FA0−FA)/FA0; Y = FP/FA0; S = FP/(FA0−FA)',
    outputLabel:
      'Reactant conversion',
    outputUnit:
      '%',
    fields: [
      {
        key: 'reactantIn',
        label: 'Reactant fed',
        unit: 'kmol/h',
        initial: '100',
      },
      {
        key: 'reactantOut',
        label: 'Unreacted reactant',
        unit: 'kmol/h',
        initial: '25',
      },
      {
        key: 'desiredProduct',
        label: 'Desired product formed',
        unit: 'kmol/h',
        initial: '60',
      },
    ],
    calculate: (values) =>
      100 *
      (
        values.reactantIn -
        values.reactantOut
      ) /
      values.reactantIn,
    interpret: () =>
      'Yield and selectivity follow from the same reacted-feed basis',
  },

  criticalDepth: {
    id: 'criticalDepth',
    code: 'FM–03',
    category: 'Fluid Mechanics',
    icon: '≈',
    title: 'Critical Depth & Specific Energy',
    subtitle:
      'Calculate critical depth for rectangular open-channel flow',
    referenceBasis:
      'Çengel & Cimbala · Fluid Mechanics',
    formula:
      'yc = (q²/g)^(1/3)',
    outputLabel:
      'Critical depth',
    outputUnit:
      'm',
    fields: [
      {
        key: 'flowPerWidth',
        label: 'Discharge per unit width',
        unit: 'm²/s',
        initial: '2',
      },
      {
        key: 'gravity',
        label: 'Gravitational acceleration',
        unit: 'm/s²',
        initial: '9.80665',
      },
    ],
    calculate: (values) =>
      Math.cbrt(
        values.flowPerWidth ** 2 /
        values.gravity,
      ),
    interpret: () =>
      'Critical-flow depth for a rectangular open channel',
  },
}

export function getPriorityTenDefinition(
  calculatorId: PriorityTenNativeCalculatorId,
): PriorityTenCalculatorDefinition {
  return DEFINITIONS[calculatorId]
}

export function calculatePriorityTenCalculator(
  calculatorId: PriorityTenNativeCalculatorId,
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

    const mayBeZero =
      (
        calculatorId ===
          'bernoulliEquation' &&
        field.key ===
          'elevation'
      ) ||
      (
        calculatorId ===
          'combustionAirRequirement' &&
        (
          field.key ===
            'oxygenAtoms' ||
          field.key ===
            'excessAir'
        )
      ) ||
      (
        calculatorId ===
          'reactionPerformanceBalance' &&
        field.key ===
          'reactantOut'
      )

    if (
      !Number.isFinite(value) ||
      (
        mayBeZero
          ? value < 0
          : value <= 0
      )
    ) {
      throw new PriorityTenCalculatorError(
        `Enter a valid value for ${field.label}.`,
      )
    }
  }

  if (
    calculatorId ===
    'binarySeparatorBalance'
  ) {
    const {
      feedFraction,
      distillateFraction,
      bottomsFraction,
    } = values

    if (
      feedFraction > 1 ||
      distillateFraction > 1 ||
      bottomsFraction > 1 ||
      !(
        bottomsFraction <
          feedFraction &&
        feedFraction <
          distillateFraction
      )
    ) {
      throw new PriorityTenCalculatorError(
        'Use 0 < xB < zF < xD ≤ 1.',
      )
    }
  }

  if (
    calculatorId ===
      'boilingHeatTransfer' &&
    values.surfaceTemperature <=
      values.saturationTemperature
  ) {
    throw new PriorityTenCalculatorError(
      'The heated surface must be above the saturation temperature.',
    )
  }

  if (
    calculatorId ===
    'bypassMixingBalance'
  ) {
    const low =
      Math.min(
        values.feedProperty,
        values.processedProperty,
      )

    const high =
      Math.max(
        values.feedProperty,
        values.processedProperty,
      )

    if (
      values.feedProperty ===
        values.processedProperty ||
      values.targetProperty <
        low ||
      values.targetProperty >
        high
    ) {
      throw new PriorityTenCalculatorError(
        'Target property must lie between the feed and processed-stream properties.',
      )
    }
  }

  if (
    calculatorId ===
    'combustionAirRequirement'
  ) {
    const oxygenDemand =
      values.carbonAtoms +
      values.hydrogenAtoms / 4 -
      values.oxygenAtoms / 2

    if (
      oxygenDemand <= 0
    ) {
      throw new PriorityTenCalculatorError(
        'The molecular formula must require a positive stoichiometric oxygen amount.',
      )
    }
  }

  if (
    calculatorId ===
      'condensationHeatTransfer' &&
    values.liquidDensity <=
      values.vaporDensity
  ) {
    throw new PriorityTenCalculatorError(
      'Liquid density must exceed vapor density for this film-condensation model.',
    )
  }

  if (
    calculatorId ===
      'condenserBalance' &&
    values.vaporEnthalpy <=
      values.liquidEnthalpy
  ) {
    throw new PriorityTenCalculatorError(
      'Vapor enthalpy must exceed condensate enthalpy.',
    )
  }

  if (
    calculatorId ===
      'reactionPerformanceBalance' &&
    values.reactantOut >=
      values.reactantIn
  ) {
    throw new PriorityTenCalculatorError(
      'Unreacted reactant must be lower than the reactant feed.',
    )
  }

  const result =
    definition.calculate(
      values,
    )

  if (
    !Number.isFinite(result)
  ) {
    throw new PriorityTenCalculatorError(
      'The supplied values do not produce a finite engineering result.',
    )
  }

  return result
}
