import {
  lazy,
  Suspense,
  useEffect,
  useState,
} from 'react'
import type { CalculatorDefinition } from '../types/calculator'







import '../styles/engineering-workspace.css'

const WorkspaceCommandCenterPanel =
  lazy(() =>
    import(
      './WorkspaceCommandCenterPanel'
    ).then((module) => ({
      default:
        module.WorkspaceCommandCenterPanel,
    })),
  )

const WorkspaceSmartLauncherPanel =
  lazy(() =>
    import(
      './WorkspaceSmartLauncherPanel'
    ).then((module) => ({
      default:
        module.WorkspaceSmartLauncherPanel,
    })),
  )

const WorkspaceActivityFeedPanel =
  lazy(() =>
    import(
      './WorkspaceActivityFeedPanel'
    ).then((module) => ({
      default:
        module.WorkspaceActivityFeedPanel,
    })),
  )

const WorkspaceDataQualityAssistantPanel =
  lazy(() =>
    import(
      './WorkspaceDataQualityAssistantPanel'
    ).then((module) => ({
      default:
        module.WorkspaceDataQualityAssistantPanel,
    })),
  )

const WorkspaceDashboardPanel =
  lazy(() =>
    import(
      './WorkspaceDashboardPanel'
    ).then((module) => ({
      default:
        module.WorkspaceDashboardPanel,
    })),
  )

const WorkspaceInsightsPanel =
  lazy(() =>
    import(
      './WorkspaceInsightsPanel'
    ).then((module) => ({
      default:
        module.WorkspaceInsightsPanel,
    })),
  )

const CalculationExportPanel =
  lazy(() =>
    import(
      './CalculationExportPanel'
    ).then((module) => ({
      default:
        module.CalculationExportPanel,
    })),
  )

const CalculationHistoryPanel =
  lazy(() =>
    import(
      './CalculationHistoryPanel'
    ).then((module) => ({
      default:
        module.CalculationHistoryPanel,
    })),
  )

const CalculationComparisonPanel =
  lazy(() =>
    import(
      './CalculationComparisonPanel'
    ).then((module) => ({
      default:
        module.CalculationComparisonPanel,
    })),
  )

const SavedComparisonsPanel =
  lazy(() =>
    import(
      './SavedComparisonsPanel'
    ).then((module) => ({
      default:
        module.SavedComparisonsPanel,
    })),
  )

const ProjectWorkspacesPanel =
  lazy(() =>
    import(
      './ProjectWorkspacesPanel'
    ).then((module) => ({
      default:
        module.ProjectWorkspacesPanel,
    })),
  )

const ProjectFilesPanel =
  lazy(() =>
    import(
      './ProjectFilesPanel'
    ).then((module) => ({
      default:
        module.ProjectFilesPanel,
    })),
  )

const WorkspaceReportBuilderPanel =
  lazy(() =>
    import(
      './WorkspaceReportBuilderPanel'
    ).then((module) => ({
      default:
        module.WorkspaceReportBuilderPanel,
    })),
  )

const WorkspaceSearchPanel =
  lazy(() =>
    import(
      './WorkspaceSearchPanel'
    ).then((module) => ({
      default:
        module.WorkspaceSearchPanel,
    })),
  )

const WorkspaceMetadataPanel =
  lazy(() =>
    import(
      './WorkspaceMetadataPanel'
    ).then((module) => ({
      default:
        module.WorkspaceMetadataPanel,
    })),
  )

const WorkspaceRecordManagementPanel =
  lazy(() =>
    import(
      './WorkspaceRecordManagementPanel'
    ).then((module) => ({
      default:
        module.WorkspaceRecordManagementPanel,
    })),
  )

const WorkspaceTemplatesPanel =
  lazy(() =>
    import(
      './WorkspaceTemplatesPanel'
    ).then((module) => ({
      default:
        module.WorkspaceTemplatesPanel,
    })),
  )

const WorkspaceCollectionsPanel =
  lazy(() =>
    import(
      './WorkspaceCollectionsPanel'
    ).then((module) => ({
      default:
        module.WorkspaceCollectionsPanel,
    })),
  )

const PersonalDataBackupPanel =
  lazy(() =>
    import(
      './PersonalDataBackupPanel'
    ).then((module) => ({
      default:
        module.PersonalDataBackupPanel,
    })),
  )

