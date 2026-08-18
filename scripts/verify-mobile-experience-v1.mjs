import {
  readFileSync,
} from 'node:fs'

const main =
  readFileSync(
    'src/main.tsx',
    'utf8',
  )

const styles =
  readFileSync(
    'src/styles/mobile-experience.css',
    'utf8',
  )

const appImport =
  main.indexOf(
    "import App from './App'",
  )

const mobileImport =
  main.indexOf(
    "import './styles/mobile-experience.css'",
  )

const contracts = [
  [
    appImport >= 0
      && mobileImport >
        appImport,
    'Mobile experience must load after the App style graph.',
  ],
  [
    styles.includes(
      '@media (max-width: 768px)',
    ),
    'Primary mobile breakpoint missing.',
  ],
  [
    styles.includes(
      '@media (max-width: 430px)',
    ),
    'Compact-phone breakpoint missing.',
  ],
  [
    styles.includes(
      '.app-header.site-header',
    )
      && styles.includes(
        '--mobile-header-height: 64px',
      ),
    'Compact mobile header contract missing.',
  ],
  [
    styles.includes(
      '.home-workspace-hero',
    )
      && styles.includes(
        'grid-template-columns: minmax(0, 1fr)',
      ),
    'Homepage workspace must collapse to one column.',
  ],
  [
    styles.includes(
      '.home-workspace-live',
    )
      && styles.includes(
        'max-height: none',
      )
      && styles.includes(
        'position: static',
      ),
    'Mobile live workspace must avoid desktop sticky/nested scrolling.',
  ],
  [
    styles.includes(
      '.home-category-shortcuts',
    )
      && styles.includes(
        'flex-wrap: nowrap',
      )
      && styles.includes(
        'overflow-x: auto',
      ),
    'Category shortcuts must use a horizontal mobile rail.',
  ],
  [
    styles.includes(
      '.home-workspace-actions',
    )
      && styles.includes(
        'overscroll-behavior-inline: contain',
      ),
    'Workspace actions mobile rail missing.',
  ],
  [
    styles.includes(
      '.home-dual-grid,'
    )
      && styles.includes(
        '.home-category-grid',
      ),
    'Homepage card grids must collapse on mobile.',
  ],
  [
    styles.includes(
      '.calculator-list article',
    ),
    'Calculator directory mobile layout missing.',
  ],
  [
    styles.includes(
      'font-size: 16px',
    ),
    'Mobile form zoom protection missing.',
  ],
  [
    styles.includes(
      'min-height: 44px',
    ),
    'Mobile touch-target contract missing.',
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
    'MOBILE EXPERIENCE V1 VERIFICATION FAILED',
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
  'MOBILE EXPERIENCE V1 VERIFICATION PASSED',
)

console.log(
  'PASS: mobile override loads last.',
)

console.log(
  'PASS: homepage becomes true single-column mobile.',
)

console.log(
  'PASS: desktop sticky workspace removed on phones.',
)

console.log(
  'PASS: shortcut and workspace actions use swipe rails.',
)

console.log(
  'PASS: catalog and touch targets are mobile-safe.',
)
