import * as React from 'react';
import { 
    SearchResults,
    ISearchResult, 
    SearchQueryBuilder,
    ISearchQuery
} from '@pnp/sp/search';
import globals from '../model/SwivelSearchGlobals';
import { CompactPeoplePicker, IBasePicker } from 'office-ui-fabric-react/lib/Pickers';
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
    selectedItems?: IPersonaProps[];
    //componentRef?: (component?: PeoplePicker) => void;  
    rowLimit?: number; 
    pauseDuration?: number;
}

export default function PeoplePicker(props: PeoplePickerProps): JSX.Element {

    const {
        label,
        placeholder,
        onChanged,
        selectedItems,
        rowLimit,
        pauseDuration,
    } = props;

    function onPersonPicker_change (items?: IPersonaProps[]): void {

        if(typeof onChanged === 'function') {
            onChanged(items.length ? items : []);
        }

        if(items.length === 0) {
            setPlaceholder();
        }

    }
    
    async function onPersonPicker_ResolveSuggestions (filter: string, selected?: IPersonaProps[]): Promise<IPersonaProps[]> {
        if(filter.length <= 2) {
            return [];
        }

        // Collection of search engine matches
        let currPersons: IPersonaProps[];

        // Collection of historical items collection
        // Some valid search results may no longer be in the active user's list
        let histPersons: IPersonaProps[];

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
        const matches = removeDuplicates(currPersons.concat(histPersons));

        // Search for an exact match where the search key matches a persons name to the letter
        const exact = matches.filter(m => {
            return (m.text || "").toLowerCase() === filter.toLowerCase();
        });

        // If there is an exact match, auto-select it
        if(exact.length > 0) {
            selected.push(exact[0]);
            return [];
        }

        // If there are no exact matches, display suggestions
        return matches;

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

        const query = `${searchTerms}*`; 
        
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

    let picker: IBasePicker<IPersonaProps>;    

    function componentRefCall(component?: IBasePicker<IPersonaProps>): void {

        picker = component;

        setPlaceholder();

    }

    function setPlaceholder(): void {
        if(placeholder && picker) {
            const p: any = picker;
            if(p.input && p.input.current && p.input.current._inputElement) {
                const input: HTMLInputElement = p.input.current._inputElement.current;
                if(input && !input.value) {
                    input.placeholder = placeholder;
                }
            }
        }
    }

    return (
        <div className={styles.PeoplePicker}>
            <Label>{label}</Label>
            <CompactPeoplePicker
                onResolveSuggestions={onPersonPicker_ResolveSuggestions}
                onChange={onPersonPicker_change}
                itemLimit={1}
                componentRef={componentRefCall}
                selectedItems={selectedItems}
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
    const unique = {};
    persons.forEach(p => {
      if(!unique[p.text]) {
        unique[p.text] = p;
      }
    });
    const arr: Array<IPersonaProps> = [];
    for (const p in unique) {
        arr.push(unique[p]);
    }

    return arr;
}

function cleanMultivalueResults(persons: Array<IPersonaProps>, searchTerm: string): Array<IPersonaProps> {
    const multis = persons.filter(p => p.text.indexOf(';') !== -1);
    const lowerTerm = searchTerm.toLowerCase();

    multis.forEach(p => {
        const lowerString = p.text.toLowerCase();
        if(lowerString.indexOf(lowerTerm) === -1) {
           p.text = '';
           return;
        }
        const lowerNames = lowerString.split(';');
        const properNames = p.text.split(';');
        for(let i = 0; i < lowerNames.length; i++) {
            const n = lowerNames[i];
            if(n.indexOf(lowerTerm) !== -1) {
                p.text = properNames[i];
                break;
            }
        }
    });

    return persons.filter(p => p.text !== '');
}

//#endregion Helper Functions