"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var report_service_1 = require("./report.service");
var core_2 = require("@angular/core");
core_2.enableProdMode();
var Report = (function () {
    function Report(date, name, code, hours, overLimit, comment, accepted) {
        this.date = date;
        this.name = name;
        this.code = code;
        this.hours = hours;
        this.overLimit = overLimit;
        this.comment = comment;
        this.accepted = accepted;
    }
    return Report;
}());
exports.Report = Report;
var ReportComponent = (function () {
    function ReportComponent(ReportSevice, ref) {
        this.ReportSevice = ReportSevice;
        this.ref = ref;
        this.report = [];
        this.total = 0;
        this.dateBegin = "";
        this.dateEnd = "";
        this.email = "ssuchkov@npoprogress.com";
        this.booleanMap = { true: '+', false: '' };
        //Установим дату начала и окончания отчета
        var dateBegin = new Date;
        dateBegin.setDate(1);
        var dateEnd = new Date;
        dateEnd.setMonth(dateEnd.getMonth() + 1);
        dateEnd.setDate(-1);
        var formatter = new Intl.DateTimeFormat("ru");
        this.dateBegin = formatter.format(dateBegin);
        this.dateEnd = formatter.format(dateEnd);
        this.email = Office.context.mailbox.userProfile.emailAddress;
    }
    ReportComponent.prototype.ngOnInit = function () {
        var _this = this;
        Office.context.mailbox.getUserIdentityTokenAsync(function (asyncResult) {
            _this.getReportData(asyncResult.value);
        });
    };
    ReportComponent.prototype.getReportData = function (token) {
        var _this = this;
        this.report = [];
        this.ReportSevice.getData(this.email, this.convertDate(this.dateBegin), this.convertDate(this.dateEnd), token).then(function (data, textStatus, jqXHR) {
            var jsonString = jqXHR.responseXML.childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].textContent;
            var jData = $.parseJSON(jsonString)['#value'];
            _this.total = 0;
            for (var i = 0; i < jData.length; i++) {
                _this.report.push(new Report(jData[i].Date, jData[i].ProjectName, jData[i].ProjectCode, jData[i].Hours, jData[i].OverLimit, jData[i].Comment, jData[i].Accepted));
                _this.total += jData[i].Hours;
            }
            _this.ref.detectChanges();
        });
    };
    ReportComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        //Диалог выбора даты
        $("#datepickerBegin").datepicker({
            monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
            dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
            firstDay: 1,
            dateFormat: "dd.mm.yy",
            onSelect: function (dateRU, date) {
                _this.dateBegin = dateRU;
                $("#datepickerBegin").datepicker("hide");
            }
        });
        $("#datepickerEnd").datepicker({
            monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
            dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
            firstDay: 1,
            dateFormat: "dd.mm.yy",
            onSelect: function (dateRU, date) {
                _this.dateBegin = dateRU;
                $("#datepickerEnd").datepicker("hide");
            }
        });
    };
    ReportComponent.prototype.greateReport = function () {
        var _this = this;
        Office.context.mailbox.getUserIdentityTokenAsync(function (asyncResult) {
            _this.getReportData(asyncResult.value);
        });
    };
    ReportComponent.prototype.convertDate = function (dateRU) {
        dateRU = "" + dateRU.replace(new RegExp(String.fromCharCode(8206), 'g'), "");
        var result = "" + dateRU.charAt(6) + dateRU.charAt(7) + dateRU.charAt(8) + dateRU.charAt(9) + "-" + dateRU.charAt(3) + dateRU.charAt(4) + "-" + dateRU.charAt(0) + dateRU.charAt(1);
        return result;
    };
    return ReportComponent;
}());
ReportComponent = __decorate([
    core_1.Component({
        selector: 'my-app',
        templateUrl: './report/report.component.tmp.html',
        providers: [report_service_1.ReportService]
    }),
    __metadata("design:paramtypes", [report_service_1.ReportService, core_1.ChangeDetectorRef])
], ReportComponent);
exports.ReportComponent = ReportComponent;
//# sourceMappingURL=report.component.js.map