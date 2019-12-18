import * as React from 'react';
import { ComboBox, Fabric, IComboBoxProps, IComboBoxOption, mergeStyles, SelectableOptionMenuItemType, Toggle, IComboBox, KeyCodes } from 'office-ui-fabric-react/lib/index';
import SearchSchemaHelper from '../helpers/SearchSchemaHelper';
import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IManagedPropertyPickerProps extends IComboBoxProps {
    context: WebPartContext;
}


export interface IManagedPropertyPickerState {
    options: Array<IComboBoxOption>;
}

export default class ManagedPropertyPicker extends React.Component<IManagedPropertyPickerProps, IManagedPropertyPickerState> {

    constructor(props: IManagedPropertyPickerProps) {
        super(props);

        this.schema = new SearchSchemaHelper(
            document.location.origin,
            this.props.context.pageContext.web.serverRelativeUrl, 
            this.props.context.spHttpClient);

        this.state = {
            options: this.props.options
        };
    }
    
    private _mppComboBox: IComboBox;

    public state: IManagedPropertyPickerState;

    public schema: SearchSchemaHelper;

    private _pending: Promise<any>;

    /**
     * React component's render method
     */
    public render(): React.ReactElement<IManagedPropertyPickerProps> {
        return(
            <ComboBox {...this.props }
                //onKeyDown={this.combobox_keyup}
                //onSelect={this.combobox_select}
                //onChangeCapture={this.combobox_changeCapture}
                //options={this.state.options}                
                //useComboBoxAsMenuWidth={true}
                //allowFreeform={true}
                //autoComplete={'off'}
                //componentRef={(combobox) => { this._mppComboBox = combobox; } }
            />
        );
    }

    protected combobox_changeCapture = (e: React.ChangeEvent<IComboBox>):void => {
        console.log('ChangeCapture', e);
    }

    protected combobox_select = (e: React.SyntheticEvent<IComboBox>): void => {
        console.log('select', e);
    }

    protected combobox_keyup = (e: React.KeyboardEvent<IComboBox>): void => {

        let key: KeyCodes = e.keyCode;

        switch(key) {
            case KeyCodes.enter:
            case KeyCodes.tab:
            case KeyCodes.down:
            case KeyCodes.up:
            case KeyCodes.left:
            case KeyCodes.right:
            case KeyCodes.escape:
                //console.log('Leaving with: ', key);
                return;
            default: 
                return;
        }

        let val = (e.target as HTMLInputElement).value;
        //console.log(val);

        if(this._pending) {
            Promise.reject(this._pending);
        }

        this.fetchMatchingManagedProperties(val).then((options: Array<IComboBoxOption>) => {
            this.setState({
                ...this.state,
                options: options
            }/* , () => { 
                this._mppComboBox.focus(true); 
            } */);
        });
    }

    private fetchMatchingManagedProperties(key: string): Promise<Array<IComboBoxOption>> {
        return this.schema.fetchManagedPropertyMatches(key).then(managedProps => {
            let options = managedProps.map(mp => {
                return {
                    text: mp.RefinementName,
                    key: mp.RefinementToken
                } as IComboBoxOption;
            });
            return options;
        });
    }

    private _delay(ms: number, args: any) {{
            return new Promise((resolve) => { 
                setTimeout(resolve.bind(null, args), ms);
            });
        }
    }

}