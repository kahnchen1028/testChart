
import { TooltipArea } from '@swimlane/ngx-charts';
import { Component, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy, TemplateRef, AfterViewInit, OnInit, HostListener } from '@angular/core';
import { drag } from 'd3-drag'
import { select, selectAll } from 'd3-selection'
import { createMouseEvent } from '@swimlane/ngx-charts/release/events';
import { ViewEncapsulation } from '@angular/compiler/src/core';

@Component({
  selector: 'g[app-tooltip]',

  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],

})
export class TooltipComponent extends TooltipArea implements OnInit, AfterViewInit {
  isMouseDown = false;
  refAnchorPos: number;
  refAnchorValues: any
  refAnchorOpacity: number;
  anchorOpacity = 0.7;
  @ViewChild('tooltipAnchor2', { static: false }) tooltipAnchor2;
  constructor() {
    super();

  }

  ngAfterViewInit() {

    // console.log(select(this.tooltipAnchor2).dispatch(drag()));



  }

  rect: any
  event: any
  ngOnInit() {

    select("rect.time-anchor").call(
      drag()

        .on('start', (d) => {
          const self = this;
          this.rect = event.target.getBoundingClientRect();
          this.event = (this.event) ? event : this.event;
          console.log(this.rect);
          return this.onDragStart(self, event);
        })
        .on('drag', () => {


          return this.onDrag(this, event);
        })
        .on('end', this.onDragEnd))



  }
  movePos(index) {

  }
  onDragStart(self, event) {




  }
  onDrag(self, event) {
    const xPos = event.pageX - self.rect.left + 5

    const closestIndex = self.findClosestPointIndex(xPos);


    console.log(event.pageX, self.rect, closestIndex);
    const closestPoint = self.xSet[closestIndex];
    // console.log(event.pageX, closestIndex, closestPoint, self.xScale(closestPoint));
    this.anchorPos = self.xScale(closestPoint);

    self.anchorPos = Math.max(0, self.anchorPos);
    self.anchorPos = Math.min(self.dims.width, self.anchorPos);
    console.log(event.pageX, self.anchorPos);
    self.anchorValues = self.getValues(closestPoint);



    if (self.anchorPos !== self.lastAnchorPos) {
      const ev = createMouseEvent('mouseleave');
      self.tooltipAnchor.nativeElement.dispatchEvent(ev);

      self.hover.emit({
        value: closestPoint
      });
      self.showTooltip();

      self.lastAnchorPos = self.anchorPos;
    }


  }
  onDragEnd(event) {
    console.log("onDragEnd", event)

  }



}
