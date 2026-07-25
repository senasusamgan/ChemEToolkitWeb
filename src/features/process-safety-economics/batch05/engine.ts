import type {
  BLEVEFireballScreeningInput,
  BLEVEFireballScreeningResult,
  EventTreeAnalysisInput,
  EventTreeAnalysisResult,
  GasLeakRateScreeningInput,
  GasLeakRateScreeningResult,
  GaussianPlumeDispersionInput,
  GaussianPlumeDispersionResult,
  TNTEquivalentExplosionScreeningInput,
  TNTEquivalentExplosionScreeningResult,
  ToxicExposureDoseScreeningInput,
  ToxicExposureDoseScreeningResult,
} from './types.ts'

export type ProcessSafetyEconomicsBatch05ErrorCode =
  | 'nonFiniteInput'
  | 'invalidBLEVEInputs'
  | 'invalidTNTInputs'
  | 'invalidGasLeakInputs'
  | 'invalidGaussianPlumeInputs'
  | 'invalidToxicDoseInputs'
  | 'invalidEventTreeInputs'
  | 'numericalFailure'

const messages: Record<
  ProcessSafetyEconomicsBatch05ErrorCode,
  string
> = {
  nonFiniteInput:
    'All calculator inputs must be finite.',
  invalidBLEVEInputs:
    'Flammable mass, heat of combustion and receptor distance must be positive. Radiant fraction and atmospheric transmissivity must be greater than zero and no greater than one.',
  invalidTNTInputs:
    'Flammable mass, heat of combustion and receptor distance must be positive. Explosion efficiency must be greater than zero and no greater than one.',
  invalidGasLeakInputs:
    'Absolute pressures, temperature, molecular weight, heat-capacity ratio, discharge coefficient and orifice diameter must be valid and positive. Upstream pressure must exceed downstream pressure, heat-capacity ratio must exceed one and discharge coefficient cannot exceed one.',
  invalidGaussianPlumeInputs:
    'Emission rate, wind speed and both dispersion coefficients must be positive. Distances and heights cannot be negative.',
  invalidToxicDoseInputs:
    'Exposure concentration, duration, concentration exponent and reference dose must be positive.',
  invalidEventTreeInputs:
    'Initiating-event frequency must be positive and all barrier-success probabilities must lie from zero through one.',
  numericalFailure:
    'The calculation produced a non-finite result.',
}

export class ProcessSafetyEconomicsBatch05CalculationError
  extends Error {
  readonly code:
    ProcessSafetyEconomicsBatch05ErrorCode

  constructor(
    code:
      ProcessSafetyEconomicsBatch05ErrorCode,
  ) {
    super(messages[code])
    this.name =
      'ProcessSafetyEconomicsBatch05CalculationError'
    this.code = code
  }
}

function validateFinite(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ProcessSafetyEconomicsBatch05CalculationError(
        'nonFiniteInput',
      )
  }
}

function validateResults(
  values: number[],
): void {
  if (!values.every(Number.isFinite)) {
    throw new
      ProcessSafetyEconomicsBatch05CalculationError(
        'numericalFailure',
      )
  }
}

function unitFraction(
  value: number,
): boolean {
  return value > 0 && value <= 1
}

export function calculateBLEVEFireballScreening(
  input: BLEVEFireballScreeningInput,
): BLEVEFireballScreeningResult {
  validateFinite(Object.values(input))

  if (
    input.flammableMass <= 0 ||
    input.heatOfCombustion <= 0 ||
    !unitFraction(
      input.radiantFraction,
    ) ||
    !unitFraction(
      input.atmosphericTransmissivity,
    ) ||
    input.receptorDistance <= 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch05CalculationError(
        'invalidBLEVEInputs',
      )
  }

  const fireballDiameter =
    6.48 *
    input.flammableMass ** 0.325

  const fireballDuration =
    0.852 *
    input.flammableMass ** 0.26

  const totalChemicalEnergy =
    input.flammableMass *
    input.heatOfCombustion

  const radiatedEnergy =
    totalChemicalEnergy *
    input.radiantFraction

  const averageRadiatedPower =
    radiatedEnergy /
    fireballDuration

  const transmittedRadiatedPower =
    averageRadiatedPower *
    input.atmosphericTransmissivity

  const thermalRadiationFlux =
    transmittedRadiatedPower /
    (
      4 *
      Math.PI *
      input.receptorDistance ** 2
    )

  const fluxKilowatts =
    thermalRadiationFlux /
    1000

  const hazardBand =
    fluxKilowatts < 1.6
      ? 'Low screening flux'
      : fluxKilowatts < 4
        ? 'Personnel exposure concern'
        : fluxKilowatts < 12.5
          ? 'Severe exposure / equipment concern'
          : 'High thermal-radiation hazard'

  const screeningDescription =
    `${fluxKilowatts.toFixed(3)} kW/m² point-source estimate at the receptor.`

  validateResults([
    fireballDiameter,
    fireballDuration,
    totalChemicalEnergy,
    radiatedEnergy,
    averageRadiatedPower,
    transmittedRadiatedPower,
    thermalRadiationFlux,
  ])

  return {
    fireballDiameter,
    fireballDuration,
    totalChemicalEnergy,
    radiatedEnergy,
    averageRadiatedPower,
    transmittedRadiatedPower,
    thermalRadiationFlux,
    hazardBand,
    screeningDescription,
  }
}

