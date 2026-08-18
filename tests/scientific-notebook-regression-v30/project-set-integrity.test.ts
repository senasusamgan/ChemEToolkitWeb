import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getProjectSetActivityTimestamp,
  mergeNotebookProjectSets,
  normalizeProjectReviewInterval,
  type NotebookProjectSet,
} from '../../src/lib/scientificNotebookProjectSets.ts'

function project(
  overrides:
    Partial<NotebookProjectSet>,
): NotebookProjectSet {
  return {
    id:
      'project-1',

    name:
      'Base project',

    reportTitle:
      'Engineering Project Report',

    status:
      'active',

    progress:
      40,

    priority:
      'normal',

    reviewIntervalDays:
      14,

    calculatorIds:
      [
        'calculator-a',
      ],

    createdAt:
      '2026-01-01T00:00:00.000Z',

    updatedAt:
      '2026-01-01T00:00:00.000Z',

    ...overrides,
  }
}

test(
  'merge preserves newest edit and newest review independently',
  () => {
    const current =
      project({
        name:
          'Newest local edit',

        description:
          'Local metadata',

        updatedAt:
          '2026-01-20T00:00:00.000Z',

        lastReviewedAt:
          '2026-01-21T00:00:00.000Z',
      })

    const incoming =
      project({
        name:
          'Older imported edit',

        description:
          'Imported metadata',

        updatedAt:
          '2026-01-10T00:00:00.000Z',

        lastReviewedAt:
          '2026-01-25T00:00:00.000Z',
      })

    const merged =
      mergeNotebookProjectSets(
        [
          current,
        ],
        [
          incoming,
        ],
      )

    assert.equal(
      merged.length,
      1,
    )

    assert.equal(
      merged[0].name,
      'Newest local edit',
    )

    assert.equal(
      merged[0].description,
      'Local metadata',
    )

    assert.equal(
      merged[0].updatedAt,
      '2026-01-20T00:00:00.000Z',
    )

    assert.equal(
      merged[0].lastReviewedAt,
      '2026-01-25T00:00:00.000Z',
    )
  },
)

test(
  'new imported edit does not erase a newer local review',
  () => {
    const current =
      project({
        name:
          'Older local edit',

        updatedAt:
          '2026-02-01T00:00:00.000Z',

        lastReviewedAt:
          '2026-02-25T00:00:00.000Z',
      })

    const incoming =
      project({
        name:
          'Newest imported edit',

        updatedAt:
          '2026-02-20T00:00:00.000Z',

        lastReviewedAt:
          '2026-02-21T00:00:00.000Z',
      })

    const merged =
      mergeNotebookProjectSets(
        [
          current,
        ],
        [
          incoming,
        ],
      )

    assert.equal(
      merged[0].name,
      'Newest imported edit',
    )

    assert.equal(
      merged[0].updatedAt,
      '2026-02-20T00:00:00.000Z',
    )

    assert.equal(
      merged[0].lastReviewedAt,
      '2026-02-25T00:00:00.000Z',
    )
  },
)

test(
  'project ordering follows latest edit or review activity',
  () => {
    const reviewRecent =
      project({
        id:
          'review-recent',

        name:
          'Review recent',

        updatedAt:
          '2026-03-01T00:00:00.000Z',

        lastReviewedAt:
          '2026-03-30T00:00:00.000Z',
      })

    const editRecent =
      project({
        id:
          'edit-recent',

        name:
          'Edit recent',

        updatedAt:
          '2026-03-20T00:00:00.000Z',

        lastReviewedAt:
          undefined,
      })

    const merged =
      mergeNotebookProjectSets(
        [
          editRecent,
          reviewRecent,
        ],
        [],
      )

    assert.deepEqual(
      merged.map(
        (item) =>
          item.id,
      ),
      [
        'review-recent',
        'edit-recent',
      ],
    )
  },
)

test(
  'activity timestamp uses the newest project touch',
  () => {
    const value =
      project({
        updatedAt:
          '2026-04-01T00:00:00.000Z',

        lastReviewedAt:
          '2026-04-05T00:00:00.000Z',
      })

    assert.equal(
      getProjectSetActivityTimestamp(
        value,
      ),
      new Date(
        '2026-04-05T00:00:00.000Z',
      ).getTime(),
    )
  },
)

test(
  'legacy project review cadence remains fourteen days',
  () => {
    assert.equal(
      normalizeProjectReviewInterval(
        undefined,
      ),
      14,
    )

    assert.equal(
      normalizeProjectReviewInterval(
        7,
      ),
      7,
    )

    assert.equal(
      normalizeProjectReviewInterval(
        30,
      ),
      30,
    )

    assert.equal(
      normalizeProjectReviewInterval(
        60,
      ),
      60,
    )
  },
)
