import * as Model from '../../../model/AdvancedSearchModel';
import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface ISwivelSearchProps {
  //config: Array<Model.ISearchProperty>;
  //isDebug: boolean;
  //context: WebPartContext;
  searchHandler: Function;
  //includeKeywordSearch: boolean;
  parentElement: HTMLElement;
  //startMinimized: boolean;
  //additionalCriteria: string;
}

export interface ISwivelSearchState {
  searchQuery: string;
}
