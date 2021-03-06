import * as Model from '../model/AdvancedSearchModel';
import DateRange, { IDateRangeValue, DateRangeOperator } from '../components/DateRange';
import { INumberRangeValue, NumberRangeOperator } from '../components/NumberRange';
import { IPersonaProps } from 'office-ui-fabric-react/lib/Persona';
import { IDropdownResettableOption } from '../components/DropdownResettable';

export default class SearchQueryBuilder {
    constructor () {

    }

    
    public static getSearchQueryString_SQLSyntax(fields: Array<Model.ISearchProperty>): string {

        if(!fields){
            return '';
        }

        var searchString = '';
        var strAndOperator = ' AND ';
        var strOrOperator = ' OR ';
        var timetail = ' 23:59:59';

        // Freetext
        /*
        if (!ctrlFreeText.isEmpty()) {
            searchString += "FREETEXT(DEFAULTPROPERTIES, '" + ctrlFreeText.val() + "')";
            
            if (jRdoKeywordBool.prop('checked')) {
                searchString += strAndOperator;
            }
            else {
                searchString += strOrOperator;
            }
        }
        */
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var prop = field.property;
            var oper = field.operator || '';
            var type = field.type;

            if (!field.value) {
                continue;
            } else if((<IDateRangeValue>field.value).operator) {
                let rangeVal: IDateRangeValue = <IDateRangeValue>field.value;
                if(!rangeVal.date || (rangeVal.operator == DateRangeOperator.Between && !rangeVal.dateEnd)){
                    continue;
                }
            }

            switch (oper.toLowerCase()) {
                case Model.SearchOperator.Freetext:
                    searchString += "FREETEXT(DEFAULTPROPERTIES, '" + field.value + "')";
                    break;
                case Model.SearchOperator.Equals:

                    if(type === Model.PropertyValueType.String || type === Model.PropertyValueType.DateTime){
                        searchString += prop + "='" + field.value + "'";
                        //author="John Smith"
                    }
                    else {
                        searchString += prop + "=" + field.value;
                        //IsDocument=true
                    }
                    break;
                case Model.SearchOperator.Contains:
                    searchString += prop + " LIKE '%" + field.value + "%'";
                    //author LIKE '%Smith%'
                    break;
                case Model.SearchOperator.Between:
                    //LastModifiedTime>='06/28/2011' AND LastModifiedTime<='06/30/2012'
                    searchString += prop + ">='" + this._convertToSPSQLSearchDateFormat((<string>field.value).split(',')[0]) + "'" + strAndOperator + prop + "&amp;lt;='" + this._convertToSPSQLSearchDateFormat((<string>field.value).split(',')[1]) + timetail + "'";
                    break;
                default:
                    console.log('Unknow Operator: ', oper, ', on field: ', field);
                    break;
            }

            searchString += strAndOperator;
        }
        
        if (this._endsWith(searchString, strAndOperator)) {
            searchString = searchString.substring(0, searchString.length - strAndOperator.length);
        }

        if (this._endsWith(searchString, strOrOperator)) {
            searchString = searchString.substring(0, searchString.length - strOrOperator.length);
        }

