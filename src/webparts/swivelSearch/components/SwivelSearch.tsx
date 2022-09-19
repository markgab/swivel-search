import * as React from 'react';
import styles from './SwivelSearch.module.scss';
import { ISwivelSearchProps, ISwivelSearchState } from './ISwivelSearchProps';
import SearchInterface from './SearchInterface';
import * as Model from '../../../model/AdvancedSearchModel';
import SearchQueryBuilder from '../../../helpers/SearchQueryBuilder';
import SwivelSearchGlobals from '../../../model/SwivelSearchGlobals';

export default class SwivelSearch extends React.Component<ISwivelSearchProps, ISwivelSearchState> {
  
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: '',
    };
  }

  public render(): React.ReactElement<ISwivelSearchProps> {
    return (
      <div className={ styles.swivelSearch }>
        <SearchInterface 
          searchHandler={(keywordSearch, controlValues) => this.search(keywordSearch, controlValues)} 
          parentElement={this.props.parentElement}
        />
        <div>{this.state.searchQuery}</div>
      </div>
    );
  }


  protected search(keywordSearch: string, controlValues: { [key: string]: any }): void {
  
    const { addCriteria, searchConfig } = SwivelSearchGlobals.propsSearchInterface;
    const query: string = SearchQueryBuilder.BuildSearchQueryString_Keyword(keywordSearch, searchConfig, controlValues, addCriteria);

    this.setState({
      searchQuery: query,
    });

    this.props.searchHandler(query);

  }

}
