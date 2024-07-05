class Currency {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
}

class CurrencyConverter {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.currencies = [];
    }

    async getCurrencies() {
        this.currencies = [];
        try {
            const response = await fetch(this.apiUrl + "/currencies");
            if(!response.ok) {
                throw new Error("ERROR al intentar realizar la solicitud. " + response.status)
            }
            const data = await response.json();

            Object.entries(data)
                .forEach(([code, name]) => {
                    this.currencies.push(new Currency(code, name));
            });
        } catch (error) {
            console.error('Se produjo un error al intentar realizar la solicitud. ', error)
        }
    }

    async convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency.code === toCurrency.code)
            return Number(amount);
        else {
            try {
                const response = await fetch(`${this.apiUrl}/latest?amount=${amount}&from=${fromCurrency.code}&to=${toCurrency.code}`);
                if (!response.ok) {
                    throw new Error("ERROR al intentar realizar la solicitud. " + response.status);
                }
                const data = await response.json();
                
                return data["rates"][toCurrency.code];
            } catch (error) {
                console.error('Se produjo un error al intentar realizar la solicitud. ', error)
            }
        }
    }

    async convertCurrencyFromDate(amount, fromCurrency, toCurrency, date) {
        if (fromCurrency.code === toCurrency.code)
            return Number(amount);
        else {
            try {
                const response = await fetch(`${this.apiUrl}/${date}?amount=${amount}&from=${fromCurrency.code}&to=${toCurrency.code}`);
                if (!response.ok) {
                    throw new Error("ERROR al intentar realizar la solicitud. " + response.status);
                }
                const data = await response.json();
                return data["rates"][toCurrency.code];
            } catch (error) {
                console.error('Se produjo un error al intentar realizar la solicitud. ', error)
            }
        }
    }
}
const converter = new CurrencyConverter("https://api.frankfurter.app");
document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("conversion-form");
    const resultDiv = document.getElementById("result");
    const fromCurrencySelect = document.getElementById("from-currency");
    const toCurrencySelect = document.getElementById("to-currency");
    const fromCurrencySelectDate = document.getElementById("from-currency-date");
    const toCurrencySelectDate = document.getElementById("to-currency-date");

    await converter.getCurrencies();
    populateCurrencies(fromCurrencySelect, converter.currencies);
    populateCurrencies(toCurrencySelect, converter.currencies);
    populateCurrencies(fromCurrencySelectDate, converter.currencies);
    populateCurrencies(toCurrencySelectDate, converter.currencies);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const amount = document.getElementById("amount").value;
        const fromCurrency = converter.currencies.find(
            (currency) => currency.code === fromCurrencySelect.value
        );
        const toCurrency = converter.currencies.find(
            (currency) => currency.code === toCurrencySelect.value
        );
        const convertedAmount = await converter.convertCurrency(
            amount,
            fromCurrency,
            toCurrency
        );
        if (convertedAmount !== null && !isNaN(convertedAmount)) {
            resultDiv.textContent = `${amount} ${
                fromCurrency.code
            } son ${convertedAmount.toFixed(2)} ${toCurrency.code}`;
        } else {
            resultDiv.textContent = "Error al realizar la conversión.";
        }
    });

    function populateCurrencies(selectElement, currencies) {
        if (currencies) {
            currencies.forEach((currency) => {
                const option = document.createElement("option");
                option.value = currency.code;
                option.textContent = `${currency.code} - ${currency.name}`;
                selectElement.appendChild(option);
            });
        }
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("conversion-form-date");
    const resultDiv = document.getElementById("result-date");
    const fromCurrencySelect = document.getElementById("from-currency-date");
    const toCurrencySelect = document.getElementById("to-currency-date");
    const dateInput = document.getElementById("date-input");
    dateInput.max = formatDate(new Date());

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const amount = document.getElementById("amount-date").value;
        const fromCurrency = converter.currencies.find(
            (currency) => currency.code === fromCurrencySelect.value
        );
        const toCurrency = converter.currencies.find(
            (currency) => currency.code === toCurrencySelect.value
        );
        const convertedAmount = await converter.convertCurrencyFromDate(
            amount,
            fromCurrency,
            toCurrency,
            formatDate(new Date(dateInput.value))
        );
        if (convertedAmount !== null && !isNaN(convertedAmount)) {
            resultDiv.textContent = `${amount} ${
                fromCurrency.code
            } son ${convertedAmount.toFixed(2)} ${
                toCurrency.code} en el ${dateInput.value}`;
        } else {
            resultDiv.textContent = "Error al realizar la conversión.";
        }
    });

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2,'0');
        return `${year}-${month}-${day}`;
    }
});
