const iterator = () => {
    const iterator: IterableIterator<any> = {
        next(): IteratorResult<any> {
            return { value: undefined, done: true };
        },
        [Symbol.iterator]() {
            return this;
        },
    };
    return iterator;
};

export class TemplateRecordV1 {
    [key: string]: any;
}
export class ErrorRecordV1 {
    [key: string]: any;
}
export class APIV1 {
    static [key: string]: any;
    [key: string]: any;
}
export class SilpubClientV1 {
    constructor(...args: any[]) {}
    [key: string]: any;
}
export class FormData {
    [key: string]: any;
    [Symbol.iterator](): IterableIterator<any> {
        return iterator();
    }
}

export class Logger {
    static [key: string]: any;
    [key: string]: any;
}
