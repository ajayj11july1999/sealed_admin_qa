// firebase-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC-sSUZF0ONmgONW9c0N3nTJ56nhP9-t8s",
  authDomain: "sealedlivetracking.firebaseapp.com",
  projectId: "sealedlivetracking",
   storageBucket: "sealedlivetracking.firebasestorage.app",
    messagingSenderId: "703818925671",
    appId: "1:703818925671:web:8588763118d693c282b6c2"

});


const messaging = firebase.messaging();