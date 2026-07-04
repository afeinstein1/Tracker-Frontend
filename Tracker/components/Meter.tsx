import { Meter as AriaMeter, type MeterProps as AriaMeterProps } from 'react-aria-components/Meter';
import {Label} from '@/components/form';
import '@/css/Meter.css';

export interface MeterProps extends AriaMeterProps {
  label?: string
  value: number
  maxValue: number
}

export function Meter({ label, value, maxValue, ...props }: MeterProps) {
  return (
    <AriaMeter value={value} maxValue={maxValue} {...props}>
      {({ percentage }) => (
        <>
          <Label>{label}</Label>
          <span className="value">{value}%</span>
          <div className="track inset">
            <div
              className="fill"
              style={{
                width: percentage + '%',
                backgroundSize: `${percentage > 0 ? 10000 / percentage : 100}% 100%`
              }} />
          </div>
        </>
      )}
    </AriaMeter>
  )
}