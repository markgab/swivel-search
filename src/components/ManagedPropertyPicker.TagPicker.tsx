import * as React from 'react';
import SearchSchemaHelper from '../helpers/SearchSchemaHelper';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { TagPicker, IBasePicker, ITag } from 'office-ui-fabric-react/lib/Pickers';
import { values } from '@uifabric/utilities/lib';
import wait, { WaitPromise } from '../helpers/Wait';

export interface IManagedPropertyPickerProps {
    context: WebPartContext;
    value: string;
    onChange: (items: Array<IProperty>) => void;
}

export interface IManagedPropertyPickerState {

}

export interface IProperty extends ITag {

}

export default class ManagedPropertyPicker extends React.Component<IManagedPropertyPickerProps, IManagedPropertyPickerState> {

    constructor(props: IManagedPropertyPickerProps) {
        super(props);

        this.schema = new SearchSchemaHelper(
            document.location.origin,
            this.props.context.pageContext.web.serverRelativeUrl, 
            this.props.context.spHttpClient);

        this.state = {

        };
    }
    
    public state: IManagedPropertyPickerState;

    public schema: SearchSchemaHelper;

    public readonly minimumKeyLength: number = 3;
    
    private _timerId: number;

    private _pauseDuration: number = 1000;

    public render(): React.ReactElement<IManagedPropertyPickerProps> {
        return (
            <TagPicker
              onResolveSuggestions={this._onFilterChanged}
              getTextFromItem={this._getTextFromItem}
              pickerSuggestionsProps={{
                suggestionsHeaderText: 'Suggested Managed Properties',
                noResultsFoundText: 'No matching managed properties found'
              }}
              onChange={this.props.onChange}
              onRemoveSuggestion={item => console.log(item)}
              selectedItems={this.props.value ? [{
                  name: this.props.value,
                  key: '-1'
              }] : []}
              itemLimit={1}
              /* inputProps={{
                onBlur: (ev: React.FocusEvent<HTMLInputElement>) => console.log('onBlur called'),
                onFocus: (ev: React.FocusEvent<HTMLInputElement>) => console.log('onFocus called'),
                'aria-label': 'Tag Picker'
              }} */
            />
        );

    }

    private _getTextFromItem(item: ITag): string {
        return item.name;
    }

    private _onFilterChanged = (filterText: string, tagList: Array<ITag>): PromiseLike<Array<ITag>> => {
        if(this._timerId > 0) {
            this._cancelTimer(this._timerId);
            this._timerId = 0;
        }
        if(filterText.length < this.minimumKeyLength) {
            return Promise.resolve([]);
        }
        return this._delay(this._pauseDuration).then(_ => {
            this._timerId = 0;
            return this._fetchMatchingManagedProperties(filterText);
        });
    }

    private _delay(ms: number, args?: any): Promise<any> {
        let timerId: number;

        return new Promise((resolve, reject) => {
            timerId = setTimeout(resolve.bind(null, args), ms) as any;
            this._timerId = timerId;
        });
    }

    private _cancelTimer(timerId: number): void {
        clearTimeout(timerId);
    }

    private _fetchMatchingManagedProperties(key: string): Promise<Array<ITag>> {
        return this.schema.fetchManagedPropertyMatches(key).then(managedProps => {
            let options = managedProps.map(mp => {
                return {
                    name: mp.RefinementName,
                    key: mp.RefinementToken
                } as ITag;
            });
            return options;
        });
    }

}
