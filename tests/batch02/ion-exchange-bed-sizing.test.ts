import assert from 'node:assert/strict'
import test from 'node:test'
import {
  IonExchangeBedSizingCalculationError,
  calculateIonExchangeBedSizing,
} from '../../src/features/mass-transfer/ion-exchange-bed-sizing/engine.ts'

test('calculates equivalent load and required resin volume', () => {
  const result = calculateIonExchangeBedSizing({
    liquidVolumetricFlowRate: 2,
    influentIonConcentration: 5,
    ionChargeMagnitude: 2,
    targetRemovalFraction: 0.9,
    serviceTime: 8,
    resinCapacity: 1.8,
    capacityUtilizationFraction: 0.75,
  })

  assert.equal(result.ionChargeMagnitude, 2)
  assert.ok(Math.abs(result.totalEquivalentLoad - 160) < 1e-12)
  assert.ok(Math.abs(result.removedEquivalentLoad - 144) < 1e-12)
  assert.ok(Math.abs(result.requiredResinVolumeLiters - 106.66666666666667) < 1e-12)
  assert.ok(Math.abs(result.emptyBedContactTimeMinutes - 3.2) < 1e-12)
  assert.ok(Math.abs(result.processedBedVolumes - 150) < 1e-12)
})

test('handles complete removal at full capacity utilization', () => {
  const result = calculateIonExchangeBedSizing({
    liquidVolumetricFlowRate: 1,
    influentIonConcentration: 1,
    ionChargeMagnitude: 1,
    targetRemovalFraction: 1,
    serviceTime: 1,
    resinCapacity: 1,
    capacityUtilizationFraction: 1,
  })

  assert.equal(result.outletIonConcentration, 0)
  assert.equal(result.residualEquivalentLoad, 0)
  assert.equal(result.requiredResinVolumeLiters, 1)
})

test('rejects noninteger charge and invalid fractions', () => {
  assert.throws(
    () =>
      calculateIonExchangeBedSizing({
        liquidVolumetricFlowRate: 1,
        influentIonConcentration: 1,
        ionChargeMagnitude: 1.5,
        targetRemovalFraction: 0.9,
        serviceTime: 1,
        resinCapacity: 1,
        capacityUtilizationFraction: 1,
      }),
    (error: unknown) =>
      error instanceof IonExchangeBedSizingCalculationError &&
      error.code === 'invalidIonCharge',
  )

  assert.throws(
    () =>
      calculateIonExchangeBedSizing({
        liquidVolumetricFlowRate: 1,
        influentIonConcentration: 1,
        ionChargeMagnitude: 1,
        targetRemovalFraction: 0,
        serviceTime: 1,
        resinCapacity: 1,
        capacityUtilizationFraction: 1,
      }),
    (error: unknown) =>
      error instanceof IonExchangeBedSizingCalculationError &&
      error.code === 'removalFractionOutOfRange',
  )
})
