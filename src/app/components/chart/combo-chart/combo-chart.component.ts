import { Subject } from 'rxjs';
import {
  Component,
  Input,
  ViewEncapsulation,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewChild,
  HostListener,
  OnInit,
  OnChanges,
  ContentChild,
  TemplateRef,
  HostBinding
} from '@angular/core';

import * as moment from 'moment';


import { area, line, curveLinear } from 'd3-shape';
import { scaleBand, scaleLinear, scalePoint, scaleTime } from 'd3-scale';
import { BaseChartComponent, LineSeriesComponent, ViewDimensions, ColorHelper, calculateViewDimensions, TooltipArea } from '@swimlane/ngx-charts';

@Component({
  selector: 'combo-chart-component',
  templateUrl: './combo-chart.component.html',
  styleUrls: ['./combo-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ComboChartComponent extends BaseChartComponent implements OnInit {

  @Input() curve: any = curveLinear;
  @Input() legend = false;
  @Input() legendTitle: string = 'Legend';
  @Input() legendPosition: string = 'below';
  @Input() xAxis;
  @Input() yAxis;
  @Input() showXAxisLabel;
  @Input() showYAxisLabel;
  @Input() showRightYAxisLabel;
  @Input() xAxisLabel;
  @Input() yAxisLabel;
  @Input() yAxisLabelRight;
  @Input() tooltipDisabled: boolean = false;
  @Input() gradient: boolean;
  @Input() showGridLines: boolean = true;
  @Input() activeEntries: any[] = [];
  @Input() schemeType: string;
  @Input() xAxisTickFormatting: any;
  @Input() yAxisTickFormatting: any;
  @Input() yRightAxisTickFormatting: any;
  @Input() roundDomains: boolean = false;
  @Input() colorSchemeLine: any[];
  @Input() indexArry: string[];
  @Input() autoScale;
  @Input() lineChart: any;
  @Input() yLeftAxisScaleFactor: any;
  @Input() yRightAxisScaleFactor: any;
  @Input() rangeFillOpacity: number = 1;
  @Input() animations: boolean = true;
  @Input() noBarWhenZero: boolean = true;
  @Input() timeLineSubjust = new Subject<any>()
  @Output() activate: EventEmitter<any> = new EventEmitter();
  @Output() deactivate: EventEmitter<any> = new EventEmitter();
  @Output() setCurrentDate: EventEmitter<any> = new EventEmitter();
  @ContentChild('tooltipTemplate', { static: false }) tooltipTemplate: TemplateRef<any>;
  @ContentChild('seriesTooltipTemplate', { static: false }) seriesTooltipTemplate: TemplateRef<any>;
  @ViewChild('TooltipArea', { static: false }) tooltipArea: TooltipArea;
  @ViewChild(LineSeriesComponent, { static: false }) lineSeriesComponent: LineSeriesComponent;

  dims: ViewDimensions;
  xScale: any;
  yScaleSP: any;
  xDomain: any;
  yDomainSP: any;
  transform: string;
  colors: ColorHelper;
  colorsLine: ColorHelper;
  margin: any[] = [10, 20, 10, 20];
  xAxisHeight: number = 0;
  yAxisWidth: number = 0;
  legendOptions: any;
  anchorPos = -1;
  scaleType = 'time';
  xScaleLine;
  yScaleTreasury;
  yScaleBitcoin;
  xDomainLine;
  yDomainTreasury;
  yDomainBitcoin;
  seriesDomain;
  scaledAxis;
  combinedSeries;
  xSet;
  filteredDomain;
  hoveredVertical;
  yOrientLeft = 'left';
  yOrientRight = 'right';
  legendSpacing = 0;
  bandwidth;
  barPadding = 8;


  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.timeLineSubjust.subscribe((item) => {
      console.log(this.tooltipArea);

      this.hoveredVertical = item.data.value;


      // this.updateAnchor(item.data.index)
    })
  }
  trackBy(index, item): string {
    return item.name;
  }

  update(): void {

    super.update();

    this.dims = calculateViewDimensions({
      width: this.width,
      height: this.height,
      margins: this.margin,
      showXAxis: this.xAxis,
      showYAxis: this.yAxis,
      xAxisHeight: this.xAxisHeight,
      yAxisWidth: this.yAxisWidth,
      showXLabel: this.showXAxisLabel,
      showYLabel: this.showYAxisLabel,
      showLegend: this.legend,
      legendType: this.schemeType,
      legendPosition: this.legendPosition
    });

    if (this.lineChart.length <= 0) return;

    if (!this.yAxis) {
      this.legendSpacing = 0;
    } else if (this.showYAxisLabel && this.yAxis) {
      this.legendSpacing = 200;
    } else {
      this.legendSpacing = 100;
    }




    // line chart
    this.xDomainLine = this.getXDomainLine();
    if (this.filteredDomain) {
      this.xDomainLine = this.filteredDomain;
    }
    this.xScale = this.getXScaleLine(this.xDomainLine, this.dims.width);
    console.log(this.lineChart)
    // this.lineChart.map((val) => {
    //   this.getYDomainLine(val);
    // })
    this.yDomainTreasury = this.getYDomainLine(0);
    this.yDomainBitcoin = this.getYDomainLine(1);
    this.yDomainSP = this.getYDomainLine(2);
    this.seriesDomain = this.getSeriesDomain();
    this.yScaleSP = this.getYScale();
    this.scaleLines();

    this.setColors();
    this.legendOptions = this.getLegendOptions();

    this.transform = `translate(${this.dims.xOffset} , ${this.margin[0]})`;
  }

  deactivateAll() {
    this.activeEntries = [...this.activeEntries];
    for (const entry of this.activeEntries) {
      this.deactivate.emit({ value: entry, entries: [] });
    }
    this.activeEntries = [];
  }

  @HostListener('mouseleave')
  hideCircles(): void {
    // this.setCurrentDate.emit({ index: -1, timestamp: -1 })
    this.hoveredVertical = null;
    this.deactivateAll();
  }

  updateHoveredVertical(item): void {
    console.log("updateHoveredVertical");
    console.log(this.tooltipArea);

    const timestamp = new Date(item.value).getTime();
    const index = this.indexArry.findIndex(val => timestamp == parseInt(val, 10))
    this.setCurrentDate.emit({ index, timestamp })
    this.hoveredVertical = item.value;
    this.deactivateAll();
  }
  updateAnchor(index) {
    const closestPoint = this.xSet[index];
    this.tooltipArea.anchorPos = this.xScale(closestPoint);
    console.log(this.anchorPos);
    this.anchorPos = Math.max(0, this.anchorPos);
    this.anchorPos = Math.min(this.dims.width, this.anchorPos);
  }
  updateDomain(domain): void {
    this.filteredDomain = domain;
    this.xDomainLine = this.filteredDomain;
    this.xScaleLine = this.getXScaleLine(this.xDomainLine, this.dims.width);
  }

  scaleLines() {
    this.xScaleLine = this.getXScaleLine(this.xDomainLine, this.dims.width);
    this.yScaleSP = this.getYScaleLine(this.yDomainSP, this.dims.height);
    this.yScaleTreasury = this.getYScaleLine(this.yDomainTreasury, this.dims.height);
    this.yScaleBitcoin = this.getYScaleLine(this.yDomainBitcoin, this.dims.height);

  }

  getSeriesDomain(): any[] {
    this.combinedSeries = this.lineChart.slice(0);
    return this.combinedSeries.map(d => d.name);
  }

  isDate(value): boolean {
    if (value instanceof Date) {
      return true;
    }

    return false;
  }

  getScaleType(values): string {
    let date = true;
    let num = true;

    for (const value of values) {
      if (!this.isDate(value)) {
        date = false;
      }

      if (typeof value !== 'number') {
        num = false;
      }
    }

    if (date) return 'time';
    if (num) return 'linear';
    return 'ordinal';
  }

  getXDomainLine(): any[] {
    let values = [];

    for (const results of this.lineChart) {
      for (const d of results.series) {
        if (!values.includes(d.name)) {
          values.push(new Date(d.name));
        }
      }
    }

    this.scaleType = this.getScaleType(values);
    // console.log(this.scaleType);
    let domain = [];

    if (this.scaleType === 'time') {
      const min = Math.min(...values);
      const max = Math.max(...values);
      domain = [min, max];
    } else if (this.scaleType === 'linear') {
      values = values.map(v => Number(v));
      const min = Math.min(...values);
      const max = Math.max(...values);
      domain = [min, max];
    } else {
      domain = values;
    }

    this.xSet = values;
    return domain;
  }


  getYDomainLine(index): any[] {

    const domain = this.lineChart[index].series.map(d => d.value)

    let min = Math.min(...domain);
    const max = Math.max(...domain);

    if (this.lineChart[index].name === 'sp') {
      if (this.yLeftAxisScaleFactor) {
        const minMax = this.yLeftAxisScaleFactor(min, max);
        // console.log(minMax);
        return [minMax.min, minMax.max];
      } else {
        min = Math.min(0, min);
        return [min, max];
      }
    }
    else {
      if (this.yRightAxisScaleFactor) {
        const minMax = this.yRightAxisScaleFactor(min, max);
        // console.log(minMax);
        return [minMax.min, minMax.max];
      } else {
        min = Math.min(0, min);
        return [min, max];
      }
    }
  }

  getXScaleLine(domain, width): any {
    let scale;
    if (this.bandwidth === undefined) {
      this.bandwidth = width - this.barPadding;
    }
    const offset = Math.floor((width + this.barPadding - (this.bandwidth + this.barPadding) * domain.length) / 2);
    console.log("this.scaleType", this.scaleType);
    if (this.scaleType === 'time') {
      // console.log("domain====", domain);
      scale = scaleTime()
        .range([0, width])
        .domain(domain);
    } else if (this.scaleType === 'linear') {
      scale = scaleLinear()
        .range([0, width])
        .domain(domain);

      if (this.roundDomains) {
        scale = scale.nice();
      }
    } else if (this.scaleType === 'ordinal') {
      scale = scalePoint()
        .range([offset + this.bandwidth / 2, width - offset - this.bandwidth / 2])
        .domain(domain);
    }

    return scale;
  }

  getYScaleLine(domain, height): any {

    const scale = scaleLinear()
      .range([height, 0])
      .domain(domain);

    return this.roundDomains ? scale.nice() : scale;
  }

  getXScale(): any {
    const spacing = this.xDomainLine.length / (this.dims.width / this.barPadding + 1);
    return scaleBand()
      .range([0, this.dims.width])
      .paddingInner(spacing)
      .domain(this.xDomainLine);
  }

  getYScale(): any {

    const scale = scaleLinear()
      .range([this.dims.height, 0])
      .domain(this.yDomainSP);
    return this.roundDomains ? scale.nice() : scale;
  }


  onClick(data) {
    this.select.emit(data);
  }

  setColors(): void {
    let domain;
    // console.log("this.schemeType", this.schemeType);
    if (this.schemeType === 'ordinal') {
      domain = this.yDomainSP;
    } else {
      domain = this.yDomainSP;
    }
    this.colors = new ColorHelper(this.scheme, this.schemeType, domain, this.customColors);
    this.colorsLine = new ColorHelper(this.colorSchemeLine, this.schemeType, domain, this.customColors);
  }

  getLegendOptions() {
    const opts = {
      scaleType: this.schemeType,
      colors: undefined,
      domain: [],
      title: undefined,
      position: this.legendPosition
    };
    if (opts.scaleType === 'ordinal') {
      opts.domain = this.seriesDomain;
      opts.colors = this.colorsLine;
      opts.title = this.legendTitle;
    } else {
      opts.domain = this.seriesDomain;
      opts.colors = this.colors.scale;
    }
    return opts;
  }

  updateLineWidth(width): void {
    this.bandwidth = width + 80;
    this.scaleLines();
  }

  updateYAxisWidth({ width }): void {
    this.yAxisWidth = width + 10;
    this.update();
  }

  updateXAxisHeight({ height }): void {
    this.xAxisHeight = height;
    this.update();
  }

  onActivate(item) {
    const idx = this.activeEntries.findIndex(d => {
      return d.name === item.name && d.value === item.value && d.series === item.series;
    });
    if (idx > -1) {
      return;
    }

    this.activeEntries = [item, ...this.activeEntries];
    this.activate.emit({ value: item, entries: this.activeEntries });
  }

  onDeactivate(item) {
    const idx = this.activeEntries.findIndex(d => {
      return d.name === item.name && d.value === item.value && d.series === item.series;
    });

    this.activeEntries.splice(idx, 1);
    this.activeEntries = [...this.activeEntries];

    this.deactivate.emit({ value: item, entries: this.activeEntries });
  }

}
