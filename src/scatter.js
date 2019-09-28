import React from 'react';
import * as d3 from 'd3';


class AxisSelect extends React.Component {
  render() {
    return (
      <select onChange={this.props.updateScatter} value={this.props.value}>
        <option value='eliminations_avg_per_10m'>Avg Elimination per 10m</option>
        <option value='deaths_avg_per_10m'>Avg Death per 10m</option>
        <option value='hero_damage_avg_per_10m'>Avg Damage per 10m</option>
        <option value='healing_avg_per_10m'>Avg Healing per 10m</option>
        <option value='ultimates_earned_avg_per_10m'>Avg Ultimates Earned per 10m</option>
        <option value='final_blows_avg_per_10m'>Avg Final Blows per 10m</option>
        <option value='time_played_total'>Total Time Played (hr)</option>
      </select>
    );
  }
}

class Scatter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      xValue: this.props.xValue,
      yValue: this.props.yValue,
      xTitle: this.props.xTitle,
      yTitle: this.props.yTitle,
      convertedTime: false
    }
  }

  drawChart() {
    let playerData = this.props.playerData;
    let teamData = this.props.teamData;
    playerData = Object.values(playerData);
    if (!this.state.convertedTime) {
      for (let k of Object.keys(this.props.playerData)) {   // convert seconds to hours
        this.props.playerData[k].time_played_total /= 3600;
      }
      this.setState({convertedTime: true});
    }

    d3.select('#scatter')
      .attr("id", 'owl-scatter')
      .attr("width", 1150)
      .attr("height", 650);
    const svg = d3.select(`#${this.props.id}`);
    svg.selectAll("*").remove();

    const width = +svg.attr('width');
    const height = +svg.attr('height');

    const xValue = d => d[this.state.xValue];
    const xAxisLabel = this.state.xTitle;

    const yValue = d => d[this.state.yValue];
    const yAxisLabel = this.state.yTitle;

    const margin = { top: 20, right: 40, bottom: 88, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
      .domain(d3.extent(playerData, xValue))
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleLinear()
      .domain(d3.extent(playerData, yValue))
      .range([innerHeight, 0])
      .nice();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format('~s'))
      .tickSize(-innerHeight)
      .tickPadding(15);

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d3.format('~s'))
      .tickSize(-innerWidth)
      .tickPadding(10);

    const yAxisG = g.append('g').call(yAxis);
    yAxisG.selectAll('.domain').remove();

    yAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', -93)
        .attr('x', -innerHeight / 2)
        .attr('fill', 'black')
        .attr('transform', `rotate(-90)`)
        .attr('text-anchor', 'middle')
        .text(yAxisLabel);

    const xAxisG = g.append('g').call(xAxis)
      .attr('transform', `translate(0,${innerHeight})`);

    xAxisG.select('.domain').remove();

    xAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', 75)
        .attr('x', innerWidth / 2)
        .attr('fill', 'black')
        .text(xAxisLabel);

    const circleRadius = 5;
    g.selectAll('circle').data(playerData)
      .enter().append('circle')
        .attr('cy', d => yScale(yValue(d)))
        .attr('cx', d => xScale(xValue(d)))
        .attr('r', circleRadius)
        .attr('fill', d => `${teamData[+d.teamId].teamColors.primary.color}`)
        .append('svg:title')
        .text(d =>
          `${d.name}\nX: ${d[this.state.xValue].toFixed(2)}\nY: ${d[this.state.yValue].toFixed(2)}
          `);
  }

  updateScatterX = (e) => {
    this.setState({xValue: e.target.value});
    this.setState({xTitle: e.target.options[e.target.selectedIndex].text})
    this.forceUpdate();
  }

  updateScatterY = (e) => {
    this.setState({yValue: e.target.value});
    this.setState({yTitle: e.target.options[e.target.selectedIndex].text})
    this.forceUpdate();
  }

  render(){
    if (Object.keys(this.props.playerData).length > 0
      && Object.keys(this.props.teamData).length > 0) {
      this.drawChart();
    }
    return (
      <div className="scatter-header">
        <h1>{this.props.title}</h1>
        <div className="axisSelects">
          <AxisSelect updateScatter={this.updateScatterX} value={this.state.xValue}/>
          <p>vs</p>
          <AxisSelect updateScatter={this.updateScatterY} value={this.state.yValue}/>
        </div>
      </div>
    );
  }
}


export default Scatter;
