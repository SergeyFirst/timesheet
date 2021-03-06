import { Component, ChangeDetectorRef } from '@angular/core';
import { ReportService } from './report.service';
import { enableProdMode } from '@angular/core';

enableProdMode();

export class Report {
    date: Date;
    name: string;
    code: string;
    hours: number;
    overLimit: boolean;
    comment: string;
    accepted: boolean;

    constructor(date: Date, name: string, code: string, hours: number, overLimit: boolean, comment: string, accepted: boolean) {
        this.date       = date;
        this.name       = name;
        this.code       = code;
        this.hours      = hours;
        this.overLimit  = overLimit;
        this.comment    = comment;
        this.accepted   = accepted;
    }
}

@Component({
    selector: 'my-app',
    templateUrl: './report/report.component.tmp.html',
    providers: [ReportService]
})
export class ReportComponent {
    report: Report[] = [];
    total: number = 0;
    dateBegin: string = "";
    dateEnd: string = "";
    email: string = "";
    booleanMap: any = {true:'+',false:''};    
    token: string;
    body: string;
    UUID: string;

    constructor(private ReportSevice: ReportService, private ref: ChangeDetectorRef) {
        //Установим дату начала и окончания отчета
        let dateBegin: Date = new Date
        dateBegin.setDate(1);
        let dateEnd: Date = new Date;
        dateEnd.setMonth(dateEnd.getMonth()+1);
        dateEnd.setDate(-1);

        var formatter = new Intl.DateTimeFormat("ru");
        this.dateBegin = formatter.format(dateBegin);
        this.dateEnd = formatter.format(dateEnd);

        this.email = Office.context.mailbox.userProfile.emailAddress;        
    }
    ngOnInit() {
        Office.context.mailbox.item.body.getAsync(Office.CoercionType.Html, (result) => {
            if (result.status == Office.AsyncResultStatus.Succeeded) {
                this.body = result.value;
                var expr = /\[UUID=(.*)\]/;
                let UUID;
                if ((UUID = expr.exec(this.body)) !== null) {
                    this.UUID = UUID[1];
                    this.getReportData();
                }

            }
        });
    }
    getReportData() {
        this.report = [];
        this.ReportSevice.getData(this.email,
                                  this.convertDate(this.dateBegin),
                                  this.convertDate(this.dateEnd),
                                  this.UUID).then((data: any, textStatus: string, jqXHR: JQueryXHR) => {

            let jsonString = jqXHR.responseXML.childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].textContent;
            let jData = $.parseJSON(jsonString)['#value'];
            this.total = 0;

            for (var i = 0; i < jData.length; i++) {
                this.report.push(new Report(jData[i].Date,
                                            jData[i].ProjectName,
                                            jData[i].ProjectCode,
                                            jData[i].Hours,
                                            jData[i].OverLimit,
                                            jData[i].Comment,
                                            jData[i].Accepted));
               this.total += jData[i].Hours;
            }
            this.ref.detectChanges();
        });
    }    
    ngAfterViewInit() {
        //Диалог выбора даты
        $("#datepickerBegin").datepicker({
            monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
            dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
            firstDay: 1,
            dateFormat: "dd.mm.yy",
            onSelect: (dateRU: string, date: any) => {
                    this.dateBegin = dateRU;
                    $("#datepickerBegin").datepicker("hide");
                    }
        });

        $("#datepickerEnd").datepicker({
            monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
            dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
            firstDay: 1,
            dateFormat: "dd.mm.yy",
            onSelect: (dateRU: string, date: any) => {
                    this.dateBegin = dateRU;
                    $("#datepickerEnd").datepicker("hide");
                    }
        });
    }
    greateReport() {
        this.getReportData();
    }
    convertDate(dateRU: string) {
        dateRU = "" + dateRU.replace(new RegExp(String.fromCharCode(8206),'g'),"");
        let result: string = "" + dateRU.charAt(6)+dateRU.charAt(7)+dateRU.charAt(8)+dateRU.charAt(9) + "-" + dateRU.charAt(3)+dateRU.charAt(4) + "-" + dateRU.charAt(0)+dateRU.charAt(1);
        return result;
    }

}