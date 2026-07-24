import type {
  MSMPRCrystallizerDesignInput,
  MSMPRCrystallizerDesignResult,
} from './types.ts'

export type MSMPRCrystallizerDesignErrorCode =
  | 'nonFiniteInput'
  | 'nonPositiveProperty'
  | 'negativeEvaluationSize'
  | 'solidsFractionOutsideDiluteModel'
  | 'numericalFailure'

const ERROR_MESSAGES: Record<
  MSMPRCrystallizerDesignErrorCode,
  string
> = {
  nonFiniteInput:
    'All MSMPR inputs must be finite.',
  nonPositiveProperty:
    'Residence time, growth rate, nuclei density, crystal density, shape factor and slurry flow must be greater than zero.',
  negativeEvaluationSize:
    'Evaluation crystal size cannot be negative.',
  solidsFractionOutsideDiluteModel:
    'Calculated crystal volume fraction exceeds 0.20. The ideal dilute-slurry MSMPR model is not valid for this input.',
  numericalFailure:
    'The MSMPR population-balance calculation did not produce finite physical results.',
}

export class MSMPRCrystallizerDesignCalculationError extends Error {
  readonly code: MSMPRCrystallizerDesignErrorCode

  constructor(code: MSMPRCrystallizerDesignErrorCode) {
    super(ERROR_MESSAGES[code])
    this.name = 'MSMPRCrystallizerDesignCalculationError'
    this.code = code
  }
}

const MAXIMUM_SOLIDS_VOLUME_FRACTION = 0.2
const COMPARISON_TOLERANCE = 1e-12

export function calculateMSMPRCrystallizerDesign(
  input: MSMPRCrystallizerDesignInput,
): MSMPRCrystallizerDesignResult {
  const values = [
    input.residenceTime,
    input.linearCrystalGrowthRate,
    input.nucleiPopulationDensity,
    input.crystalDensity,
    input.crystalVolumeShapeFactor,
    input.slurryVolumetricFlowRate,
    input.evaluationCrystalSize,
  ]

  if (!values.every(Number.isFinite)) {
    throw new MSMPRCrystallizerDesignCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.residenceTime <= 0 ||
    input.linearCrystalGrowthRate <= 0 ||
    input.nucleiPopulationDensity <= 0 ||
    input.crystalDensity <= 0 ||
    input.crystalVolumeShapeFactor <= 0 ||
    input.slurryVolumetricFlowRate <= 0
  ) {
    throw new MSMPRCrystallizerDesignCalculationError(
      'nonPositiveProperty',
    )
  }

  if (input.evaluationCrystalSize < 0) {
    throw new MSMPRCrystallizerDesignCalculationError(
      'negativeEvaluationSize',
    )
  }

  const characteristicCrystalSize =
    input.linearCrystalGrowthRate *
    input.residenceTime

  const numberMeanCrystalSize =
    characteristicCrystalSize

  const surfaceWeightedMeanSize =
    3 * characteristicCrystalSize

  const volumeWeightedMeanSize =
    4 * characteristicCrystalSize

  const totalCrystalNumberConcentration =
    input.nucleiPopulationDensity *
    characteristicCrystalSize

  const thirdPopulationMoment =
    6 *
    input.nucleiPopulationDensity *
    characteristicCrystalSize ** 4

  const solidsVolumeFraction =
    input.crystalVolumeShapeFactor *
    thirdPopulationMoment

  if (
    solidsVolumeFraction >
    MAXIMUM_SOLIDS_VOLUME_FRACTION +
      COMPARISON_TOLERANCE
  ) {
    throw new MSMPRCrystallizerDesignCalculationError(
      'solidsFractionOutsideDiluteModel',
    )
  }

  const crystalMassConcentration =
    input.crystalDensity *
    solidsVolumeFraction

  const crystalProductionRate =
    input.slurryVolumetricFlowRate *
    crystalMassConcentration

  const normalizedEvaluationSize =
    input.evaluationCrystalSize /
    characteristicCrystalSize

  const populationDensityAtEvaluationSize =
    input.nucleiPopulationDensity *
    Math.exp(-normalizedEvaluationSize)

  const fractionByNumberAboveEvaluationSize =
    Math.exp(-normalizedEvaluationSize)

  const numericResults = [
    characteristicCrystalSize,
    numberMeanCrystalSize,
    surfaceWeightedMeanSize,
    volumeWeightedMeanSize,
    totalCrystalNumberConcentration,
    thirdPopulationMoment,
    solidsVolumeFraction,
    crystalMassConcentration,
    crystalProductionRate,
    populationDensityAtEvaluationSize,
    fractionByNumberAboveEvaluationSize,
  ]

  if (
    !numericResults.every(Number.isFinite) ||
    characteristicCrystalSize <= 0 ||
    totalCrystalNumberConcentration <= 0 ||
    thirdPopulationMoment <= 0 ||
    solidsVolumeFraction <= 0 ||
    crystalMassConcentration <= 0 ||
    crystalProductionRate <= 0 ||
    populationDensityAtEvaluationSize <= 0 ||
    fractionByNumberAboveEvaluationSize <= 0 ||
    fractionByNumberAboveEvaluationSize > 1
  ) {
    throw new MSMPRCrystallizerDesignCalculationError(
      'numericalFailure',
    )
  }

  return {
    characteristicCrystalSize,
    numberMeanCrystalSize,
    surfaceWeightedMeanSize,
    volumeWeightedMeanSize,
    totalCrystalNumberConcentration,
    thirdPopulationMoment,
    solidsVolumeFraction,
    crystalMassConcentration,
    crystalProductionRate,
    evaluationCrystalSize:
      input.evaluationCrystalSize,
    populationDensityAtEvaluationSize,
    fractionByNumberAboveEvaluationSize,
    modelName:
      'Ideal steady-state MSMPR population balance',
    limitationDescription:
      'Assumes perfect mixing, size-independent growth, negligible agglomeration and breakage, no crystal growth dispersion and a dilute slurry.',
  }
}
