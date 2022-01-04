import { Margin, LegendPos } from "../types"

export const EXTRA_LEGEND_MARGIN = 6;

export function getXAxisCoordinates(
  xAxis: "top" | "bottom" | false = "bottom",
  height: number,
  margin: Margin
) {
  let xAxisX: number = 0
  let xAxisY: number = height - margin.top - margin.bottom

  if (xAxis === "top") xAxisY = 0

  return {
    xAxisX,
    xAxisY,
  }
}

export function getYAxisCoordinates(
  yAxis: "left" | "right" | false = "left",
  width: number,
  margin: Margin
) {
  let yAxisX: number = 0
  let yAxisY: number = 0

  if (yAxis === "right") yAxisX = width - margin.left - margin.right

  return {
    yAxisX,
    yAxisY,
  }
}

export function getMargins(
  xAxis: "top" | "bottom" | false = "bottom",
  yAxis: "left" | "right" | false = "left",
  xAxisLabel: string | undefined,
  yAxisLabel: string | undefined
) {
  let left = 20,
    right = 20,
    top = 20,
    bottom = 20

  function addVerticalMargin() {
    switch (xAxis) {
      case "top":
        top += 40
        break
      case "bottom":
        bottom += 40
    }
  }

  function addHorizontalMargin() {
    switch (yAxis) {
      case "left":
        left += 40
        break
      case "right":
        right += 40
    }
  }

  if (xAxis) addVerticalMargin()
  if (xAxis && xAxisLabel) addVerticalMargin()
  if (yAxis) addHorizontalMargin()
  if (yAxis && yAxisLabel) addHorizontalMargin()

  return { left, right, top, bottom }
}

export function getMarginsWithLegend(
  xAxis: "top" | "bottom" | false | undefined,
  yAxis: "left" | "right" | false | undefined,
  xAxisLabel: string | undefined,
  yAxisLabel: string | undefined,
  legend: LegendPos = false,
  xOffset: number = 0,
  yOffset: number = 0,
  // legendOffset: [number, number] = [0, 0], // ideally this should be mandatory if legend is truthy
  cWidth: number = 0,                      // ideally this should be mandatory if legend is truthy
  cHeight: number = 0,                     // ideally this should be mandatory if legend is truthy
) {
  let left = 20,
      right = 20,
      top = 20,
      bottom = 20;
  function addVerticalMargin() {
    switch (xAxis) {
      case "top":
        top += 40;
        break
      case "bottom":
        bottom += 40;
    }
  }
  function addHorizontalMargin() {
    switch (yAxis) {
      case "left":
        left += 40;
        break
      case "right":
        right += 40;
    }
  }

  function addVerticalMargin1() {
    switch (xAxis) {
      case "top":
        top += 20;
        break
      case "bottom":
        bottom += 20;
        break
      case undefined:
        bottom += 20;
        break
      case false:
        bottom += 20;
        break
    }
  }
  function addHorizontalMargin1() {
    switch (yAxis) {
      case "left":
        left += 20;
        break
      case "right":
        right += 20;
        break
        case undefined:
        left += 20;
        break
        case false:
        left += 20;
        break
    }
  }
  if (xAxis) addVerticalMargin();
  if (xAxisLabel) addVerticalMargin1();
  if (yAxis) addHorizontalMargin();
  if (yAxisLabel) addHorizontalMargin1();
  
  if (legend === true) legend = 'right';
  if (legend) {
    // make room for legend by adjusting margin:
    // const xOffset = legendOffset[0];
    // const yOffset = legendOffset[1];
    let marginExt = 0;
    switch(legend) {
      case 'top':
      case 'left-top':
      case 'right-top':
        top += yOffset + EXTRA_LEGEND_MARGIN;
        break;
      case 'left-bottom':
      case 'right-bottom':
      case 'bottom':
        bottom += yOffset + EXTRA_LEGEND_MARGIN;
        break;
      case 'left': 
      case 'top-left': 
      case 'bottom-left': 
        marginExt = left + xOffset + EXTRA_LEGEND_MARGIN;
        if (marginExt > 0) left = marginExt;
        break;
      case 'top-right':
      case 'bottom-right':
      case 'right':
      default:
        marginExt = right + xOffset + EXTRA_LEGEND_MARGIN;
        if (marginExt > 0) right = marginExt;
    }
  }
  return { left, right, top, bottom }
}

