import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ApiServiceService } from '../service/api-service.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
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
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> =
    Object.create(null);

  // createForm = {
  //   paymentId: '',
  //   orderId: '',
  //   userName: ''
  // }
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
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator =
    Object.create(null);
  modalRef!: BsModalRef;
  isedit: boolean = false;
  paymentstatus: any;
  paymentMode: any;
  paymentList: any;
  totalCount: any = 0;
  // dataSource = new MatTableDataSource(this.paymentList);


  constructor(private modalService: BsModalService, private apiService: ApiServiceService, private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.getlistpaymentRefunds();
    console.log(this.totalCount, 'totalcount');
  }

  toppings = new FormControl('');
  toppingList: string[] = ['OnlinePayment'];

  paymentStatus = new FormControl('');
  statusList: string[] = ['Active', 'Inactive'];

  AddModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'custm_modal gray modal-sm' })
    );
  }

  // ngAfterViewInit(): void {
  //   this.dataSource.paginator = this.paginator;
  // }

  getlistpaymentRefunds() {
    this.paymentstatus = 'success,refund'
    this.paymentMode = 'online payment'
    this.apiService
      .getlistpaymentRefunds(this.paymentMode, this.paymentstatus)
      .then((res) => {
        if (res.code == 200) {
          this.paymentList = res?.data?.data ? res.data.data : [];
          this.totalCount = res?.data?.totalCount;
          console.log(this.paymentList);
          console.log(this.totalCount);
        }
        else {
          this.totalCount = 0;
          this.paymentList = []
        }

      })
      .catch((err) => {
        this.totalCount = 0;
        this.paymentList = []
        console.log(this.paymentList, "payment")
        console.log(this.paymentList.length, "length")
      });

  }
  limit: any;
  offset: any;
  pageSize: any;
  pageEvent: any;
  pageChange(e: any): void {
    console.log(e)
    let pagNo = e.pageIndex
    this.pageSize = e.pageSize;
    this.limit = this.pageSize;
    this.offset = pagNo;
    this.getlistpaymentRefunds();
  }
  Data: any
  editPayment(item) {
    this.isedit = true;
    this.Data = item
    // this.createForm = item;
  }
  Cancel() {
    this.modalService.hide();
  }
  paymentRefund() {
    // if (f.form.valid) {
    console.log(this.Data)
    console.log(this.Data?.ordersDetails[0]?._id)
    let payload = {
      orderId: this.Data?.ordersDetails[0]?._id
    }
    this.apiService.createPaymentRefunds(payload).subscribe((res) => {

      let result = res;

      if (result.code == 200) {
        this.toastr.success(result.message);
        this.isedit = false;

        this.getlistpaymentRefunds();
        this.modalRef.hide();
      } else {
        this.toastr.error(result.message);
      }

      this.spinner.hide();

    }, err => {
      this.spinner.hide();
      console.log(err)
      this.toastr.error(err?.error?.message);
    })
  }
  // else {
  //   this.toastr.warning('Please fill all the required fields');
  // }


}