export function calculateTNTEquivalentExplosionScreening(
  input: TNTEquivalentExplosionScreeningInput,
): TNTEquivalentExplosionScreeningResult {
  validateFinite(Object.values(input))

  if (
    input.flammableMass <= 0 ||
    input.heatOfCombustion <= 0 ||
    !unitFraction(
      input.explosionEfficiency,
    ) ||
    input.receptorDistance <= 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch05CalculationError(
        'invalidTNTInputs',
      )
  }

  const tntEnergyPerKilogram =
    4_680_000

  const totalCombustionEnergy =
    input.flammableMass *
    input.heatOfCombustion

  const effectiveExplosionEnergy =
    totalCombustionEnergy *
    input.explosionEfficiency

  const tntEquivalentMass =
    effectiveExplosionEnergy /
    tntEnergyPerKilogram

  const scaledDistance =
    input.receptorDistance /
    Math.cbrt(
      tntEquivalentMass,
    )

  const estimatedPeakOverpressure =
    101_325 *
    (
      0.22 /
      scaledDistance +
      7.8 /
      scaledDistance ** 3
    )

  const overpressureKilopascals =
    estimatedPeakOverpressure /
    1000

  const hazardBand =
    overpressureKilopascals < 3.5
      ? 'Low structural-damage screening range'
      : overpressureKilopascals < 7
        ? 'Window and light-structure damage concern'
        : overpressureKilopascals < 21
          ? 'Serious structural-damage concern'
          : 'High blast-overpressure hazard'

  const screeningDescription =
    `${overpressureKilopascals.toFixed(3)} kPa estimated peak overpressure.`

  validateResults([
    totalCombustionEnergy,
    effectiveExplosionEnergy,
    tntEquivalentMass,
    scaledDistance,
    estimatedPeakOverpressure,
    overpressureKilopascals,
  ])

  return {
    totalCombustionEnergy,
    effectiveExplosionEnergy,
    tntEquivalentMass,
    scaledDistance,
    estimatedPeakOverpressure,
    overpressureKilopascals,
    hazardBand,
    screeningDescription,
  }
}

