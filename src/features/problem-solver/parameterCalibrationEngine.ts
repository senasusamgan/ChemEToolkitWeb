import {
  replaceConstraintAssignment,
} from './constraintOperatingWindowEngine.ts'

export const
  PARAMETER_CALIBRATION_ENGINE_VERSION =
    'parameter-calibration-v1' as const

export interface CalibrationPrediction {
  caseId: string
  observedValue: number
  predictedValue:
    number | null
  error:
    number | null
}

export interface CalibrationMetrics {
  resolvedCount: number
  totalCount: number
  rmse:
    number | null
  mae:
    number | null
  maximumAbsoluteError:
    number | null
  rSquared:
    number | null
}

export interface CalibrationEvaluation {
  candidateValue: number
  predictions:
    CalibrationPrediction[]
  metrics:
    CalibrationMetrics
}

export function createCalibrationCandidates(
  minimum: number,
  maximum: number,
  steps: number,
): number[] {
  if (
    !Number.isFinite(minimum) ||
    !Number.isFinite(maximum) ||
    maximum <= minimum
  ) {
    return []
  }

  const safeSteps =
    Math.min(
      17,
      Math.max(
        3,
        Math.trunc(steps),
      ),
    )

  return Array.from(
    {
      length:
        safeSteps,
    },
    (
      _,
      index,
    ) =>
      minimum +
      (
        maximum -
        minimum
      ) *
      index /
      (
        safeSteps -
        1
      ),
  )
}

export function applyCalibrationParameter(
  problem: string,
  symbol: string,
  value: number,
): string {
  return replaceConstraintAssignment(
    problem,
    symbol,
    value,
  )
}

export function calculateCalibrationMetrics(
  predictions:
    CalibrationPrediction[],
): CalibrationMetrics {
  const resolved =
    predictions.filter(
      (
        prediction,
      ):
        prediction is
          CalibrationPrediction & {
            predictedValue: number
            error: number
          } =>
        prediction.predictedValue !==
          null &&
        prediction.error !==
          null,
    )

  if (
    resolved.length ===
    0
  ) {
    return {
      resolvedCount:
        0,
      totalCount:
        predictions.length,
      rmse:
        null,
      mae:
        null,
      maximumAbsoluteError:
        null,
      rSquared:
        null,
    }
  }

  const squaredErrors =
    resolved.map(
      (
        prediction,
      ) =>
        prediction.error **
        2,
    )

  const absoluteErrors =
    resolved.map(
      (
        prediction,
      ) =>
        Math.abs(
          prediction.error,
        ),
    )

  const meanObserved =
    resolved.reduce(
      (
        total,
        prediction,
      ) =>
        total +
        prediction.observedValue,
      0,
    ) /
    resolved.length

  const residualSum =
    squaredErrors.reduce(
      (
        total,
        value,
      ) =>
        total +
        value,
      0,
    )

  const totalSum =
    resolved.reduce(
      (
        total,
        prediction,
      ) =>
        total +
        (
          prediction.observedValue -
          meanObserved
        ) **
        2,
      0,
    )

  return {
    resolvedCount:
      resolved.length,
    totalCount:
      predictions.length,
    rmse:
      Math.sqrt(
        residualSum /
        resolved.length,
      ),
    mae:
      absoluteErrors.reduce(
        (
          total,
          value,
        ) =>
          total +
          value,
        0,
      ) /
      resolved.length,
    maximumAbsoluteError:
      Math.max(
        ...absoluteErrors,
      ),
    rSquared:
      totalSum >
        0
        ? 1 -
          residualSum /
          totalSum
        : null,
  }
}

export function createCalibrationEvaluation(
  candidateValue: number,
  predictions:
    CalibrationPrediction[],
): CalibrationEvaluation {
  return {
    candidateValue,
    predictions,
    metrics:
      calculateCalibrationMetrics(
        predictions,
      ),
  }
}

export function selectBestCalibrationEvaluation(
  evaluations:
    CalibrationEvaluation[],
): CalibrationEvaluation | null {
  return evaluations.reduce<
    CalibrationEvaluation | null
  >(
    (
      best,
      candidate,
    ) => {
      if (
        candidate.metrics.rmse ===
        null
      ) {
        return best
      }

      if (
        best ===
        null
      ) {
        return candidate
      }

      if (
        candidate
          .metrics
          .resolvedCount >
        best
          .metrics
          .resolvedCount
      ) {
        return candidate
      }

      if (
        candidate
          .metrics
          .resolvedCount <
        best
          .metrics
          .resolvedCount
      ) {
        return best
      }

      if (
        best.metrics.rmse ===
          null ||
        candidate.metrics.rmse <
          best.metrics.rmse
      ) {
        return candidate
      }

      return best
    },
    null,
  )
}

function csvCell(
  value:
    string | number | null,
): string {
  const text =
    value ===
      null
      ? ''
      : String(value)

  return `"${text.replace(
    /"/g,
    '""',
  )}"`
}

export function createCalibrationCsv(
  evaluation:
    CalibrationEvaluation,
): string {
  const rows = [
    [
      'Candidate parameter',
      'Case',
      'Observed value',
      'Predicted value',
      'Residual',
    ],
    ...evaluation.predictions.map(
      (
        prediction,
      ) => [
        evaluation
          .candidateValue,
        prediction.caseId,
        prediction.observedValue,
        prediction.predictedValue,
        prediction.error,
      ],
    ),
  ]

  return rows
    .map(
      (
        row,
      ) =>
        row
          .map(csvCell)
          .join(','),
    )
    .join('\n')
}
