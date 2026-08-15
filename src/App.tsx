import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import './App.css'
import './styles/calculator-polish.css'
import './styles/mobile-v1.css'
import './styles/personal-toolkit.css'
import './styles/frontend-polish-v1.css'
import './styles/calculator-experience-v2.css'
import './styles/calculator-discovery-v3.css'
import './styles/homepage-quick-start-v4.css'
import './styles/personal-toolkit-dashboard-v5.css'
import './styles/engineering-trust-v6.css'
import './styles/problem-solver-experience-v7.css'
import './styles/responsive-accessibility-v8.css'
import './styles/catalog-compact-pagination-v9.css'
import { Brand } from './components/Brand'
import { FeedbackPanel } from './components/FeedbackPanel'
import { CalculatorStage } from './components/CalculatorStage'
const HomepageProblemSolverPanel =
  lazy(() =>
    import(
      './components/HomepageProblemSolverPanel'
    ).then((module) => ({
      default:
        module.HomepageProblemSolverPanel,
    })),
  )

const EngineeringWorkspace =
  lazy(() =>
    import(
      './components/EngineeringWorkspace'
    ).then((module) => ({
      default:
        module.EngineeringWorkspace,
    })),
  )

import { calculators } from './data/calculators'
import { categories } from './data/categories'

const defaultCalculator =
  calculators.find((calculator) => calculator.id === 'reynoldsNumber') ??
  calculators.find((calculator) => calculator.available) ??
  calculators[0]

const FAVORITES_STORAGE_KEY =
  'cheme-toolkit-favorites-v1'

const RECENT_STORAGE_KEY =
  'cheme-toolkit-recent-v1'

const PERSONAL_DATA_CHANGE_EVENT =
  'cheme-toolkit:personal-data-changed'

const CATALOG_PAGE_SIZE =
  20

