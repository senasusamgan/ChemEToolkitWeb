import type {
  TrayDowncomerInput,
  TrayDowncomerResult,
  TrayDowncomerScenario,
  TrayDowncomerStatus,
} from './types.ts'

export const
  TRAY_DOWNCOMER_BACKUP_ENGINE_VERSION =
    'tray-downcomer-backup-v1' as const

const GRAVITY = 9.80665
const FRANCIS_WEIR_COEFFICIENT = 1.84

export type TrayDowncomerErrorCode =
  | 'nonFiniteInput'
  | 'invalidFlowRate'
  | 'invalidColumnGeometry'
  | 'invalidDowncomerFraction'
  | 'invalidWeirGeometry'
  | 'invalidPressureDrop'
  | 'invalidLiquidDensity'
  | 'invalidLossCoefficient'
  | 'invalidBackupFraction'
  | 'invalidResidenceTime'
  | 'noHydraulicHeadroom'
  | 'numericalFailure'

const errorMessages: Record<
  TrayDowncomerErrorCode,
  string
> = {
  nonFiniteInput:
    'All downcomer inputs must be finite numbers.',
  invalidFlowRate:
    'Liquid volumetric flow rate must be greater than zero.',
  invalidColumnGeometry:
    'Column diameter and tray spacing must be greater than zero.',
  invalidDowncomerFraction:
    'Downcomer area fraction must satisfy 0 < fraction < 0.5.',
  invalidWeirGeometry:
    'Weir length must be positive and no greater than the column circumference. Weir height must satisfy 0 ≤ height < tray spacing.',
  invalidPressureDrop:
    'Tray pressure drop must be greater than zero.',
  invalidLiquidDensity:
    'Liquid density must be greater than zero.',
  invalidLossCoefficient:
    'Downcomer loss coefficient must be zero or greater.',
  invalidBackupFraction:
    'Allowable backup fraction must satisfy 0 < fraction < 1.',
  invalidResidenceTime:
    'Minimum downcomer residence time must be greater than zero.',
  noHydraulicHeadroom:
    'The static weir and tray-pressure-drop heads already exceed the allowable downcomer backup height.',
  numericalFailure:
    'The downcomer calculation did not produce finite physical results.',
}

export class TrayDowncomerCalculationError
  extends Error {
  readonly code: TrayDowncomerErrorCode

  constructor(
    code: TrayDowncomerErrorCode,
  ) {
    super(
      errorMessages[code],
    )

    this.name =
      'TrayDowncomerCalculationError'

    this.code =
      code
  }
}

function validateInput(
  input: TrayDowncomerInput,
) {
  const values =
    Object.values(input)

  if (
    !values.every(
      Number.isFinite,
    )
  ) {
    throw new TrayDowncomerCalculationError(
      'nonFiniteInput',
    )
  }

  if (
    input.liquidVolumetricFlowRate <= 0
  ) {
    throw new TrayDowncomerCalculationError(
      'invalidFlowRate',
    )
  }

  if (
    input.columnDiameter <= 0 ||
    input.traySpacing <= 0
  ) {
    throw new TrayDowncomerCalculationError(
      'invalidColumnGeometry',
    )
  }

  if (
    input.downcomerAreaFraction <= 0 ||
    input.downcomerAreaFraction >= 0.5
  ) {
    throw new TrayDowncomerCalculationError(
      'invalidDowncomerFraction',
    )
  }

  if (
    input.weirLength <= 0 ||
    input.weirLength >
      Math.PI *
      input.columnDiameter ||
    input.weirHeight < 0 ||
    input.weirHeight >=
      input.traySpacing
  ) {
    throw new TrayDowncomerCalculationError(
      'invalidWeirGeometry',
    )
  }

  if (
    input.trayPressureDrop <= 0
  ) {
    throw new TrayDowncomerCalculationError(
      'invalidPressureDrop',
    )
  }

  if (
    input.liquidDensity <= 0
  ) {
    throw new TrayDowncomerCalculationError(
      'invalidLiquidDensity',
    )
  }

  if (
    input.downcomerLossCoefficient < 0
  ) {
    throw new TrayDowncomerCalculationError(
      'invalidLossCoefficient',
    )
  }

  if (
    input.allowableBackupFraction <= 0 ||
    input.allowableBackupFraction >= 1
  ) {
    throw new TrayDowncomerCalculationError(
      'invalidBackupFraction',
    )
  }

  if (
    input.minimumResidenceTime <= 0
  ) {
    throw new TrayDowncomerCalculationError(
      'invalidResidenceTime',
    )
  }
}

