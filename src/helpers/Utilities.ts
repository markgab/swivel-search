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