        return searchString;
    }

    public static BuildSearchQueryString_Keyword(keywordSearch: string, searchModel: Array<Model.ISearchProperty>, additionalCriteria: string): string {
        var searchString = '';
        var strAndOperator = ' AND ';
        var properties = searchModel;
        var criteria: Array<string> = [];

        if(keywordSearch) {
            criteria.push(keywordSearch);
        }

        for (var i = 0; i < properties.length; i++) {
            var field: Model.ISearchProperty = properties[i];
            var prop: string = field.property;
            var value: string | number | IDateRangeValue | INumberRangeValue | Array<IPersonaProps> | IDropdownResettableOption = field.value;

            var oper: Model.SearchOperator; // = field.value['operator'] || field.operator;
            var dateVal: IDateRangeValue = <IDateRangeValue> field.value;
            var numbVal: INumberRangeValue = <any> field.value;
            var perVal: Array<IPersonaProps> = <any> field.value;
            var choiceVal: IDropdownResettableOption = <any> field.value;
/*             

            if(!value || 
              (typeof value === 'object' && 
              (!value['value'] || 
               dateVal === DateRange.emptyValue))) {
                continue;
            } */
/* 
            if(perVal.length === 0) {
                continue;
            }

            if(field.type === Model.PropertyValueType.DateTime) {
                if(!dateVal.date || (dateVal.operator === DateRangeOperator.Between && !dateVal.dateEnd)){
                    // skip if range value is invalid
                    continue;
                }
            } else if(field.type === Model.PropertyValueType.Numeric) {
                if(!numbVal.number || (numbVal.operator === NumberRangeOperator.Between && !numbVal.numberEnd)) {
                    // skip if range value is invalid
                    continue;
                }
            } */

            switch(field.type) {
                case Model.PropertyValueType.Person:
                    if(!perVal || perVal.length === 0) {
                        continue;
                    }
                    oper = field.operator;
                    break;
                case Model.PropertyValueType.DateTime:
                    if(!dateVal || !dateVal.date || (dateVal.operator === DateRangeOperator.Between && !dateVal.dateEnd)){
                        // skip if range value is invalid
                        continue;
                    }
                    oper = dateVal.operator as any;
                    break;
                case Model.PropertyValueType.Numeric:
                    if((field.operator === Model.SearchOperator.Equals)) {
                        if(!value) {
                            // skip if value is invalid
                            continue;
                        }
                        oper = field.operator;
                    } else if(field.operator === Model.SearchOperator.NumberRange) { 
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
                case Model.SearchOperator.Equals:
                    if(field.type === Model.PropertyValueType.Numeric) {
                        criteria.push(prop + '=' + (numbVal.number || value));
                    } else if(field.type === Model.PropertyValueType.Person) {
                        let name = perVal[0].text;
                        criteria.push(prop + ':"*' + name + '*"');
                    } else if(field.type === Model.PropertyValueType.DateTime) {
                        criteria.push(prop + '=' + dateVal.date.toISOString());
                    } else {
                        if(typeof value !== 'string') {
                            value = choiceVal.value || choiceVal.text;
                        }
                        criteria.push(prop + ':"' + value + '"');
                    }
                    //searchString += prop + ':"' + value + '"';
                    //author: "John Smith"
                    break;
                case Model.SearchOperator.Contains:
                    if(typeof value !== 'string') {
                        value = choiceVal.value || choiceVal.text;
                    }
                    criteria.push(prop + ':"*' + value + '*"');
                    //searchString += prop + ':"*' + value + '*"';
                    //author: "*Smith*"
                    break;
                case Model.SearchOperator.Between:
                    if(field.type === Model.PropertyValueType.DateTime) {
                        //LastModifiedTime:2017-06-30T04:00:00.000Z..2018-06-30T04:00:00.000Z
                        //add a tday to endDate to include selected date in results 
                        //let startDate = (value as string).split(';')[0];
                        //let endDate = this._addDays(new Date((value as string).split(';')[1]), 1).toISOString();
                        criteria.push(prop + ':' + dateVal.date.toISOString() + '..' + dateVal.dateEnd.toISOString());
                        //searchString += prop + ':' + startDate + '..' + endDate;
                    } else {
                        criteria.push(prop + '>=' + numbVal.number);
                        criteria.push(prop + '<=' + numbVal.numberEnd);
                    }
                    break;
                case Model.SearchOperator.LessThanEqual:
                    criteria.push(prop + '<=' + numbVal.number);
                    break;
                case Model.SearchOperator.Before:
                    //LastModifiedTime<=2018-06-30T04:00:00.000Z
                    //add day to include selected date in results
                    criteria.push(prop + '<=' + this._addDays(dateVal.date, 1).toISOString());
                    //searchString += prop + '<=' + this._addDays(new Date(value as string), 1).toISOString();
                    break;
                case Model.SearchOperator.GreaterThanEqual:
                case Model.SearchOperator.After:
                    //LastModifiedTime>=2018-06-30T04:00:00.000Z
                    //searchString += prop + '>=' + value;
                    let val = numbVal.number || dateVal.date.toISOString();
                    criteria.push(prop + '>=' + val);
                    break;
                case Model.SearchOperator.GreatherThan:
                    criteria.push(prop + '>' + numbVal.number);
                    break;
                case Model.SearchOperator.LessThan:
                    criteria.push(prop + '<' + numbVal.number);
                    break;
                default:
                    console.log('Unexpected Operator: ', oper);
                    break;

            }

        }

        if(additionalCriteria && criteria.length) {
            criteria.unshift(additionalCriteria);
        }
        
        searchString = criteria.join(strAndOperator);

        console.log(searchString);

        return searchString;
    }

    private static _convertToSPSQLSearchDateFormat(strDate): string {
        var arr = strDate.split('/');
        return arr[2] + '/' + arr[0] + '/' + arr[1];
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
    private static _endsWith(str, suffix): boolean {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    /**
     * function increases given date by number of days
     * @param date Date object to adjust
     * @param days number of days to add
     */
    private static _addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

/*     private trimX (str, x): void {
        var rs = new RegExp('^' + x + '+|' + x + '+$', 'g');
        return str.replace(rs, '');
    }

    private trimEnd(str, suffix): void {
        var rs = new RegExp(str + '+$', 'g');
        return str.replace(rs, '');
    }
 */


}