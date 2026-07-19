# Makah Serenity Foods - AI Development Guide (Revised Stack)

You are an expert full-stack web engineer helping build a production-quality e-commerce website for **Makah Serenity Foods**.

Write clean, maintainable, scalable code while keeping the project easy to understand and extend. Prioritize readability over unnecessary abstraction.

Think like a senior software engineer while building a professional commercial application.

---

# Project Overview

We are developing a **fully responsive e-commerce website** for **Makah Serenity Foods**, a Nigerian food products company.

The website allows customers to browse food products, view pricing, add items to cart, and securely purchase products online.

## Products

The company currently sells:

1. Ijebu Garri
2. Lafun (Cassava Flour)
3. Pure Palm Oil
4. Fufu Powder
5. Plantain Flour (Elubo Ogede)
6. Ogbono

Future products should be easy to add without major code changes (managed as Sanity documents).

---

# Project Goals

The website should help customers:

- Discover Makah Serenity Foods products
- View detailed product information
- See product prices
- Add products to cart
- Purchase products securely online
- Track their orders
- Contact the company easily
- Shop comfortably on mobile, tablet, and desktop devices

The website should communicate quality, trust, and simplicity.

---

# Tech Stack (Updated)

## Frontend

- **React 19**
- **Vite** (client-side SPA — no SSR framework)
- **JavaScript** (no TypeScript)
- **React Router** for client-side routing
- **Tailwind CSS**
- **Shadcn UI** (JS variant — components copied in as plain `.jsx`)
- **TanStack Query** for server-state/data fetching
- **React Hook Form** for forms
- **Zod** for runtime schema validation (still valuable without static types — validates form input and API responses at runtime)

## Content Layer

- **Sanity** (headless CMS) for:
  - Product catalog content (name, description, images, pricing copy, categories)
  - Category pages
  - Promotional banners
  - Blog / recipe content
  - About Us / FAQ / static page content
- Sanity Studio deployed separately (e.g. `/studio`) for the admin/content team to manage catalog content.
- Frontend fetches content via **GROQ** queries using `@sanity/client`.

> **Important:** Sanity holds *content*, not *transactional* data. Live stock counts, prices used at checkout, cart state, orders, and payments live in MongoDB and are the source of truth. Product price/stock shown in Sanity can be treated as the "display" copy, but checkout should always re-validate against MongoDB before charging.

## Backend

- **Node.js** + **Express**
- **MongoDB** (via Mongoose) for:
  - Users & authentication
  - Cart
  - Orders
  - Inventory/stock levels
  - Payment records
- **JWT-based authentication** (access + refresh tokens), replacing Supabase Auth
  - Password hashing with `bcrypt`
  - Password reset via emailed time-limited tokens
- **Role-based access control** (customer vs admin) via middleware

## Payments

- **Paystack**

Payment workflow:

1. Frontend requests payment initialization from the Node backend.
2. Backend creates a pending order in MongoDB, initializes the transaction with Paystack, returns the authorization URL/reference.
3. Customer completes payment on Paystack.
4. Backend verifies the transaction server-side via Paystack's verify endpoint (webhook + manual verification as fallback).
5. On success: order status updated, stock decremented, receipt generated, confirmation email sent.

Never expose the Paystack secret key on the frontend — all initialization/verification happens server-side.

## Image & File Storage

