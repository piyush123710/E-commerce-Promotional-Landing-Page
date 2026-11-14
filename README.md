# Krona Studio — E-Commerce Promotional Landing Page

A promotional e-commerce landing page platform built to showcase seasonal product offers, discount campaigns, curated bundles, and reusable Adobe Experience Manager (AEM)-style content components with live layout consistency auditing.

## Features

- **Multi-Campaign Promotional Landing Pages**: Switch between three authored seasonal campaigns (`Winter Solstice Sale`, `Acoustic Studio Drop`, and `Archive Objects Edit`), each with dedicated hero messaging, promotional banners, offer tiers, and bundle pricing.
- **Reusable AEM Component Architecture**:
  - `krona/components/promo/hero-banner` (`HeroBannerComponent`): Configurable split-left/split-right layout, campaign eyebrow, headline, CTA actions, and one-click promo code copy.
  - `krona/components/promo/offer-strip` (`OfferStripComponent`): Structured 3-column offer tier matrix with promo codes and instant category filtering.
  - `krona/components/commerce/product-grid` (`ProductGridComponent`): Filterable (`All`, `Lighting`, `Audio`, `Objects`), searchable, and sortable 2- or 3-column grid with uniform `4:3` imagery and aligned price baselines.
  - `krona/components/promo/editorial-bundle` (`EditorialBundleComponent`): Curated bundle spotlight with list-to-bundle savings breakdown and single-click bundle add-to-bag.
- **Interactive Shopping Bag & Checkout**:
  - Product quick-view modal with material finish variant selection, dimensions, and specifications.
  - Slide-over shopping bag drawer with a `$250` free-shipping progress meter, quantity steppers, promo code validation (`SOLSTICE20`, `ACOUSTIC15`, `ARCHIVE30`), and verified checkout confirmation (Card Payment or Cash on Delivery).
- **AEM Page Studio & CSS3 Layout Consistency Audit**:
  - Reorder components, toggle visibility, and live-edit component dialog properties (headlines, promo codes, split alignment, and grid column counts).
  - Test responsive layouts across `Desktop`, `Tablet (768px)`, and `Mobile (375px)` viewports.
  - Run live DOM consistency checks for horizontal overflow, HTML5 semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`), `4:3` product image aspect-ratio parity, price baseline alignment, and media `alt` attributes.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling & Layout**: Tailwind CSS v4 (CSS3 Grid, Flexbox, responsive breakpoints, `tabular-nums`, `prefers-reduced-motion`)
- **Icons**: Lucide React
- **Content Model**: Typed AEM-inspired component node schema (`src/types/aem.ts`, `src/data/campaigns.ts`)

## Project Structure

```text
├── index.html                              # HTML5 entry point & Google Fonts
├── src/
│   ├── App.tsx                             # Main storefront shell, campaign routing & state
│   ├── index.css                           # Tailwind CSS v4 tokens & accessibility rules
│   ├── types/aem.ts                        # Reusable AEM component & commerce types
│   ├── data/campaigns.ts                   # Authored campaign pages, products & promo codes
│   └── components/
│       ├── ResilientImage.tsx              # Image renderer with fallback container
│       ├── ProductModal.tsx                # Quick-view & finish variant selector modal
│       ├── CartDrawer.tsx                  # Slide-over bag, promo redemption & checkout
│       ├── AemStudioDrawer.tsx             # Component authoring & CSS3 layout audit studio
│       └── aem/
│           ├── HeroBannerComponent.tsx     # Reusable hero promotional banner
│           ├── OfferStripComponent.tsx     # Reusable seasonal offer matrix
│           ├── ProductGridComponent.tsx    # Reusable filterable product showcase
│           └── EditorialBundleComponent.tsx# Reusable bundle offer spotlight
```

## Available Promotional Codes

| Code | Discount | Condition |
| :--- | :--- | :--- |
| `SOLSTICE20` | 20% off | Winter Solstice seasonal orders |
| `ACOUSTIC15` | 15% off | Orders over `$200` |
| `ARCHIVE30` | 30% off | Orders over `$150` |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Type-check with TypeScript
npm run lint

# Build for production
npm run build
```
