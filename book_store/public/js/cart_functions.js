// Detects a need to update the cart when quantity is changed

function update(id, qty) {
    document.getElementById("checkoutButton").value = "Update";
    $("#" + id).attr("value", qty)
    // $("#checkoutButton").attr("value", "100");
    // $("checkoutButton").attr(id, quantity);
}

// function autofill(user_email) {
//     document.getElementById('fullName').value = user_email
//     // document.getElementById('phoneNumber').value = user_phone;
//     // document.getElementById('address').value = user_address;
//     // document.getElementById('address1').value = user_address1;
//     // document.getElementById('country').value = user_country
//     // document.getElementById('city').value = user_city
//     // document.getElementById('postalCode').value = user_postalCode
// }

function autofill(user_name, user_phone, user_address, user_address1, user_country, user_city, user_postalCode) {
    document.getElementById('fullName').value = user_name;
    document.getElementById('phoneNumber').value = user_phone;
    document.getElementById('address').value = user_address;
    document.getElementById('address1').value = user_address1;
    // Use this boolean methods as country values have changed to short-form
    // too many countries, cannot finish :(
    if (user_country == "Singapore") {
        user_country = "SG"
    }

    else if (user_country == "Afghanistan") {
        user_country = "AF"
    }
    else if (user_country == "Åland Islands") {
        user_country = "AX"
    }

    else if (user_country == "United States") {
        user_country = "US"
    }

    else if (user_country == "China") {
        user_country = "CN"
    }

    else if (user_country == "Malaysia") {
        user_country = "MY"
    }

    else if (user_country == "India") {
        user_country = "IN"
    }

    else if (user_country == "Indonesia") {
        user_country = "ID"
    }

    else if (user_country == "Japan") {
        user_country = "JP"
    }

    else if (user_country == "Korea, Republic of") {
        user_country = "KR"
    }

    else if (user_country == "Korea, Democratic People's Republic of") {
        user_country = "KP"
    }

    else if (user_country == "Russian Federation") {
        user_country = "RU"
    }

    document.getElementById('country').value = user_country
    document.getElementById('city').value = user_city
    document.getElementById('postalCode').value = user_postalCode
}
// Determine if checkout Button needed to update or checkout.
// No more need, replacement function in route js

// function checkout() {
//     if (document.getElementById("checkoutButton").value == "Update") {
//         window.location.href= '/checkout/cart'
//     }

//     else {
//         window.location.href = '/checkout/checkout123';
//     }
// }