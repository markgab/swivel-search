import * as React from 'react';
import styles from './ResultsInterface.module.scss';
import {
    DetailsList,
    DetailsListLayoutMode,
    Selection,
    SelectionMode,
    IColumn,
    IObjectWithKey,
    IDetailsRowProps,
    ISelectionOptions
} from 'office-ui-fabric-react/lib/DetailsList';
import { 
    CommandBar, 
    ICommandBarProps,
    ICommandBarItemProps 
} from 'office-ui-fabric-react/lib/CommandBar';
import * as Model from '../../../model/AdvancedSearchModel';
import AdvancedSearchData, {
    IAdvancedSearchResult
} from '../../../model/AdvancedSearchData';
//import DebugPanel from './DebugPanel';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { 
    SearchResults, 
    SearchResult,
    Sort,
    SortDirection
} from '@pnp/sp';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { getFileTypeIconProps, initializeFileTypeIcons, FileIconType } from '@uifabric/file-type-icons';
import { uniq } from '@microsoft/sp-lodash-subset';
import ItemPropertiesPanel, {
    PageTypes
} from './ItemPropertiesPanel';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Label } from 'office-ui-fabric-react/lib/Label';
import OfficeURIHelper from '../../../helpers/OfficeURIHelper';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import stickybits from 'stickybits';
import { IDragDropContext } from 'office-ui-fabric-react/lib/utilities/dragdrop';

export interface IResultsInterfaceProps {
    isDebug: boolean;
    //config: Model.IResultsConfig;
    columns: Array<Model.IResultProperty>;
    searchQuery: string;
    context: WebPartContext;
    rowLimit: number;
    sort?: Sort;
}

export interface IResultInterfaceState {
    //config: Model.IResultsConfig;
    items: ICommandBarItemProps[];
    overflowItems: ICommandBarItemProps[];
    faritems: ICommandBarItemProps[];
    searchQuery: string;
    results: SearchResult[];
    //currentPage: number;
    //totalPages: number;
    //totalResults: number;
    columns: Model.IResultProperty[];
    spWebUrl: string;
    listID: string;
    listItemID: string;
    contentTypeId: string;
    itemPropPanelOpen: boolean;
    documentReaderOpen: boolean;
    documentReaderUrl: string;
    showLoading: boolean;
    sort?: Sort;
}

const ColumnDefaults: any = {
    
};

export default class ResultsInterface extends React.Component<IResultsInterfaceProps, IResultInterfaceState> {
    constructor(public props: IResultsInterfaceProps) {
        super(props);
        
        this.searchData = new AdvancedSearchData(props.context, props.columns);
        this.searchData.rowLimit = props.rowLimit;
        this.searchData.bench();
        initializeFileTypeIcons();
        //this._closePanelRedirectUrl = `${this.props.context.pageContext.web.absoluteUrl}/siteassets/advanced-search-webpart-close-panel.aspx`;
        let cols = uniq<Model.IResultProperty>([
            ...this._defaultColumns, 
            //...props.config.columns
            ...props.columns
        ]);

        console.log(cols);

        this.state = { 
            //config: props.config,
            items:[],
            overflowItems:[],
            faritems:[],
            searchQuery: props.searchQuery,
            results: [],
            //currentPage:0,
            //totalPages:0,
            //totalResults:0,
            columns: cols,
            spWebUrl: '',
            listID: '',
            listItemID: '',
            contentTypeId: '',
            itemPropPanelOpen: false,
            documentReaderOpen: false,
            documentReaderUrl: '',
            showLoading: !props.searchQuery,
            sort: props.sort
        };

        this._selection = new Selection({
            onSelectionChanged: () => {
                let selected: IAdvancedSearchResult = this._getSelectionDetails();
                let items = this.commandbarButtons(selected);
                let overflowItems = this.commandbarOverflowButtons(selected);
                this.setState({
                    ...this.state,
                    items,
                    overflowItems,
                    itemPropPanelOpen: false,
                    documentReaderOpen: false,
                });
            }
        } as ISelectionOptions);

        this._scrollParent = this._findScrollContainer(this.props.context.domElement);
        this._scrollParent.setAttribute('data-is-scrollable', 'true');

        if(props.searchQuery) {
            this.search(props);
        }

    }

