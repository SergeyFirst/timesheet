"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./config");
var SaveProjectsService = /** @class */ (function () {
    function SaveProjectsService() {
    }
    SaveProjectsService.prototype.saveData = function (projects, email, date, UUID) {
        var configData = new config_1.ConfigData;
        var resultText = "";
        for (var i = 0; i < projects.length; i++) {
            resultText = resultText +
                ("<tim:Project>\n                   <tim:ProjectName>" + projects[i].name + "</tim:ProjectName>\n                   <tim:ProjectCode>" + projects[i].code + "</tim:ProjectCode>\n                   <tim:ProjectId>" + projects[i].id + "</tim:ProjectId>\n                   <tim:Hours>" + projects[i].hours + "</tim:Hours>\n                   <tim:OverLimit>" + projects[i].overLimit + "</tim:OverLimit>\n                   <tim:Comment>" + projects[i].comment + "</tim:Comment>\n                </tim:Project>");
        }
        var jqPromise = $.soap({
            url: configData.webServerURL,
            method: 'SaveHoursJson',
            async: true,
            data: "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n                    <soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:tim=\"http://www.npoprogress.com/timesheets\">\n                        <soapenv:Header/>\n                            <soapenv:Body>\n                                <tim:SaveHoursJson>\n                                    <tim:Email>" + email + "</tim:Email>\n                                    <tim:Date>" + date + "</tim:Date>\n                                    <tim:Token></tim:Token>\n                                    <tim:ArrayOfHours>" + resultText + "</tim:ArrayOfHours>\n                                    <tim:UUID>" + UUID + "</tim:UUID>\n                                </tim:SaveHoursJson>\n                            </soapenv:Body>\n                    </soapenv:Envelope>",
            HTTPHeaders: {
                Authorization: 'Basic d2ViOjEyMw=='
            }
        });
        return jqPromise;
    };
    return SaveProjectsService;
}());
exports.SaveProjectsService = SaveProjectsService;
//# sourceMappingURL=save.projects.service.js.map