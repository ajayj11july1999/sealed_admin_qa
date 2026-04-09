import { Component, OnInit } from '@angular/core';
import { ApiServiceService } from '../service/api-service.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
})
export class SettingComponent implements OnInit {
  banner_management = [
    { id: '1', imgUrl: '../../assets/images/custm-nbb/upload.png' },
    // { id: '1', imgUrl: '../../assets/images/custm-nbb/upload.png' },
    // { id: '1', imgUrl: '../../assets/images/custm-nbb/upload.png' },
  ];
  Notary = [
    // { id: '1', image: '../../assets/images/custm-nbb/settings-banner.png' },
    // { id: '2', image: '../../assets/images/custm-nbb/settings-banner.png' },
    // { id: '1', imgUrl: '../../assets/images/custm-nbb/upload.png' },
  ];
  fileuploadstatus: boolean | undefined;
  selectedfile: any;
  filebase: any;
  imagelist: any;
  bannerConsumerList: any;
  bannerWebList: any;
  bannerNotaryList: any;
  advertiseList: any;
  searchLoad: boolean = false;
  constructor(
    private apiService: ApiServiceService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getBannerList('mobile');
    this.getBannerList('web');
    this.getBannerList('notary');
    this.getBannerList('advertise');
  }

  async onChange(files, type, id?) {
    console.log(files, '1234567890');
    this.fileuploadstatus = true;
    this.searchLoad = true;
    if (files && files.length > 0) {
      var file = files[0];
      let ext =
        file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) ||
        file.name;
      if (
        ext == 'png' ||
        ext == 'jpg' ||
        ext == 'pdf' ||
        ext == 'doc' ||
        ext == 'docx' ||
        ext == 'jpeg' ||
        ext == 'gif'
      ) {
        console.log('hgdjjsda1111');
        if (!(file.size > 2097152)) {
          let x: any;
          var splitted;
          // this.urls ;
          var reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = function () {
            let str: any = reader.result;
            splitted = str.split(',');
          };
          console.log('hgdjjsda1111222');
          setTimeout(() => {
            if (!id) {
              this.uploadFile(files, files[0], splitted[1], type);
            } else {
              this.uploadUpdateFile(files, files[0], splitted[1], type, id);
            }
          }, 1000);
          this.filebase = splitted;
        } else {
          this.fileuploadstatus = false;

        }
      } else {
      }
    }
  }
  async uploadFile(files, file, splitted, type) {
    const formData1: any = new FormData();
    console.log('hgdjjsda');
    formData1.append('file', file);

    await this.apiService.uploadBanner(formData1).subscribe(
      (res) => {
        if (
          res.status == true &&
          res?.data?.imgUrl &&
          res?.data?.imgUrl != ''
        ) {
          let payload = {
            name: 'banner',
            imageUrl: res?.data?.imgUrl,
            type: type,
            status: 'active',
          };
          this.apiService.createBanner(payload).subscribe((res) => {

            this.getBannerList(type);
            this.searchLoad = false;

          });
        }
        // console.log(res)     

        this.imagelist = res.data;

      },
      (err) => {
        this.fileuploadstatus = false;
      }
    );
  }
  async uploadUpdateFile(files, file, splitted, type, id) {
    const formData1: any = new FormData();
    console.log('hgdjjsda');
    formData1.append('file', file);

    await this.apiService.uploadBanner(formData1).subscribe(
      (res) => {
        if (
          res.status == true &&
          res?.data?.imgUrl &&
          res?.data?.imgUrl != ''
        ) {
          let payload = {
            name: 'banner',
            imageUrl: res?.data?.imgUrl,
            type: type,
            status: 'active',
          };
          this.apiService.updateBanner(payload, id).subscribe((res) => {
            this.getBannerList(type);
            this.searchLoad = false;
          });
        }
        this.imagelist = res.data;
      },
      (err) => {
        this.fileuploadstatus = false;
      }
    );
  }
  consumerCheck = true;
  webCheck = true;
  notaryCheck = true;
  advertiseCheck = true;

  async getBannerList(type) {

    this.apiService
      .getBannerList(type)
      .then(
        (res) => {
          if (type == 'mobile') {
            this.bannerConsumerList = res?.data?.data ? res.data.data : [];
            // if (this.bannerConsumerList?.length >= 3) {
            //   this.consumerCheck = false;
            // } else {
            //   this.consumerCheck = true;
            // }

            console.log('this.bannerConsumerList', this.bannerConsumerList);

          }
          if (type == 'web') {
            this.bannerWebList = res?.data?.data ? res.data.data : [];
            // if (this.bannerWebList?.length >= 3) {
            //   this.webCheck = false;
            // } else {
            //   this.webCheck = true;
            // }

            console.log('this.bannerWebList', this.bannerWebList);
          }
          if (type == 'notary') {
            this.bannerNotaryList = res?.data?.data ? res.data.data : [];
            // if (this.bannerNotaryList?.length >= 3) {
            //   this.notaryCheck = false;
            // } else {
            //   this.notaryCheck = true;
            // }

            console.log('this.bannerNotaryList', this.bannerNotaryList);
          }
          if (type == 'advertise') {
            this.advertiseList = res?.data?.data ? res.data.data : [];
            if (this.advertiseList?.length >= 1) {
              this.advertiseCheck = false;
            } else {
              this.advertiseCheck = true;
            }

            console.log('this.advertiseList', this.advertiseList);

          }
        },
        (err: any) => {
          if (type == 'web') {
            this.bannerWebList = [];
          }
        }
      )
      .catch((err) => { });
  }
  deleteBanner(i: any, data: any, type: any) {
    let id = data[i]?._id;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { status: 'Delete' },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
        this.apiService.deleteBanner(id).subscribe((response) => {
          console.log(type, '12234');
          this.getBannerList(type);
        }),
          (err) => { };
      }
    });
  }
}
