import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CouriersComponent } from '../couriers/couriers.component';
import { ApiServiceService } from '../service/api-service.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';

interface Action {
  name: string;
  check: boolean;
}
interface Page {
  page_name: string;
  name_type: string;
  action: Action[];
}
@Component({
  selector: 'app-courier-view',
  templateUrl: './courier-view.component.html',
  styleUrls: ['./courier-view.component.scss'],
})
export class CourierViewComponent implements OnInit {
  courierId: any;
  courierdetails;
  type: any;
  fileuploadstatus: boolean | undefined;
  selectedfile: any;
  filebase: any;
  toastService: any;
  translate: any;
  documentList: any;
  documentUpload: any;
  element: any;
  imagelist: any = [];
  userId: any;
  isVerified: any;
  viewshow: boolean = false;
  viewshowcomplete: boolean = false;
  name: any;
  email: any;
  activetrip: any;
  completetrip: any;
  showAdd: any;
  showEdit: any;
  showExport: any;
  userInfo: any;
  userrole: any;

  constructor(private router: Router, public toastr: ToastrService, private https: HttpClient,
    private apiService: ApiServiceService, public spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    // console.log(localStorage.getItem('courierViewId'),'dfsfdff')
    this.courierId = localStorage.getItem('courierViewId')
      ? JSON.parse(localStorage.getItem('courierViewId') || '')
      : '';

    console.log(this.courierId);

    this.getCourierView();
    this.loadActiveTrips();
    this.loadCompleteTrips();
    // this.verifystatus();
    this.userInfo = JSON.parse(localStorage.getItem('userInfoA') as never);

    this.userrole = this.userInfo?.role;
    if (this.userrole == 'subadmin') {
      let pageDetails: any = JSON.parse(localStorage.getItem('pageAccess') || '')

      console.log(pageDetails, "aaa")

      if (pageDetails.length > 0) {
        const getTrueViewActions = (pages: Page[], type: any): Page[] =>
          pages.filter(page => page.action.some(action => action.name === type && action.check && page.page_name == "Courier partners"));
        // this.showAdd = getTrueViewActions(pageDetails, 'Add')?.length ? true : false
        // console.log(this.showAdd)
        this.showEdit = getTrueViewActions(pageDetails, 'Edit')?.length ? true : false
        console.log(this.showEdit)
      }
    }
  }

  // verifystatus() {
  //   let verified = {
  //     isVerified: 'true',
  //     name: this.courierdetails?.name,
  //     email: this.courierdetails?.email,

  //   };

  //   this.apiService
  //     .updateCourierVerified(this.courierId, verified)
  //     .subscribe((response) => {
  //       console.log(response)
  //       if (response.code === 200) {
  //         console.log('success');
  //         this.toastr.success(response?.message)
  //         this.getCourierView();
  //       } else {
  //         console.log(response);

  //         this.toastr.warning(response?.message)

  //       }
  //     }, (err: any) => {
  //       console.log(err)
  //       this.toastr.error(err?.error?.message)

  //       // this.fileuploadstatus = false;
  //     })


  // }
  verifystatus() {
    let verified = {
      isVerified: 'true',  // Ensure this is the correct value (it could be a boolean instead of a string)
      name: this.courierdetails?.name,
      email: this.courierdetails?.email,
    };

    console.log('Sending data:', verified);  // Log the payload to check its validity

    this.apiService
      .updateCourierVerified(this.courierId, verified)
      .subscribe((response) => {
        if (response.code === 200) {
          console.log('success');
          this.toastr.success(response?.message);
          this.getCourierView();
        } else {
          console.log('Failure response:', response);
          this.toastr.error(response?.message);  // Show error instead of success
        }
      }, (err) => {
        console.log(err);
        this.toastr.error(err?.error?.message ?? 'Email Already Exist');  // Show error in case of an HTTP failure
      });
  }


  returntocourier() {
    this.router.navigate(['/couriers/master']);
  }

  getCourierView() {

    this.spinner.show();
    this.apiService
      .getListCouriergetById(this.courierId)
      .then((res) => {
        this.spinner.hide();

        this.courierdetails = res.data;
        this.isVerified = this.courierdetails.isVerified;
        console.log('Vehicle Details:', this.courierdetails?.vehicleDetails);
        this.normalizeDocuments();

      })
      .catch((err) => { });
  }

  normalizeDocuments() {
    // Normalize drivingLicense
    if (typeof this.courierdetails.drivingLicense === 'string') {
      this.courierdetails.drivingLicense = { front: this.courierdetails.drivingLicense, back: null };
    } else if (!this.courierdetails.drivingLicense) {
      this.courierdetails.drivingLicense = { front: null, back: null };
    }

    // Ensure rcBook is object
    if (!this.courierdetails.rcBook || typeof this.courierdetails.rcBook !== 'object') {
      this.courierdetails.rcBook = { front: null, back: null };
    }

    // Ensure insurance is object
    if (!this.courierdetails.insurance || typeof this.courierdetails.insurance !== 'object') {
      this.courierdetails.insurance = { front: null, back: null };
    }

    // Ensure panCard is object
    if (!this.courierdetails.panCard || typeof this.courierdetails.panCard !== 'object') {
      this.courierdetails.panCard = { front: null, back: null };
    }
  }