function readStoredIds(key: string): string[] {
  try {
    const storedValue =
      window.localStorage.getItem(key)

    if (!storedValue) {
      return []
    }

    const parsedValue: unknown =
      JSON.parse(storedValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(
      (value): value is string =>
        typeof value === 'string',
    )
  } catch {
    return []
  }
}

function App() {
  const liveCalculatorCount = calculators.filter(
    (calculator) => calculator.available,
  ).length


  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All disciplines')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [catalogPage, setCatalogPage] = useState(1)
  const [activeCalculatorId, setActiveCalculatorId] = useState(
    defaultCalculator.id,
  )
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [
    shouldLoadWorkspace,
    setShouldLoadWorkspace,
  ] = useState(false)

  const [
    shouldLoadProblemSolver,
    setShouldLoadProblemSolver,
  ] = useState(false)

  const [
    problemSolverOpenRequest,
    setProblemSolverOpenRequest,
  ] = useState(0)

  const workspaceSectionRef =
    useRef<HTMLElement | null>(
      null,
    )

  const problemSolverSectionRef =
    useRef<HTMLDivElement | null>(
      null,
    )


  const [favoriteCalculatorIds, setFavoriteCalculatorIds] =
    useState<string[]>(() =>
      readStoredIds(FAVORITES_STORAGE_KEY),
    )

  const [recentCalculatorIds, setRecentCalculatorIds] =
    useState<string[]>(() =>
      readStoredIds(RECENT_STORAGE_KEY),
    )

  const activeCalculator =
    calculators.find((calculator) => calculator.id === activeCalculatorId) ??
    defaultCalculator


  const favoriteCalculators = useMemo(
    () =>
      favoriteCalculatorIds
        .map((calculatorId) =>
          calculators.find(
            (calculator) =>
              calculator.id === calculatorId &&
              calculator.available,
          ),
        )
        .filter(
          (
            calculator,
          ): calculator is (typeof calculators)[number] =>
            Boolean(calculator),
        ),
    [favoriteCalculatorIds],
  )

  const recentCalculators = useMemo(
    () =>
      recentCalculatorIds
        .map((calculatorId) =>
          calculators.find(
            (calculator) =>
              calculator.id === calculatorId &&
              calculator.available,
          ),
        )
        .filter(
          (
            calculator,
          ): calculator is (typeof calculators)[number] =>
            Boolean(calculator),
        ),
    [recentCalculatorIds],
  )

  const activeCalculatorIsFavorite =
    favoriteCalculatorIds.includes(
      activeCalculator.id,
    )

  useEffect(() => {
    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(favoriteCalculatorIds),
    )
  }, [favoriteCalculatorIds])

  useEffect(() => {
    window.localStorage.setItem(
      RECENT_STORAGE_KEY,
      JSON.stringify(recentCalculatorIds),
    )
  }, [recentCalculatorIds])



  useEffect(() => {
    function refreshPersonalToolkit() {
      setFavoriteCalculatorIds(
        readStoredIds(
          FAVORITES_STORAGE_KEY,
        ),
      )

      setRecentCalculatorIds(
        readStoredIds(
          RECENT_STORAGE_KEY,
        ),
      )
    }

    window.addEventListener(
      PERSONAL_DATA_CHANGE_EVENT,
      refreshPersonalToolkit,
    )

    return () => {
      window.removeEventListener(
        PERSONAL_DATA_CHANGE_EVENT,
        refreshPersonalToolkit,
      )
    }
  }, [])

  useEffect(() => {
    const element =
      problemSolverSectionRef.current

    if (element === null) {
      return
    }

    function loadProblemSolver() {
      setShouldLoadProblemSolver(
        true,
      )
    }

    if (
      window.location.hash ===
      '#problem-solver'
    ) {
      loadProblemSolver()

      window.requestAnimationFrame(
        () => {
          element.scrollIntoView({
            block:
              'start',
          })
        },
      )

      return
    }

    if (
      !(
        'IntersectionObserver'
        in window
      )
    ) {
      loadProblemSolver()

      return
    }

    const observer =
      new IntersectionObserver(
        (
          entries,
        ) => {
          const shouldLoad =
            entries.some(
              (
                entry,
              ) =>
                entry.isIntersecting,
            )

          if (!shouldLoad) {
            return
          }

          loadProblemSolver()
          observer.disconnect()
        },
        {
          rootMargin:
            '320px 0px',
        },
      )

    observer.observe(
      element,
    )

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const element =
      workspaceSectionRef.current

    const fallbackTimer =
      window.setTimeout(
        () =>
          setShouldLoadWorkspace(
            true,
          ),
        2500,
      )

    if (
      element === null ||
      !(
        'IntersectionObserver'
        in window
      )
    ) {
      return () =>
        window.clearTimeout(
          fallbackTimer,
        )
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const shouldLoad =
            entries.some(
              (entry) =>
                entry.isIntersecting,
            )

          if (!shouldLoad) {
            return
          }

          window.clearTimeout(
            fallbackTimer,
          )

          setShouldLoadWorkspace(
            true,
          )

          observer.disconnect()
        },
        {
          rootMargin:
            '160px 0px',
        },
      )

    observer.observe(element)

    return () => {
      window.clearTimeout(
        fallbackTimer,
      )

      observer.disconnect()
    }
  }, [])

  const filteredCalculators = useMemo(() => {
    const searchTerms =
      search
        .trim()
        .toLocaleLowerCase()
        .split(/\s+/)
        .filter(Boolean)

    return calculators.filter((calculator) => {
      const categoryMatches =
        selectedCategory === 'All disciplines' ||
        calculator.category === selectedCategory

      const searchHaystack =
        `${calculator.title} ${calculator.category}`
          .toLocaleLowerCase()

      const searchMatches =
        searchTerms.length === 0 ||
        searchTerms.every((term) =>
          searchHaystack.includes(term),
        )

      const favoriteMatches =
        !showFavoritesOnly ||
        favoriteCalculatorIds.includes(
          calculator.id,
        )

      return (
        categoryMatches &&
        searchMatches &&
        favoriteMatches
      )
    })
  }, [
    search,
    selectedCategory,
    showFavoritesOnly,
    favoriteCalculatorIds,
  ])

  const catalogPageCount =
    Math.max(
      1,
      Math.ceil(
        filteredCalculators.length /
        CATALOG_PAGE_SIZE,
      ),
    )

  const safeCatalogPage =
    Math.min(
      catalogPage,
      catalogPageCount,
    )

  const catalogStartIndex =
    (
      safeCatalogPage - 1
    ) * CATALOG_PAGE_SIZE

  const catalogEndIndex =
    Math.min(
      catalogStartIndex +
      CATALOG_PAGE_SIZE,
      filteredCalculators.length,
    )

  const visibleCalculators =
    filteredCalculators.slice(
      catalogStartIndex,
      catalogEndIndex,
    )

  function openProblemSolver() {
    setShouldLoadProblemSolver(
      true,
    )

    setShouldLoadWorkspace(
      true,
    )

    setProblemSolverOpenRequest(
      (currentRequest) =>
        currentRequest + 1,
    )

    window.requestAnimationFrame(
      () => {
        problemSolverSectionRef
          .current
          ?.scrollIntoView({
            behavior:
              'smooth',
            block:
              'start',
          })
      },
    )
  }

  function clearCatalogFilters() {
    setSearch('')
    setSelectedCategory('All disciplines')
    setShowFavoritesOnly(false)
    setCatalogPage(1)
  }

  function changeCatalogPage(
    nextPage: number,
  ) {
    const clampedPage =
      Math.min(
        Math.max(
          nextPage,
          1,
        ),
        catalogPageCount,
      )

    setCatalogPage(
      clampedPage,
    )

    window.requestAnimationFrame(
      () => {
        document
          .querySelector(
            '#catalog-list-start',
          )
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
      },
    )
  }

  function openCategory(category: string) {
    setSelectedCategory(category)
    setCatalogPage(1)

    window.requestAnimationFrame(() => {
      document.querySelector('#calculators')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  function openCalculator(calculatorId: string) {
    setActiveCalculatorId(calculatorId)

    setRecentCalculatorIds((currentIds) => [
      calculatorId,
      ...currentIds.filter(
        (currentId) =>
          currentId !== calculatorId,
      ),
    ].slice(0, 5))

    window.requestAnimationFrame(() => {
      document.querySelector('#workbench')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  function toggleFavorite(calculatorId: string) {
    setFavoriteCalculatorIds((currentIds) =>
      currentIds.includes(calculatorId)
        ? currentIds.filter(
            (currentId) =>
              currentId !== calculatorId,
          )
        : [
            calculatorId,
            ...currentIds,
          ],
    )
  }

  function clearFavorites() {
    setFavoriteCalculatorIds([])
  }

  function clearRecentCalculators() {
    setRecentCalculatorIds([])
  }


  return (
    <main id="top">
      <a
        className="skip-link"
        href="#calculators"
      >
        Skip to calculator directory
      </a>
            <a
        className="skip-to-workbench"
        href="#workbench"
      >
        Skip to calculator workspace
      </a>

<header
        className="site-header"
        data-menu-open={isMobileMenuOpen}
      >
        <Brand />

        <nav
          className="desktop-nav"
          aria-label="Primary navigation"
        >
          <a href="#calculators">Calculators</a>
          <a href="#your-toolkit">Your Toolkit</a>
          <a
            href="#problem-solver"
            onClick={(event) => {
              event.preventDefault()
              openProblemSolver()
            }}
          >
            Problem Solver
          </a>
          <a href="#categories">Categories</a>
          <a href="#method">Method</a>
          <a href="#references">References</a>
          <a href="#about">About</a>
        </nav>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={
            isMobileMenuOpen
              ? 'Close navigation menu'
              : 'Open navigation menu'
          }
          aria-expanded={isMobileMenuOpen}
          onClick={() =>
            setIsMobileMenuOpen((current) => !current)
          }
        >
          <span aria-hidden="true">
            {isMobileMenuOpen ? '×' : '☰'}
          </span>
        </button>

        {isMobileMenuOpen ? (
          <nav
            className="mobile-nav"
            aria-label="Mobile navigation"
          >
            <a
              href="#calculators"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Calculators
            </a>
            <a
              href="#your-toolkit"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Your Toolkit
            </a>
            <a
              href="#problem-solver"
              onClick={(event) => {
                event.preventDefault()
                setIsMobileMenuOpen(false)
                openProblemSolver()
              }}
            >
              Problem Solver
            </a>

            <a
              href="#categories"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Categories
            </a>
            <a
              href="#method"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Method
            </a>
            <a
              href="#references"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              References
            </a>
            <a
              href="#about"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </a>
          </nav>
        ) : null}
      </header>

      <section className="hero notebook-grid">
        <div className="ruler" aria-hidden="true" />

        <div className="category-ribbon">
          {categories
            .filter((category) =>
              [
                'Thermodynamics',
                'Fluid Mechanics',
                'Heat Transfer',
                'Mass Transfer',
                'Reaction Engineering',
              ].includes(category.name),
            )
            .map((category) => (
              <button
                type="button"
                className="category-pill"
                data-selected={
                  selectedCategory === category.name
                }
                key={category.name}
                onClick={() => openCategory(category.name)}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
        </div>

        <div className="hero-copy">
          <p className="eyebrow">A verified chemical engineering workspace</p>
          <h1>
            Chemical engineering,
            <br />
            calculated clearly<span>.</span>
          </h1>
          <p className="hero-deck">
            <strong>
              {liveCalculatorCount} verified calculators
            </strong>{' '}
            across {categories.length} engineering disciplines—built for
            study, design checks and everyday engineering work.
          </p>

          <div className="hero-actions">
            <a className="button button-primary" href="#calculators">
              ▦ Explore calculators
            </a>
            <a className="button button-secondary" href="#categories">
              □ Browse categories
            </a>

            <a
              className="button button-secondary"
              href="#problem-solver"
              onClick={(event) => {
                event.preventDefault()
                openProblemSolver()
              }}
            >
              ◇ Solve a problem
            </a>
          </div>

          <div
            className="status-strip status-strip-v2"
            aria-label="Toolkit overview"
          >
            <div>
              <strong>{liveCalculatorCount}</strong>
              <span>verified calculators</span>
            </div>

            <div>
              <strong>{categories.length}</strong>
              <span>engineering disciplines</span>
            </div>

            <div>
              <strong>3</strong>
              <span>ways to work: calculate, solve, explore</span>
            </div>
          </div>
        </div>

        <div id="workbench" className="hero-workbench">
          <div className="active-calculator-tools">
            <button
              type="button"
              className="active-favorite-button"
              data-favorite={activeCalculatorIsFavorite}
              aria-pressed={activeCalculatorIsFavorite}
              onClick={() =>
                toggleFavorite(activeCalculator.id)
              }
            >
              <span aria-hidden="true">
                {activeCalculatorIsFavorite
                  ? '★'
                  : '☆'}
              </span>
              {activeCalculatorIsFavorite
                ? 'Saved to favorites'
                : 'Add to favorites'}
            </button>
          </div>

          <CalculatorStage
            activeCalculator={activeCalculator}
            liveCalculators={calculators.filter(
              (calculator) => calculator.available,
            )}
            onSelect={openCalculator}
          />
        </div>
      </section>

      <section
        className="quick-start-section"
        aria-labelledby="quick-start-heading"
      >
        <div className="quick-start-inner">
          <div className="quick-start-intro">
            <p className="eyebrow">
              Quick start
            </p>

            <h2 id="quick-start-heading">
              Pick up where you left off.
            </h2>

            <p>
              Continue with a recent calculation,
              browse the full toolkit or move directly
              into the engineering solver.
            </p>
          </div>

          <div className="quick-start-grid">
            <button
              type="button"
              className="quick-start-card quick-start-card-primary"
              onClick={() =>
                openCalculator(
                  (
                    recentCalculators[0] ??
                    activeCalculator
                  ).id,
                )
              }
            >
              <span
                className="quick-start-card-icon"
                aria-hidden="true"
              >
                ↗
              </span>

              <span className="quick-start-card-kicker">
                Continue
              </span>

              <strong>
                {recentCalculators[0]?.title ??
                  activeCalculator.title}
              </strong>

              <small>
                {recentCalculators.length > 0
                  ? 'Most recently opened calculator'
                  : 'Current calculator'}
              </small>
            </button>

            <a
              className="quick-start-card"
              href="#calculators"
            >
              <span
                className="quick-start-card-icon"
                aria-hidden="true"
              >
                ▦
              </span>

              <span className="quick-start-card-kicker">
                Browse
              </span>

              <strong>
                Calculator directory
              </strong>

              <small>
                {liveCalculatorCount} verified tools
              </small>
            </a>

            <button
              type="button"
              className="quick-start-card"
              onClick={openProblemSolver}
            >
              <span
                className="quick-start-card-icon"
                aria-hidden="true"
              >
                ◇
              </span>

              <span className="quick-start-card-kicker">
                Solve
              </span>

              <strong>
                Problem Solver
              </strong>

              <small>
                Start from an engineering problem
              </small>
            </button>

            <a
              className="quick-start-card"
              href="#your-toolkit"
            >
              <span
                className="quick-start-card-icon"
                aria-hidden="true"
              >
                ☆
              </span>

              <span className="quick-start-card-kicker">
                Favorites
              </span>

              <strong>
                Your Toolkit
              </strong>

              <small>
                {favoriteCalculators.length}{' '}
                saved calculator
                {favoriteCalculators.length === 1
                  ? ''
                  : 's'}
              </small>
            </a>
          </div>
        </div>
      </section>

      <div
        ref={
          problemSolverSectionRef
        }
        className="problem-solver-lazy-shell problem-solver-v7-section"
        data-loaded={
          shouldLoadProblemSolver
            ? 'true'
            : 'false'
        }
      >

        <div className="problem-solver-v7-header">
          <div className="problem-solver-v7-heading">
            <div
              className="problem-solver-v7-icon"
              aria-hidden="true"
            >
              ◇
            </div>

            <div>
              <p className="problem-solver-v7-kicker">
                Engineering Problem Solver
              </p>

              <h2>
                Start with the problem,
                not the equation.
              </h2>

              <p>
                Describe the engineering problem,
                include the known values and units,
                then review the selected method,
                assumptions and result.
              </p>
            </div>
          </div>

          <div
            className="problem-solver-v7-guide"
            aria-label="Problem statement guidance"
          >
            <article>
              <span aria-hidden="true">
                01
              </span>

              <div>
                <strong>
                  State the target
                </strong>

                <small>
                  What should be calculated?
                </small>
              </div>
            </article>

            <article>
              <span aria-hidden="true">
                02
              </span>

              <div>
                <strong>
                  Include known values
                </strong>

                <small>
                  Add numbers and units.
                </small>
              </div>
            </article>

            <article>
              <span aria-hidden="true">
                03
              </span>

              <div>
                <strong>
                  Review assumptions
                </strong>

                <small>
                  Check the model before use.
                </small>
              </div>
            </article>
          </div>
        </div>

        {shouldLoadProblemSolver ? (
          <Suspense
            fallback={
              <div
                className="problem-solver-lazy-placeholder"
                role="status"
                aria-live="polite"
              >
                <strong>
                  Loading Problem Solver…
                </strong>

                <span>
                  Preparing the local equation engine and
                  engineering result workspace.
                </span>
              </div>
            }
          >
            <HomepageProblemSolverPanel
              onOpenCalculator={
                openCalculator
              }
            />
          </Suspense>
        ) : (
          <div
            className="problem-solver-lazy-placeholder"
            role="status"
            aria-live="polite"
          >
            <strong>
              Problem Solver loads on approach
            </strong>

            <span>
              The full Solver is kept out of the initial
              application bundle until this section is
              needed.
            </span>

            <button
              type="button"
              onClick={
                openProblemSolver
              }
            >
              Load Problem Solver
            </button>
          </div>
        )}
      </div>


      <section
        ref={workspaceSectionRef}
        id="engineering-workspace"
        className="workspace-page-section notebook-grid"
      >
        <div className="workspace-page-inner">
          {shouldLoadWorkspace ? (
            <Suspense
              fallback={
                <div
                  className="workspace-lazy-placeholder"
                  role="status"
                  aria-live="polite"
                >
                  Loading engineering workspace…
                </div>
              }
            >
              <EngineeringWorkspace
                calculator={
                  activeCalculator
                }
                onOpenCalculator={
                  openCalculator
                }
                openProblemSolverRequest={
                  problemSolverOpenRequest
                }
              />
            </Suspense>
          ) : (
            <div
              className="workspace-lazy-placeholder"
              role="status"
              aria-live="polite"
            >
              Preparing engineering workspace…
            </div>
          )}
        </div>
      </section>

      <section
        className="section personal-toolkit-section"
        id="your-toolkit"
      >
        <div className="personal-toolkit-header">
          <div>
            <p className="eyebrow">
              Your personal workspace
            </p>
            <h2>Your Toolkit</h2>
            <p>
              Keep your most useful calculators close
              and return to recently opened tools
              without searching again.
            </p>
          </div>

          <div className="personal-toolkit-summary">
            <span>
              {favoriteCalculators.length} favorites
            </span>
            <span>
              {recentCalculators.length} recent
            </span>
          </div>
        </div>

        <div
          className="personal-toolkit-dashboard"
          aria-label="Personal toolkit overview"
        >
          <article className="toolkit-dashboard-primary">
            <div className="toolkit-dashboard-primary-copy">
              <span className="toolkit-dashboard-label">
                Current workspace
              </span>

              <strong>
                {activeCalculator.title}
              </strong>

              <p>
                {activeCalculator.category}
                {' · '}
                {activeCalculator.available
                  ? 'Verified calculator'
                  : 'Catalogued calculator'}
              </p>
            </div>

            <button
              type="button"
              className="toolkit-dashboard-continue"
              onClick={() =>
                openCalculator(
                  activeCalculator.id,
                )
              }
            >
              Continue working
              <span aria-hidden="true">
                ↗
              </span>
            </button>
          </article>

          <div className="toolkit-dashboard-stats">
            <article>
              <span aria-hidden="true">
                ★
              </span>

              <strong>
                {favoriteCalculators.length}
              </strong>

              <small>
                Favorites
              </small>
            </article>

            <article>
              <span aria-hidden="true">
                ↻
              </span>

              <strong>
                {recentCalculators.length}
              </strong>

              <small>
                Recent tools
              </small>
            </article>

            <article>
              <span aria-hidden="true">
                ◫
              </span>

              <strong>
                {
                  new Set(
                    favoriteCalculators.map(
                      (calculator) =>
                        calculator.category,
                    ),
                  ).size
                }
              </strong>

              <small>
                Favorite disciplines
              </small>
            </article>

            <article>
              <span aria-hidden="true">
                ✓
              </span>

              <strong>
                {liveCalculatorCount}
              </strong>

              <small>
                Verified tools
              </small>
            </article>
          </div>

          <div className="toolkit-dashboard-actions">
            <a href="#calculators">
              <span aria-hidden="true">
                ▦
              </span>

              <div>
                <strong>
                  Find a calculator
                </strong>

                <small>
                  Search the full directory
                </small>
              </div>

              <b aria-hidden="true">
                →
              </b>
            </a>

            <button
              type="button"
              onClick={openProblemSolver}
            >
              <span aria-hidden="true">
                ◇
              </span>

              <div>
                <strong>
                  Solve a problem
                </strong>

                <small>
                  Open the engineering solver
                </small>
              </div>

              <b aria-hidden="true">
                →
              </b>
            </button>

            <a href="#workbench">
              <span aria-hidden="true">
                ∑
              </span>

              <div>
                <strong>
                  Open workbench
                </strong>

                <small>
                  Return to active calculation
                </small>
              </div>

              <b aria-hidden="true">
                →
              </b>
            </a>
          </div>
        </div>

        <div className="personal-toolkit-grid">
          <article className="personal-toolkit-panel">
            <div className="personal-toolkit-panel-header">
              <h3>Favorites</h3>

              {favoriteCalculators.length > 0 ? (
                <button
                  type="button"
                  onClick={clearFavorites}
                >
                  Clear favorites
                </button>
              ) : null}
            </div>

            {favoriteCalculators.length > 0 ? (
              <ul className="personal-toolkit-list">
                {favoriteCalculators.map(
                  (calculator) => (
                    <li
                      className="personal-toolkit-item"
                      key={calculator.id}
                    >
                      <div className="personal-toolkit-item-copy">
                        <p>{calculator.category}</p>
                        <strong>
                          {calculator.title}
                        </strong>
                      </div>

                      <div className="personal-toolkit-item-actions">
                        <button
                          type="button"
                          aria-label={`Remove ${calculator.title} from favorites`}
                          onClick={() =>
                            toggleFavorite(
                              calculator.id,
                            )
                          }
                        >
                          ★
                        </button>

                        <button
                          type="button"
                          aria-label={`Open ${calculator.title}`}
                          onClick={() =>
                            openCalculator(
                              calculator.id,
                            )
                          }
                        >
                          →
                        </button>
                      </div>
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <div className="personal-toolkit-empty">
                Select the star beside a calculator
                to keep it here.
              </div>
            )}
          </article>

          <article className="personal-toolkit-panel">
            <div className="personal-toolkit-panel-header">
              <h3>Recently used</h3>

              {recentCalculators.length > 0 ? (
                <button
                  type="button"
                  onClick={clearRecentCalculators}
                >
                  Clear history
                </button>
              ) : null}
            </div>

            {recentCalculators.length > 0 ? (
              <ul className="personal-toolkit-list">
                {recentCalculators.map(
                  (calculator) => (
                    <li
                      className="personal-toolkit-item"
                      key={calculator.id}
                    >
                      <div className="personal-toolkit-item-copy">
                        <p>{calculator.category}</p>
                        <strong>
                          {calculator.title}
                        </strong>
                      </div>

                      <div className="personal-toolkit-item-actions">
                        <button
                          type="button"
                          aria-label={`Open ${calculator.title}`}
                          onClick={() =>
                            openCalculator(
                              calculator.id,
                            )
                          }
                        >
                          →
                        </button>
                      </div>
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <div className="personal-toolkit-empty">
                Calculators you open will appear here.
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="section categories-section" id="categories">
        <div className="section-heading">
          <p className="eyebrow">The complete curriculum</p>
          <h2>Eleven disciplines. One coherent toolkit.</h2>
          <p>
            Category selection filters the catalog so only the chosen
            discipline is shown.
          </p>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <article className="category-card" key={category.name}>
              <div className="category-number">
                {String(category.number).padStart(2, '0')}
              </div>
              <span className="category-mark">{category.icon}</span>
              <h3>{category.name}</h3>
              <p>
                {category.total} verified · {category.live} live
              </p>
              <button
                type="button"
                onClick={() => openCategory(category.name)}
              >
                Explore <span>↗</span>
              </button>
            </article>
          ))}
        </div>
      </section>

      <section
        className="section calculators-section"
        id="calculators"
        tabIndex={-1}
        aria-labelledby="calculator-directory-title"
      >
        <div className="catalog-top">
          <div className="section-heading">
            <p className="eyebrow">Start with a calculation</p>
            <h2 id="calculator-directory-title">
              Find the right tool, quickly.
            </h2>
          </div>

          <div className="catalog-controls">
            <div className="search-box">
              <span aria-hidden="true">⌕</span>

              <input
                type="search"
                aria-label="Search calculators"
                placeholder={`Search all ${calculators.length} calculators`}
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value,
                  )
                  setCatalogPage(1)
                }}
              />

              {search ? (
                <button
                  type="button"
                  className="catalog-search-clear"
                  aria-label="Clear calculator search"
                  onClick={() => {
                    setSearch('')
                    setCatalogPage(1)
                  }}
                >
                  ×
                </button>
              ) : null}
            </div>

            <select
              aria-label="Filter by discipline"
              value={selectedCategory}
              onChange={(event) => {
                setSelectedCategory(
                  event.target.value,
                )
                setCatalogPage(1)
              }}
            >
              <option>All disciplines</option>

              {categories.map((category) => (
                <option key={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="catalog-favorites-filter"
              data-active={showFavoritesOnly}
              aria-pressed={showFavoritesOnly}
              onClick={() => {
                setShowFavoritesOnly(
                  (current) => !current,
                )
                setCatalogPage(1)
              }}
            >
              <span aria-hidden="true">
                {showFavoritesOnly ? '★' : '☆'}
              </span>

              Favorites
              <b>{favoriteCalculators.length}</b>
            </button>
          </div>

          <div
            className="catalog-filter-chips"
            aria-label="Calculator discipline filters"
          >
            <button
              type="button"
              data-active={
                selectedCategory ===
                'All disciplines'
              }
              onClick={() => {
                setSelectedCategory(
                  'All disciplines',
                )
                setCatalogPage(1)
              }}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                type="button"
                key={category.name}
                data-active={
                  selectedCategory ===
                  category.name
                }
                onClick={() => {
                  setSelectedCategory(
                    category.name,
                  )
                  setCatalogPage(1)
                }}
              >
                <span aria-hidden="true">
                  {category.icon}
                </span>

                {category.name}
              </button>
            ))}
          </div>

          {recentCalculators.length > 0 ? (
            <div
              className="catalog-recent-strip"
              aria-label="Recently opened calculators"
            >
              <span className="catalog-recent-label">
                Recent
              </span>

              <div>
                {recentCalculators
                  .slice(0, 3)
                  .map((calculator) => (
                    <button
                      type="button"
                      key={calculator.id}
                      onClick={() =>
                        openCalculator(
                          calculator.id,
                        )
                      }
                    >
                      {calculator.title}
                      <span aria-hidden="true">
                        ↗
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          ) : null}
        </div>

        <div
          className="catalog-result-bar"
          id="catalog-list-start"
        >
          <p
            className="result-count"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {filteredCalculators.length > 0 ? (
              <>
                Showing{' '}
                <strong>
                  {catalogStartIndex + 1}
                  {'–'}
                  {catalogEndIndex}
                </strong>
                {' '}of{' '}
                <strong>
                  {filteredCalculators.length}
                </strong>
                {' '}calculators
              </>
            ) : (
              <>
                <strong>0</strong>
                {' '}calculators shown
              </>
            )}

            {showFavoritesOnly ? (
              <span> · favorites only</span>
            ) : null}

            {selectedCategory !==
            'All disciplines' ? (
              <span>
                {' '}· {selectedCategory}
              </span>
            ) : null}
          </p>

          {(search ||
            selectedCategory !==
              'All disciplines' ||
            showFavoritesOnly) ? (
            <button
              type="button"
              className="catalog-reset-button"
              onClick={clearCatalogFilters}
            >
              Reset filters
            </button>
          ) : null}
        </div>

        {filteredCalculators.length > 0 ? (
          <div className="calculator-list">
            {visibleCalculators.map((calculator, index) => (
            <article key={calculator.id}>
              <span className="list-index">
                {String(catalogStartIndex + index + 1).padStart(3, '0')}
              </span>
              <div>
                <p>{calculator.category}</p>
                <h3>{calculator.title}</h3>
                <span>
                  {calculator.available
                    ? 'Verified · ready to calculate'
                    : 'Catalogued · web migration pending'}
                </span>
              </div>

              {calculator.available ? (
                <div className="calculator-list-item-actions">
                  <button
                    type="button"
                    className="calculator-list-favorite"
                    data-favorite={
                      favoriteCalculatorIds.includes(
                        calculator.id,
                      )
                    }
                    aria-label={
                      favoriteCalculatorIds.includes(
                        calculator.id,
                      )
                        ? `Remove ${calculator.title} from favorites`
                        : `Add ${calculator.title} to favorites`
                    }
                    aria-pressed={
                      favoriteCalculatorIds.includes(
                        calculator.id,
                      )
                    }
                    onClick={() =>
                      toggleFavorite(calculator.id)
                    }
                  >
                    {favoriteCalculatorIds.includes(
                      calculator.id,
                    )
                      ? '★'
                      : '☆'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openCalculator(calculator.id)
                    }
                  >
                    Open calculator <span>→</span>
                  </button>
                </div>
              ) : (
                <span className="queued-badge">Catalogued</span>
              )}
            </article>
            ))}

            {catalogPageCount > 1 ? (
              <nav
                className="catalog-pagination"
                aria-label="Calculator directory pagination"
              >
                <button
                  type="button"
                  disabled={
                    safeCatalogPage <= 1
                  }
                  onClick={() =>
                    changeCatalogPage(
                      safeCatalogPage - 1,
                    )
                  }
                >
                  ← Previous
                </button>

                <label className="catalog-page-select">
                  <span>
                    Page
                  </span>

                  <select
                    aria-label="Calculator directory page"
                    value={
                      safeCatalogPage
                    }
                    onChange={(event) =>
                      changeCatalogPage(
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                  >
                    {Array.from(
                      {
                        length:
                          catalogPageCount,
                      },
                      (_, index) =>
                        index + 1,
                    ).map(
                      (pageNumber) => (
                        <option
                          key={
                            pageNumber
                          }
                          value={
                            pageNumber
                          }
                        >
                          {pageNumber}
                        </option>
                      ),
                    )}
                  </select>

                  <small>
                    of {catalogPageCount}
                  </small>
                </label>

                <button
                  type="button"
                  disabled={
                    safeCatalogPage >=
                    catalogPageCount
                  }
                  onClick={() =>
                    changeCatalogPage(
                      safeCatalogPage + 1,
                    )
                  }
                >
                  Next →
                </button>
              </nav>
            ) : null}
          </div>
        ) : (
          <div
            className="catalog-empty-state"
            role="status"
          >
            <span aria-hidden="true">
              ⌕
            </span>

            <div>
              <h3>No calculators found.</h3>

              <p>
                Try another search term,
                discipline or favorite filter.
              </p>
            </div>

            <button
              type="button"
              onClick={clearCatalogFilters}
            >
              Show all calculators
            </button>
          </div>
        )}
      </section>

      <section className="method-section" id="method">
        <div>
          <p className="eyebrow">Built like an engineering notebook</p>
          <h2>Traceable inputs. Visible formulas. Interpretable results.</h2>
        </div>
        <ol>
          <li>
            <b>01</b>
            <span>
              <strong>Enter known values</strong>
              Unit-aware fields keep the calculation basis explicit.
            </span>
          </li>
          <li>
            <b>02</b>
            <span>
              <strong>Calculate with context</strong>
              Verified engines apply the appropriate engineering model.
            </span>
          </li>
          <li>
            <b>03</b>
            <span>
              <strong>Read the engineering meaning</strong>
              Results retain formulas, regimes and reference context.
            </span>
          </li>
        </ol>
      </section>

      <section className="references-section section" id="references">
        <div className="section-heading">
          <p className="eyebrow">Reference shelf</p>
          <h2>Equations with a traceable basis.</h2>
          <p>
            Calculator engines are translated from verified ChemE Toolkit
            sources and checked against established engineering texts.
          </p>
        </div>

        <div
          className="reference-trust-strip"
          aria-label="Engineering verification approach"
        >
          <article>
            <span aria-hidden="true">
              01
            </span>

            <div>
              <strong>
                Traceable basis
              </strong>

              <p>
                Governing equations are grounded
                in established chemical engineering
                texts and standard engineering models.
              </p>
            </div>
          </article>

          <article>
            <span aria-hidden="true">
              02
            </span>

            <div>
              <strong>
                Verification pipeline
              </strong>

              <p>
                Catalog, routing, calculator tests,
                TypeScript and production builds are
                checked before each release.
              </p>
            </div>
          </article>

          <article>
            <span aria-hidden="true">
              03
            </span>

            <div>
              <strong>
                Visible assumptions
              </strong>

              <p>
                Units, governing relations,
                model context and limitations remain
                visible alongside the calculation.
              </p>
            </div>
          </article>

          <article>
            <span aria-hidden="true">
              04
            </span>

            <div>
              <strong>
                Engineering responsibility
              </strong>

              <p>
                Final and safety-critical decisions
                still require applicable standards,
                validated data and qualified review.
              </p>
            </div>
          </article>
        </div>

        <div className="reference-shelf-label">
          <span>
            Reference shelf
          </span>

          <p>
            Core sources are grouped by discipline.
            Calculator-specific assumptions and
            references remain visible inside the tool.
          </p>
        </div>

        <div className="reference-grid">
          <article>
            <span>01</span>
            <h3>Core chemical engineering</h3>
            <p>Perry’s Chemical Engineers’ Handbook.</p>
            <p>
              Felder, Rousseau &amp; Bullard — Elementary Principles of
              Chemical Processes.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Thermodynamics &amp; transport</h3>
            <p>
              Smith, Van Ness, Abbott &amp; Swihart — Introduction to Chemical
              Engineering Thermodynamics.
            </p>
            <p>Bird, Stewart &amp; Lightfoot — Transport Phenomena.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Heat &amp; fluid flow</h3>
            <p>
              Incropera et al. — Fundamentals of Heat and Mass Transfer.
            </p>
            <p>
              Çengel &amp; Cimbala — Fluid Mechanics: Fundamentals and
              Applications.
            </p>
          </article>
          <article>
            <span>04</span>
            <h3>Reactors &amp; separations</h3>
            <p>Fogler — Elements of Chemical Reaction Engineering.</p>
            <p>Wankat — Separation Process Engineering.</p>
          </article>
          <article>
            <span>05</span>
            <h3>Control &amp; numerical methods</h3>
            <p>Seborg et al. — Process Dynamics and Control.</p>
            <p>Chapra &amp; Canale — Numerical Methods for Engineers.</p>
          </article>
          <article>
            <span>06</span>
            <h3>Safety &amp; economics</h3>
            <p>CCPS — Quantitative Risk Analysis guidance.</p>
            <p>Towler &amp; Sinnott — Chemical Engineering Design.</p>
          </article>
        </div>
        <aside
          className="engineering-use-note"
          role="note"
          aria-label="Engineering-use note"
        >
          <h3>
            Engineering-use
            <br />
            note
          </h3>
          <p>
            Results are intended for education, preliminary screening and
            independent design checks. Safety-critical or final design
            decisions must be verified against the applicable code, standard,
            property data and a qualified engineer’s review.
          </p>
        </aside>
      </section>

      <footer
        id="about"
        className="site-footer-v6"
      >
        <div className="footer-v6-top">
          <div className="footer-v6-brand">
            <Brand />

            <p>
              A chemical engineering workspace
              for transparent calculations,
              engineering checks and structured
              problem solving.
            </p>

            <div className="footer-v6-status">
              <span>
                <b aria-hidden="true" />
                Release verified
              </span>

              <span>
                {liveCalculatorCount} live tools
              </span>
            </div>
          </div>

          <div className="footer-v6-links">
            <nav
              aria-label="Toolkit footer navigation"
            >
              <strong>
                Toolkit
              </strong>

              <a href="#calculators">
                Calculators
              </a>

              <a href="#categories">
                Disciplines
              </a>

              <a href="#your-toolkit">
                Your Toolkit
              </a>

              <a href="#workbench">
                Workbench
              </a>
            </nav>

            <nav
              aria-label="Engineering footer navigation"
            >
              <strong>
                Engineering
              </strong>

              <a href="#method">
                Method
              </a>

              <a href="#references">
                References
              </a>

              <a
                href="#problem-solver"
                onClick={(event) => {
                  event.preventDefault()
                  openProblemSolver()
                }}
              >
                Problem Solver
              </a>
            </nav>

            <nav
              aria-label="Page footer navigation"
            >
              <strong>
                Page
              </strong>

              <a href="#top">
                Back to top
              </a>

              <a href="#about">
                About
              </a>
            </nav>
          </div>
        </div>

        <div className="footer-v6-bottom">
          <p>
            Chemical Engineering Toolkit
          </p>

          <div>
            <span>
              {calculators.length} calculators
            </span>

            <span>
              {liveCalculatorCount} live engines
            </span>

            <span>
              {categories.length} disciplines
            </span>
          </div>

          <p>
            Educational and preliminary
            engineering use.
          </p>
        </div>
      </footer>

      <FeedbackPanel
        calculatorTitle={activeCalculator.title}
        calculatorCategory={activeCalculator.category}
      />
    </main>
  )
}

export default App
