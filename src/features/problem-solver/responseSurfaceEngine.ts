import {
  createConstraintRange,
  replaceConstraintAssignment,
} from './constraintOperatingWindowEngine.ts'

export const
  RESPONSE_SURFACE_ENGINE_VERSION =
    'response-surface-model-v1' as const

export type ResponseSurfaceObjective =
  | 'maximize'
  | 'minimize'

export interface ResponseSurfaceVariable {
  symbol: string
  minimum: number
  maximum: number
  steps: number
}

export interface ResponseSurfaceDesignPoint {
  id: string
  row: number
  column: number
  xSymbol: string
  xValue: number
  ySymbol:
    string | null
  yValue:
    number | null
  problem: string
}

export interface ResponseSurfaceSample
  extends ResponseSurfaceDesignPoint {
  outputValue:
    number | null
}

export interface ResponseSurfaceModel {
  dimension:
    1 | 2
  xSymbol: string
  ySymbol:
    string | null
  xMinimum: number
  xMaximum: number
  yMinimum:
    number | null
  yMaximum:
    number | null
  coefficients:
    number[]
  resolvedSampleCount: number
  totalSampleCount: number
  rmse: number
  mae: number
  rSquared:
    number | null
}

export interface ResponseSurfaceOptimum {
  xValue: number
  yValue:
    number | null
  predictedValue: number
  problem: string
}

export interface ResponseSurfaceCsvSample
  extends ResponseSurfaceSample {
  calculatorTitle: string
  outputLabel: string
  outputUnit: string
}

function codedValue(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return (
    2 *
      (
        value -
        minimum
      ) /
      (
        maximum -
        minimum
      )
  ) -
    1
}

function featureVector(
  codedX: number,
  codedY:
    number | null,
  dimension:
    1 | 2,
): number[] {
  if (
    dimension ===
    1
  ) {
    return [
      1,
      codedX,
      codedX **
        2,
    ]
  }

  const resolvedY =
    codedY ??
    0

  return [
    1,
    codedX,
    resolvedY,
    codedX **
      2,
    resolvedY **
      2,
    codedX *
      resolvedY,
  ]
}

function solveLinearSystem(
  matrix:
    number[][],
  values:
    number[],
): number[] | null {
  const size =
    values.length

  const augmented =
    matrix.map(
      (
        row,
        index,
      ) => [
        ...row,
        values[
          index
        ],
      ],
    )

  for (
    let pivotIndex =
      0;
    pivotIndex <
      size;
    pivotIndex +=
      1
  ) {
    let maximumRow =
      pivotIndex

    for (
      let rowIndex =
        pivotIndex +
        1;
      rowIndex <
        size;
      rowIndex +=
        1
    ) {
      if (
        Math.abs(
          augmented[
            rowIndex
          ][
            pivotIndex
          ],
        ) >
        Math.abs(
          augmented[
            maximumRow
          ][
            pivotIndex
          ],
        )
      ) {
        maximumRow =
          rowIndex
      }
    }

    if (
      Math.abs(
        augmented[
          maximumRow
        ][
          pivotIndex
        ],
      ) <
      1e-12
    ) {
      return null
    }

    if (
      maximumRow !==
      pivotIndex
    ) {
      const temporary =
        augmented[
          pivotIndex
        ]

      augmented[
        pivotIndex
      ] =
        augmented[
          maximumRow
        ]

      augmented[
        maximumRow
      ] =
        temporary
    }

    const pivot =
      augmented[
        pivotIndex
      ][
        pivotIndex
      ]

    for (
      let columnIndex =
        pivotIndex;
      columnIndex <=
        size;
      columnIndex +=
        1
    ) {
      augmented[
        pivotIndex
      ][
        columnIndex
      ] /=
        pivot
    }

    for (
      let rowIndex =
        0;
      rowIndex <
        size;
      rowIndex +=
        1
    ) {
      if (
        rowIndex ===
        pivotIndex
      ) {
        continue
      }

      const factor =
        augmented[
          rowIndex
        ][
          pivotIndex
        ]

      for (
        let columnIndex =
          pivotIndex;
        columnIndex <=
          size;
        columnIndex +=
          1
      ) {
        augmented[
          rowIndex
        ][
          columnIndex
        ] -=
          factor *
          augmented[
            pivotIndex
          ][
            columnIndex
          ]
      }
    }
  }

  return augmented.map(
    (
      row,
    ) =>
      row[
        size
      ],
  )
}

