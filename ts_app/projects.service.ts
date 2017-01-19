import { Project } from './app.component';
import { ConfigData } from "./config";

export class ProjectService {

    getData(email: string, date: string, token: string): JQueryPromise<any> {
        
        let configData: ConfigData = new ConfigData;

        let jqPromise = $.soap({
            url: configData.webServerURL,
            method: 'GetHoursByEmailJson',
            async: true,
            data: `<?xml version="1.0" encoding="utf-8"?>
                           <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tim="http://www.npoprogress.com/timesheets">
                               <soapenv:Header/>
                               <soapenv:Body>
                                   <tim:GetHoursByEmailJson>
                                       <tim:Email>${email}</tim:Email>
                                       <tim:Date>${date}</tim:Date>
                                       <tim:Token>${token}</tim:Token>
                                   </tim:GetHoursByEmailJson>
                               </soapenv:Body>
                           </soapenv:Envelope>`,
            HTTPHeaders: {
                Authorization: 'Basic d2ViOjEyMw=='
            });

            return jqPromise;       

    }
}