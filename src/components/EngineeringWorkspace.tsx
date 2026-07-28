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
import '../styles/engineering-workspace.css'

const ACTIVE_TAB_KEY =
  'cheme-toolkit.workspace-active-tab.v1'

const WORKSPACE_TABS = [
  {
    id: 'records',
    number: '01',
    label: 'Save & History',
    title: 'Calculation records',
    description:
      'Export results, save calculations and reopen previous engineering work.',
  },
  {
    id: 'compare',
    number: '02',
    label: 'Compare',
    title: 'Engineering comparison',
    description:
      'Compare saved cases, preserve snapshots and review numerical differences.',
  },
  {
    id: 'projects',
    number: '03',
    label: 'Projects',
    title: 'Project workspace',
    description:
      'Organize calculations and comparisons inside combined project files.',
  },
  {
    id: 'data',
    number: '04',
    label: 'Data & Backup',
    title: 'Personal data management',
    description:
      'Export, restore or clear the workspace data stored in this browser.',
  },
  {
    id: 'search',
    number: '05',
    label: 'Search',
    title: 'Workspace search',
    description:
      'Search calculations, comparison snapshots and project files from one index.',
  },
  {
    id: 'metadata',
    number: '06',
    label: 'Tags & Notes',
    title: 'Workspace metadata',
    description:
      'Add searchable tags, notes and descriptions to saved engineering records.',
  },
  {
    id: 'management',
    number: '07',
    label: 'Manage',
    title: 'Record management',
    description:
      'Rename, duplicate, tag, organize and safely delete saved workspace records.',
  },
  {
    id: 'dashboard',
    number: '08',
    label: 'Overview',
    title: 'Workspace dashboard',
    description:
      'Review recent work, project activity, metadata quality and personal data health.',
  },
  {
    id: 'templates',
    number: '09',
    label: 'Templates',
    title: 'Reusable engineering cases',
    description:
      'Create reusable calculator starting cases from saved engineering work.',
  },
] as const

type WorkspaceTabId =
  (typeof WORKSPACE_TABS)[number]['id']

interface EngineeringWorkspaceProps {
  calculator: CalculatorDefinition
  onOpenCalculator: (
    calculatorId: string,
  ) => void
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
      : 'records'
  } catch {
    return 'records'
  }
}

export function EngineeringWorkspace({
  calculator,
  onOpenCalculator,
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
    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight'
    ) {
      return
    }

    event.preventDefault()

    const direction =
      event.key === 'ArrowRight'
        ? 1
        : -1

    const nextIndex =
      (
        currentIndex +
        direction +
        WORKSPACE_TABS.length
      ) %
      WORKSPACE_TABS.length

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

      <div className="engineering-workspace-active-heading">
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
        id="workspace-panel-records"
        className="engineering-workspace-panel engineering-workspace-panel-records"
        role="tabpanel"
        aria-labelledby="workspace-tab-records"
        hidden={activeTab !== 'records'}
      >
        <div className="engineering-workspace-module">
          <CalculationExportPanel
            calculator={calculator}
          />
        </div>

        <div className="engineering-workspace-module">
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
        aria-labelledby="workspace-tab-compare"
        hidden={activeTab !== 'compare'}
      >
        <div className="engineering-workspace-module">
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

    </section>
  )
}
