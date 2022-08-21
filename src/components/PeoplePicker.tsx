import * as React from 'react';
import { 
    SearchResults,
    ISearchResult, 
    SearchQueryBuilder,
    ISearchQuery
} from '@pnp/sp/search';
import globals from '../model/SwivelSearchGlobals';
import { CompactPeoplePicker } from 'office-ui-fabric-react/lib/Pickers';
import { IPersonaProps } from 'office-ui-fabric-react/lib/Persona';
import { Label } from 'office-ui-fabric-react/lib/Label';
import styles from './PeoplePicker.module.scss';

export interface PeopleSearchResult extends ISearchResult {
    JobTitle: string;
    PictureURL: string;
    PreferredName: string;
}

export interface PeoplePickerProps {
    label?: string;
    placeholder?: string;
    managedProperty?: string;
    onChanged?: (val: any) => void;
    selectedItems?: Array<IPersonaProps>;
    //componentRef?: (component?: PeoplePicker) => void;  
    rowLimit?: number; 
    pauseDuration?: number;
}

export default function PeoplePicker(props: PeoplePickerProps): JSX.Element {

    const {
        label,
        placeholder,
        managedProperty,
        onChanged,
        selectedItems,
        rowLimit,
        pauseDuration,
    } = props;

    const onPersonPicker_change = (items?: IPersonaProps[]): void => {

        if(typeof onChanged === 'function') {
            onChanged(items.length ? items : []);
        }

        if(items.length === 0) {
            setPlaceholder();
        }

    }
    
    const onPersonPicker_ResolveSuggestions = async (filter: string, selectedItems?: IPersonaProps[]): Promise<IPersonaProps[]> => {
        if(filter.length <= 2) {
            return [];
        }

        // Collection of search engine matches
        let currPersons = [];

        // Collection of historical items collection
        // Some valid search results may no longer be in the active user's list
        let histPersons = [];

        // Promises array
        const p = [];

        // Wait to see if they are still typing
        await wait(pauseDuration);
        
        // Search for active users with the search engine
        p.push(searchPeople(filter).then(persons => {
            currPersons = persons;
        }));
        
        // Search for historical values along the provided managed property
        p.push(searchManagedProperty(filter, "Author").then(persons => {
            histPersons = persons;
        }));

        // Wait for both queries to complete
        await Promise.all(p);

        // Scrub results
        histPersons = cleanMultivalueResults(histPersons, filter);
        
        // Combine both results and remove dupes
        let matches = removeDuplicates(currPersons.concat(histPersons));

        // Search for an exact match where the search key matches a persons name to the letter
        let exact = matches.filter(m => {
            return (m.text || "").toLowerCase() === filter.toLowerCase();
        });

        // If there is an exact match, auto-select it
        if(exact.length > 0) {
            let match = exact[0];
            selectedItems.push(match);
            return [];
        }

        // If there are no exact matches, display suggestions
        return matches;

    }

    function setPlaceholder(): void {
        /* if(this.props.placeholder && this._picker) {
            let p: any = this._picker;
            if(p.input && p.input.current && p.input.current._inputElement) {
                let input: HTMLInputElement = p.input.current._inputElement.current;
                if(input && !input.value) {
                    input.placeholder = this.props.placeholder;
                }   
            }
        } */
    }

    function searchPeople(searchTerms: string): Promise<Array<IPersonaProps>> {
        const search = globals.data.searcher;
        const SelectProperties = [
            "PreferredName",
            "JobTItle",
            "PictureURL"
        ];
        const SourceId = 'b09a7990-05ea-4af9-81ef-edfab16c4e31';

        const EnablePhonetic = true;
        const queryOptions: ISearchQuery = {
            SelectProperties,
            RowLimit: rowLimit,
            SourceId,
            EnablePhonetic,
        };

        let query = `${searchTerms}*`; 
        
        const q = SearchQueryBuilder(query, queryOptions);

        return search(q).then((r: SearchResults) => {
            return r.PrimarySearchResults.map((row: PeopleSearchResult) => {
                return {
                    secondaryText: row.JobTitle,
                    imageUrl: row.PictureURL,
                    text: row.PreferredName
                } as IPersonaProps;
            });
        });
    }

    function searchManagedProperty(searchTerms: string, managedProperty: string): Promise<Array<IPersonaProps>> {
        const search = globals.data.searcher;
        const SelectProperties = [
            managedProperty
        ];
        const TrimDuplicates = true;
        const EnablePhonetic = false;

        const queryOptions: ISearchQuery = {
            SelectProperties,
            RowLimit: rowLimit,
            TrimDuplicates,
            EnablePhonetic
        };
        
        const q = SearchQueryBuilder(searchTerms, queryOptions);

        return search(q).then((r: SearchResults) => {
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

    return (
        <div className={styles.PeoplePicker}>
            <Label>{props.label}</Label>
            <CompactPeoplePicker
                onResolveSuggestions={onPersonPicker_ResolveSuggestions}
                onChange={onPersonPicker_change}
                //onInputChange={onPersonPicker_inputChange}
                itemLimit={1}
                //componentRef={this.componentRefCall}
                //selectedItems={this.props.selectedItems}
            />
        </div>
    );
}

/**
 * Component prop defaults
 */
PeoplePicker.defaultProps = {
    rowLimit: 5,
    pauseDuration: 500,
};

//#region Helper Functions

// setTimeout id used for cancelling a scheduled code execution
let timeoutId: number;

/**
 * Promise based function to pause 
 * code execution
 * @param ms 
 * @returns 
 */
function wait(ms: number): Promise<void> {
    if(timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
    return new Promise((resolve) => {
        timeoutId = setTimeout(resolve, ms);
    });
}

function removeDuplicates(persons: Array<IPersonaProps>): Array<IPersonaProps> {
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

function cleanMultivalueResults(persons: Array<IPersonaProps>, searchTerm: string): Array<IPersonaProps> {
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

//#endregion Helper Functions