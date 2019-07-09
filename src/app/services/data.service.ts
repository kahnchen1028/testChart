import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, BehaviorSubject, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  url: "http://localhost:3000/";
  constructor(private httpClient: HttpClient) { }


  getDataForYear(): Observable<Array<any>> {
    return this.httpClient.get<Array<any>>(`http://localhost:3000/year_chart`)
  }
  getDataForDay(): Observable<Array<any>> {
    return this.httpClient.get<Array<any>>(`http://localhost:3000/day_chart`)
  }
  getCircleDataForDay(): Observable<Array<any>> {
    return this.httpClient.get<Array<any>>(`http://localhost:3000/circle_chart`)
  }
}
@Injectable({
  providedIn: 'root'
})
export class SharedService {

  currentData = new Subject();
  currentData$ = this.currentData.asObservable();
  currentDate = new Subject<any>();
  currentDate$ = this.currentDate.asObservable();

}

export class ServiceLocator {
  static injector: Injector;
}


const cache = {};


/**
 * Generates a short id.
 *
 * Description:
 *   A 4-character alphanumeric sequence (364 = 1.6 million)
 *   This should only be used for JavaScript specific models.
 *   http://stackoverflow.com/questions/6248666/how-to-generate-short-uid-like-ax4j9z-in-js
 *
 *   Example: `ebgf`
 */
export function id(): string {
  let newId = ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);

  // append a 'a' because neo gets mad
  newId = `a${newId}`;

  // ensure not already used
  if (!cache[newId]) {
    cache[newId] = true;
    return newId;
  }

  return id();
}
