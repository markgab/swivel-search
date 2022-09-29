import * as React from 'react';
import styles from './SwivelSearchResults.module.scss';
import ResultsInterface from './ResultsInterface';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import * as Model from '../../../model/AdvancedSearchModel';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

export interface ISwivelSearchResultsProps {
  onConfigure: () => void;
  needsConfiguration: boolean;
  isDebug: boolean;
  includeIdentityColumn: boolean;
  columns: Array<Model.IResultProperty>;
  searchQuery: string;
  context: WebPartContext;
  rowLimit: number;
}

export interface IAdvancedSearchResultsState {
  searchQuery: string;
  
}

export default class SwivelSearchResults extends React.Component<ISwivelSearchResultsProps, IAdvancedSearchResultsState> {
  constructor(props: ISwivelSearchResultsProps) {
    super(props);

    this.state = {
      searchQuery: this.props.searchQuery
    };
  }
  
  public state: IAdvancedSearchResultsState;
  protected placeholder;

  public componentWillReceiveProps(nextProps: ISwivelSearchResultsProps): void {
    this.setState({
      ...this.state,
      searchQuery: nextProps.searchQuery
    });
  }

  public async componentDidMount(): Promise<any> {
    if(!this.props.needsConfiguration) {
      return;
    }

    const { Placeholder } = await import (
      /* webpackChunkName: 'pnp-spfx-controls-react-placeholder' */
      '@pnp/spfx-controls-react/lib/Placeholder'
    );

    this.placeholder = Placeholder;

    this.forceUpdate();

  }

  public render(): React.ReactElement<ISwivelSearchResultsProps> {
    const { needsConfiguration, onConfigure } = this.props;
    const Placeholder = this.placeholder;

    return (
      <div className={styles.swivelSearchResults}>
        { needsConfiguration && Placeholder && 
          <Placeholder
            iconName='Edit'
            iconText='Configure your web part'
            description='Please configure the web part.'
            buttonLabel='Configure'
            onConfigure={onConfigure} 
          />
        }
        { needsConfiguration && !Placeholder &&
          <div className={styles.loading}>
            <Spinner size={SpinnerSize.large} />
          </div>
        }
        { !needsConfiguration && 
          <ResultsInterface 
            includeIdentityColumn={ this.props.includeIdentityColumn }
            columns={ this.props.columns }
            searchQuery={this.state.searchQuery} 
            context={this.props.context}
            isDebug={this.props.isDebug}
            rowLimit={this.props.rowLimit}
          />
        }
      </div>
    );
  }
}
