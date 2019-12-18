
export default class WebPartPropertiesHelper {
  constructor() {
    
  }

  public export(properties: any, filename: string): void {
    this._downloadObjectAsJson(properties, filename);
  }

  private _downloadObjectAsJson(exportObj: any, exportName: string): void {
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
      var downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", exportName + ".json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  }



}