import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ComboChartComponent } from './components/chart/combo-chart/combo-chart.component';
import { LineChartComponent } from './components/chart/line-chart/line-chart.component';
import { TooltipComponent } from './components/tooltip/tooltip/tooltip.component';

@NgModule({
  declarations: [
    AppComponent,
    ComboChartComponent,
    LineChartComponent,
    TooltipComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,

    NgxChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
