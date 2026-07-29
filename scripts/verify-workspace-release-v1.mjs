import fs from 'node:fs'
import path from 'node:path'

const root =
  process.cwd()

const workspacePath =
  path.join(
    root,
    'src/components/EngineeringWorkspace.tsx',
  )

const workspaceCssPath =
  path.join(
    root,
    'src/styles/engineering-workspace.css',
  )

const expectedTabs = [
  ['command', '01'],
  ['launcher', '02'],
  ['activity', '03'],
  ['quality', '04'],
  ['dashboard', '05'],
  ['insights', '06'],
  ['records', '07'],
  ['compare', '08'],
  ['projects', '09'],
  ['reports', '10'],
  ['search', '11'],
  ['metadata', '12'],
  ['management', '13'],
  ['templates', '14'],
  ['collections', '15'],
  ['data', '16'],
]

const failures = []

function fail(message) {
  failures.push(message)
}

function requireFile(
  filePath,
  label,
) {
  if (
    fs.existsSync(filePath) ===
    false
  ) {
    fail(
      `Missing ${label}: ${
        path.relative(
          root,
          filePath,
        )
      }`,
    )

    return false
  }

  return true
}

function requireText(
  content,
  marker,
  label,
) {
  if (
    content.includes(marker) ===
    false
  ) {
    fail(
      `Missing ${label}: ${marker}`,
    )
  }
}

if (
  requireFile(
    workspacePath,
    'Engineering Workspace file',
  ) === false
) {
  console.error(
    'WORKSPACE RELEASE VERIFICATION FAILED',
  )

  failures.forEach(
    (message) =>
      console.error(
        `- ${message}`,
      ),
  )

  process.exit(1)
}

requireFile(
  workspaceCssPath,
  'Engineering Workspace CSS',
)

const workspace =
  fs.readFileSync(
    workspacePath,
    'utf8',
  )

const workspaceCss =
  fs.existsSync(
    workspaceCssPath,
  )
    ? fs.readFileSync(
        workspaceCssPath,
        'utf8',
      )
    : ''

const tabStart =
  workspace.indexOf(
    'const WORKSPACE_TABS = [',
  )

const tabEnd =
  workspace.indexOf(
    '] as const',
    tabStart,
  )

if (
  tabStart === -1 ||
  tabEnd === -1
) {
  fail(
    'WORKSPACE_TABS block could not be parsed.',
  )
} else {
  const tabBlock =
    workspace.slice(
      tabStart,
      tabEnd,
    )

  const actualTabs =
    Array.from(
      tabBlock.matchAll(
        /id: '([^']+)',\s*number: '([^']+)'/g,
      ),
      (match) => [
        match[1],
        match[2],
      ],
    )

  if (
    JSON.stringify(
      actualTabs,
    ) !==
    JSON.stringify(
      expectedTabs,
    )
  ) {
    fail(
      'Workspace tab order or numbering differs from the expected 01–16 release structure.',
    )

    console.error(
      'Expected tabs:',
      expectedTabs,
    )

    console.error(
      'Actual tabs:',
      actualTabs,
    )
  }

  const ids =
    actualTabs.map(
      ([id]) => id,
    )

  const numbers =
    actualTabs.map(
      ([, number]) =>
        number,
    )

  if (
    new Set(ids).size !==
    ids.length
  ) {
    fail(
      'Duplicate Workspace tab IDs found.',
    )
  }

  if (
    new Set(numbers).size !==
    numbers.length
  ) {
    fail(
      'Duplicate Workspace tab numbers found.',
    )
  }
}

expectedTabs.forEach(
  ([id]) => {
    requireText(
      workspace,
      `id="workspace-panel-${id}"`,
      `${id} panel`,
    )

    requireText(
      workspace,
      `aria-labelledby="workspace-tab-${id}"`,
      `${id} panel accessibility link`,
    )

    requireText(
      workspace,
      `hidden={activeTab !== '${id}'}`,
      `${id} panel visibility condition`,
    )
  },
)

requireText(
  workspace,
  'role="tablist"',
  'Workspace tablist role',
)

requireText(
  workspace,
  'role="tab"',
  'Workspace tab role',
)

