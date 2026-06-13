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
                '--fill-color': percentage < 25 ? 'var(--red)' : percentage < 50 ? 'var(--orange)' : percentage < 75 ? 'var(--yellow)' : 'var(--green)'
              } as any} />
          </div>
        </>
      )}
    </AriaMeter>
  )
}
