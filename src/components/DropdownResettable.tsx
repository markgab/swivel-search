import * as React from 'react';
import { 
    Dropdown, 
    IDropdown, 
    DropdownMenuItemType, 
    IDropdownOption, 
    IDropdownProps
} from 'office-ui-fabric-react/lib/Dropdown';

/**
 * Dropdown option extension
 */
export interface IDropdownResettableOption extends IDropdownOption {
    value?: number | string;
}

/**
 * This component's property interface
 */
export interface IDropdownResettableProps extends IDropdownProps {
    onChanged?: (val: any) => void;
    options: IDropdownResettableOption[];
}

export default function DropdownResettable(props: IDropdownResettableProps): JSX.Element {
    const {
        onChanged,
        options,
        selectedKey,
    } = props;
 
    /**
     * Dropdown changed event handler
     * @param selectedOption 
     * @param index 
     */
    const ctrl_changed = (selectedOption: IDropdownResettableOption, index: number): void => {
        if(onChanged) {                                          // If onChanged is provied
            onChanged(selectedOption);                           // call handler
        }
    }
    
    /**
     * Prepends an empty choice to the options array for resetting the control
     */
    function includeResetDropdownChoice(options: IDropdownResettableOption[]): IDropdownResettableOption[] {

        let choices = [...options] as IDropdownResettableOption[];

        const resetChoice: IDropdownResettableOption = {                    // Reset options definition
            key: `field-reset`,
            text: '',
            value: null
        };

        choices.unshift(resetChoice);                                       // Add reset option to beginning of array

        return choices;                                                     // return options array
    }

    return (
        <Dropdown {...props } 
            onChanged={ctrl_changed} 
            options={includeResetDropdownChoice(options)} 
            selectedKey={selectedKey}
        />
    );
}