import { ConfigData } from "./config";

export class ReportService {

    getData(email: string, dateBegin: string, dateEnd: string, token: string): JQueryPromise<any> {
        
        let configData: ConfigData = new ConfigData;

        let jqPromise = $.soap({
            url: configData.webServerURL,
            method: 'ReportJson',
            async: true,
            data: `<?xml version="1.0" encoding="utf-8"?>
                           <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tim="http://www.npoprogress.com/timesheets">
                               <soapenv:Header/>
                               <soapenv:Body>
                                   <tim:ReportJson>
                                       <tim:Email>${email}</tim:Email>
                                       <tim:DateBegin>${dateBegin}</tim:DateBegin>
                                       <tim:DateEnd>${dateEnd}</tim:DateEnd>
                                       <tim:Token>${token}</tim:Token>
                                   </tim:ReportJson>
                               </soapenv:Body>
                           </soapenv:Envelope>`,
            HTTPHeaders: {
                Authorization: 'Basic d2ViOjEyMw=='
            }
          });

          return jqPromise;       

    }



}