    public searchData: AdvancedSearchData;
    public state: IResultInterfaceState;
    private _selection: Selection;
    private _scrollParent: HTMLElement;
    private _isFetchingItems: Boolean = false;
    //private _closePanelRedirectUrl: string;
    private _defaultColumns: Model.IResultProperty[] = [{
        key: 'FileType',
        name: 'File Type',
        sortable: false,
        type: Model.ResultPropertyValueType.String,
        headerClassName: 'DetailsListExample-header--FileIcon',
        className: 'DetailsListExample-cell--FileIcon',
        iconClassName: 'DetailsListExample-Header-FileTypeIcon',
        iconName: 'Page',
        isIconOnly: true,
        fieldName: 'FileType',
        minWidth: 20,
        maxWidth: 120,
        //onColumnClick: this._onColumnClick,
        onRender: (item: IAdvancedSearchResult) => {
            let web = this.props.context.pageContext.web.absoluteUrl;
            let type = Model.ResultItemType;

            switch(item.ResultItemType) {
                case type.List:
                    return <div title={item.ResultItemType} className={styles.mgCustomIcon}><img src={`${web}/_layouts/15/images/itgen.png?rev=45`} alt="SharePoint List" title="SharePoint List" /></div>;
                case type.Library:
                    return <div title={item.ResultItemType} className={styles.mgCustomIcon}><img src={`${web}/_layouts/15/images/itdl.png?rev=47`} alt="SharePoint Library" title="SharePoint Library" /></div>;
                case type.Web:
                    return <div title={item.ResultItemType} className={styles.mgCustomIcon}><img src={`https://static2.sharepointonline.com/files/fabric/assets/brand-icons/product/png/sharepoint_16x1_5.png`} alt="SharePoint Site" title="SharePoint Site or Web" /></div>;
                case type.OneDrive:
                    return <div title={item.ResultItemType} className={styles.mgCustomIcon}><img src={`https://static2.sharepointonline.com/files/fabric/assets/brand-icons/product/png/onedrive_16x1_5.png`} alt="OneDrive" title="OneDrive" /></div>;
                case type.ListItem:
                    //return <Icon iconName="CustomList" title="List Item" className={styles.mgCustomIcon} />;
                    return <div title={item.ResultItemType} className={styles.mgCustomIcon}><img src={'https://spoprod-a.akamaihd.net/files/fabric/assets/item-types/20/listitem.svg?refresh1'} alt={item.ResultItemType} title={item.ResultItemType} /></div>
                case type.Folder:
                    //return <Icon iconName="FabricFolder" title="Folder" className={styles.mgCustomIcon} />;
                    return <Icon title={item.ResultItemType} {...getFileTypeIconProps({ type: FileIconType.folder})} />;
                case type.OneNote:
                    return <div title={item.ResultItemType} className={styles.mgCustomIcon}><img src={'https://spoprod-a.akamaihd.net/files/fabric/assets/item-types/20/one.svg?refresh1'} alt={item.ResultItemType} title={item.ResultItemType} /></div>
                case type.Page:
                case type.Document:
                default:
                    return <Icon title={item.ResultItemType} {...getFileTypeIconProps({extension: item.FileType, size: 20})} />;
            }
/* 
            if (this._isListOrLibrary(item)) {
                if(this._isList(item)) {
                    return <div className={styles.mgCustomIcon}><img src={`${web}/_layouts/15/images/itgen.png?rev=45`} alt="SharePoint List" title="SharePoint List" /></div>;
                } else {
                    return <Icon iconName="DocLibrary" title="Document Library" className={styles.mgCustomIcon} />;
                }
            } else if (this._isWeb(item)) {
                return <div className={styles.mgCustomIcon}><img src={`https://static2.sharepointonline.com/files/fabric/assets/brand-icons/product/png/sharepoint_16x1_5.png`} alt="SharePoint Site" title="SharePoint List or Library" /></div>;
            } else if (this._isOneDrive(item)) {
                return <div className={styles.mgCustomIcon}><img src={`https://static2.sharepointonline.com/files/fabric/assets/brand-icons/product/png/onedrive_16x1_5.png`} alt="OneDrive" title="SharePoint List or Library" /></div>;
            } else if (this._isListItem(item)) {
                return <Icon iconName="CustomList" title="List Item" className={styles.mgCustomIcon} />;
            } else {
                return <Icon {...getFileTypeIconProps({extension: item.FileType, size: 20})} />;             
            } */
        }
    },
    {
        key: 'TitleOrFilename',
        name: 'Name',
        sortable: true,
        type: Model.ResultPropertyValueType.String,
        fieldName: 'TitleOrFilename',
        minWidth: 100,
        onColumnClick: (e, column) => this.column_click(e, column),
        onRender: (item: IAdvancedSearchResult) => {
            return <div title={item.Title}>{item.TitleOrFilename}</div>;
        }
    }];

