# Sodic Releases Dashboard

A Next.js application for reviewing payment plans and unit designs for real estate releases.

## Features

- **Release Management**: Create and edit releases with payment plans and unit designs
- **Review Page**: Clean, organized interface for reviewing releases
- **Payment Plans**: View payment plans with down payment information, maintenance/club fees, and PDF previews
- **Unit Designs**: Browse unit designs with details (beds, BUA, amenities) and media galleries
- **Media Gallery**: Full-screen modal with three sections:
  - Floor Plans
  - Offer Gallery
  - Unit Gallery
- **Issue Tracking**: Flag issues on items and track resolution
- **Review Status**: Mark items as reviewed with visual indicators
- **Filtering**: Filter by All, Reviewed, Pending, or Flagged items
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

### Creating Releases

Navigate to `/releases/new` to create a new release. Select:
- Release name
- Compound name (June, Ogami, The Estates)
- Release date
- Payment plans (from master list)
- Unit designs (from master list)

### Accessing Review Pages

Review pages are accessed via ID-based routes:

- `/review/[releaseId]` - Review a specific release

### Review Interface

- **Payment Plans**: View details, maintenance/club fees status, and preview payment plans
- **Unit Designs**: View details, amenities, assigned units, and preview media/offers
- **Review Actions**: 
  - Approve items (mark as reviewed)
  - Flag issues with text and optional file upload
  - Delete flagged issues
  - Confirm issue resolution before approving

## Project Structure

```
├── app/
│   ├── page.tsx                      # Home page (All Releases)
│   ├── releases/
│   │   └── new/
│   │       ├── page.tsx              # Create release page
│   │       └── [releaseId]/
│   │           └── page.tsx          # Edit release page
│   ├── review/
│   │   └── [releaseId]/
│   │       └── page.tsx              # Review page
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
├── components/
│   ├── PaymentPlanCard.tsx           # Payment plan display
│   ├── UnitDesignViews/
│   │   └── UnitDesignListView.tsx    # Unit design list view
│   ├── MediaModal.tsx                # Full-screen media gallery
│   ├── MediaPreview.tsx              # Media preview component
│   ├── IssueModal.tsx                # Issue reporting modal
│   ├── ConfirmResolveIssueModal.tsx  # Issue resolution confirmation
│   ├── ConfirmDeleteIssueModal.tsx  # Issue deletion confirmation
│   ├── UnitSelectionModal.tsx       # Unit selection for payment plan preview
│   └── UnitIDsModal.tsx              # View assigned unit IDs
├── lib/
│   ├── mockData.ts                   # Mock data and localStorage management
│   ├── useReviewedState.ts           # Review state management hook
│   └── useIssueState.ts              # Issue state management hook
└── public/
    └── pdfs/                          # PDF files for previews
```

## Deployment

### GitHub Pages

This app is configured for static export and can be deployed to GitHub Pages.

1. **Enable GitHub Pages**:
   - Go to your repository Settings > Pages
   - Under "Source", select "GitHub Actions"

2. **Deploy**:
   - Push to `main` or `master` branch
   - The GitHub Action will automatically build and deploy

3. **Custom Domain** (optional):
   - If deploying to a subdirectory, update `basePath` in `next.config.ts`
   - Set `basePath: "/your-repo-name"` and uncomment `trailingSlash: true`

### Build for Production

```bash
npm run build
```

This generates static files in the `out/` directory, which can be deployed to any static hosting service.

## Technologies

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

## Data Storage

Currently uses `localStorage` for client-side data persistence. This means:
- Data is stored in the browser
- Data is specific to each device/browser
- For production use, consider integrating with a backend API

## License

Private project for Sodic.
