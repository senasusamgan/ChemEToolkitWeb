import type {
  BreakEvenProductionAnalysisInput,
  BreakEvenProductionAnalysisResult,
  EconomicSensitivityAnalysisInput,
  EconomicSensitivityAnalysisResult,
  EquivalentAnnualWorthInput,
  EquivalentAnnualWorthResult,
  FlammabilityMixtureLimitsInput,
  FlammabilityMixtureLimitsResult,
  GasReliefValveSizingInput,
  GasReliefValveSizingResult,
  LiquidReliefValveSizingInput,
  LiquidReliefValveSizingResult,
} from './types.ts'

export type ProcessSafetyEconomicsBatch03ErrorCode =
  | 'nonFiniteInput'
  | 'invalidBreakEvenInputs'
  | 'invalidEquivalentAnnualWorthInputs'
  | 'invalidSensitivityInputs'
  | 'invalidFlammabilityInputs'
  | 'invalidGasReliefInputs'
  | 'invalidLiquidReliefInputs'
  | 'numericalFailure'

const messages: Record<
  ProcessSafetyEconomicsBatch03ErrorCode,
  string
> = {
  nonFiniteInput:
    'All calculator inputs must be finite.',
  invalidBreakEvenInputs:
    'Fixed annual cost cannot be negative. Selling price must exceed variable cost, and expected production cannot be negative.',
  invalidEquivalentAnnualWorthInputs:
    'Initial investment and project life must be positive. Terminal value cannot be negative, and discount rate must be greater than −100%.',
  invalidSensitivityInputs:
    'Base revenue, base operating cost and base investment cannot be negative. Project life must be a positive integer, and discount rate must be greater than −100%.',
  invalidFlammabilityInputs:
    'Fuel fractions must be non-negative and sum to a positive value. Each LFL and UFL must be positive with UFL above LFL, and actual concentration cannot be negative.',
  invalidGasReliefInputs:
    'Required flow, upstream pressure, temperature, molecular weight, compressibility, heat-capacity ratio and discharge coefficient must be positive. Upstream pressure must exceed back pressure, heat-capacity ratio must exceed one, and discharge coefficient cannot exceed one.',
  invalidLiquidReliefInputs:
    'Required flow, liquid density and discharge coefficient must be positive. Upstream pressure must exceed downstream pressure, and discharge coefficient cannot exceed one.',
  numericalFailure:
    'The calculation produced a non-finite result.',
}

export class ProcessSafetyEconomicsBatch03CalculationError
  extends Error {
  readonly code:
    ProcessSafetyEconomicsBatch03ErrorCode

  constructor(
    code:
      ProcessSafetyEconomicsBatch03ErrorCode,
  ) {
    super(messages[code])
    this.name =
      'ProcessSafetyEconomicsBatch03CalculationError'
    this.code = code
  }
}

function validateFinite(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ProcessSafetyEconomicsBatch03CalculationError(
        'nonFiniteInput',
      )
  }
}

function validateResults(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ProcessSafetyEconomicsBatch03CalculationError(
        'numericalFailure',
      )
  }
}

function annuityPresentWorthFactor(
  rate: number,
  years: number,
): number {
  if (Math.abs(rate) < 1e-14) {
    return years
  }

  return (
    1 -
    (1 + rate) ** (-years)
  ) /
  rate
}

function capitalRecoveryFactor(
  rate: number,
  years: number,
): number {
  if (Math.abs(rate) < 1e-14) {
    return 1 / years
  }

  return (
    rate *
    (1 + rate) ** years
  ) /
  (
    (1 + rate) ** years -
    1
  )
}