    public componentWillReceiveProps(nextProps: IResultsInterfaceProps): void {
        this.search(nextProps);
    }

    public componentDidUpdate(prevProps, prevState) : void {
        
      // commandBar
      let cBar = this.props.context.domElement.querySelector(`.${styles.commandBar}`);
      if(!cBar['sticky']) {
          cBar['sticky'] = true;
          stickybits(cBar, { 
              scrollEl: this._scrollParent,
              stickyBitStickyOffset: -10
          }
        );
      }
    }

    public render(): React.ReactElement<IResultsInterfaceProps> {
        return(
            <div className={styles.results}>
                <CommandBar 
                    items={this.state.items}
                    overflowItems={this.state.overflowItems} 
                    farItems={this.state.faritems}
                    className={styles.commandBar}
                />

                <div className={ this.state.results.length ? styles.hidden : '' }>
                    Your search returned zero matches.
                </div>
                <DetailsList
                    items={this.state.results}
                    compact={true}
                    columns={this.state.columns}
                    selectionMode={SelectionMode.single}
                    setKey="set"
                    layoutMode={DetailsListLayoutMode.justified}
                    isHeaderVisible={true}
                    selection={this._selection}
                    selectionPreservedOnEmptyClick={true}
                    //onItemInvoked={this._onItemInvoked}
                    enterModalSelectionOnTouch={true}
                    onRenderMissingItem={this._onRenderMissingItem}
                />
                <div className={ this.state.results.length ? styles.anchor : `${styles.anchor} ${styles.hidden}` }>
                    <div className={this.state.showLoading ? `${styles.pnlLoading} ${styles.fadein}` : styles.pnlLoading } style={{ display: this.state.showLoading ? 'flex' : 'none' }} > {/* */}
                        <div className={styles.loading}>
                            <Label>Loading ...</Label>
                            <Spinner size={SpinnerSize.large} />
                        </div>
                    </div>
                </div>
{/* 
                <DebugPanel 
                    searchQuery={this.state.searchQuery} 
                    isDebug={this.props.isDebug} 
                /> */}

                <ItemPropertiesPanel
                    PageType={PageTypes.ViewForm}
                    SPWebUrl={this.state.spWebUrl}
                    ListID={this.state.listID}
                    ListItemID={this.state.listItemID}
                    ContentTypeId={this.state.contentTypeId}
                    SPWebUrlLocal={this.props.context.pageContext.web.absoluteUrl}                    
                    isOpen={this.state.itemPropPanelOpen}
                    onDismiss={() => this.itemPropertiesPanel_dismiss()}
                    type={PanelType.medium}
                    isLightDismiss={true}>
                </ItemPropertiesPanel>

                <Panel
                    type={PanelType.smallFluid}
                    isOpen={this.state.documentReaderOpen}
                    className={styles.readerPanel}
                    onDismiss={() => this.documentReaderPanel_dismiss()}>
                    <div>
                        <iframe
                            className={styles.frmDocumentReader} 
                            src={this.state.documentReaderUrl} 
                            frameBorder={0}></iframe>
                    </div>
                </Panel>
            </div>
        );
    }

