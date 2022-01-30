import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  Margin,
  ScaleFunc,
  toolTipState,
  xAccessorFunc,
  yAccessorFunc,
} from '../../types';

export default function ListeningRect({
  data,
  layers,
  width,
  height,
  margin,
  xScale,
  yScale,
  xKey,
  yKey,
  xAccessor,
  setTooltip,
}: {
  data: any;
  layers: d3.Series<
    {
      [key: string]: number;
    },
    string
  >[];
  width: number;
  height: number;
  margin: Margin;
  xScale: ScaleFunc;
  yScale: ScaleFunc;
  xKey: string;
  yKey: string;
  xAccessor: xAccessorFunc;
  yAccessor: yAccessorFunc;
  setTooltip?: React.Dispatch<any>;
}) {
  const anchor = useRef(null);

  // const [scrollPosition, setScrollPosition] = useState(0);

  // const handleScroll = () => {
  //   const position = window.pageYOffset;
  //   setScrollPosition(position);
  // };

  // useEffect(() => {
  //   window.addEventListener('scroll', handleScroll, { passive: true });

  //   return () => {
  //     window.removeEventListener('scroll', handleScroll);
  //   };
  // }, []);

  const tooltipState: toolTipState = {
    cursorX: 0,
    cursorY: 0,
    distanceFromTop: 0,
    distanceFromRight: 0,
    distanceFromLeft: 0,
    data,
  };

  function onMouseMove(e: any) {
    const mousePosition = d3.pointer(e);
    const hoveredX = xScale.invert(mousePosition[0]);
    const hoveredY = yScale.invert(mousePosition[1]);

    // ****************************************
    // Find x position
    // ****************************************
    let closestXValue: any = 0;
    const getDistanceFromHoveredX = function (d: any) {
      // This StackOverFlow Article helped me with this TS issue
      // https://stackoverflow.com/questions/48274028/the-left-hand-and-right-hand-side-of-an-arithmetic-operation-must-be-of-type-a
      return Math.abs(xAccessor(d).valueOf() - hoveredX.valueOf());
    };

    const closestXIndex = d3.leastIndex(data, (a, b) => {
      return getDistanceFromHoveredX(a) - getDistanceFromHoveredX(b);
    });

    if (typeof closestXIndex === 'number') {
      const closestDataPoint = data[closestXIndex];
      closestXValue = xAccessor(closestDataPoint);

      tooltipState.cursorX =
        e.nativeEvent.pageX - e.nativeEvent.layerX + xScale(closestXValue);
    }

    // ****************************************
    // Find y position
    // ****************************************
    let closestYValue: any = 0;
    const closestYSequence = layers.map((layer) => {
      if (typeof closestXIndex === 'number') {
        return layer[closestXIndex][1];
      }
    });

    const getDistanceFromHoveredY = function (d: any) {
      return Math.abs(d - hoveredY.valueOf());
    };

    const closestYIndex = d3.leastIndex(closestYSequence, (a, b) => {
      return getDistanceFromHoveredY(a) - getDistanceFromHoveredY(b);
    });

    if (typeof closestYIndex === 'number') {
      if (typeof closestXIndex === 'number') {
        closestYValue = layers[closestYIndex][closestXIndex][1];
        tooltipState.cursorY =
          e.pageY - e.nativeEvent.layerY + yScale(closestYValue);

        tooltipState.data = {
          [xKey]: closestXValue,
          [yKey]: closestYValue,
        };
      }
    }

    tooltipState.distanceFromTop = tooltipState.cursorY + margin.top;
    tooltipState.distanceFromRight =
      width - (margin.left + tooltipState.cursorX);
    tooltipState.distanceFromLeft = margin.left + tooltipState.cursorX;

    if (setTooltip) {
      setTooltip(tooltipState);
    }
  }
  const rectWidth = width - margin.right - margin.left;
  const rectHeight = height - margin.bottom - margin.top;
  return (
    <rect
      ref={anchor}
      width={rectWidth >= 0 ? rectWidth : 0}
      height={rectHeight >= 0 ? rectHeight : 0}
      fill="transparent"
      onMouseMove={onMouseMove}
      onMouseLeave={() => (setTooltip ? setTooltip(false) : null)}
    />
  );
}
