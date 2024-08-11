import Easypost from "@easypost/api";
const apiKey = process.env.EASY_POST_APIKEY;
const api = new Easypost(apiKey);

function searchAddress() {
	var addressId;
	addressId = document.getElementById("addressId");
	api.Address.retrieve(addressId).then(console.log);
}


