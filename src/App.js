import React, { useEffect, useState } from "react";
import { groupBy, map, filter, sortBy } from "lodash";
import "./App.css";

const App = () => {
  const [data, setData] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [countries, setCountries] = useState([]);
  const [currentCountry, setCurrentCounrty] = useState("");
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    fetchRamen();
    return () => null;
  }, []);

  useEffect(() => {
    makeData(rawData);
    return () => null;
  }, [currentCountry, searchString]);

  const fetchRamen = async () => {
    const res = await fetch("http://starlord.hackerearth.com/TopRamen");
    const response = await res.json();

    const groupedCountries = groupBy(response, "Country");
    const parsedCountries = Object.keys(groupedCountries);

    const dataWithYearAndRank = map(response, item => {
      const arr = item["Top Ten"].split(" ");
      const year = arr[0];
      const rank = arr[1]?.split("#")[1];
      item["year"] = year;
      item["rank"] = rank;
      return item;
    });

    setCountries(parsedCountries);

    setRawData(response);

    makeData(dataWithYearAndRank);
  };

  const makeData = response => {
    const filteredData = filter(response, data => {
      if (
        data.Country.toLowerCase().includes(currentCountry.toLowerCase()) &&
        (data.Brand.toLowerCase().includes(searchString.toLowerCase()) ||
          data.Variety.toLowerCase().includes(searchString.toLowerCase()) ||
          data.Country.toLowerCase().includes(searchString.toLowerCase()))
      )
        return true;
    });

    const groupedData = groupBy(filteredData, "year");

    setData(groupedData);
  };

  const renderYearData = yearData => (
    <li className="yearSection-list-item">
      <div className="yearSection-list-item-wrapper">
        <h4>
          {yearData.Variety} by <span>{yearData.Brand}</span>
        </h4>
        <p>In {yearData.Style} Category</p>
        <p>From {yearData.Country}</p>
        <p>Have {yearData.Stars} Star Rating</p>
        <p>Been #{yearData.rank} Rank</p>
      </div>
    </li>
  );

  const renderYearWiseList = (year, yearData) => {
    const sortedArr = sortBy(yearData, "rank");
    return (
      <section className="yearSection">
        <h2 className="yearSection-heading">{`Year ${year}`}</h2>
        <ul className="yearSection-list">
          {map(sortedArr, (yd, i) => (
            <React.Fragment key={`${year}-${i}`}>
              {renderYearData(yd)}
            </React.Fragment>
          ))}
        </ul>
      </section>
    );
  };

  const renderList = () => {
    const years = Object.keys(data);
    return (
      <div className="container">
        {map(years, year => (
          <React.Fragment key={`list-${year}`}>
            {renderYearWiseList(year, data[year])}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderCountriesSelect = () => {
    return (
      <select
        value={currentCountry}
        onChange={e => setCurrentCounrty(e.target.value)}
        className="country"
      >
        <option value="">Select Country</option>
        {map(countries, country => (
          <option value={country} key={country}>
            {country}
          </option>
        ))}
      </select>
    );
  };

  const renderChildren = () => {
    return (
      <div>
        <header className="header">
          <div className="container header-wrapper">
            <h1 className="logo">
              <a href="/">Stash Away</a>
            </h1>

            <input
              type="text"
              value={searchString}
              placeholder="Search by brand, variety, country"
              onChange={e => setSearchString(e.target.value)}
              className="search"
            />
            {renderCountriesSelect()}
          </div>
        </header>
        <main className="main">{renderList()}</main>
      </div>
    );
  };

  return (
    <div className="App">{data === null ? "Loading..." : renderChildren()}</div>
  );
};

export default App;
