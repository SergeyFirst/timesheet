"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var platform_browser_dynamic_1 = require("@angular/platform-browser-dynamic");
var report_module_1 = require("./report.module");
function launch() {
    var platform = platform_browser_dynamic_1.platformBrowserDynamic();
    platform.bootstrapModule(report_module_1.ReportModule);
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