  // async onChange(files, type) {
  //   this.fileuploadstatus = true;

  //   if (files && files.length > 0) {
  //     var file = files[0];
  //     let ext =
  //       file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) ||
  //       file.name;

  //     if (
  //       ext == 'png' ||
  //       ext == 'jpg' ||
  //       ext == 'pdf' ||
  //       ext == 'doc' ||
  //       ext == 'docx' ||
  //       ext == 'jpeg'
  //     ) {
  //       if (!(file.size > 2097152)) {

  //         let x: any;
  //         var splitted;

  //         var reader = new FileReader();
  //         reader.readAsDataURL(file);
  //         reader.onload = function () {
  //           let str: any = reader.result;
  //           splitted = str.split(',');
  //         };
  //         setTimeout(() => {
  //           this.uploadFile(files, files[0], splitted[1], type);

  //         }, 1000);
  //         this.filebase = splitted;
  //         console.log(this.filebase);
  //         this.toastr.success('Uploaded successfully..!');
  //         this.getCourierView()
  //       } else {
  //         this.fileuploadstatus = false;
  //         this.toastr.error('Please Upload less 2mb file');
  //       }
  //     } else {
  //       this.toastr.error('Invalid file format');
  //     }
  //   }
  // }
  // async uploadFile(files, file, splitted, type) {
  //   const formData1: any = new FormData();

  //   formData1.append('file', file);
  //   console.log(type)
  //   await this.apiService.UploadFile(formData1).subscribe(
  //     (res) => {
  //       res.data;
  //       if (type == 'profile') {
  //         this.courierdetails.imgUrl = res.data.imgUrl;
  //       }
  //       else if (type == 'driving') {
  //         this.courierdetails.drivingLicense = res.data?.imgUrl;
  //       } else if (type == 'insurance') {
  //         this.courierdetails.insurance = res.data?.imgUrl;
  //       } else if (type == 'rcbook') {
  //         this.courierdetails.rcBook = res.data.imgUrl;
  //       }
  //       this.getCourierView();
  //     },
  //     (err) => {
  //       this.fileuploadstatus = false;
  //     }
  //   );

  // }


  async onChange(files, type) {

    // this.imagelist.imgUrl.value = 'src/assets/images/custm-nbb/user_dummy.png';
    if (files && files.length > 0) {
      var file = files[0];
      let ext =
        file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) ||
        file.name;
      //.png,.jpg,.pdf,.doc,.docx,.jpeg
      // console.log("file.size",file.size)
      if (
        ext == 'png' ||
        ext == 'jpg' ||
        ext == 'pdf' ||
        ext == 'doc' ||
        ext == 'docx' ||
        ext == 'jpeg'
      ) {
        if (!(file.size > 2097152)) {

          let x: any;
          var splitted;

          var reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = function () {
            let str: any = reader.result;
            splitted = str.split(',');
          };
          setTimeout(() => {
            this.uploadFile(files, files[0], splitted[1], type);

          }, 1000);

        } else {

          this.toastr.error('Please Upload less 2mb file');
        }
      } else {
        this.toastr.error('Invalid file format');
      }
    }
  }
  async uploadFile(files, file, splitted, type) {
    console.log("welcom")
    const formData1: any = new FormData();

    formData1.append('file', file);
    console.log("welcom", formData1, type)
    await this.apiService.WithoutUploadFile(formData1).subscribe(
      (res) => {
        console.log(res)
        if (type == 'profile') {
          this.courierdetails.imgUrl = res?.data?.Location;
          this.imageupdate(type, this.courierdetails.imgUrl);

        } else if (type.startsWith('insurance-')) {
          const side = type.split('-')[1]; // front or back
          if (!this.courierdetails.insurance) this.courierdetails.insurance = { front: null, back: null };
          this.courierdetails.insurance[side] = res?.data?.Location;
          this.imageupdate('insurance', this.courierdetails.insurance);

        } else if (type.startsWith('rcbook-')) {
          const side = type.split('-')[1];
          if (!this.courierdetails.rcBook) this.courierdetails.rcBook = { front: null, back: null };
          this.courierdetails.rcBook[side] = res?.data?.Location;
          this.imageupdate('rcbook', this.courierdetails.rcBook);

        } else if (type.startsWith('driving-')) {
          const side = type.split('-')[1];
          if (!this.courierdetails.drivingLicense) this.courierdetails.drivingLicense = { front: null, back: null };
          this.courierdetails.drivingLicense[side] = res?.data?.Location;
          this.imageupdate('driving', this.courierdetails.drivingLicense);

        } else if (type.startsWith('pan-')) {
          const side = type.split('-')[1];
          if (!this.courierdetails.panCard) this.courierdetails.panCard = { front: null, back: null };
          this.courierdetails.panCard[side] = res?.data?.Location;
          this.imageupdate('pan', this.courierdetails.panCard);

        }

      },
      (err) => {

      }
    );

  }
  async imageupdate(type, data) {
    let payload = {}
    if (type === 'profile') payload["imgUrl"] = data;
    else if (type === 'driving') payload['drivingLicense'] = data;
    else if (type === 'insurance') payload['insurance'] = data;
    else if (type === 'rcbook') payload['rcBook'] = data;
    else if (type === 'pan') payload['panCard'] = data;

    await this.apiService
      .updateCourierVerified(this.courierId, payload)
      .subscribe((response) => {
        if (response.code == 200) {
          this.toastr.success(response?.message)
          this.getCourierView();
        } else {
        }
      }),
      (err) => {
        // this.fileuploadstatus = false;
      };
  }
  // downloadImage(url) {
  //   const fileName = this.splitFileName(url);
  //   this.apiService.getimageDownload(url).subscribe(res => {
  //     const base64Image = res.data;

  //     // .image = "data:image/png;base64," + res.file
  //     var a = document.createElement("a"); //Create <a>
  //     a.href = "data: image / png; base64," + base64Image;

  //     a.download = fileName;
  //     a.click();
  //   })
  // }
