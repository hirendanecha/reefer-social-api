const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const url = "https://strainrx.co/dispensaries/co/antonito/";
const cities = [
  "aberdeen",
  "airway-heights",
  "allyn-grapeview",
  "anacortes",
  "arlington",
  "auburn",
  "bainbridge-island",
  "battle-ground",
  "belfair",
  "bellevue",
  "bellingham",
  "blaine",
  "bothell",
  "bremerton",
  "brewster",
  "buckley",
  "burien",
  "burlington",
  "cashmere",
  "chehalis",
  "cheney",
  "chimacum",
  "clarkston",
  "cle-elum",
  "colville",
  "cook",
  "covington",
  "custer",
  "des-moines",
  "east-wenatchee",
  "edmonds",
  "ellensburg",
  "elma",
  "ephrata",
  "everett",
  "everson",
  "ferndale",
  "fife",
  "forks",
  "freeland",
  "gig-harbor",
  "gold-bar",
  "hoquiam",
  "issaquah",
  "kelso",
  "kenmore",
  "kennewick",
  "kingston",
  "kirkland",
  "lacey",
  "lake-stevens",
  "langley",
  "longview",
  "lyle",
  "lynnwood",
  "mead",
  "moses-lake",
  "mountlake-terrace",
  "mount-vernon",
  "north-bonneville",
  "oak-harbor",
  "ocean-shores",
  "okanogan",
  "olympia",
  "omak",
  "peshastin",
  "port-angeles",
  "port-orchard",
  "port-townsend",
  "poulsbo",
  "prosser",
  "pullman",
  "puyallup",
  "quincy",
  "redmond",
  "renton",
  "ritzville",
  "rochester",
  "seattle",
  "seaview",
  "sedro-woolley",
  "sequim",
  "shelton",
  "shoreline",
  "silverdale",
  "snohomish",
  "spanaway",
  "spokane",
  "spokane-valley",
  "tacoma",
  "tenino",
  "union-gap",
  "vancouver",
  "walla-walla",
  "wenatchee",
  "winthrop",
  "yakima",
];
const dataList = [];
let d = [];

const scraperData = async function (cityName, page = 1) {
  await axios
    .get(
      `https://strainrx.co/api/v1/businesses/wa/${cityName}?page=${page}&dispensary=true&_=1718171817446`
    )
    .then((response) => {
      console.log("Response:", response.data);

      if (response.data.length) {
        page = page + 1;
        d.push(response.data);
        return scraperData(cityName, page);
      }

      dataList.push({ [cityName]: d.flat(1) });
      return dataList;
    })
    .catch((error) => {
      console.log("Error fetching data:", error);
    });
};

const dataByCity = async (data) => {
  for (const city of cities) {
    const data = await scraperData(city);
    // dataList.push(data);
  }
  const dataJson = JSON.stringify(dataList);
  await fs.promises.writeFile("washington", dataJson);
};

dataByCity();
