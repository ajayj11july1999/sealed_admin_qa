// importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js");
// importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js");


// firebase.initializeApp({
//     apiKey: "AIzaSyBwkLlG7mSz0LkQXsR9S619-6rxizfL-NI",
//     authDomain: "fastx-4f421.firebaseapp.com",
//     projectId: "fastx-4f421",
//     storageBucket: "fastx-4f421.appspot.com",
//     messagingSenderId: "58001007583",
//     appId: "1:58001007583:web:cece30c078074d69ac9a6a",
//     measurementId: "G-2217DMET9K",
//     vapidKey:"BKpdWtGlUa5cQH4OL3J1g14RD3mOwpiYHeSFMvOoeRTLxWXmU5gRiCNNXVIkRyzEZCqefysLXn2Rv3IPshiy3h8",
   
// });


// const messaging = firebase.messaging();



//  new

// import { Injectable } from '@angular/core';
// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';

// import { environment } from '../environments/environment';

// @Injectable({
//   providedIn: 'root'
// })
// export class FirebaseService {
//   app = initializeApp(environment.firebaseConfig);
//   db = getFirestore(this.app);
//   auth = getAuth(this.app);

//   constructor() {
//     console.log("Firebase Initialized");
//   }
// }


// another 
importScripts('firebase-app-compat.js');
importScripts('firebase-messaging-compat.js');


importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC-sSUZF0ONmgONW9c0N3nTJ56nhP9-t8s",
  authDomain: "sealedlivetracking.firebaseapp.com",
  projectId: "sealedlivetracking",
  storageBucket: "sealedlivetracking.firebasestorage.app",
  messagingSenderId: "703818925671",
  appId: "1:703818925671:web:8588763118d693c282b6c2"
});
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: '/assets/icons/firebase-logo.png'
    }
  );
});