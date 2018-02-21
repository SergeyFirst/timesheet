import { Project } from './app.component';
import { ConfigData } from "./config";

export class SaveProjectsService {

    saveData(projects: Project[], email: string, date: string, UUID: string): JQueryPromise<any> {
        
        let configData: ConfigData = new ConfigData;

        let resultText = "";
        for (var i = 0; i < projects.length; i++) {
            resultText = resultText +
                `<tim:Project>
                   <tim:ProjectName>${projects[i].name}</tim:ProjectName>
                   <tim:ProjectCode>${projects[i].code}</tim:ProjectCode>
                   <tim:ProjectId>${projects[i].id}</tim:ProjectId>
                   <tim:Hours>${projects[i].hours}</tim:Hours>
                   <tim:OverLimit>${projects[i].overLimit}</tim:OverLimit>
                   <tim:Comment>${projects[i].comment}</tim:Comment>
                </tim:Project>`;
        }

        let jqPromise = $.soap({
            url: configData.webServerURL,
            method: 'SaveHoursJson',
            async: true,
            data: `<?xml version="1.0" encoding="utf-8"?>
                    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tim="http://www.npoprogress.com/timesheets">
                        <soapenv:Header/>
                            <soapenv:Body>
                                <tim:SaveHoursJson>
                                    <tim:Email>${email}</tim:Email>
                                    <tim:Date>${date}</tim:Date>
                                    <tim:Token></tim:Token>
                                    <tim:ArrayOfHours>${resultText}</tim:ArrayOfHours>
                                    <tim:UUID>${UUID}</tim:UUID>
                                </tim:SaveHoursJson>
                            </soapenv:Body>
                    </soapenv:Envelope>`,
            HTTPHeaders: {
                Authorization: 'Basic d2ViOjEyMw=='
            }
        });

        return jqPromise;       

    }
}