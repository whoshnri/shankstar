# Implementation Plan: E-Commerce Functionality

## Overview

Implement the six interconnected feature areas in dependency order: Prisma v7 upgrade → Server Actions data layer → Customer schema + Order model migration → Checkout integration → Search overlay + URL routing → Cart sheet responsive fix → Wishlist.

## Tasks

- [x] 1. Prisma v7 upgrade
  - [x] 1.1 Update `schema.prisma` generator block
    - Change `provider` from `"prisma-client"` to `"prisma-client-js"`
    - Change `output` from `"../app/generated/prisma"` to `"../prisma/generated/prisma"`
    - _Requirements: 1.1_

  - [x] 1.2 Update `lib/prisma.ts` singleton
    - Change import path from `"../app/generated/prisma/client"` to `"../prisma/generated/prisma"`
    - Remove `PrismaPg` adapter (not needed with standard prisma-client-js)
    - Use `globalThis` cast and conditional `globalForPrisma.prisma` assignment
    - Export both named `prisma` and default export
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [ ]* 1.3 Write property test for Prisma singleton (Property 6)
    - **Property 6: Prisma singleton**
    - **Validates: Requirements 1.3**
    - Use fast-check to verify that multiple imports of `lib/prisma.ts` within one process return the same instance reference

- [x] 2. Customer schema and Order model update
  - [x] 2.1 Add `Customer` model and `OrderStatus` enum to `schema.prisma`
    - Add `OrderStatus` enum with values `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`
    - Add `Customer` model with all required fields (`id`, `firstName`, `lastName`, `email` unique, `phone` unique, `address`, `city`, `state`, `zip`, `createdAt`, `updatedAt`, `orders` relation)
    - _Requirements: 7.1, 7.2_

  - [x] 2.2 Update `Order` model in `schema.prisma`
    - Replace `userId`/`User` relation with `customerId`/`Customer` relation
    - Change `status` field type from `String` to `OrderStatus` enum with default `PENDING`
    - Add `shippingCost Float @default(0)` field
    - Remove `User` model's `orders` relation (or keep `User` model intact and only remove the `Order` side)
    - _Requirements: 7.3, 7.4, 7.5_

  - [x] 2.3 Run Prisma migration
    - Run `npx prisma migrate dev --name add-customer-order-status` to apply schema changes
    - Run `npx prisma generate` to regenerate the client to `prisma/generated/prisma`
    - Update any imports in the codebase that still reference `app/generated/prisma`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 3. Server Actions — Products
  - [x] 3.1 Create `lib/actions/products.ts`
    - Add `"use server"` directive at top of file
    - Implement `getProducts(opts?)` — filter by `categorySlug` when provided, always filter `isVisible: true`, include `brand`, `category`, first visible variant
    - Implement `getProductBySlug(slug)` — return product with all variants and images or `null`
    - Implement `getFeaturedProducts(limit?)` — return visible products ordered by `createdAt desc`
    - Implement `getRecommendations(productId, limit?)` — return visible products in same category excluding `productId`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 3.2 Write unit tests for `getProducts` and `getProductBySlug`
    - Test `categorySlug` filter, `isVisible` filter, null return for unknown slug
    - _Requirements: 2.2, 2.3, 2.6_

- [x] 4. Server Actions — Search
  - [x] 4.1 Create `lib/actions/search.ts`
    - Add `"use server"` directive
    - Implement `searchProducts(query)` — return early with empty arrays when `query.trim().length < 2`
    - Use Prisma `contains` with `mode: 'insensitive'` (maps to ILIKE) on `name`, `brand.name`, `category.name`
    - Filter `isVisible: true` on all queries
    - Build `recommendations` from same category IDs, excluding result IDs, `take: 8`
    - When results are empty, draw recommendations from all visible products
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 4.2 Write property test for search exclusivity (Property 3)
    - **Property 3: Search exclusivity**
    - **Validates: Requirements 3.5**
    - Use fast-check to generate arbitrary query strings and assert `results ∩ recommendations = ∅`

- [x] 5. Server Actions — Customers
  - [x] 5.1 Create `lib/actions/customers.ts`
    - Add `"use server"` directive
    - Define `CustomerInput` Zod schema (firstName, lastName, email, phone, address?, city?, state?, zip?)
    - Implement `upsertCustomer(data)` — normalize email to lowercase+trim, phone to digits-only
    - Use `prisma.customer.findFirst({ where: { OR: [{ email }, { phone }] } })` to detect existing record
    - Update existing record or create new one; return `Customer`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]* 5.2 Write property test for customer uniqueness (Property 1)
    - **Property 1: Customer uniqueness**
    - **Validates: Requirements 4.3, 4.4, 4.7**
    - Use fast-check to generate email/phone pairs and assert two calls with the same normalized email return the same `id`

