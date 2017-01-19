import { Component } from '@angular/core';
import { ProjectService } from './projects.service';
import { ProjectForSelectionService } from './projects.for.selection.service';
import { SaveProjectsService } from './save.projects.service';

export class Project {
    id: number;
    checked: boolean;
    name: string;
    code: string;
    hours: number;
    overLimit: boolean;
    comment: string;

    constructor(id: number, name: string, code: string, hours: number, overLimit: boolean, comment: string) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.hours = hours;
        this.overLimit = overLimit;
        this.comment = comment;
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
    projectsForSelection: ProjectForSelection[] = [];

    constructor(customer: string, project: ProjectForSelection) {
        this.customer = customer;
        this.projectsForSelection = [];
        this.projectsForSelection.push(project);
    }
}

@Component({
    selector: 'my-app',
    templateUrl: './app/app.component.tmp.html',
    providers: [ProjectService, ProjectForSelectionService, SaveProjectsService]
})
export class AppComponent {
    projects: Project[] = [];
    projectsForSelection: ProjectForSelectionLine[] = [];
    total: number = 0;
    myDate: string = "";
    email: string = "";
    saveProjectResult: string = "";
    
    constructor(private ProjectSevice: ProjectService, private ProjectForSelectionSevice: ProjectForSelectionService, private SaveProjectsService: SaveProjectsService) {
        var formatter = new Intl.DateTimeFormat("ru");
        this.myDate = formatter.format(new Date);
        this.email = Office.context.mailbox.userProfile.emailAddress;        
    }
    ngOnInit() {
        this.getProjectsData()
    }
    getProjectsData() {
        Office.context.mailbox.getUserIdentityTokenAsync(asyncResult => {
            this.getProjectsDataAssync(asyncResult.value)
        });
    }
    getProjectsDataAssync(token: string) {

        $("#submit-btn").attr("disabled", false);

        this.projects = [];
        this.ProjectSevice.getData(this.email, this.convertDate(this.myDate), token).then((data: any, textStatus: string, jqXHR: JQueryXHR) => {

            let jsonString = jqXHR.responseXML.childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].textContent;
            let jData = $.parseJSON(jsonString)['#value'];

            for (var i = 0; i < jData.length; i++) {
                this.projects.push(new Project(this.projects.length + 1,
                    jData[i].ProjectName,
                    jData[i].ProjectCode,
                    jData[i].Hours,
                    jData[i].OverLimit,
                    jData[i].Comment));
                //this.total = this.total + jData[i].Hours;
            }
            this.onHoursChange();
        });

        this.projectsForSelection = [];
        this.ProjectForSelectionSevice.getData(this.email, this.convertDate(this.myDate),token).then((data: any, textStatus: string, jqXHR: JQueryXHR) => {

            let jsonString = jqXHR.responseXML.childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].textContent;
            let jData = $.parseJSON(jsonString)['#value'];

            for (var i = 0; i < jData.length; i++) {
                let customerArray: ProjectForSelectionLine[] = this.projectsForSelection.filter((val) => { return val.customer == jData[i].Customer });
                if (customerArray.length == 0) {
                    this.projectsForSelection.push(new ProjectForSelectionLine(jData[i].Customer, new ProjectForSelection(jData[i].Name, jData[i].Code)))
                } else {
                    customerArray[0].projectsForSelection.push(new ProjectForSelection(jData[i].Name, jData[i].Code));
                }
            }
        });
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
                //$("#datepicker").datepicker("hide");
            }
        });

        //Дилог добавления проектов
        $("#project-dialog").dialog({
            autoOpen: false, modal: true,
            buttons: {
                OK: () => {
                    for (var i = 0; i < this.projectsForSelection.length; i++) {
                        for (var j = 0; j < this.projectsForSelection[i].projectsForSelection.length; j++) {
                            if (this.projectsForSelection[i].projectsForSelection[j].checked) {
                                this.projects.push(new Project(this.projects.length + 1,
                                    this.projectsForSelection[i].projectsForSelection[j].name,
                                    this.projectsForSelection[i].projectsForSelection[j].code,
                                    0,
                                    false,
                                    ""));
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
            for (var j = 0; j < this.projectsForSelection[i].projectsForSelection.length; j++) {
                this.projectsForSelection[i].projectsForSelection[j].checked = false;
            }
        }
        $("#project-dialog").dialog("open");
    }
    renumberProjects() {
        for (var i = 0; i < this.projects.length; i++) {
            this.projects[i].id = i + 1;
        }
    }
    removeProject() {
        for (var i = this.projects.length - 1; i >= 0; i--) {
            if (this.projects[i].checked) {
                this.projects.splice(i, 1);
            }
        }
        this.renumberProjects();
    }
    addComment(id: number) {
        $("#comment-id").val(id);
        $("#comment-text").val(this.projects[id].comment);
        $("#comment-dialog").dialog("open");
    }
    saveProjects() {
        this.lockForm();
        Office.context.mailbox.getUserIdentityTokenAsync(asyncResult => {
            this.saveProjectsAssync(asyncResult.value)
        });
    }
    saveProjectsAssync(token: string) {
        this.SaveProjectsService.saveData(this.projects, this.email, this.convertDate(this.myDate), token).then((data: any, textStatus: string, jqXHR: JQueryXHR) => {

            let jsonString = jqXHR.responseXML.childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].textContent;
            let jData = $.parseJSON(jsonString)["#value"];
            this.unlockForm();

            if (jData[0].Result == true) {
                this.saveProjectResult = jData[0].Message;
                $('#result-dialog').dialog("open");
            }

        });
    }
    onHoursChange() {
        this.total = this.projects.reduce(function (sum, current) { return (sum + current.hours); }, 0);
    }
    onDateChange(dateRU: string, date: any) {
        this.getProjectsData();
        this.hide();
    }
    convertDate(dateRU: string) {
        dateRU = "" + dateRU.replace(new RegExp(String.fromCharCode(8206), 'g'), "");
        let result: string = "" + dateRU.charAt(6) + dateRU.charAt(7) + dateRU.charAt(8) + dateRU.charAt(9) + "-" + dateRU.charAt(3) + dateRU.charAt(4) + "-" + dateRU.charAt(0) + dateRU.charAt(1);
        return result;
    }
    lockForm() {
        $("#submit-btn").attr("disabled","disabled");
        $("#submit-btn").attr("disabled","disabled");
    }

    unlockForm() {
        $("#submit-btn").attr("disabled", false);
    }

}