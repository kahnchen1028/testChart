import { Component, HostListener, ElementRef, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { ViewDimensions } from '@swimlane/ngx-charts';
import * as moment from 'moment';
import { DataService, SharedService } from './services/data.service';
import { entries, keys } from 'd3-collection';
import { Subject, from, of, Subscription } from 'rxjs';
import { delay, concatMap, takeUntil, map } from 'rxjs/operators';
import * as jsmepath from 'jmespath';
import { ComboChartComponent } from './components/chart/combo-chart/combo-chart.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnInit {

  title = 'testChart';
  dims: ViewDimensions;
  transform: string;
  playSubscritpion: Subscription;
  single: any[];
  view: any[];
  lineView: any[];
  width: number;
  height = 300;
  // options
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = false;
  legendTitle = 'Legend';
  legendPosition = 'below';
  showXAxisLabel = false;
  tooltipDisabled = false;
  showText = true;
  currentDate = moment().add(-10, 'days').format("MMMM,DD YYYY")
  timeLine = new Subject();
  showYAxisLabel = false;

  showGridLines = true;
  maxRadius = 10;
  minRadius = 3;
  showSeriesOnHover = true;
  roundEdges = true;
  animations = true;
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
  maxYAxisTickLength = 1;
  currentIndex = -1
  result: any;
  // Combo Chart
  lineChartSeries: any[] = [];
  dayChartSeries = new Subject();
  dayChartData: {};
  dayChartArray = [];
  dayChartIndexArray = [];
  lineChartScheme = {
    name: 'coolthree',
    selectable: true,
    group: 'linear',
    domain: ['#01579b', '#7aa3e5', '#a8385d']
  };

  defaultChartData = {
    "-1": {
      'NoData': [{
        "name": "prep",
        "value": "0"
      },
      {
        "name": "week",
        "value": "0"
      },
      {
        "name": "month",
        "value": "0"
      },
      {
        "name": "quart",
        "value": "0"
      }]
    }
  }

  showRightYAxisLabel = true;
  @ViewChild('comboChart', { static: false }) comboChart: ComboChartComponent;



  constructor(private ref: ElementRef, private ds: DataService, public ss: SharedService) {



  }
  ngOnInit() {

    this.applyDimensions();
    this.ds.getDataForYear().subscribe(data => {
      const info = data.map(val => {
        return {
          ...val, series: val.series.map(series => {
            return { ...series, name: series.name };
          })
        };
      });
      this.lineChartSeries = info;
      console.log("getDataForYear", info);

    });
    this.ds.getDataForDay().subscribe(result => {
      const obj = {
        ...this.defaultChartData
      };
      // console.log(data);

      result.map((company) => {
        let series = {}
        company.data.map((val, index) => {
          series[company.name] = [...val.value]

          // console.log(series, company.name, val.value);
          obj[val.key] = { ...obj[val.key], ...series }

        })
      })


      // console.log("ddddfsnsdkfjn;skjf;skjf;sd;", obj);
      this.dayChartData = obj;
      this.dayChartArray = entries(this.dayChartData)
      // console.log(this.dayChartArray);
      // this.dayChartIndexArray = keys(this.dayChartData)
      const initDate = { timestamp: this.dayChartArray[0].key }
      // console.log("get data init setCurrentDate", initDate);
      this.ss.currentDate.next(initDate);
    });

    this.ss.currentData$.subscribe((data) => console.log("dataaaaaaaa", data))
    this.ss.currentDate$.subscribe((data) => {
      this.currentDate = moment(new Date(data.timestamp)).format("MMMM,DD YYYY")

      this.dayChartSeries.next(this.dayChartData[data.timestamp]);
    })
  }


  @HostListener('window:resize', ['$event.target'])
  onresize() {
    this.applyDimensions();
  }

  applyDimensions() {
    this.width = this.ref.nativeElement.querySelector('.chart').clientWidth;
    this.view = [this.width, this.height];
    this.lineView = [this.width, this.height];
    console.log("this.view", this.view);
  }

  onSelect(item) {
    this.comboChart.onActivate(item.series)
  }
  ngAfterViewInit() {


  }


  yAxisTickFormatting(data) {
    return `${parseFloat(data).toFixed(3)}`;
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
    // console.log({ min: `${min}`, max: `${max}` });
    return { min: `${min - 2000}`, max: `${max + 2000}` };
  }

  yRightAxisScale(min, max) {
    // console.log({ min: `${min}`, max: `${max}` });
    return { min: `${min}`, max: `${max + 50}` };
  }

  yLeftTickFormat(data) {
    return `${data.toLocaleString()}`;
  }

  yRightTickFormat(data) {
    return `${data}%`;
  }

  xTickFormat(data) {
    return `${moment(data).format('MMM')}
            ${moment(data).format('YYYY')}`
  }
  /*
  **
  End of Combo Chart
  **/

}


