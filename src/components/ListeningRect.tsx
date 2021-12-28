import React from "react"
import * as d3 from "d3"

import {
  Data,
  Margin,
  ScaleFunc,
  xAccessorFunc,
  yAccessorFunc,
} from "../../types"

export default function ListeningRect({
  data,
  layers,
  width,
  height,
  margin,
  xScale,
  yScale,
  xAccessor,
  setTooltip,
}: {
  data: Data[]
  layers: d3.Series<
    {
      [key: string]: number
    },
    string
  >[]
  width: number
  height: number
  margin: Margin
  xScale: ScaleFunc
  yScale: ScaleFunc
  xAccessor: xAccessorFunc
  yAccessor: yAccessorFunc
  setTooltip?: React.Dispatch<any>
}) {
  const cellCenter = { cx: 0, cy: 0 }

  function onMouseMove(e: any) {
    const mousePosition = d3.pointer(e)
    const hoveredX = xScale.invert(mousePosition[0]) as Date
    const hoveredY = yScale.invert(mousePosition[1])
    // console.log("HOVERED Y ", hoveredY)

    // ****************************************
    // Find x position
    // ****************************************
    const getDistanceFromHoveredX = function (d: any) {
      // This StackOverFlow Article helped me with this TS issue
      // https://stackoverflow.com/questions/48274028/the-left-hand-and-right-hand-side-of-an-arithmetic-operation-must-be-of-type-a
      return Math.abs(xAccessor(d).valueOf() - hoveredX.valueOf())
    }

    const closestXIndex = d3.leastIndex(data, (a, b) => {
      return getDistanceFromHoveredX(a) - getDistanceFromHoveredX(b)
    })

    if (typeof closestXIndex === "number") {
      const closestDataPoint = data[closestXIndex]
      const closestXValue = xAccessor(closestDataPoint)
      cellCenter.cx = xScale(closestXValue)
    }

    // ****************************************
    // Find y position
    // ****************************************
    const closestYSequence = layers.map((layer) => {
      if (typeof closestXIndex === "number") {
        return layer[closestXIndex][1]
      }
    })

    const getDistanceFromHoveredY = function (d: any) {
      return Math.abs(d - hoveredY.valueOf())
    }

    const closestYIndex = d3.leastIndex(closestYSequence, (a, b) => {
      return getDistanceFromHoveredY(a) - getDistanceFromHoveredY(b)
    })

    if (typeof closestYIndex === "number") {
      const closestKey = layers[closestYIndex].key
      if (typeof closestXIndex === "number") {
        const closestValue = layers[closestYIndex][closestXIndex][1]
        cellCenter.cy = yScale(closestValue)
        // console.log(`The Closest Y is ${closestKey} ${closestValue}`)
      }
    }

    if (setTooltip) {
      setTooltip(cellCenter)
    }
  }

  return (
    <rect
      width={width - margin.right - margin.left}
      height={height - margin.bottom - margin.top}
      fill="transparent"
      onMouseMove={onMouseMove}
      onMouseLeave={() => (setTooltip ? setTooltip(false) : null)}
    />
  )
}