export function calculateGasLeakRateScreening(
  input: GasLeakRateScreeningInput,
): GasLeakRateScreeningResult {
  validateFinite(Object.values(input))

  if (
    input.upstreamAbsolutePressure <=
      input.downstreamAbsolutePressure ||
    input.downstreamAbsolutePressure <= 0 ||
    input.gasTemperature <= 0 ||
    input.molecularWeight <= 0 ||
    input.heatCapacityRatio <= 1 ||
    input.dischargeCoefficient <= 0 ||
    input.dischargeCoefficient > 1 ||
    input.orificeDiameter <= 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch05CalculationError(
        'invalidGasLeakInputs',
      )
  }

  const universalGasConstant =
    8314.462618

  const specificGasConstant =
    universalGasConstant /
    input.molecularWeight

  const orificeArea =
    Math.PI *
    input.orificeDiameter ** 2 /
    4

  const upstreamGasDensity =
    input.upstreamAbsolutePressure /
    (
      specificGasConstant *
      input.gasTemperature
    )

  const pressureRatio =
    input.downstreamAbsolutePressure /
    input.upstreamAbsolutePressure

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

  const flowIsChoked =
    pressureRatio <=
    criticalPressureRatio

  let idealMassFlux = 0

  if (flowIsChoked) {
    idealMassFlux =
      input.upstreamAbsolutePressure *
      Math.sqrt(
        input.heatCapacityRatio /
        (
          specificGasConstant *
          input.gasTemperature
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
      input.upstreamAbsolutePressure *
      Math.sqrt(
        (
          2 *
          input.heatCapacityRatio
        ) /
        (
          specificGasConstant *
          input.gasTemperature *
          (
            input.heatCapacityRatio -
            1
          )
        ) *
        (
          pressureRatio **
            (
              2 /
              input.heatCapacityRatio
            ) -
          pressureRatio **
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

  const massFlux =
    input.dischargeCoefficient *
    idealMassFlux

  const massReleaseRate =
    massFlux *
    orificeArea

  const upstreamVolumetricReleaseRate =
    massReleaseRate /
    upstreamGasDensity

  const flowRegimeDescription =
    flowIsChoked
      ? 'Choked compressible release'
      : 'Subcritical compressible release'

  validateResults([
    orificeArea,
    specificGasConstant,
    upstreamGasDensity,
    pressureRatio,
    criticalPressureRatio,
    massFlux,
    massReleaseRate,
    upstreamVolumetricReleaseRate,
  ])

  return {
    orificeArea,
    specificGasConstant,
    upstreamGasDensity,
    pressureRatio,
    criticalPressureRatio,
    flowIsChoked,
    massFlux,
    massReleaseRate,
    upstreamVolumetricReleaseRate,
    flowRegimeDescription,
  }
}

export function calculateGaussianPlumeDispersion(
  input: GaussianPlumeDispersionInput,
): GaussianPlumeDispersionResult {
  validateFinite(Object.values(input))

  if (
    input.sourceEmissionRate <= 0 ||
    input.windSpeed <= 0 ||
    input.crosswindDistance < 0 ||
    input.receptorHeight < 0 ||
    input.effectiveReleaseHeight < 0 ||
    input.horizontalDispersionCoefficient <= 0 ||
    input.verticalDispersionCoefficient <= 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch05CalculationError(
        'invalidGaussianPlumeInputs',
      )
  }

  const prefactorConcentration =
    input.sourceEmissionRate /
    (
      2 *
      Math.PI *
      input.windSpeed *
      input.horizontalDispersionCoefficient *
      input.verticalDispersionCoefficient
    )

  const crosswindAttenuationFactor =
    Math.exp(
      -(input.crosswindDistance ** 2) /
      (
        2 *
        input.horizontalDispersionCoefficient ** 2
      ),
    )

  const directVerticalFactor =
    Math.exp(
      -((input.receptorHeight - input.effectiveReleaseHeight) ** 2) /
      (
        2 *
        input.verticalDispersionCoefficient ** 2
      ),
    )

  const reflectedVerticalFactor =
    Math.exp(
      -((input.receptorHeight + input.effectiveReleaseHeight) ** 2) /
      (
        2 *
        input.verticalDispersionCoefficient ** 2
      ),
    )

  const receptorConcentration =
    prefactorConcentration *
    crosswindAttenuationFactor *
    (
      directVerticalFactor +
      reflectedVerticalFactor
    )

  const centerlineGroundConcentration =
    prefactorConcentration *
    2 *
    Math.exp(
      -(input.effectiveReleaseHeight ** 2) /
      (
        2 *
        input.verticalDispersionCoefficient ** 2
      ),
    )

  const verticalSum =
    directVerticalFactor +
    reflectedVerticalFactor

  const groundReflectionContributionFraction =
    verticalSum > 0
      ? reflectedVerticalFactor /
        verticalSum
      : 0

  const plumeRegimeDescription =
    input.crosswindDistance <=
      input.horizontalDispersionCoefficient
      ? 'Near-centerline receptor'
      : 'Crosswind-attenuated receptor'

  validateResults([
    prefactorConcentration,
    crosswindAttenuationFactor,
    directVerticalFactor,
    reflectedVerticalFactor,
    receptorConcentration,
    centerlineGroundConcentration,
    groundReflectionContributionFraction,
  ])

  return {
    prefactorConcentration,
    crosswindAttenuationFactor,
    directVerticalFactor,
    reflectedVerticalFactor,
    receptorConcentration,
    centerlineGroundConcentration,
    groundReflectionContributionFraction,
    plumeRegimeDescription,
  }
}

export function calculateToxicExposureDoseScreening(
  input: ToxicExposureDoseScreeningInput,
): ToxicExposureDoseScreeningResult {
  validateFinite(Object.values(input))

  if (
    input.exposureConcentration <= 0 ||
    input.exposureDuration <= 0 ||
    input.concentrationExponent <= 0 ||
    input.referenceDose <= 0
  ) {
    throw new
      ProcessSafetyEconomicsBatch05CalculationError(
        'invalidToxicDoseInputs',
      )
  }

  const concentrationTerm =
    input.exposureConcentration **
    input.concentrationExponent

  const toxicDose =
    concentrationTerm *
    input.exposureDuration

  const doseRatio =
    toxicDose /
    input.referenceDose

  const dosePercentOfReference =
    doseRatio *
    100

  const equivalentReferenceDuration =
    input.referenceDose /
    concentrationTerm

  const hazardBand =
    doseRatio < 0.1
      ? 'Low fraction of reference dose'
      : doseRatio < 1
        ? 'Below reference dose'
        : doseRatio < 10
          ? 'Reference dose exceeded'
          : 'High toxic-dose screening ratio'

  const screeningDescription =
    `${dosePercentOfReference.toFixed(3)}% of the selected reference dose.`

  validateResults([
    concentrationTerm,
    toxicDose,
    doseRatio,
    dosePercentOfReference,
    equivalentReferenceDuration,
  ])

  return {
    concentrationTerm,
    toxicDose,
    doseRatio,
    dosePercentOfReference,
    equivalentReferenceDuration,
    hazardBand,
    screeningDescription,
  }
}

export function calculateEventTreeAnalysis(
  input: EventTreeAnalysisInput,
): EventTreeAnalysisResult {
  validateFinite(Object.values(input))

  const probabilities = [
    input.barrier1SuccessProbability,
    input.barrier2SuccessProbability,
    input.barrier3SuccessProbability,
  ]

  if (
    input.initiatingEventFrequency <= 0 ||
    probabilities.some(
      (value) =>
        value < 0 ||
        value > 1,
    )
  ) {
    throw new
      ProcessSafetyEconomicsBatch05CalculationError(
        'invalidEventTreeInputs',
      )
  }

  const barrier1FailureOutcomeFrequency =
    input.initiatingEventFrequency *
    (
      1 -
      input.barrier1SuccessProbability
    )

  const barrier2FailureOutcomeFrequency =
    input.initiatingEventFrequency *
    input.barrier1SuccessProbability *
    (
      1 -
      input.barrier2SuccessProbability
    )

  const barrier3FailureOutcomeFrequency =
    input.initiatingEventFrequency *
    input.barrier1SuccessProbability *
    input.barrier2SuccessProbability *
    (
      1 -
      input.barrier3SuccessProbability
    )

  const fullSuccessProbability =
    input.barrier1SuccessProbability *
    input.barrier2SuccessProbability *
    input.barrier3SuccessProbability

  const allBarriersSuccessfulFrequency =
    input.initiatingEventFrequency *
    fullSuccessProbability

  const outcomes = [
    [
      'Barrier 1 failure',
      barrier1FailureOutcomeFrequency,
    ],
    [
      'Barrier 2 failure',
      barrier2FailureOutcomeFrequency,
    ],
    [
      'Barrier 3 failure',
      barrier3FailureOutcomeFrequency,
    ],
    [
      'All barriers successful',
      allBarriersSuccessfulFrequency,
    ],
  ] as const

  const totalOutcomeFrequency =
    outcomes.reduce(
      (
        total,
        outcome,
      ) =>
        total + outcome[1],
      0,
    )

  const probabilityConservationError =
    Math.abs(
      totalOutcomeFrequency -
      input.initiatingEventFrequency,
    )

  const dominantOutcome =
    outcomes.reduce(
      (
        dominant,
        outcome,
      ) =>
        outcome[1] >
        dominant[1]
          ? outcome
          : dominant,
    )[0]

  validateResults([
    barrier1FailureOutcomeFrequency,
    barrier2FailureOutcomeFrequency,
    barrier3FailureOutcomeFrequency,
    allBarriersSuccessfulFrequency,
    totalOutcomeFrequency,
    probabilityConservationError,
    fullSuccessProbability,
  ])

  return {
    initiatingEventFrequency:
      input.initiatingEventFrequency,
    barrier1FailureOutcomeFrequency,
    barrier2FailureOutcomeFrequency,
    barrier3FailureOutcomeFrequency,
    allBarriersSuccessfulFrequency,
    totalOutcomeFrequency,
    probabilityConservationError,
    dominantOutcome,
    fullSuccessProbability,
  }
}
