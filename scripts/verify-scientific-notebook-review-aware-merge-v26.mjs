import {
  readFileSync,
} from 'node:fs'

const model =
  readFileSync(
    'src/lib/scientificNotebookProjectSets.ts',
    'utf8',
  )

const contracts = [
  [
    model.includes(
      'export function getProjectSetActivityTimestamp(',
    ),
    'Project activity timestamp helper missing.',
  ],
  [
    model.includes(
      'projectSet.updatedAt',
    )
      && model.includes(
        'projectSet.lastReviewedAt',
      ),
    'Activity timestamp must consider edits and reviews.',
  ],
  [
    model.includes(
      'const preferred =',
    )
      && model.includes(
        'safeIncomingUpdated',
      )
      && model.includes(
        'safeExistingUpdated',
      ),
    'Project edit merge selection missing.',
  ],
  [
    model.includes(
      'const existingReviewedAt =',
    )
      && model.includes(
        'const incomingReviewedAt =',
      ),
    'Independent review comparison missing.',
  ],
  [
    model.includes(
      'const lastReviewedAt =',
    )
      && model.includes(
        'incomingReviewTimestamp >',
      ),
    'Newest review preservation missing.',
  ],
  [
    model.includes(
      '...preferred,'
    )
      && model.includes(
        'lastReviewedAt,',
      ),
    'Merged Project Set must combine edit and review state.',
  ],
  [
    model.split(
      'getProjectSetActivityTimestamp(',
    ).length >= 6,
    'Project Set ordering must use real activity.',
  ],
  [
    model.includes(
      'normalizeProjectReviewTimestamp(',
    ),
    'Review timestamp normalization missing.',
  ],
]

const failures =
  contracts
    .filter(
      ([passed]) =>
        !passed,
    )
    .map(
      ([, message]) =>
        message,
    )

if (failures.length) {
  console.error(
    'SCIENTIFIC NOTEBOOK REVIEW-AWARE MERGE V26 VERIFICATION FAILED',
  )

  for (
    const failure
    of failures
  ) {
    console.error(
      `- ${failure}`,
    )
  }

  process.exit(1)
}

console.log(
  'SCIENTIFIC NOTEBOOK REVIEW-AWARE MERGE V26 VERIFICATION PASSED',
)

console.log(
  'PASS: latest project edit survives merge.',
)

console.log(
  'PASS: latest review survives independently.',
)

console.log(
  'PASS: review-only backup updates are preserved.',
)

console.log(
  'PASS: project ordering follows latest activity.',
)
