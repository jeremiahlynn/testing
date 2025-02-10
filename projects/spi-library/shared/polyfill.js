if (typeof window.global === 'undefined') window.global = window.globalThis;
if (typeof global.queueMicrotask !== 'function') {
    if (typeof global.setImmediate === 'function') {
        global.queueMicrotask = function (callback) {
            global.setImmediate(callback);
        };
    } else {
        global.queueMicrotask = function (callback) {
            global.setTimeout(callback, 0);
        };
    }
}
