import * as React from 'react';
import {
    Dropdown, 
    IDropdown, 
    DropdownMenuItemType, 
    IDropdownOption 
} from 'office-ui-fabric-react/lib/Dropdown';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { Label } from 'office-ui-fabric-react/lib/Label';
import styles from './NumberRange.module.scss';
import * as strings from 'SwivelSearchWebPartStrings';

export interface INumberRangeProps {
    value?: INumberRangeValue;
    label?: string;
    onChanged?: Function;
}

export interface INumberRangeState {
    value: INumberRangeValue;
    classNameNumberEnd: string;
}


export interface INumberRangeOperatorDetails {
    operator: NumberRangeOperator;
    name: string;
    symbol: string;
    placeholder1: string;
    placeholder2?: string;
}

export enum NumberRangeOperator {
    Equals = "Equals",
    GreaterThan = "GreaterThan",
    GreaterThanEqual = "GreaterThanEqual",
    LessThan = "LessThan",
    LessThanEqual = "LessThanEqual",
    Between = "Between"
} 


export interface INumberRangeOperatorMeta {
    Equals: INumberRangeOperatorDetails;
    GreaterThan: INumberRangeOperatorDetails;
    GreaterThanEqual: INumberRangeOperatorDetails;
    LessThan: INumberRangeOperatorDetails;
    LessThanEqual: INumberRangeOperatorDetails;
    Between: INumberRangeOperatorDetails;
}

/**
 * All Possible Selectable Number Range operators
 */
export class NumberRangeOperatorMeta2 {

    public static Equals: INumberRangeOperatorDetails = {
        operator: NumberRangeOperator.Equals,
        name: strings.EqualsName,
        symbol: strings.EqualsName,
        placeholder1: strings.EqualsPlaceholder1
    };
    
    public static GreaterThan: INumberRangeOperatorDetails = {
        operator: NumberRangeOperator.GreaterThan,
        name: strings.GreaterThanName,
        symbol: '>',
        placeholder1: strings.GreaterThanEqualsPlaceholder1
    };

    public static GreaterThanEqual: INumberRangeOperatorDetails = {
        operator: NumberRangeOperator.GreaterThanEqual,
        name: strings.GreaterThanEqualsName,
        symbol: '>=',
        placeholder1: strings.GreaterThanEqualsPlaceholder1
    };

    public static LessThan: INumberRangeOperatorDetails = {
        operator: NumberRangeOperator.LessThan,
        name: strings.LessThanName,
        symbol: '<',
        placeholder1: strings.LessThanPlaceholder1
    };

    public static LessThanEqual: INumberRangeOperatorDetails = {
        operator: NumberRangeOperator.LessThanEqual,
        name: strings.LessThanEqualsName,
        symbol: '<=',
        placeholder1: strings.LessThanEqualsPlaceholder1
    };

    public static Between: INumberRangeOperatorDetails = {
        operator: NumberRangeOperator.Between,
        name: strings.BetweenName,
        symbol: strings.BetweenSymbol,
        placeholder1: strings.BetweenNumericPlaceholder1,
        placeholder2: strings.BetweenNumericPlaceholder2
    };

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

export interface INumberRangeValue {
    operator: NumberRangeOperator;
    number: number;
    numberEnd?: number;
}

export default class NumberRange extends React.Component<INumberRangeProps, INumberRangeState> {
    constructor(props: INumberRangeProps) {
        super(props);
/* 
        if(!props.value) {                                                  // If initial value is not set
            props.value = { ...this.emptyValue() };                    // Default to empty date range value
        } */

        let value = props.value || NumberRange.emptyValue;

        let classNameNumberEnd = value.operator === NumberRangeOperator.Between ? '' : styles.numberEndHidden;

        this.state = {
            classNameNumberEnd,
            value
        } as INumberRangeState;

        this._populateOptions();
    }

    public state: INumberRangeState;
    private _textFieldNumberEnd: ITextField;

    public static get emptyValue(): INumberRangeValue {
        return {
            operator: NumberRangeOperator.Equals,
            number: null,
            numberEnd: null
        };
    }
    
    private _options: Array<IDropdownOption> = [];

