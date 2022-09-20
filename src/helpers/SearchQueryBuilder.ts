import {
    ISearchProperty,
    SearchOperator,
    PropertyValueType,
} from '../model/AdvancedSearchModel';

import DateRange, { IDateRangeValue, DateRangeOperator } from '../components/DateRange';
import { INumberRangeValue, NumberRangeOperator } from '../components/NumberRange';
import { IPersonaProps } from 'office-ui-fabric-react/lib/Persona';
import { IDropdownResettableOption } from '../components/DropdownResettable';

export default class SearchQueryBuilder {

    public static BuildSearchQueryString_Keyword(keywordSearch: string, searchModel: ISearchProperty[], controlValues: { [key: string]: any }, additionalCriteria: string): string {
        let searchString = '';
        const strAndOperator = ' AND ';
        const properties = searchModel;
        const criteria: Array<string> = [];

        if(keywordSearch) {
            criteria.push(keywordSearch);
        }

        for (let i = 0; i < properties.length; i++) {
            const field: ISearchProperty = properties[i];
            const prop: string = field.property;
            //let value: string | number | IDateRangeValue | INumberRangeValue | IPersonaProps[] | IDropdownResettableOption = field.value;
            let value = controlValues[field.property];

            let oper: SearchOperator; // = field.value['operator'] || field.operator;
            const dateVal: IDateRangeValue = <IDateRangeValue> value;
            const numbVal: INumberRangeValue = <any> value;
            const perVal: Array<IPersonaProps> = <any> value;
            const choiceVal: IDropdownResettableOption = <any> value;

            switch(field.type) {
                case PropertyValueType.Person:
                    if(!perVal || perVal.length === 0) {
                        continue;
                    }
                    oper = field.operator;
                    break;
                case PropertyValueType.DateTime:
                    if(!dateVal || !dateVal.date || (dateVal.operator === DateRangeOperator.Between && !dateVal.dateEnd)){
                        // skip if range value is invalid
                        continue;
                    }
                    oper = dateVal.operator as any;
                    break;
                case PropertyValueType.Numeric:
                    if((field.operator === SearchOperator.Equals)) {
                        if(!value) {
                            // skip if value is invalid
                            continue;
                        }
                        oper = field.operator;
                    } else if(field.operator === SearchOperator.NumberRange) { 
                        if(!numbVal || !numbVal.number || 
                          (numbVal.operator === NumberRangeOperator.Between && !numbVal.numberEnd)) {
                            // skip if value is invalid
                            continue;
                        }
                        oper = numbVal.operator as any;
                    }
                    break;
                default:
                    if(!value || (typeof value === 'object') && !value['value']) {
                        continue;
                    }
                    oper = field.operator;
            }
            
            switch (oper) {
                case SearchOperator.Equals:

                    switch(field.type) {
                        case PropertyValueType.Numeric:
                            criteria.push(`${prop}=${numbVal.number || value}`);
                            break;
                        case PropertyValueType.Person:
                            let name = perVal[0].text;
                            criteria.push(`${prop}:"*${name}*"`);
                            break;
                        case PropertyValueType.DateTime:
                            criteria.push(`${prop}=${dateVal.date.toISOString()}`);
                            break;
                        default:
                            if(typeof value !== 'string') {
                                value = choiceVal.value || choiceVal.text;
                            }
                            criteria.push(`${prop}:"${value}"`);
                    }
                    //author: "John Smith"

                    break;
                case SearchOperator.Contains:
                    if(typeof value !== 'string') {
                        value = choiceVal.value || choiceVal.text;
                    }
                    criteria.push(`${prop}:"*${value}*"`);
                    //author: "*Smith*"
                    break;
                case SearchOperator.Between:
                    if(field.type === PropertyValueType.DateTime) {
                        //LastModifiedTime:2017-06-30T04:00:00.000Z..2018-06-30T04:00:00.000Z
                        criteria.push(`${prop}:${dateVal.date.toISOString()}..${dateVal.dateEnd.toISOString()}`);
                    } else {
                        criteria.push(`${prop}>=${numbVal.number}`);
                        criteria.push(`${prop}<=${numbVal.numberEnd}`);
                    }
                    break;
                case SearchOperator.LessThanEqual:
                    criteria.push(`${prop}<=${numbVal.number}`);
                    break;
                case SearchOperator.Before:
                    //LastModifiedTime<=2018-06-30T04:00:00.000Z
                    //add day to include selected date in results
                    criteria.push(`${prop}<=${this._addDays(dateVal.date, 1).toISOString()}`);
                    break;
                case SearchOperator.GreaterThanEqual:
                case SearchOperator.After:
                    //LastModifiedTime>=2018-06-30T04:00:00.000Z
                    let val = numbVal.number || dateVal.date.toISOString();
                    criteria.push(`${prop}>=${val}`);
                    break;
                case SearchOperator.GreatherThan:
                    criteria.push(`${prop}>${numbVal.number}`);
                    break;
                case SearchOperator.LessThan:
                    criteria.push(`${prop}<${numbVal.number}`);
                    break;
                default:
                    console.log('Unexpected Operator: ', oper);

            }

        }

        if(additionalCriteria && criteria.length) {
            criteria.unshift(additionalCriteria);
        }
        
        searchString = criteria.join(strAndOperator);

        console.log(searchString);

        return searchString;
    }

    public static convertToKeywordQueryFormat(date: Date): string {
        return this._padToDoubleDigits(date.getMonth() + 1) + '/' +
               this._padToDoubleDigits(date.getDate()) + '/' + date.getFullYear();
    }

    private static _padToDoubleDigits(num: number): string {
        if(num < 10){
            return '0' + num.toString();
        } else {
            return num.toString();
        }
    }

    /**
     * 
     * @param str 
     * @param suffix 
     */
/*     private static _endsWith(str, suffix): boolean {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    } */

    /**
     * function increases given date by number of days
     * @param date Date object to adjust
     * @param days number of days to add
     */
    private static _addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

}