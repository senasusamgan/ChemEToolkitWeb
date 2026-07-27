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
    </section>
  )
}
