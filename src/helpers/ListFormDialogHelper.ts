
export default class ListFormDialogHelper {
    constructor(private fnctCloseDialog: Function) {

    }

    private _resolve: Function;

    public ensureDialogFriendlyPage(frame: HTMLIFrameElement): void {
        const loc = frame.getAttribute('src');
        if(loc && this.isPageClassic(frame) && loc.toLowerCase().indexOf('&isdlg=1') === -1) {
            frame.setAttribute('src', loc + '&isDlg=1');
        }
    }

    public isPageClassic(frame: HTMLIFrameElement): boolean {
        const frameDoc = frame.contentDocument;
        return frameDoc.getElementById('s4-workspace') !== null;
    }

    protected onClose_click(e): void {
        this.fnctCloseDialog();
    }

    
}