    public render(): React.ReactElement<INumberRangeProps> {
        return (
            <div className={styles.numberRange}>
                <Label>{this.props.label}</Label>
                <div className={styles.pickerRow}>
                    
                    <Dropdown
                        options={this._options} 
                        className={styles.numberOperator}
                        onChanged={(e) => this.onOperator_changed(e)}
                        selectedKey={this.state.value.operator}
                    />

                    <TextField
                        value={this.state.value.number || '' as any}
                        onChange={this.onNumber1_changed}
                        onBlur={this.onNumber1_blur}
                        placeholder={NumberRangeOperatorMeta[this.state.value.operator].placeholder1}
                        autoComplete={"off"}
                        type={"number"}
                    />

                    <TextField
                        value={this.state.value.numberEnd || '' as any}
                        onChange={this.onNumber2_changed} 
                        placeholder={NumberRangeOperatorMeta[this.state.value.operator].placeholder2}
                        autoComplete={"off"}
                        className={this.state.classNameNumberEnd}
                        componentRef={(component: ITextField):void => {
                            this._textFieldNumberEnd = component;
                        }}
                        validateOnFocusIn={true}
                        type={"number"}
                        onGetErrorMessage={v => this.onGetErrorMessage(v)}
                    />

                </div>
            </div>
        );
    }

    /**
     * Life cycle event handler
     * @param nextProps new incoming props
     */
    public componentWillReceiveProps(nextProps: INumberRangeProps): void {

        let val = nextProps.value || NumberRange.emptyValue;

        this.setState({                                                     // Update state with new properites
            ...this.state,
            value: {
                operator: val.operator,
                number: val.number !== null ? val.number : '',              // TextFields disregards null values as a change event
                numberEnd: val.numberEnd !== null ? val.numberEnd : ''      // So empty strings are provided to  reset the field to empty
            }
        } as INumberRangeState,
        () => this.onOperator_changed(val.operator));          // Call operator change handler in case new operator was provided
    }

    protected onNumber1_changed = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue: string): void => {
        console.log(newValue);

        this.setState({
            ...this.state,
            value: {
                ...this.state.value,
                number: newValue ? parseInt(newValue) : null
            } as INumberRangeValue
        },
        () => {
            this._changed(); 
        });
    }

    protected onNumber1_blur = (event: React.FocusEvent<HTMLInputElement>): void => {
        let { operator } = this.state.value;
        if(operator === NumberRangeOperator.Between) {
            this._textFieldNumberEnd.focus();
        }
    }

    protected onNumber2_changed = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue: string): void => {

        this.setState({
            ...this.state,
            value: {
                ...this.state.value,
                numberEnd: newValue ? parseInt(newValue) : null
            } as INumberRangeValue
        },
        () => this._changed());

    }

    protected onGetErrorMessage (numberEnd: string): string {
        let  {number, operator } = this.state.value;
        if(operator === NumberRangeOperator.Between) {
            if(number !== null && numberEnd === null || numberEnd == '') {
                return 'Required field';
            }
            if(parseInt(numberEnd) < this.state.value.number) {
                return 'Must be greater than lower bounds';
            }
        }
        return '';
    }

    protected onOperator_changed (optionOrValue: NumberRangeOperator): void;
    protected onOperator_changed (optionOrValue: IDropdownOption): void;
    protected onOperator_changed (optionOrValue: IDropdownOption | NumberRangeOperator): void {

        let operator: NumberRangeOperator;

        if((optionOrValue as IDropdownOption).data) {
            operator = (optionOrValue as IDropdownOption).data.value;
        } else {
            operator = optionOrValue as NumberRangeOperator;
        }

        let classNameNumberEnd = operator === NumberRangeOperator.Between ? '' : styles.numberEndHidden;
        this.setState({
            ...this.state,
            classNameNumberEnd,
            value: {
                ...this.state.value,
                operator,
            } as INumberRangeValue
        } as INumberRangeState,
        () => this._changed());

    }

    /**
     * Generator options for the number range operator dropdown menu
     */
    protected _populateOptions(): void {
        let value = this.props.value || NumberRange.emptyValue;
        for (let opName in NumberRangeOperator) {                               // Loop through DateRangeOperator values
            let op = NumberRangeOperator[opName];
            this._options.push({                                            // Create a new option for each operator
                text: NumberRangeOperatorMeta[op].symbol,
                key: op,
                data: {
                    value: op
                },
                selected: (op === value.operator) ? true : undefined       // Mark the correct one as selected
            } as IDropdownOption);
        }
    }


    /**
     * On change, return current date range value to parent component
     */
    protected _changed() {
        let value = this.state.value;
        if(this.props.onChanged) {                                          // If change handler is provided in the properties
            this.props.onChanged(value);                                    // Pass new date range value to the change handler
        }
    }
}