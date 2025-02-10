// @include "_json.jsx"
// @include "_array.jsx"
// @include "_string.jsx"
// @include "_illustratorRunner.jsx"

// Parse arguments
var args = arguments;
var script = arguments[0];
var type = arguments[1];
$.evalFile(script);

// Run correct function
function main(mode) {
    try {
        switch (mode) {
            case 'settings':
                return settings();
            case 'local':
                return local.apply(this, JSON.parse(args[2]));
            case 'template':
                return template.apply(this, JSON.parse(args[2]));
            case 'helper':
                var helperArgs = [args[2]];
                JSON.parse(args[3]).map(function (arg) {
                    helperArgs.push(arg);
                });
                return helper.apply(this, helperArgs);
        }
    } catch (e) {
        return [false, e.description];
    }
}

// Return correct value
JSON.stringify(main(type));
