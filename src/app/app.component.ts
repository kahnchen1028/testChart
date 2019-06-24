import { Component, Input, TemplateRef, HostListener, ElementRef, HostBinding, AfterViewInit, OnInit } from '@angular/core';
import { ViewDimensions } from '@swimlane/ngx-charts';
import * as moment from 'moment';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnInit {

  title = 'testChart';
  dims: ViewDimensions;
  transform: string;
  single: any[];
  view: any[];
  width: number = 700;
  height: number = 300;
  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  legendTitle = 'Legend';
  legendPosition = 'right';
  showXAxisLabel = false;
  tooltipDisabled = false;
  showText = true;

  showYAxisLabel = false;

  showGridLines = true;
  innerPadding = '10%';
  roundDomains = false;
  maxRadius = 10;
  minRadius = 3;
  showSeriesOnHover = true;
  roundEdges: boolean = true;
  animations: boolean = true;
  xScaleMin: any;
  xScaleMax: any;
  yScaleMin: number;
  yScaleMax: number;
  showDataLabel = false;
  noBarWhenZero = true;
  trimXAxisTicks = true;
  trimYAxisTicks = true;
  rotateXAxisTicks = true;
  maxXAxisTickLength = 12;
  maxYAxisTickLength = 16;
  result: any;
  // Combo Chart
  lineChartSeries: any[] = [];
  lineChartScheme = {
    name: 'coolthree',
    selectable: true,
    group: 'linear',
    domain: ['#01579b', '#7aa3e5', '#a8385d', '#00bfa5']
  };


  showRightYAxisLabel: boolean = true;
  yAxisLabelRight: string = 'Utilization';



  constructor(private ref: ElementRef, private ds: DataService) {



  }
  ngOnInit() {
    this.width = this.ref.nativeElement.querySelector('.chart').clientWidth;
    this.applyDimensions()
    this.ds.getDataForYear().subscribe(data => {
      const info = data.map(val => {
        return {
          ...val, series: val.series.map(series => {
            return { ...series, name: new Date(series.name) }
          })
        }
      });
      this.lineChartSeries = info
      console.log(info);

    })

  }


  @HostListener('window:resize', ['$event.target'])
  onresize() {
    this.width = this.ref.nativeElement.querySelector('.chart').clientWidth;
    console.log(this.ref.nativeElement.querySelector('.chart').clientWidth);
    // this.width = window.innerWidth;

    this.applyDimensions();
  }

  applyDimensions() {
    this.view = [this.width, this.height];
  }

  onSelect(event) {
    console.log(event);
  }
  ngAfterViewInit() {


  }

  /*
  **
  Combo Chart
  **
  [yLeftAxisScaleFactor]="yLeftAxisScale" and [yRightAxisScaleFactor]="yRightAxisScale"
  exposes the left and right min and max axis values for custom scaling, it is probably best to
  scale one axis in relation to the other axis but for flexibility to scale either the left or
  right axis bowth were exposed.
  **
  */

  yLeftAxisScale(min, max) {
    console.log({ min: `${min}`, max: `${max}` });
    return { min: `${min - 2000}`, max: `${max + 2000}` };
  }

  yRightAxisScale(min, max) {
    console.log({ min: `${min}`, max: `${max}` });
    return { min: `${min}`, max: `${max}` };
  }

  yLeftTickFormat(data) {
    return `${data.toLocaleString()}`;
  }

  yRightTickFormat(data) {
    return `${data}%`;
  }
  /*
  **
  End of Combo Chart
  **/

}