export function calculateDowncomerWeirOverflowHeight(
  liquidVolumetricFlowRate: number,
  weirLength: number,
): number {
  return (
    liquidVolumetricFlowRate /
    (
      FRANCIS_WEIR_COEFFICIENT *
      weirLength
    )
  ) ** (2 / 3)
}

function determineDowncomerStatus({
  backupFraction,
  residenceTime,
  allowableBackupFraction,
  minimumResidenceTime,
}: {
  backupFraction: number
  residenceTime: number
  allowableBackupFraction: number
  minimumResidenceTime: number
}): TrayDowncomerStatus {
  if (
    backupFraction >= 1
  ) {
    return 'flooded'
  }

  if (
    backupFraction >
    allowableBackupFraction
  ) {
    return 'highBackup'
  }

  if (
    residenceTime <
    minimumResidenceTime
  ) {
    return 'shortResidence'
  }

  if (
    backupFraction >
      0.85 *
      allowableBackupFraction ||
    residenceTime <
      1.25 *
      minimumResidenceTime
  ) {
    return 'marginal'
  }

  return 'acceptable'
}

export function calculateTrayDowncomerScenario({
  input,
  liquidFlowMultiplier,
  downcomerArea,
}: {
  input: TrayDowncomerInput
  liquidFlowMultiplier: number
  downcomerArea: number
}): TrayDowncomerScenario {
  const liquidVolumetricFlowRate =
    input.liquidVolumetricFlowRate *
    liquidFlowMultiplier

  const downcomerVelocity =
    liquidVolumetricFlowRate /
    downcomerArea

  const residenceTime =
    downcomerArea *
    input.traySpacing /
    liquidVolumetricFlowRate

  const weirOverflowHeight =
    calculateDowncomerWeirOverflowHeight(
      liquidVolumetricFlowRate,
      input.weirLength,
    )

  const pressureDropHead =
    input.trayPressureDrop /
    (
      input.liquidDensity *
      GRAVITY
    )

  const velocityHeadLoss =
    input.downcomerLossCoefficient *
    downcomerVelocity ** 2 /
    (
      2 *
      GRAVITY
    )

  const backupHeight =
    input.weirHeight +
    weirOverflowHeight +
    pressureDropHead +
    velocityHeadLoss

  const backupFraction =
    backupHeight /
    input.traySpacing

  const allowableBackupHeight =
    input.allowableBackupFraction *
    input.traySpacing

  const backupMarginPercent =
    (
      allowableBackupHeight -
      backupHeight
    ) /
    allowableBackupHeight *
    100

  const residenceMarginPercent =
    (
      residenceTime -
      input.minimumResidenceTime
    ) /
    input.minimumResidenceTime *
    100

  const values = [
    liquidVolumetricFlowRate,
    downcomerVelocity,
    residenceTime,
    weirOverflowHeight,
    pressureDropHead,
    velocityHeadLoss,
    backupHeight,
    backupFraction,
    allowableBackupHeight,
    backupMarginPercent,
    residenceMarginPercent,
  ]

  if (
    !values.every(
      Number.isFinite,
    ) ||
    liquidVolumetricFlowRate <= 0 ||
    downcomerVelocity <= 0 ||
    residenceTime <= 0 ||
    backupHeight <= 0 ||
    backupFraction <= 0 ||
    allowableBackupHeight <= 0
  ) {
    throw new TrayDowncomerCalculationError(
      'numericalFailure',
    )
  }

  return {
    liquidFlowMultiplier,
    liquidVolumetricFlowRate,
    downcomerVelocity,
    residenceTime,
    weirOverflowHeight,
    pressureDropHead,
    velocityHeadLoss,
    backupHeight,
    backupFraction,
    allowableBackupHeight,
    backupMarginPercent,
    residenceMarginPercent,
    status:
      determineDowncomerStatus({
        backupFraction,
        residenceTime,
        allowableBackupFraction:
          input.allowableBackupFraction,
        minimumResidenceTime:
          input.minimumResidenceTime,
      }),
  }
}

function calculateBackupHeightAtFlow({
  input,
  downcomerArea,
  liquidVolumetricFlowRate,
}: {
  input: TrayDowncomerInput
  downcomerArea: number
  liquidVolumetricFlowRate: number
}): number {
  const downcomerVelocity =
    liquidVolumetricFlowRate /
    downcomerArea

  const weirOverflowHeight =
    liquidVolumetricFlowRate > 0
      ? calculateDowncomerWeirOverflowHeight(
          liquidVolumetricFlowRate,
          input.weirLength,
        )
      : 0

  const pressureDropHead =
    input.trayPressureDrop /
    (
      input.liquidDensity *
      GRAVITY
    )

  const velocityHeadLoss =
    input.downcomerLossCoefficient *
    downcomerVelocity ** 2 /
    (
      2 *
      GRAVITY
    )

  return (
    input.weirHeight +
    weirOverflowHeight +
    pressureDropHead +
    velocityHeadLoss
  )
}

