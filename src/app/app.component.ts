import { Component, HostListener, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { ViewDimensions } from '@swimlane/ngx-charts';
import * as moment from 'moment';
import { DataService } from './services/data.service';
import { entries, keys } from 'd3-collection';
import { Subject, from, of, Subscription } from 'rxjs';
import { delay, concatMap, takeUntil, map } from 'rxjs/operators';
import * as jsmepath from 'jmespath';
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
  width = 700;
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
  innerPadding = '10%';
  roundDomains = true;
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
    selectable: false,
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
  yAxisLabelRight = 'Utilization';




  constructor(private ref: ElementRef, private ds: DataService) {



  }
  ngOnInit() {
    this.width = this.ref.nativeElement.querySelector('.chart').clientWidth - 70;
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
      const initDate = { timestamp: this.dayChartArray[0].key, index: 0 }
      // console.log("get data init setCurrentDate", initDate);
      this.setCurrentDate(initDate);
    });

  }


  @HostListener('window:resize', ['$event.target'])
  onresize() {
    this.width = this.ref.nativeElement.querySelector('.chart').clientWidth - 70;
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

  setCurrentDate(data) {

    this.currentDate = moment(new Date(data.timestamp)).format("MMMM,DD YYYY")
    this.currentIndex = data.index;
    this.setTimeLine(data.timestamp)
    console.log(this.dayChartData[data.timestamp]);
    this.dayChartSeries.next(this.dayChartData[data.timestamp]);

  }


  play() {
    console.log(this.dayChartArray)
    if (this.currentIndex < 0) {
      console.log(this.currentIndex);


    }

    const playList = this.dayChartArray.slice(this.currentIndex)
    console.log(playList);


    this.playSubscritpion = from(playList).pipe(

      concatMap(v =>
        of(v).
          pipe(
            delay(100)
          )),
      map((v, i) => { return { "index": v.value.index, "value": v.key } })
    ).subscribe(
      it => {
        console.log(it);
        this.currentIndex = it.index;
        this.setTimeLine(it.value)

      }
      , (err) => { console.log("err", err); },
      () => {
        console.log("ccccccc");
        this.currentIndex = -1;
      }
    );

  }
  setTimeLine(timestamp) {
    this.timeLine.next({ data: { value: timestamp, index: this.currentIndex } })
  }

  stop() {
    this.playSubscritpion.unsubscribe()
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


