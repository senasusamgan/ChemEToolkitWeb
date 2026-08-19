export const GELDART_PARTICLE_CLASSIFICATION_ENGINE_VERSION =
  '1.0.0'

export type GeldartGroup =
  | 'A'
  | 'B'
  | 'C'
  | 'D'

export interface GeldartParticleClassificationInputs {
  particleDiameterMicrometres: number
  particleDensity: number
  gasDensity: number
}

export interface GeldartParticleClassificationResult {
  group: GeldartGroup
  densityDifference: number
  densityDifferenceGramsPerCubicCentimetre: number
  groupABIndex: number
  groupDIndex: number
  nearBoundary: boolean
  behaviour: string
}

const GROUP_C_SCREENING_DIAMETER_MICROMETRES =
  30

const GROUP_AB_INDEX_LIMIT =
  225

const GROUP_D_INDEX_LIMIT =
  1_000_000

const BOUNDARY_TOLERANCE =
  0.1

const BEHAVIOUR: Record<
  GeldartGroup,
  string
> = {
  A:
    'Aeratable powder: appreciable dense-phase expansion is expected before bubbling.',
  B:
    'Sand-like powder: bubbling generally begins close to minimum fluidization.',
  C:
    'Cohesive fine powder: interparticle forces can make conventional fluidization difficult.',
  D:
    'Large or dense particle regime: spouting behaviour and substantial gas bypass can occur.',
}

function relativeDistance(
  value: number,
  boundary: number,
) {
  return Math.abs(
    value - boundary,
  ) / boundary
}

export function calculateGeldartParticleClassification(
  inputs:
    GeldartParticleClassificationInputs,
): GeldartParticleClassificationResult {
  const {
    particleDiameterMicrometres,
    particleDensity,
    gasDensity,
  } = inputs

  for (
    const value
    of [
      particleDiameterMicrometres,
      particleDensity,
      gasDensity,
    ]
  ) {
    if (
      !Number.isFinite(value)
      || value <= 0
    ) {
      throw new Error(
        'Particle size and densities must be finite and greater than zero.',
      )
    }
  }

  if (
    particleDensity <=
    gasDensity
  ) {
    throw new Error(
      'Particle density must exceed gas density.',
    )
  }

  const densityDifference =
    particleDensity
    - gasDensity

  const densityDifferenceGramsPerCubicCentimetre =
    densityDifference
    / 1000

  const groupABIndex =
    densityDifferenceGramsPerCubicCentimetre
    * particleDiameterMicrometres

  const groupDIndex =
    densityDifferenceGramsPerCubicCentimetre
    * particleDiameterMicrometres ** 2

  let group: GeldartGroup

  if (
    particleDiameterMicrometres <=
    GROUP_C_SCREENING_DIAMETER_MICROMETRES
  ) {
    group = 'C'
  } else if (
    groupDIndex >=
    GROUP_D_INDEX_LIMIT
  ) {
    group = 'D'
  } else if (
    groupABIndex <
    GROUP_AB_INDEX_LIMIT
  ) {
    group = 'A'
  } else {
    group = 'B'
  }

  const nearBoundary =
    relativeDistance(
      particleDiameterMicrometres,
      GROUP_C_SCREENING_DIAMETER_MICROMETRES,
    ) <= BOUNDARY_TOLERANCE
    || relativeDistance(
      groupABIndex,
      GROUP_AB_INDEX_LIMIT,
    ) <= BOUNDARY_TOLERANCE
    || relativeDistance(
      groupDIndex,
      GROUP_D_INDEX_LIMIT,
    ) <= BOUNDARY_TOLERANCE

  return {
    group,
    densityDifference,
    densityDifferenceGramsPerCubicCentimetre,
    groupABIndex,
    groupDIndex,
    nearBoundary,
    behaviour:
      BEHAVIOUR[group],
  }
}
