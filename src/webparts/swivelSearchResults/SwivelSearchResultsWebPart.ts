import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IWebPartPropertiesMetadata,
} from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  IPropertyPaneConditionalGroup,
  PropertyPaneTextField,
  PropertyPaneToggle,
  PropertyPaneDynamicField,
  DynamicDataSharedDepth,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption,
} from '@microsoft/sp-property-pane';
import * as Model from '../../model/AdvancedSearchModel';
import * as strings from 'SwivelSearchResultsWebPartStrings';
import SwivelSearchResults, { ISwivelSearchResultsProps } from './components/SwivelSearchResults';
import { DynamicProperty } from '@microsoft/sp-component-base';
import { IDynamicDataSource } from '@microsoft/sp-dynamic-data';
import SearchSchemaHelper from '../../helpers/SearchSchemaHelper';
import ManagedPropertyPicker from '../../components/ManagedPropertyPicker';
import { SortDirection } from '@pnp/sp/search';

const defaultSortProperties: Array<string> = [
  'Rank'
];

export interface ISwivelSearchResultsWebPartProps {
  includeIdentityColumn: boolean;
  isDebug: boolean;
  rowLimit: number;
  columns: Array<Model.IResultProperty>;
  searchQuery: DynamicProperty<string>;
  sortProperty: string;
  sortDirection: SortDirection;
}

export default class SwivelSearchResultsWebPart extends BaseClientSideWebPart<ISwivelSearchResultsWebPartProps> {

  public resultsConfig: Model.IResultsConfig;
  public searchSchemaHelper: SearchSchemaHelper;
  private _propertyFieldCollectionData;
  private _customCollectionFieldType;
  private _propertyPanePropertyEditor;

  public async onInit(): Promise<void> {
    await super.onInit();

    this.properties.isDebug = true;

    this.searchSchemaHelper = new SearchSchemaHelper(
      document.location.origin,
      this.context.pageContext.web.serverRelativeUrl, 
      this.context.spHttpClient
    );

  }

  private _sortableProperties: Array<IPropertyPaneDropdownOption> = [];