- [x] 6. Server Actions — Orders
  - [x] 6.1 Create `lib/actions/orders.ts`
    - Add `"use server"` directive
    - Define `CreateOrderInput` Zod schema (customerId, items: `{ variantId, quantity, price }[]`, couponCode?)
    - Define `InsufficientStockError` class extending `Error`
    - Implement `createOrder(data)` inside a `prisma.$transaction` block:
      - Check each variant's stock before any write; throw `InsufficientStockError` on failure
      - Look up and validate coupon (active, not expired, within usage limit)
      - Calculate subtotal, tax, shipping (free above threshold), discount, total
      - Create `Order` + `OrderItem` records; decrement stock; increment coupon `usedCount`
      - Generate `orderNumber` (e.g., `ORD-` + nanoid or timestamp)
    - Implement `getOrderByNumber(orderNumber)` — return order with items and customer or `null`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ]* 6.2 Write property test for order atomicity (Property 2)
    - **Property 2: Order atomicity**
    - **Validates: Requirements 5.2, 5.3**
    - Use fast-check to generate inputs where at least one variant has insufficient stock and assert no DB rows are created

- [ ] 7. Checkpoint — data layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Server Actions — Admin
  - [x] 8.1 Create `lib/actions/admin.ts` — products section
    - Add `"use server"` directive
    - Implement `adminGetProducts()` — return all products with brand, category, variant count
    - Implement `adminCreateProduct(data)` — validate with Zod `ProductInput` schema, create product
    - Implement `adminUpdateProduct(id, data)` — validate with Zod, update product
    - Implement `adminDeleteProduct(id)` — delete product by id
    - Implement `adminToggleProductVisibility(id)` — flip `isVisible` and return updated product
    - _Requirements: 6.1, 6.5, 6.6_

  - [x] 8.2 Add orders, brands, and categories to `lib/actions/admin.ts`
    - Implement `adminGetOrders(status?)` — return orders with customer and item count, optional status filter
    - Implement `adminUpdateOrderStatus(id, status)` — validate `status` is a valid `OrderStatus`, update and return order
    - Implement `adminGetBrands()`, `adminCreateBrand(data)`, `adminUpdateBrand(id, data)`, `adminDeleteBrand(id)`
    - Implement `adminGetCategories()`, `adminCreateCategory(data)`, `adminUpdateCategory(id, data)`, `adminDeleteCategory(id)`
    - All mutating actions validate input with Zod before any DB operation
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.7_

- [x] 9. Wire Server Actions into existing pages
  - [x] 9.1 Update `app/page.tsx` (home) to use real data
    - Convert to async RSC
    - Replace `MOCK_PRODUCTS` with `await getFeaturedProducts(8)`
    - Replace `MOCK_CATEGORIES` with `await getCategories()` (add `getCategories` to products actions)
    - _Requirements: 2.4_

  - [x] 9.2 Update `app/products/[slug]/page.tsx` to use real data
    - Convert to async RSC; move client interactivity to a child `ProductDetail` client component
    - Replace `MOCK_PRODUCT` with `await getProductBySlug(params.slug)`; return 404 if null
    - Replace `MOCK_RECOMMENDATIONS` with `await getRecommendations(product.id, 4)`
    - Replace `MOCK_CATEGORIES` with `await getCategories()`
    - _Requirements: 2.3, 2.5_

  - [x] 9.3 Update admin pages to use real data
    - Update `app/admin/products/page.tsx` to call `adminGetProducts`, `adminCreateProduct`, `adminUpdateProduct`, `adminDeleteProduct`, `adminToggleProductVisibility`
    - Update `app/admin/orders/page.tsx` to call `adminGetOrders`, `adminUpdateOrderStatus`
    - Update `app/admin/brands/page.tsx` to call `adminGetBrands`, `adminCreateBrand`, `adminUpdateBrand`, `adminDeleteBrand`
    - Update `app/admin/categories/page.tsx` to call `adminGetCategories`, `adminCreateCategory`, `adminUpdateCategory`, `adminDeleteCategory`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 10. Checkout integration
  - [x] 10.1 Update `app/checkout/page.tsx` to call `upsertCustomer` on step 1 submit
    - Store returned `customerId` in component state after step 1 succeeds
    - Advance to step 2 only after `upsertCustomer` resolves successfully
    - Wrap call in `useTransition`; show pending state on the Continue button
    - _Requirements: 8.1, 8.2, 8.6_

  - [x] 10.2 Wire `createOrder` into step 3 (Place Order)
    - Call `createOrder({ customerId, items: cartItems, couponCode })` on Place Order submit
    - On success: call `clearCart()`, redirect to `/orders/confirmation?order={orderNumber}`
    - On `InsufficientStockError`: show toast "Item no longer available in requested quantity"; do not clear cart
    - _Requirements: 8.3, 8.4, 8.5_

  - [x] 10.3 Update `app/orders/confirmation/page.tsx` to read real order
    - Accept `searchParams.order` (orderNumber) as a prop
    - Call `getOrderByNumber(orderNumber)` and display real order details
    - _Requirements: 8.4_

