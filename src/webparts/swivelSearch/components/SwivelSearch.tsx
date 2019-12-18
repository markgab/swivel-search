import * as React from 'react';
import styles from './SwivelSearch.module.scss';
import { ISwivelSearchProps, ISwivelSearchState } from './ISwivelSearchProps';
import { escape } from '@microsoft/sp-lodash-subset';

import SearchInterface, { ISearchInterfaceProps } from './SearchInterface';
import * as Model from '../../../model/AdvancedSearchModel';
import SearchQueryBuilder from '../../../helpers/SearchQueryBuilder';
import { WebPartContext } from '@microsoft/sp-webpart-base';

export default class SwivelSearch extends React.Component<ISwivelSearchProps, ISwivelSearchState> {
  
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: '',
      config: this.props.config
    };
  }

  public state: ISwivelSearchState;

  public componentWillReceiveProps(nextProps: ISwivelSearchProps): void {
    this.setState({
      ...this.state,
      config: nextProps.config
    });
  }

  public render(): React.ReactElement<ISwivelSearchProps> {
    return (
      <div className={ styles.swivelSearch }>
        <SearchInterface 
          config={this.props.config}
          searchHandler={(keywordSearch, searchModel, additionalCriteria) => this.search(keywordSearch, searchModel, additionalCriteria)} 
          includeKeywordSearch={this.props.includeKeywordSearch}
          parentElement={this.props.parentElement}
          startMinimized={this.props.startMinimized}
          additionalCriteria={this.props.additionalCriteria}
        />
      </div>
    );
  }


  protected search(keywordSearch: string, searchModel: Array<Model.ISearchProperty>, additionalCriteria: string): void {
  
    let query: string = SearchQueryBuilder.BuildSearchQueryString_Keyword(keywordSearch, searchModel, additionalCriteria);

    this.props.searchHandler(query);

  }

}
