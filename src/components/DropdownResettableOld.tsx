import * as React from 'react';
import { 
    Dropdown, 
    IDropdown, 
    DropdownMenuItemType, 
    IDropdownOption, 
    IDropdownProps
} from 'office-ui-fabric-react/lib/Dropdown';

/**
 * This component's property interface
 */
export interface IDropdownResettableProps extends IDropdownProps {
    options: Array<IDropdownResettableOption>;
}

/**
 * This component's state interface
 */
export interface IDropdownResettableState {
    selectedKey?: number | string | number[] | string[];
}

/**
 * Dropdown option extension
 */
export interface IDropdownResettableOption extends IDropdownOption {
    value?: number | string;
}

/**
 * DropdownResettable React Component Class definition
 */
export default class DropdownResettable extends React.Component<IDropdownResettableProps, IDropdownResettableState> {
    constructor(props: IDropdownResettableProps) {
        super(props);

        this.state = {                                                      // Init state object
            selectedKey: props.selectedKey
        };

        this.options = this._includeResetDropdownChoice();                  // build dropdown options

    }

    /**
     * Dropdown options array
     */
    public options: IDropdownResettableOption[];

    /**
     * React component's state object
     */
    public state: IDropdownResettableState;

    /**
     * React component's render method
     */
    public render(): React.ReactElement<IDropdownResettableProps> {
        return(
            <Dropdown {...this.props } 
                onChanged={(o, i) => this.ctrl_changed(o, i)} 
                options={this.options} 
                selectedKey={this.state.selectedKey}
            />
        );
    }

    /**
     * React Component's will receive props event handler
     * @param nextProps 
     */
    public componentWillReceiveProps(nextProps: IDropdownResettableProps): void {
        this.setState({                                                     // Record new selectedKey from props to state
            ...this.state,
            selectedKey: nextProps.selectedKey
        } as IDropdownResettableState);
    }
    
    /**
     * Dropdown changed event handler
     * @param selectedOption 
     * @param index 
     */
    protected ctrl_changed(selectedOption: IDropdownResettableOption, index: number): void {

        if(selectedOption.value === null) {                                 // If value is null 
            this.setState({                                                 // reset dropdown to unselected
                ...this.state,
                selectedKey: null
            } as IDropdownResettableState,
            () => this._changed(selectedOption, index));
        } else {                                                            // otherwise 
            this.setState({                                                 // set selectedKey
                ...this.state,
                selectedKey: selectedOption.key
            }as IDropdownResettableState,
            () => this._changed(selectedOption, index));                    // Pass value to parent component change handler
        }
        
    }

    /**
     * Calls parent components event handler if non-null
     * @param selectedOption 
     * @param index 
     */
    protected _changed(selectedOption: IDropdownResettableOption, index: number) {
        if(this.props.onChanged) {                                          // If onChanged is provied
            this.props.onChanged(selectedOption, index);                    // call handler
        }
    }
    
    /**
     * Prepends an empty choice to the options array for resetting the control
     */
    private _includeResetDropdownChoice(): Array<IDropdownResettableOption> {

        let choices = [...this.props.options] as Array<IDropdownResettableOption>;

        const resetChoice: IDropdownResettableOption = {                    // Reset options definition
            key: `field-reset`,
            text: '',
            value: null
        };

        choices.unshift(resetChoice);                                       // Add reset option to beginning of array

        return choices;                                                     // return options array
    }

}