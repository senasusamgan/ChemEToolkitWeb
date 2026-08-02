import {
  replaceConstraintAssignment,
} from './constraintOperatingWindowEngine.ts'

export const
  PUMP_AFFINITY_SYSTEM_ENGINE_VERSION =
    'pump-affinity-system-curve-v1' as const

export type PumpAffinityInput = {
  referenceFlowRate: number
  referenceHead: number
  referenceSpeedRpm: number
  referenceImpellerDiameter: number
  targetSpeedRpm: number
  targetImpellerDiameter: number
  referenceShutoffHead: number
  staticHead: number
  systemResistanceCoefficient: number
  density: number
  efficiency: number
  gravity: number
};

export type PumpAffinityPrediction = {
  speedRatio: number
  diameterRatio: number
  flowScaleRatio: number
  headScaleRatio: number
  powerScaleRatio: number
  predictedFlowRate: number
  predictedHead: number
  referenceHydraulicPower: number
  referenceShaftPower: number
  predictedShaftPower: number
};

export type PumpCurvePoint = {
  index: number
  flowRate: number
  pumpHead: number
  systemHead: number
  headDifference: number
};

export type PumpOperatingPoint = {
  flowRate: number
  head: number
  hydraulicPower: number
  shaftPower: number
  pumpCurveCoefficient: number
  scaledShutoffHead: number
};

export type PumpSystemAnalysis = {
  affinity:
    PumpAffinityPrediction
  operatingPoint:
    PumpOperatingPoint
  curvePoints:
    PumpCurvePoint[]
  flowDifferencePercent: number
  headDifferencePercent: number
  powerDifferencePercent: number
};

function positiveFinite(
  value: number,
): boolean {
  return (
    Number.isFinite(
      value,
    ) &&
    value >
      0
  )
}

function nonnegativeFinite(
  value: number,
): boolean {
  return (
    Number.isFinite(
      value,
    ) &&
    value >=
      0
  )
}

export function calculatePumpAffinityPrediction(
  input:
    PumpAffinityInput,
): PumpAffinityPrediction | null {
  const positiveValues = [
    input.referenceFlowRate,
    input.referenceHead,
    input.referenceSpeedRpm,
    input.referenceImpellerDiameter,
    input.targetSpeedRpm,
    input.targetImpellerDiameter,
    input.density,
    input.efficiency,
    input.gravity,
  ]

  if (
    positiveValues.some(
      (
        value,
      ) =>
        !positiveFinite(
          value,
        ),
    ) ||
    input.efficiency >
      1
  ) {
    return null
  }

  const speedRatio =
    input.targetSpeedRpm /
    input.referenceSpeedRpm

  const diameterRatio =
    input.targetImpellerDiameter /
    input.referenceImpellerDiameter

  const flowScaleRatio =
    speedRatio *
    diameterRatio

  const headScaleRatio =
    speedRatio **
      2 *
    diameterRatio **
      2

  const powerScaleRatio =
    speedRatio **
      3 *
    diameterRatio **
      5

  const referenceHydraulicPower =
    input.density *
    input.gravity *
    input.referenceFlowRate *
    input.referenceHead

  const referenceShaftPower =
    referenceHydraulicPower /
    input.efficiency

  return {
    speedRatio,
    diameterRatio,
    flowScaleRatio,
    headScaleRatio,
    powerScaleRatio,
    predictedFlowRate:
      input.referenceFlowRate *
      flowScaleRatio,
    predictedHead:
      input.referenceHead *
      headScaleRatio,
    referenceHydraulicPower,
    referenceShaftPower,
    predictedShaftPower:
      referenceShaftPower *
      powerScaleRatio,
  }
}

export function calculatePumpOperatingPoint(
  input:
    PumpAffinityInput,
  affinity:
    PumpAffinityPrediction,
): PumpOperatingPoint | null {
  if (
    !positiveFinite(
      input.referenceShutoffHead,
    ) ||
    input.referenceShutoffHead <=
      input.referenceHead ||
    !nonnegativeFinite(
      input.staticHead,
    ) ||
    !nonnegativeFinite(
      input.systemResistanceCoefficient,
    )
  ) {
    return null
  }

  const referenceCurveCoefficient =
    (
      input.referenceShutoffHead -
      input.referenceHead
    ) /
    (
      input.referenceFlowRate **
      2
    )

  const scaledShutoffHead =
    input.referenceShutoffHead *
    affinity.headScaleRatio

  const pumpCurveCoefficient =
    affinity.headScaleRatio *
    referenceCurveCoefficient /
    (
      affinity.flowScaleRatio **
      2
    )

  const numerator =
    scaledShutoffHead -
    input.staticHead

  const denominator =
    pumpCurveCoefficient +
    input.systemResistanceCoefficient

  if (
    numerator <=
      0 ||
    denominator <=
      0
  ) {
    return null
  }

  const flowRate =
    Math.sqrt(
      numerator /
      denominator,
    )

  const head =
    input.staticHead +
    input.systemResistanceCoefficient *
    flowRate **
      2

  const hydraulicPower =
    input.density *
    input.gravity *
    flowRate *
    head

  return {
    flowRate,
    head,
    hydraulicPower,
    shaftPower:
      hydraulicPower /
      input.efficiency,
    pumpCurveCoefficient,
    scaledShutoffHead,
  }
}

