# Functional Requirements

1. **User Accounts**
   - Users can register, log in, reset passwords, and update their profiles.
   - Admins can log in to a secured dashboard.

2. **Product Management**
   - Customers can browse and search for books.
   - Admins can create, edit, or delete products.

3. **Cart & Checkout**
   - Customers can add, update, and remove cart items.
   - Checkout supports Stripe and PayNow.
   - Coupons and discounts can be applied during checkout.

4. **Orders & Delivery**
   - Orders are recorded and viewable by both customer and admin.
   - Delivery tracking status can be viewed and updated.

5. **Notifications**
   - The system sends email and SMS confirmations for orders.

6. **Security & Sessions**
   - Authentication is handled via Passport (local/Facebook).
   - Sessions are maintained using express-session with MySQL store.
