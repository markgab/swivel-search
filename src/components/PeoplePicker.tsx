import * as React from 'react';
import { 
    sp, 
    SearchResults,
    SearchResult, 
    SearchQueryBuilder,
    SearchQuery 
} from '@pnp/sp';
import {
    NormalPeoplePicker, 
    CompactPeoplePicker, 
    IPeoplePickerProps, 
    IBasePicker,
    ValidationState
} from 'office-ui-fabric-react/lib/Pickers';
import { IPersonaProps } from 'office-ui-fabric-react/lib/Persona';
import { Label } from 'office-ui-fabric-react/lib/Label';
import styles from './PeoplePicker.module.scss';

export interface PeoplePickerProps {
    label?: string;
    placeholder?: string;
    ManagedProperty?: string;
    onChanged?: Function;
    selectedItems?: Array<IPersonaProps>;
    componentRef?: (component?: PeoplePicker) => void;   
}

export interface PeoplePickerState {

}

export interface PeopleSearchResult extends SearchResult {
    JobTitle: string;
    PictureURL: string;
    PreferredName: string;
}

export default class PeoplePicker extends React.Component<PeoplePickerProps, PeoplePickerState> {

    constructor(props: PeoplePickerProps) {
        super(props);

        this.state = {
            //selectedItems: props.selectedItems
        } as PeoplePickerState;
    }

    public state: PeoplePickerState;
    public RowLimit = 5;
    private _timerId: number;
    private _pauseDuration: number = 500;
    private _picker: IBasePicker<IPersonaProps>;

    
    public render(): React.ReactElement<PeoplePickerProps> {
        return (
            <div className={styles.PeoplePicker}>
                <Label>{this.props.label}</Label>
                <CompactPeoplePicker
                    onResolveSuggestions={this.onPersonPicker_ResolveSuggestions}
                    onChange={this.onPersonPicker_change}
                    onInputChange={this.onPersonPicker_inputChange}
                    itemLimit={1}
                    componentRef={this.componentRefCall}
                    //selectedItems={this.props.selectedItems}
                />
            </div>
        );
    }

    public componentDidMount() {
        const { componentRef } = this.props;
        if(componentRef) { 
            componentRef(this);
        }
    }

    public componentWillUnmount() {
        const { componentRef } = this.props;
        if(componentRef) { 
            componentRef(undefined);
        }
    }

    /**
     * Life cycle event handler
     * @param nextProps new incoming props
     */
    public componentWillReceiveProps(nextProps: PeoplePickerProps): void {
        let selectedItems = nextProps.selectedItems || [];
        this.setState({
            ...this.state,
            selectedItems
        } as PeoplePickerState,
        () => this._setPlaceholder());
    }

    public reset(): void {
        this._picker['setState']({
            ...this._picker['state'],
            items: []
        });
    }

    protected onPersonPicker_inputChange = (input: string): string => {
        console.log('input change');
        return input;
    }

    protected componentRefCall = (component?: IBasePicker<IPersonaProps>): void => {

        this._picker = component;

        this._setPlaceholder();

    }

    protected onPersonPicker_change = (items?: IPersonaProps[]): void => {

        if(typeof this.props.onChanged === 'function') {
            this.props.onChanged(items.length ? items : []);
        }

        if(items.length === 0) {
            this._setPlaceholder();
        }

    }

    
    protected onPersonPicker_ResolveSuggestions = (filter: string, selectedItems?: IPersonaProps[]): IPersonaProps[] | PromiseLike<IPersonaProps[]> => {
        if(filter.length > 2) {
            let currPersons = [];
            let histPersons = [];
            let p = [];

            if(this._timerId) {
                clearTimeout(this._timerId);
            }

            return this._delay(this._pauseDuration).then(() => {

                p.push(this._searchPeople(filter).then(persons => {
                    currPersons = persons;
                }));
                
                p.push(this._searchManagedProperty(filter, "Author").then(persons => {
                    histPersons = persons;
                }));

                return Promise.all(p).then(() => {
                    histPersons = this._cleanMultivalueResults(histPersons, filter);
                    let matches = this._removeDuplicates(currPersons.concat(histPersons));
                    let exact = matches.filter(m => {
                        return (m.text || "").toLowerCase() === filter.toLowerCase();
                    });
                    if(exact.length > 0) {
                        let match = exact[0];
                        selectedItems.push(match);
                        return [];
                    }
                    return matches;
                });
            });

        } else {
            return Promise.resolve([]);
        }
    }