    protected search(props: IResultsInterfaceProps): Promise<any> {

        return this.searchData.search(props.searchQuery).then((res: SearchResults) => {

            let totalPages = 0;
            let currentPage = 0;
            let totalRows = 0;
            let results: IAdvancedSearchResult[] = [];
            let columns: Array<Model.IResultProperty>;
            
            if( res && 
                res.RawSearchResults && 
                res.RawSearchResults.PrimaryQueryResult && 
                res.TotalRows !== 0) {
                    totalRows = res.TotalRows; 
                    totalPages = Math.ceil(res.TotalRows / this.props.rowLimit);
                    results = [ ...res.PrimarySearchResults as any];

                    results.forEach(result => {
                        this._rowIdentity(result);
                    });
                    results.push(null);

                    let colTypes: Model.IResultPropertyDef[] = res.RawSearchResults.PrimaryQueryResult.RelevantResults.Table.Rows[0].Cells as any;

                    columns = this._buildColumnConfig(colTypes);

                    currentPage = 1;

            }

            //console.log('totalrows: ', totalRows);
            //console.log('rowlimit: ', this.props.rowLimit);
            //console.log('currpage: ', this.searchData.page);
            //console.log('totpages: ', totalPages);
            console.log('result count: ', results.length);

            return this.setState({
                ...this.state,
                searchQuery: props.searchQuery,
                results: results,
                //currentPage: currentPage,
                //totalPages: totalPages,
                //totalResults: totalRows,
                showLoading: false,
                faritems: [this.resultCountLabel(totalRows)],
                columns: columns
            } as IResultInterfaceState);

        });

    }

    protected documentReaderPanel_dismiss(): void {
        let newState: IResultInterfaceState = {
            ...this.state,
            documentReaderOpen: false
        };

        this.setState(newState);
    }

    protected detailsList_RenderMissingItems(index?: number, rowProps?: IDetailsRowProps): React.ReactNode {
        console.log('missing items', index);
        return null;
    }

    protected itemPropertiesPanel_dismiss(): void {
        let newState: IResultInterfaceState = {
            ...this.state,
            itemPropPanelOpen: false,
            spWebUrl: '',
            listID: '',
            listItemID: '',
            contentTypeId: ''
        };

        this.setState(newState);
    }

    protected column_click(ev: React.MouseEvent<HTMLElement>, column: IColumn): void {
        console.log('click', ev, column);
    }

    protected btnCommandbar_click(e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>, btn: ICommandBarItemProps): void {
        let action: string = btn.key;
        let selected: IAdvancedSearchResult = this._getSelectionDetails();
        let newState = {
            ...this.state
        } as IResultInterfaceState;

        switch(action) {
            case 'view':
                console.log(action, selected);
                newState.documentReaderOpen = true;
                newState.documentReaderUrl = selected.ServerRedirectedEmbedURL;
                break;
            case 'edit':
                console.log(action, selected);
                window.open(selected.ServerRedirectedURL);
                break;
            case 'go':
                window.open(selected.OriginalPath);
                break;
            case 'opencontainer':
                window.open(selected.ParentLink);
                break;
            case 'viewproperties':
                newState.itemPropPanelOpen = true;
                newState.spWebUrl = selected.SPWebUrl;
                newState.listID = selected.ListID;
                newState.listItemID = selected.ListItemID;
                newState.contentTypeId = selected.ContentTypeId;
                break;
            case 'clientopen':
                let url = OfficeURIHelper.getAbbreviatedOpenInClientURI(selected.OriginalPath);
                window.location.href = url;
                break;
            case 'download':
                let dl = selected.OriginalPath + '?Web=0';
                window.location.href = dl;
                break;
            case 'log':
                console.log(JSON.stringify(selected));
                break;
            default:
                break;

        }

        this.setState(newState);
    }


