
import { TooltipArea } from '@swimlane/ngx-charts';
import { Component, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy, TemplateRef, AfterViewInit, OnInit, HostListener, ElementRef } from '@angular/core';
import { drag } from 'd3-drag';
import { select, selectAll } from 'd3-selection';
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
  refAnchorValues: any;
  refAnchorOpacity: number;
  width = 10;
  anchorOpacity = 0.7;
  @Output() update = new EventEmitter();
  @ViewChild('tooltipAnchor2', { static: false }) tooltipAnchor;
  constructor() {
    super();

  }

  ngAfterViewInit() {
    // const closestPoint = this.xSet[0];
    // this.anchorPos = this.xScale(closestPoint) - 5;
    // this.anchorPos = Math.max(0, this.anchorPos);
    // this.anchorPos = Math.min(this.dims.width, this.anchorPos);
    // this.anchorValues = this.getValues(closestPoint);
    // this.update.emit({
    //   index: 0,
    //   value: closestPoint,
    //   data: this.anchorValues
    // });

  }

  ngOnInit() {



  }
  @HostListener('touchstart', ['$event'])
  onTapStart(event) {

    this.onDragStart(event)
  }

  @HostListener('touchmove', ['$event'])
  onTapMove(event) {

    this.onDrag(event);
  }
  @HostListener('touchend', ['$event'])
  onTapEnd(event) {

    this.onDragEnd(event);
  }



  onDragStart(event) {
    const rect = (this.tooltipAnchor.nativeElement as HTMLObjectElement);
    const left = rect.getBoundingClientRect().left;
    const width = rect.getBoundingClientRect().width
    // console.log(left, '<', event.x, '<', left + width);
    const x = (event.touches) ? event.touches[0].clientX : event.pageX;

    if (x >= left && x <= width + left) {
      this.isMouseDown = true
    }
    else {
      this.isMouseDown = false
    }
  }
  onDrag(event) {
    if (!this.isMouseDown) { return; }
    const x = (event.touches) ? event.touches[0].clientX : event.pageX;

    const xPos = x - event.target.getBoundingClientRect().left;

    const closestIndex = this.findClosestPointIndex(xPos);
    const closestPoint = this.xSet[closestIndex];
    this.anchorPos = this.xScale(closestPoint) - 5;
    this.anchorPos = Math.max(0, this.anchorPos);
    this.anchorPos = Math.min(this.dims.width, this.anchorPos);

    console.log(closestIndex);
    this.refAnchorPos = this.xScale(closestPoint)
    this.refAnchorPos = Math.max(0, this.refAnchorPos);
    this.refAnchorPos = Math.min(this.dims.width, this.refAnchorPos);

    this.refAnchorValues = this.getValues(closestPoint);
    this.anchorValues = this.refAnchorValues;

    // if (this.refAnchorPos !== this.lastAnchorPos) {
    //   const ev = createMouseEvent('mouseleave');
    //   this.tooltipAnchor.nativeElement.dispatchEvent(ev);
    //   this.anchorOpacity = 0.7;
    this.update.emit({
      index: closestIndex,
      value: closestPoint,
      data: this.anchorValues
    });
    //   this.showTooltip();

    //   this.lastAnchorPos = this.refAnchorPos;
    // }


  }
  onDragEnd(event) {
    this.isMouseDown = false;
    // console.log('onDragEnd', event);

  }



}
