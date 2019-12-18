import * as React from 'react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

import { 
    Panel, 
    PanelType,
    IPanelProps
} from 'office-ui-fabric-react/lib/Panel';
import styles from './ItemPropertiesPanel.module.scss';
import { on } from '../../../helpers/events';

export interface IItemPropertiesPanelProps extends IPanelProps {
    SPWebUrlLocal: string;
    SPWebUrl?: string;
    ListID?: string;
    ListItemID?: string;
    ContentTypeId?: string;
    PageType: PageTypes;
}

export interface IItemPropertiesPanelState {
    isOpen: boolean;
    viewPanelUrl: string;
    loadingPanelHideClass: string;
}

export enum PageTypes {
    ListView = 0,
    ViewForm = 4,
    EditForm = 6,
    NewForm = 8
}

export default class ItemPropertiesPanel extends React.Component<IItemPropertiesPanelProps> {
    constructor(props: IItemPropertiesPanelProps) {
        super(props);
        this._listenForClosePanelEvent();
        this._closePanelRedirectUrl = `${this.props.SPWebUrlLocal}/siteassets/advanced-search-webpart-close-panel.aspx`;
        this.state = {
            isOpen: this.props.isOpen,
            viewPanelUrl: '',
            loadingPanelHideClass: styles.frmPropsLoading
        };
    }

    public state: IItemPropertiesPanelState;
    private _closePanelRedirectUrl: string;

    public render(): React.ReactElement<IItemPropertiesPanelProps> {
        return (
            <div className={ styles.ItemPropertiesPanel }>
                <Panel {...this.props }
                    isOpen={this.state.isOpen}
                    type={PanelType.medium}
                    className={styles.panel}
                    isLightDismiss={true}
                    onDismiss={() => this.viewPanel_dismiss()}>
                    <div className={styles.frmPropsAnchor} style={{}}>
                        <div className={this.state.loadingPanelHideClass}>
                            <Spinner size={SpinnerSize.large} />
                        </div>
                        <iframe
                            src={this.state.viewPanelUrl} 
                            className={`${styles.frmViewPanel} mg-results-form-dialog`}
                            frameBorder={0}
                            onLoad={e => this.panelFrame_load(e)} 
                        />
                    </div>
                </Panel>
            </div>
        );
    }

    public componentWillReceiveProps(nextProps: IItemPropertiesPanelProps): void {
        const newState: IItemPropertiesPanelState = {
            ...this.state,
            viewPanelUrl: this._listFormUrl(nextProps),
            isOpen: nextProps.isOpen
        };

        if(newState.isOpen !== this.state.isOpen === true) {
            newState.loadingPanelHideClass = styles.frmPropsLoading;
        }

        this.setState(newState);
    }

    protected panelFrame_load(e: React.SyntheticEvent<HTMLIFrameElement>): void {
        let frm: HTMLIFrameElement = e.currentTarget;
        if(this._ensureDialogFriendlyPage(frm)) {
            this._showLoadingPanel(false);
            this._activateCancelButtons(frm);
            this._override_commitPopup(frm);
            this._override_classicStyles(frm);
        }
    }


    protected viewPanel_dismiss(): void {
        this.props.onDismiss();
    }

    private _override_classicStyles(frame: HTMLIFrameElement): void {
        let doc = frame.contentDocument;
        let style = doc.createElement('style');
        style.innerText = `.BreadcrumbBar-list,.BreadcrumbBar,.od-ListForm-breadcrumb{display:none !important;}.od-SearchBox,.od-Search,.od-TopBar-search {display:none !important;}`;
        frame.contentDocument.body.appendChild(style);
    }

    private _override_commitPopup(frame: HTMLIFrameElement): void {
        frame.contentWindow.frameElement['commitPopup'] = () => this.viewPanel_dismiss();
    }

    private _listFormUrl(props: IItemPropertiesPanelProps): string {
        let { SPWebUrl, PageType, ListID, ListItemID, ContentTypeId, isOpen } = props;

        if(isOpen) {
            return `${SPWebUrl}/_layouts/15/listform.aspx?PageType=${PageType}&ListID=${ListID}&ID=${ListItemID}&ContentTypeId=${ContentTypeId}&source=${encodeURIComponent(this._closePanelRedirectUrl)}`;
        } else {
            return '';
        }

    }

    private _showLoadingPanel(val: boolean): Promise<void> {
        const newState: IItemPropertiesPanelState = {
            ...this.state,
            loadingPanelHideClass: styles.frmPropsLoading
        };
        if(!val) {
            newState.loadingPanelHideClass = styles.frmPropsLoadingHidden;
        }
        return new Promise((resolve, reject) => {
            this.setState(newState, resolve);
        });
    }

    private _listenForClosePanelEvent(): void {
        window.addEventListener('mg-announce-close-panel', (e: any) => {
            if(e.detail.closePanel) {
                this.viewPanel_dismiss();
            }
        }, false);
    }

    private _ensureDialogFriendlyPage(frame: HTMLIFrameElement): boolean {
        let loc = frame.getAttribute('src') || '';
        if(this._isPageClassic(frame)) {
            if(loc.toLowerCase().indexOf('&isdlg=1') === -1) {
                frame.setAttribute('src', loc + '&isDlg=1');
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    private _activateCancelButtons(frame: HTMLIFrameElement): void {
        on(frame.contentDocument.body, 'click', 'input[type="button"][value="Close"],input[type="button"][value="Cancel"]', e => this.onClose_click(e));        
    }
    
    protected onClose_click(e): void {
        this.props.onDismiss();
    }


    private _isPageClassic(frame: HTMLIFrameElement): boolean {
        const frameDoc = frame.contentDocument;
        return frameDoc.getElementById('s4-workspace') !== null;
    }

}
