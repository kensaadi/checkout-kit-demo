import { TextField, type TextFieldProps } from '@dashforge/ui';
import type { FieldPath, FieldValues } from 'react-hook-form';

/**
 * Email input preset for DashForge's `<TextField>`.
 *
 * Pre-configures `type`, `autoComplete`, default `label` /
 * `placeholder`, and the stacked layout. Validation is NOT a prop
 * of this component — it lives in the parent form's zod schema
 * (passed to `<DashFormProvider resolver={...} />`). A resolver
 * always takes precedence over field-level `rules` in DashForm.
 *
 * Use the generic `T` to constrain `name` to a key of the form's
 * input shape — TypeScript catches a typo on the name at the call
 * site instead of at the next manual test.
 */
interface EmailFieldProps<T extends FieldValues>
  extends Omit<TextFieldProps, 'name' | 'type'> {
  name: FieldPath<T>;
}

export function EmailField<T extends FieldValues>({
  name,
  label = 'Email',
  placeholder = 'Enter your email',
  layout = 'stacked',
  ...rest
}: EmailFieldProps<T>) {
  return (
    <TextField
      {...rest}
      name={name}
      type="email"
      label={label}
      placeholder={placeholder}
      layout={layout}
      fullWidth
      autoComplete="email"
    />
  );
}
