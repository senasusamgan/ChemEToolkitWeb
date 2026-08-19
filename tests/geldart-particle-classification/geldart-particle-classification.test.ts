import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateGeldartParticleClassification,
} from '../../src/features/fluid-mechanics/geldart-particle-classification/engine.ts'

const calculatorId =
  'geldartParticleClassification'

test(
  `${calculatorId} classifies an aeratable Group A powder`,
  () => {
    const result =
      calculateGeldartParticleClassification({
        particleDiameterMicrometres:
          100,
        particleDensity:
          1001.2,
        gasDensity:
          1.2,
      })

    assert.equal(
      result.group,
      'A',
    )

    assert.ok(
      Math.abs(
        result.groupABIndex
        - 100,
      ) < 1e-12,
    )
  },
)

test(
  `${calculatorId} classifies a sand-like Group B powder`,
  () => {
    const result =
      calculateGeldartParticleClassification({
        particleDiameterMicrometres:
          100,
        particleDensity:
          2701.2,
        gasDensity:
          1.2,
      })

    assert.equal(
      result.group,
      'B',
    )

    assert.ok(
      result.groupABIndex
      > 225,
    )
  },
)

test(
  `${calculatorId} classifies a cohesive Group C powder`,
  () => {
    const result =
      calculateGeldartParticleClassification({
        particleDiameterMicrometres:
          15,
        particleDensity:
          1501.2,
        gasDensity:
          1.2,
      })

    assert.equal(
      result.group,
      'C',
    )
  },
)

test(
  `${calculatorId} classifies a large-particle Group D system`,
  () => {
    const result =
      calculateGeldartParticleClassification({
        particleDiameterMicrometres:
          1000,
        particleDensity:
          1501.2,
        gasDensity:
          1.2,
      })

    assert.equal(
      result.group,
      'D',
    )

    assert.ok(
      result.groupDIndex
      >= 1_000_000,
    )
  },
)

test(
  `${calculatorId} rejects nonphysical density ordering`,
  () => {
    assert.throws(
      () =>
        calculateGeldartParticleClassification({
          particleDiameterMicrometres:
            100,
          particleDensity:
            1,
          gasDensity:
            1.2,
        }),
      /Particle density must exceed gas density/,
    )
  },
)
