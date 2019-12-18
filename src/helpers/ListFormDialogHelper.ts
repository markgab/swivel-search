//import * as $ from 'jquery';
import { PromotedState } from '@pnp/sp';

export default class ListFormDialogHelper {
    constructor(private fnctCloseDialog: Function) {

    }

    private _resolve: Function;

/*     public activateCancelButtons(): void {
        $(this._frameDoc).on('click', 'input[type="button"][value="Close"],input[type="button"][value="Cancel"]', e => this.onClose_click(e));
    } */

    public ensureDialogFriendlyPage(frame: HTMLIFrameElement): void {
        let loc = frame.getAttribute('src');
        if(loc && this.isPageClassic(frame) && loc.toLowerCase().indexOf('&isdlg=1') === -1) {
            frame.setAttribute('src', loc + '&isDlg=1');
        }
    }

    public isPageClassic(frame: HTMLIFrameElement): boolean {
        const frameDoc = frame.contentDocument;
        //return $('#s4-workspace', frameDoc).length > 0;
        return frameDoc.getElementById('s4-workspace') !== null;
    }

    protected onClose_click(e): void {
        console.log('close');
        this.fnctCloseDialog();
    }

    
}