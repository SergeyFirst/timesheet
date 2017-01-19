"use strict";
var platform_browser_dynamic_1 = require("@angular/platform-browser-dynamic");
var app_module_1 = require("./app.module");
function launch() {
    var platform = platform_browser_dynamic_1.platformBrowserDynamic();
    platform.bootstrapModule(app_module_1.AppModule);
}
if (window.hasOwnProperty('Office')) {
    Office.initialize = function (reason) {
        $(document).ready(function () {
            app.initialize();
        });
        launch();
    };
}
else {
    launch();
}
//# sourceMappingURL=main.js.map