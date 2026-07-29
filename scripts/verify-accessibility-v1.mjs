import fs from 'node:fs'

const failures = []

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    failures.push(
      'Missing file: ' +
      filePath,
    )

    return ''
  }

  return fs.readFileSync(
    filePath,
    'utf8',
  )
}

function requireMarker(
  content,
  marker,
  label,
) {
  if (!content.includes(marker)) {
    failures.push(
      'Missing ' +
      label +
      ': ' +
      marker,
    )
  }
}

const app =
  readFile(
    'src/App.tsx',
  )

const appCss =
  readFile(
    'src/App.css',
  )

const workspace =
  readFile(
    'src/components/EngineeringWorkspace.tsx',
  )

requireMarker(
  app,
  'className="skip-link"',
  'skip navigation link',
)

requireMarker(
  app,
  'tabIndex={-1}',
  'focusable calculator directory',
)

requireMarker(
  app,
  'aria-label="Search calculators"',
  'calculator search label',
)

requireMarker(
  app,
  'className="result-count"',
  'calculator result counter',
)

requireMarker(
  app,
  'aria-atomic="true"',
  'atomic live region',
)

requireMarker(
  workspace,
  "key === 'Home'",
  'Home keyboard navigation',
)

requireMarker(
  workspace,
  "key === 'End'",
  'End keyboard navigation',
)

requireMarker(
  workspace,
  'aria-orientation="horizontal"',
  'tablist orientation',
)

requireMarker(
  workspace,
  'aria-selected={isActive}',
  'active tab state',
)

requireMarker(
  workspace,
  'aria-controls={`workspace-panel-${tab.id}`}',
  'tab and panel connection',
)

const focusablePanels =
  (
    workspace.match(
      /role="tabpanel"\s+tabIndex=\{0\}/g,
    ) ?? []
  ).length

if (focusablePanels !== 16) {
  failures.push(
    'Expected 16 focusable panels but found ' +
    String(focusablePanels) +
    '.',
  )
}

requireMarker(
  appCss,
  '/* Accessibility hardening v1 */',
  'accessibility CSS marker',
)

requireMarker(
  appCss,
  ':focus-visible',
  'visible keyboard focus',
)

requireMarker(
  appCss,
  'prefers-reduced-motion: reduce',
  'reduced motion support',
)

if (failures.length > 0) {
  console.error()
  console.error(
    'ACCESSIBILITY VERIFICATION FAILED',
  )

  failures.forEach(
    (failure) => {
      console.error(
        '- ' + failure,
      )
    },
  )

  process.exit(1)
}

console.log(
  'ACCESSIBILITY VERIFICATION PASSED',
)

console.log(
  'Skip navigation verified.',
)

console.log(
  'Visible focus states verified.',
)

console.log(
  'Reduced motion support verified.',
)

console.log(
  'Workspace keyboard navigation verified.',
)

console.log(
  'Focusable panels verified: 16',
)
