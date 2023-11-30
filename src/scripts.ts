import axios from "axios";

// Izvēlamies DOM elementus
const countryName =
  document.querySelector<HTMLInputElement>(".js-search-by-name");
const capitalName = document.querySelector<HTMLInputElement>(
  ".js-search-by-capital"
);
const currencyName = document.querySelector<HTMLInputElement>(
  ".js-search-by-currency"
);
const languageName = document.querySelector<HTMLInputElement>(
  ".js-search-by-language"
);
const tableBody = document.querySelector<HTMLTableSectionElement>("tbody");
const searchButton =
  document.querySelector<HTMLButtonElement>(".js-search-button");
const loadButton = document.querySelector<HTMLButtonElement>(".js-load-button");
const sortButton = document.querySelectorAll<HTMLElement>(".table-head"); // Lai varētu sortēt, spiežot uz virsraksta tabulā

let pageLimit = 20;
let currentOrder = "asc";

// Definējam klasi, norādot propertijus un metodes
class Country {
  name: string;
  code: string;
  capital: string;
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
  language: {
    code: string;
    name: string;
  };

  // Metode getTable(), lai ar axios dabūtu datus no datu bāzes un izsauktu metodi createTable()
  getTable() {
    axios
      .get<Country[]>(
        `http://localhost:3004/countries?_start=0&_limit=${pageLimit}`
      )
      .then((response) => {
        const responseData = response.data;
        this.createTable(responseData, tableBody);
      });
    return this;
  }

  // Metode createTable () dinamiski rada rows un columns, un ievieto tabulas bodijā
  createTable(data: Country[], targetBody: HTMLElement) {
    tableBody.innerHTML = "";
    data.forEach((element) => {
      const {
        name,
        capital,
        currency,
        language,
        code, // code būs nepieciešams, lai ģenerētu karogus
      } = element;
      const row = document.createElement("tr");

      const flagElement = document.createElement("td");
      flagElement.innerHTML = `<img class="country-flag formated-column" src="https://www.worldatlas.com/r/w425/img/flag/${code.toLowerCase()}-flag.jpg" alt="Flag image"> `;

      const nameElement = document.createElement("td");
      nameElement.className = "td-text formated-column";
      nameElement.innerText = name;

      const capitalElement = document.createElement("td");
      capitalElement.className = "td-text formated-column";
      capitalElement.innerText = capital;

      const currencyElement = document.createElement("td");
      currencyElement.className = "td-text formated-column";
      currencyElement.innerText = currency?.symbol
        ? `${currency.name}, ${currency.symbol}`
        : `${currency.name}`;

      const languageElement = document.createElement("td");
      languageElement.className = "td-text formated-column";
      languageElement.innerText = language.name;

      row.appendChild(flagElement);
      row.appendChild(nameElement);
      row.appendChild(capitalElement);
      row.appendChild(currencyElement);
      row.appendChild(languageElement);

      targetBody.appendChild(row);
    });
  }

  // Nākamās valstu porcijas ielādei. Izsauc getTable() pēc loadMore nospiešanas.
  loadMoreItems() {
    this.getTable();
  }

  // Tiek notīrītas visas rindiņas (izņemot tabulas headera rindu)
  deleteRows() {
    const rows = document.querySelectorAll("tr");
    rows.forEach((row) => {
      if (!row.className) {
        row.remove();
      }
    });
  }

  // Meklēšana attiecīgajos input logos.

  // Definējam values, dzēšam esošās rindas, radam jaunu tabulu, attīram meklēšanas formu
  search() {
    const countrySearchInput = countryName.value;
    const capitalSearchInput = capitalName.value;
    const currencySearchInput = currencyName.value;
    const languageSearchInput = languageName.value;
    this.deleteRows();
    axios
      .get<Country[]>(
        `http://localhost:3004/countries?name_like=${countrySearchInput}&capital_like=${capitalSearchInput}&currency.name_like=${currencySearchInput}&language.name_like=${languageSearchInput}`
      )
      .then((response) => {
        const result = response.data;
        this.createTable(result, tableBody);

        countryName.value = "";
        capitalName.value = "";
        currencyName.value = "";
        languageName.value = "";
      });
  }

  // Sort
  sortData(sortBy: string) {
    currentOrder = currentOrder === "asc" ? "desc" : "asc"; // Atkarībā no tekošās secības, nosaka vēlamo
    axios
      .get(
        `http://localhost:3004/countries?_sort=${sortBy}&_order=${currentOrder}&_start=0&_limit=${pageLimit}`
      )
      .then((response) => {
        const sortedData = response.data;
        this.createTable(sortedData, tableBody);
      });
  }
}

const country = new Country().getTable();
loadButton.addEventListener("click", () => {
  pageLimit += 20;
  country.loadMoreItems();
});

sortButton[1].addEventListener("click", () => country.sortData("name"));
sortButton[2].addEventListener("click", () => country.sortData("capital"));
sortButton[3].addEventListener("click", () =>
  country.sortData("currency.name")
);
sortButton[4].addEventListener("click", () =>
  country.sortData("language.name")
);

searchButton.addEventListener("click", (event) => {
  event.preventDefault();
  country.search();
});
