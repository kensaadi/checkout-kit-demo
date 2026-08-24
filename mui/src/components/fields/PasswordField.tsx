import { TextField, type TextFieldProps } from '@dashforge/ui';
import type { FieldPath, FieldValues } from 'react-hook-form';

/**
 * Password input preset for DashForge's `<TextField>`.
 *
 * Defaults `autoComplete` to `current-password` (the login pattern).
 * Pass `autoComplete="new-password"` when used in a registration
 * form so the browser password manager suggests a NEW credential
 * instead of filling with an existing one.
 */
interface PasswordFieldProps<T extends FieldValues>
  extends Omit<TextFieldProps, 'name' | 'type'> {
  name: FieldPath<T>;
}

export function PasswordField<T extends FieldValues>({
  name,
  label = 'Password',
  placeholder = 'Enter your password',
  layout = 'stacked',
  autoComplete = 'current-password',
  ...rest
}: PasswordFieldProps<T>) {
  return (
    <TextField
      {...rest}
      name={name}
      type="password"
      label={label}
      placeholder={placeholder}
      layout={layout}
      fullWidth
      autoComplete={autoComplete}
    />
  );
}
