import { 
    sp, 
    SearchResults,
    SearchResult,
    SearchQuery 
} from '@pnp/sp';
import { uniq } from '@microsoft/sp-lodash-subset';
import { BaseComponentContext } from '@microsoft/sp-component-base';
import * as Model from './AdvancedSearchModel';
import { SearchQueryBuilder } from "@pnp/polyfill-ie11/dist/searchquerybuilder";

export interface IAdvancedSearchResult extends SearchResult {
    Title: string; 
    Filename: string;
    TitleOrFilename?: string;
    IsListItem: string;
    SPWebUrl: string;
    FileType: string;
    Path: string; 
    OriginalPath: string;
    owsID: string;
    ServerRedirectedURL: string;
    SiteName: string;
    ListID: string;
    ContentTypeId: string;
    ListItemID: string;
    ResultItemType: Model.ResultItemType;
    DocumentLink: string;
}

export default class AdvancedSearchData {
    constructor(public context: BaseComponentContext, public columns: Array<Model.IResultProperty>) {
        sp.setup({
            spfxContext: context
        });
    }

    public rowLimit: number = 30;
    public page: number;
    public totalRows: number;
    //public resultsConfig: Model.IResultsConfig;
    public currentResults: SearchResults;

    public get customSelectProperties(): Array<string> {
        let props: Array<string> = [];
        
        if(this.columns) {
            this.columns.forEach((prop: Model.IResultProperty) => {
                props.push(prop.fieldName);
            });
        }

        return props;
    }

    public readonly internalSelectProperties: Array<string> = [
        "Title", 
        "Filename",
        "IsDocument",
        "IsContainer",
        "IsListItem",
        "Rank", 
        "SPWebUrl",
        "FileType",
        "Path", 
        "OriginalPath",
        "owsID", 
        "WorkId", 
        "ServerRedirectedURL",
        "ServerRedirectedPreviewURL",
        "ServerRedirectedEmbedURL",
        "SiteName", 
        "ParentLink",
        "ListID",
        "ContentTypeId",
        "ListItemID",
        "DocumentLink"
    ];

    public search(queryText: string): Promise<SearchResults> {

        const props = uniq<string>([ 
            ...this.internalSelectProperties, 
            ...this.customSelectProperties 
        ]);

        const queryOptions: SearchQuery = {
            SelectProperties: props,
            RowsPerPage: this.rowLimit,
            RowLimit: this.rowLimit
        };

        const q = SearchQueryBuilder(queryText, queryOptions);

        return sp.search(q).then((r: SearchResults) => {

            this.currentResults = r;                                        // update the current results
            this.page = 1;                                                  // reset if needed
            
            if(r && r.RawSearchResults && r.RawSearchResults.PrimaryQueryResult) {
                this.totalRows = r.TotalRows;
            } else {
                this.totalRows = 0;
            }

            r.PrimarySearchResults.forEach((row: IAdvancedSearchResult) => this._transformResult(row));

            console.log(r);

            return r;

        });
    }

    public next(): Promise<SearchResults> {
        return this.currentResults.getPage(++this.page).then((r: SearchResults) => {
            r.PrimarySearchResults.forEach((row: IAdvancedSearchResult) => this._transformResult(row));
            return  r; 
        });
    }

    public prev(): Promise<SearchResults> {
        return this.currentResults.getPage(--this.page).then((r: SearchResults) => {
            r.PrimarySearchResults.forEach((row: IAdvancedSearchResult) => this._transformResult(row));
            return r;
        });
    }

    public getPage(page: number): Promise<SearchResults> {
        return this.currentResults.getPage(this.page = page).then((r: SearchResults) => {
            r.PrimarySearchResults.forEach((row: IAdvancedSearchResult) => this._transformResult(row));
            return r;
        });
    }

    private _transformResult(item: IAdvancedSearchResult): void {
        item.ResultItemType = this._determineItemType(item);
    }

