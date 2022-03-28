export function present(value) {
  if (!value) {
    return false;
  }

  if (!/\S/.test(value)) {
    return false;
  }
  return true;
}

export function tryParseDate(dateStr) {
  try {
    return Date.parse(dateStr);
  } catch (ex) {
    return null;
  }
}
