import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
export interface Employee {
  id: number;
  custmerId: string;
  subscriptionId: string;
  amountPaid: string;
  PaymentMethod: string;
  paymentStatus: string;
  authcode: string;
  orderId: string;
}

const employees = [
  {
    id: 1,
    custmerId: '12345875',
    subscriptionId: '2568',
    amountPaid: '300',
    PaymentMethod: 'Credit Card',
    paymentStatus: 'Active',
    authcode: '12888',
    orderId: 'GHR879532',
  },
  {
    id: 2,
    custmerId: '12345875',
    subscriptionId: '2568',
    amountPaid: '300',
    PaymentMethod: 'Online Payment',
    paymentStatus: 'Active',
    authcode: '12888',
    orderId: 'GHR879532',
  },
  {
    id: 3,
    custmerId: '12345875',
    subscriptionId: '2568',
    amountPaid: '300',
    PaymentMethod: 'Credit Card',
    paymentStatus: 'Active',
    authcode: '12888',
    orderId: 'GHR879532',
  },
  {
    id: 4,
    custmerId: '12345875',
    subscriptionId: '2568',
    amountPaid: '300',
    PaymentMethod: 'Online Payment',
    paymentStatus: 'Active',
    authcode: '12888',
    orderId: 'GHR879532',
  },
];

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class PaymentsComponent implements OnInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> =
    Object.create(null);

  displayedColumns: string[] = [
    '#',
    'custmerId',
    'subscriptionId',
    'amountPaid',
    'PaymentMethod',
    'paymentStatus',
    'authcode',
    'orderId',
    'action',
  ];
  dataSource = new MatTableDataSource(employees);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator =
    Object.create(null);
  modalRef!: BsModalRef;

  constructor(private modalService: BsModalService) {}

  ngOnInit(): void {}

  toppings = new FormControl('');
  toppingList: string[] = ['Credit Card', 'OnlinePayment'];

  paymentStatus = new FormControl('');
  statusList: string[] = ['Active', 'Inactive'];

  AddModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'custm_modal gray modal-xl' })
    );
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }
}
