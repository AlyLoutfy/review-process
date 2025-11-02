# Real Estate Review Process

A Next.js application for reviewing payment plans and unit designs for real estate releases.

## Features

- **Review Page**: Clean, organized interface for reviewing releases
- **Payment Plans**: View payment plans with down payment information and PDF previews
- **Unit Designs**: Browse unit designs with details (beds, BUA) and media galleries
- **Media Gallery**: Modal with three sections:
  - Offer Gallery
  - Unit Gallery
  - Floor Plans
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Modern UI/UX**: Clean, professional interface optimized for the review process

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

### Accessing Review Pages

Review pages are accessed via ID-based routes:

- `/review/june-latest` - Latest release in June compound
- `/review/june-phase-2` - Phase 2 release in June compound

### Structure

- **Payment Plans**: Display name, down payment, and PDF preview button
- **Unit Designs**: Display name, bedrooms, BUA (Built-Up Area), with:
  - "View Media" button to open media modal
  - "Preview" button to download PDF

### Media Modal

The media modal allows viewing:
- Offer Gallery images
- Unit Gallery images
- Floor Plans images

Click any image to view full-size. Press ESC to close or go back.

## Project Structure

```
├── app/
│   ├── review/
│   │   └── [releaseId]/
│   │       └── page.tsx          # Dynamic review page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── page.tsx                  # Home page
├── components/
│   ├── PaymentPlanCard.tsx       # Payment plan display
│   ├── UnitDesignCard.tsx        # Unit design display
│   └── MediaModal.tsx            # Media gallery modal
├── lib/
│   └── mockData.ts               # Mock data for releases
└── public/
    └── pdfs/                     # PDF files for previews
```

## Customization

### Adding New Releases

Edit `lib/mockData.ts` to add new releases with payment plans and unit designs.

### Replacing PDFs

Replace placeholder PDFs in `public/pdfs/` with actual payment plan and unit design PDFs.

### Image Sources

Currently using Unsplash placeholder images. Update `lib/mockData.ts` to use your actual image URLs or local images in `public/images/`.

## Technologies

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

## Deploy

The easiest way to deploy is using [Vercel](https://vercel.com):

```bash
npm run build
```

Then deploy to your preferred hosting platform.
