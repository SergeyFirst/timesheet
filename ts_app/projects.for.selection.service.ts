import { Project } from './app.component';
import { ConfigData } from "./config";

export class ProjectForSelectionService {

    getData(email: string, date: string, UUID: string): JQueryPromise<any> {
        
        let configData: ConfigData = new ConfigData;

        let jqPromise = $.soap({
            url: configData.webServerURL,
            method: 'GetProjectsByEmailJson',
            async: true,
            data: `<?xml version="1.0" encoding="utf-8"?>
                           <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tim="http://www.npoprogress.com/timesheets">
                               <soapenv:Header/>
                               <soapenv:Body>
                                   <tim:GetProjectsByEmailJson>
                                       <tim:Email>${email}</tim:Email>
                                       <tim:Date>${date}</tim:Date>
                                       <tim:Token></tim:Token>
                                       <tim:UUID>${UUID}</tim:UUID>
                                   </tim:GetProjectsByEmailJson>
                               </soapenv:Body>
                           </soapenv:Envelope>`,
            HTTPHeaders: {
                Authorization: 'Basic d2ViOjEyMw=='
            }
        });

            return jqPromise;       

    }
}