export function calculateMaximumLiquidFlowByBackup({
  input,
  downcomerArea,
}: {
  input: TrayDowncomerInput
  downcomerArea: number
}): number {
  const allowableBackupHeight =
    input.allowableBackupFraction *
    input.traySpacing

  const zeroFlowBackupHeight =
    calculateBackupHeightAtFlow({
      input,
      downcomerArea,
      liquidVolumetricFlowRate: 0,
    })

  if (
    zeroFlowBackupHeight >=
    allowableBackupHeight
  ) {
    throw new TrayDowncomerCalculationError(
      'noHydraulicHeadroom',
    )
  }

  let lowerFlow = 0
  let upperFlow =
    input.liquidVolumetricFlowRate

  for (
    let index = 0;
    index < 100;
    index += 1
  ) {
    const upperBackupHeight =
      calculateBackupHeightAtFlow({
        input,
        downcomerArea,
        liquidVolumetricFlowRate:
          upperFlow,
      })

    if (
      upperBackupHeight >=
      allowableBackupHeight
    ) {
      break
    }

    upperFlow *= 2

    if (
      !Number.isFinite(
        upperFlow,
      )
    ) {
      throw new TrayDowncomerCalculationError(
        'numericalFailure',
      )
    }
  }

  if (
    calculateBackupHeightAtFlow({
      input,
      downcomerArea,
      liquidVolumetricFlowRate:
        upperFlow,
    }) <
    allowableBackupHeight
  ) {
    throw new TrayDowncomerCalculationError(
      'numericalFailure',
    )
  }

  for (
    let index = 0;
    index < 120;
    index += 1
  ) {
    const midpoint =
      (
        lowerFlow +
        upperFlow
      ) /
      2

    const midpointBackupHeight =
      calculateBackupHeightAtFlow({
        input,
        downcomerArea,
        liquidVolumetricFlowRate:
          midpoint,
      })

    if (
      midpointBackupHeight <
      allowableBackupHeight
    ) {
      lowerFlow =
        midpoint
    } else {
      upperFlow =
        midpoint
    }
  }

  return (
    lowerFlow +
    upperFlow
  ) /
  2
}

export function calculateTrayDowncomerBackup(
  input: TrayDowncomerInput,
): TrayDowncomerResult {
  validateInput(input)

  const grossColumnArea =
    Math.PI *
    input.columnDiameter ** 2 /
    4

  const downcomerArea =
    grossColumnArea *
    input.downcomerAreaFraction

  const minimumDowncomerArea =
    input.liquidVolumetricFlowRate *
    input.minimumResidenceTime /
    input.traySpacing

  const minimumDowncomerAreaFraction =
    minimumDowncomerArea /
    grossColumnArea

  const maximumLiquidFlowByBackup =
    calculateMaximumLiquidFlowByBackup({
      input,
      downcomerArea,
    })

  const maximumLiquidFlowByResidence =
    downcomerArea *
    input.traySpacing /
    input.minimumResidenceTime

  const governingConstraint =
    maximumLiquidFlowByBackup <=
    maximumLiquidFlowByResidence
      ? 'backup'
      : 'residenceTime'

  const governingMaximumLiquidFlow =
    Math.min(
      maximumLiquidFlowByBackup,
      maximumLiquidFlowByResidence,
    )

  const currentCapacityFraction =
    input.liquidVolumetricFlowRate /
    governingMaximumLiquidFlow

  const scenarios = [
    0.5,
    1,
    2,
    2.5,
    3,
    4,
  ].map(
    (
      liquidFlowMultiplier,
    ) =>
      calculateTrayDowncomerScenario({
        input,
        liquidFlowMultiplier,
        downcomerArea,
      }),
  )

  const selectedScenario =
    scenarios.find(
      (
        scenario,
      ) =>
        scenario.liquidFlowMultiplier ===
        1,
    )

  const values = [
    grossColumnArea,
    downcomerArea,
    minimumDowncomerArea,
    minimumDowncomerAreaFraction,
    maximumLiquidFlowByBackup,
    maximumLiquidFlowByResidence,
    governingMaximumLiquidFlow,
    currentCapacityFraction,
  ]

  if (
    !selectedScenario ||
    !values.every(
      Number.isFinite,
    ) ||
    grossColumnArea <= 0 ||
    downcomerArea <= 0 ||
    minimumDowncomerArea <= 0 ||
    maximumLiquidFlowByBackup <= 0 ||
    maximumLiquidFlowByResidence <= 0 ||
    governingMaximumLiquidFlow <= 0 ||
    currentCapacityFraction <= 0
  ) {
    throw new TrayDowncomerCalculationError(
      'numericalFailure',
    )
  }

  return {
    grossColumnArea,
    downcomerArea,
    minimumDowncomerArea,
    minimumDowncomerAreaFraction,
    maximumLiquidFlowByBackup,
    maximumLiquidFlowByResidence,
    governingMaximumLiquidFlow,
    governingConstraint,
    currentCapacityFraction,
    selectedScenario,
    scenarios,
    modelName:
      'Tray downcomer backup and liquid residence-time screening',
    limitationDescription:
      'This shortcut combines clear-liquid weir overflow, tray pressure-drop head and a velocity-head loss estimate. Final tray design still requires aerated liquid and froth density, downcomer entrance and exit geometry, seal depth, apron clearance, dynamic backup, foaming, entrainment and vendor hydraulic correlations.',
  }
}