- [x] 11. Search overlay and URL routing
  - [x] 11.1 Update `SearchOverlay` to push `/search/[query]`
    - Change `router.push` target from `/products?search=...` to `/search/${encodeURIComponent(searchQuery)}`
    - _Requirements: 9.1_

  - [x] 11.2 Create `app/search/[query]/page.tsx` RSC
    - Async RSC that receives `params: { query: string }`
    - Call `searchProducts(decodeURIComponent(params.query))`
    - Render results grid (reuse product card markup from home page) with heading "Results for "[query]""
    - Render "No products found for [query]" message when `results` is empty
    - Render `<ProductRecommendation products={recommendations} />` below results in all cases
    - Include `<Header>` and `<Footer>`; fetch categories for header
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 12. Responsive CartSheet fix
  - [x] 12.1 Refactor `components/cart-sheet.tsx` to use `Drawer` on mobile and `Sheet` on desktop
    - Import `useIsMobile` from `@/hooks/use-mobile`
    - Import `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerTitle` from `@/components/ui/drawer`
    - Keep existing `Sheet` imports
    - Extract shared cart body JSX into a local `CartBody` component to avoid duplication
    - When `isMobile === true`: render `<Drawer open={isOpen} onOpenChange={onClose}>` with `<DrawerContent>`
    - When `isMobile === false`: render `<Sheet open={isOpen} onOpenChange={onClose}>` with `<SheetContent side="right" className="w-[500px]">`
    - Remove the current `side="bottom"` hack
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 12.2 Write property test for CartSheet breakpoint (Property 4)
    - **Property 4: Cart sheet breakpoint**
    - **Validates: Requirements 10.1, 10.2**
    - Use fast-check to generate viewport widths and assert correct component renders below/above 640px

- [x] 13. Wishlist
  - [x] 13.1 Create `lib/wishlist-context.tsx`
    - Define `WishlistItem` interface (`variantId`, `productId`, `name`, `image`, `price`, `slug`)
    - Implement `readCookie()` — parse `wishlist` cookie; return `[]` on missing or malformed JSON
    - Implement `writeCookie(items)` — encode and write with `path=/; max-age=2592000; SameSite=Lax`
    - Implement `WishlistProvider` with `useState` initialized from `readCookie()`
    - Implement `addItem`, `removeItem`, `toggleItem`, `isInWishlist`, `clearWishlist` — each writes updated state to cookie
    - Export `useWishlist` hook
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.7_

  - [ ]* 13.2 Write property test for wishlist cookie round-trip (Property 5)
    - **Property 5: Wishlist cookie round-trip**
    - **Validates: Requirements 11.6**
    - Use fast-check to generate arbitrary `WishlistItem[]` arrays and assert `readCookie(writeCookie(items))` deep-equals `items`

  - [x] 13.3 Create `components/wishlist-sheet.tsx`
    - Accept `isOpen` and `onClose` props
    - Render a `Sheet` with a checklist of wishlist items; each item has a checkbox, image, name, and price
    - Track checked item IDs in local state
    - "Remove selected" button: call `removeItem` for each checked ID
    - "Add selected to cart" button: call `addItem` (cart context) for each checked item then `removeItem` for each
    - _Requirements: 11.8, 11.9, 11.10_

  - [x] 13.4 Wire wishlist into layout and product pages
    - Wrap `app/layout.tsx` body with `<WishlistProvider>` (inside existing providers)
    - Add a wishlist icon button to `components/header.tsx` that opens `WishlistSheet`
    - Add a "Save to Wishlist" / heart toggle button to the product detail client component (created in task 9.2) that calls `toggleItem`
    - _Requirements: 11.1, 11.4_

- [x] 14. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check; install with `pnpm add -D fast-check` if not already present
- The migration in task 2.3 must run before any Server Action that references `Customer` or `OrderStatus`
- Tasks 12 and 13 are UI-only and can be worked in parallel with tasks 9–11 once the data layer (tasks 1–8) is complete
