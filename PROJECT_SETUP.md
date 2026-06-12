# Luxury Ecommerce Storefront

A premium, minimal luxury ecommerce platform built with Next.js 16, inspired by luxury brands like Mode Men Magazine.

## Key Features

### Customer Features
- **Product Listing & Directory** - Browse all products with grid layouts
- **Product Details Page** - Full product information with variant selection and image galleries
- **Shopping Cart** - Persistent cart with localStorage (can be upgraded to database)
- **Checkout Flow** - Multi-step form for shipping, payment, and coupon application
- **Order Confirmation** - Success page with order details
- **Order Tracking** - Customer dashboard to track order status

### Admin Features
- **Product Management** - Create, edit, delete products with visibility toggle
- **Variant Management** - Support for product variants (size, color, etc.)
- **Category Management** - Organize products into categories
- **Brand Management** - Manage brand information
- **Order Management** - View and update order status with filtering
- **Bulk Actions** - Delete multiple products at once

### Design Principles
- White background with dark typography
- Zero box shadows, subtle borders only
- Smooth animations and transitions on hover
- Light, elegant typography with clear visual hierarchy
- Minimal, luxury aesthetic throughout

## Architecture

### File Structure
```
/app
  /admin                 - Admin dashboard routes
    /brands              - Brand management
    /categories          - Category management
    /orders              - Order management
    /products            - Product management
    layout.tsx           - Admin layout with sidebar
    page.tsx             - Admin dashboard
  /checkout              - Checkout flow
  /orders
    /confirmation        - Order confirmation page
    /tracking            - Order tracking dashboard
  /products
    /[slug]              - Product detail page
    page.tsx             - Products listing
  layout.tsx             - Root layout with providers
  page.tsx               - Homepage

/components
  /admin                 - Admin-specific components
    brand-form-sheet.tsx
    category-form-sheet.tsx
    delete-confirm-dialog.tsx
    order-status-sheet.tsx
    product-form-sheet.tsx
  /ui                    - shadcn/ui components
  cart-sheet.tsx         - Shopping cart sheet
  form-field.tsx         - Reusable form input
  form-select.tsx        - Reusable select input
  footer.tsx             - Footer component
  header.tsx             - Header with nav
  product-recommendation.tsx - Product recommendation component
  toast-display.tsx      - Toast notifications display
  variant-selector.tsx   - Product variant selector

/lib
  cart-context.tsx       - Cart state management with localStorage
  toast-context.tsx      - Toast notifications context
  utils.ts               - Utility functions

/prisma
  schema.prisma          - Database schema with all models

/styles
  globals.css            - Global styles and animations
```

## Database Schema

### Models
- **User** - Customer authentication and profile
- **Product** - Product information (name, description, price)
- **ProductVariant** - Product variants (size, color, etc.) with separate pricing and stock
- **Category** - Product categories
- **Brand** - Product brands with description
- **Coupon** - Discount codes with percentage/fixed amounts
- **Order** - Customer orders with total and discount tracking
- **OrderItem** - Line items in orders with variant references

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS with custom design tokens
- **Form Handling**: React Hook Form + Zod validation
- **Database ORM**: Prisma (configure with your database)
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Context (Cart & Toast)
- **Animations**: CSS animations with Tailwind

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Setup Database
```bash
# Create .env.local
DATABASE_URL="your-database-url"

# Run migrations
npx prisma migrate dev
```

### 3. Run Development Server
```bash
npm run dev
# or
pnpm dev
```

Visit `http://localhost:3000`

## Key Components & Hooks

### Contexts
- **CartContext** - Manages shopping cart with localStorage persistence
- **ToastContext** - Manages toast notifications

### Custom Hooks
- `useCart()` - Access cart state and functions
- `useToast()` - Show toast notifications

### Reusable Components
- `FormField` - Input component with validation error display
- `FormSelect` - Select component with options
- `ProductRecommendation` - Product grid component
- `VariantSelector` - Product variant selection buttons

## Forms & Validation

All forms use Zod for validation with React Hook Form:
- Product creation/editing
- Category management
- Brand management
- Checkout (3-step form)
- Order status updates

## Styling Guide

### Color System
- **Background**: White (`--background`)
- **Foreground**: Dark gray/black (`--foreground`)
- **Primary**: Dark accent (`--primary`)
- **Secondary**: Light gray (`--secondary`)
- **Muted**: Medium gray (`--muted-foreground`)
- **Border**: Light gray border (`--border`)

### Custom Classes
- `.hover-lift` - Subtle translateY on hover with smooth transition
- `.transition-smooth` - Consistent transition timing
- `.card-minimal` - Card with subtle border
- `.animate-fade-in` - Fade-in animation
- `.animate-slide-in-up` - Slide up animation

## Features To Implement

### Database Integration
Replace mock data with actual Prisma queries:
- Product fetching from database
- Order creation and updates
- Inventory management

### Authentication
Implement user authentication:
- Login/signup pages
- Protected routes for checkout
- User account management

### Payment Processing
Integrate Stripe or similar:
- Replace mock payment flow
- Actual transaction processing
- Payment method storage

### Email Notifications
Add email service:
- Order confirmation emails
- Shipping updates
- Customer notifications

## Performance Notes

- Images use Next.js Image component with optimization
- Cart state in localStorage for instant performance (upgrade to IndexedDB for larger carts)
- CSS animations use GPU-accelerated properties
- Minimal dependencies for faster load times

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Touch-friendly interface

## Contributing

When adding features:
1. Keep components small and modular
2. Use the design token system for colors
3. Add validation with Zod + React Hook Form
4. Use custom hooks for shared logic
5. Maintain the minimal, elegant aesthetic
