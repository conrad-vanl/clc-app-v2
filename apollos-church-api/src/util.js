import { camelCase } from 'lodash';

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

export function camelCaseKeys(obj) {
  return Object.keys(obj).reduce((accum, curr) => {
    // eslint-disable-next-line no-param-reassign
    accum[camelCase(curr)] = obj[curr];
    return accum;
  }, {});
}