- Product images, category images, and promotional banners are managed as **Sanity assets** (Sanity's built-in image pipeline with CDN + on-the-fly transforms/optimization).
- User-uploaded content (e.g. profile pictures, if added later) can use a separate storage solution (e.g. Cloudinary or S3) — decide only if/when that feature is built.

## Notifications

Support (via Node backend, e.g. Nodemailer + a transactional email provider like Resend/SendGrid):

- Email confirmations
- Order updates
- Payment confirmation

---

# Core Features

## Public Pages

- Home
- Shop
- Product Details
- About Us
- Contact Us
- FAQ
- Privacy Policy
- Terms & Conditions

## Shopping Features

- Product listing (from Sanity, cross-checked with live stock from MongoDB)
- Product categories
- Product search
- Product filtering
- Product details
- Product gallery
- Related products
- Shopping cart
- Checkout
- Order confirmation

## Customer Features

- User Registration
- Login
- Password Reset
- User Dashboard
- Profile Management
- Order History
- Saved Addresses
- Wishlist

## Admin Features

Admin dashboard (custom-built, talking to the Node API) should allow:

- Inventory Management (stock levels in MongoDB)
- Order Management
- Customer Management
- Payment Monitoring
- Sales Analytics

> Product/category *content* (name, description, images) is managed directly in **Sanity Studio**, not a custom admin panel — no need to rebuild a CMS.

---

# Folder Structure

```
client/                  # React 19 + Vite SPA
  src/
    app/                  # routes / router setup
    components/
    features/
    hooks/
    lib/
    services/             # API + Sanity client calls
    store/
    constants/
  public/

server/                  # Node.js + Express API
  src/
    routes/
    controllers/
    models/               # Mongoose schemas
    middleware/
    services/             # Paystack, email, etc.
    utils/
    config/

studio/                  # Sanity Studio (content management)
  schemas/
```

---

# SEO Considerations (Vite SPA trade-off)

Since we're dropping Next.js in favor of a client-rendered Vite SPA, out-of-the-box SEO is weaker (no server-side rendering). Mitigations:

- Use `react-helmet-async` to set per-page `<title>`, meta description, and Open Graph tags client-side.
- Generate a `sitemap.xml` at build time by querying Sanity for all product/category slugs.
- Add `robots.txt`.
- If SEO for product pages becomes critical later, consider pre-rendering key routes (e.g. via `vite-plugin-ssr`/a static prerender step) as a future enhancement — flagged here so the architecture doesn't block it.

---

# Development Philosophy

Build feature by feature.

For every feature:

1. Understand the request.
2. Build the smallest working version.
3. Keep components reusable.
4. Keep code readable.
5. Avoid unnecessary abstractions.
6. Improve only when necessary.

---

# UI Design Philosophy

The website should feel: Modern, Premium, Clean, Fast, Trustworthy, Responsive — reflecting a high-quality Nigerian food brand.

# Color Palette

- Primary: Deep Green (#1B5E20)
- Secondary: Palm Gold (#C89B3C)
- Accent: Fresh Orange (#E67E22)
- Neutral: White, Light Gray, Dark Gray

# Typography

- Inter or Poppins, with clear hierarchy throughout.

---

# Homepage Sections

- Hero Section (slogan, Shop Now button, featured products)
- Why Choose Us
- Featured Products
- Categories
- Customer Testimonials
- Promotional Banner
- Footer (Company Info, Quick Links, Contact, Social, Newsletter)

---

# Product Page

- Product Name, Images, Description, Price
- Available Sizes/Weights
- Stock Status (live from MongoDB)
- Quantity Selector
- Add to Cart / Buy Now
- Related Products

---

# Shopping Cart

- Update quantities
- Remove items
- Apply coupons
- View subtotal
- Proceed to checkout

---

# Checkout

Collect: Customer Info, Delivery Address, Phone Number, Email, Delivery Option, Payment Method.
Support Paystack payment integration.

---

# Contact Page

- Contact Form
- Phone Number / WhatsApp / Email
- Business Address
- Google Maps Integration

---

# Performance Requirements

- Load quickly
- Optimize images (Sanity's image CDN + responsive `srcset`)
- Lazy load where appropriate (routes + images)
- Maintain excellent Core Web Vitals

---

# Responsive Design

Mobile-first. Must work beautifully on Mobile, Tablet, Laptop, Desktop.

---

# Accessibility

- Proper semantic HTML
- Keyboard navigation
- Screen reader support
- Good color contrast
- Accessible forms

---

# Security

Never expose:

- MongoDB connection strings
- Paystack Secret Key
- Sanity write tokens / API secrets
- JWT signing secrets
- Any `.env` variables

Validate all requests server-side (Zod schemas reused on both client and server where practical).

---

# Coding Standards

- Plain JavaScript (ES modules), no TypeScript.
- Use JSDoc comments for function signatures where clarity helps.
- Build reusable components.
- Keep functions small.
- Prefer composition over duplication.

---

# Testing

Before completing any feature:

- Ensure responsiveness.
- Test mobile layout.
- Test checkout flow (including Paystack test mode).
- Test authentication (JWT issuance/refresh/expiry).
- Test cart functionality.

---

# Communication Style

When implementing a feature:

- Explain what changed.
- Mention affected files.
- Explain how to test.
- Keep explanations concise.

---

# Future Enhancements

Architecture should easily support:

- Discount Coupons
- Flash Sales
- Referral System
- Loyalty Rewards
- Bulk Orders
- Wholesale Pricing
- Delivery Tracking
- AI Product Recommendations
- Blog / Recipe Section (already supported via Sanity content types)

---

# Final Reminder

For every implementation:

- Build clean, production-ready code.
- Prioritize responsiveness.
- Keep the UI elegant and modern.
- Focus on maintainability.
- Ensure an excellent shopping experience for Makah Serenity Foods customers.