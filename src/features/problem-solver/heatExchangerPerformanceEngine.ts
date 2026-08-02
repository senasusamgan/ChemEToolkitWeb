import {
  replaceConstraintAssignment,
} from './constraintOperatingWindowEngine.ts'

export const
  HEAT_EXCHANGER_PERFORMANCE_ENGINE_VERSION =
    'heat-exchanger-performance-v1' as const

export type HeatExchangerArrangement =
  | 'counterflow'
  | 'parallel'

export type HeatExchangerPerformanceInput = {
  arrangement:
    HeatExchangerArrangement
  hotInletTemperature: number
  coldInletTemperature: number
  hotMassFlowRate: number
  coldMassFlowRate: number
  hotSpecificHeat: number
  coldSpecificHeat: number
  operatingOverallHeatTransferCoefficient: number
  cleanOverallHeatTransferCoefficient: number
  heatTransferArea: number
  targetColdOutletTemperature: number
};

export type HeatExchangerRating = {
  overallHeatTransferCoefficient: number
  hotCapacityRate: number
  coldCapacityRate: number
  minimumCapacityRate: number
  maximumCapacityRate: number
  capacityRatio: number
  conductance: number
  numberOfTransferUnits: number
  effectiveness: number
  maximumHeatDuty: number
  heatDuty: number
  hotOutletTemperature: number
  coldOutletTemperature: number
  hotSideHeatDuty: number
  coldSideHeatDuty: number
  energyBalanceError: number
  terminalTemperatureDifferenceOne: number
  terminalTemperatureDifferenceTwo: number
  logarithmicMeanTemperatureDifference:
    number | null
};

export type HeatExchangerDesignTarget = {
  targetColdOutletTemperature: number
  predictedHotOutletTemperature: number
  requiredHeatDuty: number
  requiredEffectiveness: number
  requiredNumberOfTransferUnits: number
  requiredConductance: number
  requiredArea: number
  terminalTemperatureDifferenceOne: number
  terminalTemperatureDifferenceTwo: number
  logarithmicMeanTemperatureDifference:
    number | null
};

