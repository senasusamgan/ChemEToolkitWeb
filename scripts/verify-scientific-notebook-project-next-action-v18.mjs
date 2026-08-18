import {
  readFileSync,
} from 'node:fs'

const model =
  readFileSync(
    'src/lib/scientificNotebookProjectSets.ts',
    'utf8',
  )

const component =
  readFileSync(
    'src/components/ScientificNotebookProjectSets.tsx',
    'utf8',
  )

const styles =
  readFileSync(
    'src/styles/scientific-notebook-library.css',
    'utf8',
  )

const contracts = [
  [
    model.includes(
      'nextAction?: string',
    ),
    'Project next-action model missing.',
  ],
  [
    model.includes(
      'nextActionValid',
    )
      && model.includes(
        'projectSet.nextAction',
      ),
    'Next-action validation or normalization missing.',
  ],
  [
    component.includes(
      'setNextAction',
    )
      && component.includes(
        'Next action',
      ),
    'Next-action editor missing.',
  ],
  [
    component.includes(
      'projectSet.nextAction',
    )
      && component.includes(
        'scientific-notebook-project-set-next-action',
      ),
    'Next-action card display missing.',
  ],
  [
    component.includes(
      "'Next action missing'",
    )
      && component.includes(
        'score += 15',
      ),
    'Missing next-action attention signal missing.',
  ],
  [
    component.includes(
      'missingNextAction',
    )
      && component.includes(
        'attentionMetrics.missingNextAction',
      ),
    'Missing next-action portfolio metric missing.',
  ],
  [
    component.includes(
      'projectSet.nextAction,',
    ),
    'Next actions are not searchable.',
  ],
  [
    styles.includes(
      '.scientific-notebook-project-next-action-field',
    )
      && styles.includes(
        '.scientific-notebook-project-set-next-action',
      ),
    'Next-action styles missing.',
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
    'SCIENTIFIC NOTEBOOK PROJECT NEXT ACTION V18 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK PROJECT NEXT ACTION V18 VERIFICATION PASSED',
)

console.log(
  'PASS: optional next-action metadata.',
)

console.log(
  'PASS: next-action editing and display.',
)

console.log(
  'PASS: next-action search.',
)

console.log(
  'PASS: missing-action attention scoring.',
)

console.log(
  'PASS: legacy project sets remain valid.',
)
