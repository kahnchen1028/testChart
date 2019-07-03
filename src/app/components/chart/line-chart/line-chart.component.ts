import { BehaviorSubject, Subject } from 'rxjs';
import { Component, OnInit, Input, ViewChild, Output, EventEmitter, HostListener, TemplateRef, ContentChild } from '@angular/core';
import { BaseChartComponent, calculateViewDimensions, ViewDimensions, LineSeriesComponent, ColorHelper, getUniqueXDomainValues, getScaleType, GridPanelSeriesComponent } from '@swimlane/ngx-charts';
import { area, line, curveLinear } from 'd3-shape';
import { scaleBand, scaleLinear, scalePoint, scaleTime } from 'd3-scale';
import { id } from 'src/app/services/data.service';

@Component({
  selector: 'line-chart-component',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent extends BaseChartComponent implements OnInit {
  @Input() curve: any = curveLinear;
  @Input() showLegend = false;
  @Input() xAxis = true;
  @Input() yAxis = true;
  @Input() showXAxisLabel = false;
  @Input() showYAxisLabel = false;
  @Input() xAxisLabel;
  @Input() yAxisLabel;
  @Input() autoScale = true;
  @Input() series: BehaviorSubject<any>;
  @ViewChild(LineSeriesComponent, { static: false }) lineSeriesComponent: LineSeriesComponent;
  @ViewChild(GridPanelSeriesComponent, { static: false }) gridPanelSeriesComponent: GridPanelSeriesComponent;
  @Input() colorSchemeLine: any[];
  @Input() activeEntries: any[] = [];
  @Input() tooltipDisabled: boolean = false;
  @Input() xScaleMin: any;
  @Input() xScaleMax: any;
  @Input() yScaleMin: number = 0;
  @Input() yScaleMax: number = 1;
  @Input() trimXAxisTicks: boolean = true;
  @Input() trimYAxisTicks: boolean = true;
  @Input() rotateXAxisTicks: boolean = true;
  @Input() maxXAxisTickLength: number = 16;
  @Input() maxYAxisTickLength: number = 16;
  @Input() xAxisTickFormatting: any;
  @Input() yAxisTickFormatting: any;
  @Input() xAxisTicks: any[];
  @Input() yAxisTicks: any[];
  @Input() roundDomains: boolean = false;
  @Input() showRefLines: boolean = false;
  @Input() referenceLines: any;
  @Input() showRefLabels: boolean = true;
  @Input() hoveredVertical: any;
  @Output() activate: EventEmitter<any> = new EventEmitter();
  @Output() deactivate: EventEmitter<any> = new EventEmitter();
  @Input() showAllTooltips = false;
  @ContentChild('tooltipTemplate', { static: false }) tooltipTemplate: TemplateRef<any>;
  @ContentChild('seriesTooltipTemplate', { static: false }) seriesTooltipTemplate: TemplateRef<any>;
  colors: ColorHelper;
  colorsLine: ColorHelper;
  bandwidth: any;
  showGridLines = true
  gradient = false;
  dims: ViewDimensions;
  transform: string;
  groupScale: any;
  valueScale: any
  xScale: any;
  yScale: any;
  xDomain: any;
  yDomain: any;
  hasRange = true;

  legendOptions: any;
  scaleType = 'ordinal';
  combinedSeries: any;
  rangeFillOpacity = 0.5;
  seriesDomain: any;
  data = []
  margin: any[] = [10, 20, 10, 20];
  xAxisHeight: number = 0;
  yAxisWidth: number = 0;
  clipPath: string;
  clipPathId: string;
  xSet: any;
  result = []


  onClick(data): void {
    this.select.emit(data);
  }
  trackBy(index, item): string {
    return item.name;
  }
  ngOnInit() {
    this.series.subscribe((dayInfo) => {

      this.result = []
      this.data = []
      for (let i in dayInfo) {
        this.data.push({ name: i, series: dayInfo[i] })
        this.result.push({ name: i, series: dayInfo[i] })
      }



      this.update()
    })
  }
  update() {
    super.update()
    this.dims = calculateViewDimensions({
      width: this.width,
      height: this.height,
      margins: this.margin,
      showXAxis: this.xAxis,
      showYAxis: this.yAxis,
      xAxisHeight: this.xAxisHeight,
      yAxisWidth: this.yAxisWidth,
      legendType: this.schemeType,

    });

    this.xDomain = this.getXDomain()
    this.seriesDomain = this.getSeriesDomain();

    this.yDomain = this.getYDomain();

    this.setColors()

    this.xScale = this.getXScale(this.xDomain, this.dims.width);

    this.yScale = this.getYScale(this.yDomain, this.dims.height);
    this.transform = `translate(${this.dims.xOffset} , ${this.margin[0]})`;
    this.clipPathId = 'clip' + id().toString();
    this.clipPath = `url(#${this.clipPathId})`;
  }
  setColors(): void {

    let domain;
    if (this.schemeType === 'ordinal') {
      domain = this.seriesDomain;
    } else {
      domain = this.yDomain;
    }
    this.colors = new ColorHelper(this.scheme, this.schemeType, domain, this.customColors);
  }



  getXDomain(): any[] {


    const valueSet = new Set();
    for (const result of this.result) {

      for (const d of result.series) {
        valueSet.add(d.name);
      }
    }
    let values = Array.from(valueSet);
    this.scaleType = 'ordinal'
    let domain = [];

    if (this.scaleType === 'linear') {
      values = values.map(v => Number(v));
    }

    let min;
    let max;
    if (this.scaleType === 'time' || this.scaleType === 'linear') {
      min = this.xScaleMin ? this.xScaleMin : Math.min(...values);

      max = this.xScaleMax ? this.xScaleMax : Math.max(...values);
    }

    if (this.scaleType === 'time') {
      domain = [new Date(min), new Date(max)];
      this.xSet = [...values].sort((a, b) => {
        const aDate = a.getTime();
        const bDate = b.getTime();
        if (aDate > bDate) return 1;
        if (bDate > aDate) return -1;
        return 0;
      });
    } else if (this.scaleType === 'linear') {
      domain = [min, max];
      // Use compare function to sort numbers numerically
      this.xSet = [...values].sort((a, b) => a - b);
    } else {
      domain = values;
      this.xSet = values;
    }

    return domain;
  }
  getSeriesDomain(): any[] {

    this.combinedSeries = this.data.slice(0);
    return this.combinedSeries.map(d => d.name);
  }

  updateXAxisHeight({ height }): void {
    this.xAxisHeight = height;
    this.update();
  }
  updateYAxisWidth({ width }): void {
    this.yAxisWidth = width;
    this.update();
  }

  getXScale(domain, width): any {
    let scale;
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
        .range([0, width])
        .padding(0.1)
        .domain(domain);

    }

    return scale;
  }


  getYDomain(): any[] {
    const domain = [];

    for (const results of this.result) {
      for (const d of results.series) {
        if (domain.indexOf(d.value) < 0) {
          domain.push(d.value);
        }
        if (d.min !== undefined) {
          this.hasRange = true;
          if (domain.indexOf(d.min) < 0) {
            domain.push(d.min);
          }
        }
        if (d.max !== undefined) {
          this.hasRange = true;
          if (domain.indexOf(d.max) < 0) {
            domain.push(d.max);
          }
        }
      }
    }

    const values = [...domain];
    if (!this.autoScale) {
      values.push(0);
    }

    const min = this.yScaleMin ? this.yScaleMin : Math.min(...values);

    const max = this.yScaleMax ? this.yScaleMax : Math.max(...values);

    return [min, max];
  }


  getYScale(domain, height): any {
    const scale = scaleLinear()
      .range([height, 0])
      .domain(domain);

    return this.roundDomains ? scale.nice() : scale;
  }
  updateHoveredVertical(item): void {
    this.hoveredVertical = item.value;
    this.deactivateAll();
  }

  isDate(value): boolean {
    if (value instanceof Date) {
      return true;
    }

    return false;
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
  deactivateAll() {
    this.activeEntries = [...this.activeEntries];
    for (const entry of this.activeEntries) {
      this.deactivate.emit({ value: entry, entries: [] });
    }
    this.activeEntries = [];
  }

  @HostListener('mouseleave')
  hideCircles(): void {
    this.hoveredVertical = null;
    this.deactivateAll();
  }

  onSelect(event) {
  }
}
