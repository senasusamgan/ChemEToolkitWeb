import {
  Component,
  type ReactNode,
} from 'react'

interface EngineeringErrorBoundaryProps {
  area: string
  children: ReactNode
}

interface EngineeringErrorBoundaryState {
  hasError: boolean
}

export class EngineeringErrorBoundary extends Component<
  EngineeringErrorBoundaryProps,
  EngineeringErrorBoundaryState
> {
  state: EngineeringErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): EngineeringErrorBoundaryState {
    return {
      hasError: true,
    }
  }

  private retry = () => {
    this.setState({
      hasError: false,
    })
  }

  private reload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <section
        className="engineering-error-boundary"
        role="alert"
        aria-live="assertive"
      >
        <span className="engineering-error-boundary-kicker">
          Recovery mode
        </span>

        <strong>
          {this.props.area} could not be displayed.
        </strong>

        <p>
          Your saved calculations and personal toolkit data
          remain stored locally.
        </p>

        <div className="engineering-error-boundary-actions">
          <button
            type="button"
            onClick={this.retry}
          >
            Try again
          </button>

          <button
            type="button"
            onClick={this.reload}
          >
            Reload page
          </button>
        </div>
      </section>
    )
  }
}
