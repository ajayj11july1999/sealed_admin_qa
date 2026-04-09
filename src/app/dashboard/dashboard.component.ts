import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceService } from '../service/api-service.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
export interface Data{
  orderid:any;
  price:number;
  distance:number; 
  status:string;
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  range1 = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  name = 'Angular';
  chart: any;
  chart1: any;
  datedetails: any;
  trips: any = [
    { id: 1, display: 'New S2B Trip', img1: "assets/images/box1.png", count: 75 },
    { id: 2, display: 'Active S2B Trip', img1: "assets/images/boxtick.png", count: 75 },
    { id: 3, display: 'New B2C trip', img1: "assets/images/box1.png", count: 75 },
    { id: 4, display: 'Active B2C Trip', img1: "assets/images/boxtick.png",count:75}
  ];
  // order_list = [
  //   { orderid: 12345, price: '₹350', distance: "15km", status: 'Delivered' },
  //   { orderid: 12345, price: '₹350', distance: "15km", status: 'Pending' },
  //   { orderid: 12345, price: '₹350', distance: "15km", status: 'OnProgress' },
  // ];
  displayedColumns: string[] = [];
  dateForm: FormGroup;

  toDate: any;
  start: any;
  end: any;
  datedetail: any;

  consumerdata:any;
  consumerdatas:any;
  completedOrderCount: any;
  totalOrderCount: any;
  s2bTotalCount: any;
  s2bCompletedCount: any;
  totalOrderCountPercen: any = 0;
  completedOrderCountPercen: any = 0;
  s2bTotalOrderCountPercen: any = 0;
  s2bCompletedOrderCountPercen: any = 0;
  start1: any;
  end1: any;
  s2bactive: any;
  s2bnew: any;
  b2cactive: any;
  b2cnew: any;
  type:any;
  value: undefined;
  offset = 0;
  limit = 5;
  totalCount: any;
  order_list:any[]=[];
  currentPage: number | undefined;
 


  constructor(private zone: NgZone,
    private zone1: NgZone, private formBuilder: FormBuilder, private apiService: ApiServiceService,) {
    this.dateForm = this.formBuilder.group({
      fromdate: ['', [Validators.required]],
      enddate: ['', [Validators.required]],


    })
  }

  ngOnInit(): void {
    // this.consumerfilter();
    this.s2bFilter() ;
    this.tripdata();
    this.b2ctripdata();
    
    this.displayedColumns = ['orderCode', 'finalAmount', 'totalKms', 'orderStatus'];

    this.getOrderTableDetails();
  }

  @ViewChild(DaterangepickerDirective, { static: true })
  picker!: DaterangepickerDirective;
  selected!: { startDate: moment.Moment; endDate: moment.Moment; };

