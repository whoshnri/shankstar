'use client';

import React from 'react';
import { FieldError } from 'react-hook-form';
import { Label } from '@/components/ui/label';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <Label htmlFor={props.id} className="text-sm font-medium text-foreground">
            {label}
          </Label>
        )}
        <input
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
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <span className="text-xs text-red-600">{error.message}</span>}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