downloadImage(url: string) {
  if (!url) return;

  // If S3 URL → direct download
  if (url.startsWith('http')) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.download = this.splitFileName(url) || 'file';
    a.click();
    return;
  }

  // Else fallback to base64 API
  this.apiService.getimageDownload(url).subscribe(res => {
    const base64 = res?.data;

    const fileName = this.splitFileName(url);
    let mimeType = 'image/png';

    if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
      mimeType = 'image/jpeg';
    } else if (fileName.endsWith('.pdf')) {
      mimeType = 'application/pdf';
    }

    const link = document.createElement("a");
    link.href = `data:${mimeType};base64,${base64}`;
    link.download = fileName;
    link.click();
  });
}
  splitFileName(url: string): string {
    // Split the URL by "/" and get the last element, which is the file name
    const parts = url.split('/');
    const fileName = parts[parts.length - 1]; // Get the last part which is the file name
    return fileName;
  }
  // downloadImage(url: string): void {
  //   const fileName = 'image.png';
  //   this.apiService.getimageDownload(url).subscribe((res) => {
  //     // Assuming `res` is the Base64 string
  //     const base64Data = res.ata; // Replace this with the actual Base64 string from the response
  //     this.downloadedImage(base64Data, fileName)

  //   },
  //     (err) => {
  //       console.error('Error downloading image:', err);
  //     }
  //   );
  // }

  convertBase64ToBlob(base64Data: string, contentType: string): Blob {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  async downloadedImage(base64Data: string, fileName: string) {
    const blob = await this.convertBase64ToBlob(base64Data, 'image/png');
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // download(): void {
  //   const base64Data = 'your-base64-data-here';
  //   this.downloadImage(base64Data, 'downloaded-image.png');
  // }
  // }
  // downloadImage(url: string) {
  //   this.http.get(url, { responseType: 'blob' }).subscribe(blob => {
  //     // Create a link element
  //     const link = document.createElement('a');
  //     link.href = URL.createObjectURL(blob);
  //     link.download = 'CoverImage.jpg'; // Set the download filename

  //     // Append link to the body, click it, and then remove it
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   }, error => {
  //     console.error('Error downloading the image: ', error);
  //   });
  // }
  moredetails(i: any) {

    this.router.navigate(['/trip_details', { id: i?._id }]);
  }

  loadActiveTrips() {
    this.viewshow = true;
    this.apiService
      .getlistCourierActiveTrip(this.courierId)
      .then((res) => {
        this.activetrip = res.data.data;

      })
      .catch((err) => { });
  }
  loadCompleteTrips() {
    this.viewshowcomplete = true;
    this.apiService
      .getlistCourierCompleteTrip(this.courierId)
      .then((res) => {
        this.completetrip = res.data.data;

      })
      .catch((err) => { });
  }

  load = false;
  loadActive() {
    this.load = true;
  }
  load1 = false;
  loadComplete() {
    this.load1 = true;
  }
  removeImage(type) {
    if (type == 'profile') {
      this.courierdetails.imgUrl = ''
    } else if (type == 'driving') {
      this.courierdetails.drivingLicense = { front: null, back: null };
    } else if (type == 'insurance') {
      this.courierdetails.insurance = { front: null, back: null };
    } else if (type == 'rcbook') {
      this.courierdetails.rcBook = { front: null, back: null };
    } else if (type == 'pan') {
      this.courierdetails.panCard = { front: null, back: null };
    }

  }

  removeDocumentSide(documentType: 'driving' | 'insurance' | 'rcbook' | 'pan', side: 'front' | 'back') {
    if (!this.courierdetails) return;

    const map: any = {
      driving: 'drivingLicense',
      insurance: 'insurance',
      rcbook: 'rcBook',
      pan: 'panCard'
    };

    const key = map[documentType];
    if (!key) return;

    if (!this.courierdetails[key] || typeof this.courierdetails[key] !== 'object') {
      this.courierdetails[key] = { front: null, back: null };
    }

    this.courierdetails[key][side] = null;
    this.imageupdate(documentType, this.courierdetails[key]);
  }
}
