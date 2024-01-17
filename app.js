const API_KEY = "50e256fd1384611a25a651e2";

function newElement(tag, attrs = null, text = null) {
  const element = document.createElement(tag);
  if (attrs) {
    for (const attr in attrs) {
      element.setAttribute(`${attr}`, `${attrs[attr]}`);
    }
  }
  if (text) {
    const node = document.createTextNode(text);
    element.appendChild(node);
  }
  return element;
}

const inputAmount = document.getElementById("amount");
const selectFrom = document.getElementById("from-currency");
const selectTo = document.getElementById("to-currency");
let codes = [];

async function loadAPICodes() {
  const resCodes = await fetch(
    `https://v6.exchangerate-api.com/v6/${API_KEY}/codes`
  );
  const jsonCodes = await resCodes.json();

  codes = jsonCodes.supported_codes;
  codes.sort((a, b) => {
    if (a[1] < b[1]) {
      return -1;
    }
    if (a[1] > b[1]) {
      return 1;
    }
    return 0;
  });

  codes.forEach((arr) => {
    const code = arr[0];
    const description = arr[1];

    selectFrom.append(
      newElement("option", { value: code }, `${description} (${code})`)
    );
    selectTo.append(
      newElement("option", { value: code }, `${description} (${code})`)
    );
  });

  let fromCurrency = "USD";
  const toCurrency = "KZT";
  const divRates = document.getElementById("rates");

  loadRate("USD", "KZT", divRates);
  loadRate("EUR", "KZT", divRates);

  selectFrom.value = "USD";
  selectTo.value = "KZT";
}

async function loadRate(curr1, curr2, parent) {
  const resRate = await fetch(
    `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${curr1}/${curr2}`
  );
  const jsonRate = await resRate.json();

  const divRow = newElement("div");
  divRow.className = "row";

  const divCurrency = newElement("div", null, getCurrencyName(curr1));
  divCurrency.className = "currency";

  const divRate = newElement("div");
  divRate.className = "rate";
  divRate.append(newElement("p", null, jsonRate.conversion_rate));
  divRate.append(newElement("p", null, `${curr1} / ${curr2}`));

  divRow.append(divCurrency, divRate);
  parent.append(divRow);
}

function getCurrencyName(currencyCode) {
  let result = currencyCode;
  for (let index = 0; index < codes.length; index++) {
    if (codes[index][0] == currencyCode) {
      result = codes[index][1];
      break;
    }
  }
  return result;
}

loadAPICodes();

inputAmount.value = 1;