function calculatePrediction(
  coefficients:
    number[],
  features:
    number[],
): number {
  return coefficients.reduce(
    (
      total,
      coefficient,
      index,
    ) =>
      total +
      coefficient *
      features[
        index
      ],
    0,
  )
}

export function createResponseSurfaceDesign(
  baseQuery: string,
  xVariable:
    ResponseSurfaceVariable,
  yVariable?:
    ResponseSurfaceVariable | null,
): ResponseSurfaceDesignPoint[] {
  const xValues =
    createConstraintRange(
      xVariable.minimum,
      xVariable.maximum,
      xVariable.steps,
    )

  if (
    xValues.length ===
    0
  ) {
    return []
  }

  const yValues =
    yVariable
      ? createConstraintRange(
          yVariable.minimum,
          yVariable.maximum,
          yVariable.steps,
        )
      : [
          null,
        ]

  if (
    yValues.length ===
    0
  ) {
    return []
  }

  const points:
    ResponseSurfaceDesignPoint[] = []

  for (
    let row =
      0;
    row <
      yValues.length;
    row +=
      1
  ) {
    const yValue =
      yValues[
        row
      ]

    for (
      let column =
        0;
      column <
        xValues.length;
      column +=
        1
    ) {
      const xValue =
        xValues[
          column
        ]

      let problem =
        replaceConstraintAssignment(
          baseQuery,
          xVariable.symbol,
          xValue,
        )

      if (
        yVariable &&
        yValue !==
          null
      ) {
        problem =
          replaceConstraintAssignment(
            problem,
            yVariable.symbol,
            yValue,
          )
      }

      points.push({
        id:
          `${row}-${column}`,
        row,
        column,
        xSymbol:
          xVariable.symbol,
        xValue,
        ySymbol:
          yVariable
            ?.symbol ??
          null,
        yValue,
        problem,
      })
    }
  }

  return points
}