  name1 = 'Angular';
  open() {
    this.picker.open();

  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
    this.zone1.runOutsideAngular(() => {
      if (this.chart1) {
        this.chart1.dispose();
      }
    });
  }
  resetDateRangeForm()  {
    this.range.reset();
    this.s2bFilter();
  }
  resetDateRangeForm1() {
    this.range1.reset();
    this.s2bFilter();
  }
  s2bFilter() {
    this.start1 = this.range?.controls['start'].value;
    this.end1 = this.range?.controls['end'].value;
    this.consumerfilter();
    this.apiService.searchFilteractiveDate(
      this.start1,
      this.end1,
    )
      .then((res) => {
        this.s2bTotalCount = res?.data?.totalOrders ;
        this.s2bCompletedCount = res?.data?.delivered;

        this.s2bTotalOrderCountPercen = ((this.s2bTotalCount / (this.s2bTotalCount + this.s2bCompletedCount)) * 100 ).toFixed(1);
        this.s2bCompletedOrderCountPercen = ((this.s2bCompletedCount / (this.s2bTotalCount + this.s2bCompletedCount)) * 100).toFixed(1);

        var chart = am4core.create("chartdiv", am4charts.PieChart);
        var chart1 = am4core.create("chartdiv1", am4charts.PieChart);
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        var pieSeries1 = chart1.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "count";
        pieSeries.dataFields.category = "name";
        pieSeries1.dataFields.value = "count";
        pieSeries1.dataFields.category = "name";
        if (chart.logo) {
          chart.logo.disabled = true;
        }
        if (chart1.logo) {
          chart1.logo.disabled = true;
        }
        // Let's cut a hole in our Pie chart the size of 30% the radius
        chart.innerRadius = am4core.percent(50);
        chart1.innerRadius = am4core.percent(50);
        pieSeries.colors.list = [
          am4core.color('#5392ff'),
          am4core.color('#95d13c'),
        ];
        pieSeries1.colors.list = [
          am4core.color('#5392ff'),
          am4core.color('#95d13c'),
        ];
        pieSeries.ticks.template.disabled = true;
        pieSeries.labels.template.hidden = true;
        pieSeries.slices.template.stroke = am4core.color("#fff");
        pieSeries.slices.template.strokeWidth = 2;
        pieSeries.slices.template.strokeOpacity = 1;
        pieSeries1.ticks.template.disabled = true;
        pieSeries1.labels.template.hidden = true;
        pieSeries1.slices.template.stroke = am4core.color("#fff");
        pieSeries1.slices.template.strokeWidth = 2;
        pieSeries1.slices.template.strokeOpacity = 1

        chart.data = [{
          "name": "Total Orders",
          "count": this.totalOrderCount ? this.totalOrderCount : 0
        }, {
          "name": "Completed Orders",
          "count": this.completedOrderCount ? this.completedOrderCount : 0
        }];
        chart1.data = [{
          "name": "Total Orders",
          "count": this.s2bTotalCount ? this.s2bTotalCount : 0
        }, {
          "name": "Completed Orders",
          "count": this.s2bCompletedCount ? this.s2bCompletedCount : 0
        }];
        console.log("chart.data", chart.data)
        if (res == 200) {

        }
      })
      .catch((err) => { })
  }
  consumerfilter(){
    this.start = this.range1?.controls['start'].value;
    this.end = this.range1?.controls['end'].value;

    this.apiService.searchFilterconsumerDate(
      this.start,
      this.end,
    )
      .then((res) => {
        console.log(res);
        this.totalOrderCount = res?.data?.totalOrders ? res.data.totalOrders : 0;
        this.completedOrderCount = res?.data?.delivered ? res.data.delivered : 0;
        this.totalOrderCountPercen = ((this.totalOrderCount / (this.totalOrderCount + this.completedOrderCount)) * 100).toFixed(1);
        this.completedOrderCountPercen = ((this.completedOrderCount / (this.totalOrderCount + this.completedOrderCount)) * 100).toFixed(1);
        // this.chartFunction();
        if (res == 200) {

        }
      })
      .catch((err) => { })
  }
  tripdata()
  {
    this.type ="s2b";
    this.apiService.tripdata(this.type)
      .then((res) => {
        this.s2bactive= res?.data?.activeor;
        this.s2bnew= res?.data?.newor;
        if (res == 200) {
        }
      })
      .catch((err) => { })
  }
  b2ctripdata() {
    this.type = "consumer";
    this.apiService.b2ctripdata(this.type)
      .then((res) => {
        this.b2cactive = res?.data?.activeor;
        this.b2cnew = res?.data?.newor;
        if (res == 200) {
        }
      })
      .catch((err) => { })
  }

  getOrderTableDetails() {
    this.apiService.getOrderTableDetails(this.limit, this.offset,this.value).then(res => {
      console.log(this.order_list);
      this.order_list = res?.data?.data;
      this.totalCount = res?.data?.totalCount ? res.data.totalCount : 0;
    
    }).catch((err) => {
    })
  }
  pageChange(e: any): void {
    this.value = undefined;
    this.offset = this.paginationOffset(e['pageIndex'], e['pageSize']);
    this.getOrderTableDetails();
  }
  paginationOffset(currentPage: any, itemsPerPage: any): number {
    let offset = currentPage * itemsPerPage + 1;
    return (offset = offset < 0 ? offset : offset - 1);
  }
  searchUserList(e: any) {
    this.offset = 0;
    this.currentPage = 0;
    this.value = e?.target?.value;
    console.log(this.value);
    this.getOrderTableDetails();
  }
}
