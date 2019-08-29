export const scopes = {
  Y: ['E'],
  M: ['Y', 'E'],
  W: ['Y', 'M', 'E'],
  D: ['M', 'Y', 'W', 'E'],
  h: ['D'],
  m: ['h'],
  s: ['m']
};

export function getDefault (unit) {
  if (!(unit in scopes)) {
    throw Error(`Invalid unit: ${unit}`);
  }

  return scopes[unit][0];
};

export function filter (unit, scope) {
  if (!(unit in scopes)) {
    throw Error(`Invalid unit: ${unit}`);
  }

  if (scopes[unit].indexOf(scope) === -1) {
    return getDefault(unit);
  }

  return scope;
};
