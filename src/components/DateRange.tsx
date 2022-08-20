import * as React from 'react';
import { DatePicker, IDatePicker, DayOfWeek, IDatePickerStrings, IDatePickerState } from 'office-ui-fabric-react/lib/DatePicker';
import {
    Dropdown, 
    IDropdown, 
    DropdownMenuItemType, 
    IDropdownOption,
} from 'office-ui-fabric-react/lib/Dropdown';
import { Label } from 'office-ui-fabric-react/lib/Label';
import styles from './DateRange.module.scss';
import * as strings from 'SwivelSearchWebPartStrings';
import { first } from '../helpers/Utilities';


/**
 * All Possible Selectable Date Range operators
 */
export enum DateRangeOperator {
    After = "After",
    Before = "Before",
    Between = "Between",
    On = "Equals"
}

/**
 * Composite value of date range properties
 */
export interface IDateRangeValue {
    operator: DateRangeOperator;
    date: Date;
    dateEnd?: Date;
}

export interface IDateRangeOperatorDetails {
    operator: DateRangeOperator;
    name: string;
    placeholder1: string;
    placeholder2?: string;
}

export interface IDateRangeOperatorMeta {
    After: IDateRangeOperatorDetails;
    Before: IDateRangeOperatorDetails;
    Between: IDateRangeOperatorDetails;
    Equals: IDateRangeOperatorDetails;
}

export const DateRangeOperatorMeta: IDateRangeOperatorMeta = {
    After: {
        operator: DateRangeOperator.After,
        name: strings.AfterName,
        placeholder1: strings.AfterPlaceholder1
    },
    Before: {
        operator: DateRangeOperator.Before,
        name: strings.BeforeName,
        placeholder1: strings.BeforePlaceholder1
    },
    Equals: {
        operator: DateRangeOperator.After,
        name: strings.OnName,
        placeholder1: strings.OnPlaceholder1
    },
    Between: {
        operator: DateRangeOperator.Between,
        name: strings.BetweenName,
        placeholder1: strings.BetweenDatePlaceholder1,
        placeholder2: strings.BetweenDatePlaceholder2
    }
};

/**
 * This Component's Properties
 */
 export interface IDateRangeProps {
    value?: IDateRangeValue;
    placeHolder?: string;
    label?: string;
    onChanged?: Function;
}

export default function DateRange(props: IDateRangeProps): JSX.Element {

    const options = buildOptions(props);
    const refOperator = React.useRef(null);
    const refDate = React.useRef(null);
    const refDateEnd = React.useRef(null);
    const [showEndDate, setShowEndDate] = React.useState(false);
    const changed = () => {
        console.log('refOperator', refOperator.current);
        console.log('refDate', refDate.current);
        console.log('refDateEnd', refDateEnd.current);

        const operator = first(refOperator.current.selectedOptions as IDropdownOption[]).key as DateRangeOperator;
        const date = (refDate.current.state as IDatePickerState).selectedDate;
        const dateEnd = operator == DateRangeOperator.Between ? (refDateEnd.current.state as IDatePickerState).selectedDate : null;
        const value = {
            operator,
            date,
            dateEnd,
        } as IDateRangeValue;

        setShowEndDate(operator == DateRangeOperator.Between);

        props.onChanged(value);
    }

    function datePlaceholder(isEndDate = false) {

        const phProp = isEndDate ? 'placeholder2' : 'placeholder1';
        if(refOperator.current) {
            const operator = first(refOperator.current.selectedOptions as IDropdownOption[])?.key;
            if(operator) {
                return DateRangeOperatorMeta[operator][phProp];
            }
        }

        return '';
        
    }

    return (
        <div className={styles.dateRange}>
            <Label>{props.label}</Label>
            <div className={styles.pickerRow}>
                <Dropdown
                    componentRef={refOperator}
                    options={options} 
                    className={styles.dateOperator}
                    onChanged={changed}
                    selectedKey={props.value.operator}
                ></Dropdown>
                <DatePicker 
                    componentRef={refDate}
                    placeholder={datePlaceholder()} 
                    value={props.value.date}
                    onSelectDate={changed}
                    formatDate={onFormatDate}
                    //maxDate={this.state.value.dateEnd}
                    strings={DateRangeStrings}
                />
                <DatePicker 
                    componentRef={refDateEnd}
                    placeholder={datePlaceholder(true)}
                    value={props.value.dateEnd}
                    hidden={!showEndDate}
                    onSelectDate={changed} 
                    formatDate={onFormatDate}
                    minDate={refDate.current?.state?.selectedDate}
                    strings={DateRangeStrings}
                    isRequired={refDate.current && refDate.current.state.selectedDate && showEndDate}
                />
            </div>
        </div>
    );
}

DateRange.defaultProps = {
    value: EmptyValue(),
};

/**
 * Instantiates a new empty value upon get
 */
export function EmptyValue(): IDateRangeValue {
    return {
        operator: DateRangeOperator.On,
        date: null
    };
}

/**
 * Generator options for the date range operator dropdown menu
 */
function buildOptions(props: IDateRangeProps): IDropdownOption[] {
    const value = props.value || EmptyValue();
    const options = [];

    for (const opName in DateRangeOperator) {                                 // Loop through DateRangeOperator values
        const op = DateRangeOperator[opName];
        options.push({                                            // Create a new option for each operator
            text: DateRangeOperatorMeta[op].name,
            key: op,
            data: {
                value: op
            },
            selected: (op === value.operator) ? true : undefined       // Mark the correct one as selected
        } as IDropdownOption);
    }

    return options;
}

/**
 * Returns a formated date string
 * @param date 
 */
function onFormatDate(date: Date): string {
    return (date.getMonth() + 1) + '/' + date.getDate() + '/' + (date.getFullYear() % 100);
}

/**
 * Datepicker strings
 */
const DateRangeStrings: IDatePickerStrings = {
    months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ],

    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

    shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

    goToToday: 'Go to today',
    prevMonthAriaLabel: 'Go to previous month',
    nextMonthAriaLabel: 'Go to next month',
    prevYearAriaLabel: 'Go to previous year',
    nextYearAriaLabel: 'Go to next year',

    isRequiredErrorMessage: 'Field is required.',

    invalidInputErrorMessage: 'Invalid date format.',

    isOutOfBoundsErrorMessage: 'End range date must be greater than the previous date.'
};