    private _determineItemType(item: IAdvancedSearchResult): Model.ResultItemType {
        let type = Model.ResultItemType;
        switch(true) {
            case this._isDocument(item):
                return type.Document;
            case this._isWeb(item):
                return type.Web;
            case this._isOneDrive(item):
                return type.OneDrive;
            case this._isListItem(item):
                return type.ListItem;
            case this._isImage(item):
                return type.Image;
            case this._isList(item):
                return type.List;
            case this._isFolder(item):
                return type.Folder;
            case this._isLibrary(item):
                return type.Library;
            case this._isPage(item):
                return type.Page;
            case this._isOneNote(item):
                return type.OneNote;
            default:
/*                 console.log(`Unknown Type: ${item.FileExtension}`);
                console.log(`IsDocument: ${item.IsDocument}`);
                console.log(`FileType: ${item.FileType}`);
                console.log(`IsContainer: ${item.IsContainer}`);
                console.log(`IsListItem: ${item.IsListItem}`);
                console.log(``); */
                return type.Unknown;
        }
    }

    private _isDocument(result: IAdvancedSearchResult): boolean {
        return result.IsDocument == "true" as any &&
               result.IsContainer == "false" as any && 
              (result.FileType || '').toLocaleLowerCase() !== 'aspx';
    }

    private _isImage(result: IAdvancedSearchResult): boolean {
        let imgs: string[] = ['gif','png','jpg','jpeg','tif','tiff','bmp'];     // Recognized image formats
        return  result.IsDocument == "false" as any &&
                !!result.FileType &&
                result.IsContainer == "false" as any &&
                result.IsListItem == "true" &&
                imgs.indexOf(result.FileType.toLowerCase()) !== -1;
    }

    private _isWeb(result: IAdvancedSearchResult): boolean {
        return  result.IsDocument == "false" as any && 
                result.IsContainer == "true" as any &&
                result.IsListItem === null &&
            ((
               !result.ListID &&
                result.FileExtension === null
            )
            || 
            (
                result.ListID &&
                result.FileExtension == 'aspx' &&
                result.FileType == 'aspx'
            ));
    }

    private _isList(result: IAdvancedSearchResult): boolean {
        return   this._isListOrLibrary(result) &&
                 result.OriginalPath.match(/.+\/Lists\/[^/]+\/[^/]+.aspx$/i) !== null;
    }

    private _isLibrary(result: IAdvancedSearchResult): boolean {
        return  this._isListOrLibrary(result) &&
                result.OriginalPath.match(/.+\/Forms\/[^/]+.aspx$/i) !== null;
    }

    private _isListOrLibrary(result: IAdvancedSearchResult): boolean {
        return  result.IsDocument == "false" as any &&
                result.FileType === "html" &&
                result.IsContainer == "false" as any &&
                result.IsListItem === null;                
    }

    private _isListItem(result: IAdvancedSearchResult): boolean {
        return  result.IsDocument == "false" as any &&
                result.IsContainer == "false" as any &&
                result.IsListItem == "true" &&
                result.Filename.toLocaleLowerCase() === 'dispform.aspx';
    }

    private _isPage(result: IAdvancedSearchResult): boolean {
        return (result.FileType === "aspx" || 
                result.FileType === "html") &&
                result.IsContainer == "false" as any &&
                result.IsDocument == "true" as any;
    }

    private _isOneDrive(result: IAdvancedSearchResult): boolean {
        return  result.IsDocument == "false" as any &&
                result.FileType === null &&
                result.IsContainer == "true" as any &&
                result.IsListItem === null;
    }

    private _isFolder(result: IAdvancedSearchResult): boolean {
        return  result.IsDocument == "false" as any &&
                result.IsContainer == "true" as any &&
                result.IsListItem === null &&
                result.FileExtension === null &&
              !!result.ListID &&
               !result.ServerRedirectedURL &&
              !!result.ParentLink;
    }

    private _isOneNote(result: IAdvancedSearchResult): boolean {
        return  result.IsDocument == "false" as any &&
                result.IsContainer == "true" as any &&
                result.IsListItem === null &&
              !!result.ListID &&
              !!result.ServerRedirectedURL;
    }

}