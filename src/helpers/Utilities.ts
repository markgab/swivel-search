/**
 * Return the first element in provided array
 * @param arr 
 * @returns 
 */
export function first<T>(arr: T[]): T {
    if(!arr || !arr.length){
        return null;
    }
    return arr[0];
}

/**
 * Simple implementation of lodash.cloneDeep
 * Does not clone functions or handle recursive references.
 * @param original 
 * @returns 
 */
export function deepClone<T>(original: T): T {
    if (original instanceof RegExp) {
      return new RegExp(original) as any;
    } else if (original instanceof Date) {
      return new Date(original.getTime()) as any;
    } else if (Array.isArray(original)) {
      return original.map(deepClone) as any;
    } else if (typeof original === 'object' && original !== null) {
      const clone = {};
      Object.keys(original as any).forEach(k => {
        clone[k] = deepClone(original[k]);
      });
      return clone as any;
    }
    return original;
  }