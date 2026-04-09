// import { Injectable } from '@angular/core';
// import { Router } from '@angular/router';
// import Amplify, { Storage } from 'aws-amplify';
// import { Observable, of } from 'rxjs';
// import { userInfo } from 'os';
// import { environment } from './../../environments/environment';


// const privateFileList = [{ 'key': 'task', 'path': 'task' }];
// const publicFileList = [{ 'key': 'ticket', 'path': 'ticket' }];
// @Injectable({ providedIn: 'root' })
// export class S3Service {
//   constructor(private router: Router) {
//   }
//   // Both Customer and Admin will have Read/Write access
//   uploadUserFiles(file, sub): Promise<any> {
//     console.log(file);
//     return new Promise((resolve, reject) => {
//       const options = { level: 'public', contentType: 'image/jpeg' };
//       Storage.put('customer/' + sub + '/' + file.filename, file, options)
//         .then(result => resolve(result)) // {key: "test.txt"}
//         .catch(err => reject(err));

//     });
//   }

//   // Customer have Read only Access and Admin will have Read/Write access
//   uploadPublicFiles(file, filename): Promise<any> {
//     console.log(file);
//     return new Promise((resolve, reject) => {
//       console.log(publicFileList);
//       const options = { level: 'public', contentType: 'image/jpeg' };
//       Storage.put(filename, file, options)
//         .then(result => resolve(result)) // {key: "test.txt"}
//         .catch(err => reject(err));

//     });
//   }

//   // Customer have no Access and Admin will have Read/Write access
//   uploadPrivateFiles(file, type): Promise<any> {
//     console.log(file.name);
//     return new Promise((resolve, reject) => {
//       const options = { level: 'public', 'Content-Type': 'image/jpeg' };
//       Storage.put('private/' + privateFileList.find(obj => obj.key === type).path + '/' + file.name, file,
//         options
//       )
//         .then(result => resolve(result)) // {key: "test.txt"}
//         .catch(err => reject(err));

//     });
//   }

//   getFilePath(key: string): Promise<any> {
//     return new Promise((resolve, reject) => {
//       Storage.get(key)
//         .then(result => resolve(result)) // {key: "test.txt"}
//         .catch(err => reject(err));
//     });
//   }

//   getPublicFilePath(key: string): string {
//     // console.log('getPublicFilePath =======>');
//     // console.log('getPublicFilePath key', environment.domainURL + key);
//     return environment.domainURL + key;
//   }

//   getLoanFilePath(key: string): Promise<any> {
//     if (key.toLowerCase().indexOf('public/') === 0)
//       key = key.slice(7);
//     return new Promise((resolve, reject) => {
//       Storage.get(key, { bucket: environment.loanStorage.AWSS3.bucket })
//         .then(result => resolve(result)) // {key: "test.txt"}
//         .catch(err => reject(err));
//     });
//   }
// }


import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private storage: Storage) { }

  // Upload file and return download URL
  async uploadFile(file: File, path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    const uploadTask = await uploadBytesResumable(storageRef, file);
    return await getDownloadURL(uploadTask.ref);
  }
}
