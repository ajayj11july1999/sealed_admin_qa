import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { type } from 'os';

import { Observable, from, observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { ZoneService } from './zone-service';
// import { JwtHelperService } from '@auth0/angular-jwt';
// import { map,tap,catcherrors} from rxjs/operators;

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})



export class ApiServiceService {
  userId: any;
  courierId: any;
    constructor(
    private auth: AuthService,
    private http: HttpClient,
   
  ) {}
  private baseUrl = environment.baseUrl; 
// ===================== ZONE MANAGEMENT =====================

 // http://localhost:3000 OR proxy url

// CREATE ZONE
createZone(payload: any) {
  return this.http.post(
    `${this.baseUrl}realtime/zones`,
    payload
  );
}

// GET ZONES
getZones(limit: number = 10, offset: number = 0, value: string = ''): Promise<any> {

  let url = `realtime/zones?limit=${limit}&offset=${offset}`;

  if (value) {
    url += `&value=${value}`;
  }

  return this.auth.guestAuthGetapi(url);

}

// UPDATE ZONE
updateZone(id: string, payload: any) {
  return this.http.put(
    `${this.baseUrl}realtime/zones/${id}`,
    payload
  );
}

// DELETE ZONE
deleteZone(id: string) {
  return this.http.delete(
    `${this.baseUrl}realtime/zones/${id}`
  );
}

  //  // ✅ Example: using ZoneService inside ApiServiceService
  // createZoneFromApi(zonePayload: any) {
  //   return this.zoneService.createZone(zonePayload);
  // }

  // getAllZonesFromApi() {
  //   return this.zoneService.getZones();
  // }
  
  // login
  LoginIn(postData: any): Observable<any> {
    const url = 'main/auth/login';
    return this.auth.postLogin(url, postData).pipe(map((res) => res));
  }

