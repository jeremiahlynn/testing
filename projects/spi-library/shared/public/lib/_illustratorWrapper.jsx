// @include "_json.jsx"
// @include "_array.jsx"
// @include "_string.jsx"

// Start logs
var logs = [];
function log(message) {
    logs.push({ time: new Date().toString(), message: message });
}

// parse arguments
var args = [];
for (var i = 0; i < arguments.length; i++) {
    eval('args.push(' + unescape(arguments[i]) + ')');
}

// Run main
var output = { erred: false, error: null, value: null, logs: logs };
try {
    output.value = main.apply({ log: log }, args);
} catch (e) {
    output.erred = true;
    output.error = e;
}

// return output
JSON.stringify(output);
