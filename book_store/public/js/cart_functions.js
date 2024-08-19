// Detects a need to update the cart when quantity is changed
// JQuery
// function update(id, qty) {
//     document.getElementById("checkoutButton").value = "Update";
//     $("#" + id).attr("value", qty)
// }

// Pure Javascript
function update(id, qty) {
    document.getElementById("checkoutButton").value = "Update";
    console.log(qty)
    document.getElementById(id).value = qty;
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


// Function to display flash messages client-side when paired up with axios and ajax, mimics behavior of flash-messenger
const flashMessage = (messageType, message, icon = '', dismissible = true, timeout = 5000) => {
    const flashContainer = document.getElementById('flash-container');

    // Create the alert element
    const flashElement = document.createElement('div');
    flashElement.className = `alert alert-${messageType}`;
    flashElement.style.zIndex = '9999';
    flashElement.style.position = 'relative'; // Ensure relative positioning for the close button

    // Create the message content
    const messageContent = document.createElement('h6');

    // Add the icon if provided
    if (icon) {
        const iconElement = document.createElement('i');
        iconElement.className = icon;
        iconElement.setAttribute('aria-hidden', 'true');
        messageContent.appendChild(iconElement);
    }

    // Add the message text
    messageContent.appendChild(document.createTextNode(` ${message}`));
    
    // Append the content to the alert element
    flashElement.appendChild(messageContent);

    // If dismissible, add the close button
    if (dismissible) {
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'close';
        closeButton.setAttribute('data-dismiss', 'alert');
        closeButton.setAttribute('aria-label', 'Close');

        const closeIcon = document.createElement('span');
        closeIcon.setAttribute('aria-hidden', 'true');
        closeIcon.innerHTML = '&times;'; // HTML entity for "×"

        closeButton.appendChild(closeIcon);
        flashElement.appendChild(closeButton);
    }

    // Append the flash message to the container
    flashContainer.appendChild(flashElement);

    // Automatically remove the alert after `timeout` milliseconds
    setTimeout(() => {
        flashElement.classList.remove('show');
        flashElement.classList.add('fade');
        setTimeout(() => {
            flashElement.remove();
        }, 150); // Duration to match fade transition
    }, timeout);
};


// List All Products Page - Add to Cart AJAX with Axios
document.querySelectorAll('.buy-now-btn').forEach(button => {
    button.addEventListener('click', async function (e) {
        e.preventDefault();
        const productId = this.dataset.productId;
        const productName = this.dataset.productName;

        // To show the spinner when user added item to cart
        document.querySelector('.spinner-border').classList.remove('d-none');

        // Hide the products while request is being handled
        document.getElementById('myMenu').style.display = 'none'; 
        
        try {
        // Simulate a loading delay before sending the request
        await delay(2000); // Simulate a 2-second delay
        }
        catch {
            console.log("error")
        }

        // Axios AJAX call
        axios
          .get(`/product/listproduct/${productId}`, {
            headers: {
              "X-Requested-With": "XMLHttpRequest",
            },
          })
          .then((response) => {
            // On Successful response, hide spinner, unhide products
            if (response.status >= 200 && response.status < 300) {
              document.querySelector(".spinner-border").classList.add("d-none");
              document.getElementById("myMenu").style.display = "block";
              // Flash MSG
              if (response.data.success) {
                const flashMessages = response.data.flashMessage;
                flashMessages.forEach((msg) => {
                  // Example usage of flashMessage function with a 5-second timeout
                  flashMessage(
                    "success",
                    msg,
                    "fas fa-exclamation-circle",
                    true,
                    5000
                  );
                });
              }

              // Update quantity of cart items in Cart UI here
              updateCartUI();
            } else {
              // Handle non-successful status codes
              console.error("Unexpected status code:", response.status);
              alert("Failed to add product to cart.");
            }
          })
          // might need to touch up here
          .catch((error) => {
            // Handle errors
            if (error.response) {
              // Server responded with a status code outside 2xx
              console.error(
                "Response error:",
                error.response.status,
                error.response.data
              );
            } else if (error.request) {
              // No response received
              console.error("Request error:", error.request);
            } else {
              // Error setting up the request
              console.error("Error:", error.message);
            }
          });
});
})


// Individual Product Page - Add to Cart
document.querySelectorAll('.buy-now-btn2').forEach(button => {
  button.addEventListener('click', async function (e) {
      e.preventDefault();
      const productId = this.dataset.productId;
      const productName = this.dataset.productName;

      // Show the spinner when the user adds an item to the cart
      document.querySelector('.spinner-border').classList.remove('d-none');

      // Hide the button while the request is being handled
      document.getElementById('buy-now-btn2').style.display = 'none';

      try {
          // Simulate a loading delay before sending the request
          await delay(2000); // 2-second delay
      } catch (error) {
          console.log("Error during delay:", error);
      }

      // Axios AJAX POST request
      axios.post(`/product/individualProduct/${productId}`, {
          productId: productId,   // Sending the productId in the request body
          productName: productName // Include other data as needed
      }, {
          headers: {
              "X-Requested-With": "XMLHttpRequest",
              "Content-Type": "application/json"
          },
      })
      .then((response) => {
          // Handle successful response
          if (response.status >= 200 && response.status < 300) {
              // Hide spinner and show the button again
              document.querySelector(".spinner-border").classList.add("d-none");
              document.getElementById("buy-now-btn2").style.display = "block";
              
              // Flash messages if available
              if (response.data.success) {
                  const flashMessages = response.data.flashMessage;
                  flashMessages.forEach((msg) => {
                      flashMessage(
                          "success",
                          msg,
                          "fas fa-exclamation-circle",
                          true,
                          5000
                      );
                  });
              }

              // Update quantity of cart items in Cart UI
              updateCartUI();
          } else {
              // Handle non-successful status codes
              console.error("Unexpected status code:", response.status);
              alert("Failed to add product to cart.");
          }
      })
      .catch((error) => {
          // Handle errors
          if (error.response) {
              // Server responded with a status code outside 2xx
              console.error("Response error:", error.response.status, error.response.data);
          } else if (error.request) {
              // No response received
              console.error("Request error:", error.request);
          } else {
              // Error setting up the request
              console.error("Error:", error.message);
          }
      });
  });
});


// Update Cart - Cart Page [Not in Use for now]
// document.getElementById('cartForm').addEventListener('submit', function(e) {
//     e.preventDefault(); // Prevent the default form submission

//     // Gather the form data
//     let formData = new FormData(this);

//     axios.post('/cart', formData)
//         .then(function(response) {
//             // Handle the response here (e.g., redirect to checkout page)
//             if (response.data.redirectToCheckout) {
//                 window.location.href = '/checkout';
//             } else {
//                 // Reload the cart page or show a success message
//                 window.location.href = '/cart';
//             }
//         })
//         .catch(function(error) {
//             console.error('There was an error updating the cart:', error);
//             // Optionally display an error message to the user
//         });
// });
// function submitCartForm() {
//     document.getElementById('cartForm').submit();
// }

// // Attach the submitCartForm function to the Checkout button click
// document.getElementById('checkoutButton').addEventListener('click', function() {
//     submitCartForm();
// });