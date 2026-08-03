export type ShortcutDistillationInput = {
  feedLightKeyMoleFraction: number
  distillateLightKeyMoleFraction: number
  bottomsLightKeyMoleFraction: number
  relativeVolatility: number
  feedQuality: number
  refluxMultiplier: number
  overallStageEfficiency: number
};

export type ShortcutDistillationScenario = {
  refluxMultiplier: number
  operatingRefluxRatio: number
  reducedReflux: number
  gillilandReducedStages: number
  theoreticalStageCount: number
  requiredIntegerTheoreticalStages: number
  actualStageCount: number
  requiredIntegerActualStages: number
};

export type ShortcutDistillationResult = {
  minimumStages: number
  underwoodRoot: number
  underwoodResidual: number
  minimumRefluxRatio: number
  selectedScenario:
    ShortcutDistillationScenario
  scenarios:
    ShortcutDistillationScenario[]
  modelName: string
  limitationDescription: string
};
