import assert from 'node:assert/strict'
import test from 'node:test'
import {
  FiniteVolumeDialysisCalculationError,
  calculateFiniteVolumeDialysis,
} from '../../src/features/mass-transfer/finite-volume-dialysis/engine.ts'

test('calculates transient donor and receiver concentrations', () => {
  const result = calculateFiniteVolumeDialysis({
    donorVolume: 1,
    receiverVolume: 2,
    membraneArea: 5,
    overallMassTransferCoefficient: 0.00001,
    contactTime: 3600,
    donorInitialConcentration: 10,
    receiverInitialConcentration: 0,
  })

  assert.ok(
    Math.abs(
      result.equilibriumConcentration -
      3.3333333333333335,
    ) < 1e-12,
  )
  assert.ok(
    Math.abs(
      result.concentrationDifferenceDecayFactor -
      0.7633794943368531,
    ) < 1e-12,
  )
  assert.ok(
    Math.abs(
      result.donorFinalConcentration -
      8.422529962245688,
    ) < 1e-12,
  )
  assert.ok(
    Math.abs(
      result.receiverFinalConcentration -
      0.788735018877156,
    ) < 1e-12,
  )
  assert.ok(
    Math.abs(
      result.transferMagnitude -
      1.577470037754312,
    ) < 1e-12,
  )
})

test('preserves concentrations at zero time and equal initial states', () => {
  const zeroTime = calculateFiniteVolumeDialysis({
    donorVolume: 1,
    receiverVolume: 2,
    membraneArea: 5,
    overallMassTransferCoefficient: 0.00001,
    contactTime: 0,
    donorInitialConcentration: 10,
    receiverInitialConcentration: 0,
  })

  assert.equal(zeroTime.donorFinalConcentration, 10)
  assert.ok(
    Math.abs(zeroTime.receiverFinalConcentration) <
    1e-12,
  )

  const equal = calculateFiniteVolumeDialysis({
    donorVolume: 1,
    receiverVolume: 2,
    membraneArea: 5,
    overallMassTransferCoefficient: 0.00001,
    contactTime: 3600,
    donorInitialConcentration: 4,
    receiverInitialConcentration: 4,
  })

  assert.ok(equal.transferMagnitude < 1e-12)
  assert.equal(
    equal.directionDescription,
    'Both compartments begin at the same concentration, so no net transfer occurs.',
  )
})

test('rejects invalid physical inputs', () => {
  assert.throws(
    () =>
      calculateFiniteVolumeDialysis({
        donorVolume: 0,
        receiverVolume: 2,
        membraneArea: 5,
        overallMassTransferCoefficient: 0.00001,
        contactTime: 3600,
        donorInitialConcentration: 10,
        receiverInitialConcentration: 0,
      }),
    (error: unknown) =>
      error instanceof
        FiniteVolumeDialysisCalculationError &&
      error.code === 'nonPositiveProperty',
  )

  assert.throws(
    () =>
      calculateFiniteVolumeDialysis({
        donorVolume: 1,
        receiverVolume: 2,
        membraneArea: 5,
        overallMassTransferCoefficient: 0.00001,
        contactTime: -1,
        donorInitialConcentration: 10,
        receiverInitialConcentration: 0,
      }),
    (error: unknown) =>
      error instanceof
        FiniteVolumeDialysisCalculationError &&
      error.code === 'negativeContactTime',
  )
})
