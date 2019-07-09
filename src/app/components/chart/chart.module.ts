import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComboChartComponent } from './combo-chart/combo-chart.component';
import { NgxChartsModule, LineChartModule } from '@swimlane/ngx-charts';

import { LineBubbleChartComponent } from './line-buble-chart/line-bubble-chartComponent';
import { LineSeriesPlusComponent } from './shared/line-series-plus/line-series-plus.component';
import { TooltipComponent } from './shared/tooltip/tooltip.component';



@NgModule({
  declarations: [
    ComboChartComponent,
    LineBubbleChartComponent,
    TooltipComponent,
    LineSeriesPlusComponent
  ],
  imports: [
    CommonModule,
    NgxChartsModule,
    LineChartModule
  ],

  exports:
    [
      ComboChartComponent,
      LineBubbleChartComponent,
    ]
})
export class ChartModule {

}
