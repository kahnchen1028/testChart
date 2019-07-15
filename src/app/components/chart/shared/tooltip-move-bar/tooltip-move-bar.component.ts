
import { TooltipArea } from '@swimlane/ngx-charts';
import { Component, Output, EventEmitter, ViewChild, AfterViewInit, OnInit, HostListener, ViewEncapsulation } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'g[app-tooltip-move-bar]',

  templateUrl: './tooltip-move-bar.component.html',
  styleUrls: ['./tooltip-move-bar.component.scss'],


})
export class TooltipMoveBarComponent extends TooltipArea implements OnInit, AfterViewInit {
  isMouseDown = false;
  isOnBar = false;
  refAnchorPos: number;
  refAnchorValues: any;
  refAnchorOpacity: number;
  width = 10;
  anchorOpacity = 0.7;
  @Output() update = new EventEmitter();
  @ViewChild('tooltipAnchor2', { static: false }) tooltipAnchor;
  @ViewChild('tooltipText', { static: false }) tooltipText;
  constructor() {
    super();

  }

  ngAfterViewInit() {

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
    event.preventDefault()
    const rect = (this.tooltipAnchor.nativeElement as HTMLObjectElement);
    const left = rect.getBoundingClientRect().left;
    const width = rect.getBoundingClientRect().width
    const x = (event.touches) ? event.touches[0].clientX : event.pageX;

    if (x >= left && x <= width + left) {
      this.isMouseDown = true
    }
    else {
      this.isMouseDown = false
    }
  }
  onDrag(event) {
    event.preventDefault()

    if (!this.isMouseDown) {
      this.checkOnBar(event)
      return;
    }
    const x = (event.touches) ? event.touches[0].clientX : event.pageX;

    const xPos = x - event.target.getBoundingClientRect().left;

    const closestIndex = this.findClosestPointIndex(xPos);
    this.setPosByIndex(closestIndex);

  }


  onDragEnd(event) {
    event.preventDefault()
    this.isMouseDown = false;

  }

  getToolTipText(tooltipItem: any): string {
    let result: string = '';
    if (tooltipItem.series !== undefined) {
      result += tooltipItem.series;
    } else {
      result += '???';
    }
    result += ': ';
    if (tooltipItem.value !== undefined) {
      result += tooltipItem.value.toLocaleString();
    }
    if (tooltipItem.min !== undefined || tooltipItem.max !== undefined) {
      result += ' (';
      if (tooltipItem.min !== undefined) {
        if (tooltipItem.max === undefined) {
          result += '≥';
        }
        result += tooltipItem.min.toLocaleString();
        if (tooltipItem.max !== undefined) {
          result += ' - ';
        }
      } else if (tooltipItem.max !== undefined) {
        result += '≤';
      }
      if (tooltipItem.max !== undefined) {
        result += tooltipItem.max.toLocaleString();
      }
      result += ')';
    }
    return result;
  }
  setPosByIndex(index) {
    const closestPoint = this.xSet[index];
    this.anchorPos = this.xScale(closestPoint) - 5;
    this.anchorPos = Math.max(0, this.anchorPos);
    this.anchorPos = Math.min(this.dims.width, this.anchorPos);

    this.refAnchorPos = this.xScale(closestPoint)
    this.refAnchorPos = Math.max(0, this.refAnchorPos);
    this.refAnchorPos = Math.min(this.dims.width, this.refAnchorPos);

    this.refAnchorValues = this.getValues(closestPoint);
    this.anchorValues = this.refAnchorValues;

    this.update.emit({
      index: index,
      value: closestPoint,
      data: this.anchorValues
    });

    const objElm = (this.tooltipText.nativeElement as HTMLObjectElement);
    objElm.innerHTML = moment(closestPoint).format("MMM D,YYYY")

  }


  checkOnBar(event) {
    const x = (event.touches) ? event.touches[0].clientX : event.pageX;
    const rect = (this.tooltipAnchor.nativeElement as HTMLObjectElement);
    const left = rect.getBoundingClientRect().left;
    const width = rect.getBoundingClientRect().width
    if (x >= left && x <= width + left) {
      this.isOnBar = true
    }
    else {
      this.isOnBar = false
    }
  }

}
