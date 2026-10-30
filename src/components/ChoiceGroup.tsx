import { useId } from 'react';
import type { ChoiceOption } from '../content/types';
import { CheckIcon, InfoIcon } from './Icons';

interface ChoiceGroupProps {
  legend: string;
  options: ChoiceOption[];
  value: string | null;
  onChange: (id: string) => void;
  disabled?: boolean;
}

/** Compact native radio group styled as option buttons (arrow keys work as usual). */
export function ChoiceGroup({ legend, options, value, onChange, disabled }: ChoiceGroupProps) {
  const name = useId();
  return (
    <fieldset className="option-group" disabled={disabled}>
      <legend className="option-legend">{legend}</legend>
      {options.map((o) => (
        <label key={o.id} className={`option${value === o.id ? ' is-selected' : ''}`}>
          <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} />
          <span>{o.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

/** Feedback text; the icon and wording carry the meaning, colour only supports it. */
export function Feedback({ positive, children }: { positive: boolean; children: string }) {
  return (
    <div className={`feedback ${positive ? 'is-correct' : 'is-incorrect'}`}>
      <span className="feedback-icon" aria-hidden="true">
        {positive ? <CheckIcon /> : <InfoIcon />}
      </span>
      <p>{children}</p>
    </div>
  );
}
