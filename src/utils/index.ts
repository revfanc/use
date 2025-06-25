/**
 * lodash.once
 */
export function once<T extends (...args: any[]) => any>(fn: T) {
  let called = false;
  let ret: any;
  return function (...args: any[]) {
    if (called) return ret;
    called = true;
    ret = fn(...args);
    return ret;
  };
}
