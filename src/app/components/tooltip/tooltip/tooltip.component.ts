
import { TooltipArea } from '@swimlane/ngx-charts';
import { Component, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy, TemplateRef } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { createMouseEvent } from '@swimlane/ngx-charts/release/events';

@Component({
  selector: 'g[app-tooltip]',

  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent extends TooltipArea {

  constructor() {
    super();
  }

  movePos(index) {

  }

  mouseMove(event) {
    console.log("eeeeeeeeee", event);
    const xPos = event.pageX - event.target.getBoundingClientRect().left;

    const closestIndex = this.findClosestPointIndex(xPos);
    const closestPoint = this.xSet[closestIndex];
    this.anchorPos = this.xScale(closestPoint);
    this.anchorPos = Math.max(0, this.anchorPos);
    this.anchorPos = Math.min(this.dims.width, this.anchorPos);

    this.anchorValues = this.getValues(closestPoint);
    if (this.anchorPos !== this.lastAnchorPos) {
      const ev = createMouseEvent('mouseleave');
      this.tooltipAnchor.nativeElement.dispatchEvent(ev);
      this.anchorOpacity = 0.7;
      this.hover.emit({
        value: closestPoint
      });
      this.showTooltip();

      this.lastAnchorPos = this.anchorPos;
    }
  }
}
