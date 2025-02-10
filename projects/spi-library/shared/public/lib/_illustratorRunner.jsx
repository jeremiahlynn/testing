function runInIllustrator(scriptInPluginFolder, args) {
    if ($.os.toLowerCase().indexOf('mac') !== -1) {
        var scriptArgs = args
            .map(function (arg) {
                return '"' + escape(JSON.stringify(arg)) + '"';
            })
            .join(', ');

        var pluginFolder = File($.fileName).parent.parent.fsName;
        var wrapperPath = pluginFolder + '/lib/_illustratorWrapper.jsx';
        var scriptPath = pluginFolder + '/illustrator/' + scriptInPluginFolder;

        var script =
            'tell application id "com.adobe.illustrator"\nset myScript to "\n#include \'' +
            wrapperPath +
            "'\n#include '" +
            scriptPath +
            '\'"\ndo javascript myScript with arguments {' +
            scriptArgs +
            '}\nend tell';

        var unparsedOutput = app.doScript(
            script,
            ScriptLanguage.APPLESCRIPT_LANGUAGE
        );

        return JSON.parse(unparsedOutput);
    } else if ($.os.toLowerCase().indexOf('windows') !== -1) {
        var scriptArgs = args
            .map(function (arg) {
                return "'" + escape(JSON.stringify(arg)) + "'";
            })
            .join(', ');

        var pluginFolder = File($.fileName).parent.parent.fsName;
        var wrapperPath = pluginFolder + '\\lib\\_illustratorWrapper.jsx';
        var scriptPath =
            pluginFolder + '\\illustrator\\' + scriptInPluginFolder;

        var script =
            'Dim Illustrator\n' +
            'Dim InDesign\n' +
            'Set Illustrator = CreateObject("Illustrator.Application")\n' +
            'Set InDesign = CreateObject("InDesign.Application")\n' +
            'Dim myScript\n' +
            'myScript = "var arguments = [' +
            scriptArgs +
            "];//@include '" +
            wrapperPath.replace(/\\/g, '\\\\') +
            "';//@include '" +
            scriptPath.replace(/\\/g, '\\\\') +
            '\'"\n' +
            'Dim result\n' +
            'result = Illustrator.DoJavaScript(myScript)\n' +
            'InDesign.ScriptArgs.Set "fontUpdaterScriptReturn", result';

        app.doScript(script, ScriptLanguage.VISUAL_BASIC);
        var output = app.scriptArgs.get('fontUpdaterScriptReturn');
        app.scriptArgs.clear();
        return JSON.parse(output);
    } else {
        // Code for unsupported platforms or unknown OS
        return null;
    }
}
