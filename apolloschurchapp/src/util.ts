
export function present(value: string | undefined | null | ''): value is string {
  if (!value) { return false }

  if (!/\S/.test(value)) {
    return false
  }
  return true
}
