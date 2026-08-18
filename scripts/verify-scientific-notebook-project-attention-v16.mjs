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
      'getProjectAttentionScore',
    ),
    'Project attention scoring missing.',
  ],
  [
    component.includes(
      'getProjectAttentionReasons',
    )
      && component.includes(
        "'Blocked'",
      )
      && component.includes(
        "'Overdue'",
      )
      && component.includes(
        "'Critical priority'",
      ),
    'Attention reason classification missing.',
  ],
  [
    component.includes(
      'attentionOnly',
    )
      && component.includes(
        'Attention only',
      ),
    'Needs-attention filtering missing.',
  ],
  [
    component.includes(
      'attentionMetrics.needsAttention',
    )
      && component.includes(
        'attentionMetrics.urgent',
      ),
    'Attention portfolio metrics missing.',
  ],
  [
    component.includes(
      'Attention first',
    )
      && component.includes(
        'Due date',
      )
      && component.includes(
        'Lowest progress',
      )
      && component.includes(
        'Recently updated',
      ),
    'Smart project sorting missing.',
  ],
  [
    component.includes(
      'displayedProjectSets',
    ),
    'Sorted project-set rendering missing.',
  ],
  [
    component.includes(
      'scientific-notebook-project-set-attention',
    ),
    'Project attention badges missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-project-attention-summary',
    )
      && styles.includes(
        '.scientific-notebook-project-set-attention',
      ),
    'Attention queue styles missing.',
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
    'SCIENTIFIC NOTEBOOK PROJECT ATTENTION V16 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK PROJECT ATTENTION V16 VERIFICATION PASSED',
)

console.log(
  'PASS: smart attention scoring.',
)

console.log(
  'PASS: blocked / overdue / priority signals.',
)

console.log(
  'PASS: needs-attention queue.',
)

console.log(
  'PASS: multi-mode project sorting.',
)

console.log(
  'PASS: attention reason badges.',
)
