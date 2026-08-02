import assert from 'node:assert/strict'
import test from 'node:test'

import {
  classifyRobustnessOutput,
  createRobustnessCornerCases,
  createRobustnessCsv,
  summarizeRobustnessCases,
} from '../../src/features/problem-solver/robustnessCornerEngine.ts'

test(
  'creates nominal and deterministic low-high corner cases',
  () => {
    const cases =
      createRobustnessCornerCases(
        'P=100 Pa; T=300 K; V=?',
        [
          {
            symbol:
              'P',
            nominalValue:
              100,
            tolerancePercent:
              10,
          },
          {
            symbol:
              'T',
            nominalValue:
              300,
            tolerancePercent:
              5,
          },
        ],
      )

    assert.equal(
      cases.length,
      5,
    )

    assert.equal(
      cases[0].id,
      'nominal',
    )

    assert.equal(
      cases[1].problem,
      'P=90 Pa; T=285 K; V=?',
    )

    assert.equal(
      cases[4].problem,
      'P=110 Pa; T=315 K; V=?',
    )
  },
)

test(
  'limits deterministic analysis to four selected variables',
  () => {
    const cases =
      createRobustnessCornerCases(
        'A=1; B=2; C=3; D=4; E=5; X=?',
        [
          {
            symbol: 'A',
            nominalValue: 1,
            tolerancePercent: 5,
          },
          {
            symbol: 'B',
            nominalValue: 2,
            tolerancePercent: 5,
          },
          {
            symbol: 'C',
            nominalValue: 3,
            tolerancePercent: 5,
          },
          {
            symbol: 'D',
            nominalValue: 4,
            tolerancePercent: 5,
          },
          {
            symbol: 'E',
            nominalValue: 5,
            tolerancePercent: 5,
          },
        ],
      )

    assert.equal(
      cases.length,
      17,
    )
  },
)

test(
  'classifies outputs against optional engineering limits',
  () => {
    assert.equal(
      classifyRobustnessOutput(
        50,
        40,
        60,
      ).status,
      'within',
    )

    assert.equal(
      classifyRobustnessOutput(
        35,
        40,
        60,
      ).status,
      'below',
    )

    assert.equal(
      classifyRobustnessOutput(
        70,
        40,
        60,
      ).status,
      'above',
    )

    assert.equal(
      classifyRobustnessOutput(
        null,
        40,
        60,
      ).status,
      'unresolved',
    )

    assert.equal(
      classifyRobustnessOutput(
        50,
        null,
        null,
      ).withinLimits,
      true,
    )
  },
)

test(
  'identifies output span, worst case and critical variable',
  () => {
    const summary =
      summarizeRobustnessCases(
        [
          {
            id:
              'nominal',
            label:
              'Nominal',
            problem:
              '',
            isNominal:
              true,
            levels: {
              P:
                'nominal',
            },
            values: {
              P:
                100,
            },
            outputValue:
              50,
            status:
              'within',
            withinLimits:
              true,
            signedMargin:
              10,
            boundaryDistance:
              10,
          },
          {
            id:
              'low',
            label:
              'P low',
            problem:
              '',
            isNominal:
              false,
            levels: {
              P:
                'low',
            },
            values: {
              P:
                90,
            },
            outputValue:
              40,
            status:
              'within',
            withinLimits:
              true,
            signedMargin:
              0,
            boundaryDistance:
              0,
          },
          {
            id:
              'high',
            label:
              'P high',
            problem:
              '',
            isNominal:
              false,
            levels: {
              P:
                'high',
            },
            values: {
              P:
                110,
            },
            outputValue:
              65,
            status:
              'above',
            withinLimits:
              false,
            signedMargin:
              -5,
            boundaryDistance:
              5,
          },
        ],
        [
          {
            symbol:
              'P',
            nominalValue:
              100,
            tolerancePercent:
              10,
          },
        ],
      )

    assert.equal(
      summary.minimumOutput,
      40,
    )

    assert.equal(
      summary.maximumOutput,
      65,
    )

    assert.equal(
      summary.outputSpan,
      25,
    )

    assert.equal(
      summary.maximumAbsoluteDeviation,
      15,
    )

    assert.equal(
      summary.worstCaseId,
      'high',
    )

    assert.equal(
      summary.criticalVariableSymbol,
      'P',
    )

    assert.equal(
      summary.robustPass,
      false,
    )
  },
)

test(
  'exports evaluated tolerance cases as CSV',
  () => {
    const csv =
      createRobustnessCsv([
        {
          id:
            'corner-0',
          label:
            'P low',
          problem:
            'P=90 Pa; V=?',
          isNominal:
            false,
          levels: {
            P:
              'low',
          },
          values: {
            P:
              90,
          },
          calculatorTitle:
            'Ideal Gas Calculator',
          outputLabel:
            'Volume',
          outputUnit:
            'm³',
          outputValue:
            0.03,
          status:
            'within',
          withinLimits:
            true,
          signedMargin:
            0.01,
          boundaryDistance:
            0.01,
        },
      ])

    assert.ok(
      csv.includes(
        '"P level"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Ideal Gas Calculator"',
      ),
    )

    assert.ok(
      csv.includes(
        '"within"',
      ),
    )
  },
)
