/**
 * HomeDashboard
 * Phase 2: Engineering-first homepage dashboard
 */

import { useState } from 'react'
import type { CalculatorDefinition } from '../../types/calculator'
import { HomeSearch } from './HomeSearch'
import { RecentCalculators } from './RecentCalculators'
import { FavoriteCalculators } from './FavoriteCalculators'
import { CategoryGrid } from './CategoryGrid'
import { HomeProblemSolverEntry } from './HomeProblemSolverEntry'
import { CalculatorStage } from '../CalculatorStage'
import { EngineeringErrorBoundary } from '../EngineeringErrorBoundary'

interface HomeDashboardProps {
  calculators: CalculatorDefinition[]
  categories: Array<{ name: string; icon: string; live: number }>
  recentCalculators: CalculatorDefinition[]
  favoriteCalculators: CalculatorDefinition[]
  activeCalculator: CalculatorDefinition
  activeCalculatorIsFavorite: boolean
  onOpenCalculator: (calculatorId: string) => void
  onOpenCategory: (categoryName: string) => void
  onOpenProblemSolver: () => void
  onOpenWorkspaceTool: (
    tabId: 'records' | 'compare' | 'command',
    targetId?: string,
  ) => void
  onToggleFavorite: (calculatorId: string) => void
  liveCalculators: CalculatorDefinition[]
}