    protected handleFrameEvents(): void {
        //this._dialogHelper.activateCancelButtons();
    }


    private _buildColumnConfig(colTypes: Model.IResultPropertyDef[]): Array<Model.IResultProperty> {
        var columns = [
            ...this.state.columns
        ];

        columns.forEach((col, idx, cols) => {
            if(!col.type) {
                let colType = colTypes.filter((type) => {    
                    return type.Key === col.fieldName; 
                });
                if(colType.length === 0) { return; }
                col.type = colType[0].ValueType;
                cols[idx] = this._applyResultPropertyDefaults(col);
            }
        });

        return columns;

    }

    private _applyResultPropertyDefaults(colConfig: Model.IResultProperty): Model.IResultProperty {
        let typeDefaults: any = {};

        switch(colConfig.type) {
            case Model.ResultPropertyValueType.DateTime:
                typeDefaults = {
                    onRender: (item: IAdvancedSearchResult) => {
                      return this._formatDate(item[colConfig.fieldName] as string);
                    }
                };
                break;
            case Model.ResultPropertyValueType.Boolean:
                typeDefaults = {
                    onRender: (item: IAdvancedSearchResult) => {
                        return this._formatBool(item[colConfig.fieldName] as string);
                    }
                };
                break;
        }

        return {
            ...ColumnDefaults,
            ...typeDefaults,
            ...colConfig
        } as Model.IResultProperty;
    }

    private _formatDate (isoDate: string): string {
        return (new Date(isoDate)).toLocaleDateString();
    }

    private _formatBool (bool: string): string {
        if(bool === 'true'){
            return 'Yes';
        }
        else {
            return 'No';
        }
    }

    private _getSelectionDetails(): IAdvancedSearchResult {
        
        const selectionCount = this._selection.getSelectedCount();
    
        switch (selectionCount) {
          case 1:
            return this._selection.getSelection()[0] as IAdvancedSearchResult;
          default:
          return null;
        }
    }

    private commandbarButtons(result: IAdvancedSearchResult): ICommandBarItemProps[] {
        let items: ICommandBarItemProps[] = [];
        let type = Model.ResultItemType;

        if(!result) { return items; }

        if(result.ResultItemType === type.Page ||
           result.ResultItemType === type.OneDrive) {
            items.push({
                key: 'go',
                name: 'Go',
                iconProps: {
                    iconName: 'Generate'
                },
                onClick: (e, btn) => this.btnCommandbar_click(e, btn)
            });
        } else if(result.IsDocument == "true" as any) {
            let subItems: Array<IContextualMenuItem> = [
                {
                    key: 'view',
                    name: 'View',
                    iconProps: {
                        iconName: 'View'
                    },
                    onClick: (e, btn) => this.btnCommandbar_click(e, btn)                             
                }
            ];
            if(result.ServerRedirectedURL) {
                subItems.push({
                        key: 'edit',
                        name: 'Edit',
                        iconProps: {
                            iconName: 'PageEdit'
                        },
                        onClick: (e, btn) => this.btnCommandbar_click(e, btn)
                    });
                console.log(subItems);
            }
            items.push({
                key: 'open',
                name: 'Open',
                split: true,
                iconProps: {
                    iconName: 'OpenFile'
                },
                href: 'https://news.google.com',
                ['data-automation-id']: 'opendocument',
                subMenuProps:{
                    items: subItems
                }
            });
        }

        switch (result.ResultItemType) {
            case type.ListItem:
            case type.Document:
            case type.Folder:
                items.push({
                    key: 'viewproperties',
                    name: 'Properties',
                    iconProps: {
                        iconName: 'CustomList'
                    },
                    onClick: (e, btn) => this.btnCommandbar_click(e, btn)
                });
        }
/*         if(result.ListID && result.SPWebUrl && result.ListItemID) {
            items.push({
                key: 'viewproperties',
                name: 'Properties',
                iconProps: {
                    iconName: 'CustomList'
                },
                onClick: (e, btn) => this.btnCommandbar_click(e, btn)
            });
        } */

        if(result.ParentLink) {
            items.push({
                key: 'opencontainer',
                name: 'Open Container',
                iconProps: {
                    iconName: 'FolderOpen'
                },
                onClick: (e, btn) => this.btnCommandbar_click(e, btn)
            });
        }
        
        return items;
    }



