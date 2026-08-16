/**
 * CategoryGrid
 * Compact engineering discipline navigation
 */

interface CategoryGridProps {
  categories: Array<{ name: string; icon: string; live: number }>
  onOpenCategory: (categoryName: string) => void
}

export function CategoryGrid({ categories, onOpenCategory }: CategoryGridProps) {
  return (
    <div className="home-category-grid">
      {categories.map((category) => (
        <button
          key={category.name}
          type="button"
          className="home-category-card"
          onClick={() => onOpenCategory(category.name)}
        >
          <span className="home-category-icon" aria-hidden="true">
            {category.icon}
          </span>
          <div className="home-category-info">
            <strong>{category.name}</strong>
            <span>
              {category.live} calculator{category.live === 1 ? '' : 's'}
            </span>
          </div>
          <span className="home-category-arrow" aria-hidden="true">
            ↗
          </span>
        </button>
      ))}
    </div>
  )
}
