import * as Model from '../model/AdvancedSearchModel';

export default class Validation {

    public static validateSearchConfig(strConfig: string): string {

        var o: any;
        var sample: Model.IAdvancedSearchConfig = require('../model/SampleSearchConfig');

        try {
            o = JSON.parse(strConfig);
        }
        catch (ex) {
            return 'Invalid JSON Syntax';
        }

        if (Validation.is<Model.IAdvancedSearchConfig>(o, sample, false)) {
            return '';
        } else {
            return 'Fails To Implement IAdvancedSearchOptions, see console for details';
        }
    }

    public static validateResultsConfig(strConfig: string): string {
        
        var o: any;
        var sample: Model.IResultsConfig = require('../model/SampleResultsConfig');

        try {
            o = JSON.parse(strConfig);
        }
        catch (ex) {
            return 'Invalid JSON Syntax';
        }

        if (Validation.is<Model.IResultsConfig>(o, sample, false)) {
            return '';
        } else {
            return 'Fails To Implement IResultsConfig, see console for details';
        }
    }
    

    /**
     * Checks if given object implements interface by comparing it 
     * to a sampe object that is valid
     * @param o object to check
     * @param sample object that correctly implements interface
     * @param strict returns false if extra properties are found
     * @param recursive checks chilc objects
     */
    public static is<T>(o: any, sample: T, strict = true, recursive = true): o is T {
        if (o == null) return false;
        let s = sample as any;
        // If we have primitives we check that they are of the same type and that type is not object 
        if (typeof s === typeof o && typeof o != "object") return true;

        //If we have an array, then each of the items in the o array must be of the same type as the item in the sample array
        if (o instanceof Array) {
            // If the sample was not an arry then we return false;
            if (!(s instanceof Array)) return false;
            let oneSample = s[0];
            let e: any;
            for (e of o) {
                if (!this.is(e, oneSample, strict, recursive)) return false;
            }
        } else {
            // We check if all the properties of sample are present on o
            for (let key of Object.getOwnPropertyNames(sample)) {
                if (typeof o[key] !== typeof s[key]) {
                    console.log('Object missing property: ' + key, o);
                    return false;
                }
                if (recursive && typeof s[key] == "object" && !this.is(o[key], s[key], strict, recursive)) {
                    return false;
                }
            }
            // We check that o does not have any extra prperties to sample
            if (strict) {
                for (let key of Object.getOwnPropertyNames(o)) {
                    if (s[key] == null) return false;
                }
            }
        }

        return true;
    }

    public static verifyOptionalProperties(options: Model.IAdvancedSearchConfig): boolean {
        options.properties.forEach((prop: Model.ISearchProperty) => {
        });

        return true;
    }

}