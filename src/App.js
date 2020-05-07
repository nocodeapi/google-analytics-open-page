import React, { Component } from "react";
import Chart from "chart.js";
import "./styles.css";

const _ = require("lodash");

function roundNumber(value, roundTo = 1) {
  const d = value / 1000;
  return `${d.toFixed(roundTo)}k`;
}

function percentage(partialValue, totalValue) {
  const num = (100 * partialValue) / parseInt(totalValue);
  const roundNumb = num < 1 ? num.toFixed(2) : num.toFixed(0);
  return `${roundNumb}%`;
}

export default class LineGraph extends Component {
  chartRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      totlaView: {},
      source: {},
      pages: {},
      screens: {},
      browsers: {},
      countries: {}
    };
  }

  componentDidMount() {
    const myChartRef = this.chartRef.current.getContext("2d");

    const fetchMyAPI = async () => {
      const response = await fetch(
        `${
          process.env.API_ENDPOINT
        }?metrics=pageviews,users&startDate=30daysAgo&dimensions=date`
      );
      const result = await response.json();

      this.setState({ totlaView: result[0] });

      const datasets = [];
      result.forEach((element, key) => {
        const setData = {
          label: element.name,
          data: element.datasets
        };
        if (key === 0) {
          setData.borderColor = "red";
        }
        if (key === 1) {
          setData.borderColor = "green";
        }
        datasets.push(setData);
      });

      new Chart(myChartRef, {
        type: "line",
        data: {
          // Bring in data
          labels: result[0].labels,
          datasets
        },
        options: {
          // Customize chart options
        }
      });
    };

    fetchMyAPI();

    const fetchSource = async () => {
      const response = await fetch(
        `${
          process.env.API_ENDPOINT
        }?metrics=pageviews&startDate=30daysAgo&dimensions=source&orderBys=descending`
      );
      const result = await response.json();
      const jsonArrayObjs = _.zipObject(result[0].labels, result[0].datasets);

      this.setState({ source: jsonArrayObjs });
    };
    fetchSource();

    const fetchPages = async () => {
      const response = await fetch(
        `${
          process.env.API_ENDPOINT
        }?metrics=pageviews&startDate=30daysAgo&dimensions=pagePath&orderBys=descending`
      );
      const result = await response.json();
      const jsonArrayObjs = _.zipObject(result[0].labels, result[0].datasets);
      this.setState({ pages: jsonArrayObjs });
    };
    fetchPages();

    const fetchScreen = async () => {
      const response = await fetch(
        `${
          process.env.API_ENDPOINT
        }?metrics=users&startDate=30daysAgo&dimensions=deviceCategory&orderBys=descending`
      );
      const result = await response.json();
      const jsonArrayObjs = _.zipObject(result[0].labels, result[0].datasets);
      const allData = { data: jsonArrayObjs, total: result[0].totals };
      this.setState({ screens: { ...allData } });
    };
    fetchScreen();

    const fetchBrowser = async () => {
      const response = await fetch(
        `${
          process.env.API_ENDPOINT
        }?metrics=users&startDate=30daysAgo&dimensions=browser&orderBys=descending`
      );
      const result = await response.json();
      const jsonArrayObjs = _.zipObject(result[0].labels, result[0].datasets);
      const allData = { data: jsonArrayObjs, total: result[0].totals };
      this.setState({ browsers: { ...allData } });
    };
    fetchBrowser();

    const fetchContries = async () => {
      const response = await fetch(
        `${
          process.env.API_ENDPOINT
        }?metrics=users&startDate=30daysAgo&dimensions=country&orderBys=descending`
      );
      const result = await response.json();
      const jsonArrayObjs = _.zipObject(result[0].labels, result[0].datasets);
      const allData = { data: jsonArrayObjs, total: result[0].totals };
      this.setState({ countries: { ...allData } });
    };
    fetchContries();
  }

  render() {
    const {
      source,
      pages,
      screens,
      countries,
      browsers,
      totlaView
    } = this.state;
    return (
      <div className="main-container">
        <div className="chart-controls">
          <div className="view-count">
            {roundNumber(totlaView.totals, 0)} page views in last 30 days
          </div>
        </div>
        <canvas id="myChart" ref={this.chartRef} />
        <div className="other-matrix">
          <div className="referrals list-item">
            <h3>Traffic Source</h3>
            {Object.entries(source)
              .splice(0, 20)
              .map(([key, value]) => (
                <div className="list" key={key}>
                  <b>{value > 999 ? roundNumber(value) : value}</b>
                  <span>{key}</span>
                </div>
              ))}
          </div>

          <div className="top-pages list-item">
            <h3>Top Pages</h3>
            {Object.entries(pages)
              .splice(0, 20)
              .map(([key, value]) => (
                <div className="list" key={key}>
                  <b>{value > 999 ? roundNumber(value) : value}</b>
                  <span>{key}</span>
                </div>
              ))}
          </div>
          <div className="systems-data list-item">
            <h3>Screens</h3>
            <div className="screens">
              {screens.data !== undefined &&
                Object.entries(screens.data)
                  .splice(0, 10)
                  .map(([key, value]) => (
                    <div className="list" key={key}>
                      <b>{value > 999 ? roundNumber(value) : value}</b>
                      <span>
                        {key} ({percentage(value, screens.total)})
                      </span>
                    </div>
                  ))}
            </div>

            <h3>Browsers</h3>
            <div className="browsers list-item">
              {browsers.data !== undefined &&
                Object.entries(browsers.data)
                  .splice(0, 10)
                  .map(([key, value]) => (
                    <div className="list" key={key}>
                      <b>{value > 999 ? roundNumber(value) : value}</b>
                      <span>
                        {key} ({percentage(value, browsers.total)})
                      </span>
                    </div>
                  ))}
            </div>
          </div>

          <div className="countries list-item">
            <h3>Countries</h3>
            {countries.data !== undefined &&
              Object.entries(countries.data)
                .splice(0, 20)
                .map(([key, value], index) => (
                  <div className="list" key={key}>
                    <b>{value > 999 ? roundNumber(value) : value}</b>
                    <span>
                      {key} ({percentage(value, countries.total)})
                    </span>
                  </div>
                ))}
          </div>
        </div>
      </div>
    );
  }
}