export type HeatExchangerPerformanceAnalysis = {
  arrangement:
    HeatExchangerArrangement
  operating:
    HeatExchangerRating
  clean:
    HeatExchangerRating
  foulingResistance: number
  heatDutyLoss: number
  heatDutyLossPercent: number
  designTarget:
    HeatExchangerDesignTarget | null
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

function calculateEffectiveness(
  arrangement:
    HeatExchangerArrangement,
  numberOfTransferUnits: number,
  capacityRatio: number,
): number {
  if (
    arrangement ===
    'parallel'
  ) {
    return (
      1 -
      Math.exp(
        -numberOfTransferUnits *
        (
          1 +
          capacityRatio
        ),
      )
    ) /
    (
      1 +
      capacityRatio
    )
  }

  if (
    Math.abs(
      1 -
      capacityRatio,
    ) <
    1e-10
  ) {
    return (
      numberOfTransferUnits /
      (
        1 +
        numberOfTransferUnits
      )
    )
  }

  const exponentialTerm =
    Math.exp(
      -numberOfTransferUnits *
      (
        1 -
        capacityRatio
      ),
    )

  return (
    1 -
    exponentialTerm
  ) /
  (
    1 -
    capacityRatio *
    exponentialTerm
  )
}

export function calculateLogarithmicMeanTemperatureDifference(
  differenceOne: number,
  differenceTwo: number,
): number | null {
  if (
    !positiveFinite(
      differenceOne,
    ) ||
    !positiveFinite(
      differenceTwo,
    )
  ) {
    return null
  }

  if (
    Math.abs(
      differenceOne -
      differenceTwo,
    ) <
    1e-10
  ) {
    return (
      differenceOne +
      differenceTwo
    ) /
    2
  }

  return (
    differenceOne -
    differenceTwo
  ) /
  Math.log(
    differenceOne /
    differenceTwo,
  )
}

function calculateTerminalDifferences({
  arrangement,
  hotInletTemperature,
  hotOutletTemperature,
  coldInletTemperature,
  coldOutletTemperature,
}: {
  arrangement:
    HeatExchangerArrangement
  hotInletTemperature: number
  hotOutletTemperature: number
  coldInletTemperature: number
  coldOutletTemperature: number
}) {
  if (
    arrangement ===
    'parallel'
  ) {
    return {
      differenceOne:
        hotInletTemperature -
        coldInletTemperature,
      differenceTwo:
        hotOutletTemperature -
        coldOutletTemperature,
    }
  }

  return {
    differenceOne:
      hotInletTemperature -
      coldOutletTemperature,
    differenceTwo:
      hotOutletTemperature -
      coldInletTemperature,
  }
}

function calculateRating({
  arrangement,
  hotInletTemperature,
  coldInletTemperature,
  hotMassFlowRate,
  coldMassFlowRate,
  hotSpecificHeat,
  coldSpecificHeat,
  overallHeatTransferCoefficient,
  heatTransferArea,
}: {
  arrangement:
    HeatExchangerArrangement
  hotInletTemperature: number
  coldInletTemperature: number
  hotMassFlowRate: number
  coldMassFlowRate: number
  hotSpecificHeat: number
  coldSpecificHeat: number
  overallHeatTransferCoefficient: number
  heatTransferArea: number
}): HeatExchangerRating {
  const hotCapacityRate =
    hotMassFlowRate *
    hotSpecificHeat

  const coldCapacityRate =
    coldMassFlowRate *
    coldSpecificHeat

  const minimumCapacityRate =
    Math.min(
      hotCapacityRate,
      coldCapacityRate,
    )

  const maximumCapacityRate =
    Math.max(
      hotCapacityRate,
      coldCapacityRate,
    )

  const capacityRatio =
    minimumCapacityRate /
    maximumCapacityRate

  const conductance =
    overallHeatTransferCoefficient *
    heatTransferArea

  const numberOfTransferUnits =
    conductance /
    minimumCapacityRate

  const effectiveness =
    calculateEffectiveness(
      arrangement,
      numberOfTransferUnits,
      capacityRatio,
    )

  const maximumHeatDuty =
    minimumCapacityRate *
    (
      hotInletTemperature -
      coldInletTemperature
    )

  const heatDuty =
    effectiveness *
    maximumHeatDuty

  const hotOutletTemperature =
    hotInletTemperature -
    heatDuty /
    hotCapacityRate

  const coldOutletTemperature =
    coldInletTemperature +
    heatDuty /
    coldCapacityRate

  const hotSideHeatDuty =
    hotCapacityRate *
    (
      hotInletTemperature -
      hotOutletTemperature
    )

  const coldSideHeatDuty =
    coldCapacityRate *
    (
      coldOutletTemperature -
      coldInletTemperature
    )

  const energyBalanceError =
    hotSideHeatDuty -
    coldSideHeatDuty

  const terminalDifferences =
    calculateTerminalDifferences({
      arrangement,
      hotInletTemperature,
      hotOutletTemperature,
      coldInletTemperature,
      coldOutletTemperature,
    })

  return {
    overallHeatTransferCoefficient,
    hotCapacityRate,
    coldCapacityRate,
    minimumCapacityRate,
    maximumCapacityRate,
    capacityRatio,
    conductance,
    numberOfTransferUnits,
    effectiveness,
    maximumHeatDuty,
    heatDuty,
    hotOutletTemperature,
    coldOutletTemperature,
    hotSideHeatDuty,
    coldSideHeatDuty,
    energyBalanceError,
    terminalTemperatureDifferenceOne:
      terminalDifferences.differenceOne,
    terminalTemperatureDifferenceTwo:
      terminalDifferences.differenceTwo,
    logarithmicMeanTemperatureDifference:
      calculateLogarithmicMeanTemperatureDifference(
        terminalDifferences.differenceOne,
        terminalDifferences.differenceTwo,
      ),
  }
}

function calculateRequiredNumberOfTransferUnits(
  arrangement:
    HeatExchangerArrangement,
  requiredEffectiveness: number,
  capacityRatio: number,
): number | null {
  if (
    !positiveFinite(
      requiredEffectiveness,
    ) ||
    requiredEffectiveness >=
      1
  ) {
    return null
  }

  if (
    arrangement ===
    'parallel'
  ) {
    const logarithmArgument =
      1 -
      requiredEffectiveness *
      (
        1 +
        capacityRatio
      )

    if (
      logarithmArgument <=
      0
    ) {
      return null
    }

    return (
      -Math.log(
        logarithmArgument,
      ) /
      (
        1 +
        capacityRatio
      )
    )
  }

  if (
    Math.abs(
      1 -
      capacityRatio,
    ) <
    1e-10
  ) {
    return (
      requiredEffectiveness /
      (
        1 -
        requiredEffectiveness
      )
    )
  }

  const logarithmArgument =
    (
      1 -
      requiredEffectiveness
    ) /
    (
      1 -
      requiredEffectiveness *
      capacityRatio
    )

  if (
    logarithmArgument <=
    0
  ) {
    return null
  }

  return (
    -Math.log(
      logarithmArgument,
    ) /
    (
      1 -
      capacityRatio
    )
  )
}

function calculateDesignTarget(
  input:
    HeatExchangerPerformanceInput,
  operating:
    HeatExchangerRating,
): HeatExchangerDesignTarget | null {
  if (
    !Number.isFinite(
      input.targetColdOutletTemperature,
    ) ||
    input.targetColdOutletTemperature <=
      input.coldInletTemperature ||
    input.targetColdOutletTemperature >=
      input.hotInletTemperature
  ) {
    return null
  }

  const requiredHeatDuty =
    operating.coldCapacityRate *
    (
      input.targetColdOutletTemperature -
      input.coldInletTemperature
    )

  const requiredEffectiveness =
    requiredHeatDuty /
    operating.maximumHeatDuty

  const requiredNumberOfTransferUnits =
    calculateRequiredNumberOfTransferUnits(
      input.arrangement,
      requiredEffectiveness,
      operating.capacityRatio,
    )

  if (
    requiredNumberOfTransferUnits ===
      null
  ) {
    return null
  }

  const predictedHotOutletTemperature =
    input.hotInletTemperature -
    requiredHeatDuty /
    operating.hotCapacityRate

  const requiredConductance =
    requiredNumberOfTransferUnits *
    operating.minimumCapacityRate

  const requiredArea =
    requiredConductance /
    input.operatingOverallHeatTransferCoefficient

  const terminalDifferences =
    calculateTerminalDifferences({
      arrangement:
        input.arrangement,
      hotInletTemperature:
        input.hotInletTemperature,
      hotOutletTemperature:
        predictedHotOutletTemperature,
      coldInletTemperature:
        input.coldInletTemperature,
      coldOutletTemperature:
        input.targetColdOutletTemperature,
    })

  const logarithmicMeanTemperatureDifference =
    calculateLogarithmicMeanTemperatureDifference(
      terminalDifferences.differenceOne,
      terminalDifferences.differenceTwo,
    )

  if (
    logarithmicMeanTemperatureDifference ===
      null
  ) {
    return null
  }

  return {
    targetColdOutletTemperature:
      input.targetColdOutletTemperature,
    predictedHotOutletTemperature,
    requiredHeatDuty,
    requiredEffectiveness,
    requiredNumberOfTransferUnits,
    requiredConductance,
    requiredArea,
    terminalTemperatureDifferenceOne:
      terminalDifferences.differenceOne,
    terminalTemperatureDifferenceTwo:
      terminalDifferences.differenceTwo,
    logarithmicMeanTemperatureDifference,
  }
}

export function calculateHeatExchangerPerformance(
  input:
    HeatExchangerPerformanceInput,
): HeatExchangerPerformanceAnalysis | null {
  const positiveValues = [
    input.hotInletTemperature,
    input.coldInletTemperature,
    input.hotMassFlowRate,
    input.coldMassFlowRate,
    input.hotSpecificHeat,
    input.coldSpecificHeat,
    input.operatingOverallHeatTransferCoefficient,
    input.cleanOverallHeatTransferCoefficient,
    input.heatTransferArea,
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
    input.hotInletTemperature <=
      input.coldInletTemperature ||
    input.cleanOverallHeatTransferCoefficient <
      input.operatingOverallHeatTransferCoefficient ||
    (
      input.arrangement !==
        'counterflow' &&
      input.arrangement !==
        'parallel'
    )
  ) {
    return null
  }

  const sharedInput = {
    arrangement:
      input.arrangement,
    hotInletTemperature:
      input.hotInletTemperature,
    coldInletTemperature:
      input.coldInletTemperature,
    hotMassFlowRate:
      input.hotMassFlowRate,
    coldMassFlowRate:
      input.coldMassFlowRate,
    hotSpecificHeat:
      input.hotSpecificHeat,
    coldSpecificHeat:
      input.coldSpecificHeat,
    heatTransferArea:
      input.heatTransferArea,
  }

  const operating =
    calculateRating({
      ...sharedInput,
      overallHeatTransferCoefficient:
        input
          .operatingOverallHeatTransferCoefficient,
    })

  const clean =
    calculateRating({
      ...sharedInput,
      overallHeatTransferCoefficient:
        input
          .cleanOverallHeatTransferCoefficient,
    })

  const foulingResistance =
    1 /
    input.operatingOverallHeatTransferCoefficient -
    1 /
    input.cleanOverallHeatTransferCoefficient

  const heatDutyLoss =
    clean.heatDuty -
    operating.heatDuty

  return {
    arrangement:
      input.arrangement,
    operating,
    clean,
    foulingResistance,
    heatDutyLoss,
    heatDutyLossPercent:
      clean.heatDuty ===
        0
        ? 0
        : heatDutyLoss /
          clean.heatDuty *
          100,
    designTarget:
      calculateDesignTarget(
        input,
        operating,
      ),
  }
}

export function createHeatExchangerOutletProblem(
  baseQuery: string,
  hotOutletSymbol: string,
  coldOutletSymbol: string,
  hotOutletTemperature: number,
  coldOutletTemperature: number,
): string {
  let result =
    replaceConstraintAssignment(
      baseQuery,
      hotOutletSymbol,
      hotOutletTemperature,
    )

  result =
    replaceConstraintAssignment(
      result,
      coldOutletSymbol,
      coldOutletTemperature,
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

export function createHeatExchangerPerformanceCsv(
  analysis:
    HeatExchangerPerformanceAnalysis,
): string {
  const rows:
    (
      string |
      number
    )[][] = [
      [
        'Flow arrangement',
        analysis.arrangement,
      ],
      [],
      [
        'Operating performance',
        'Value',
      ],
      [
        'Heat duty, W',
        analysis.operating.heatDuty,
      ],
      [
        'Hot outlet temperature, K',
        analysis
          .operating
          .hotOutletTemperature,
      ],
      [
        'Cold outlet temperature, K',
        analysis
          .operating
          .coldOutletTemperature,
      ],
      [
        'Effectiveness',
        analysis
          .operating
          .effectiveness,
      ],
      [
        'Number of transfer units',
        analysis
          .operating
          .numberOfTransferUnits,
      ],
      [
        'Capacity-rate ratio',
        analysis
          .operating
          .capacityRatio,
      ],
      [
        'Conductance UA, W/K',
        analysis
          .operating
          .conductance,
      ],
      [
        'LMTD, K',
        analysis
          .operating
          .logarithmicMeanTemperatureDifference ??
        '',
      ],
      [],
      [
        'Fouling comparison',
        'Value',
      ],
      [
        'Clean heat duty, W',
        analysis.clean.heatDuty,
      ],
      [
        'Heat-duty loss, W',
        analysis.heatDutyLoss,
      ],
      [
        'Heat-duty loss, percent',
        analysis.heatDutyLossPercent,
      ],
      [
        'Fouling resistance, m2 K/W',
        analysis.foulingResistance,
      ],
    ]

  if (
    analysis.designTarget
  ) {
    rows.push(
      [],
      [
        'Target design',
        'Value',
      ],
      [
        'Target cold outlet temperature, K',
        analysis
          .designTarget
          .targetColdOutletTemperature,
      ],
      [
        'Predicted hot outlet temperature, K',
        analysis
          .designTarget
          .predictedHotOutletTemperature,
      ],
      [
        'Required heat duty, W',
        analysis
          .designTarget
          .requiredHeatDuty,
      ],
      [
        'Required effectiveness',
        analysis
          .designTarget
          .requiredEffectiveness,
      ],
      [
        'Required NTU',
        analysis
          .designTarget
          .requiredNumberOfTransferUnits,
      ],
      [
        'Required UA, W/K',
        analysis
          .designTarget
          .requiredConductance,
      ],
      [
        'Required area, m2',
        analysis
          .designTarget
          .requiredArea,
      ],
    )
  }

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
