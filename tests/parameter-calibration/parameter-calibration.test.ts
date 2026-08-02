import assert from 'node:assert/strict'
import test from 'node:test'

import {
  applyCalibrationParameter,
  calculateCalibrationMetrics,
  createCalibrationCandidates,
  createCalibrationCsv,
  createCalibrationEvaluation,
  selectBestCalibrationEvaluation,
} from '../../src/features/problem-solver/parameterCalibrationEngine.ts'

test(
  'creates inclusive calibration candidates',
  () => {
    assert.deepEqual(
      createCalibrationCandidates(
        0,
        10,
        3,
      ),
      [
        0,
        5,
        10,
      ],
    )
  },
)

test(
  'applies the candidate to only the selected parameter',
  () => {
    assert.equal(
      applyCalibrationParameter(
        'k=2; k2=5; y=?',
        'k',
        3,
      ),
      'k=3; k2=5; y=?',
    )
  },
)

test(
  'calculates calibration error metrics',
  () => {
    const metrics =
      calculateCalibrationMetrics([
        {
          caseId: 'a',
          observedValue: 10,
          predictedValue: 12,
          error: 2,
        },
        {
          caseId: 'b',
          observedValue: 20,
          predictedValue: 18,
          error: -2,
        },
      ])

    assert.equal(
      metrics.rmse,
      2,
    )

    assert.equal(
      metrics.mae,
      2,
    )

    assert.equal(
      metrics.maximumAbsoluteError,
      2,
    )
  },
)

test(
  'selects the candidate with the best resolved RMSE',
  () => {
    const first =
      createCalibrationEvaluation(
        1,
        [
          {
            caseId: 'a',
            observedValue: 10,
            predictedValue: 14,
            error: 4,
          },
        ],
      )

    const second =
      createCalibrationEvaluation(
        2,
        [
          {
            caseId: 'a',
            observedValue: 10,
            predictedValue: 11,
            error: 1,
          },
        ],
      )

    assert.equal(
      selectBestCalibrationEvaluation([
        first,
        second,
      ])?.candidateValue,
      2,
    )
  },
)

test(
  'exports best-fit residuals as CSV',
  () => {
    const evaluation =
      createCalibrationEvaluation(
        2,
        [
          {
            caseId: 'case-1',
            observedValue: 10,
            predictedValue: 11,
            error: 1,
          },
        ],
      )

    const csv =
      createCalibrationCsv(
        evaluation,
      )

    assert.ok(
      csv.includes(
        '"Candidate parameter"',
      ),
    )

    assert.ok(
      csv.includes(
        '"case-1"',
      ),
    )
  },
)