requireText(
  workspace,
  'role="tabpanel"',
  'Workspace tabpanel role',
)

requireText(
  workspace,
  'aria-selected={isActive}',
  'active tab accessibility state',
)

requireText(
  workspace,
  'aria-controls={`workspace-panel-${tab.id}`}',
  'tab-to-panel accessibility connection',
)

const panelIds =
  Array.from(
    workspace.matchAll(
      /id="workspace-panel-([^"]+)"/g,
    ),
    (match) =>
      match[1],
  )

if (
  panelIds.length !==
  expectedTabs.length
) {
  fail(
    `Expected ${expectedTabs.length} Workspace panels but found ${panelIds.length}.`,
  )
}

if (
  new Set(panelIds).size !==
  panelIds.length
) {
  fail(
    'Duplicate Workspace panel IDs found.',
  )
}

const localImports =
  Array.from(
    workspace.matchAll(
      /from '\.\/([^']+)'/g,
    ),
    (match) =>
      match[1],
  )

localImports.forEach(
  (moduleName) => {
    const candidates = [
      path.join(
        root,
        'src/components',
        `${moduleName}.tsx`,
      ),
      path.join(
        root,
        'src/components',
        `${moduleName}.ts`,
      ),
    ]

    const componentPath =
      candidates.find(
        (candidate) =>
          fs.existsSync(
            candidate,
          ),
      )

    if (
      componentPath ===
      undefined
    ) {
      fail(
        `Imported component file not found: ${moduleName}`,
      )

      return
    }

    const component =
      fs.readFileSync(
        componentPath,
        'utf8',
      )

    const styleImports =
      Array.from(
        component.matchAll(
          /import '\.\.\/styles\/([^']+\.css)'/g,
        ),
        (match) =>
          match[1],
      )

    styleImports.forEach(
      (styleName) => {
        requireFile(
          path.join(
            root,
            'src/styles',
            styleName,
          ),
          `${moduleName} stylesheet`,
        )
      },
    )
  },
)

const criticalComponents = [
  [
    'WorkspaceCommandCenterPanel.tsx',
    'Command Center',
  ],
  [
    'WorkspaceSmartLauncherPanel.tsx',
    'Smart Launcher',
  ],
  [
    'WorkspaceActivityFeedPanel.tsx',
    'Activity Feed',
  ],
  [
    'WorkspaceDataQualityAssistantPanel.tsx',
    'Data Quality Assistant',
  ],
  [
    'WorkspaceDashboardPanel.tsx',
    'Engineering dashboard',
  ],
  [
    'WorkspaceInsightsPanel.tsx',
    'Engineering activity insights',
  ],
  [
    'WorkspaceReportBuilderPanel.tsx',
    'Print / Save PDF',
  ],
]

criticalComponents.forEach(
  ([
    fileName,
    marker,
  ]) => {
    const filePath =
      path.join(
        root,
        'src/components',
        fileName,
      )

    if (
      requireFile(
        filePath,
        fileName,
      )
    ) {
      const content =
        fs.readFileSync(
          filePath,
          'utf8',
        )

      requireText(
        content,
        marker,
        `${fileName} release marker`,
      )
    }
  },
)

if (
  workspaceCss.includes(
    'scroll-snap-type: x mandatory',
  )
) {
  fail(
    'Legacy horizontal mandatory tab scrolling is still present.',
  )
}

requireText(
  workspaceCss,
  'Workspace navigation grid v4',
  'responsive Workspace navigation grid',
)

if (
  failures.length > 0
) {
  console.error()
  console.error(
    'WORKSPACE RELEASE VERIFICATION FAILED',
  )

  failures.forEach(
    (message) =>
      console.error(
        `- ${message}`,
      ),
  )

  process.exit(1)
}

console.log(
  'WORKSPACE RELEASE VERIFICATION PASSED',
)

console.log(
  `Tabs verified: ${expectedTabs.length}`,
)

console.log(
  `Panels verified: ${panelIds.length}`,
)

console.log(
  `Local component imports verified: ${localImports.length}`,
)

console.log(
  'Accessibility links verified.',
)

console.log(
  'Responsive navigation verified.',
)

console.log(
  'Component stylesheet links verified.',
)
