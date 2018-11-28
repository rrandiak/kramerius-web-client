import { AppSettings } from './../services/app-settings';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html'
})
export class LogoComponent implements OnInit {

  constructor(public appSettings: AppSettings) {
  }

  ngOnInit() {
  }

}