    private _setPlaceholder(): void {
        if(this.props.placeholder && this._picker) {
            let p: any = this._picker;
            if(p.input && p.input.current && p.input.current._inputElement) {
                let input: HTMLInputElement = p.input.current._inputElement.current;
                if(input && !input.value) {
                    input.placeholder = this.props.placeholder;
                }   
            }
        }
    }

    private _searchPeople(searchTerms: string): Promise<Array<IPersonaProps>> {
        let SelectProperties = [
            "PreferredName",
            "JobTItle",
            "PictureURL"
        ];
        let SourceId = 'b09a7990-05ea-4af9-81ef-edfab16c4e31';
        let RowLimit = this.RowLimit;
        let EnablePhonetic = true;
        const queryOptions: SearchQuery = {
            SelectProperties,
            RowLimit,
            SourceId,
            EnablePhonetic
        };

        let query = `${searchTerms}*`; 
        
        const q = SearchQueryBuilder(query, queryOptions);

        return sp.search(q).then((r: SearchResults) => {
            return r.PrimarySearchResults.map((row: PeopleSearchResult) => {
                return {
                    secondaryText: row.JobTitle,
                    imageUrl: row.PictureURL,
                    text: row.PreferredName
                } as IPersonaProps;
            });
        });
    }

    private _searchManagedProperty(searchTerms: string, managedProperty: string): Promise<Array<IPersonaProps>> {
        let SelectProperties = [
            managedProperty
        ];
        let RowLimit = this.RowLimit;
        let TrimDuplicates = true;
        let EnablePhonetic = false;

        const queryOptions: SearchQuery = {
            SelectProperties,
            RowLimit,
            TrimDuplicates,
            EnablePhonetic
        };
        
        const q = SearchQueryBuilder(searchTerms, queryOptions);

        return sp.search(q).then((r: SearchResults) => {
            try {
                if(r.RowCount) {
                    console.log('results: ', r.PrimarySearchResults);
                    return r.PrimarySearchResults.map(row => {
                        return {
                            secondaryText: '',
                            imageUrl: '',
                            text: row.Author
                        } as IPersonaProps;
                    });
                } else {
                    return [];
                }
            } catch(err)  {
                return [];
            }

        });

    }

    private _delay(ms: number, args?: any): Promise<any> {
        let timerId: number;

        return new Promise((resolve, reject) => {
            timerId = setTimeout(resolve.bind(null, args), ms) as any;
            this._timerId = timerId;
        });
    }

    private _removeDuplicates(persons: Array<IPersonaProps>): Array<IPersonaProps> {
        let unique = {};
        persons.forEach(p => {
          if(!unique[p.text]) {
            unique[p.text] = p;
          }
        });
        let arr: Array<IPersonaProps> = [];
        for (let p in unique) {
            arr.push(unique[p]);
        }

        return arr;
    }

    private _cleanMultivalueResults(persons: Array<IPersonaProps>, searchTerm: string): Array<IPersonaProps> {
        let multis = persons.filter(p => p.text.indexOf(';') !== -1);
        let lowerTerm = searchTerm.toLowerCase();

        multis.forEach(p => {
            let lowerString = p.text.toLowerCase();
            if(lowerString.indexOf(lowerTerm) === -1) {
               p.text = '';
               return;
            }
            let lowerNames = lowerString.split(';');
            let properNames = p.text.split(';');
            for(let i = 0; i < lowerNames.length; i++) {
                let n = lowerNames[i];
                if(n.indexOf(lowerTerm) !== -1) {
                    p.text = properNames[i];
                    break;
                }
            }
        });

        return persons.filter(p => p.text !== '');
    }
    
}