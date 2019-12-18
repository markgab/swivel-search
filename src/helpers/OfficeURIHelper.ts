/*************************
 *  Author:      Mark Gabriel 
 *  Date:        6/4/2018
 *  Description: URI generator to conform with the
 *               office URI Schemes documented here
 *               https://msdn.microsoft.com/en-us/library/office/dn906146.aspx
 * 
 *************************/ 

/** Office URI Descriptors */
export enum Descriptor {
    U = "u",
    S = "s"
}

/** Office URI commands */
export enum Command {
    View = "ofv",
    Edit = "ofe",
    New = "nft"
}

/** Office URI Scheme Prefix */
export enum Scheme {
    Word = "ms-word:",
    PowerPoint = "ms-powerpoint:",
    Excel = "ms-excel:",
    Visio = "ms-visio:",
    Access = "ms-access:",
    Project = "ms-project:",
    Publisher = "ms-publisher:",
    Designer = "ms-spd:",
    InfoPath = "ms-infopath:"
}

export default class OfficeURIHelper {
    
    /**
     * Returns the Open Document in View Only Mode 
     * URI format. Example: ms-word:https://contoso.sharepoint.com/shared/document1.docx
     * @param docURL Absolute url to document https://contoso.sharepoint.com/shared/document1.docx
     */
    public static getAbbreviatedOpenInClientURI(docURL: string): string {
        let ext = this.getFileExtensionFromURL(docURL);
        let sch = this.getScheme(ext);

        return sch + docURL;

    }

    public static getEditInClientURI(docURL: string): string {
        // ms-powerpoint:ofe|u|https://www.fourthcoffee.com/AllHandsDeck.ppt
        let ext = this.getFileExtensionFromURL(docURL);
        let sch = this.getScheme(ext);
        return `${sch}${Command.Edit}|${Descriptor.U}|${docURL}`;
    }

    /**
     * Returns the file type extenion of the document, or the empty string if not found
     * @param docURL Url to document https://contoso.sharepoint.com/shared/document1.docx
     */
    public static getFileExtensionFromURL(docURL: string): string {
        let m = docURL.match(/[a-zA-Z0-1]{2,5}$/);

        if(m.length > 0) {
            return m[0].toLowerCase();
        } else {
            return '';
        }
    }

    /**
     * Returns the Office URI Scheme prefix associated with the given file extension
     * @param fileExtension File type extension of a document. Example: docx
     */
    public static getScheme(fileExtension: string): Scheme {
        switch(fileExtension.toLowerCase()) {
            case 'doc':
            case 'docm':
            case 'docx':
            case 'dot':
            case 'dotm':
            case 'dotx':
                return Scheme.Word;
            case 'xls':
            case 'xlsb': 
            case 'xlsm': 
            case 'xlsx':
                return Scheme.Excel;
            case 'pptx':
            case 'ppt':
            case 'pptm':
            case 'csv':
                return Scheme.PowerPoint;
            case 'vdx':
            case 'vsd':
            case 'vsdx':
                return Scheme.Visio;
            case 'accdb':
            case 'mdb':
                return Scheme.Access;
            case 'mpp':
                return Scheme.Project;
            case 'pub':
                return Scheme.Publisher;
            case 'xsn':
            case 'xsd':
                return Scheme.InfoPath;
        }
    }

/*     private getEmbedViewOnlyURL(docURL: string): string {

        switch(true) {
          case OfficeURIHelper.isOfficeDocument(docURL):
            //return `${res.SPWebUrl}/_layouts/15/Doc.aspx?sourcedoc=${res.UniqueID}&action=view&mobileredirect=true&DefaultItemOpen=1`;
          case res.FileType === 'docx':
          case res.FileType === 'doc':
          case this._isExcelWorkbook(res.FileType):
            return `${res.SPWebUrl}/_layouts/15/Doc.aspx?sourcedoc=${res.UniqueID}&action=view&mobileredirect=true&DefaultItemOpen=1`;
          default:
            return res.ServerRedirectedEmbedURL;
        }
        
      } */

    /**
     * Returns true if the given url points to a document that is a Microsoft Office document.
     * @param docURL Url to document https://contoso.sharepoint.com/shared/document1.docx
     */
    public static isOfficeDocument(docURL: string): boolean {
        let ext = [            
            'doc',
            'docm',
            'docx',
            'dot',
            'dotm',
            'dotx',
            'xls',
            'xlsb', 
            'xlsm', 
            'xlsx',
            'pptx',
            'ppt',
            'pptm',
            'csv',
            'vdx',
            'vsd',
            'vsdx',
            'accdb',
            'mdb',
            'mpp',
            'pub',
            'xsn',
            'xsd'
        ];

        return ext.indexOf(OfficeURIHelper.getFileExtensionFromURL(docURL)) !== -1;
    }

    public static isPDF(docURL: string): boolean {
        return OfficeURIHelper.getFileExtensionFromURL(docURL) === 'pdf';
    }


}