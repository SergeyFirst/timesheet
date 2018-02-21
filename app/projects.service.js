"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./config");
var ProjectService = /** @class */ (function () {
    function ProjectService() {
    }
    ProjectService.prototype.getData = function (email, date, UUID) {
        var configData = new config_1.ConfigData;
        var jqPromise = $.soap({
            url: configData.webServerURL,
            method: 'GetHoursByEmailJson',
            async: true,
            data: "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n                           <soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:tim=\"http://www.npoprogress.com/timesheets\">\n                               <soapenv:Header/>\n                               <soapenv:Body>\n                                   <tim:GetHoursByEmailJson>\n                                       <tim:Email>" + email + "</tim:Email>\n                                       <tim:Date>" + date + "</tim:Date>\n                                       <tim:Token></tim:Token>\n                                       <tim:UUID>" + UUID + "</tim:UUID>\n                                   </tim:GetHoursByEmailJson>\n                               </soapenv:Body>\n                           </soapenv:Envelope>",
            HTTPHeaders: {
                Authorization: 'Basic d2ViOjEyMw=='
            }
        });
        return jqPromise;
    };
    return ProjectService;
}());
exports.ProjectService = ProjectService;
//# sourceMappingURL=projects.service.js.map