export function calculateBreakEvenProductionAnalysis(
  input: BreakEvenProductionAnalysisInput,
): BreakEvenProductionAnalysisResult {
  validateFinite(Object.values(input))

  if (
    input.fixedAnnualCost < 0 ||
    input.variableCostPerUnit < 0 ||
    input.sellingPricePerUnit <=
      input.variableCostPerUnit ||
    input.expectedAnnualProduction < 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch03CalculationError(
        'invalidBreakEvenInputs',
      )
  }

  const contributionMarginPerUnit =
    input.sellingPricePerUnit -
    input.variableCostPerUnit

  const contributionMarginRatio =
    contributionMarginPerUnit /
    input.sellingPricePerUnit

  const breakEvenProductionUnits =
    input.fixedAnnualCost /
    contributionMarginPerUnit

  const breakEvenRevenue =
    breakEvenProductionUnits *
    input.sellingPricePerUnit

  const expectedAnnualProfit =
    contributionMarginPerUnit *
    input.expectedAnnualProduction -
    input.fixedAnnualCost

  const marginOfSafetyUnits =
    input.expectedAnnualProduction -
    breakEvenProductionUnits

  const marginOfSafetyPercent =
    input.expectedAnnualProduction > 0
      ? (
          marginOfSafetyUnits /
          input.expectedAnnualProduction
        ) *
        100
      : 0

  validateResults([
    contributionMarginPerUnit,
    contributionMarginRatio,
    breakEvenProductionUnits,
    breakEvenRevenue,
    expectedAnnualProfit,
    marginOfSafetyUnits,
    marginOfSafetyPercent,
  ])

  return {
    contributionMarginPerUnit,
    contributionMarginRatio,
    breakEvenProductionUnits,
    breakEvenRevenue,
    expectedAnnualProfit,
    marginOfSafetyUnits,
    marginOfSafetyPercent,
    profitableAtExpectedProduction:
      expectedAnnualProfit > 0,
  }
}

export function calculateEquivalentAnnualWorth(
  input: EquivalentAnnualWorthInput,
): EquivalentAnnualWorthResult {
  validateFinite(Object.values(input))

  if (
    input.initialInvestment <= 0 ||
    input.terminalValue < 0 ||
    input.projectLifeYears <= 0 ||
    !Number.isInteger(
      input.projectLifeYears,
    ) ||
    input.discountRateFraction <= -1
  ) {
    throw new
      ProcessSafetyEconomicsBatch03CalculationError(
        'invalidEquivalentAnnualWorthInputs',
      )
  }

  const presentWorth =
    -input.initialInvestment +
    input.annualNetCashFlow *
    annuityPresentWorthFactor(
      input.discountRateFraction,
      input.projectLifeYears,
    ) +
    input.terminalValue /
    (
      1 +
      input.discountRateFraction
    ) **
    input.projectLifeYears

  const recoveryFactor =
    capitalRecoveryFactor(
      input.discountRateFraction,
      input.projectLifeYears,
    )

  const annualizedInitialInvestment =
    input.initialInvestment *
    recoveryFactor

  const annualizedTerminalValue =
    input.terminalValue /
    (
      1 +
      input.discountRateFraction
    ) **
    input.projectLifeYears *
    recoveryFactor

  const equivalentAnnualWorth =
    presentWorth *
    recoveryFactor

  validateResults([
    presentWorth,
    recoveryFactor,
    annualizedInitialInvestment,
    annualizedTerminalValue,
    equivalentAnnualWorth,
  ])

  return {
    presentWorth,
    capitalRecoveryFactor:
      recoveryFactor,
    annualizedInitialInvestment,
    annualizedTerminalValue,
    equivalentAnnualWorth,
    valueCreating:
      equivalentAnnualWorth > 0,
  }
}

export function calculateEconomicSensitivityAnalysis(
  input: EconomicSensitivityAnalysisInput,
): EconomicSensitivityAnalysisResult {
  validateFinite(Object.values(input))

  if (
    input.baseAnnualRevenue < 0 ||
    input.baseAnnualOperatingCost < 0 ||
    input.baseInitialInvestment < 0 ||
    input.projectLifeYears <= 0 ||
    !Number.isInteger(
      input.projectLifeYears,
    ) ||
    input.discountRateFraction <= -1
  ) {
    throw new
      ProcessSafetyEconomicsBatch03CalculationError(
        'invalidSensitivityInputs',
      )
  }

  const adjustedAnnualRevenue =
    input.baseAnnualRevenue *
    (
      1 +
      input.revenueChangeFraction
    )

  const adjustedAnnualOperatingCost =
    input.baseAnnualOperatingCost *
    (
      1 +
      input.operatingCostChangeFraction
    )

  const adjustedInitialInvestment =
    input.baseInitialInvestment *
    (
      1 +
      input.capitalChangeFraction
    )

  if (
    adjustedAnnualRevenue < 0 ||
    adjustedAnnualOperatingCost < 0 ||
    adjustedInitialInvestment < 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch03CalculationError(
        'invalidSensitivityInputs',
      )
  }

  const factor =
    annuityPresentWorthFactor(
      input.discountRateFraction,
      input.projectLifeYears,
    )

  const baseAnnualNetCashFlow =
    input.baseAnnualRevenue -
    input.baseAnnualOperatingCost

  const adjustedAnnualNetCashFlow =
    adjustedAnnualRevenue -
    adjustedAnnualOperatingCost

  const baseNetPresentValue =
    -input.baseInitialInvestment +
    baseAnnualNetCashFlow *
    factor

  const adjustedNetPresentValue =
    -adjustedInitialInvestment +
    adjustedAnnualNetCashFlow *
    factor

  const netPresentValueChange =
    adjustedNetPresentValue -
    baseNetPresentValue

  const netPresentValueChangePercent =
    Math.abs(baseNetPresentValue) >
      1e-12
      ? netPresentValueChange /
        Math.abs(baseNetPresentValue) *
        100
      : 0

  validateResults([
    adjustedAnnualRevenue,
    adjustedAnnualOperatingCost,
    adjustedInitialInvestment,
    baseNetPresentValue,
    adjustedNetPresentValue,
    netPresentValueChange,
    netPresentValueChangePercent,
    adjustedAnnualNetCashFlow,
  ])

  return {
    adjustedAnnualRevenue,
    adjustedAnnualOperatingCost,
    adjustedInitialInvestment,
    baseNetPresentValue,
    adjustedNetPresentValue,
    netPresentValueChange,
    netPresentValueChangePercent,
    adjustedAnnualNetCashFlow,
    adjustedCaseValueCreating:
      adjustedNetPresentValue > 0,
  }
}

