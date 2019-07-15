import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, TemplateRef, ContentChild, OnChanges, SimpleChange } from '@angular/core';
import { LineSeriesComponent, formatLabel } from '@swimlane/ngx-charts';
import { id } from 'src/app/services/data.service';

@Component({
  selector: 'g:[app-line-series-plus]',
  templateUrl: './line-series-plus.component.html',
  styleUrls: ['./line-series-plus.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineSeriesPlusComponent extends LineSeriesComponent implements OnInit, OnChanges {
  @Input() type = 'standard';
  @Input() showTicks = true;
  @Input() tooltipDisabled: boolean = false;
  @Output() activate = new EventEmitter();
  @Output() deactivate = new EventEmitter();
  @ContentChild('tooltipTemplate', { static: false }) tooltipTemplate: TemplateRef<any>;

  circleArray = [];
  gradientFill: string;


  barVisible: boolean = false;
  constructor() {
    super()
  }

  ngOnInit() {

    this.gradientId = 'grad' + id().toString();
    this.gradientFill = `url(#${this.gradientId})`;

  }

  isInactive(entry): boolean {
    let item;
    if (!this.activeEntries) return false;
    if (this.activeEntries.length > 0) {
      item = this.activeEntries.find(d => {
        return entry.name === d.name;
      });
    }


    return item === undefined;
  }
  isActive2(entry): boolean {
    if (!this.activeEntries) return false;
    const item = this.activeEntries.find(d => {
      return entry.name === d.name;
    });
    return item !== undefined;
  }

  isActive(entry): boolean {
    if (!this.activeEntries) return false;
    const item = this.activeEntries.find(d => {
      return entry.name === d.name;
    });
    return item !== undefined;
  }
  ngOnChanges() {
    this.update();
    this.drawCircle()
  }

  drawCircle() {
    this.circleArray = this.data.series.map((d, i) => this.mapDataPointToCircle(d, i))
  }

  mapDataPointToCircle(d: any, i: number): any {
    const seriesName = this.data.name;

    const value = d.value;
    const label = d.name;
    const tooltipLabel = formatLabel(label);

    let cx;
    if (this.scaleType === 'time') {
      cx = this.xScale(label);
    } else if (this.scaleType === 'linear') {
      cx = this.xScale(Number(label));
    } else {
      cx = this.xScale(label);
    }

    const cy = this.yScale(this.type === 'standard' ? value : d.d1);
    const radius = 5;
    const height = this.yScale.range()[0] - cy;
    const opacity = 1;

    let color;
    if (this.colors.scaleType === 'linear') {
      if (this.type === 'standard') {
        color = this.colors.getColor(value);
      } else {
        color = this.colors.getColor(d.d1);
      }
    } else {
      color = this.colors.getColor(seriesName);
    }

    const data = Object.assign({}, d, {
      series: seriesName,
      value,
      name: label
    });

    return {
      classNames: [`circle-data-${i}`],
      value,
      label,
      data,
      cx,
      cy,
      radius,
      height,
      tooltipLabel,
      color,
      opacity,
      seriesName,
      gradientStops: this.getGradientStops(color),
      min: d.min,
      max: d.max
    };
  }
  getGradientStops(color) {
    return [
      {
        offset: 0,
        color,
        opacity: 0.2
      },
      {
        offset: 100,
        color,
        opacity: 1
      }
    ];
  }

  activateCircle(): void {
    this.barVisible = true;
    this.activate.emit({ name: this.data.name });
  }

  deactivateCircle(circle): void {
    this.barVisible = false;
    circle.opacity = 0;
    this.deactivate.emit({ name: this.data.name });
  }
  getTooltipText({ tooltipLabel, value, seriesName, min, max }): string {
    return `
      <span class="tooltip-label">${seriesName} • ${tooltipLabel}</span>
      <span class="tooltip-val">${value.toLocaleString()}${this.getTooltipMinMaxText(min, max)}</span>
    `;
  }
  getTooltipMinMaxText(min: any, max: any) {
    if (min !== undefined || max !== undefined) {
      let result = ' (';
      if (min !== undefined) {
        if (max === undefined) {
          result += '≥';
        }
        result += min.toLocaleString();
        if (max !== undefined) {
          result += ' - ';
        }
      } else if (max !== undefined) {
        result += '≤';
      }
      if (max !== undefined) {
        result += max.toLocaleString();
      }
      result += ')';
      return result;
    } else {
      return '';
    }
  }
}
