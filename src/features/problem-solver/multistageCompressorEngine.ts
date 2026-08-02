import {
  replaceConstraintAssignment,
} from './constraintOperatingWindowEngine.ts'

export const
  MULTISTAGE_COMPRESSOR_ENGINE_VERSION =
    'multistage-compressor-intercooling-v1' as const

export type MultistageCompressorInput = {
  inletPressure: number
  outletPressure: number
  inletTemperature: number
  massFlowRate: number
  heatCapacityRatio: number
  specificGasConstant: number
  isentropicEfficiency: number
  mechanicalEfficiency: number
  stageCount: number
  intercoolerOutletTemperature: number
};

export type CompressorStageResult = {
  stageNumber: number
  inletPressure: number
  outletPressure: number
  pressureRatio: number
  inletTemperature: number
  isentropicOutletTemperature: number
  actualOutletTemperature: number
  isentropicSpecificWork: number
  actualSpecificWork: number
  gasPower: number
  shaftPower: number
  intercoolerHeatRemoved: number
};

export type SingleStageCompressorResult = {
  isentropicOutletTemperature: number
  actualOutletTemperature: number
  isentropicSpecificWork: number
  actualSpecificWork: number
  shaftPower: number
};

export type MultistageCompressorAnalysis = {
  compressionRatio: number
  stagePressureRatio: number
  stageCount: number
  specificHeatAtConstantPressure: number
  stages:
    CompressorStageResult[]
  intermediatePressures:
    number[]
  finalDischargeTemperature: number
  totalActualSpecificWork: number
  totalGasPower: number
  totalShaftPower: number
  totalIntercoolerDuty: number
  singleStage:
    SingleStageCompressorResult
  shaftPowerSaving: number
  shaftPowerSavingPercent: number
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

function efficiencyIsValid(
  value: number,
): boolean {
  return (
    positiveFinite(
      value,
    ) &&
    value <=
      1
  )
}

function calculateOutletTemperatures({
  inletTemperature,
  pressureRatio,
  exponent,
  isentropicEfficiency,
}: {
  inletTemperature: number
  pressureRatio: number
  exponent: number
  isentropicEfficiency: number
}) {
  const isentropicOutletTemperature =
    inletTemperature *
    pressureRatio **
      exponent

  const actualOutletTemperature =
    inletTemperature +
    (
      isentropicOutletTemperature -
      inletTemperature
    ) /
    isentropicEfficiency

  return {
    isentropicOutletTemperature,
    actualOutletTemperature,
  }
}

export function calculateSingleStageCompression(
  input:
    MultistageCompressorInput,
): SingleStageCompressorResult | null {
  if (
    !positiveFinite(
      input.inletPressure,
    ) ||
    !positiveFinite(
      input.outletPressure,
    ) ||
    input.outletPressure <=
      input.inletPressure ||
    !positiveFinite(
      input.inletTemperature,
    ) ||
    !positiveFinite(
      input.massFlowRate,
    ) ||
    !positiveFinite(
      input.specificGasConstant,
    ) ||
    input.heatCapacityRatio <=
      1 ||
    !efficiencyIsValid(
      input.isentropicEfficiency,
    ) ||
    !efficiencyIsValid(
      input.mechanicalEfficiency,
    )
  ) {
    return null
  }

  const pressureRatio =
    input.outletPressure /
    input.inletPressure

  const exponent =
    (
      input.heatCapacityRatio -
      1
    ) /
    input.heatCapacityRatio

  const specificHeatAtConstantPressure =
    input.heatCapacityRatio *
    input.specificGasConstant /
    (
      input.heatCapacityRatio -
      1
    )

  const temperatures =
    calculateOutletTemperatures({
      inletTemperature:
        input.inletTemperature,
      pressureRatio,
      exponent,
      isentropicEfficiency:
        input.isentropicEfficiency,
    })

  const isentropicSpecificWork =
    specificHeatAtConstantPressure *
    (
      temperatures
        .isentropicOutletTemperature -
      input.inletTemperature
    )

  const actualSpecificWork =
    specificHeatAtConstantPressure *
    (
      temperatures
        .actualOutletTemperature -
      input.inletTemperature
    )

  return {
    ...temperatures,
    isentropicSpecificWork,
    actualSpecificWork,
    shaftPower:
      input.massFlowRate *
      actualSpecificWork /
      input.mechanicalEfficiency,
  }
}

export function calculateMultistageCompressor(
  input:
    MultistageCompressorInput,
): MultistageCompressorAnalysis | null {
  const singleStage =
    calculateSingleStageCompression(
      input,
    )

  const stageCount =
    Math.trunc(
      input.stageCount,
    )

  if (
    !singleStage ||
    stageCount !==
      input.stageCount ||
    stageCount <
      1 ||
    stageCount >
      8 ||
    !positiveFinite(
      input.intercoolerOutletTemperature,
    )
  ) {
    return null
  }

  const compressionRatio =
    input.outletPressure /
    input.inletPressure

  const stagePressureRatio =
    compressionRatio **
    (
      1 /
      stageCount
    )

  const exponent =
    (
      input.heatCapacityRatio -
      1
    ) /
    input.heatCapacityRatio

  const specificHeatAtConstantPressure =
    input.heatCapacityRatio *
    input.specificGasConstant /
    (
      input.heatCapacityRatio -
      1
    )

  const stages:
    CompressorStageResult[] = []

  for (
    let index =
      0;
    index <
      stageCount;
    index +=
      1
  ) {
    const stageNumber =
      index +
      1

    const inletPressure =
      input.inletPressure *
      stagePressureRatio **
        index

    const outletPressure =
      index ===
        stageCount -
        1
        ? input.outletPressure
        : input.inletPressure *
          stagePressureRatio **
            (
              index +
              1
            )

    const inletTemperature =
      index ===
        0
        ? input.inletTemperature
        : input
            .intercoolerOutletTemperature

    const temperatures =
      calculateOutletTemperatures({
        inletTemperature,
        pressureRatio:
          outletPressure /
          inletPressure,
        exponent,
        isentropicEfficiency:
          input.isentropicEfficiency,
      })

    if (
      index <
        stageCount -
        1 &&
      input
        .intercoolerOutletTemperature >
        temperatures
          .actualOutletTemperature
    ) {
      return null
    }

    const isentropicSpecificWork =
      specificHeatAtConstantPressure *
      (
        temperatures
          .isentropicOutletTemperature -
        inletTemperature
      )

    const actualSpecificWork =
      specificHeatAtConstantPressure *
      (
        temperatures
          .actualOutletTemperature -
        inletTemperature
      )

    const gasPower =
      input.massFlowRate *
      actualSpecificWork

    const shaftPower =
      gasPower /
      input.mechanicalEfficiency

    const intercoolerHeatRemoved =
      index <
        stageCount -
        1
        ? input.massFlowRate *
          specificHeatAtConstantPressure *
          (
            temperatures
              .actualOutletTemperature -
            input
              .intercoolerOutletTemperature
          )
        : 0

    stages.push({
      stageNumber,
      inletPressure,
      outletPressure,
      pressureRatio:
        outletPressure /
        inletPressure,
      inletTemperature,
      ...temperatures,
      isentropicSpecificWork,
      actualSpecificWork,
      gasPower,
      shaftPower,
      intercoolerHeatRemoved,
    })
  }

  const totalActualSpecificWork =
    stages.reduce(
      (
        total,
        stage,
      ) =>
        total +
        stage.actualSpecificWork,
      0,
    )

  const totalGasPower =
    stages.reduce(
      (
        total,
        stage,
      ) =>
        total +
        stage.gasPower,
      0,
    )

  const totalShaftPower =
    stages.reduce(
      (
        total,
        stage,
      ) =>
        total +
        stage.shaftPower,
      0,
    )

  const totalIntercoolerDuty =
    stages.reduce(
      (
        total,
        stage,
      ) =>
        total +
        stage.intercoolerHeatRemoved,
      0,
    )

  const shaftPowerSaving =
    singleStage.shaftPower -
    totalShaftPower

  return {
    compressionRatio,
    stagePressureRatio,
    stageCount,
    specificHeatAtConstantPressure,
    stages,
    intermediatePressures:
      stages
        .slice(
          0,
          -1,
        )
        .map(
          (
            stage,
          ) =>
            stage.outletPressure,
        ),
    finalDischargeTemperature:
      stages[
        stages.length -
        1
      ].actualOutletTemperature,
    totalActualSpecificWork,
    totalGasPower,
    totalShaftPower,
    totalIntercoolerDuty,
    singleStage,
    shaftPowerSaving,
    shaftPowerSavingPercent:
      shaftPowerSaving /
      singleStage.shaftPower *
      100,
  }
}

export function createCompressorDischargeProblem(
  baseQuery: string,
  pressureSymbol: string,
  temperatureSymbol: string,
  outletPressure: number,
  outletTemperature: number,
): string {
  let result =
    replaceConstraintAssignment(
      baseQuery,
      pressureSymbol,
      outletPressure,
    )

  result =
    replaceConstraintAssignment(
      result,
      temperatureSymbol,
      outletTemperature,
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

export function createMultistageCompressorCsv(
  analysis:
    MultistageCompressorAnalysis,
): string {
  const rows:
    (
      string |
      number
    )[][] = [
      [
        'Quantity',
        'Value',
      ],
      [
        'Overall compression ratio',
        analysis.compressionRatio,
      ],
      [
        'Pressure ratio per stage',
        analysis.stagePressureRatio,
      ],
      [
        'Number of stages',
        analysis.stageCount,
      ],
      [
        'Final discharge temperature, K',
        analysis.finalDischargeTemperature,
      ],
      [
        'Multistage shaft power, W',
        analysis.totalShaftPower,
      ],
      [
        'Single-stage shaft power, W',
        analysis.singleStage.shaftPower,
      ],
      [
        'Shaft-power saving, W',
        analysis.shaftPowerSaving,
      ],
      [
        'Shaft-power saving, percent',
        analysis.shaftPowerSavingPercent,
      ],
      [
        'Total intercooler duty, W',
        analysis.totalIntercoolerDuty,
      ],
      [],
      [
        'Stage',
        'Inlet pressure, Pa',
        'Outlet pressure, Pa',
        'Pressure ratio',
        'Inlet temperature, K',
        'Isentropic outlet temperature, K',
        'Actual outlet temperature, K',
        'Actual specific work, J/kg',
        'Shaft power, W',
        'Intercooler heat removed, W',
      ],
      ...analysis.stages.map(
        (
          stage,
        ) => [
          stage.stageNumber,
          stage.inletPressure,
          stage.outletPressure,
          stage.pressureRatio,
          stage.inletTemperature,
          stage.isentropicOutletTemperature,
          stage.actualOutletTemperature,
          stage.actualSpecificWork,
          stage.shaftPower,
          stage.intercoolerHeatRemoved,
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
