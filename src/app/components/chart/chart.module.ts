import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComboChartComponent } from './combo-chart/combo-chart.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TooltipComponent } from '../tooltip/tooltip/tooltip.component';
import { LineChartComponent } from './line-chart/line-chart.component';

import { LineSeriesPlusComponent } from './line-chart/line-series-plus/line-series-plus.component';


@NgModule({
  declarations: [
    ComboChartComponent,
    LineChartComponent,
    TooltipComponent,
    LineSeriesPlusComponent
  ],
  imports: [
    CommonModule,
    NgxChartsModule,
  ],

  exports:
    [
      ComboChartComponent,
      LineChartComponent,
    ]
})
export class ChartModule {

}