const ACTIVE_TAB_KEY =
  'cheme-toolkit.workspace-active-tab.v1'

const WORKSPACE_TABS = [
  {
    id: 'command',
    number: '01',
    label: 'Command Center',
    title: 'Engineering command center',
    description:
      'Continue recent work, launch core workspace tools and review important data-health actions.',
  },
  {
    id: 'launcher',
    number: '02',
    label: 'Smart Launcher',
    title: 'Intent-based smart launcher',
    description:
      'Describe your goal and open the best matching Workspace tool or personal calculator.',
  },
  {
    id: 'activity',
    number: '03',
    label: 'Activity Feed',
    title: 'Chronological activity feed',
    description:
      'Review calculations, comparisons, projects, templates, collections and reports in one timeline.',
  },
  {
    id: 'quality',
    number: '04',
    label: 'Quality Assistant',
    title: 'Workspace data quality assistant',
    description:
      'Find incomplete metadata, missing dates and empty workspace structures with local recommendations.',
  },
  {
    id: 'dashboard',
    number: '05',
    label: 'Overview',
    title: 'Workspace dashboard',
    description:
      'Review recent work, project activity, metadata quality and personal data health.',
  },
  {
    id: 'insights',
    number: '06',
    label: 'Insights',
    title: 'Workspace insights and analytics',
    description:
      'Review activity trends, record distribution, calculator usage and workspace data quality.',
  },
  {
    id: 'records',
    number: '07',
    label: 'Save & History',
    title: 'Calculation records',
    description:
      'Export results, save calculations and reopen previous engineering work.',
  },
  {
    id: 'compare',
    number: '08',
    label: 'Compare',
    title: 'Engineering comparison',
    description:
      'Compare saved cases, preserve snapshots and review numerical differences.',
  },
  {
    id: 'projects',
    number: '09',
    label: 'Projects',
    title: 'Project workspace',
    description:
      'Organize calculations and comparisons inside combined project files.',
  },
  {
    id: 'reports',
    number: '10',
    label: 'Reports',
    title: 'Engineering report builder',
    description:
      'Combine saved workspace records into structured printable engineering reports.',
  },
  {
    id: 'search',
    number: '11',
    label: 'Search',
    title: 'Workspace search',
    description:
      'Search calculations, comparisons, projects, templates, collections and reports from one index.',
  },
  {
    id: 'metadata',
    number: '12',
    label: 'Tags & Notes',
    title: 'Workspace metadata',
    description:
      'Add searchable tags, notes and descriptions to saved engineering records.',
  },
  {
    id: 'management',
    number: '13',
    label: 'Manage',
    title: 'Record management',
    description:
      'Rename, duplicate, tag, organize and safely delete saved workspace records.',
  },
  {
    id: 'templates',
    number: '14',
    label: 'Templates',
    title: 'Reusable engineering cases',
    description:
      'Create reusable calculator starting cases from saved engineering work.',
  },
  {
    id: 'collections',
    number: '15',
    label: 'Collections',
    title: 'Smart workspace collections',
    description:
      'Organize records and reusable cases with manual selections or saved smart rules.',
  },
  {
    id: 'data',
    number: '16',
    label: 'Data & Backup',
    title: 'Personal data management',
    description:
      'Export, restore or clear the workspace data stored in this browser.',
  },
] as const

type WorkspaceTabId =
  (typeof WORKSPACE_TABS)[number]['id']

