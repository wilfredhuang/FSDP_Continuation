# Fullstack Project 'Acacia Bookstore'

![HTML](https://img.shields.io/badge/HTML-HTML5-E34F26?logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-JavaScript-F7DF1E?logo=javascript&logoColor=black)
![CSS](https://img.shields.io/badge/CSS-CSS3-1572B6?logo=css3&logoColor=white)
![Node.js](https://badgen.net/badge/Node.js/Node.js/339933?icon=label)
![Express.js](https://badgen.net/badge/Express.js/Express.js/000000?icon=label)
![Stripe](https://img.shields.io/badge/Stripe-Stripe-008CDD?logo=stripe&logoColor=white)
![Twilio](https://img.shields.io/badge/Twilio-Twilio-FF8C1A?logo=twilio&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-MySQL-4479A1?logo=mysql&logoColor=white)
![Git](https://img.shields.io/badge/Git-Git-F05032?logo=git&logoColor=white)

## Table of Contents

- [Acacia Bookstore](#project-title)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API Documentation](#api-documentation)

## Introduction

This is a comprehensive full-stack e-commerce bookshop web application designed for small to medium-sized businesses. It caters to business owners who seek a hands-on approach to digital business management. The application provides a suite of administrative tools that enable users to manage seasonal promotions, implement coupon codes, and drive customer engagement effectively.

## Features

- **RESTful API Web Application**: A robust API for handling client-server interactions.
- **Responsive Design**: Optimized for a seamless experience across various devices and screen sizes.
- **Pagination**: Efficiently handles large datasets with paginated content.
- **User Authentication System**: Secure authentication for user login and registration.
- **User Profile Management**: Allows users to update and manage their personal details.
- **Product Management System**: Comprehensive system for managing product listings.
- **Shopping Cart**: Feature for users to add, view, and modify items in their cart.
- **Payment System**:
  - **Stripe Integration**: Secure payment processing via Stripe.
  - **QR Code Payments**: Option to pay using QR codes.
- **Real-Time Notification System**:
  - **Twilio Integration**: Sends notifications via SMS or other Twilio-supported channels.
- **Administration System**:
  - **Graphical User Interface**: Manage users with an intuitive UI.
  - **Order Management**: View and manage order history and pending orders.
  - **Product Management**: Create, update, and delete product listings.
  - **Discounts and Coupons**: Implement item discounts and coupon codes with real-time duration tracking.

## Technologies Used

- **Frontend**:

  - **Foundation**: HTML, CSS, JavaScript
  - **Frameworks**: None
  - **Libraries**:
    - **Bootstrap**: CSS framework for designing responsive and mobile-first websites.
    - **moment.js**: Library for parsing, validating, manipulating, and formatting dates.
  - **APIs**:
    - **Google reCAPTCHA v2**: Service to protect websites from spam and abuse.
    - **Book API**: Custom or third-party API for accessing book data.

- **Backend**:

  - **Runtime Environment**:
    - **Node.js**: JavaScript runtime built on Chrome's V8 JavaScript engine.
  - **Frameworks**:
    - **Express.js**: Web application framework for Node.js, simplifies building server-side applications.
    - **AdminJS**: Admin panel framework for managing application data.
  - **View Engine**:
    - **Express Handlebars**: Templating engine for rendering HTML views in Express applications.
  - **Authentication**:
    - **Passport.js**: Middleware for Node.js used for user authentication.
    - **JSON Web Tokens (JWT)**: Token-based authentication standard used for securely transmitting information.
  - **Security**:
    - **Bcrypt**: Library for hashing passwords.
    - **dotenv**: Loads environment variables from a `.env` file into `process.env`.
  - **Database**:
    - **SQL**: Structured Query Language used for managing and manipulating relational databases.
    - **MySQL**: Popular relational database management system (RDBMS).
    - **Sequelize**: ORM library for Node.js to interact with SQL databases.
  - **HTTP Request Data Handling**:
    - **Request**: HTTP client for making requests from Node.js.
    - **Method-Override**: Middleware for Express that allows you to use HTTP verbs such as PUT and DELETE in places where the client doesn’t natively support them, such as in HTML forms.
    - **Express-Formidable**: Middleware for handling form submissions, including file uploads.
    - **Body-Parser**: Middleware for parsing incoming request bodies in various formats
  - **Session Management**:
    - **Express-Session**: Middleware for managing sessions in Express applications.
    - **Cookie-Parser**: Middleware for parsing cookies in Express.
    - **Express-MySQL-Session**: Store sessions in MySQL using Express-Session.
  - **Input Validation**:
    - **Validator**: Library for string validation and sanitization.
    - **Email-Validator**: Library specifically for validating email addresses.
  - **Notification**:
    - **Nodemailer**: Module for sending emails from Node.js applications.
  - **APIs**:
    - **Stripe**: Payment processing API.
    - **Twilio**: API for sending SMS, voice, and other communication services.
    - **EasyPost**: API for shipping and logistics management.

- **Development**:
  - **Runtime Tool**:
    - **Nodemon**: Tool that automatically restarts your Node.js application when file changes are detected.
  - **Code Editor**:
    - **Visual Studio Code**: Code editor
  - **Version Control System**:
    - **Git**
  - **Version Control Platform**:
    - **GitHub**
  - **Version Control GUI**:
    - **GitHub Desktop**: Graphical user interface for managing Git repositories.

## Installation

1. Clone the repository

```
   git clone https://github.com/wilfredhuang/FSDP_Continuation.git
```

2. Navigate to project directory and install node modules for frontend and backend

```
npm install
cd book_store
npm install
cd ..
```

3. Set up environment variables. Create a .env file in the book_store folder and add the following:

```
STRIPE_PUBLIC_KEY = "YOUR_KEY_HERE"
STRIPE_SECRET_KEY = "YOUR_KEY_HERE"
EASY_POST_APIKEY = "YOUR_KEY_HERE"
GOOGLE_RECAPTCHA_SITE_KEY = "YOUR_KEY_HERE"
GOOGLE_RECAPTCHA_SECRET_KEY = "YOUR_KEY_HERE"
STRIPE_SECRET_KEY = "YOUR_KEY_HERE"
TWILIO_ACCOUNT_SID = "YOUR_KEY_HERE"
TWILIO_ACCOUNT_AUTHTOKEN = "YOUR_KEY_HERE"
TWILIO_ACCOUNT_PHONENO = "YOUR_KEY_HERE"
```

4. Run the application

```
nodemon
```

## Usage

```

```

## API Documentation

Endpoints

```

```
