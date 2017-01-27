import { Component } from '@angular/core';
import { ProjectService } from './projects.service';
import { ProjectForSelectionService } from './projects.for.selection.service';
import { SaveProjectsService } from './save.projects.service';
import { enableProdMode } from '@angular/core';

enableProdMode();

export class Project {
    id: number;
    checked: boolean;
    name: string;
    code: string;
    hours: number;
    overLimit: boolean;
    comment: string;
    favorite: boolean;

    constructor(id: number, name: string, code: string, hours: number, overLimit: boolean, comment: string, favorite: boolean) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.hours = hours;
        this.overLimit = overLimit;
        this.comment = comment;
        this.favorite = favorite;
    }
}

export class ProjectForSelection {
    checked: boolean;
    name: string;
    code: string;

    constructor(name: string, code: string) {
        this.name = name;
        this.code = code;
    }
}

export class ProjectForSelectionLine {
    customer: string;
    projects: ProjectForSelection[] = [];

    constructor(customer: string, project: ProjectForSelection) {
        this.customer = customer;
        this.projects = [];
        this.projects.push(project);
    }
}

@Component({
    selector: 'my-app',
    templateUrl: './app/app.component.tmp.html',
    styles: [`.favorite{background-color: #e0e0eb; border-color: #e0e0eb;}`],
    providers: [ProjectService, ProjectForSelectionService, SaveProjectsService]
})
export class AppComponent {
    projects: Project[] = [];
    projectsForSelection: ProjectForSelectionLine[] = [];
    total: number = 0;
    myDate: string = "";
    email: string = "";
    saveProjectResult: string = "";
    favoriteProjects: string[] = [];

