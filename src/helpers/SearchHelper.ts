import { sp, Web, SearchResult, SearchResults } from '@pnp/sp';
import { escape } from '@microsoft/sp-lodash-subset';

/* interface ISynonymValue {
    Title: string;
    Synonym: string;
    TwoWay: boolean;
}
 */

export interface ISearchUser {
  upn: string;
  displayname: string;
  principle: string;
}

export default class SearchHelper {


  public static addLinebreaksToHitHighlightedProperty(prop: string) {
      return prop.replace(/<ddd\/>/g, ' ... ');
  }

  public static removeTagsFromHitHighlightedProperty(prop: string) {
      return prop.replace(/<[/]?[_a-zA-Z0-9]+[/]?>/g, '');
  }

  /**
   * Parses a user value found in search results into an object container
   * Example user value: John.Doe@domain.com | John Doe | 293849283948392849D i:0#.f|membership|john.done@domain.com
   * @param user search user value
   */
  public static parseSearchUserValue(user: string): ISearchUser {
    let a: string[], u: ISearchUser;

    if(!user) { return u; }

    try {
      a = user.split(' | ');
      u = <ISearchUser> {
        upn: a[0],
        displayname: a[1],
        principle: a[2]
      };
    }
    catch(ex) {
      console.log('Cannot parse search user value: ', user);
    }

    return u;
  }



  /* public static readonly urlWeb: string = "https://regal.sharepoint.com/sites/devpoint";
  public static readonly synonymsList: string = "Search Synonyms"; */

    /**
     * The result object is heavily abstracted by Microsoft
     * and for some reaason it won't serialize.  This is my
     * attempt to manually serialize it for debugging.
     * But it does not work :( -MG
     * @param results
     */
/*     public static SerializeResults(results: SearchResult[]): string;
    public static SerializeResults(results: SearchResults): string;
    public static SerializeResults(results: SearchResult[] | SearchResults): string {
        if (results instanceof SearchResults) {
            results = (<SearchResults>results).PrimarySearchResults;
        }

        var str = '[';
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            str += '{';
            for (var j in result) {
              str += j + ':"' + escape(result[j]) + '",';
            }
            str = str.substr(0, str.length - 2);
            str += '}';
            if (i != results.length - 1) {
                str += ',';
            }
        }

        str += ']';
        return str;
    } */

    /* public static loadSynonyms(): Promise<any> {
        let synonymTable = {};
        let web = new Web(SearchHelper.urlWeb);
        return web.lists.getByTitle(SearchHelper.synonymsList).items
        .select(
            "Title",
            "Synonym",
            "TwoWay"
        ).getAll().then((res: ISynonymValue[]) => {
            res.forEach((item: ISynonymValue) => {
                if (item.TwoWay) {
                    let synonyms: string[] = item.Synonym.split(',');
                    // Set the default synonym
                    synonymTable[item.Title.toLowerCase()] = synonyms;
                    // Loop over the list of synonyms
                    let tmpSynonyms: string[] = synonyms;
                    tmpSynonyms.push(item.Title.toLowerCase().trim());
                    synonyms.forEach(s => {
                        synonymTable[s.toLowerCase().trim()] = tmpSynonyms.filter((fItem) => { return fItem !== s; });
                    });
                } else {
                    // Set a single synonym
                    synonymTable[item.Title.toLowerCase()] = item.Synonym.split(',');
                }
            });
            return synonymTable;
        });
    } */
/*
    public static applySynonymns(query: string, synonymTable: any): string {

        // Remove complex query parts AND/OR/NOT/ANY/ALL/parenthasis/property queries/exclusions - can probably be improved
        var cleanQuery: string = query.replace(/(-\w+)|(-"\w+.*?")|(-?\w+[:=<>]+\w+)|(-?\w+[:=<>]+".*?")|((\w+)?\(.*?\))|(AND)|(OR)|(NOT)/g, '');
        var queryParts: string[] = cleanQuery.match(/("[^"]+"|[^"\s]+)/g);
        var synonyms: string[] = [];
        // code which should modify the current query based on context for each new query

        if (queryParts) {
            for (var i = 0; i < queryParts.length; i++) {
                if (synonymTable[queryParts[i]]) {
                    // Replace the current query part in the query with all the synonyms
                    //query = query.replace(queryParts[i], String.format('({0} OR {1})', queryParts[i], _synonymTable[queryParts[i]].join(' OR ')));
                    query = query.replace(queryParts[i], `${queryParts[i]} OR ${synonymTable[queryParts[i]].join(' OR ')}`);
                    synonyms.push(synonymTable[queryParts[i]]);
                }
            }
        }

        // remove noise words from the search query

        // Call function to remove the noise words from the search query
        //query = replaceNoiseWords(query);

        //console.log('after replaceNoiceWords: ', query);

        // Update the keyword query
        //dataProvider.get_properties()[PROP_SYNONYMQUERY] = query;
        //dataProvider.get_properties()[PROP_SYNONYM] = synonyms;

        return query;
    } */

}
