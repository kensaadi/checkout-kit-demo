import { TextField, type TextFieldProps } from '@dashforge/ui';
import type { FieldPath, FieldValues } from 'react-hook-form';

/**
 * Generic text input preset for DashForge's `<TextField>`.
 *
 * Defaults to the stacked layout and fullWidth — pass `type`,
 * `label`, `placeholder`, `autoComplete` from the caller.
 *
 * Use for any free-text field that isn't email or password (those
 * have their own presets with appropriate defaults). Validation
 * lives in the form's zod schema, never on this component.
 */
interface InputFieldProps<T extends FieldValues>
  extends Omit<TextFieldProps, 'name'> {
  name: FieldPath<T>;
}

export function InputField<T extends FieldValues>({
  name,
  layout = 'stacked',
  ...rest
}: InputFieldProps<T>) {
  return (
    <TextField
      {...rest}
      name={name}
      layout={layout}
      fullWidth
    />
  );
}
