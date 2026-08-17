/* eslint-disable react-refresh/only-export-components */
export {
  ActionBar,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../../mass-transfer/shared/NativeCalculatorPrimitives'
/* eslint-enable react-refresh/only-export-components */

interface CalculatorHeaderProps {
  code: string
  icon: string
  title: string
  subtitle: string
}

export function CalculatorHeader({
  code,
  icon,
  title,
  subtitle,
}: CalculatorHeaderProps) {
  return (
    <header className="native-calculator-header">
      <div className="native-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <p>Engineering Fundamentals · {code}</p>
        <h2>{title}</h2>
        <span>{subtitle}</span>
      </div>
    </header>
  )
}