function csvCell(
  value: string | number,
): string {
  return `"${String(value).replace(
    /"/g,
    '""',
  )}"`
}

export function createTrayDowncomerCsv(
  input: TrayDowncomerInput,
  result: TrayDowncomerResult,
): string {
  const rows: (
    string |
    number
  )[][] = [
    [
      'Tray Downcomer Backup and Residence Time',
      '',
    ],
    [],
    [
      'Input',
      'Value',
    ],
    [
      'Liquid volumetric flow rate, m3/s',
      input.liquidVolumetricFlowRate,
    ],
    [
      'Column diameter, m',
      input.columnDiameter,
    ],
    [
      'Downcomer area fraction',
      input.downcomerAreaFraction,
    ],
    [
      'Tray spacing, m',
      input.traySpacing,
    ],
    [
      'Weir length, m',
      input.weirLength,
    ],
    [
      'Weir height, m',
      input.weirHeight,
    ],
    [
      'Tray pressure drop, Pa',
      input.trayPressureDrop,
    ],
    [
      'Liquid density, kg/m3',
      input.liquidDensity,
    ],
    [
      'Downcomer loss coefficient',
      input.downcomerLossCoefficient,
    ],
    [
      'Allowable backup fraction',
      input.allowableBackupFraction,
    ],
    [
      'Minimum residence time, s',
      input.minimumResidenceTime,
    ],
    [],
    [
      'Primary result',
      'Value',
    ],
    [
      'Gross column area, m2',
      result.grossColumnArea,
    ],
    [
      'Downcomer area, m2',
      result.downcomerArea,
    ],
    [
      'Minimum downcomer area, m2',
      result.minimumDowncomerArea,
    ],
    [
      'Minimum downcomer area fraction',
      result.minimumDowncomerAreaFraction,
    ],
    [
      'Maximum liquid flow by backup, m3/s',
      result.maximumLiquidFlowByBackup,
    ],
    [
      'Maximum liquid flow by residence time, m3/s',
      result.maximumLiquidFlowByResidence,
    ],
    [
      'Governing maximum liquid flow, m3/s',
      result.governingMaximumLiquidFlow,
    ],
    [
      'Governing constraint',
      result.governingConstraint,
    ],
    [
      'Current capacity fraction',
      result.currentCapacityFraction,
    ],
    [],
    [
      'Liquid flow multiplier',
      'Liquid flow, m3/s',
      'Downcomer velocity, m/s',
      'Residence time, s',
      'Weir overflow height, m',
      'Pressure-drop head, m',
      'Velocity-head loss, m',
      'Backup height, m',
      'Backup fraction',
      'Backup margin, percent',
      'Residence margin, percent',
      'Status',
    ],
    ...result.scenarios.map(
      (
        scenario,
      ) => [
        scenario.liquidFlowMultiplier,
        scenario.liquidVolumetricFlowRate,
        scenario.downcomerVelocity,
        scenario.residenceTime,
        scenario.weirOverflowHeight,
        scenario.pressureDropHead,
        scenario.velocityHeadLoss,
        scenario.backupHeight,
        scenario.backupFraction,
        scenario.backupMarginPercent,
        scenario.residenceMarginPercent,
        scenario.status,
      ],
    ),
  ]

  return rows
    .map(
      (
        row,
      ) =>
        row
          .map(
            csvCell,
          )
          .join(','),
    )
    .join('\n')
}
