# Non-Functional Requirements

1. **Performance**
   - Average page load ≤ 3s; DB queries ≤ 1s.

2. **Reliability**
   - Sessions persist across browsing; orders never lost on payment failure.

3. **Security**
   - Passwords hashed with bcrypt; admin routes protected by middleware.

4. **Usability**
   - Consistent layouts using Handlebars templates; clear flash messages.

5. **Maintainability**
   - Organized MVC structure (routes, models, helpers, views).
   - TypeScript used for type safety and cleaner builds.

6. **Scalability**
   - Ready for migration to PostgreSQL or cloud DB if required.

7. **Availability**
   - Target uptime ≥ 99% with regular backups and HTTPS in production.
