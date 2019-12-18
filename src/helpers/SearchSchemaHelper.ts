import { 
    SPHttpClient, 
    SPHttpClientResponse, 
    SPHttpClientConfiguration,
    ISPHttpClientOptions,
    ODataVersion,
    ISPHttpClientConfiguration
} from "@microsoft/sp-http";

export interface IManagedPropertyMatch {
    RefinementCount: string;
    RefinementName: string;
    RefinementToken: string;
    RefinementValue: string;
}

export default class SearchSchemaHelper {
    constructor(private hostUrl: string, private webUrl: string, private spHttpClient: SPHttpClient) {

    }

    public get webAbsoluteUrl(): string {
        return this.hostUrl + (this.webUrl === '/' ? '' : this.webUrl);
    }

    private _requestDigest: string;

    public fetchRequestDigest(): Promise<string> {

        if(this._requestDigest) {
            return Promise.resolve(this._requestDigest);
        }

        const url = `${this.webAbsoluteUrl}/_api/contextinfo`;

        return this.spHttpClient.post(url, SPHttpClient.configurations.v1, {}).then(resp => {
            return resp.json();
        }).then(obj => {
            return this._requestDigest = obj.FormDigestValue;
        });
    }

    public fetchManagedPropertyMatches(propertyName: string): Promise<Array<IManagedPropertyMatch>> {

        if(!propertyName) {
            return Promise.resolve([]);
        }

        const url = `${this.webAbsoluteUrl}/_api/search/postquery`;
        const encodedRefiner = btoa(`*${propertyName}*`);
        let body = `{
            "request": {
                "ClientType": "HighlightedContentWebPart",
                "SourceId": "8413CD39-2156-4E00-B54D-11EFD9ABDB89",
                "Querytext": "path:\\\"${this.hostUrl}\\\"  (IsDocument:1 AND NOT (FileType:aspx OR FileType:html OR FileType:htm OR FileType:mhtml))",
                "Refiners": "ManagedProperties(filter3i=50000/0/${encodedRefiner},sort=name/ascending)",
                "EnableQueryRules": false,
                "ProcessBestBets": false,
                "ProcessPersonalFavorites": false,
                "Properties": [
                    {
                        "Name": "EnableDynamicGroups",
                        "Value": {
                            "BoolVal": "False",
                            "QueryPropertyValueTypeIndex": 3
                        }
                    },
                    {
                        "Name": "ClientFunction",
                        "Value": {
                            "StrVal": "SchemaLookup",
                            "QueryPropertyValueTypeIndex": 1
                        }
                    }
                ]
            }
        }`;

        const spSearchConfig: ISPHttpClientConfiguration = {
            defaultODataVersion: ODataVersion.v3
        };

        const spClientConfigV3 = SPHttpClient.configurations.v1.overrideWith(spSearchConfig);


        return this.fetchRequestDigest().then(digest => {

            const spOpts: ISPHttpClientOptions = {
                body: body,
                headers: <any>{
                    "accept": "application/json;odata=nometadata",
                    "content-type": "application/json;charset=utf-8",
                    "x-requestdigest": digest
                }
            };

            return this.spHttpClient.post(
                url,
                spClientConfigV3,
                spOpts).then((resp: SPHttpClientResponse) => {
                    return resp.json();
                }
            ).then((results: any) => {
                //console.log(results);
                if(!results.PrimaryQueryResult.RefinementResults || 
                   !results.PrimaryQueryResult.RefinementResults.Refiners || 
                   !results.PrimaryQueryResult.RefinementResults.Refiners.length) {
                    return [];
                } else {
                    let entries = results.PrimaryQueryResult.RefinementResults.Refiners[0].Entries;
                    //console.log('props: ', entries);
                    return entries;
                }
            });

        });

    }

    public managedPropertyExists(propertyName: string): Promise<boolean> {
        return this.fetchManagedPropertyMatches(propertyName).then((matches: Array<IManagedPropertyMatch>) => {
            for(let j = 0; j < matches.length; j ++) {
                if(matches[j].RefinementName.toLowerCase() === propertyName.toLowerCase()){
                    return true;
                }
            }
            return false;
        });
    }


    /* 
    public managedPropertyExists(propertyName: string): Promise<boolean> {

        if(!propertyName) {
            return Promise.resolve(false);
        }

        const url = `${this.webAbsoluteUrl}/_api/search/postquery`;
        const encodedRefiner = btoa(`*${propertyName}*`);
        let body = `{
            "request": {
                "ClientType": "HighlightedContentWebPart",
                "SourceId": "8413CD39-2156-4E00-B54D-11EFD9ABDB89",
                "Querytext": "path:\\\"${this.hostUrl}\\\"  (IsDocument:1 AND NOT (FileType:aspx OR FileType:html OR FileType:htm OR FileType:mhtml))",
                "Refiners": "ManagedProperties(filter3i=50000/0/${encodedRefiner},sort=name/ascending)",
                "EnableQueryRules": false,
                "ProcessBestBets": false,
                "ProcessPersonalFavorites": false,
                "Properties": [
                    {
                        "Name": "EnableDynamicGroups",
                        "Value": {
                            "BoolVal": "False",
                            "QueryPropertyValueTypeIndex": 3
                        }
                    },
                    {
                        "Name": "ClientFunction",
                        "Value": {
                            "StrVal": "SchemaLookup",
                            "QueryPropertyValueTypeIndex": 1
                        }
                    }
                ]
            }
        }`;

        const spSearchConfig: ISPHttpClientConfiguration = {
            defaultODataVersion: ODataVersion.v3
        };

        const spClientConfigV3 = SPHttpClient.configurations.v1.overrideWith(spSearchConfig);


        return this.fetchRequestDigest().then(digest => {

            const spOpts: ISPHttpClientOptions = {
                body: body,
                headers: <any>{
                    "accept": "application/json;odata=nometadata",
                    "content-type": "application/json;charset=utf-8",
                    "x-requestdigest": digest
                }
            };

            return this.spHttpClient.post(
                url,
                spClientConfigV3,
                spOpts).then((resp: SPHttpClientResponse) => {
                    return resp.json();
                }
            ).then((results: any) => {
                console.log(results);
                if(!results.PrimaryQueryResult.RefinementResults || 
                   !results.PrimaryQueryResult.RefinementResults.Refiners || 
                   !results.PrimaryQueryResult.RefinementResults.Refiners.length) {
                    return false;
                } else {
                    let refiners: Array<any> = results.PrimaryQueryResult.RefinementResults.Refiners;
                    for(let i = 0; i < refiners.length; i ++) {
                        let refinerList: Array<any> = refiners[i].Entries;
                        for(let j = 0; j < refiners.length; j ++) {
                            if(refinerList[j].RefinementName.toLowerCase() === propertyName.toLowerCase()){
                                return true;
                            }
                        }
                    }
                    return false;
                }
            });

        });

    } */
}