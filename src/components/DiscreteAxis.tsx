import React, { useEffect } from 'react';
import * as d3 from 'd3';
import { DiscreteAxisProps, Data } from '../../types';

import styled from 'styled-components';

const TickText = styled.text`
  font-size: 12px;
  font-family: Tahoma, Geneva, Verdana, sans-serif;
  fill: ${(props) => props.theme.textColor};
`;

const AxisBaseline = styled.line`
  stroke: ${(props) => props.theme.axisBaseLineColor};
  stroke-width: 2;
`;

export const DiscreteAxis = React.memo(
  ({
    dataTestId = 'discrete-axis',
    x,
    y,
    scale,
    type,
    width,
    margin,
    data,
    xAccessor,
    setTickMargin,
  }: DiscreteAxisProps): JSX.Element => {
    const fontSize = 7;
    let x1 = 0,
      y1 = 0,
      x2 = 0,
      y2 = 0;
    switch (type) {
      case 'bottom':
        x1 = x;
        y1 = y;
        x2 = width - margin.right - margin.left;
        y2 = y;
        break;
      case 'top':
        x1 = x;
        y1 = y;
        x2 = width - margin.right - margin.left;
        y2 = y;
        break;
      default:
        x1 = 0;
        y1 = 0;
        x2 = 0;
        y2 = 0;
        break;
    }

    const formatTick = d3.timeFormat('%x');
    const getFormattedTick = (individualTick: string) => {
      if (individualTick.length > 10 && !isNaN(Date.parse(individualTick))) {
        return formatTick(new Date(individualTick));
      } else {
        return individualTick;
      }
    };

    const ticksOriginal = data.map((d) => xAccessor(d));
    const ticks = data.map((d) => getFormattedTick(xAccessor(d)));
    const check = ticks.some((tick) => tick.length * 8 > scale.bandwidth());
    const longestTick = ticks.reduce((a, b) => (a.length > b.length ? a : b));

    useEffect(() => {
      check
        ? setTickMargin(
            longestTick.length < 10 ? (longestTick.length * fontSize) / 2 : 40
          )
        : setTickMargin(0);
    }, [check]);

    const getTickTranslation = (
      axisType: string,
      individualTick: string,
      i: number
    ): string => {
      switch (axisType) {
        case 'top':
          return check
            ? `translate(${
                scale.bandwidth() / 2 + (scale(ticksOriginal[i]) ?? 0)
              }, ${y - fontSize})`
            : `translate(${
                scale.bandwidth() / 2 + (scale(ticksOriginal[i]) ?? 0)
              }, ${y - fontSize})`;
        case 'bottom':
          return check
            ? `translate(${
                scale.bandwidth() / 2 +
                (scale(ticksOriginal[i]) ?? 0) +
                fontSize / 2
              }, ${y + (individualTick.length / 2) * fontSize}), rotate(-90)`
            : `translate(${
                scale.bandwidth() / 2 + (scale(ticksOriginal[i]) ?? 0)
              }, ${y + fontSize * 2})`;
        default:
          return `translate(0,0)`;
      }
    };
    const getTickStyle = (
      axisType: string,
      individualTick: Data
    ): { [key: string]: string } | undefined => {
      switch (axisType) {
        case 'top':
          return { textAnchor: 'middle', dominantBaseline: 'auto' };
        case 'bottom':
          return { textAnchor: 'middle', dominantBaseline: 'auto' };
      }
    };
    return (
      <g>
        <AxisBaseline
          data-testid={dataTestId}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
        />
        {!check && (
          <>
            {ticks.map((tick: any, i: number) => (
              <TickText
                data-testid="d3reactor-ticktext"
                key={i}
                style={getTickStyle(type, tick)}
                transform={getTickTranslation(type, tick, i)}
              >
                {tick}
              </TickText>
            ))}
          </>
        )}
        {check && (
          <>
            {ticks.map((tick: any, i: number) => (
              <TickText
                data-testid="d3reactor-ticktext"
                key={i}
                style={getTickStyle(type, tick.slice(0, 10))}
                transform={getTickTranslation(type, tick.slice(0, 10), i)}
              >
                {tick.slice(0, 10)}
              </TickText>
            ))}
          </>
        )}
      </g>
    );
  }
);