export function getAxisLabelCoordinates(
  x: number,
  y: number,
  height: number,
  width: number,
  margin: Margin,
  type: string | boolean,
  axis: boolean,
  fontSize = 16 
) {
  let rotate = 0
  let axisLabelX: number = 0
  let axisLabelY: number = 0
  let labelMargin: number = 20;
  let axisMargin:number = 40;
  switch (type) {
    case "top":
      axisLabelX = width / 2 - margin.left / 2 - margin.right / 2
      axisLabelY = y - labelMargin/2 - axisMargin
      rotate = 0
      break
    case "right":
      axisLabelX = x + labelMargin/2 + axisMargin
      axisLabelY = (height - margin.top - margin.bottom) / 2
      rotate = 90
      break
    case "bottom":
      axisLabelX = width / 2 - margin.left / 2 - margin.right / 2
      axisLabelY = axis ? (y + labelMargin/2 + axisMargin) : (y + labelMargin)
      rotate = 0
      break
    case "left":
      axisLabelX = axis ? -labelMargin/2 - axisMargin : -labelMargin
      axisLabelY = (height - margin.top - margin.bottom) / 2
      rotate = -90
      break
    case false:
      axisLabelX = -labelMargin/2
      axisLabelY = (height - margin.top - margin.bottom) / 2
      rotate = -90

  }
  return {
    axisLabelX,
    axisLabelY,
    rotate,
  }
}

export function checkRadiusDimension(
  height: number,
  width: number,
  radius: number | string, 
  margin: Margin
) {
  if(typeof radius === "string" && radius.endsWith("%")) {
    radius = radius.slice(0,-1)   
    return Number(radius)*Math.min((height-margin.top)/2, (width-margin.left)/2)*0.01
  }
  if(Number(radius) > Math.min(height/2, width/2)) {
      return Math.min(height/2,width/2) - margin.top
  }
  else {
    return Number(radius)
  }
}

export function calculateOuterRadius(
  height: number,
  width: number,
  margin: Margin,
) {
  return Math.min((height - margin.top - margin.bottom)/2, (width - margin.left - margin.right)/2)
}


interface CountryDataProps {
  key: string
  values: Array<Array<number>>
}

interface CorrectedCountryDataProps {
  key: string
  values: Array<Array<number>>
}

export function findYDomainMax(data: any, keyArr: string[]) {
  let yDomainMax = 0
  data.forEach((obj: any) => {
    let stackedHeight = 0
    for (const key of keyArr) {
      stackedHeight += obj[key]
      if (stackedHeight > yDomainMax) yDomainMax = stackedHeight
    }
  })
  return yDomainMax
}

interface CountryDataProps {
  key: string
  values: Array<Array<number>>
}

export function transformCountryData(arr: CountryDataProps[]) {
  const transformed = []
  for (let i = 0; i < arr[0].values.length; i++) {
    const entry: any = {
      // TODO: get rid of any?
      date: arr[0].values[i][0],
    }
    for (let j = 0; j < arr.length; j++) {
      entry[arr[j].key] = arr[j].values[i][1]
    }
    transformed.push(entry)
  }
  return transformed
}

export function transformSkinnyToWide(
  arr: any,
  keys: any,
  groupBy: string | undefined,
  xDataKey: string | undefined,
  yDataKey: string | undefined
) {
  const outputArr = []
  // Find unique x vals. create 1 object with date prop for each date
  const rowsArr: any = []
  for (const entry of arr) {
    if (!rowsArr.includes(entry[xDataKey ?? ""]))
      rowsArr.push(entry[xDataKey ?? ""])
  }
  // create 1 prop with key for each val in keys, and associated val of 'value' from input arr at the object with current date & key name
  for (const rowValue of rowsArr) {
    const rowObj: any = {}
    rowObj[xDataKey ?? ""] = rowValue

    for (const key of keys) {
      rowObj[key] = arr.reduce((val: number | undefined, currentRow: any) => {
        if (
          currentRow[xDataKey ?? ""] === rowValue &&
          currentRow[groupBy ?? ""] === key
        ) {
          return currentRow[yDataKey ?? ""]
        } else {
          return val
        }
      }, undefined)
    }
    outputArr.push(rowObj)
  }
  return outputArr
}

export function inferXDataType( el: any, xKey: string) {
  let xDataType: "number" | "date" | undefined;
  if (typeof el[xKey] === 'string' && !isNaN(Date.parse(el[xKey]))
    || el[xKey] instanceof Date) {
    xDataType = 'date';
  } else if (typeof el[xKey] === 'number') {
    xDataType = 'number';
  } else {
    throw new Error('Incorrect datatype');
  }
  return xDataType;
}

