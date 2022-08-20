import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
} from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle,
  PropertyPaneChoiceGroup
} from '@microsoft/sp-property-pane';
import { ISearchProperty, PropertyValueType, SearchApi, IAdvancedSearchConfig, SearchOperator } from '../../model/AdvancedSearchModel';
import * as strings from 'SwivelSearchWebPartStrings';
import SwivelSearch from './components/SwivelSearch';
import { ISwivelSearchProps } from './components/ISwivelSearchProps';
import { IDynamicDataPropertyDefinition } from '@microsoft/sp-dynamic-data';
import ManagedPropertyPicker from '../../components/ManagedPropertyPicker';
import AdvancedSearchData from '../../model/AdvancedSearchData';
import { globalsSetup } from '../../model/SwivelSearchGlobals';

import { TextField, ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import { 
  Dropdown,  
  IDropdownOption, 
  IDropdownProps
} from 'office-ui-fabric-react/lib/Dropdown';

export interface ISwivelSearchWebPartProps {
  searchApi: SearchApi;
  searchConfig: Array<ISearchProperty>;
  addCriteria: string;
  includeKeywordSearch: boolean;
  startMinimized: boolean;
  rowLimit: number;
  isDebug: boolean;
}

const searchQueryDynamicPropertyId = 'search-query';
const searchQueryDynamicPropertyLabel = 'Search Query';

export default class SwivelSearchWebPart extends BaseClientSideWebPart<ISwivelSearchWebPartProps> {

  protected onInit(): Promise<void> {
    return super.onInit().then(_ => {

      this.data = new AdvancedSearchData(this.context, []);
      this.properties.isDebug = true;
      globalsSetup(this.data);

      // register this web part as dynamic data source
      this.context.dynamicDataSourceManager.initializeSource(this);

      this.properties.searchConfig = this.properties.searchConfig || [];
      console.log(JSON.stringify(this.properties.searchConfig));
      this._indexProperties();
    });
  }

  public searchConfig: IAdvancedSearchConfig;

  public data: AdvancedSearchData;

  /**
   * Currently submitted search query
   */
  private _searchQuery: string;
  private _propertyFieldCollectionData;
  private _customCollectionFieldType;
  private _propertyPanePropertyEditor;
  private _propertPaneWebPartInformation;

  /**
   * Return list of dynamic data properties that this dynamic data source
   * returns
   */
  public getPropertyDefinitions(): ReadonlyArray<IDynamicDataPropertyDefinition> {
    return [
      {
        id: searchQueryDynamicPropertyId,
        title: searchQueryDynamicPropertyLabel
      }
    ];
  }

  /**
   * Return the current value of the specified dynamic data set
   * @param propertyId ID of the dynamic data set to retrieve the value for
   */
  public getPropertyValue(propertyId: string): string {
    switch (propertyId) {
      case searchQueryDynamicPropertyId:
        return this._searchQuery;
    }

    throw new Error('Bad property id');
  }

  /**
   * Web part native render method
   */
  public render(): void {

    this._indexProperties();
    const element: React.ReactElement<ISwivelSearchProps> = React.createElement(
      SwivelSearch,
      <ISwivelSearchProps> {
        config: this._deepCopyConfig(this.properties.searchConfig),
        isDebug: this.properties.isDebug,
        context: this.context,
        startMinimized: this.properties.startMinimized,
        searchHandler: (searchQuery) => this.search(searchQuery),
        includeKeywordSearch: this.properties.includeKeywordSearch,
        parentElement: this.domElement,
        additionalCriteria: this.properties.addCriteria
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

    const { PropertyPaneWebPartInformation } = await import (
      /* webpackChunkName: 'pnp-propcontrols-webpartinformation' */
      '@pnp/spfx-property-controls/lib/PropertyPaneWebPartInformation'
    );

    this._propertyFieldCollectionData = PropertyFieldCollectionData;
    this._customCollectionFieldType = CustomCollectionFieldType;
    this._propertyPanePropertyEditor = PropertyPanePropertyEditor;
    this._propertPaneWebPartInformation = PropertyPaneWebPartInformation;

  }

  protected search(searchQuery:string): void {
    this._searchQuery = searchQuery;

    console.log('search query change', searchQuery);
    
    // notify subscribers that the selected event has changed
    this.context.dynamicDataSourceManager.notifyPropertyChanged(searchQueryDynamicPropertyId);
  }

  private _indexProperties() {
    if(this.properties.searchConfig) {
      this.properties.searchConfig.forEach((field: ISearchProperty, idx: number) => {
        field.propIndex = idx;
      });
    }
  }

  private _deepCopyConfig(config: Array<ISearchProperty>): ISearchProperty[] {
    let copy: ISearchProperty[] = [];

    config.forEach(p =>{
      copy.push({ ...p });
    });

    return copy;
  }

  protected onPropertyPaneConfigurationStart(): void {

  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);

    //console.log('Property Pane Change. Path: ', propertyPath);
    //console.log(newValue);

    this._indexProperties();
  }

  protected onDataType_change = (option: IDropdownOption, index?: number): void => {
    //console.log('change', option.text);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected get disableReactivePropertyChanges() {
    return true;
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
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneChoiceGroup('searchApi', { 
                  label: "Search Engine",
                  options: [{
                    text: "Microsoft Graph Search",
                    key: SearchApi.MicrosoftGraphSearch,
                  },{
                    text: "SharePoint Search",
                    key: SearchApi.SharePointSearch,
                  }]
                }),
                PropertyPaneToggle('includeKeywordSearch', {
                  label: strings.IncludeKeywordSearchLabel
                }),
                PropertyPaneToggle('startMinimized', {
                  label: strings.StartMinimizedLabel,
                  disabled: !this.properties.includeKeywordSearch
                }),
                this._propertPaneWebPartInformation({
                  description: `<p>To better configure the search web part, <a href="${this.context.pageContext.web.absoluteUrl}/_layouts/15/listmanagedproperties.aspx?level=site" target="_blank">review the search schema</a></p>`,
                  moreInfoLink: `https://docs.microsoft.com/en-us/sharepoint/manage-search-schema#create-a-new-managed-property`,
                  key: 'webPartInfoId'
                }),
                this._propertyFieldCollectionData('searchConfig', {
                    key: 'searchConfig',
                    enableSorting: true,
                    //label: 'Choose Result Columns',
                    panelHeader: 'Search Fields',
                    panelDescription: 'Select which search fields you wish to include.',
                    manageBtnLabel: 'Choose Search Fields',
                    value: this.properties.searchConfig,
                    fields: [{
                      id: 'name',
                      title: 'Column Display Name',
                      required: true,
                      type: this._customCollectionFieldType.string,
                    }, 
                    {
                      id: 'property',
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
                          key: PropertyValueType.Boolean,
                          text: 'Boolean',
                          value: PropertyValueType.Boolean
                        },
                        {
                          key: PropertyValueType.DateTime,
                          text: 'Date Time',
                          value: PropertyValueType.DateTime
                        },
                        {
                          key: PropertyValueType.Numeric,
                          text: 'Numeric',
                          value: PropertyValueType.Numeric
                        },
                        {
                          key: PropertyValueType.Person,
                          text: 'Person',
                          value: PropertyValueType.Person
                        },
                        {
                          key: PropertyValueType.String,
                          text: 'Text',
                          value: PropertyValueType.String
                        }
                      ]
                    },
                    {
                      id: 'operator',
                      title: 'Operator',
                      required: true,
                      type: this._customCollectionFieldType.custom,
                      onCustomRender: (field, value: SearchOperator, onUpdate, item: ISearchProperty, itemId) => {
                        let options: Array<IDropdownOption>;
                        switch(item.type) {
                          case PropertyValueType.DateTime:
                              options = [{
                                  key: SearchOperator.DateRange,
                                  text: 'Date Range',
                                  selected: true
                                }
                              ];
                              if(value !== SearchOperator.DateRange) {
                                onUpdate(field.id, SearchOperator.DateRange);
                              }
                            break;
                          case PropertyValueType.String:
                            options = [{
                                key: SearchOperator.Equals,
                                text: 'Equals'
                              },
                              {
                                key: SearchOperator.Contains,
                                text: 'Contains'
                              }
                            ];
                            break;
                          case PropertyValueType.Double:
                          case PropertyValueType.Int32:
                          case PropertyValueType.Int64:
                          case PropertyValueType.Numeric:
                            options = [{
                              key: SearchOperator.NumberRange,
                              text: 'Number Range'
                            },
                            {
                              key: SearchOperator.Equals,
                              text: 'Equals'
                            }];
                            break;
                          default: 
                            options = [{
                                key: SearchOperator.Equals,
                                text: 'Equals',
                                selected: true
                              }
                            ];
                            if(value !== SearchOperator.Equals) {
                              onUpdate(field.id, SearchOperator.Equals);
                            }
                            break;
                        }

                        return (
                          React.createElement(Dropdown, <IDropdownProps> {
                            options: options,
                            selectedKey: value,
                            onChanged: (option: IDropdownOption, index?: number): void => {
                              onUpdate(field.id, option.key);
                            } 
                          })
                        );
                      }
                    },
                    {
                      id: 'choices',
                      title: 'Choices',
                      type: this._customCollectionFieldType.custom,
                      onCustomRender: (field, val: string, onUpdate, item: ISearchProperty, itemId) => {
                        let disabled: boolean = false;
                        let { type, operator } = item; 
                        if(type === PropertyValueType.DateTime || 
                           type === PropertyValueType.Boolean  ||
                           type === PropertyValueType.Person   || 
                           operator === SearchOperator.NumberRange) {
                          disabled = true;
                        }
                        return (
                          React.createElement(TextField, <ITextFieldProps> {
                            multiline: true,
                            disabled: disabled,
                            value: val || "",
                            onChanged: (newValue: any): void => {
                              onUpdate(field.id, newValue);
                            }
                          })
                        );
                      }
                    }
                  ]
                }),
                PropertyPaneTextField('addCriteria', {
                  label: strings.AddCriteriaFieldLabel,
                  description: strings.AddCriteriaFieldDesc,
                  multiline: true
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
