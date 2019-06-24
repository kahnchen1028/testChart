import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  url: "http://localhost:3000/";
  constructor(private httpClient: HttpClient) { }
  getDataForYear(): Observable<Array<any>> {
    return this.httpClient.get<Array<any>>(`http://localhost:3000/year_chart`)
  }
}
