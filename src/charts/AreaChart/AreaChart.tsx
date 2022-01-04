/** App.js */
import React, { useState, useMemo} from "react";
import * as d3 from "d3";
import { AreaChartProps, ColorScale, xAccessorFunc, yAccessorFunc } from '../../../types';
import { Axis } from "../../components/ContinuousAxis";
import { Label } from "../../components/Label";
import { useResponsive } from '../../hooks/useResponsive';
import { xScaleDef } from '../../functionality/xScale';
import { yScaleDef } from '../../functionality/yScale';
import ListeningRect from "../../components/ListeningRect"
import { Tooltip } from "../../components/Tooltip"
import { ColorLegend } from "../../components/ColorLegend";
import {
  getXAxisCoordinates,
  getYAxisCoordinates,
  getMarginsWithLegend,
  inferXDataType,
  transformSkinnyToWide,
  EXTRA_LEGEND_MARGIN,
} from "../../utils"

export default function AreaChart({
  data,
  height = "100%",
  width = "100%",
  xKey,
  yKey,
  xDataType,
  groupBy,
  xAxis = 'bottom',
  yAxis = 'left',
  xGrid = false,
  yGrid = false,
  xAxisLabel,
  yAxisLabel,
  legend,
  legendLabel = '',
  colorScheme = d3.quantize(d3.interpolateHcl("#9dc8e2", "#07316b"), 8),
}: AreaChartProps<string | number>): JSX.Element {
  const [tooltip, setTooltip] = useState<false | any>(false);
  const chart = "AreaChart";
  const { anchor, cHeight, cWidth } = useResponsive();
  
  // width & height of legend, so we know how much to squeeze chart by
  const [legendOffset, setLegendOffset] = useState<[number, number]>([0, 0]);
  const xOffset = legendOffset[0];
  const yOffset = legendOffset[1];
  const margin = useMemo(
    () => getMarginsWithLegend(
      xAxis, yAxis, xAxisLabel, yAxisLabel, 
      legend, xOffset, yOffset, cWidth, cHeight
      ),
    [xAxis, yAxis, xAxisLabel, yAxisLabel, legend, xOffset, yOffset, cWidth, cHeight]
  );

  const { xAxisX, xAxisY } = useMemo(
    () => getXAxisCoordinates(xAxis, cHeight, margin),
    [cHeight, xAxis, margin]
  )
  const { yAxisX, yAxisY } = useMemo(
    () => getYAxisCoordinates(yAxis, cWidth, margin),
    [cWidth, yAxis, margin]
  )
  // offset group to match position of axes
  const translate = `translate(${margin.left}, ${margin.top})`

  // type KeyType = { key: string; dataType?: "number" | "date" | undefined; }

  // if no xKey datatype is passed in, determine if it's Date
  if (!xDataType) {
    xDataType = inferXDataType(data[0], xKey)
  }

  // generate arr of keys. these are used to render discrete areas to be displayed
  const keys: string[] = []
  if (groupBy) {
    for (const entry of data) {
      const property = String(entry[groupBy ?? ""])
      if (property && !keys.includes(property)) {
        keys.push(property)
      }
    }
    data = transformSkinnyToWide(data, keys, groupBy, xKey, yKey)
  } else {
    keys.push(yKey)
  }

  // generate stack: an array of Series representing the x and associated y0 & y1 values for each area
  const stack = d3.stack().keys(keys)
  const layers = useMemo(() => {
    const layersTemp = stack(data as Iterable<{ [key: string]: number }>)
    for (const series of layersTemp) {
      series.sort((a, b) => b.data[xKey] - a.data[xKey])
    }
    return layersTemp
  }, [data, keys])

  const xAccessor: xAccessorFunc =
    xDataType === "number" ? (d) => d[xKey] : (d) => new Date(d[xKey])
  const yAccessor: yAccessorFunc = (d) => d[yKey]

  const { xScale, xMin, xMax } = xScaleDef(
    data,
    xDataType,
    xAccessor,
    margin,
    cWidth,
    chart
  )
  const yScale = yScaleDef(layers, yAccessor, margin, cHeight, chart)

  let xTicksValue = [xMin, ...xScale.ticks(), xMax]

  const areaGenerator: any = d3
    .area()
    .x((layer: any) => xScale(xAccessor(layer.data)))
    .y0((layer) => yScale(layer[0]))
    .y1((layer) => yScale(layer[1]))

  const colorScale: ColorScale = d3.scaleOrdinal(colorScheme)
  colorScale.domain(keys)
console.log(margin)

  return (
    <svg ref={anchor} width={width} height={height}>
      <g transform={translate}>
        {yAxis && (
          <Axis
            x={yAxisX}
            y={yAxisY}
            height={cHeight}
            width={cWidth}
            margin={margin}
            scale={yScale}
            type={yAxis}
            yGrid={yGrid}
            label={yAxisLabel}
          />
        )}
         {yAxisLabel &&
        <Label 
          x={yAxisX}
          y={yAxisY}
          height={cHeight}
          width={cWidth}
          margin={margin}
          type={yAxis ? yAxis : 'left'}
          axis = {yAxis ? true : false}
          label={yAxisLabel}
        />
        }
        {xAxis && (
          <Axis
            x={xAxisX}
            y={xAxisY}
            height={cHeight}
            width={cWidth}
            margin={margin}
            scale={xScale}
            xGrid={xGrid}
            type={xAxis}
            label={xAxisLabel}
            xTicksValue={xTicksValue}
          />
        )}
         {xAxisLabel &&
        <Label 
          x={xAxisX}
          y={xAxisY}
          height={cHeight}
          width={cWidth}
          margin={margin}
          type={xAxis ? xAxis : 'bottom'}
          axis = {xAxis ? true : false}
          label={xAxisLabel}
        />
        }
        {layers.map((layer, i) => (
          <path key={i} d={areaGenerator(layer)} fill={colorScale(layer.key)} />
        ))}

        { // If legend prop is truthy, render legend component:
        legend && <ColorLegend 
          legendLabel={legendLabel } 
          circleRadius={5 /* Radius of each color swab in legend */}
          colorScale={colorScale}
          setLegendOffset={setLegendOffset}
          legendPosition={legend}
          xOffset={xOffset}
          yOffset={yOffset}
          margin={margin}
          cWidth={cWidth}
          cHeight={cHeight}
          EXTRA_LEGEND_MARGIN={EXTRA_LEGEND_MARGIN}
        />}

        {tooltip && <Tooltip x={tooltip.cx} y={tooltip.cy} />}

        <ListeningRect
          data={data}
          layers={layers}
          width={cWidth}
          height={cHeight}
          margin={margin}
          xScale={xScale}
          yScale={yScale}
          xAccessor={xAccessor}
          yAccessor={yAccessor}
          setTooltip={setTooltip}
        />
      </g>
    </svg>
  );
}