export function fitResponseSurface(
  samples:
    ResponseSurfaceSample[],
  xVariable:
    ResponseSurfaceVariable,
  yVariable?:
    ResponseSurfaceVariable | null,
): ResponseSurfaceModel | null {
  const dimension:
    1 | 2 =
      yVariable
        ? 2
        : 1

  const parameterCount =
    dimension ===
      1
      ? 3
      : 6

  const resolvedSamples =
    samples.filter(
      (
        sample,
      ):
        sample is
          ResponseSurfaceSample & {
            outputValue: number
          } =>
        sample.outputValue !==
          null &&
        Number.isFinite(
          sample.outputValue,
        ),
    )

  if (
    resolvedSamples.length <
    parameterCount
  ) {
    return null
  }

  const designRows =
    resolvedSamples.map(
      (
        sample,
      ) =>
        featureVector(
          codedValue(
            sample.xValue,
            xVariable.minimum,
            xVariable.maximum,
          ),
          yVariable &&
          sample.yValue !==
            null
            ? codedValue(
                sample.yValue,
                yVariable.minimum,
                yVariable.maximum,
              )
            : null,
          dimension,
        ),
    )

  const normalMatrix =
    Array.from(
      {
        length:
          parameterCount,
      },
      () =>
        Array(
          parameterCount,
        ).fill(
          0,
        ) as number[],
    )

  const normalValues =
    Array(
      parameterCount,
    ).fill(
      0,
    ) as number[]

  for (
    let rowIndex =
      0;
    rowIndex <
      designRows.length;
    rowIndex +=
      1
  ) {
    const row =
      designRows[
        rowIndex
      ]

    const output =
      resolvedSamples[
        rowIndex
      ].outputValue

    for (
      let firstIndex =
        0;
      firstIndex <
        parameterCount;
      firstIndex +=
        1
    ) {
      normalValues[
        firstIndex
      ] +=
        row[
          firstIndex
        ] *
        output

      for (
        let secondIndex =
          0;
        secondIndex <
          parameterCount;
        secondIndex +=
          1
      ) {
        normalMatrix[
          firstIndex
        ][
          secondIndex
        ] +=
          row[
            firstIndex
          ] *
          row[
            secondIndex
          ]
      }
    }
  }

  for (
    let index =
      0;
    index <
      parameterCount;
    index +=
      1
  ) {
    normalMatrix[
      index
    ][
      index
    ] +=
      1e-10
  }

  const coefficients =
    solveLinearSystem(
      normalMatrix,
      normalValues,
    )

  if (!coefficients) {
    return null
  }

  const predictions =
    designRows.map(
      (
        row,
      ) =>
        calculatePrediction(
          coefficients,
          row,
        ),
    )

  const residuals =
    predictions.map(
      (
        prediction,
        index,
      ) =>
        prediction -
        resolvedSamples[
          index
        ].outputValue,
    )

  const squaredErrorSum =
    residuals.reduce(
      (
        total,
        residual,
      ) =>
        total +
        residual **
          2,
      0,
    )

  const meanAbsoluteError =
    residuals.reduce(
      (
        total,
        residual,
      ) =>
        total +
        Math.abs(
          residual,
        ),
      0,
    ) /
    residuals.length

  const meanOutput =
    resolvedSamples.reduce(
      (
        total,
        sample,
      ) =>
        total +
        sample.outputValue,
      0,
    ) /
    resolvedSamples.length

  const totalSumOfSquares =
    resolvedSamples.reduce(
      (
        total,
        sample,
      ) =>
        total +
        (
          sample.outputValue -
          meanOutput
        ) **
          2,
      0,
    )

  return {
    dimension,
    xSymbol:
      xVariable.symbol,
    ySymbol:
      yVariable
        ?.symbol ??
      null,
    xMinimum:
      xVariable.minimum,
    xMaximum:
      xVariable.maximum,
    yMinimum:
      yVariable
        ?.minimum ??
      null,
    yMaximum:
      yVariable
        ?.maximum ??
      null,
    coefficients,
    resolvedSampleCount:
      resolvedSamples.length,
    totalSampleCount:
      samples.length,
    rmse:
      Math.sqrt(
        squaredErrorSum /
        residuals.length,
      ),
    mae:
      meanAbsoluteError,
    rSquared:
      totalSumOfSquares >
        0
        ? 1 -
          squaredErrorSum /
          totalSumOfSquares
        : null,
  }
}

export function predictResponseSurface(
  model:
    ResponseSurfaceModel,
  xValue: number,
  yValue?:
    number | null,
): number {
  const codedX =
    codedValue(
      xValue,
      model.xMinimum,
      model.xMaximum,
    )

  const codedY =
    model.dimension ===
      2 &&
    model.yMinimum !==
      null &&
    model.yMaximum !==
      null &&
    yValue !==
      null &&
    yValue !==
      undefined
      ? codedValue(
          yValue,
          model.yMinimum,
          model.yMaximum,
        )
      : null

  return calculatePrediction(
    model.coefficients,
    featureVector(
      codedX,
      codedY,
      model.dimension,
    ),
  )
}

function formatCoefficient(
  value: number,
): string {
  return Number(
    value.toPrecision(
      6,
    ),
  ).toString()
}

