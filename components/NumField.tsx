import React from 'react';

/** Number input kept as text so it can be emptied; clicking it selects everything so typing replaces the old value. */
export const NumField: React.FC<{
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}> = ({ id, value, onChange, className, placeholder = '0' }) => (
  <input
    id={id}
    type="text"
    inputMode="decimal"
    autoComplete="off"
    placeholder={placeholder}
    value={value}
    onFocus={(e) => e.target.select()}
    onChange={(e) => {
      const v = e.target.value.replace(/,/g, '');
      if (v === '' || /^\d*\.?\d*$/.test(v)) onChange(v);
    }}
    className={className}
  />
);

export const toNum = (s: string) => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

export const ClearButton: React.FC<{ onClick: () => void; disabled?: boolean }> = ({ onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-amber-500 hover:text-amber-300 disabled:opacity-40 disabled:hover:border-gray-700 disabled:hover:text-slate-300"
  >
    ล้างค่า
  </button>
);
