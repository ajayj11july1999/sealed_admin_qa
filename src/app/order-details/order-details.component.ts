import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
export interface Employee {
  id: number;
  order_id: string;
  order_date: string;
  customer_id: string;
  diet_plan_id: string;
  price: string;
  discount: string;
  addition_charges: string;
  delivery_charges: string;
  vat: string;
  total_amount: string;
  delivery_address: string;
  billing_address: string;
  payment_mode: string;
  payment_status: string;
  payment_reference: string;
  created_at: string;
}

const employees = [
  {
    id: 1,
    order_id: 'GHR879532',
    order_date: '01/02/2023',
    customer_id: '12345875',
    diet_plan_id: 'Balanced',
    price: '10BHD',
    discount: '1BHD',
    addition_charges: '11BHD',
    delivery_charges: '1BHD',
    vat: '1BHD',
    total_amount: '22BHD',
    delivery_address: '2-23,3rd floor,Manama,Bharain,122001',
    billing_address: '2-23,3rd floor,Manama,Bharain,122001',
    payment_mode: 'Credit card',
    payment_status: 'Active',
    payment_reference: 'Active',
    created_at: '01/02/2023',
  },
  {
    id: 2,
    order_id: 'GHR879532',
    order_date: '01/02/2023',
    customer_id: '12345875',
    diet_plan_id: 'Balanced',
    price: '10BHD',
    discount: '1BHD',
    addition_charges: '11BHD',
    delivery_charges: '1BHD',
    vat: '1BHD',
    total_amount: '22BHD',
    delivery_address: '2-23,3rd floor,Manama,Bharain,122001',
    billing_address: '2-23,3rd floor,Manama,Bharain,122001',
    payment_mode: 'Credit card',
    payment_status: 'Active',
    payment_reference: 'Active',
    created_at: '01/02/2023',
  },
  {
    id: 3,
    order_id: 'GHR879532',
    order_date: '01/02/2023',
    customer_id: '12345875',
    diet_plan_id: 'Balanced',
    price: '10BHD',
    discount: '1BHD',
    addition_charges: '11BHD',
    delivery_charges: '1BHD',
    vat: '1BHD',
    total_amount: '22BHD',
    delivery_address: '2-23,3rd floor,Manama,Bharain,122001',
    billing_address: '2-23,3rd floor,Manama,Bharain,122001',
    payment_mode: 'Credit card',
    payment_status: 'Active',
    payment_reference: 'Active',
    created_at: '01/02/2023',
  },
  {
    id: 4,
    order_id: 'GHR879532',
    order_date: '01/02/2023',
    customer_id: '12345875',
    diet_plan_id: 'Balanced',
    price: '10BHD',
    discount: '1BHD',
    addition_charges: '11BHD',
    delivery_charges: '1BHD',
    vat: '1BHD',
    total_amount: '22BHD',
    delivery_address: '2-23,3rd floor,Manama,Bharain,122001',
    billing_address: '2-23,3rd floor,Manama,Bharain,122001',
    payment_mode: 'Credit card',
    payment_status: 'Active',
    payment_reference: 'Active',
    created_at: '01/02/2023',
  },
];

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
})
export class OrderDetailsComponent implements OnInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> =
    Object.create(null);

  displayedColumns: string[] = [
    '#',
    'order_id',
    'order_date',
    'customer_id',
    'diet_plan_id',
    'price',
    'discount',
    'addition_charges',
    'delivery_charges',
    'vat',
    'total_amount',
    'delivery_address',
    'billing_address',
    'payment_mode',
    'payment_status',
    'payment_reference',
    'created_at',
    'action',
  ];
  dataSource = new MatTableDataSource(employees);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator =
    Object.create(null);
  modalRef!: BsModalRef;

  constructor(private modalService: BsModalService) {}

  ngOnInit(): void {}

  toppings = new FormControl('');
  toppingList: string[] = ['Active', 'Inactive'];

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
