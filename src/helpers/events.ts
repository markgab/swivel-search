
export function on(element: HTMLElement, event: string, selectorOrHandler: string | Function, handler: Function) {
    element.addEventListener(event, (e) => {
        let target: HTMLElement = <HTMLElement>e.target;

        if (typeof(selectorOrHandler) === 'string') {
                
            let matches = getElementMatches();                              // runtime polyfill within iframe context
            
            while (!matches.call(target, selectorOrHandler) && target !== element) {
                target = target.parentElement;
            }

            if (matches.call(target, selectorOrHandler)) {
                handler.call(target, e);
            }
        } else {
            selectorOrHandler.call(element, e);
        }
    });
}

function getElementMatches(): (string) => boolean {
    let m =  
    Element.prototype.matches ||
    Element.prototype['matchesSelector'] ||
    Element.prototype['mozMatchesSelector'] ||
    Element.prototype['msMatchesSelector'] ||
    Element.prototype['oMatchesSelector'] ||
    Element.prototype['webkitMatchesSelector'] ||
    function(s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
            i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) {}
        return i > -1;
    };

    return m;
}
