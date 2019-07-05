import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { LineSeriesComponent } from '@swimlane/ngx-charts';

@Component({
  selector: 'g:[app-line-series-plus]',
  templateUrl: './line-series-plus.component.html',
  styleUrls: ['./line-series-plus.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineSeriesPlusComponent extends LineSeriesComponent implements OnInit {

  constructor() {
    super()
  }

  ngOnInit() {
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
}
