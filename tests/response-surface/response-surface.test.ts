import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createResponseSurfaceCsv,
  createResponseSurfaceDesign,
  findResponseSurfaceOptimum,
  fitResponseSurface,
  predictResponseSurface,
} from '../../src/features/problem-solver/responseSurfaceEngine.ts'

test(
  'creates one and two-variable response-surface designs',
  () => {
    const oneVariable =
      createResponseSurfaceDesign(
        'x=0; y=?',
        {
          symbol:
            'x',
          minimum:
            -1,
          maximum:
            1,
          steps:
            5,
        },
      )

    assert.equal(
      oneVariable.length,
      5,
    )

    const twoVariable =
      createResponseSurfaceDesign(
        'x=0; z=0; y=?',
        {
          symbol:
            'x',
          minimum:
            -1,
          maximum:
            1,
          steps:
            3,
        },
        {
          symbol:
            'z',
          minimum:
            -1,
          maximum:
            1,
          steps:
            3,
        },
      )

    assert.equal(
      twoVariable.length,
      9,
    )

    assert.equal(
      twoVariable[8].problem,
      'x=1; z=1; y=?',
    )
  },
)

test(
  'fits an exact one-variable quadratic model',
  () => {
    const variable = {
      symbol:
        'x',
      minimum:
        -1,
      maximum:
        1,
      steps:
        5,
    }

    const design =
      createResponseSurfaceDesign(
        'x=0; y=?',
        variable,
      )

    const samples =
      design.map(
        (
          point,
        ) => ({
          ...point,
          outputValue:
            2 +
            3 *
              point.xValue +
            4 *
              point.xValue **
              2,
        }),
      )

    const model =
      fitResponseSurface(
        samples,
        variable,
      )

    assert.ok(model)

    assert.ok(
      Math.abs(
        predictResponseSurface(
          model,
          0.25,
        ) -
        3,
      ) <
        1e-7,
    )

    assert.ok(
      model.rSquared !==
        null &&
      model.rSquared >
        0.999999,
    )
  },
)

test(
  'fits a two-variable quadratic response surface',
  () => {
    const xVariable = {
      symbol:
        'x',
      minimum:
        -1,
      maximum:
        1,
      steps:
        3,
    }

    const yVariable = {
      symbol:
        'z',
      minimum:
        -1,
      maximum:
        1,
      steps:
        3,
    }

    const design =
      createResponseSurfaceDesign(
        'x=0; z=0; y=?',
        xVariable,
        yVariable,
      )

    const samples =
      design.map(
        (
          point,
        ) => {
          const x =
            point.xValue

          const z =
            point.yValue ??
            0

          return {
            ...point,
            outputValue:
              1 +
              2 *
                x +
              3 *
                z +
              0.5 *
                x **
                2 -
              0.25 *
                z **
                2 +
              4 *
                x *
                z,
          }
        },
      )

    const model =
      fitResponseSurface(
        samples,
        xVariable,
        yVariable,
      )

    assert.ok(model)

    const prediction =
      predictResponseSurface(
        model,
        0.5,
        -0.5,
      )

    assert.ok(
      Math.abs(
        prediction -
        (
          -0.4375
        ),
      ) <
        1e-6,
    )
  },
)

test(
  'finds a quadratic optimum inside the selected range',
  () => {
    const variable = {
      symbol:
        'x',
      minimum:
        -1,
      maximum:
        1,
      steps:
        5,
    }

    const design =
      createResponseSurfaceDesign(
        'x=0; y=?',
        variable,
      )

    const samples =
      design.map(
        (
          point,
        ) => ({
          ...point,
          outputValue:
            10 -
            (
              point.xValue -
              0.25
            ) **
              2,
        }),
      )

    const model =
      fitResponseSurface(
        samples,
        variable,
      )

    assert.ok(model)

    const optimum =
      findResponseSurfaceOptimum(
        model,
        'maximize',
        'x=0; y=?',
      )

    assert.ok(
      Math.abs(
        optimum.xValue -
        0.25,
      ) <
        0.03,
    )

    assert.ok(
      optimum.problem.includes(
        'x=0.25',
      ),
    )
  },
)

test(
  'exports observed, fitted and residual values as CSV',
  () => {
    const variable = {
      symbol:
        'x',
      minimum:
        -1,
      maximum:
        1,
      steps:
        3,
    }

    const design =
      createResponseSurfaceDesign(
        'x=0; y=?',
        variable,
      )

    const samples =
      design.map(
        (
          point,
        ) => ({
          ...point,
          outputValue:
            1 +
            point.xValue **
              2,
          calculatorTitle:
            'Engineering Calculator',
          outputLabel:
            'Response',
          outputUnit:
            'kg/s',
        }),
      )

    const model =
      fitResponseSurface(
        samples,
        variable,
      )

    assert.ok(model)

    const csv =
      createResponseSurfaceCsv(
        samples,
        model,
      )

    assert.ok(
      csv.includes(
        '"Fitted output"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Residual"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Engineering Calculator"',
      ),
    )
  },
)
