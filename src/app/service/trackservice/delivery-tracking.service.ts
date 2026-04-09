
import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, onSnapshot } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DeliveryTrackingService {
  // constructor(private firestore: Firestore) { }

  // // 🔹 Update deliveryman's real-time location in Firestore
  // async updateLocation(deliverymanId: string, lat: number, lng: number) {
  //   const docRef = doc(this.firestore, `deliverymen/${deliverymanId}`);
  //   await setDoc(docRef, { lat, lng, timestamp: new Date() }, { merge: true });
  // }

  // // 🔹 Listen for real-time location updates
  // trackLocation(deliverymanId: string, callback: (lat: number, lng: number) => void) {
  //   const docRef = doc(this.firestore, `deliverymen/${deliverymanId}`);
  //   return onSnapshot(docRef, (docSnap) => {
  //     if (docSnap.exists()) {
  //       const data = docSnap.data();
  //       callback(data.lat, data.lng);
  //     }
  //   });
  // }




  constructor(private firestore: Firestore) { }

  // 🔥 Save Deliveryman's Location to Firestore
  async updateLocation(userId: string, lat: number, lng: number) {
    const locationRef = doc(this.firestore, `deliverymen/${userId}`);
    await setDoc(locationRef, { lat, lng, timestamp: new Date() }, { merge: true });
  }

  // 🔥 Listen for Real-Time Location Updates
  trackLocation(userId: string, callback: (lat: number, lng: number) => void) {
    const locationRef = doc(this.firestore, `deliverymen/${userId}`);
    console.log(locationRef)
    return onSnapshot(locationRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data?.lat && data?.lng) {
          callback(data.lat, data.lng);
        }
      }
    });
  }
}
