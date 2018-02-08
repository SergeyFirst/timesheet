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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var projects_service_1 = require("./projects.service");
var projects_for_selection_service_1 = require("./projects.for.selection.service");
var save_projects_service_1 = require("./save.projects.service");
var core_2 = require("@angular/core");
core_2.enableProdMode();
var Project = /** @class */ (function () {
    function Project(id, name, code, hours, overLimit, comment, favorite) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.hours = hours;
        this.overLimit = overLimit;
        this.comment = comment;
        this.favorite = favorite;
    }
    return Project;
}());
exports.Project = Project;
var ProjectForSelection = /** @class */ (function () {
    function ProjectForSelection(name, code) {
        this.name = name;
        this.code = code;
    }
    return ProjectForSelection;
}());
exports.ProjectForSelection = ProjectForSelection;
var ProjectForSelectionLine = /** @class */ (function () {
    function ProjectForSelectionLine(customer, project) {
        this.projects = [];
        this.customer = customer;
        this.projects = [];
        this.projects.push(project);
    }
    return ProjectForSelectionLine;
}());
exports.ProjectForSelectionLine = ProjectForSelectionLine;
var AppComponent = /** @class */ (function () {
    function AppComponent(ProjectSevice, ProjectForSelectionSevice, SaveProjectsService, ref) {
        this.ProjectSevice = ProjectSevice;
        this.ProjectForSelectionSevice = ProjectForSelectionSevice;
        this.SaveProjectsService = SaveProjectsService;
        this.ref = ref;
        this.projects = [];
        this.projectsForSelection = [];
        this.total = 0;
        this.myDate = "";
        this.email = "";
        this.saveProjectResult = "";
        this.favoriteProjects = [];
        var formatter = new Intl.DateTimeFormat("ru");
        this.email = Office.context.mailbox.userProfile.emailAddress;
        var subject = Office.context.mailbox.item.subject;
        var result = subject.match("(0[1-9]|1[0-9]|2[0-9]|3[01]).(0[1-9]|1[012]).[0-9]{4}");
        if (result.length == 0) {
            this.myDate = formatter.format(new Date);
        }
        else {
            this.myDate = result[0];
        }
    }
    AppComponent.prototype.ngOnInit = function () {
        this.getProjectsData();
    };
    AppComponent.prototype.getProjectsData = function () {
        var _this = this;
        this.lockForm();
        //Чтение избранных проектов
        var favoritesValue = this.getCookie("favorites");
        if (favoritesValue != undefined) {
            this.favoriteProjects = favoritesValue.split(";");
        }
        //Получение данных по трудозатратам и доступным проектам
        Office.context.mailbox.getUserIdentityTokenAsync(function (asyncResult) {
            _this.getProjectsDataAssync(asyncResult.value);
        });
    };
    AppComponent.prototype.getProjectsDataAssync = function (token) {
        var _this = this;
        $("#submit-btn").attr("disabled", false);
        this.projects = [];
        this.projectsForSelection = [];
        //Дождёмся загрузки всех ассинхронных вызовов
        Promise.all([
            this.ProjectSevice.getData(this.email, this.convertDate(this.myDate), token).then(function (data, textStatus, jqXHR) {
                var jsonString = jqXHR.responseXML.childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].textContent;
                var jData = $.parseJSON(jsonString)['#value'];
                for (var i = 0; i < jData.length; i++) {
                    _this.projects.push(new Project(_this.projects.length + 1, jData[i].ProjectName, jData[i].ProjectCode, jData[i].Hours, jData[i].OverLimit, jData[i].Comment, _this.favoriteProjects.indexOf(jData[i].ProjectCode) != -1));
                }
                _this.onHoursChange();
                _this.unlockForm();
            }),
            this.ProjectForSelectionSevice.getData(this.email, this.convertDate(this.myDate), token).then(function (data, textStatus, jqXHR) {
                var jsonString = jqXHR.responseXML.childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].textContent;
                var jData = $.parseJSON(jsonString)['#value'];
                for (var i = 0; i < jData.length; i++) {
                    var customerArray = _this.projectsForSelection.filter(function (val) { return val.customer == jData[i].Customer; });
                    if (customerArray.length == 0) {
                        _this.projectsForSelection.push(new ProjectForSelectionLine(jData[i].Customer, new ProjectForSelection(jData[i].Name, jData[i].Code)));
                    }
                    else {
                        customerArray[0].projects.push(new ProjectForSelection(jData[i].Name, jData[i].Code));
                    }
                }
            })
        ]).then(function (result) {
            var _loop_1 = function (i) {
                var element = _this.projects.find(function (value, index, obj) { return value.code == _this.favoriteProjects[i]; });
                if (element == undefined) {
                    for (var j0 = 0; j0 < _this.projectsForSelection.length; j0++) {
                        for (var j1 = 0; j1 < _this.projectsForSelection[j0].projects.length; j1++) {
                            if (_this.favoriteProjects[i] == _this.projectsForSelection[j0].projects[j1].code) {
                                _this.projects.push(new Project(_this.projects.length + 1, _this.projectsForSelection[j0].projects[j1].name, _this.projectsForSelection[j0].projects[j1].code, 0, false, "", true));
                            }
                        }
                    }
                }
            };
            for (var i = 0; i < _this.favoriteProjects.length; i++) {
                _loop_1(i);
            }
            _this.ref.detectChanges();
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
            }
        });
        //Дилог добавления проектов
        $("#project-dialog").dialog({
            autoOpen: false, modal: true,
            buttons: {
                OK: function () {
                    for (var i = 0; i < _this.projectsForSelection.length; i++) {
                        for (var j = 0; j < _this.projectsForSelection[i].projects.length; j++) {
                            if (_this.projectsForSelection[i].projects[j].checked) {
                                _this.projects.push(new Project(_this.projects.length + 1, _this.projectsForSelection[i].projects[j].name, _this.projectsForSelection[i].projects[j].code, 0, false, "", _this.favoriteProjects.indexOf(_this.projectsForSelection[i].projects[j].code) != -1));
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
            for (var j = 0; j < this.projectsForSelection[i].projects.length; j++) {
                this.projectsForSelection[i].projects[j].checked = false;
            }
        }
        $("#project-dialog").dialog("open");
    };
    AppComponent.prototype.renumberProjects = function () {
        for (var i = 0; i < this.projects.length; i++) {
            this.projects[i].id = i + 1;
        }
    };
    AppComponent.prototype.removeProject = function (id) {
        this.projects.splice(id, 1);
        this.renumberProjects();
        this.ngOnChanges();
    };
    AppComponent.prototype.addComment = function (id) {
        $("#comment-id").val(id);
        $("#comment-text").val(this.projects[id].comment);
        $("#comment-dialog").dialog("open");
    };
    AppComponent.prototype.addProjectToFavorites = function (id) {
        this.projects[id].favorite = !this.projects[id].favorite;
        var searchResult = this.favoriteProjects.indexOf(this.projects[id].code);
        if (searchResult == -1) {
            this.favoriteProjects.push(this.projects[id].code);
        }
        else {
            this.favoriteProjects.splice(searchResult, 1);
        }
        this.setCookie("favorites", this.favoriteProjects.join(";"), { expires: 30 * 60 * 60 * 24 });
    };
    AppComponent.prototype.saveProjects = function () {
        var _this = this;
        var total = 0;
        for (var i = 0; i < this.projects.length; i++) {
            total = total + this.projects[i].hours;
            if (this.projects[i].hours > 24) {
                this.showMessage("Трудозатраты по проекту не могут превышать 24 часа");
                return;
            }
            ;
            if (this.projects[i].hours < 0) {
                this.showMessage("Трудозатраты по проекту не могут быть отрицательными");
                return;
            }
            ;
            if (this.projects[i].hours && this.projects[i].comment.trim() == "") {
                this.showMessage("Необходимо заполнить комментарии по всем проектам");
                return;
            }
        }
        if (total > 24) {
            this.showMessage("Трудозатраты за день не могут превышать 24 часа");
            return;
        }
        ;
        this.lockForm();
        Office.context.mailbox.getUserIdentityTokenAsync(function (asyncResult) {
            _this.saveProjectsAssync(asyncResult.value);
        });
    };
    AppComponent.prototype.saveProjectsAssync = function (token) {
        var _this = this;
        this.SaveProjectsService.saveData(this.projects, this.email, this.convertDate(this.myDate), token).then(function (data, textStatus, jqXHR) {
            _this.unlockForm();
            var jsonString = jqXHR.responseXML.childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].textContent;
            var jData = $.parseJSON(jsonString)["#value"];
            _this.showMessage(jData[0].Message);
        });
    };
    AppComponent.prototype.onHoursChange = function () {
        this.total = this.projects.reduce(function (sum, current) { return (sum + current.hours); }, 0);
    };
    AppComponent.prototype.onDateChange = function (dateRU, date) {
        if (String(new Date(this.convertDate(this.myDate))) != 'Invalid Date' && this.myDate.length == 10) {
            this.getProjectsData();
        }
    };
    AppComponent.prototype.convertDate = function (dateRU) {
        dateRU = "" + dateRU.replace(new RegExp(String.fromCharCode(8206), 'g'), "");
        var result = "" + dateRU.charAt(6) + dateRU.charAt(7) + dateRU.charAt(8) + dateRU.charAt(9) + "-" + dateRU.charAt(3) + dateRU.charAt(4) + "-" + dateRU.charAt(0) + dateRU.charAt(1);
        return result;
    };
    AppComponent.prototype.showMessage = function (message) {
        this.saveProjectResult = message;
        $('#result-dialog').dialog("open");
    };
    AppComponent.prototype.lockForm = function () {
        $("#submit-btn").attr("disabled", "disabled");
        $("#datepicker").attr("disabled", "disabled");
        $("#add-project-btn").attr("disabled", "disabled");
        $("#remove-project-btn").attr("disabled", "disabled");
        $(".project-checked").attr("disabled", "disabled");
        $(".project-hours").attr("disabled", "disabled");
        $(".add-comment").attr("disabled", "disabled");
    };
    AppComponent.prototype.unlockForm = function () {
        $("#submit-btn").attr("disabled", false);
        $("#datepicker").attr("disabled", false);
        $("#add-project-btn").attr("disabled", false);
        $("#remove-project-btn").attr("disabled", false);
        $(".project-checked").attr("disabled", false);
        $(".project-hours").attr("disabled", false);
        $(".add-comment").attr("disabled", false);
    };
    AppComponent.prototype.setCookie = function (name, value, options) {
        options = options || {};
        var expires = options.expires;
        if (typeof expires == "number" && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }
        value = encodeURIComponent(value);
        var updatedCookie = name + "=" + value;
        for (var propName in options) {
            updatedCookie += "; " + propName;
            var propValue = options[propName];
            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }
        document.cookie = updatedCookie;
    };
    AppComponent.prototype.getCookie = function (name) {
        var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            templateUrl: './app/app.component.tmp.html',
            styles: [".favorite{background-color: #e0e0eb; border-color: #e0e0eb;};\n              .filled{background-color: #e0e0eb; border-color: #e0e0eb;};"],
            providers: [projects_service_1.ProjectService, projects_for_selection_service_1.ProjectForSelectionService, save_projects_service_1.SaveProjectsService]
        }),
        __metadata("design:paramtypes", [projects_service_1.ProjectService, projects_for_selection_service_1.ProjectForSelectionService, save_projects_service_1.SaveProjectsService, typeof (_a = typeof core_1.ChangeDetectorRef !== "undefined" && core_1.ChangeDetectorRef) === "function" && _a || Object])
    ], AppComponent);
    return AppComponent;
    var _a;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map