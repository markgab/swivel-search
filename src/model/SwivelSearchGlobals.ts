import AdvancedSearchData from "./AdvancedSearchData";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import { ISwivelSearchResultsWebPartProps } from "../webparts/swivelSearchResults/SwivelSearchResultsWebPart";
import { ISwivelSearchWebPartProps } from "../webparts/swivelSearch/SwivelSearchWebPart";

/**
 * Tote bag for sharing data between components
 */
export default abstract class SwivelSearchGlobals {
    public static data: AdvancedSearchData;
    public static propsSearchInterface: ISwivelSearchWebPartProps;
    public static propsSearchResults: ISwivelSearchResultsWebPartProps;
    public static webPartContext: BaseComponentContext;
}

/**
 * Populates the SwivelSearchGlobals utility class with data.
 * Then returns the class.
 * @param data 
 * @param webPartContext 
 * @param propsSearchInterface 
 * @param propsSearchResults 
 * @returns 
 */
export function globalsSetup(data: AdvancedSearchData, webPartContext: BaseComponentContext, propsSearchInterface: ISwivelSearchWebPartProps, propsSearchResults: ISwivelSearchResultsWebPartProps): SwivelSearchGlobals {

    SwivelSearchGlobals.data = data;
    SwivelSearchGlobals.webPartContext = webPartContext;
    SwivelSearchGlobals.propsSearchInterface = propsSearchInterface;
    SwivelSearchGlobals.propsSearchResults = propsSearchResults;

    return SwivelSearchGlobals;
}


