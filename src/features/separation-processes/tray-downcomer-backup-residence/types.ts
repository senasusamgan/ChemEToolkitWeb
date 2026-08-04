export type TrayDowncomerStatus =
  | 'acceptable'
  | 'marginal'
  | 'shortResidence'
  | 'highBackup'
  | 'flooded'

export type TrayDowncomerInput = {
  liquidVolumetricFlowRate: number
  columnDiameter: number
  downcomerAreaFraction: number
  traySpacing: number
  weirLength: number
  weirHeight: number
  trayPressureDrop: number
  liquidDensity: number
  downcomerLossCoefficient: number
  allowableBackupFraction: number
  minimumResidenceTime: number
}

export type TrayDowncomerScenario = {
  liquidFlowMultiplier: number
  liquidVolumetricFlowRate: number
  downcomerVelocity: number
  residenceTime: number
  weirOverflowHeight: number
  pressureDropHead: number
  velocityHeadLoss: number
  backupHeight: number
  backupFraction: number
  allowableBackupHeight: number
  backupMarginPercent: number
  residenceMarginPercent: number
  status: TrayDowncomerStatus
}

export type TrayDowncomerResult = {
  grossColumnArea: number
  downcomerArea: number
  minimumDowncomerArea: number
  minimumDowncomerAreaFraction: number
  maximumLiquidFlowByBackup: number
  maximumLiquidFlowByResidence: number
  governingMaximumLiquidFlow: number
  governingConstraint:
    | 'backup'
    | 'residenceTime'
  currentCapacityFraction: number
  selectedScenario: TrayDowncomerScenario
  scenarios: TrayDowncomerScenario[]
  modelName: string
  limitationDescription: string
}
