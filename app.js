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
const spanFrom = document.getElementById("from-result");
const spanTo = document.getElementById("to-result");
let codes = [];

async function loadAPICodes() {
  let jsonCodes = {};
  try {
    const resCodes = await fetch(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/codes`
    );
    jsonCodes = await resCodes.json();
  } catch (error) {
    showError("Проблема со связью");
    return;
  }
  if (jsonCodes.result == "error") {
    showError("API вернул ошибку");
    return;
  }

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

  inputAmount.value = 1;
  selectFrom.value = "USD";
  selectTo.value = "KZT";
  loadRateAmount();
}

async function loadRate(curr1, curr2, parent) {
  let jsonRate = {};
  try {
    const resRate = await fetch(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${curr1}/${curr2}`
    );
    jsonRate = await resRate.json();
  } catch (error) {
    showError("Проблема со связью");
    return;
  }
  if (!jsonRate.result == "error") {
    showError("API вернул ошибку");
    return;
  }

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

inputAmount.addEventListener("input", () => {
  loadRateAmount();
});
selectFrom.addEventListener("change", () => {
  loadRateAmount();
});
selectTo.addEventListener("change", () => {
  loadRateAmount();
});

async function loadRateAmount() {
  hideError();

  const amount = inputAmount.value;
  if (!amount) {
    return;
  }
  const curr1 = selectFrom.value;
  const curr2 = selectTo.value;

  let jsonRate = {};
  try {
    const resRate = await fetch(
      `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${curr1}/${curr2}/${amount}`
    );
    jsonRate = await resRate.json();
  } catch (error) {
    showError("Проблема со связью");
    return;
  }
  if (!jsonRate.result == "error") {
    showError("API вернул ошибку");
    return;
  }

  spanFrom.textContent = `${amount} (${curr1})`;
  spanTo.textContent = `${jsonRate.conversion_result} (${curr2})`;
}

function showError(message) {
  const divResult = document.getElementById("result");
  divResult.style.display = "none";

  const divError = document.getElementById("error");
  divError.textContent = message;
  divError.style.display = "block";
}

function hideError() {
  const divResult = document.getElementById("result");
  divResult.style.display = "block";

  const divError = document.getElementById("error");
  divError.textContent = "";
  divError.style.display = "none";
}

loadAPICodes();
