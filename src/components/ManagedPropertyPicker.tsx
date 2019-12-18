import * as React from 'react';
import * as AutoComplete from 'React-AutoComplete';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import SearchSchemaHelper from '../helpers/SearchSchemaHelper';

export interface IManagedPropertyPickerProps extends AutoComplete.Props {
    context: WebPartContext;
    value: string;
    onChanged: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface IManagedPropertyPickerState {
    items: Array<string>;
}

export default class ManagedPropertyPicker extends React.Component<IManagedPropertyPickerProps, IManagedPropertyPickerState> {
    constructor(props) {
        super(props);

        this.schema = new SearchSchemaHelper(
            document.location.origin,
            this.props.context.pageContext.web.serverRelativeUrl, 
            this.props.context.spHttpClient);

        this.state = {
            items: []
        };

    }

    public schema: SearchSchemaHelper;
    public state: IManagedPropertyPickerState;
    private _timeoutId: number;
    private readonly _minSearchLength: number = 3;
    private readonly _searchDelay: number = 1000;

    /**
     * React component's render method
     */
    public render(): React.ReactElement<IManagedPropertyPickerProps> {
        return(
            <AutoComplete 
                { ...this.props }
                getItemValue={(item) => item}
                items={this.state.items}
                onChange={this.onChange}
                selectOnBlur={true}
                renderItem={(item, isHighlighted) =>
                    <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
                      {item}
                    </div>
                }
                wrapperStyle={{
                    //position: 'relative'
                }}
                menuStyle ={{
                    borderRadius: '3px',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '2px 0',
                    fontSize: '90%',
                    position: 'fixed',
                    //marginLeft: '-50px',
                    overflow: 'auto',
                    maxHeight: '50%',
                    top: '18',
                    left: '0px !important'
                }}
            />
        );
    }

    protected onSelect = (val: string): void => {
        
        if(typeof this.props.onChanged == 'function') {
            this.props.onChanged.call(null, val);
        }

    }

    protected onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        let key = e.target.value;

        if(typeof this.props.onChanged == 'function') {
            this.props.onChanged.call(null, e);
        }
        this._queueSearch(key);
    }

    private _queueSearch(key): void {

        if(this._timeoutId) {
            clearTimeout(this._timeoutId);
            this._timeoutId = 0;
        }

        if(key.length < this._minSearchLength) {
            return;
        }

        this._timeoutId = setTimeout(
            () => { 
                this.fetchMatchingManagedProperties(key).then(items => {
                    this.setState({
                        ...this.state,
                        items: items
                    });
                });
            }, 
        this._searchDelay);

    }

    private fetchMatchingManagedProperties(key: string): Promise<Array<any>> {
        console.log('search: ', key);
        return this.schema.fetchManagedPropertyMatches(key).then(managedProps => {
            let options = managedProps.map(mp => {
                return mp.RefinementName;
            });
            return options;
        });
    }
}