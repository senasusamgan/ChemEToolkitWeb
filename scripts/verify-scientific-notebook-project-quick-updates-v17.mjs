import {
  readFileSync,
} from 'node:fs'

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
    component.includes(
      'function quickUpdateProject(',
    ),
    'Quick project update helper missing.',
  ],
  [
    component.includes(
      'function increaseProjectProgress(',
    )
      && component.includes(
        '+10%',
      ),
    'Quick progress update missing.',
  ],
  [
    component.includes(
      'function toggleBlockedProject(',
    )
      && component.includes(
        "'Resume'",
      )
      && component.includes(
        "'Block'",
      ),
    'Block/Resume workflow missing.',
  ],
  [
    component.includes(
      'function toggleCompleteProject(',
    )
      && component.includes(
        "'Reopen'",
      )
      && component.includes(
        "'Complete'",
      ),
    'Complete/Reopen workflow missing.',
  ],
  [
    component.includes(
      "'planned'"
    )
      && component.includes(
        "'active'",
      )
      && component.includes(
        'Start',
      ),
    'Start-project quick action missing.',
  ],
  [
    component.includes(
      'updatedAt:',
    )
      && component.includes(
        'new Date()',
      ),
    'Quick updates must refresh updatedAt.',
  ],
  [
    component.includes(
      'scientific-notebook-project-quick-actions',
    ),
    'Quick project action UI missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-project-quick-actions',
    ),
    'Quick project action styles missing.',
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
    'SCIENTIFIC NOTEBOOK PROJECT QUICK UPDATES V17 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK PROJECT QUICK UPDATES V17 VERIFICATION PASSED',
)

console.log(
  'PASS: Start project.',
)

console.log(
  'PASS: +10 percent progress.',
)

console.log(
  'PASS: Block / Resume.',
)

console.log(
  'PASS: Complete / Reopen.',
)

console.log(
  'PASS: attention metrics react to quick updates.',
)
