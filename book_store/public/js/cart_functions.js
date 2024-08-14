// Detects a need to update the cart when quantity is changed

function update(id, qty) {
    document.getElementById("checkoutButton").value = "Update";
    $("#" + id).attr("value", qty)
}


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


// Simulate Loading Time
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to get a cookie value by name
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Function to update the cart quantity UI element
function updateCartUI() {
    // Retrieve cart quantity from cookie
    const cartQty = getCookie('cartQty') || 0;
    document.querySelector('.quntity').textContent = cartQty;
}


// List All Products Page - Add to Cart AJAX with Axios
// Select all elements with the class 'buy-now-btn'
document.querySelectorAll('.buy-now-btn').forEach(button => {
    button.addEventListener('click', async function (e) {
        e.preventDefault();
        const productId = this.dataset.productId;
        const productName = this.dataset.productName;

        // To show the spinner
        document.querySelector('.spinner-border').classList.remove('d-none');

        // Hide the products while request is being handled
        document.getElementById('myMenu').style.display = 'none'; 
        
        try {
        // Simulate a loading delay before sending the request
        await delay(5000); // Simulate a 2-second delay
        }
        catch {
            console.log("error")
        }


        axios.get(`/product/listproduct/${productId}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (response.status >= 200 && response.status < 300) {
                // To hide the spinner
                document.querySelector('.spinner-border').classList.add('d-none');
                // To show the products list after successful request
                document.getElementById('myMenu').style.display = 'block';

                // Successful response
                //console.log('Response data:', response.data);
                console.log(` ${productName}  added to cart!`);
                


                // Update Cart UI here
                updateCartUI();
            } else {
                // Handle non-successful status codes
                console.error('Unexpected status code:', response.status);
                alert('Failed to add product to cart.');
            }

        })
        .catch(error => {
            // Handle errors
            if (error.response) {
                // Server responded with a status code outside 2xx
                console.error('Response error:', error.response.status, error.response.data);
            } else if (error.request) {
                // No response received
                console.error('Request error:', error.request);
            } else {
                // Error setting up the request
                console.error('Error:', error.message);
            }
    });
});
})