export function createPumpCurvePoints(
  input:
    PumpAffinityInput,
  affinity:
    PumpAffinityPrediction,
  operatingPoint:
    PumpOperatingPoint,
  pointCount = 21,
): PumpCurvePoint[] {
  const safePointCount =
    Math.max(
      5,
      Math.min(
        41,
        Math.trunc(
          pointCount,
        ),
      ),
    )

  const maximumFlow =
    Math.max(
      affinity.predictedFlowRate,
      operatingPoint.flowRate,
    ) *
    1.35

  return Array.from(
    {
      length:
        safePointCount,
    },
    (
      _,
      index,
    ) => {
      const flowRate =
        maximumFlow *
        index /
        (
          safePointCount -
          1
        )

      const pumpHead =
        Math.max(
          0,
          operatingPoint.scaledShutoffHead -
          operatingPoint.pumpCurveCoefficient *
          flowRate **
            2,
        )

      const systemHead =
        input.staticHead +
        input.systemResistanceCoefficient *
        flowRate **
          2

      return {
        index,
        flowRate,
        pumpHead,
        systemHead,
        headDifference:
          pumpHead -
          systemHead,
      }
    },
  )
}

function percentageDifference(
  actual: number,
  reference: number,
): number {
  if (
    reference ===
    0
  ) {
    return 0
  }

  return (
    (
      actual -
      reference
    ) /
    reference *
    100
  )
}

export function calculatePumpSystemAnalysis(
  input:
    PumpAffinityInput,
): PumpSystemAnalysis | null {
  const affinity =
    calculatePumpAffinityPrediction(
      input,
    )

  if (!affinity) {
    return null
  }

  const operatingPoint =
    calculatePumpOperatingPoint(
      input,
      affinity,
    )

  if (!operatingPoint) {
    return null
  }

  const curvePoints =
    createPumpCurvePoints(
      input,
      affinity,
      operatingPoint,
    )

  return {
    affinity,
    operatingPoint,
    curvePoints,
    flowDifferencePercent:
      percentageDifference(
        operatingPoint.flowRate,
        affinity.predictedFlowRate,
      ),
    headDifferencePercent:
      percentageDifference(
        operatingPoint.head,
        affinity.predictedHead,
      ),
    powerDifferencePercent:
      percentageDifference(
        operatingPoint.shaftPower,
        affinity.predictedShaftPower,
      ),
  }
}

export function createPumpOperatingProblem(
  baseQuery: string,
  flowSymbol: string,
  headSymbol: string,
  speedSymbol: string,
  operatingFlowRate: number,
  operatingHead: number,
  targetSpeedRpm: number,
): string {
  let result =
    replaceConstraintAssignment(
      baseQuery,
      flowSymbol,
      operatingFlowRate,
    )

  result =
    replaceConstraintAssignment(
      result,
      headSymbol,
      operatingHead,
    )

  result =
    replaceConstraintAssignment(
      result,
      speedSymbol,
      targetSpeedRpm,
    )

  return result
}

function csvCell(
  value:
    string | number,
): string {
  const text =
    String(
      value,
    )

  return `"${text.replace(
    /"/g,
    '""',
  )}"`
}

export function createPumpSystemCsv(
  analysis:
    PumpSystemAnalysis,
): string {
  const summaryRows:
    (
      string |
      number
    )[][] = [
      [
        'Quantity',
        'Value',
      ],
      [
        'Speed ratio',
        analysis.affinity.speedRatio,
      ],
      [
        'Impeller diameter ratio',
        analysis.affinity.diameterRatio,
      ],
      [
        'Affinity flow prediction, m3/s',
        analysis.affinity.predictedFlowRate,
      ],
      [
        'Affinity head prediction, m',
        analysis.affinity.predictedHead,
      ],
      [
        'Affinity shaft-power prediction, W',
        analysis.affinity.predictedShaftPower,
      ],
      [
        'System operating flow, m3/s',
        analysis.operatingPoint.flowRate,
      ],
      [
        'System operating head, m',
        analysis.operatingPoint.head,
      ],
      [
        'System operating shaft power, W',
        analysis.operatingPoint.shaftPower,
      ],
      [
        'Flow difference, percent',
        analysis.flowDifferencePercent,
      ],
      [
        'Head difference, percent',
        analysis.headDifferencePercent,
      ],
      [
        'Power difference, percent',
        analysis.powerDifferencePercent,
      ],
      [],
      [
        'Point',
        'Flow rate, m3/s',
        'Pump head, m',
        'System head, m',
        'Pump minus system head, m',
      ],
      ...analysis.curvePoints.map(
        (
          point,
        ) => [
          point.index,
          point.flowRate,
          point.pumpHead,
          point.systemHead,
          point.headDifference,
        ],
      ),
    ]

  return summaryRows
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
