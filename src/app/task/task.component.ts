import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, NgForm } from '@angular/forms';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';

export class Task {
  constructor(
    public TaskID: number,
    public Title: string,
    public Description: string,
    public Status: string,
    public Completed: string,
    public CreatedDate: string,
    public UpdatedDate: string
  ) {
  }
}

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})

export class TaskComponent implements OnInit{

  closeResult: string;
  tasks: Task[];
  editForm: any;
  deleteId: any;
  editId: any;
  constructor(
    private httpClient: HttpClient,
    private modalService: NgbModal,
    private fb: FormBuilder
  ){}

  ngOnInit(): void{
    this.getTasks();
    this.editForm = this.fb.group({
      task_id: [''],
      title: [''],
      description: [''],
      status: [''],
      completed: ['']
    } );
  }

  getTasks(){
    this.httpClient.get<any>('http://localhost:8182/api/v1/tma/tasks').subscribe(
      response => {
        console.log(response);
        this.tasks = response.Data;
      }
    );
  }
  
  open(content: any) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  onSubmit(f: NgForm) {
    const url = 'http://localhost:8182/api/v1/tma/tasks/new';
    this.httpClient.post(url, f.value)
      .subscribe((result) => {
        this.ngOnInit(); //reload the table
      });
    this.modalService.dismissAll(); //dismiss the modal
  }

  openDetails(targetModal: any, task: Task) {
    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static',
     size: 'lg'
   });
   const titleElement = document.getElementById('title1');
   const descriptionElement = document.getElementById('description1');
   const statusElement = document.getElementById('status1');
   const completedElement = document.getElementById('completed1');
   const lastUpdElement = document.getElementById('lastUpd');
   
   if (titleElement !== null) {
     titleElement.setAttribute('value', task.Title);
   }
   
   if (descriptionElement !== null) {
     descriptionElement.setAttribute('value', task.Description);
   }

   if (statusElement !== null) {
    statusElement.setAttribute('value', task.Status);
  }

  if (completedElement !== null) {
    let completedStr = task.Completed == 't' ? 'Yes' : 'No';
    completedElement.setAttribute('value', completedStr);
  }
  
  if (lastUpdElement !== null) {
    let strLastUpd = task.UpdatedDate ? task.UpdatedDate : task.CreatedDate;
    lastUpdElement.setAttribute('value', strLastUpd);
  }
  }

  openEdit(targetModal: any, task: Task) {
    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static',
     size: 'lg'
   });
   this.editForm.patchValue({
    task_id: task.TaskID,
    title: task.Title,
    description: task.Description,
    status: task.Status,
    completed: task.Completed == 't' ? 'Yes' : 'No'
   });
  }

  onSave() {
    this.editId = this.editForm.value['task_id'];
    const editURL = 'http://localhost:8182/api/v1/tma/tasks/'+ this.editId +'/edit';
    console.log(this.editForm.value);
    this.httpClient.put(editURL, this.editForm.value)
      .subscribe((results) => {
        console.log(results);
        this.ngOnInit();
        this.modalService.dismissAll();
      });
  }

  openDelete(targetModal: any, task: Task) {
    this.deleteId = task.TaskID;
    this.modalService.open(targetModal, {
      backdrop: 'static',
      size: 'lg'
    });
  }

  onDelete() {
    const deleteURL = 'http://localhost:8182/api/v1/tma/tasks/'+ this.deleteId +'/delete';
    this.httpClient.delete(deleteURL)
      .subscribe((results) => {
        console.log(results);
        this.ngOnInit();
        this.modalService.dismissAll();
      });
  }
}
