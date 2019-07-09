import { BehaviorSubject } from 'rxjs';
import {
  Component,
  Input,
  ViewEncapsulation,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
  ContentChild,
  TemplateRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  BaseChartComponent,
  calculateViewDimensions,
  ViewDimensions,
  ColorHelper,
  getScaleType
} from '@swimlane/ngx-charts';
import { curveCardinal } from 'd3-shape';
import { scaleLinear, scalePoint, scaleTime } from 'd3-scale';
import { id } from 'src/app/services/data.service';
import { trigger, transition, style, animate } from '@angular/animations';
@Component({
  selector: 'line-bubble-chart-component',
  templateUrl: './line-bubble-chart.component.html',
  styleUrls: ['./line-bubble-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,

  animations: [
    trigger('animationState', [
      transition(':leave', [
        style({
          opacity: 1
        }),
        animate(500, style({
          opacity: 0
        }))
      ])
    ])
  ]
})

export class LineBubbleChartComponent extends BaseChartComponent implements OnInit {
  @Input() legend;
  @Input() legendTitle: string = 'Legend';
  @Input() legendPosition: string = 'right';
  @Input() xAxis;
  @Input() yAxis;
  @Input() showXAxisLabel;
  @Input() showYAxisLabel;
  @Input() xAxisLabel;
  @Input() yAxisLabel;
  @Input() autoScale;
  @Input() timeline;
  @Input() gradient: boolean;
  @Input() showGridLines: boolean = true;
  @Input() curve: any = curveCardinal;
  @Input() activeEntries: any[] = [];
  @Input() schemeType: string;
  @Input() rangeFillOpacity: number;
  @Input() trimXAxisTicks: boolean = false;
  @Input() trimYAxisTicks: boolean = true;
  @Input() rotateXAxisTicks: boolean = false;
  @Input() maxXAxisTickLength: number = 16;
  @Input() maxYAxisTickLength: number = 16;
  @Input() xAxisTickFormatting: any;
  @Input() yAxisTickFormatting: any;
  @Input() xAxisTicks: any[] = [7, 14, 30, 60];
  @Input() yAxisTicks: any[];
  @Input() roundDomains: boolean = false;
  @Input() tooltipDisabled: boolean = false;
  @Input() showRefLines: boolean = false;
  @Input() referenceLines: any;
  @Input() showRefLabels: boolean = true;
  @Input() xScaleMin: any = 1;
  @Input() xScaleMax: any = 90;
  @Input() yScaleMin: number = -0.2;
  @Input() yScaleMax: number = 1.5;
  @Input() maxRadius = 10;
  @Input() minRadius = 3;
  @Output() activate: EventEmitter<any> = new EventEmitter();
  @Output() deactivate: EventEmitter<any> = new EventEmitter();

  @ContentChild('tooltipTemplate', { static: false }) tooltipTemplate: TemplateRef<any>;
  @ContentChild('seriesTooltipTemplate', { static: false }) seriesTooltipTemplate: TemplateRef<any>;
  @Input()
  series: BehaviorSubject<any>;
  @Input()
  circleSeries: BehaviorSubject<any>;
  bandwidth: any;
  dims: ViewDimensions;
  transform: string;
  groupScale: any;
  valueScale: any;
  xScale: any;
  yScale: any;
  rScale: any;
  xCircleScale: any;
  yCircleScale: any;
  xCircleDomain: any
  yCircleDomain: any
  xDomain: any;
  yDomain: any;
  rDomain: number[];

  xScaleType: string;
  yScaleType: string;
  filteredDomain: any;
  hasRange = true;
  legendOptions: any;
  scaleType = 'ordinal';
  colors: ColorHelper;
  combinedSeries: any;
  seriesDomain: any;
  data = [];
  margin: any[] = [10, 20, 10, 20];
  bubblePadding = [0, 0, 0, 0];
  hoveredVertical: any;
  xAxisHeight: number = 0;
  yAxisWidth: number = 0;
  clipPath: string;
  clipPathId: string;
  xSet: any;
  result = [];
  circleResult = []
  onClick(data): void {
    this.select.emit(data);
  }
  trackBy(item): string {
    return item.name;
  }
  ngOnInit() {
    this.series.subscribe((dayInfo) => {
      this.result = [];
      this.data = [];
      for (let i in dayInfo) {
        this.data.push({ name: i, series: dayInfo[i] });
        this.result.push({ name: i, series: dayInfo[i] });
      }
      this.update();
    });
    this.circleSeries.subscribe((dayInfo) => {
      this.result = [];
      this.data = [];
      console.log(dayInfo);
      for (let i in dayInfo) {
        this.circleResult.push({ name: i, series: dayInfo[i] });
      }

      this.circleUpdate();
    });
  }
  circleUpdate() {
    console.log("circleUpdate");
    super.update();
    this.minRadius = Math.max(this.minRadius, 1);
    this.maxRadius = Math.max(this.maxRadius, 1);



    this.xCircleDomain = this.getXDomain(this.circleResult);
    this.yCircleDomain = this.getYDomain(this.circleResult);
    this.rDomain = this.getRDomain();
    this.xCircleScale = this.getXScale(this.xCircleDomain, this.dims.width);
    this.yCircleScale = this.getYScale(this.yCircleDomain, this.dims.height);

    this.rScale = this.getRScale(this.rDomain, [this.minRadius, this.maxRadius]);
    this.bubblePadding = [0, 0, 0, 0];
    this.bubblePadding = this.getBubblePadding();
  }
  update() {
    super.update();
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

    this.transform = `translate(${this.dims.xOffset} , ${this.margin[0]})`;

    this.seriesDomain = this.getSeriesDomain();
    this.xDomain = this.getXDomain(this.result);

    this.yDomain = this.getYDomain(this.result);


    this.setColors();

    this.xScale = this.getXScale(this.xDomain, this.dims.width);
    this.yScale = this.getYScale(this.yDomain, this.dims.height);
    this.clipPathId = 'clip' + id().toString();
    this.clipPath = `url(#${this.clipPathId})`;
  }
  setColors(): void {
    let domain;
    if (this.schemeType === 'ordinal') {
      domain = this.seriesDomain;
    }
    else {
      domain = this.yDomain;
    }
    this.colors = new ColorHelper(this.scheme, this.schemeType, domain, this.customColors);
  }
  updateDomain(domain): void {
    this.filteredDomain = domain;
    this.xDomain = this.filteredDomain;
    this.xScale = this.getXScale(this.xDomain, this.dims.width);
  }
  getXDomain(results): any[] {
    const valueSet = new Set<any>();
    for (const result of results) {
      for (const d of result.series) {
        valueSet.add(d.name);
      }
    }
    let values = Array.from(valueSet);
    this.scaleType = getScaleType(values);
    console.log(values);
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
        if (aDate > bDate)
          return 1;
        if (bDate > aDate)
          return -1;
        return 0;
      });
    }
    else if (this.scaleType === 'linear') {
      domain = [min, max];
      // Use compare function to sort numbers numerically
      this.xSet = [...values].sort((a, b) => a - b);
    }
    else {
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
    }
    else if (this.scaleType === 'linear') {
      scale = scaleLinear()
        .range([0, width])
        .domain(domain);
      if (this.roundDomains) {
        scale = scale.nice();
      }
    }
    else if (this.scaleType === 'ordinal') {
      scale = scalePoint()
        .range([0, width])
        .padding(0.1)
        .domain(domain);
    }
    return scale;
  }
  getYDomain(results): any[] {
    const domain = [];
    for (const result of results) {
      for (const d of result.series) {
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
  onSelect() {
  }

  getRDomain(): number[] {
    let min = Infinity;
    let max = -Infinity;

    for (const result of this.circleResult) {
      for (const d of result.series) {
        const value = Number(d.r) || 1;
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }
    console.log("Rdomain", min, max);
    return [min, max];
  }
  getRScale(domain, range): any {
    console.log("getRScale", range);
    const scale = scaleLinear()
      .range(range)
      .domain(domain);
    console.log("getRScale", scale);
    return this.roundDomains ? scale.nice() : scale;
  }
  getBubblePadding() {
    let yMin = 0;
    let xMin = 0;
    let yMax = this.dims.height;
    let xMax = this.dims.width;

    for (const s of this.data) {
      for (const d of s.series) {
        const r = this.rScale(d.r);
        const cx = this.xScaleType === 'linear' ? this.xScale(Number(d.x)) : this.xScale(d.x);
        const cy = this.yScaleType === 'linear' ? this.yScale(Number(d.y)) : this.yScale(d.y);
        xMin = Math.max(r - cx, xMin);
        yMin = Math.max(r - cy, yMin);
        yMax = Math.max(cy + r, yMax);
        xMax = Math.max(cx + r, xMax);
      }
    }

    xMax = Math.max(xMax - this.dims.width, 0);
    yMax = Math.max(yMax - this.dims.height, 0);

    return [yMin, xMax, yMax, xMin];
  }
  setScales() {
    let width = this.dims.width;
    if (this.xScaleMin === undefined && this.xScaleMax === undefined) {
      width = width - this.bubblePadding[1];
    }
    let height = this.dims.height;
    if (this.yScaleMin === undefined && this.yScaleMax === undefined) {
      height = height - this.bubblePadding[2];
    }
    // this.xScale = this.getXScale(this.xDomain, width);
    // this.yScale = this.getYScale(this.yDomain, height);
  }
}