  // customer getlist
  getListUserDetails(
    usertype?: any,
    limit?: any,
    offset?: any,
    value?: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      if (value) {
        url = `main/users?userType=${usertype}&limit=${limit}&offset=${offset}&value=${value}`;
      } else {
        url = `main/users?userType=${usertype}&limit=${limit}&offset=${offset}`;
      }

      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  getListUsergetById(userId: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/users/${userId}`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  //getlistcustomerorderactivetrip
  getListCustomerActiveTrip(customerId: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/orders?userId=${customerId}&orderStatus=new,orderAssigned,orderInProgress,orderPickedUped`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  // getlistcustomerordercompletetrip
  getListCustomerCompleteTrip(customerId: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/orders?userId=${customerId}&orderStatus=delivered`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  // trip details
  getListTrip(id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/orders?_id=${id}`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
//   getListTrip(id: any): Promise<any> {
//   return new Promise((resolve, reject) => {
//     const url = `orders/${id}`;
//     this.auth.guestAuthGetapi(url)
//       .then((resp: any) => resolve(resp))
//       .catch((err: any) => reject(err));
//   });
// }

  cancelTrip(_id: any, payload: any) {
    let url = `main/orders/${_id}`;
    return this.auth.putGuestAuthApiData(url, payload).pipe(map((res) => res));
  }
  deliveredTrip(_id: any, payload: any) {
    let url = `main/orders/${_id}`;
    return this.auth.putGuestAuthApiData(url, payload).pipe(map((res) => res));
  }
  // removeCourierPartner(_id: any, payload: any) {
  //   let url = `trip/new/accept`;
  //   return this.auth.putGuestAuthApiData(url, payload).pipe(map((res) => res));

  // }
  // -----------------------
  getConsumerExport(type: any, verified?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/users/excelReport/generate?userType=${type}`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  getOrderExport(_id: any, fromDate: any, toDate: any, orderstatus: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      if (fromDate && toDate && _id) {
        url = `main/orders/excelReport/generate?initiated=1&createdById=${_id ? _id : ''}&fromDate=${fromDate ? fromDate : ''}&toDate=${toDate ? toDate : ''}&orderStatus=${orderstatus ? orderstatus : ''}`;
      } else {
        url = `main/orders/excelReport/generate?initiated=1&createdById=${_id ? _id : ''}&orderStatus=${orderstatus ? orderstatus : ''}`;
      }

      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  uneffectiveDistance(payload) {
    let url = `main/trip/latLong/baseCal`;
    return this.auth.postGuestAuthApiData(url, payload).pipe(map((res) => res));
  }
//flagged consumer list
getFlaggedUsers(limit: number = 50, offset: number = 0): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = `main/users/restrictions/flagged?limit=${limit}&offset=${offset}`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => resolve(resp))
        .catch((err: any) => reject(err));
    });
  }
  getUserRestrictionsDetails(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = `main/users/${userId}/restrictions`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => resolve(resp))
        .catch((err: any) => reject(err));
    });
  }
  blockUser(userId: string, reason?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = `main/users/${userId}/block`;
      this.auth.putGuestAuthApiData(url, { reason: reason || 'Blocked by admin' }).subscribe(
        (resp: any) => resolve(resp),
        (err: any) => reject(err)
      );
    });
  }
  unblockUser(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = `main/users/${userId}/unblock`;
      this.auth.putGuestAuthApiData(url, {}).subscribe(
        (resp: any) => resolve(resp),
        (err: any) => reject(err)
      );
    });
  }

  // courier getlist
  getListCouriergetById(courierId: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/deliveryman/${courierId}`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  //getlistcourierorderactivetrip
  getlistCourierActiveTrip(courierId: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/orders?assignedToId=${courierId}&orderStatus=orderAssigned,orderInProgress,orderPickedUped`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  // getlistcourierordercompletetrip

  getlistCourierCompleteTrip(courierId: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/orders?assignedToId=${courierId}&orderStatus=delivered`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  updateCourierVerified(courierId: any, verified: any) {
    let url = `main/deliveryman/${courierId}`;
    return this.auth.putGuestAuthApiData(url, verified).pipe(map((res) => res));
  }
  //delete courier
  deleteCourier(courierId: any) {
    let url = `main/deliveryman/${courierId}`;
    return this.auth.deleteGuestAuthApiData(url).pipe(map((res) => res));
  }

  //deliveryman generate payout
  getCompletedTripList(
    courierId: any,
    paymentMode: any,
    paymentStatus: any,
    fromDate: any,
    toDate: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `main/orders/generate/payout?assignedToId=${courierId}&paymentMode=${paymentMode}&paymentStatus=${paymentStatus}`;
      if (fromDate) {
        url += `&fromDate=${fromDate}`;
      }
      if (toDate) {
        url += `&toDate=${toDate}`;
      }

      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  updatePaymentStatus(payload: any) {
    let url = `main/payout/`;
    return this.auth.postGuestAuthApiData(url, payload).pipe(map((res) => res));
  }
  // courier payout history
  getlistPayoutHistory(courierId: any, limit: any = 9, offset: any = 0): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `main/deliveryPay/get/history?deliveryManId=${courierId}&limit=${limit}&offset=${offset}`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  getlistPayoutHistoryView(id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/payout/${id}`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  

  deleteBanner(id: any) {
    let url = `main/banner/${id}`;
    return this.auth.deleteGuestAuthApiData(url).pipe(map((res) => res));
  }

  updateBanner(data: any, id: any) {
    let url = `main/banner/${id}`;
    return this.auth.putGuestAuthApiData(url, data).pipe(map((res) => res));
  }

  getAllCourierDetails(
  role: string = 'deliveryman',
  limit: number = 9,
  offset: number = 0,
  value: string = '',
  verified?: string
): Promise<any> {
  return new Promise((resolve, reject) => {

    const url =
      `main/deliveryman` +
      `?deliveryManType=${role}` +
      `&limit=${limit}` +
      `&offset=${offset}` +
      `&value=${value}` +
      `&verified=${verified ?? ''}`;

    this.auth
      .guestAuthGetapi(url)
      .then(resolve)
      .catch(reject);
  });
}

  // getAllCourierDetails(
  //   role?: any,
  //   deliveryman?: any,
  //   limit?: any,
  //   offset?: any,
  //   value?: any,
  //   verified?: any
  // ): Promise<any> {
  //   return new Promise((resolve, reject) => {
      

  //     let url = `main/deliveryman?deliveryManType=${deliveryman}&limit=${limit}&offset=${offset}&value=${value ? value : ''}&verified=${verified ? verified : ''}`;
  //     this.auth
  //       .guestAuthGetapi(url)
  //       .then((resp: any) => {
  //         resolve(resp);
  //       })
  //       .catch((err: any) => {
  //         reject(err);
  //       });
  //   });
  // }
  getBannerList(type?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = `main/banner?type=${type}`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  UploadFile(fileData: File | FormData | FileList): Observable<any> {
    // Ensure FormData is used so browser sets the correct multipart boundaries
    let formData: FormData;

    if (fileData instanceof FormData) {
      formData = fileData;
    } else {
      formData = new FormData();
      if (fileData instanceof FileList) {
        if (fileData.length > 0) {
          formData.append('file', fileData[0]);
        }
      } else if (fileData instanceof File) {
        formData.append('file', fileData);
      }
    }

    this.userId = localStorage.getItem('useridA')
      ? JSON.parse(localStorage.getItem('useridA') || '')
      : '';

    this.courierId = localStorage.getItem('courierViewId')
      ? JSON.parse(localStorage.getItem('courierViewId') || '')
      : '';

    const url = environment.baseUrl + `main/file/upload/${this.courierId}`;
    return this.http
      .post<any>(url, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event: any) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              const progress = Math.round((100 * event.loaded) / event.total);
              return { status: 'progress', message: progress };
            case HttpEventType.Response:
              return event.body;
            default:
              return `Unhandled event: ${event.type}`;
          }
        }),
        catchError(this.handleError('UploadFile', []))
      );
  }
  WithoutUploadFile(fileData): Observable<any> {
    // console.log('FROM file upload ==>', fileData);



    let url = environment.baseUrl + `main/file/fileUpload`;
    return this.http
      .post<any>(url, fileData,
        {
          // headers: {
          //   // Authorization: `${sessionStorage.getItem('token')}`,
          //   // userId: this.userId,
          // },
          reportProgress: true,
          observe: 'events',
        })
      .pipe(
        map((event: any) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              const progress = Math.round((100 * event.loaded) / event.total);
              return { status: 'progress', message: progress };
            case HttpEventType.Response:
              return event.body;
            default:
              return `Unhandled event: ${event.type}`;
          }
        }),
        catchError(this.handleError('err', []))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (err: any): Observable<T> => {
      console.error(`${operation} error:`, err);

      if (err?.status === 401 || err?.status === 403) {
        // Global auth failure: clear storage and redirect
        sessionStorage.clear();
        localStorage.clear();
      }

      // Always re-throw so callers can handle as needed
      return throwError(() => err);
    };
  }

  // getlistb2bcustomer

  getAllb2bCustomer(
    usertype?: any,
    limit?: any,
    offset?: any,
    value?: any, verified?: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {

      let url = `main/users?userType=${usertype}&limit=${limit}&offset=${offset}&value=${value ? value : ''
        }&verified=${verified ? verified : ''}`;


      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  updateb2bcustomer(userId: any, verified: any) {
    let url = `main/users/${userId}`;
    return this.auth.putGuestAuthApiData(url, verified).pipe(map((res) => res));
  }
  updateStatus(courierId: any, status: any) {
    let url = `main/deliveryman/${courierId}`;
    return this.auth.putGuestAuthApiData(url, status).pipe(map((res) => res));
  }
  deleteb2bcustomer(courierId: any) {
    let url = `main/users/${courierId}`;
    return this.auth.deleteGuestAuthApiData(url).pipe(map((res) => res));
  }
  //---------- getlistb2bcustomer -----

  createBanner(payload: any) {
    let url = `main/banner`;
    return this.auth.postGuestAuthApiData(url, payload).pipe(map((res) => res));
  }
  // -----     banner management    ----

  uploadBanner(fileData: File | FormData | FileList): Observable<any> {
    // Ensure we send a FormData payload for file uploads
    let formData: FormData;

    if (fileData instanceof FormData) {
      formData = fileData;
    } else {
      formData = new FormData();
      if (fileData instanceof FileList) {
        if (fileData.length > 0) {
          formData.append('file', fileData[0]);
        }
      } else if (fileData instanceof File) {
        formData.append('file', fileData);
      }
    }

    const url = environment.baseUrl + `main/file/bannerUpload`;

    return this.http
      .post<any>(url, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event: any) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              const progress = Math.round((100 * event.loaded) / event.total);
              return { status: 'progress', message: progress };
            case HttpEventType.Response:
              return event.body;
            default:
              return `Unhandled event: ${event.type}`;
          }
        }),
        catchError(this.handleError('uploadBanner', []))
      );
  }

  getListDemoReq(limit?: any, offset?: any, value?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      if (value) {
        url = `main/demo?limit=${limit}&offset=${offset}&value=${value}&demoStatus=new`;
      } else {
        url = `main/demo?limit=${limit}&offset=${offset}&demoStatus=new`;
      }

      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  updatedemoList(userId: any, verified: any) {
    let url = `main/demo/${userId}`;
    return this.auth.putGuestAuthApiData(url, verified).pipe(map((res) => res));
  }
  // ---------dashboard page api-------
  getconsumerActiveTrip(usertype: any, orderStatus: any, fromDate: any, toDate: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/orders?type=${usertype}&orderStatus=${orderStatus}&fromDate=${fromDate ? fromDate : ""}&toDate=${toDate ? toDate : ""}`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  getListAllActiveDeliveryMan(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/deliveryman/active/list?`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  getListAllactiveDeliveryMan(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/deliveryman/active/list?&status=true`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

assignDeliveryManUpdate(orderId: any, payload: any) {
  let url = `main/orders/accept/${orderId}`;
  return this.auth.putGuestAuthApiData(url, payload);
}

  // --------dashboard end-----------

  // --------get all trips---------
  getListAllTrip(limit: any, offset: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/orders/admin/list?initiated=1&limit=${limit}&offset=${offset}`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  searchFilterByb2bcustomer(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/users/b2bCust/list?userType=subadmin`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  // 
  searchBySubAdmin(limit: any, offset: any, _id: any, orderStatus: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      if (_id) {
        url = `main/orders/admin/list?initiated=1&limit=${limit}&offset=${offset}&createdById=${_id}`;
      }
      else {
        url = `main/orders/admin/list?initiated=1&limit=${limit}&offset=${offset}&orderStatus=${orderStatus ? orderStatus : ""}`;
      }


      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  searchFilterByTripId(orderCode: any, limit: any, offset: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';

      url = `main/orders/admin/list?orderCode=${orderCode}&initiated=1&limit=${limit}&offset=${offset}`;

      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  searchFilterByDate(
    orderCode: any,
    _id: any,
    fromDate: any,
    toDate: any,
    limit: any,
    offset: any, orderStatus
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      if (_id) {
        url = `main/orders/admin/list?orderCode=${orderCode ? orderCode : ''}&createdById=${_id ? _id : ''}&initiated=1&fromDate=${fromDate ? fromDate : ""}&toDate=${toDate ? toDate : ""}&limit=${limit ? limit : ''}&offset=${offset ? offset : ''}&orderStatus=${orderStatus ? orderStatus : ''}`;
      } else {
        url = `main/orders/admin/list?orderCode=${orderCode ? orderCode : ''}&initiated=1&fromDate=${fromDate ? fromDate : ""}&toDate=${toDate ? toDate : ''}&limit=${limit ? limit : ""}&offset=${offset ? offset : ''}`;

      }
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  searchFilteractiveDate(
    fromDate: any,
    toDate: any,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/orders/dashboard/active?type=s2b&fromDate=${fromDate ? fromDate : ""}&toDate=${toDate ? toDate : ""}`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  searchFilterconsumerDate(
    fromDate: any,
    toDate: any,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/orders/dashboard/active?type=consumer&fromDate=${fromDate ? fromDate : ""}&toDate=${toDate ? toDate : ""}`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  tripdata(type: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/orders/dashboard/active?type=${type}`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  b2ctripdata(type: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/orders/dashboard/active?type=${type}`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  // payout screen  getlistt
  getlistPayout(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/payout`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }


  // create subAdminn
  createAdmin(postData: any, userId: any): Observable<any> {
    let url = ``;
    if (!userId) {
      url = `main/users/register`;
      return this.auth.guestpost(url, postData).pipe(map(res => res));
    } else {
      url = `main/users/${userId}`
      return this.auth.putGuestAuthApiData(url, postData).pipe(map(res => res));
    }


  }
  createWageAmount(postData: any, id: any): Observable<any> {
    let url = ``;
    if (!id) {
      url = `main/wageAmount`;
      return this.auth.guestpost(url, postData).pipe(map(res => res));
    } else {
      url = `main/wageAmount/${id}`
      return this.auth.putGuestAuthApiData(url, postData).pipe(map(res => res));
    }
  }
  deleteWageAmount(id: any) {
    let url = `main/wageAmount/${id}`;
    return this.auth.deleteGuestAuthApiData(url).pipe(map((res) => res));
  }
  getlistWageAmount(limit?: any, offset?: any, value?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      if (value) {
        url = `main/wageAmount?limit=${limit}&offset=${offset}&value=${value}`;
      } else {
        url = `main/wageAmount?limit=${limit ? limit : ""}&offset=${offset ? offset : ""}`;
      }
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });

  }
  getSubAdmin(
    usertype?: any,
    limit?: any,
    offset?: any,
    value?: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      if (value) {
        url = `main/users?userType=${usertype}&limit=${limit}&offset=${offset}&value=${value}`;
      } else {
        url = `main/users?userType=${usertype}&limit=${limit}&offset=${offset}`;
      }
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }


  resetPassword(postData: any): Observable<any> {
    let url = `main/auth/resetPassword`
    return this.auth.postGuestAuthApiData(url, postData).pipe(map(res => res));

  }
  getOrderTableDetails(limit: any, offset: any, value: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      if (value) {
        url = `main/orders/admin/list?initiated=1&limit=${limit}&offset=${offset}&value=${value}`;
      }
      else {
        url = `main/orders/admin/list?initiated=1&limit=${limit}&offset=${offset}`;
      }

      this.auth.guestAuthGetapi(url).then((resp: any) => {

        resolve(resp);
      }).catch((err: any) => {
        reject(err);
      });
    });
  }

  createFaq(postData: any, id: any): Observable<any> {
    let url = `main/feedBack`;
    if (id) {
      url = `main/feedBack/${id}`
      return this.auth.putGuestAuthApiData(url, postData).pipe(map(res => res));

    } else {
      return this.auth.guestpost(url, postData).pipe(map(res => res));
    }
  }
  deleteFaq(id: any) {
    let url = `main/feedBack/${id}`;
    return this.auth.deleteGuestAuthApiData(url).pipe(map((res) => res));
  }

  getlistFaq(limit?: any, offset?: any, value?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `main/feedBack?limit=${limit}&offset=${offset}`;
      if (value) {
        url += `&value=${value}`;
      }
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  getReviewList(limit?: any, offset?: any, value?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      if (value) {
        url = `main/review?limit=${limit}&offset=${offset}&value=${value}`;
      } else {
        url = `main/review?limit=${limit ? limit : ''}&offset=${offset ? offset : ''}`;
      }

      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  createCategory(postData: any,): Observable<any> {
    let url = `main/categories`;
    return this.auth.guestpost(url, postData).pipe(map(res => res));
  }
  updateCategory(postData: any, id: any) {
    let url = `main/categories/${id}`;
    return this.auth.putGuestAuthApiData(url, postData).pipe(map((res) => res));
  }
  getlistCategory(limit?: any, offset?: any, value?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      if (value) {
        url = `main/categories?limit=${limit}&offset=${offset}&value=${value}`;
      } else {
        url = `main/categories?limit=${limit ? limit : ""}&offset=${offset ? offset : ""}`;
      }
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  createSubCategoryTypes(postData: any,): Observable<any> {
    let url = `main/subCategories`;
    return this.auth.guestpost(url, postData).pipe(map(res => res));

  }
  updateCategoryTypes(postData: any, id: any) {
    let url = `main/subCategories/${id}`;
    return this.auth.putGuestAuthApiData(url, postData).pipe(map((res) => res));
  }
  deleteCategoryTypes(id: any) {
    let url = `main/subCategories/${id}`;
    return this.auth.deleteGuestAuthApiData(url).pipe(map((res) => res));
  }
  getlistSubCategoryTypes(limit?: any, offset?: any, value?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      if (value) {
        url = `main/subCategories?limit=${limit}&offset=${offset}&value=${value}`;
      } else {
        url = `main/subCategories?limit=${limit}&offset=${offset}`;
      }
      this.auth.guestAuthGetapi(url).then((resp: any) => {
        resolve(resp);
      })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  createBookingInstruction(postData: any, id: any): Observable<any> {
    if (id) {
      let url = `main/bookingInstructions/${id}`;
      return this.auth.putGuestAuthApiData(url, postData).pipe(map((res) => res));
    } else {
      let url = `main/bookingInstructions`;
      return this.auth.guestpost(url, postData).pipe(map(res => res));
    }
  }

  getlistBookingInstruction(limit?: any, offset?: any, value?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      if (value) {
        url = `main/bookingInstructions?limit=${limit}&offset=${offset}&value=${value}`;
      } else {
        url = `main/bookingInstructions?limit=${limit}&offset=${offset}`;
      }
      this.auth.guestAuthGetapi(url).then((resp: any) => {
        resolve(resp);
      })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  getPdfExcelDownload(path, type): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `${path ? path : ''}main/excelReport/generate?type=${type ? type : ""}`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  getPdfExcelHistoryDownload(path, type, id): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `${path ? path : ''}/excelReport/generate/history?type=${type ? type : ""}&deliverymanId=${id ? id : ''}`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  getSearchExcelDownload(type, fromDate, toDate, id, status): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/trip/excelReport/generate/${type}?fromDate=${fromDate ? fromDate : ''}&toDate=${toDate ? toDate : ''}&createdById=${id ? id : ''}&orderStatus=${status ? status : ''}`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  createAboutUs(postData: any, id: any): Observable<any> {
    if (id) {
      let url = `main/aboutUs/${id}`;
      return this.auth.putGuestAuthApiData(url, postData).pipe(map((res) => res));
    }
    else {
      let url = `main/aboutUs`;
      return this.auth.guestpost(url, postData).pipe(map(res => res));
    }
  }
  getAboutUs(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `main/aboutUs`;

      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  // Balaji


  createCoupon(postData: any, id: any): Observable<any> {
    if (id) {
      let url = `main/couponMaster/${id}`;
      return this.auth.putGuestAuthApiData(url, postData).pipe(map((res) => res));
    } else {
      let url = `main/couponMaster`;
      return this.auth.guestpost(url, postData).pipe(map(res => res));
    }

  }
  getlistCoupon(limit?: any, offset?: any, value?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      if (value) {
        url = `main/couponMaster?limit=${limit}&offset=${offset}&value=${value}`;
      } else {
        url = `main/couponMaster?limit=${limit ? limit : ""}&offset=${offset ? offset : ""}`;
      }
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  deleteCoupon(courierId: any) {
    let url = `main/couponMaster/${courierId}`;
    return this.auth.deleteGuestAuthApiData(url).pipe(map((res) => res));
  }

  createkmPriceMaster(postData: any, id: any): Observable<any> {
    if (id) {
      let url = `main/kmPriceMaster/${id}`;
      return this.auth.putGuestAuthApiData(url, postData).pipe(map((res) => res));
    } else {
      let url = `main/kmPriceMaster`;
      return this.auth.guestpost(url, postData).pipe(map(res => res));
    }

  }
  getlistkmPriceMaster(limit?: any, offset?: any, value?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      if (value) {
        url = `main/kmPriceMaster?limit=${limit}&offset=${offset}&value=${value}`;
      } else {
        url = `main/kmPriceMaster?limit=${limit ? limit : ""}&offset=${offset ? offset : ""}`;
      }
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  deletekmPriceMaster(id: any) {
    let url = `main/kmPriceMaster/${id}`;
    return this.auth.deleteGuestAuthApiData(url).pipe(map((res) => res));
  }


  createdocumentPrice(postData: any, id: any): Observable<any> {
    if (id) {
      let url = `main/documentPrice/${id}`;
      return this.auth.putGuestAuthApiData(url, postData).pipe(map((res) => res));
    } else {
      let url = `main/documentPrice`;
      return this.auth.guestpost(url, postData).pipe(map(res => res));
    }

  }
  getlistdocumentPrice(limit?: any, offset?: any, value?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      if (value) {
        url = `main/documentPrice?limit=${limit}&offset=${offset}&value=${value}`;
      } else {
        url = `main/documentPrice?limit=${limit ? limit : ""}&offset=${offset ? offset : ""}`;
      }
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  deletedocumentPrice(id: any) {
    let url = `main/documentPrice/${id}`;
    return this.auth.deleteGuestAuthApiData(url).pipe(map((res) => res));
  }


  createTypeStamp(postData: any, id: any): Observable<any> {
    if (id) {
      let url = `main/stampMaster/${id}`;
      return this.auth.putGuestAuthApiData(url, postData).pipe(map((res) => res));
    } else {
      let url = `main/stampMaster`;
      return this.auth.guestpost(url, postData).pipe(map(res => res));
    }

  }
  getDropDownTypeStamp(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `main/stampMaster/all`;

      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  getlistTypeStamp(limit?: any, offset?: any, value?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      if (value) {
        url = `main/stampMaster?limit=${limit}&offset=${offset}&value=${value}`;
      } else {
        url = `main/stampMaster?limit=${limit ? limit : ""}&offset=${offset ? offset : ""}`;
      }
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  deleteTypeStamp(id: any) {
    let url = `main/stampMaster/${id}`;
    return this.auth.deleteGuestAuthApiData(url).pipe(map((res) => res));
  }

  createMasterStamp(postData: any, id: any): Observable<any> {
    // Helper for create/update stamp. Uses AuthService (with centralized headers) + interceptor.
    const url = id ? `main/stamp/${id}` : `main/stamp`;

    // Add diagnostics log to catch missing token or malformed content.
    const token = (sessionStorage.getItem('tokenA') || '').toString().replace(/^Bearer\s+/i, '');
    if (!token) {
      console.warn('Creating/Updating stamp request without token. Check login flow and sessionStorage.tokenA');
    }

    if (id) {
      return this.auth.putGuestAuthApiData(url, postData).pipe(map((res) => res));
    } else {
      return this.auth.guestpost(url, postData).pipe(map((res) => res));
    }
  }

  createMasterStampDirect(postData: any, id: any): Observable<any> {
    const endpoint = id ? `main/stamp/${id}` : `main/stamp`;
    const headers = this.auth.getAuthHeaders();
    const fullUrl = `${this.baseUrl}${endpoint}`;
    return this.http.post<any>(fullUrl, postData, { headers }).pipe(
      catchError((error) => {
        console.error('createMasterStampDirect error', error);
        throw error;
      }),
      map((res) => res)
    );
  }
  getlistMasterStamp(limit?: any, offset?: any, value?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      if (value) {
        url = `main/stamp?limit=${limit}&offset=${offset}&value=${value}`;
      } else {
        url = `main/stamp?limit=${limit ? limit : ""}&offset=${offset ? offset : ""}`;
      }
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  deleteMasterStamp(id: any) {
    let url = `main/stamp/${id}`;
    return this.auth.deleteGuestAuthApiData(url).pipe(map((res) => res));
  }

 createStore(postData: any, id: any = null): Observable<any> {
  const url = id ? `main/store/${id}` : `main/store`;
  const apiCall = id 
    ? this.auth.putGuestAuthApiData(url, postData) 
    : this.auth.guestpost(url, postData);

  return apiCall.pipe(map(res => res));
}

getStoreDropdown(): Promise<any> {
  return this.auth.guestAuthGetapi(`main/store/all`);
}

getStoreList(limit: number = 10, offset: number = 0, value: string = ''): Promise<any> {
  let url = `main/store?limit=${limit}&offset=${offset}`;

  if (value) {
    url += `&value=${value}`;
  }

  return this.auth.guestAuthGetapi(url);
}

deleteStore(id: string): Observable<any> {
  return this.auth
    .deleteGuestAuthApiData(`main/store/${id}`)
    .pipe(map(res => res));
}


// CREATE OR UPDATE VEHICLE
saveVehicle(postData: any, id: any): Observable<any> {
  if (id) {
    let url = `main/vehicle/${id}`;
    return this.auth.putGuestAuthApiData(url, postData).pipe(map(res => res));
  } else {
    let url = `main/vehicle`;
    return this.auth.guestpost(url, postData).pipe(map(res => res));
  }
}

// VEHICLE DROPDOWN
getVehicleDropdown(): Promise<any> {
  return new Promise((resolve, reject) => {
    let url = `main/vehicle/all`;

    this.auth.guestAuthGetapi(url)
      .then((resp: any) => resolve(resp))
      .catch((err: any) => reject(err));
  });
}

// GET VEHICLE LIST
getVehicleList(limit?: any, offset?: any, value?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let url = '';

    if (value) {
      url = `main/vehicle?limit=${limit}&offset=${offset}&value=${value}`;
    } else {
      url = `main/vehicle?limit=${limit ? limit : ""}&offset=${offset ? offset : ""}`;
    }

    this.auth.guestAuthGetapi(url)
      .then((resp: any) => resolve(resp))
      .catch((err: any) => reject(err));
  });
}

// DELETE VEHICLE
deleteVehicle(id: any) {
  let url = `main/vehicle/${id}`;
  return this.auth.deleteGuestAuthApiData(url).pipe(map(res => res));
}


  getimageDownload(imageUrl: any): Observable<any> {

    let url = `main/imageDownload?imageUrl=${imageUrl ? imageUrl : ''}`;
    return this.auth.guestpost(url, imageUrl).pipe(map(res => res));
  }

  getDeliveryPay(limit: number, offset: number, deliveryManId?: string): Observable<any> {
    let url = `main/deliveryPay?limit=${limit}&offset=${offset}`;
    if (deliveryManId) {
      url += `&deliveryManId=${deliveryManId}`;
    }
    return this.auth.getGuestAuthApiData(url);
  }

  getPayout(id: string): Observable<any> {
    const url = `main/payout?paidById=${id}`;
    return this.auth.getGuestAuthApiData(url);
  }

  getlistCPPayout(limit?: any, offset?: any, value?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = 'main/deliveryPay';
      if (value) {
        url = `main/deliveryPay?limit=${limit}&offset=${offset}&value=${value}`;
      } else {
        url = `main/deliveryPay?limit=${limit ? limit : ""}&offset=${offset ? offset : ""}`;
      }
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  addpayout(postData: any, id: any): Observable<any> {
    if (id) {
      let url = `main/deliveryPay/${id}`;
      return this.auth.putGuestAuthApiData(url, postData).pipe(map((res) => res));
    } else {
      let url = `main/deliveryPay`;
      return this.auth.guestpost(url, postData).pipe(map(res => res));
    }

  }
   getpayoutHistoryById(id: any, limit: any, offset: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/deliveryPay/get/history?deliveryManId=${id}&limit=${limit ? limit : 0}&offset=${offset ? offset : 0}`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }


  getlistTerms(limit?: any, offset?: any, value?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      if (value) {
        url = `main/termsAndCondition?limit=${limit}&offset=${offset}&value=${value}`;
      } else {
        url = `main/termsAndCondition?limit=${limit ? limit : ""}&offset=${offset ? offset : ""}`;
      }
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  gettermsById(id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';
      url = `main/termsAndCondition/${id ? id : ""}`;
      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  createTerms(postData: any, id: any): Observable<any> {
    if (id) {
      let url = `main/termsAndCondition/${id}`;
      return this.auth.putGuestAuthApiData(url, postData).pipe(map((res) => res));
    } else {
      let url = `main/termsAndCondition`;
      return this.auth.guestpost(url, postData).pipe(map(res => res));
    }
  }

  // success, refund
  getlistpaymentRefunds(paymentMode?: any, paymentstatus?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '';

      url = `main/payment?paymentMode=${paymentMode ? paymentMode : ''}&paymentStatus=${paymentstatus ? paymentstatus : ''}`;

      this.auth
        .guestAuthGetapi(url)
        .then((resp: any) => {
          resolve(resp);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  createPaymentRefunds(postData: any,): Observable<any> {
    // if (id) {
    let url = `main/payment/razorPay/refund`;
    return this.auth.guestpost(url, postData).pipe(map((res) => res));
    // } else {
    //   let url = `payment/razorPay/refund`;
    //   return this.auth.guestpost(url, postData).pipe(map(res => res));
    // }
  }

 getextraCharges(limit?: any, offset?: any, value?: any): Promise<any> {
  const url = `main/extraCharges?limit=${limit || ''}&offset=${offset || ''}&value=${value || ''}`;
  return this.auth.guestAuthGetapi(url);
}

addcharge(postData: any): Observable<any> {
  const url = "main/extraCharges";
  return this.auth.postGuestAuthApiData(url, postData);
}

updatecharge(postData: any, id: any): Observable<any> {
  const url = `main/extraCharges/${id}`;
  return this.auth.putGuestAuthApiData(url, postData);
}


}