    private _rowIdentity(result: IAdvancedSearchResult): void {
        if(result.IsDocument == "true" as any) {
            result.TitleOrFilename = result.Filename || result.Title;
        } else {
            result.TitleOrFilename = result.Title;
        }
    }

    private commandbarOverflowButtons(result: IAdvancedSearchResult): ICommandBarItemProps[] {
        let items: ICommandBarItemProps[] = [];
        
        if(!result) { return items; }

        if(result.IsDocument == "true" as any) {
            
            if(OfficeURIHelper.isOfficeDocument(result.OriginalPath)) {
                items.push({
                    key: 'clientopen',
                    name: 'Open in Client',
                    iconProps: {
                        iconName: 'DocumentReply'
                    },
                    onClick: (e, btn) => this.btnCommandbar_click(e, btn)
                });
            }

            items.push({
                key: 'download',
                name: 'Download',
                iconProps: {
                    iconName: 'Download'
                },
                onClick: (e, btn) => this.btnCommandbar_click(e, btn)
            });
        }

        items.push({
            key: 'log',
            name: 'Log',
            iconProps: {
                iconName: 'M365InvoicingLogo'
            },
            onClick: (e, btn) => this.btnCommandbar_click(e, btn)
        })

        return items;

    }

    private resultCountLabel(resultCount: number): ICommandBarItemProps {
        
        return {
            key: 'matches',
            name: `Matches: ${resultCount}`,
            className: `${styles.commandbarLabelItem}`,
            disabled: true
        } as ICommandBarItemProps;

    }

    private _findScrollContainer (element: HTMLElement): HTMLElement {
        if (!element) {
          return undefined;
        }
      
        let parent = element.parentElement;
        while (parent) {
          const { overflow } = window.getComputedStyle(parent);
          if (overflow.indexOf('auto') !== -1 || overflow.indexOf('scroll') !== -1) {
            return parent;
          }
          parent = parent.parentElement;
        }
      
        return document.documentElement;
      }
    
      private _onRenderMissingItem = (index: number): null => {
        
        if(this.searchData.totalRows <= this.state.results.length) {
            return null;
        }
    
        if (!this._isFetchingItems) {
          this._isFetchingItems = true;

            let resultsCopy = [...this.state.results];
            
            this.searchData.getPage(this.searchData.page + 1).then((res: SearchResults) => {
                if(!res || !res.PrimarySearchResults) {
                    return;
                }

                let results: IAdvancedSearchResult[] = res.PrimarySearchResults as any;
                
                results.forEach(result => {
                    this._rowIdentity(result);
                });

                resultsCopy.pop();
                resultsCopy = resultsCopy.concat(res.PrimarySearchResults);
                resultsCopy.push(null);
                this.setState({
                    ...this.state,
                  results: resultsCopy
                } as IResultInterfaceState, () => {
                    this._isFetchingItems = false;
                });
            });
        }
        return null;
      }

}