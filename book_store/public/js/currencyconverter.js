import fetch from "node-fetch";
function currencyConverter() {
	fetch("https://api.exchangeratesapi.io/latest?symbols=USD,GBP")
		.then((res) => res.json())
		.then((json) => console.log(json));
}
console.log(currencyConverter());