  public render(): void {
    //this.resultsConfig = this._parseConfig(this.properties.resultsConfig);
    const searchQuerySource: IDynamicDataSource | undefined = this.properties.searchQuery.tryGetSource();
    const searchQuery: string | undefined = this.properties.searchQuery.tryGetValue();
    const needsConfiguration: boolean = (!searchQuerySource && !searchQuery) || !this.properties.columns;

    const element: React.ReactElement<ISwivelSearchResultsProps> = React.createElement(
      SwivelSearchResults,
      {
        needsConfiguration: needsConfiguration,
        onConfigure: () => this._onConfigure(),
        isDebug: this.properties.isDebug,
        rowLimit: this.properties.rowLimit,
        includeIdentityColumn: this.properties.includeIdentityColumn,
        columns: this.properties.columns,
        searchQuery: searchQuery,
        context: this.context,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  //executes only before property pane is loaded.
  protected async loadPropertyPaneResources(): Promise<void> {
    // import additional controls/components

    const { PropertyFieldCollectionData, CustomCollectionFieldType } = await import (
      /* webpackChunkName: 'pnp-propcontrols-colldata' */
      '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData'
    );
    
    const { PropertyPanePropertyEditor } = await import (
      /* webpackChunkName: 'pnp-propcontrols-propeditor' */
      '@pnp/spfx-property-controls/lib/PropertyPanePropertyEditor'
    );

    this._propertyFieldCollectionData = PropertyFieldCollectionData;
    this._customCollectionFieldType = CustomCollectionFieldType;
    this._propertyPanePropertyEditor = PropertyPanePropertyEditor;
  }

  /**
   * Event handler for clicking the Configure button on the Placeholder
   */
  private _onConfigure = (): void => {
    this.context.propertyPane.open();
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected updateSortableProperties(): void {
    let props = [  
      ...defaultSortProperties
    ];
    if(this.properties.columns) {
      let custProps = this.properties.columns.filter(prop => {
        return prop.sortable === true;
      }).map(prop => prop.name);
      props = [
        ...defaultSortProperties,
        ...custProps
      ].sort();
    }
    this._sortableProperties = props.map(prop => {
      return <IPropertyPaneDropdownOption> {
        text: prop,
        key: prop
      };
    });
  }

  protected get propertiesMetadata(): IWebPartPropertiesMetadata {
    return {
      // Specify the web part properties data type to allow the address
      // information to be serialized by the SharePoint Framework.
      'searchQuery': {
        dynamicPropertyType: 'string'
      }
    } as any as IWebPartPropertiesMetadata;
  }

  protected onPropertyPaneConfigurationStart(): void {
    this.updateSortableProperties();
    this.context.propertyPane.refresh();
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);

    this.updateSortableProperties();
    this.context.propertyPane.refresh();
  }
  
  protected managedPropertyValidation(value: any, index: number, crntItem: any): Promise<string> {
    return this.searchSchemaHelper.managedPropertyExists(value).then((exists: boolean) => {
      return exists ? '' : `That managed property does not exists`;
    });
  }

  protected get disableReactivePropertyChanges() {
    return true;
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              primaryGroup: {
                groupName: 'Search Query Source',
                groupFields: [
                  PropertyPaneTextField('searchQuery', {
                    label: strings.SearchQueryFieldLabel
                  })
                ]
              },
              secondaryGroup: {
                groupName: 'Search Query Source',
                groupFields: [
                  PropertyPaneDynamicField('searchQuery', {
                    label: strings.SearchQueryFieldLabel
                  })
                ],                
                sharedConfiguration: {
                  // because address and city come from the same data source
                  // the connection can share the selected dynamic property
                  depth: DynamicDataSharedDepth.Property
                }
              },
              showSecondaryGroup: !!this.properties.searchQuery.tryGetSource()
            } as IPropertyPaneConditionalGroup,
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneToggle('includeIdentityColumn', {
                  label: 'First Column is Filename or Title'
                }),
                this._propertyFieldCollectionData('columns', {
                    key: 'resultsConfig',
                    enableSorting: true,
                    //label: 'Choose Result Columns',
                    panelHeader: 'Result Columns',
                    manageBtnLabel: 'Choose Result Columns',
                    value: this.properties.columns,
                    fields: [{
                        id: 'name',
                        title: 'Column Display Name',
                        required: true,
                        type: this._customCollectionFieldType.string,
                      },
                      {
                        id: 'fieldName',
                        title: 'Managed Property',
                        required: true,
                        type: this._customCollectionFieldType.custom,
                        onCustomRender: (field, value, onUpdate, item, rowUniqueId) => {
                          return(
                            React.createElement(ManagedPropertyPicker, {
                              key: 'ac' + field.id,
                              context: this.context,
                              value: value || "",
                              onChanged: (e: React.ChangeEvent<HTMLInputElement>) => {
                                onUpdate(field.id, (<HTMLInputElement>e.target).value);
                              },
                              onSelect: (val: string) => {
                                onUpdate(field.id, val);
                              }
                            })
                          );
                        }
                      },
                      {
                        id: 'type',
                        title: 'Data Type',
                        required: true,
                        type: this._customCollectionFieldType.dropdown,
                        options: [
                          {
                            key: "Edm.String",
                            text: "Text"
                          },
                          {
                            key: "Edm.DateTime",
                            text: "DateTime"
                          },
                          {
                            key: "Edm.Number",
                            text: "Number"
                          },
                          {
                            key: "Edm.Boolean",
                            text: "Boolean"
                          }
                        ],
                      },
                      {
                        id: 'sortable',
                        title: 'sortable',
                        required: false,
                        type: this._customCollectionFieldType.boolean
                      }
                    ]
                  }
                ),
                /* PropertyPaneTextField('rowLimit', {
                  label: strings.RowLimitFieldLabel
                }), */
                PropertyPaneDropdown('sortProperty', {
                  options: this._sortableProperties,
                  label: 'Sort Property',
                }),
                PropertyPaneDropdown('sortDirection', {
                  options: [{
                    text: 'Ascending',
                    key: SortDirection.Ascending
                  },{
                    text: 'Descending',
                    key: SortDirection.Descending
                  }],
                  label: 'Sort Direction'
                })
                /* this._propertyPanePropertyEditor({
                  webpart: this,
                  key: 'propertyEditor'
                }) */
              ]
            }
          ]
        }
      ]
    };
  }
}
