'use client';

import React from 'react';
import { FieldError } from 'react-hook-form';
import { Label } from '@/components/ui/label';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: FieldError;
  options: { value: string; label: string }[];
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <Label htmlFor={props.id} className="text-sm font-medium text-foreground">
            {label}
          </Label>
        )}
        <select
          ref={ref}
          className={`
            px-4 py-3
            border border-border
            rounded-sm
            text-sm
            transition-all duration-300 ease-out
            focus:outline-none
            focus:border-primary
            focus:ring-1
            focus:ring-primary/20
            bg-background
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          <option value="">Select {label?.toLowerCase()}...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-red-600">{error.message}</span>}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';
