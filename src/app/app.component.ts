import { LineBubbleChartComponent } from './components/chart/line-buble-chart/line-bubble-chartComponent';
import { Component, HostListener, ElementRef, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { ViewDimensions } from '@swimlane/ngx-charts';
import * as moment from 'moment';
import { DataService, SharedService } from './services/data.service';
import { entries, keys } from 'd3-collection';
import { Subject, from, of, Subscription, forkJoin } from 'rxjs';
import { curveCardinal } from 'd3-shape'
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
  activateSet = new Set();
  deactivateSet = new Set();
  curveActivateSet = new Set();
  curveDeactivateSet = new Set();
  showYAxisLabel = false;
  curve: any = curveCardinal;
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
  currentIndex = 364
  result: any;
  lineChartSeries: any[] = [];
  lineBubbleChartSeries: any[] = [];
  dayChartSeries = new Subject();
  dayCircleChartSeries = new Subject();
  dayChartData: {};
  dayCircleChartData: {};
  dayChartArray = [];
  dayChartIndexArray = [];
  lineChartScheme = {
    name: 'coolthree',
    selectable: true,
    group: 'linear',
    domain: ['#01579b', '#7aa3e5', '#a8385d',]
  };

  circleChartScheme = {
    name: 'coolthree',
    selectable: true,
    group: 'linear',
    domain: ['#00990066']
  };
  defaultChartData = {
    "-1": {
      'NoData': [
        {
          "name": "1",
          "value": "0",

        },
        {
          "name": "7",
          "value": "0",

        },
        {
          "name": "14",
          "value": "0",

        },
        {
          "name": "30",
          "value": "0",

        },
        {
          "name": "60",
          "value": "0",

        }, {
          "name": "90",
          "value": "0",

        },]
    }
  }

  showRightYAxisLabel = true;
  @ViewChild('comboChart', { static: false }) comboChart: ComboChartComponent;
  @ViewChild('lineBubbleChart', { static: false }) lineBubbleChart: LineBubbleChartComponent;




  constructor(private ref: ElementRef, private ds: DataService, public ss: SharedService) {



  }
  ngOnInit() {

    this.applyDimensions();
    this.ds.getDataForYear().subscribe(data => {

      const info = data.map(val => {
        this.activateSet.add(val.name)
        return {
          ...val, series: val.series.map(series => {

            return { ...series, name: series.name };
          })
        };
      });
      this.lineChartSeries = info;


    });
    forkJoin(
      this.ds.getDataForDay(),
      this.ds.getCircleDataForDay(),

    ).subscribe((result) => {
      const obj = {

      };

      result[0].map((company) => {
        let series = {}
        this.curveActivateSet.add(company.name)
        company.data.map((val, index) => {
          series[company.name] = [...val.value]

          obj[val.key] = { ...obj[val.key], ...series }

        })
      })

      this.dayChartData = obj;
      // this.ss.currentDate.next(initDate);

      const circleObj = {

      };


      result[1].map((company) => {
        let series = {}
        this.curveActivateSet.add(company.name)
        company.data.map((val, index) => {
          val.value = val.value.map(d => { return { ...d, name: d.x } })
          series[company.name] = [...val.value]
          circleObj[val.key] = { ...circleObj[val.key], ...series }

        })
      })


      this.dayCircleChartData = circleObj;
      this.initSubscribe()
    })
    // this.ds.getDataForDay().subscribe(result => {
    //   const obj = {
    //     ...this.defaultChartData
    //   };
    //   // console.log(data);

    //   result.map((company) => {
    //     let series = {}
    //     company.data.map((val, index) => {
    //       series[company.name] = [...val.value]

    //       // console.log(series, company.name, val.value);
    //       obj[val.key] = { ...obj[val.key], ...series }

    //     })
    //   })



    //   this.dayChartData = obj;
    //   this.dayChartArray = entries(this.dayChartData)

    //   const initDate = { timestamp: this.dayChartArray[0].key }

    //   this.ss.currentDate.next(initDate);
    // });

    // this.ds.getCircleDataForDay().subscribe(result => {
    //   const obj = {

    //   };


    //   result.map((company) => {
    //     let series = {}
    //     company.data.map((val, index) => {
    //       series[company.name] = [...val.value]

    //       // console.log(series, company.name, val.value);
    //       obj[val.key] = { ...obj[val.key], ...series }

    //     })
    //   })

    //   console.log("getCircleDataForDay", obj);

    //   this.dayCircleChartData = obj;
    //   // this.dayChartArray = entries(this.dayChartData)

    //   // const initDate = { timestamp: this.dayChartArray[0].key }

    //   // this.ss.currentDate.next(initDate);
    // });


  }

  initSubscribe() {
    this.ss.currentIndex.subscribe(index => this.currentIndex = index);
    this.ss.currentDate$.subscribe((data) => {
      this.currentDate = moment(new Date(data.timestamp)).format("MMMM,DD YYYY")
      this.dayCircleChartSeries.next(this.dayCircleChartData[data.timestamp]);
      this.dayChartSeries.next(this.dayChartData[data.timestamp]);
      this.lineBubbleChartSeries = { ...this.dayChartData[data.timestamp], ...this.dayCircleChartData[data.timestamp] }

    })
    this.dayChartArray = keys(this.dayChartData)
    const initDate = { timestamp: parseInt(this.dayChartArray[this.dayChartArray.length - 1]) }
    this.ss.currentDate.next(initDate)
  }

  @HostListener('window:resize', ['$event.target'])
  onresize() {
    this.applyDimensions();
    this.comboChart.updateAnchor(this.currentIndex)
  }

  applyDimensions() {
    this.width = this.ref.nativeElement.querySelector('.chart').clientWidth;
    this.view = [this.width, this.height];
    this.lineView = [this.width, this.height];
  }

  onSelect(idx) {
    const isDeactivate = this.deactivateSet.has(this.lineChartSeries[idx].name);
    const isActivate = this.activateSet.has(this.lineChartSeries[idx].name);
    if (isDeactivate) {
      this.comboChart.onActivate(this.lineChartSeries[idx])
    }
    if (isActivate) {
      this.comboChart.onDeactivate(this.lineChartSeries[idx])
    }

  }
  onBubbleSelect(idx) {

    const isDeactivate = this.curveDeactivateSet.has(idx);
    const isActivate = this.curveActivateSet.has(idx);

    if (isDeactivate) {
      this.lineBubbleChart.onActivate({ name: idx, value: (this.lineBubbleChartSeries[idx]) })
    }
    if (isActivate) {
      this.lineBubbleChart.onDeactivate({ name: idx, value: this.lineBubbleChartSeries[idx] })
    }

  }
  ngAfterViewInit() {


  }

  bubbleActivate(data) {
    data = JSON.parse(JSON.stringify(data));
    this.curveActivateSet.add(data.value.name)

    this.curveDeactivateSet.delete(data.value.name)
  }

  bubbleDeactivate(data) {
    data = JSON.parse(JSON.stringify(data));
    this.curveDeactivateSet.add(data.value.name)
    this.curveActivateSet.delete(data.value.name)
  }

  activate(data) {
    data = JSON.parse(JSON.stringify(data));
    this.activateSet.add(data.value.name)

    this.deactivateSet.delete(data.value.name)

  }

  deactivate(data) {
    data = JSON.parse(JSON.stringify(data));
    this.deactivateSet.add(data.value.name)
    this.activateSet.delete(data.value.name)

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

    return { min: `${min - 2000}`, max: `${max + 1000}` };
  }

  yRightAxisScale(min, max) {
    return { min: `${min}`, max: `${max + 50}` };
  }

  yRight2AxisScale(min, max) {
    return { min: `${min}`, max: `${max + 30}` };
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

  xLineTickFormat(data) {
    switch (data) {

      case 7:
        return '1W'
      case 14:
        return '2W'
      case 30:
        return '1M'
      case 60:
        return '2M'
      default:
        return ''
    }
  }
  /*
  **
  End of Combo Chart
  **/

  update() {
    this.comboChart.updateAnchor(364)
  }
}