export function calculateFlammabilityMixtureLimits(
  input: FlammabilityMixtureLimitsInput,
): FlammabilityMixtureLimitsResult {
  validateFinite(Object.values(input))

  const totalFuelFraction =
    input.componentOneFuelFraction +
    input.componentTwoFuelFraction

  if (
    input.componentOneFuelFraction < 0 ||
    input.componentTwoFuelFraction < 0 ||
    totalFuelFraction <= 0 ||
    input.componentOneLFLPercent <= 0 ||
    input.componentTwoLFLPercent <= 0 ||
    input.componentOneUFLPercent <=
      input.componentOneLFLPercent ||
    input.componentTwoUFLPercent <=
      input.componentTwoLFLPercent ||
    input.actualFuelConcentrationPercent < 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch03CalculationError(
        'invalidFlammabilityInputs',
      )
  }

  const normalizedComponentOneFraction =
    input.componentOneFuelFraction /
    totalFuelFraction

  const normalizedComponentTwoFraction =
    input.componentTwoFuelFraction /
    totalFuelFraction

  const mixtureLFLPercent =
    1 /
    (
      normalizedComponentOneFraction /
      input.componentOneLFLPercent +
      normalizedComponentTwoFraction /
      input.componentTwoLFLPercent
    )

  const mixtureUFLPercent =
    1 /
    (
      normalizedComponentOneFraction /
      input.componentOneUFLPercent +
      normalizedComponentTwoFraction /
      input.componentTwoUFLPercent
    )

  const flammableMixture =
    input.actualFuelConcentrationPercent >=
      mixtureLFLPercent &&
    input.actualFuelConcentrationPercent <=
      mixtureUFLPercent

  const concentrationStatus =
    input.actualFuelConcentrationPercent <
      mixtureLFLPercent
      ? 'Below lower flammability limit'
      : input.actualFuelConcentrationPercent >
          mixtureUFLPercent
        ? 'Above upper flammability limit'
        : 'Within estimated flammable range'

  const distanceToNearestLimitPercent =
    Math.min(
      Math.abs(
        input.actualFuelConcentrationPercent -
        mixtureLFLPercent,
      ),
      Math.abs(
        input.actualFuelConcentrationPercent -
        mixtureUFLPercent,
      ),
    )

  validateResults([
    normalizedComponentOneFraction,
    normalizedComponentTwoFraction,
    mixtureLFLPercent,
    mixtureUFLPercent,
    distanceToNearestLimitPercent,
  ])

  return {
    normalizedComponentOneFraction,
    normalizedComponentTwoFraction,
    mixtureLFLPercent,
    mixtureUFLPercent,
    flammableMixture,
    concentrationStatus,
    distanceToNearestLimitPercent,
  }
}

