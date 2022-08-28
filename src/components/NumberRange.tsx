import * as React from 'react';
import {
    Dropdown, 
    IDropdownOption 
} from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Label } from 'office-ui-fabric-react/lib/Label';
import styles from './NumberRange.module.scss';
import * as strings from 'SwivelSearchWebPartStrings';
import { first } from '../helpers/Utilities';

export interface INumberRangeOperatorMeta {
    Equals: INumberRangeOperatorDetails;
    GreaterThan: INumberRangeOperatorDetails;
    GreaterThanEqual: INumberRangeOperatorDetails;
    LessThan: INumberRangeOperatorDetails;
    LessThanEqual: INumberRangeOperatorDetails;
    Between: INumberRangeOperatorDetails;
}

export enum NumberRangeOperator {
    Equals = "Equals",
    GreaterThan = "GreaterThan",
    GreaterThanEqual = "GreaterThanEqual",
    LessThan = "LessThan",
    LessThanEqual = "LessThanEqual",
    Between = "Between"
} 

export interface INumberRangeValue {
    operator: NumberRangeOperator;
    number: number;
    numberEnd?: number;
}

export interface INumberRangeProps {
    value?: INumberRangeValue;
    label?: string;
    onChanged?: (val: any) => void;
}

export interface INumberRangeOperatorDetails {
    operator: NumberRangeOperator;
    name: string;
    symbol: string;
    placeholder1: string;
    placeholder2?: string;
}

export interface INumberRangeOperatorMeta {
    Equals: INumberRangeOperatorDetails;
    GreaterThan: INumberRangeOperatorDetails;
    GreaterThanEqual: INumberRangeOperatorDetails;
    LessThan: INumberRangeOperatorDetails;
    LessThanEqual: INumberRangeOperatorDetails;
    Between: INumberRangeOperatorDetails;
}

export const NumberRangeOperatorMeta: INumberRangeOperatorMeta = {
    Equals: {
        operator: NumberRangeOperator.Equals,
        name: strings.EqualsName,
        symbol: strings.EqualsName,
        placeholder1: strings.EqualsPlaceholder1
    },
    GreaterThan: {
        operator: NumberRangeOperator.GreaterThan,
        name: strings.GreaterThanName,
        symbol: '>',
        placeholder1: strings.GreaterThanEqualsPlaceholder1
    },
    GreaterThanEqual: {
        operator: NumberRangeOperator.GreaterThanEqual,
        name: strings.GreaterThanEqualsName,
        symbol: '>=',
        placeholder1: strings.GreaterThanEqualsPlaceholder1
    },
    LessThan: {
        operator: NumberRangeOperator.LessThan,
        name: strings.LessThanName,
        symbol: '<',
        placeholder1: strings.LessThanPlaceholder1
    },
    LessThanEqual: {
        operator: NumberRangeOperator.LessThanEqual,
        name: strings.LessThanEqualsName,
        symbol: '<=',
        placeholder1: strings.LessThanEqualsPlaceholder1
    },
    Between: {
        operator: NumberRangeOperator.Between,
        name: strings.BetweenName,
        symbol: strings.BetweenSymbol,
        placeholder1: strings.BetweenNumericPlaceholder1,
        placeholder2: strings.BetweenNumericPlaceholder2
    }
};

export default function NumberRange(props: INumberRangeProps): JSX.Element {
    const options = populateOptions(props);
    const refOperator = React.useRef(null);
    const refNumber = React.useRef(null);
    const refNumberEnd = React.useRef(null);
    const [showEndNumber, setShowEndNumber] = React.useState(false);

    function changed(overrideField = "", overrideFieldValue: string | number = "") {

        const operator = getOperator();
        const number = getNumber();
        const numberEnd = getNumberEnd();
        const value = {
            operator,
            number,
            numberEnd,
        } as INumberRangeValue;

        if(overrideField) {
            value[overrideField] = overrideFieldValue;
        }

        setShowEndNumber(value.operator == NumberRangeOperator.Between);

        props.onChanged(value);

    }

    function onNumber1_blur(event: React.FocusEvent<HTMLInputElement>) {
        const operator = getOperator();
        if(operator === NumberRangeOperator.Between) {
            refNumberEnd.current.focus();
        }
    }
    
    function onGetErrorMessage(numberEnd: string): string {
        const operator = getOperator();
        const number = getNumber();
        if(operator === NumberRangeOperator.Between) {
            if(number !== null && numberEnd === null || numberEnd == '') {
                return 'Required field';
            }
            if(Number(numberEnd) < number) {
                return 'Must be greater than lower bounds';
            }
        }
        return '';
    }

    function getOperator(): NumberRangeOperator {
        const options: IDropdownOption[] = refOperator.current?.selectedOptions || [];
        return first(options)?.key as NumberRangeOperator || null;
    }

    function getNumber(): number {
        const str = refNumber.current?.value || null;
        if(str) {
            return Number(str);
        }
        return null;
    }

    function getNumberEnd(): number {
        if(getOperator() !== NumberRangeOperator.Between) {
            return null;
        }
        const str = refNumberEnd.current?.value || null;
        if(str) {
            return Number(str);
        }
        return null;
    }
    
    function numberPlaceholder(isEndNumber = false) {

        const phProp = isEndNumber ? 'placeholder2' : 'placeholder1';
        const operator = props.value.operator;
        if(operator) {
            return NumberRangeOperatorMeta[operator][phProp];
        }

        return '';
        
    }

    return(
        <div className={styles.numberRange}>
            <Label>{props.label}</Label>
            <div className={styles.pickerRow}>
                
                <Dropdown
                    componentRef={refOperator}
                    options={options} 
                    className={styles.numberOperator}
                    onChanged={o => changed('operator', o.key)}
                    selectedKey={props.value.operator}
                />

                <TextField
                    componentRef={refNumber}
                    value={props.value.number || '' as any}
                    onChange={(e, val) => changed('number', val)}
                    onBlur={onNumber1_blur}
                    placeholder={numberPlaceholder()}
                    autoComplete={"off"}
                    type={"number"}
                />

                {
                    showEndNumber &&
                    <TextField
                        componentRef={refNumberEnd}
                        value={props.value.numberEnd || '' as any}
                        onChange={(e, val) => changed('numberEnd', val)} 
                        placeholder={numberPlaceholder(true)}
                        autoComplete={"off"}
                        validateOnFocusIn={true}
                        type={"number"}
                        onGetErrorMessage={onGetErrorMessage}
                    />
                }

            </div>
        </div>
    );
}

NumberRange.defaultProps = {
    value: emptyValue(),
};

export function emptyValue(): INumberRangeValue {
    return {
        operator: NumberRangeOperator.Equals,
        number: null,
        numberEnd: null
    };
}

/**
 * Generator options for the number range operator dropdown menu
 */
function populateOptions(props: INumberRangeProps): IDropdownOption[] {
    const value = props.value || emptyValue();
    const options = []
    for (const opName in NumberRangeOperator) {                             // Loop through DateRangeOperator values
        const op = NumberRangeOperator[opName];
        options.push({                                                      // Create a new option for each operator
            text: NumberRangeOperatorMeta[op].symbol,
            key: op,
            data: {
                value: op
            },
            selected: (op === value.operator) ? true : undefined            // Mark the correct one as selected
        } as IDropdownOption);
    }

    return options;
}