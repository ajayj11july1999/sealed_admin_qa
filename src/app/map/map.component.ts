import { Component, OnInit } from '@angular/core';
import { ApiServiceService } from '../service/api-service.service';
import { AgmCoreModule } from '@agm/core';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  tripDetails: any;

  title: string = 'AGM project';
  zoom: number = 12;

  // initial center position for the map
  lat: number = 13.067439;
  lng: number = 80.237617;
  markers: any;
  constructor(private apiService: ApiServiceService) { }

  ngOnInit(): void {
    this.getListAllActiveDeliveryMan();
  }

  refresh() {
    this.getListAllActiveDeliveryMan();
  }
  getListAllActiveDeliveryMan() {
    this.apiService
      .getListAllactiveDeliveryMan()
      .then((res) => {
        this.markers = res.data ? res?.data : '';
        console.log(this.markers, "iiiiiiiii");
        // this.latitude = this.tripDetails?.primaryAddress?.latitude;
        // this.longitude = this.tripDetails?.primaryAddress?.longitude;
        // console.log(this.latitude, "larrrrrrrrrrr");
        // console.log(this.longitude, "longggggggggg");

      })
      .catch((err) => { });
  }

  // markerDragEnd($event: MouseEvent) {
  //   console.log("lllllllllllllllll", $event);
  //   this.latitude = $event.coords.pickuplat;
  //   this.longitude = $event.coords.pickuplong;
  // this.getListAllActiveDeliveryMan(this.latitude, this.longitude);
  // }

  clickedMarker(label: string, index: number) {
    console.log(`clicked the marker: ${label || index}`)
  }

  mapClicked($event: MouseEvent) {
    // this.markers.push({
    //   lat: $event.coords.lat,
    //   lng: $event.coords.lng,
    //   draggable: true
    // });
  }

  markerDragEnd(m: any, $event: MouseEvent) {
    console.log('dragEnd', m, $event);
  }
}