export function HomeDashboard({
  calculators,
  categories,
  recentCalculators,
  favoriteCalculators,
  activeCalculator,
  activeCalculatorIsFavorite,
  onOpenCalculator,
  onOpenCategory,
  onOpenProblemSolver,
  onOpenWorkspaceTool,
  onToggleFavorite,
  liveCalculators,
}: HomeDashboardProps) {
  const liveCalculatorCount = calculators.filter(
    (calculator) => calculator.available,
  ).length

  const [
    copyState,
    setCopyState,
  ] = useState<
    'idle' | 'copied' | 'failed'
  >('idle')

  async function writeClipboardText(
    value: string,
  ): Promise<boolean> {
    try {
      if (
        window.isSecureContext &&
        navigator.clipboard?.writeText
      ) {
        await navigator.clipboard.writeText(
          value,
        )

        return true
      }
    } catch {
      // Continue to the DOM fallback.
    }

    const textArea =
      document.createElement(
        'textarea',
      )

    textArea.value = value
    textArea.setAttribute(
      'readonly',
      '',
    )

    textArea.style.position =
      'fixed'
    textArea.style.opacity =
      '0'
    textArea.style.pointerEvents =
      'none'

    document.body.appendChild(
      textArea,
    )

    textArea.focus()
    textArea.select()

    try {
      return document.execCommand(
        'copy',
      )
    } catch {
      return false
    } finally {
      textArea.remove()
    }
  }

  async function copyCalculatorLink() {
    const calculatorUrl =
      new URL(
        window.location.href,
      )

    calculatorUrl.searchParams.set(
      'calculator',
      activeCalculator.id,
    )

    calculatorUrl.hash =
      'workbench'

    const copied =
      await writeClipboardText(
        calculatorUrl.toString(),
      )

    setCopyState(
      copied
        ? 'copied'
        : 'failed',
    )

    window.setTimeout(
      () => {
        setCopyState('idle')
      },
      1600,
    )
  }

  return (
    <div className="home-dashboard">
      <section className="home-workspace-hero">
        <div className="home-workspace-content">
          <div className="home-intro">
            <h1>
              Engineering calculations,
              <br />
              in one workspace<span className="home-intro-period">.</span>
            </h1>
            <p className="home-intro-deck">
              {liveCalculatorCount} verified calculators across{' '}
              {categories.length} engineering disciplines.
            </p>
          </div>

          <HomeSearch
            calculators={calculators}
            onOpenCalculator={onOpenCalculator}
          />

          <div className="home-category-shortcuts">
            {categories.slice(0, 5).map((category) => (
              <button
                key={category.name}
                type="button"
                className="home-category-shortcut"
                onClick={() => onOpenCategory(category.name)}
              >
                <span aria-hidden="true">{category.icon}</span>
                {category.name}
              </button>
            ))}
            <a href="#categories" className="home-category-shortcut-all">
              View all
            </a>
          </div>
        </div>

        <div className="home-workspace-live" id="workbench">
          <div className="home-workspace-live-header">
            <span className="home-workspace-live-label">Live workspace</span>
            <div
              className="home-workspace-actions"
              aria-label="Calculator actions"
            >
              <button
                type="button"
                className="home-workspace-favorite home-workspace-favorite--icon"
                data-favorite={activeCalculatorIsFavorite}
                aria-pressed={activeCalculatorIsFavorite}
                aria-label={
                  activeCalculatorIsFavorite
                    ? 'Remove calculator from favorites'
                    : 'Add calculator to favorites'
                }
                title={
                  activeCalculatorIsFavorite
                    ? 'Remove from favorites'
                    : 'Add to favorites'
                }
                onClick={() =>
                  onToggleFavorite(activeCalculator.id)
                }
              >
                <span aria-hidden="true">
                  {activeCalculatorIsFavorite ? '★' : '☆'}
                </span>
              </button>

              <button
                type="button"
                className="home-workspace-action"
                onClick={() => {
                  void copyCalculatorLink()
                }}
                aria-live="polite"
              >
                <span aria-hidden="true">↗</span>
                {copyState === 'copied'
                  ? 'Copied'
                  : copyState === 'failed'
                    ? 'Copy failed'
                    : 'Copy link'}
              </button>

              <button
                type="button"
                className="home-workspace-action"
                onClick={() =>
                  onOpenWorkspaceTool(
                    'records',
                    'workspace-save-current',
                  )
                }
              >
                <span aria-hidden="true">＋</span>
                Save
              </button>

              <button
                type="button"
                className="home-workspace-action"
                onClick={() =>
                  onOpenWorkspaceTool(
                    'records',
                    'workspace-history',
                  )
                }
              >
                <span aria-hidden="true">↺</span>
                History
              </button>

              <button
                type="button"
                className="home-workspace-action"
                onClick={() =>
                  onOpenWorkspaceTool(
                    'compare',
                    'workspace-compare',
                  )
                }
              >
                <span aria-hidden="true">⇄</span>
                Compare
              </button>

              <button
                type="button"
                className="home-workspace-action"
                onClick={() =>
                  onOpenWorkspaceTool(
                    'records',
                    'workspace-export',
                  )
                }
              >
                <span aria-hidden="true">⇩</span>
                Export
              </button>

              <button
                type="button"
                className="home-workspace-action"
                onClick={() =>
                  onOpenWorkspaceTool('command')
                }
              >
                <span aria-hidden="true">•••</span>
                More tools
              </button>
            </div>
          </div>

          <div className="home-workspace-live-body">
            <EngineeringErrorBoundary
              key={activeCalculator.id}
              area={`${activeCalculator.title} calculator`}
            >
              <CalculatorStage
                activeCalculator={activeCalculator}
                liveCalculators={liveCalculators}
                onSelect={onOpenCalculator}
              />
            </EngineeringErrorBoundary>
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="home-recent-heading">
        <div className="home-section-header home-section-header--compact">
          <h2 id="home-recent-heading">Continue working</h2>
          <a href="#calculators" className="home-section-view-toolkit">
            View toolkit →
          </a>
        </div>

        <div className="home-dual-grid">
          <RecentCalculators
            recentCalculators={recentCalculators}
            onOpenCalculator={onOpenCalculator}
          />

          <FavoriteCalculators
            favoriteCalculators={favoriteCalculators}
            onOpenCalculator={onOpenCalculator}
          />
        </div>
      </section>

      <section className="home-section" aria-labelledby="home-explore-heading">
        <div className="home-section-header">
          <h2 id="home-explore-heading">Explore engineering</h2>
          <p>
            Navigate by discipline or access the complete calculator directory.
          </p>
        </div>

        <CategoryGrid
          categories={categories}
          onOpenCategory={onOpenCategory}
        />

        <div className="home-all-calculators">
          <a href="#calculators" className="home-all-calculators-link">
            <span className="home-all-calculators-icon" aria-hidden="true">
              ▦
            </span>
            <div>
              <strong>All calculators</strong>
              <span>Browse the complete directory</span>
            </div>
            <span className="home-all-calculators-arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </section>

      <HomeProblemSolverEntry onOpenProblemSolver={onOpenProblemSolver} />
    </div>
  )
}
