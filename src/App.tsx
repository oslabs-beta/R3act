import React from 'react';
import BarChart from './charts/BarChart/BarChart';
import AreaChart from './charts/AreaChart/AreaChart';
import LineChart from './charts/LineChart/LineChart';
import ScatterPlot from './charts/ScatterPlot/ScatterPlot';
import PieChart from './charts/PieChart/PieChart';

import portfolio from '../data/portfolio.json';
import penguins from '../data/penguins.json';
import fruit from '../data/fruit.json';
import skinny_fruit from '../data/skinny_fruit.json';

import { Container } from './styles/componentStyles';

function App() {
  return (
    <Container className="app">
      <PieChart
        theme="dark"
        data={fruit.sort((a, b) => a.value - b.value)}
        label="label"
        value="value"
        outerRadius={400}
        pieLabel={true}
      />
      <BarChart
        theme="light"
        height="100%"
        width="100%"
        data={skinny_fruit.reverse()}
        xKey="date"
        yKey="value"
        groupBy="fruit"
        xAxis="bottom"
        yAxis="right"
        yGrid={true}
        xAxisLabel="Date"
        yAxisLabel="Value"
        legend={'bottom'}
        tooltipVisible={true}
      />
      <AreaChart
        theme="light"
        height="100%"
        width="100%"
        data={portfolio.slice(30, 60)}
        xKey="date"
        yKey="value"
        xAxis="bottom"
        yAxis="right"
        yGrid={true}
        xAxisLabel="Date"
        yAxisLabel="Value"
      />
      <LineChart
        theme="light"
        height={'100%'}
        width={'100%'}
        data={portfolio}
        xKey="date"
        xDataType="date"
        yKey="value"
        xAxis="bottom"
        yAxis="left"
        yGrid={true}
        xAxisLabel="Date"
        yAxisLabel="Value"
        legend={'right'}
        legendLabel="Markets"
      />
      <ScatterPlot
        theme="light"
        height="100%"
        width="100%"
        data={penguins}
        xKey="flipper_length_mm"
        xDataType="number"
        xGrid={true}
        xAxis="bottom"
        xAxisLabel="Flipper Length"
        yKey="body_mass_g"
        yGrid={true}
        yAxis="right"
        yAxisLabel="Body Mass"
      />
    </Container>
  );
}

export default App;
