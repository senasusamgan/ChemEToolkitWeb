import {
  useEffect,
  useState,
} from 'react'
import type { CalculatorDefinition } from '../types/calculator'
import { CalculationExportPanel } from './CalculationExportPanel'
import { CalculationHistoryPanel } from './CalculationHistoryPanel'
import { CalculationComparisonPanel } from './CalculationComparisonPanel'
import { SavedComparisonsPanel } from './SavedComparisonsPanel'
import { ProjectWorkspacesPanel } from './ProjectWorkspacesPanel'
import { ProjectFilesPanel } from './ProjectFilesPanel'
import { PersonalDataBackupPanel } from './PersonalDataBackupPanel'
import { WorkspaceSearchPanel } from './WorkspaceSearchPanel'
import { WorkspaceMetadataPanel } from './WorkspaceMetadataPanel'
import { WorkspaceRecordManagementPanel } from './WorkspaceRecordManagementPanel'
import { WorkspaceDashboardPanel } from './WorkspaceDashboardPanel'
import { WorkspaceTemplatesPanel } from './WorkspaceTemplatesPanel'
import { WorkspaceCollectionsPanel } from './WorkspaceCollectionsPanel'
import { WorkspaceReportBuilderPanel } from './WorkspaceReportBuilderPanel'
import { WorkspaceInsightsPanel } from './WorkspaceInsightsPanel'
import { WorkspaceCommandCenterPanel } from './WorkspaceCommandCenterPanel'
import { WorkspaceSmartLauncherPanel } from './WorkspaceSmartLauncherPanel'
import { WorkspaceActivityFeedPanel } from './WorkspaceActivityFeedPanel'
import { WorkspaceDataQualityAssistantPanel } from './WorkspaceDataQualityAssistantPanel'
import '../styles/engineering-workspace.css'

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

  const activeDefinition =
    WORKSPACE_TABS.find(
      (tab) =>
        tab.id === activeTab,
    ) ?? WORKSPACE_TABS[0]

  useEffect(() => {
    localStorage.setItem(
      ACTIVE_TAB_KEY,
      activeTab,
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
        WORKSPACE_TABS.length
    } else if (
      key === 'ArrowLeft'
    ) {
      nextIndex =
        (
          currentIndex -
          1 +
          WORKSPACE_TABS.length
        ) %
        WORKSPACE_TABS.length
    } else if (
      key === 'Home'
    ) {
      nextIndex = 0
    } else if (
      key === 'End'
    ) {
      nextIndex =
        WORKSPACE_TABS.length -
        1
    } else {
      return
    }

    event.preventDefault()

    const nextTab =
      WORKSPACE_TABS[nextIndex]

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
        className="engineering-workspace-tabs"
        role="tablist"
        aria-label="Engineering workspace tools"
        aria-orientation="horizontal"
      >
        {WORKSPACE_TABS.map(
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
          <WorkspaceCommandCenterPanel
            currentCalculator={
              calculator
            }
            onOpenCalculator={
              onOpenCalculator
            }
            onOpenTab={selectTab}
          />
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
          <WorkspaceSmartLauncherPanel
            currentCalculator={
              calculator
            }
            onOpenCalculator={
              onOpenCalculator
            }
            onOpenTab={selectTab}
          />
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
          <WorkspaceActivityFeedPanel
            onOpenCalculator={
              onOpenCalculator
            }
            onOpenTab={selectTab}
          />
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
          <WorkspaceDataQualityAssistantPanel
            onOpenTab={selectTab}
          />
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
          <WorkspaceInsightsPanel />
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
          <CalculationExportPanel
            calculator={calculator}
          />
        </div>

        <div
          id="workspace-history"
          className="engineering-workspace-module"
        >
          <CalculationHistoryPanel
            calculator={calculator}
            onOpenCalculator={
              onOpenCalculator
            }
          />
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
          <CalculationComparisonPanel
            calculator={calculator}
          />
        </div>

        <div className="engineering-workspace-module">
          <SavedComparisonsPanel />
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
          <ProjectWorkspacesPanel
            calculator={calculator}
          />
        </div>

        <div className="engineering-workspace-module">
          <ProjectFilesPanel />
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
          <PersonalDataBackupPanel />
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
          <WorkspaceSearchPanel
            onOpenCalculator={
              onOpenCalculator
            }
            onOpenTab={selectTab}
          />
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
          <WorkspaceMetadataPanel />
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
          <WorkspaceRecordManagementPanel />
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
          <WorkspaceDashboardPanel
            onOpenCalculator={
              onOpenCalculator
            }
            onOpenTab={selectTab}
          />
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
          <WorkspaceTemplatesPanel
            onOpenCalculator={
              onOpenCalculator
            }
            onOpenTab={selectTab}
          />
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
          <WorkspaceCollectionsPanel
            onOpenCalculator={
              onOpenCalculator
            }
            onOpenTab={selectTab}
          />
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
          <WorkspaceReportBuilderPanel />
        </div>
      </div>

    </section>
  )
}