const WORKSPACE_GROUPS: Array<{
  id: 'core' | 'projects' | 'knowledge' | 'data'
  label: string
  description: string
  tabs: WorkspaceTabId[]
}> = [
  {
    id: 'core',
    label: 'Core tools',
    description:
      'Launch, save and compare engineering work.',
    tabs: [
      'command',
      'launcher',
      'records',
      'compare',
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    description:
      'Organize projects, reports and activity.',
    tabs: [
      'projects',
      'reports',
      'activity',
    ],
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    description:
      'Search, annotate and reuse saved work.',
    tabs: [
      'search',
      'metadata',
      'management',
      'templates',
      'collections',
    ],
  },
  {
    id: 'data',
    label: 'Data',
    description:
      'Review insights, quality and backups.',
    tabs: [
      'dashboard',
      'insights',
      'quality',
      'data',
    ],
  },
]

interface EngineeringWorkspaceProps {
  calculator: CalculatorDefinition
  onOpenCalculator: (
    calculatorId: string,
  ) => void
  openProblemSolverRequest: number
  openToolRequest: {
    tabId: 'records' | 'compare' | 'command'
    targetId?: string
    requestId: number
  } | null
}

function readActiveTab():
  WorkspaceTabId {
  try {
    const stored =
      localStorage.getItem(
        ACTIVE_TAB_KEY,
      )

    const isValid =
      WORKSPACE_TABS.some(
        (tab) =>
          tab.id === stored,
      )

    return isValid
      ? stored as WorkspaceTabId
      : 'command'
  } catch {
    return 'command'
  }
}

function WorkspaceModuleFallback() {
  return (
    <div
      className="engineering-workspace-module-loading"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      Loading workspace tool…
    </div>
  )
}

export function EngineeringWorkspace({
  calculator,
  onOpenCalculator,
  openProblemSolverRequest,
  openToolRequest,
}: EngineeringWorkspaceProps) {
  const [
    activeTab,
    setActiveTab,
  ] = useState<WorkspaceTabId>(
    readActiveTab,
  )

  const [
    loadedTabs,
    setLoadedTabs,
  ] = useState<
    Set<WorkspaceTabId>
  >(
    () =>
      new Set([
        activeTab,
      ]),
  )


  const activeDefinition =
    WORKSPACE_TABS.find(
      (tab) =>
        tab.id === activeTab,
    ) ?? WORKSPACE_TABS[0]

  const activeGroup =
    WORKSPACE_GROUPS.find(
      (group) =>
        group.tabs.includes(
          activeTab,
        ),
    ) ?? WORKSPACE_GROUPS[0]

  const visibleTabs =
    WORKSPACE_TABS.filter(
      (tab) =>
        activeGroup.tabs.includes(
          tab.id,
        ),
    )

  useEffect(() => {
    localStorage.setItem(
      ACTIVE_TAB_KEY,
      activeTab,
    )
  }, [activeTab])

  useEffect(() => {
    setLoadedTabs(
      (current) => {
        if (
          current.has(
            activeTab,
          )
        ) {
          return current
        }

        const next =
          new Set(current)

        next.add(
          activeTab,
        )

        return next
      },
    )
  }, [activeTab])

  useEffect(() => {
    if (!openToolRequest) {
      return
    }

    setActiveTab(
      openToolRequest.tabId,
    )

    window.setTimeout(() => {
      if (
        openToolRequest.targetId ===
        'workspace-history'
      ) {
        window.dispatchEvent(
          new Event(
            'cheme-toolkit:expand-calculation-history',
          ),
        )
      }

      const target =
        openToolRequest.targetId
          ? document.getElementById(
              openToolRequest.targetId,
            )
          : document.getElementById(
              `workspace-tab-${openToolRequest.tabId}`,
            )

      target?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })

      document
        .getElementById(
          `workspace-tab-${openToolRequest.tabId}`,
        )
        ?.focus()
    }, 0)
  }, [openToolRequest])

  useEffect(() => {
    if (
      openProblemSolverRequest <=
      0
    ) {
      return
    }

    setActiveTab(
      'launcher',
    )

    window.setTimeout(
      () => {
        document
          .getElementById(
            'workspace-tab-launcher',
          )
          ?.focus()
      },
      0,
    )
  }, [openProblemSolverRequest])

  function selectTab(
    tabId: WorkspaceTabId,
  ) {
    setActiveTab(tabId)
  }

  function selectGroup(
    groupId:
      (typeof WORKSPACE_GROUPS)[number]['id'],
  ) {
    const group =
      WORKSPACE_GROUPS.find(
        (candidate) =>
          candidate.id === groupId,
      )

    const firstTab =
      group?.tabs[0]

    if (firstTab) {
      selectTab(firstTab)
    }
  }

  function handleTabKeyDown(
    event:
      React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    const key =
      event.key

    let nextIndex =
      currentIndex

    if (key === 'ArrowRight') {
      nextIndex =
        (
          currentIndex +
          1
        ) %
        visibleTabs.length
    } else if (
      key === 'ArrowLeft'
    ) {
      nextIndex =
        (
          currentIndex -
          1 +
          visibleTabs.length
        ) %
        visibleTabs.length
    } else if (
      key === 'Home'
    ) {
      nextIndex = 0
    } else if (
      key === 'End'
    ) {
      nextIndex =
        visibleTabs.length -
        1
    } else {
      return
    }

    event.preventDefault()

    const nextTab =
      visibleTabs[nextIndex]

    selectTab(nextTab.id)

    window.setTimeout(() => {
      document
        .getElementById(
          `workspace-tab-${nextTab.id}`,
        )
        ?.focus()
    }, 0)
  }

  return (
    <section
      className="engineering-workspace-shell"
      aria-label="My engineering workspace"
    >
      <header className="engineering-workspace-header">
        <div className="engineering-workspace-title">
          <span>
            Personal engineering notebook
          </span>

          <h2>
            My Engineering Workspace
          </h2>

          <p>
            Save, compare and organize work
            without leaving the active
            calculator.
          </p>
        </div>

        <div className="engineering-workspace-context">
          <span>
            Active calculator
          </span>

          <strong>
            {calculator.title}
          </strong>

          <small>
            {calculator.category}
          </small>
        </div>
      </header>

      <div
        className="engineering-workspace-groups"
        aria-label="Workspace tool groups"
      >
        {WORKSPACE_GROUPS.map(
          (group) => {
            const isActive =
              group.id ===
              activeGroup.id

            return (
              <button
                key={group.id}
                type="button"
                className={
                  isActive
                    ? 'is-active'
                    : ''
                }
                aria-pressed={isActive}
                onClick={() =>
                  selectGroup(group.id)
                }
              >
                <strong>
                  {group.label}
                </strong>

                <span>
                  {group.description}
                </span>
              </button>
            )
          },
        )}
      </div>

      <div
        className="engineering-workspace-tabs"
        role="tablist"
        aria-label={`${activeGroup.label} workspace tools`}
        aria-orientation="horizontal"
      >
        {visibleTabs.map(
          (tab, index) => {
            const isActive =
              activeTab === tab.id

            return (
              <button
                key={tab.id}
                id={`workspace-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`workspace-panel-${tab.id}`}
                tabIndex={
                  isActive
                    ? 0
                    : -1
                }
                className={
                  isActive
                    ? 'is-active'
                    : ''
                }
                onClick={() =>
                  selectTab(tab.id)
                }
                onKeyDown={(event) =>
                  handleTabKeyDown(
                    event,
                    index,
                  )
                }
              >
                <span>
                  {tab.number}
                </span>

                <strong>
                  {tab.label}
                </strong>
              </button>
            )
          },
        )}
      </div>

      <div
        className="engineering-workspace-active-heading"
        aria-live="polite"
        aria-atomic="true"
      >
        <div>
          <span>
            {activeDefinition.number}
          </span>

          <div>
            <h3>
              {activeDefinition.title}
            </h3>

            <p>
              {activeDefinition.description}
            </p>
          </div>
        </div>
      </div>

      <div
        id="workspace-panel-command"
        className="engineering-workspace-panel engineering-workspace-panel-command"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="workspace-tab-command"
        hidden={activeTab !== 'command'}
      >
        <div className="engineering-workspace-module">
          {loadedTabs.has('command') ? (
            <Suspense
              fallback={<WorkspaceModuleFallback />}
            >
              <WorkspaceCommandCenterPanel
                          currentCalculator={
                            calculator
                          }
                          onOpenCalculator={
                            onOpenCalculator
                          }
                          onOpenTab={selectTab}
                        />
            </Suspense>
          ) : null}
        </div>
      </div>

      <div
        id="workspace-panel-launcher"
        className="engineering-workspace-panel engineering-workspace-panel-launcher"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="workspace-tab-launcher"
        hidden={activeTab !== 'launcher'}
      >
        <div className="engineering-workspace-module">
          {loadedTabs.has('launcher') ? (
            <Suspense
              fallback={<WorkspaceModuleFallback />}
            >
              <WorkspaceSmartLauncherPanel
                          currentCalculator={
                            calculator
                          }
                          onOpenCalculator={
                            onOpenCalculator
                          }
                          onOpenTab={selectTab}
                        />
            </Suspense>
          ) : null}
        </div>
      </div>

      <div
        id="workspace-panel-activity"
        className="engineering-workspace-panel engineering-workspace-panel-activity"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="workspace-tab-activity"
        hidden={activeTab !== 'activity'}
      >
        <div className="engineering-workspace-module">
          {loadedTabs.has('activity') ? (
            <Suspense
              fallback={<WorkspaceModuleFallback />}
            >
              <WorkspaceActivityFeedPanel
                          onOpenCalculator={
                            onOpenCalculator
                          }
                          onOpenTab={selectTab}
                        />
            </Suspense>
          ) : null}
        </div>
      </div>

      <div
        id="workspace-panel-quality"
        className="engineering-workspace-panel engineering-workspace-panel-quality"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="workspace-tab-quality"
        hidden={activeTab !== 'quality'}
      >
        <div className="engineering-workspace-module">
          {loadedTabs.has('quality') ? (
            <Suspense
              fallback={<WorkspaceModuleFallback />}
            >
              <WorkspaceDataQualityAssistantPanel
                          onOpenTab={selectTab}
                        />
            </Suspense>
          ) : null}
        </div>
      </div>

      <div
        id="workspace-panel-insights"
        className="engineering-workspace-panel engineering-workspace-panel-insights"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="workspace-tab-insights"
        hidden={activeTab !== 'insights'}
      >
        <div className="engineering-workspace-module">
          {loadedTabs.has('insights') ? (
            <Suspense
              fallback={<WorkspaceModuleFallback />}
            >
              <WorkspaceInsightsPanel />
            </Suspense>
          ) : null}
        </div>
      </div>

      <div
        id="workspace-panel-records"
        className="engineering-workspace-panel engineering-workspace-panel-records"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="workspace-tab-records"
        hidden={activeTab !== 'records'}
      >
        <div
          id="workspace-export"
          className="engineering-workspace-module"
        >
          {loadedTabs.has('records') ? (
            <Suspense
              fallback={<WorkspaceModuleFallback />}
            >
              <CalculationExportPanel
                          calculator={calculator}
                        />
            </Suspense>
          ) : null}
        </div>

        <div
          id="workspace-history"
          className="engineering-workspace-module"
        >
          {loadedTabs.has('records') ? (
            <Suspense
              fallback={<WorkspaceModuleFallback />}
            >
              <CalculationHistoryPanel
                          calculator={calculator}
                          onOpenCalculator={
                            onOpenCalculator
                          }
                        />
            </Suspense>
          ) : null}
        </div>
      </div>

      <div
        id="workspace-panel-compare"
        className="engineering-workspace-panel engineering-workspace-panel-compare"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="workspace-tab-compare"
        hidden={activeTab !== 'compare'}
      >
        <div
          id="workspace-compare"
          className="engineering-workspace-module"
        >
          {loadedTabs.has('compare') ? (
            <Suspense
              fallback={<WorkspaceModuleFallback />}
            >
              <CalculationComparisonPanel
                          calculator={calculator}
                        />
            </Suspense>
          ) : null}
        </div>

        <div className="engineering-workspace-module">
          {loadedTabs.has('compare') ? (
            <Suspense
              fallback={<WorkspaceModuleFallback />}
            >
              <SavedComparisonsPanel />
            </Suspense>
          ) : null}
        </div>
      </div>

      <div
        id="workspace-panel-projects"
        className="engineering-workspace-panel engineering-workspace-panel-projects"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="workspace-tab-projects"
        hidden={activeTab !== 'projects'}
      >
        <div className="engineering-workspace-module">
          {loadedTabs.has('projects') ? (
            <Suspense
              fallback={<WorkspaceModuleFallback />}
            >
              <ProjectWorkspacesPanel
                          calculator={calculator}
                        />
            </Suspense>
          ) : null}
        </div>

        <div className="engineering-workspace-module">
          {loadedTabs.has('projects') ? (
            <Suspense
              fallback={<WorkspaceModuleFallback />}
            >
              <ProjectFilesPanel />
            </Suspense>
          ) : null}
        </div>
      </div>
      <div
        id="workspace-panel-data"
        className="engineering-workspace-panel engineering-workspace-panel-data"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="workspace-tab-data"
        hidden={activeTab !== 'data'}
      >
        <div className="engineering-workspace-module">
          {loadedTabs.has('data') ? (
            <Suspense
              fallback={<WorkspaceModuleFallback />}
            >
              <PersonalDataBackupPanel />
            </Suspense>
          ) : null}
        </div>
      </div>

      <div
        id="workspace-panel-search"
        className="engineering-workspace-panel engineering-workspace-panel-search"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="workspace-tab-search"
        hidden={activeTab !== 'search'}
      >
        <div className="engineering-workspace-module">
          {loadedTabs.has('search') ? (
            <Suspense
              fallback={<WorkspaceModuleFallback />}
            >
              <WorkspaceSearchPanel
                          onOpenCalculator={
                            onOpenCalculator
                          }
                          onOpenTab={selectTab}
                        />
            </Suspense>
          ) : null}
        </div>
      </div>

      <div
        id="workspace-panel-metadata"
        className="engineering-workspace-panel engineering-workspace-panel-metadata"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="workspace-tab-metadata"
        hidden={activeTab !== 'metadata'}
      >
        <div className="engineering-workspace-module">
          {loadedTabs.has('metadata') ? (
            <Suspense
              fallback={<WorkspaceModuleFallback />}
            >
              <WorkspaceMetadataPanel />
            </Suspense>
          ) : null}
        </div>
      </div>

      <div
        id="workspace-panel-management"
        className="engineering-workspace-panel engineering-workspace-panel-management"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="workspace-tab-management"
        hidden={activeTab !== 'management'}
      >
        <div className="engineering-workspace-module">
          {loadedTabs.has('management') ? (
            <Suspense
              fallback={<WorkspaceModuleFallback />}
            >
              <WorkspaceRecordManagementPanel />
            </Suspense>
          ) : null}
        </div>
      </div>

      <div
        id="workspace-panel-dashboard"
        className="engineering-workspace-panel engineering-workspace-panel-dashboard"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="workspace-tab-dashboard"
        hidden={activeTab !== 'dashboard'}
      >
        <div className="engineering-workspace-module">
          {loadedTabs.has('dashboard') ? (
            <Suspense
              fallback={<WorkspaceModuleFallback />}
            >
              <WorkspaceDashboardPanel
                          onOpenCalculator={
                            onOpenCalculator
                          }
                          onOpenTab={selectTab}
                        />
            </Suspense>
          ) : null}
        </div>
      </div>

      <div
        id="workspace-panel-templates"
        className="engineering-workspace-panel engineering-workspace-panel-templates"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="workspace-tab-templates"
        hidden={activeTab !== 'templates'}
      >
        <div className="engineering-workspace-module">
          {loadedTabs.has('templates') ? (
            <Suspense
              fallback={<WorkspaceModuleFallback />}
            >
              <WorkspaceTemplatesPanel
                          onOpenCalculator={
                            onOpenCalculator
                          }
                          onOpenTab={selectTab}
                        />
            </Suspense>
          ) : null}
        </div>
      </div>

      <div
        id="workspace-panel-collections"
        className="engineering-workspace-panel engineering-workspace-panel-collections"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="workspace-tab-collections"
        hidden={activeTab !== 'collections'}
      >
        <div className="engineering-workspace-module">
          {loadedTabs.has('collections') ? (
            <Suspense
              fallback={<WorkspaceModuleFallback />}
            >
              <WorkspaceCollectionsPanel
                          onOpenCalculator={
                            onOpenCalculator
                          }
                          onOpenTab={selectTab}
                        />
            </Suspense>
          ) : null}
        </div>
      </div>

      <div
        id="workspace-panel-reports"
        className="engineering-workspace-panel engineering-workspace-panel-reports"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby="workspace-tab-reports"
        hidden={activeTab !== 'reports'}
      >
        <div className="engineering-workspace-module">
          {loadedTabs.has('reports') ? (
            <Suspense
              fallback={<WorkspaceModuleFallback />}
            >
              <WorkspaceReportBuilderPanel />
            </Suspense>
          ) : null}
        </div>
      </div>

    </section>
  )
}
