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
var projects_service_1 = require("./projects.service");
var projects_for_selection_service_1 = require("./projects.for.selection.service");
var save_projects_service_1 = require("./save.projects.service");
var Project = (function () {
    function Project(id, name, code, hours, overLimit, comment) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.hours = hours;
        this.overLimit = overLimit;
        this.comment = comment;
    }
    return Project;
}());
exports.Project = Project;
var ProjectForSelection = (function () {
    function ProjectForSelection(name, code) {
        this.name = name;
        this.code = code;
    }
    return ProjectForSelection;
}());
exports.ProjectForSelection = ProjectForSelection;
var ProjectForSelectionLine = (function () {
    function ProjectForSelectionLine(customer, project) {
        this.projectsForSelection = [];
        this.customer = customer;
        this.projectsForSelection = [];
        this.projectsForSelection.push(project);
    }
    return ProjectForSelectionLine;
}());
exports.ProjectForSelectionLine = ProjectForSelectionLine;
var AppComponent = (function () {
    function AppComponent(ProjectSevice, ProjectForSelectionSevice, SaveProjectsService) {
        this.ProjectSevice = ProjectSevice;
        this.ProjectForSelectionSevice = ProjectForSelectionSevice;
        this.SaveProjectsService = SaveProjectsService;
        this.projects = [];
        this.projectsForSelection = [];
        this.total = 0;
        this.myDate = "";
        this.email = "";
        this.saveProjectResult = "";
        var formatter = new Intl.DateTimeFormat("ru");
        this.myDate = formatter.format(new Date);
        this.email = Office.context.mailbox.userProfile.emailAddress;
    }
    AppComponent.prototype.ngOnInit = function () {
        this.getProjectsData();
    };
    AppComponent.prototype.getProjectsData = function () {
        var _this = this;
        Office.context.mailbox.getUserIdentityTokenAsync(function (asyncResult) {
            _this.getProjectsDataAssync(asyncResult.value);
        });
    };
    AppComponent.prototype.getProjectsDataAssync = function (token) {
        var _this = this;
        $("#submit-btn").attr("disabled", false);
        this.projects = [];
        this.ProjectSevice.getData(this.email, this.convertDate(this.myDate), token).then(function (data, textStatus, jqXHR) {
            var jsonString = jqXHR.responseXML.childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].textContent;
            var jData = $.parseJSON(jsonString)['#value'];
            for (var i = 0; i < jData.length; i++) {
                _this.projects.push(new Project(_this.projects.length + 1, jData[i].ProjectName, jData[i].ProjectCode, jData[i].Hours, jData[i].OverLimit, jData[i].Comment));
            }
            _this.onHoursChange();
        });
        this.projectsForSelection = [];
        this.ProjectForSelectionSevice.getData(this.email, this.convertDate(this.myDate), token).then(function (data, textStatus, jqXHR) {
            var jsonString = jqXHR.responseXML.childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].textContent;
            var jData = $.parseJSON(jsonString)['#value'];
            for (var i = 0; i < jData.length; i++) {
                var customerArray = _this.projectsForSelection.filter(function (val) { return val.customer == jData[i].Customer; });
                if (customerArray.length == 0) {
                    _this.projectsForSelection.push(new ProjectForSelectionLine(jData[i].Customer, new ProjectForSelection(jData[i].Name, jData[i].Code)));
                }
                else {
                    customerArray[0].projectsForSelection.push(new ProjectForSelection(jData[i].Name, jData[i].Code));
                }
            }
        });
    };
    AppComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        //Диалог выбора даты
        $("#datepicker").datepicker({
            monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
            dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
            firstDay: 1,
            dateFormat: "dd.mm.yy",
            onSelect: function (dateRU, date) {
                _this.myDate = dateRU;
                _this.getProjectsData();
                //$("#datepicker").datepicker("hide");
            }
        });
        //Дилог добавления проектов
        $("#project-dialog").dialog({
            autoOpen: false, modal: true,
            buttons: {
                OK: function () {
                    for (var i = 0; i < _this.projectsForSelection.length; i++) {
                        for (var j = 0; j < _this.projectsForSelection[i].projectsForSelection.length; j++) {
                            if (_this.projectsForSelection[i].projectsForSelection[j].checked) {
                                _this.projects.push(new Project(_this.projects.length + 1, _this.projectsForSelection[i].projectsForSelection[j].name, _this.projectsForSelection[i].projectsForSelection[j].code, 0, false, ""));
                            }
                        }
                    }
                    $("#project-dialog").dialog("close");
                },
                Отмена: function () {
                    $(this).dialog("close");
                },
            },
            width: 500
        });
        //Дилог добавления комментария
        $("#comment-dialog").dialog({
            autoOpen: false, modal: true, buttons: {
                OK: function () {
                    var id = +$('#comment-id').val();
                    _this.projects[id].comment = $('#comment-text').val();
                    $("#comment-dialog").dialog("close");
                },
                Отмена: function () {
                    $(this).dialog("close");
                },
            },
            width: 400
        });
        //Диалог результата сохранения данных
        $("#result-dialog").dialog({
            autoOpen: false,
            modal: true,
            buttons: {
                Ok: function () {
                    $(this).dialog("close");
                }
            }
        });
    };
    AppComponent.prototype.ngOnChanges = function () {
        this.total = this.projects.reduce(function (sum, current) { return (sum + current.hours); }, 0);
    };
    AppComponent.prototype.addProject = function () {
        for (var i = 0; i < this.projectsForSelection.length; i++) {
            for (var j = 0; j < this.projectsForSelection[i].projectsForSelection.length; j++) {
                this.projectsForSelection[i].projectsForSelection[j].checked = false;
            }
        }
        $("#project-dialog").dialog("open");
    };
    AppComponent.prototype.renumberProjects = function () {
        for (var i = 0; i < this.projects.length; i++) {
            this.projects[i].id = i + 1;
        }
    };
    AppComponent.prototype.removeProject = function () {
        for (var i = this.projects.length - 1; i >= 0; i--) {
            if (this.projects[i].checked) {
                this.projects.splice(i, 1);
            }
        }
        this.renumberProjects();
    };
    AppComponent.prototype.addComment = function (id) {
        $("#comment-id").val(id);
        $("#comment-text").val(this.projects[id].comment);
        $("#comment-dialog").dialog("open");
    };
    AppComponent.prototype.saveProjects = function () {
        var _this = this;
        this.lockForm();
        Office.context.mailbox.getUserIdentityTokenAsync(function (asyncResult) {
            _this.saveProjectsAssync(asyncResult.value);
        });
    };
    AppComponent.prototype.saveProjectsAssync = function (token) {
        var _this = this;
        this.SaveProjectsService.saveData(this.projects, this.email, this.convertDate(this.myDate), token).then(function (data, textStatus, jqXHR) {
            var jsonString = jqXHR.responseXML.childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].textContent;
            var jData = $.parseJSON(jsonString)["#value"];
            _this.unlockForm();
            if (jData[0].Result == true) {
                _this.saveProjectResult = jData[0].Message;
                $('#result-dialog').dialog("open");
            }
        });
    };
    AppComponent.prototype.onHoursChange = function () {
        this.total = this.projects.reduce(function (sum, current) { return (sum + current.hours); }, 0);
    };
    AppComponent.prototype.onDateChange = function (dateRU, date) {
        this.getProjectsData();
        this.hide();
    };
    AppComponent.prototype.convertDate = function (dateRU) {
        dateRU = "" + dateRU.replace(new RegExp(String.fromCharCode(8206), 'g'), "");
        var result = "" + dateRU.charAt(6) + dateRU.charAt(7) + dateRU.charAt(8) + dateRU.charAt(9) + "-" + dateRU.charAt(3) + dateRU.charAt(4) + "-" + dateRU.charAt(0) + dateRU.charAt(1);
        return result;
    };
    AppComponent.prototype.lockForm = function () {
        $("#submit-btn").attr("disabled", "disabled");
        $("#datepicker").attr("disabled", "disabled");
        $("#add-project-btn").attr("disabled", "disabled");
        $("#remove-project-btn").attr("disabled", "disabled");
    };
    AppComponent.prototype.unlockForm = function () {
        $("#submit-btn").attr("disabled", false);
        $("#datepicker").attr("disabled", false);
        $("#add-project-btn").attr("disabled", false);
        $("#remove-project-btn").attr("disabled", false);
    };
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        selector: 'my-app',
        templateUrl: './app/app.component.tmp.html',
        providers: [projects_service_1.ProjectService, projects_for_selection_service_1.ProjectForSelectionService, save_projects_service_1.SaveProjectsService]
    }),
    __metadata("design:paramtypes", [projects_service_1.ProjectService, projects_for_selection_service_1.ProjectForSelectionService, save_projects_service_1.SaveProjectsService])
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map