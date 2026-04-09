import { Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private swUpdate: SwUpdate) {
    swUpdate
      .checkForUpdate()
      .then(() => console.log('checking for updates', new Date()));
    interval(10 * 60 * 1000).subscribe(() =>
      swUpdate
        .checkForUpdate()
        .then(() => console.log('checking for updates', new Date()))
    );
  }

  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm('New version available. Load New Version?')) {
          window.location.reload();
        }
      });
    }
  }
}