export function formatResponseSurfaceEquation(
  model:
    ResponseSurfaceModel,
): string {
  const [
    intercept,
    linearX,
    linearYOrQuadraticX,
    quadraticXOrUndefined,
    quadraticY,
    interaction,
  ] =
    model.coefficients

  if (
    model.dimension ===
    1
  ) {
    return [
      `ŷ = ${formatCoefficient(intercept)}`,
      `${formatCoefficient(linearX)}·X`,
      `${formatCoefficient(linearYOrQuadraticX)}·X²`,
    ].join(
      ' + ',
    )
  }

  return [
    `ŷ = ${formatCoefficient(intercept)}`,
    `${formatCoefficient(linearX)}·X`,
    `${formatCoefficient(linearYOrQuadraticX)}·Y`,
    `${formatCoefficient(quadraticXOrUndefined)}·X²`,
    `${formatCoefficient(quadraticY)}·Y²`,
    `${formatCoefficient(interaction)}·X·Y`,
  ].join(
    ' + ',
  )
}

export function findResponseSurfaceOptimum(
  model:
    ResponseSurfaceModel,
  objective:
    ResponseSurfaceObjective,
  baseQuery: string,
): ResponseSurfaceOptimum {
  const xCount =
    model.dimension ===
      1
      ? 81
      : 41

  const yCount =
    model.dimension ===
      2
      ? 41
      : 1

  let best:
    ResponseSurfaceOptimum | null =
      null

  for (
    let xIndex =
      0;
    xIndex <
      xCount;
    xIndex +=
      1
  ) {
    const xFraction =
      xIndex /
      (
        xCount -
        1
      )

    const xValue =
      model.xMinimum +
      (
        model.xMaximum -
        model.xMinimum
      ) *
      xFraction

    for (
      let yIndex =
        0;
      yIndex <
        yCount;
      yIndex +=
        1
    ) {
      const yValue =
        model.dimension ===
          2 &&
        model.yMinimum !==
          null &&
        model.yMaximum !==
          null
          ? model.yMinimum +
            (
              model.yMaximum -
              model.yMinimum
            ) *
            yIndex /
            (
              yCount -
              1
            )
          : null

      const predictedValue =
        predictResponseSurface(
          model,
          xValue,
          yValue,
        )

      const shouldReplace =
        best ===
          null ||
        (
          objective ===
            'maximize'
            ? predictedValue >
              best.predictedValue
            : predictedValue <
              best.predictedValue
        )

      if (!shouldReplace) {
        continue
      }

      let problem =
        replaceConstraintAssignment(
          baseQuery,
          model.xSymbol,
          xValue,
        )

      if (
        model.ySymbol &&
        yValue !==
          null
      ) {
        problem =
          replaceConstraintAssignment(
            problem,
            model.ySymbol,
            yValue,
          )
      }

      best = {
        xValue,
        yValue,
        predictedValue,
        problem,
      }
    }
  }

  if (!best) {
    throw new Error(
      'Response-surface optimum could not be evaluated.',
    )
  }

  return best
}

function csvCell(
  value:
    string | number | null,
): string {
  const text =
    value ===
      null
      ? ''
      : String(
          value,
        )

  return `"${text.replace(
    /"/g,
    '""',
  )}"`
}

export function createResponseSurfaceCsv(
  samples:
    ResponseSurfaceCsvSample[],
  model:
    ResponseSurfaceModel,
): string {
  const rows = [
    [
      'Point',
      model.xSymbol,
      model.ySymbol,
      'Calculator',
      'Output label',
      'Observed output',
      'Fitted output',
      'Residual',
      'Output unit',
      'Problem',
    ],
    ...samples.map(
      (
        sample,
      ) => {
        const fitted =
          predictResponseSurface(
            model,
            sample.xValue,
            sample.yValue,
          )

        const residual =
          sample.outputValue ===
            null
            ? null
            : fitted -
              sample.outputValue

        return [
          sample.id,
          sample.xValue,
          sample.yValue,
          sample.calculatorTitle,
          sample.outputLabel,
          sample.outputValue,
          fitted,
          residual,
          sample.outputUnit,
          sample.problem,
        ]
      },
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
