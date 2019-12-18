
export class WaitPromise<T> extends Promise<T> {
    constructor(callback: (resolve : (value?: T | Thenable<T>) => void, reject: (error?: any) => void) => void) {
        super(callback);
    }
    public cancel() { 
        clearTimeout(this._timeoutId); 
    }

    public _timeoutId = 0;
}

export default function wait<T>(ms: number, args?: any): WaitPromise<T> {
    let waiting = new WaitPromise<T>(resolve => {
        waiting._timeoutId = setTimeout(resolve.bind(null, args), ms);
    });

    return waiting;

}