    constructor(private ProjectSevice: ProjectService, private ProjectForSelectionSevice: ProjectForSelectionService, private SaveProjectsService: SaveProjectsService) {
        var formatter = new Intl.DateTimeFormat("ru");
        this.email = Office.context.mailbox.userProfile.emailAddress;
        let subject: string = Office.context.mailbox.item.subject;
        let result = subject.match("(0[1-9]|1[0-9]|2[0-9]|3[01]).(0[1-9]|1[012]).[0-9]{4}");
        if (result.length == 0) {
            this.myDate = formatter.format(new Date);        
        } else {
            this.myDate = result[0];
        }
    }
    ngOnInit() {
        this.getProjectsData();

    }
    getProjectsData() {
        this.lockForm();
        //Чтение избранных проектов
        let favoritesValue: any = this.getCookie("favorites");
        if (favoritesValue != undefined) {
            this.favoriteProjects = favoritesValue.split(";");
        }
        //Получение данных по трудозатратам и доступным проектам
        Office.context.mailbox.getUserIdentityTokenAsync(asyncResult => {
            this.getProjectsDataAssync(asyncResult.value)
        });
    }
    getProjectsDataAssync(token: string) {

        $("#submit-btn").attr("disabled", false);

        this.projects = [];
        this.projectsForSelection = [];

        //Дождёмся загрузки всех ассинхронных вызовов
        Promise.all([
            this.ProjectSevice.getData(this.email, this.convertDate(this.myDate), token).then((data: any, textStatus: string, jqXHR: JQueryXHR) => {

                let jsonString = jqXHR.responseXML.childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].textContent;
                let jData = $.parseJSON(jsonString)['#value'];

                for (var i = 0; i < jData.length; i++) {
                    this.projects.push(new Project(this.projects.length + 1,
                        jData[i].ProjectName,
                        jData[i].ProjectCode,
                        jData[i].Hours,
                        jData[i].OverLimit,
                        jData[i].Comment,
                        this.favoriteProjects.indexOf(jData[i].ProjectCode) != -1));
                }
                this.onHoursChange();
                this.unlockForm();
            }),


            this.ProjectForSelectionSevice.getData(this.email, this.convertDate(this.myDate), token).then((data: any, textStatus: string, jqXHR: JQueryXHR) => {

                let jsonString = jqXHR.responseXML.childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].textContent;
                let jData = $.parseJSON(jsonString)['#value'];

                for (var i = 0; i < jData.length; i++) {
                    let customerArray: ProjectForSelectionLine[] = this.projectsForSelection.filter((val) => { return val.customer == jData[i].Customer });
                    if (customerArray.length == 0) {
                        this.projectsForSelection.push(new ProjectForSelectionLine(jData[i].Customer, new ProjectForSelection(jData[i].Name, jData[i].Code)))
                    } else {
                        customerArray[0].projects.push(new ProjectForSelection(jData[i].Name, jData[i].Code));
                    }
                }
            })
        ]).then(
            result => {
                for (let i = 0; i < this.favoriteProjects.length; i++) {
                    let element: Project = this.projects.find((value: Project, index: number, obj: Project[]) => { return value.code == this.favoriteProjects[i] });                    
                    if (element == undefined) {
                        for (let j0 = 0; j0 < this.projectsForSelection.length; j0++) {
                            for (let j1 = 0; j1 < this.projectsForSelection[j0].projects.length; j1++) {

                                if (this.favoriteProjects[i] == this.projectsForSelection[j0].projects[j1].code) {
                                    this.projects.push(new Project(this.projects.length + 1,
                                        this.projectsForSelection[j0].projects[j1].name,
                                        this.projectsForSelection[j0].projects[j1].code,
                                        0,
                                        false,
                                        "",
                                        true));
                                }

                            }
                        }
                    }
                }
            }
            

        );

}
ngAfterViewInit() {
    //Диалог выбора даты
    $("#datepicker").datepicker({
        monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
        dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        firstDay: 1,
        dateFormat: "dd.mm.yy",
        onSelect: (dateRU: string, date: any) => {
            this.myDate = dateRU;
            this.getProjectsData();
        }
    });

    //Дилог добавления проектов
    $("#project-dialog").dialog({
        autoOpen: false, modal: true,
        buttons: {
            OK: () => {
                for (var i = 0; i < this.projectsForSelection.length; i++) {
                    for (var j = 0; j < this.projectsForSelection[i].projects.length; j++) {
                        if (this.projectsForSelection[i].projects[j].checked) {
                            this.projects.push(new Project(this.projects.length + 1,
                                this.projectsForSelection[i].projects[j].name,
                                this.projectsForSelection[i].projects[j].code,
                                0,
                                false,
                                "",
                                this.favoriteProjects.indexOf(this.projectsForSelection[i].projects[j].code) != -1));
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
            OK: () => {

                let id: number = + $('#comment-id').val();
                this.projects[id].comment = $('#comment-text').val();
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
}
ngOnChanges() {
    this.total = this.projects.reduce(function (sum, current) { return (sum + current.hours); }, 0);
}
addProject() {
    for (var i = 0; i < this.projectsForSelection.length; i++) {
        for (var j = 0; j < this.projectsForSelection[i].projects.length; j++) {
            this.projectsForSelection[i].projects[j].checked = false;
        }
    }
    $("#project-dialog").dialog("open");
}
renumberProjects() {
    for (var i = 0; i < this.projects.length; i++) {
        this.projects[i].id = i + 1;
    }
}
removeProject(id: number) {
    this.projects.splice(id, 1);
    this.renumberProjects();
    this.ngOnChanges();
}
addComment(id: number) {
    $("#comment-id").val(id);
    $("#comment-text").val(this.projects[id].comment);
    $("#comment-dialog").dialog("open");
}
addProjectToFavorites(id: number) {
    this.projects[id].favorite = !this.projects[id].favorite;
    let searchResult: number = this.favoriteProjects.indexOf(this.projects[id].code)
    if (searchResult == -1) {
        this.favoriteProjects.push(this.projects[id].code);
    } else {
        this.favoriteProjects.splice(searchResult, 1);
    }
    this.setCookie("favorites", this.favoriteProjects.join(";"), { expires: 30 * 60 * 60 * 24 });
}
saveProjects() {
    let total: number = 0;
    for (let i: number = 0; i < this.projects.length; i++) {
        total = total + this.projects[i].hours;
        if (this.projects[i].hours > 24) {
            this.showMessage("Трудозатраты по проекту не могут превышать 24 часа");
            return;
        };
        if (this.projects[i].hours < 0) {
            this.showMessage("Трудозатраты по проекту не могут быть отрицательными");
            return;
        };
    }
    if (total > 24) {
        this.showMessage("Трудозатраты за день не могут превышать 24 часа");
        return;
    };

    this.lockForm();
    Office.context.mailbox.getUserIdentityTokenAsync(asyncResult => {
        this.saveProjectsAssync(asyncResult.value)
    });
}
saveProjectsAssync(token: string) {
    this.SaveProjectsService.saveData(this.projects, this.email, this.convertDate(this.myDate), token).then((data: any, textStatus: string, jqXHR: JQueryXHR) => {

        this.unlockForm();
        let jsonString = jqXHR.responseXML.childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].textContent;
        let jData = $.parseJSON(jsonString)["#value"];
        this.showMessage(jData[0].Message);

    });
}
onHoursChange() {
    this.total = this.projects.reduce(function (sum, current) { return (sum + current.hours); }, 0);
}
onDateChange(dateRU: string, date: any) {
    if (String(new Date(this.convertDate(this.myDate))) != 'Invalid Date' && this.myDate.length == 10) {
        this.getProjectsData();
    }
}
convertDate(dateRU: string) {
    dateRU = "" + dateRU.replace(new RegExp(String.fromCharCode(8206), 'g'), "");
    let result: string = "" + dateRU.charAt(6) + dateRU.charAt(7) + dateRU.charAt(8) + dateRU.charAt(9) + "-" + dateRU.charAt(3) + dateRU.charAt(4) + "-" + dateRU.charAt(0) + dateRU.charAt(1);
    return result;
}
showMessage(message: string) {
    this.saveProjectResult = message;
    $('#result-dialog').dialog("open");
}
lockForm() {
    $("#submit-btn").attr("disabled", "disabled");
    $("#datepicker").attr("disabled", "disabled");
    $("#add-project-btn").attr("disabled", "disabled");
    $("#remove-project-btn").attr("disabled", "disabled");
    $(".project-checked").attr("disabled", "disabled");
    $(".project-hours").attr("disabled", "disabled");
    $(".add-comment").attr("disabled", "disabled");
}

unlockForm() {
    $("#submit-btn").attr("disabled", false);
    $("#datepicker").attr("disabled", false);
    $("#add-project-btn").attr("disabled", false);
    $("#remove-project-btn").attr("disabled", false);
    $(".project-checked").attr("disabled", false);
    $(".project-hours").attr("disabled", false);
    $(".add-comment").attr("disabled", false);
}
setCookie(name: string, value: string, options: any) {
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
}
getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
}