"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./config");
var ReportService = /** @class */ (function () {
    function ReportService() {
    }
    ReportService.prototype.getData = function (email, dateBegin, dateEnd, token) {
        var configData = new config_1.ConfigData;
        var jqPromise = $.soap({
            url: configData.webServerURL,
            method: 'ReportJson',
            async: true,
            data: "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n                           <soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:tim=\"http://www.npoprogress.com/timesheets\">\n                               <soapenv:Header/>\n                               <soapenv:Body>\n                                   <tim:ReportJson>\n                                       <tim:Email>" + email + "</tim:Email>\n                                       <tim:DateBegin>" + dateBegin + "</tim:DateBegin>\n                                       <tim:DateEnd>" + dateEnd + "</tim:DateEnd>\n                                       <tim:Token>" + token + "</tim:Token>\n                                   </tim:ReportJson>\n                               </soapenv:Body>\n                           </soapenv:Envelope>",
            HTTPHeaders: {
                Authorization: 'Basic d2ViOjEyMw=='
            }
        });
        return jqPromise;
    };
    return ReportService;
}());
exports.ReportService = ReportService;
//# sourceMappingURL=report.service.js.map