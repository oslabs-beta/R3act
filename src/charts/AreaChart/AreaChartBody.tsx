/** AreaChart.js */
import React, { useMemo } from "react"
import * as d3 from "d3"
import styled from "styled-components"
import ContinuousAxis from "../../components/ContinuousAxis"
import { AreaProps } from "../../../types"
import { transformSkinnyToWide } from "../../utils"
import {
  getXAxisCoordinates,
  getYAxisCoordinates,
  getMargins,
} from "../../utils"

type AccessorFunc = (d: any) => number | Date
type Domain = number | Date | undefined
type ScaleFunc =
  | d3.ScaleLinear<number, number, never>
  | d3.ScaleTime<number, number, never>

type Series = d3.Series<
  {
    [key: string]: number
  },
  string
>[]

type Stack = d3.Stack<
  any,
  {
    [key: string]: number
  },
  string
>

type Area = d3.Area<any>

type ColorScale = d3.ScaleOrdinal<string, string, never>

const Path = styled.path`
  fill: none;
  stroke: black;
  stroke-width: 2px;
`

const AreaChartBody = ({
  data,
  height,
  width,
  xData,
  yData,
  groupBy,
  xAxis,
  yAxis,
  xAxisLabel,
  yAxisLabel,
  colorScheme = d3.schemeCategory10,
}: AreaProps<number>): JSX.Element => {
  const margin = useMemo(
    () => getMargins(xAxis, yAxis, xAxisLabel, yAxisLabel),
    [xAxis, yAxis, xAxisLabel, yAxisLabel]
  )

  const { xAxisX, xAxisY } = useMemo(
    () => getXAxisCoordinates(xAxis, height, margin),
    [height, xAxis, margin]
  )

  const { yAxisX, yAxisY } = useMemo(
    () => getYAxisCoordinates(yAxis, width, margin),
    [width, yAxis, margin]
  )
  // offset group to match position of axes
  const translate = `translate(${margin.left}, ${margin.top})`

  const keys: string[] = []
  if (groupBy) {
    for (let entry of data) {
      if (!keys.includes(entry[groupBy ?? ""])) {
        keys.push(entry[groupBy ?? ""])
      }
    }
    data = transformSkinnyToWide(data, keys, groupBy, xData.key, yData.key)
  } else {
    keys.push(yData.key)
  }

  const stack = d3.stack().keys(keys)
  const layers = stack(data)

  let xScale: ScaleFunc, xAccessor: AccessorFunc, xMin: Domain, xMax: Domain
  switch (xData.dataType) {
    case "number":
      xAccessor = (d) => d[xData.key]
      xMin = d3.min(data, xAccessor)
      xMax = d3.max(data, xAccessor)
      xScale = d3
        .scaleLinear()
        .domain([xMin ?? 0, xMax ?? 0])
        .range([0, width - margin.right - margin.left])
      break
    case "date":
      xAccessor = (d) => new Date(d[xData.key])
      xMin = d3.min(data, xAccessor)
      xMax = d3.max(data, xAccessor)
      xScale = d3
        .scaleTime()
        .domain([xMin ?? 0, xMax ?? 0])
        .range([0, width - margin.right - margin.left])
      break
  }

  const yExtent = [
    0,
    d3.max(layers, (layer) => d3.max(layer, (sequence: any) => sequence[1])),
  ]
  let yScale: ScaleFunc, yAccessor: AccessorFunc, yMin: Domain, yMax: Domain
  switch (yData.dataType) {
    case "number":
      yAccessor = (d) => d
      yMin = 0
      yMax = yExtent[1]
      yScale = d3
        .scaleLinear()
        .domain([yMin ?? 0, yMax ?? 0])
        .range([height - margin.top - margin.bottom, 0])
        .nice()
      break
    case "date":
      yAccessor = (d) => new Date(d)
      yMin = 0
      yMax = yExtent[1]
      yScale = d3
        .scaleTime()
        .domain([yMin ?? 0, yMax ?? 0])
        .range([height - margin.top - margin.bottom, 0])
        .nice()
      break
  }

  const areaGenerator: any = d3
    .area()
    .x((layer: any) => xScale(xAccessor(layer.data)))
    .y0((layer) => yScale(layer[0]))
    .y1((layer) => yScale(layer[1]))

  const colorScale: ColorScale = d3.scaleOrdinal(colorScheme)
  colorScale.domain(keys)

  return (
    <g transform={translate}>
      {layers.map((layer, i) => (
        <path
          key={i}
          d={areaGenerator(layer)}
          style={{ fill: colorScale(layer.key) }}
        />
      ))}
      {yAxis && (
        <ContinuousAxis
          x={yAxisX}
          y={yAxisY}
          height={height}
          width={width}
          margin={margin}
          scale={yScale}
          type={yAxis}
          label={yAxisLabel}
        />
      )}
      {xAxis && (
        <ContinuousAxis
          x={xAxisX}
          y={xAxisY}
          height={height}
          width={width}
          margin={margin}
          scale={xScale}
          type={xAxis}
          label={xAxisLabel}
        />
      )}
    </g>
  )
}

export default AreaChartBody