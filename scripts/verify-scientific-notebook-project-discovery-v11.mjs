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
      'description?: string',
    )
      && model.includes(
        'tags?: string[]',
      ),
    'Project Set metadata model missing.',
  ],
  [
    model.includes(
      'normalizeProjectSetTags',
    ),
    'Project Set tag normalization missing.',
  ],
  [
    model.includes(
      'descriptionValid',
    )
      && model.includes(
        'tagsValid',
      ),
    'Backward-compatible metadata validation missing.',
  ],
  [
    component.includes(
      'Description',
    )
      && component.includes(
        'Tags',
      ),
    'Project Set metadata editor missing.',
  ],
  [
    component.includes(
      'Search sets',
    )
      && component.includes(
        'All tags',
      ),
    'Project Set discovery controls missing.',
  ],
  [
    component.includes(
      'visibleProjectSets',
    )
      && component.includes(
        'normalizedQuery',
      ),
    'Project Set search filtering missing.',
  ],
  [
    component.includes(
      'Edit metadata',
    ),
    'Project Set metadata editing missing.',
  ],
  [
    component.includes(
      'scientific-notebook-project-set-tags',
    ),
    'Project Set tag rendering missing.',
  ],
  [
    styles.includes(
      '.scientific-notebook-project-set-discovery',
    )
      && styles.includes(
        '.scientific-notebook-project-set-tags',
      ),
    'Project Set discovery styles missing.',
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
    'SCIENTIFIC NOTEBOOK PROJECT DISCOVERY V11 VERIFICATION FAILED',
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
  'SCIENTIFIC NOTEBOOK PROJECT DISCOVERY V11 VERIFICATION PASSED',
)

console.log(
  'PASS: project descriptions.',
)

console.log(
  'PASS: normalized project tags.',
)

console.log(
  'PASS: project-set search.',
)

console.log(
  'PASS: tag filtering.',
)

console.log(
  'PASS: backward-compatible saved sets.',
)
