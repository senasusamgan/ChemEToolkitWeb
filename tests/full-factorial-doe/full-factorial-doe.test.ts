import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateFactorInteractions,
  calculateFactorMainEffects,
  createFullFactorialCsv,
  createFullFactorialDesign,
  summarizeFullFactorialDesign,
} from '../../src/features/problem-solver/fullFactorialDoeEngine.ts'

const factors = [
  {
    symbol:
      'P',
    nominalValue:
      100,
    lowValue:
      80,
    highValue:
      120,
  },
  {
    symbol:
      'T',
    nominalValue:
      300,
    lowValue:
      280,
    highValue:
      320,
  },
]

test(
  'creates a center point and every low-high factor combination',
  () => {
    const design =
      createFullFactorialDesign(
        'P=100 Pa; T=300 K; V=?',
        factors,
      )

    assert.equal(
      design.length,
      5,
    )

    assert.equal(
      design[0].id,
      'center',
    )

    assert.equal(
      design[1].problem,
      'P=80 Pa; T=280 K; V=?',
    )

    assert.equal(
      design[4].problem,
      'P=120 Pa; T=320 K; V=?',
    )
  },
)

test(
  'limits a design to three valid unique factors',
  () => {
    const design =
      createFullFactorialDesign(
        'A=1; B=2; C=3; D=4; y=?',
        [
          {
            symbol: 'A',
            nominalValue: 1,
            lowValue: 0,
            highValue: 2,
          },
          {
            symbol: 'B',
            nominalValue: 2,
            lowValue: 1,
            highValue: 3,
          },
          {
            symbol: 'C',
            nominalValue: 3,
            lowValue: 2,
            highValue: 4,
          },
          {
            symbol: 'D',
            nominalValue: 4,
            lowValue: 3,
            highValue: 5,
          },
        ],
      )

    assert.equal(
      design.length,
      9,
    )
  },
)

test(
  'calculates full-factorial main effects',
  () => {
    const design =
      createFullFactorialDesign(
        'P=100; T=300; y=?',
        factors,
      )

    const outputs = [
      25,
      10,
      30,
      20,
      40,
    ]

    const evaluated =
      design.map(
        (
          item,
          index,
        ) => ({
          ...item,
          outputValue:
            outputs[index],
        }),
      )

    const effects =
      calculateFactorMainEffects(
        evaluated,
        factors,
      )

    assert.equal(
      effects[0].symbol,
      'P',
    )

    assert.equal(
      effects[0].lowMean,
      15,
    )

    assert.equal(
      effects[0].highMean,
      35,
    )

    assert.equal(
      effects[0].mainEffect,
      20,
    )

    assert.equal(
      effects[1].mainEffect,
      10,
    )
  },
)

test(
  'calculates two-factor interaction effects',
  () => {
    const design =
      createFullFactorialDesign(
        'P=100; T=300; y=?',
        factors,
      )

    const outputs = [
      25,
      10,
      30,
      20,
      50,
    ]

    const evaluated =
      design.map(
        (
          item,
          index,
        ) => ({
          ...item,
          outputValue:
            outputs[index],
        }),
      )

    const interactions =
      calculateFactorInteractions(
        evaluated,
        factors,
      )

    assert.equal(
      interactions.length,
      1,
    )

    assert.equal(
      interactions[0]
        .sameDirectionMean,
      30,
    )

    assert.equal(
      interactions[0]
        .oppositeDirectionMean,
      25,
    )

    assert.equal(
      interactions[0]
        .interactionEffect,
      5,
    )
  },
)

test(
  'summarizes the strongest factor and objective-specific best run',
  () => {
    const design =
      createFullFactorialDesign(
        'P=100; T=300; y=?',
        factors,
      )

    const outputs = [
      25,
      10,
      30,
      20,
      40,
    ]

    const evaluated =
      design.map(
        (
          item,
          index,
        ) => ({
          ...item,
          outputValue:
            outputs[index],
        }),
      )

    const summary =
      summarizeFullFactorialDesign(
        evaluated,
        factors,
        'maximize',
      )

    assert.equal(
      summary.minimumOutput,
      10,
    )

    assert.equal(
      summary.maximumOutput,
      40,
    )

    assert.equal(
      summary.responseSpan,
      30,
    )

    assert.equal(
      summary.bestCaseId,
      'run-4',
    )

    assert.equal(
      summary.strongestFactorSymbol,
      'P',
    )
  },
)

test(
  'exports full-factorial runs as CSV',
  () => {
    const design =
      createFullFactorialDesign(
        'P=100 Pa; y=?',
        [
          factors[0],
        ],
      )

    const csv =
      createFullFactorialCsv(
        design.map(
          (
            item,
          ) => ({
            ...item,
            calculatorTitle:
              'Engineering Calculator',
            outputLabel:
              'Response',
            outputUnit:
              'kg/s',
            outputValue:
              12,
          }),
        ),
      )

    assert.ok(
      csv.includes(
        '"P level"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Center point"',
      ),
    )

    assert.ok(
      csv.includes(
        '"Engineering Calculator"',
      ),
    )
  },
)
