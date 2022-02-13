import AdvancedSearchData from "./AdvancedSearchData";

export default abstract class SwivelSearchGlobals {
    public static data: AdvancedSearchData; 
}

export function globalsSetup(data: AdvancedSearchData) {
    SwivelSearchGlobals.data = data;
}