export function calculateGasReliefValveSizing(
  input: GasReliefValveSizingInput,
): GasReliefValveSizingResult {
  validateFinite(Object.values(input))

  if (
    input.requiredMassFlowRate <= 0 ||
    input.relievingAbsolutePressure <=
      input.backAbsolutePressure ||
    input.backAbsolutePressure < 0 ||
    input.relievingTemperature <= 0 ||
    input.molecularWeight <= 0 ||
    input.compressibilityFactor <= 0 ||
    input.heatCapacityRatio <= 1 ||
    input.dischargeCoefficient <= 0 ||
    input.dischargeCoefficient > 1
  ) {
    throw new
      ProcessSafetyEconomicsBatch03CalculationError(
        'invalidGasReliefInputs',
      )
  }

  const universalGasConstant =
    8314.462618

  const specificGasConstant =
    universalGasConstant /
    input.molecularWeight

  const criticalPressureRatio =
    (
      2 /
      (
        input.heatCapacityRatio +
        1
      )
    ) **
    (
      input.heatCapacityRatio /
      (
        input.heatCapacityRatio -
        1
      )
    )

  const actualPressureRatio =
    input.backAbsolutePressure /
    input.relievingAbsolutePressure

  const chokedFlow =
    actualPressureRatio <=
    criticalPressureRatio

  let idealMassFlux = 0

  if (chokedFlow) {
    idealMassFlux =
      input.relievingAbsolutePressure *
      Math.sqrt(
        input.heatCapacityRatio /
        (
          input.compressibilityFactor *
          specificGasConstant *
          input.relievingTemperature
        ) *
        (
          2 /
          (
            input.heatCapacityRatio +
            1
          )
        ) **
        (
          (
            input.heatCapacityRatio +
            1
          ) /
          (
            input.heatCapacityRatio -
            1
          )
        ),
      )
  } else {
    idealMassFlux =
      input.relievingAbsolutePressure *
      Math.sqrt(
        (
          2 *
          input.heatCapacityRatio
        ) /
        (
          input.compressibilityFactor *
          specificGasConstant *
          input.relievingTemperature *
          (
            input.heatCapacityRatio -
            1
          )
        ) *
        (
          actualPressureRatio **
            (
              2 /
              input.heatCapacityRatio
            ) -
          actualPressureRatio **
            (
              (
                input.heatCapacityRatio +
                1
              ) /
              input.heatCapacityRatio
            )
        ),
      )
  }

  const effectiveMassFlux =
    input.dischargeCoefficient *
    idealMassFlux

  const requiredArea =
    input.requiredMassFlowRate /
    effectiveMassFlux

  const equivalentDiameter =
    Math.sqrt(
      4 *
      requiredArea /
      Math.PI,
    )

  const pressureDrop =
    input.relievingAbsolutePressure -
    input.backAbsolutePressure

  validateResults([
    criticalPressureRatio,
    actualPressureRatio,
    idealMassFlux,
    effectiveMassFlux,
    requiredArea,
    equivalentDiameter,
    pressureDrop,
  ])

  return {
    criticalPressureRatio,
    actualPressureRatio,
    chokedFlow,
    idealMassFlux,
    effectiveMassFlux,
    requiredArea,
    equivalentDiameter,
    pressureDrop,
  }
}

export function calculateLiquidReliefValveSizing(
  input: LiquidReliefValveSizingInput,
): LiquidReliefValveSizingResult {
  validateFinite(Object.values(input))

  const pressureDrop =
    input.upstreamAbsolutePressure -
    input.downstreamAbsolutePressure

  if (
    input.requiredVolumetricFlowRate <= 0 ||
    input.liquidDensity <= 0 ||
    pressureDrop <= 0 ||
    input.dischargeCoefficient <= 0 ||
    input.dischargeCoefficient > 1
  ) {
    throw new
      ProcessSafetyEconomicsBatch03CalculationError(
        'invalidLiquidReliefInputs',
      )
  }

  const idealVelocity =
    Math.sqrt(
      2 *
      pressureDrop /
      input.liquidDensity,
    )

  const effectiveVelocity =
    input.dischargeCoefficient *
    idealVelocity

  const requiredArea =
    input.requiredVolumetricFlowRate /
    effectiveVelocity

  const equivalentDiameter =
    Math.sqrt(
      4 *
      requiredArea /
      Math.PI,
    )

  const requiredMassFlowRate =
    input.requiredVolumetricFlowRate *
    input.liquidDensity

  validateResults([
    pressureDrop,
    idealVelocity,
    effectiveVelocity,
    requiredArea,
    equivalentDiameter,
    requiredMassFlowRate,
  ])

  return {
    pressureDrop,
    idealVelocity,
    effectiveVelocity,
    requiredArea,
    equivalentDiameter,
    requiredMassFlowRate,
  }
}
