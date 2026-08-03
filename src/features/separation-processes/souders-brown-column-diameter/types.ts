export type SoudersBrownColumnInput = {
  vaporVolumetricFlowRate: number
  vaporDensity: number
  liquidDensity: number
  capacityFactor: number
  designFloodFraction: number
  downcomerAreaFraction: number
  diameterIncrement: number
};

export type SoudersBrownScenario = {
  designFloodFraction: number
  floodingVelocity: number
  designVelocity: number
  requiredNetArea: number
  requiredGrossArea: number
  rawColumnDiameter: number
  roundedColumnDiameter: number
  roundedGrossArea: number
  roundedNetArea: number
  actualVaporVelocity: number
  actualFloodFraction: number
  capacityMarginPercent: number
  vaporFfactor: number
};

export type SoudersBrownColumnResult = {
  floodingVelocity: number
  vaporMassFlowRate: number
  densityDifference: number
  densityRatioTerm: number
  selectedScenario:
    SoudersBrownScenario
  scenarios:
    SoudersBrownScenario[]
  modelName: string
  limitationDescription: string
};
