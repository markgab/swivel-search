import * as React from 'react';
import * as AutoComplete from 'React-AutoComplete';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import SearchSchemaHelper from '../helpers/SearchSchemaHelper';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import styles from './ManagedPropertyPicker.module.scss';

export interface IManagedPropertyPickerProps extends AutoComplete.Props {
    context: WebPartContext;
    value: string;
    onChanged: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface IManagedPropertyPickerState {
    items: Array<string>;
    spinnerVisible: boolean;
}

export default class ManagedPropertyPicker extends React.Component<IManagedPropertyPickerProps, IManagedPropertyPickerState> {
    constructor(props) {
        super(props);

        this.schema = new SearchSchemaHelper(
            document.location.origin,
            this.props.context.pageContext.web.serverRelativeUrl, 
            this.props.context.spHttpClient);

        this.state = {
            items: [],
            spinnerVisible: false
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
            <div className={styles.ManagedPropertyPicker}>
                <AutoComplete
                    { ...this.props }
                    inputProps={{ 
                        className: styles.autocomplete,
                        spellcheck: 'false'
                    }}
                    getItemValue={(item) => item}
                    items={this.state.items}
                    onChange={this.onChange}
                    selectOnBlur={false}
                    renderItem={(item, isHighlighted) =>
                        <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
                        {item}
                        </div>
                    }
                    wrapperStyle={{
                        position: 'relative'
                    }}
                    menuStyle={{
                        position: 'absolute',
                        top: '32px',
                        left: '0',
                        zIndex: 4,
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                        background: 'rgba(255, 255, 255, 0.9)',
                        overflow: 'auto',
                        maxHeight: '85px',
                        padding: '2px 12px',
                    }}
                />
                <Spinner 
                    className={styles.spinner}
                    style={{
                        display: this.state.spinnerVisible ? 'block' : 'none'
                    }} 
                    size={SpinnerSize.xSmall} 
                />
            </div>
        );
    }

    protected onSelect = (val: string): void => {
        
        if(typeof this.props.onChanged == 'function') {
            this.props.onChanged.call(null, val);
        }

    }

    protected onKeypress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        console.log('stop prop');
        e.stopPropagation();
    }

    protected onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const key = e.target.value;

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
                this._showLoading(true);
                this.fetchMatchingManagedProperties(key).then(items => {
                    this.setState({
                        ...this.state,
                        items: items,
                        spinnerVisible: false
                    });
                });
            }, 
        this._searchDelay);

    }

    private fetchMatchingManagedProperties(key: string): Promise<Array<any>> {
        console.log('search: ', key);
        return this.schema.fetchManagedPropertyMatches(key).then(managedProps => {
            const options = managedProps.map(mp => mp.RefinementName);
            return options;
        });
    }

    private _showLoading(val: boolean): void {
        this.setState({
            ...this.state,
            spinnerVisible: val
        });
    }
}