export interface MarketplaceTrustHistory {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  removedListings: number;
  paidListings: number;
  photoListings: number;
  describedListings: number;
}

export interface MarketplaceTrustScore {
  score: number;
  label: string;
  level: "excellent" | "strong" | "growing" | "new";
  summary: string;
  reasons: string[];
  metrics: MarketplaceTrustHistory & {
    farmTenureDays: number;
    listingPhotoCount: number;
    hasDetailedDescription: boolean;
  };
}

interface TrustFarmInput {
  is_active?: boolean | null;
  onboarded_at?: string | null;
}

interface TrustListingInput {
  photo_url?: string | null;
  description?: string | null;
  listing_fee_paid?: boolean | null;
}

export const emptyTrustHistory: MarketplaceTrustHistory = {
  totalListings: 0,
  activeListings: 0,
  soldListings: 0,
  removedListings: 0,
  paidListings: 0,
  photoListings: 0,
  describedListings: 0,
};

export function parseTrustPhotoCount(raw: string | null | undefined): number {
  if (!raw) return 0;
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter((url) => typeof url === "string" && url.length > 0).length;
    } catch {}
  }
  return 1;
}

export function stripMarketplaceContactTag(description: string | null | undefined): string {
  return (description ?? "").replace(/^\[wa:\S+\]\s*/, "").trim();
}

export function createTrustHistory(rows: Array<TrustListingInput & { status?: string | null }>): MarketplaceTrustHistory {
  return rows.reduce<MarketplaceTrustHistory>((history, row) => {
    const photoCount = parseTrustPhotoCount(row.photo_url);
    const description = stripMarketplaceContactTag(row.description);

    history.totalListings += 1;
    if (row.status === "active") history.activeListings += 1;
    if (row.status === "sold") history.soldListings += 1;
    if (row.status === "removed") history.removedListings += 1;
    if (row.listing_fee_paid) history.paidListings += 1;
    if (photoCount > 0) history.photoListings += 1;
    if (description.length >= 40) history.describedListings += 1;

    return history;
  }, { ...emptyTrustHistory });
}

export function calculateMarketplaceTrustScore({
  farm,
  listing,
  history = emptyTrustHistory,
}: {
  farm?: TrustFarmInput | null;
  listing?: TrustListingInput | null;
  history?: MarketplaceTrustHistory;
}): MarketplaceTrustScore {
  const onboardedAt = farm?.onboarded_at ? new Date(farm.onboarded_at).getTime() : 0;
  const farmTenureDays = onboardedAt > 0
    ? Math.max(0, Math.floor((Date.now() - onboardedAt) / 86400000))
    : 0;
  const listingPhotoCount = parseTrustPhotoCount(listing?.photo_url);
  const cleanDescription = stripMarketplaceContactTag(listing?.description);
  const hasDetailedDescription = cleanDescription.length >= 80;

  let score = 38;
  const reasons: string[] = [];

  if (farm?.is_active !== false) {
    score += 15;
    reasons.push("Active farm account");
  } else {
    score -= 25;
    reasons.push("Farm is not currently active");
  }

  if (farmTenureDays >= 180) {
    score += 10;
    reasons.push("Long-running seller on Saarway");
  } else if (farmTenureDays >= 60) {
    score += 7;
    reasons.push("Established seller history");
  } else if (farmTenureDays >= 14) {
    score += 4;
    reasons.push("Recently onboarded farm");
  }

  if (history.totalListings >= 8) {
    score += 10;
    reasons.push(`${history.totalListings} marketplace listings managed`);
  } else if (history.totalListings >= 3) {
    score += 6;
    reasons.push(`${history.totalListings} marketplace listings managed`);
  } else if (history.totalListings >= 1) {
    score += 3;
    reasons.push("Seller has live marketplace activity");
  }

  if (history.soldListings >= 5) {
    score += 12;
    reasons.push(`${history.soldListings} completed sales recorded`);
  } else if (history.soldListings >= 2) {
    score += 8;
    reasons.push(`${history.soldListings} completed sales recorded`);
  } else if (history.soldListings >= 1) {
    score += 5;
    reasons.push("Completed sale recorded");
  }

  if (listingPhotoCount >= 3) {
    score += 6;
    reasons.push("Photo-rich listing");
  } else if (listingPhotoCount >= 1) {
    score += 4;
    reasons.push("Listing includes animal photos");
  }

  if (hasDetailedDescription) {
    score += 5;
    reasons.push("Detailed listing notes provided");
  } else if (cleanDescription.length >= 40) {
    score += 3;
    reasons.push("Listing notes provided");
  }

  if (history.photoListings >= Math.max(2, Math.ceil(history.totalListings * 0.6))) {
    score += 4;
    reasons.push("Consistent photo documentation");
  }

  if (history.describedListings >= Math.max(2, Math.ceil(history.totalListings * 0.5))) {
    score += 3;
    reasons.push("Consistent listing descriptions");
  }

  if (listing?.listing_fee_paid || history.paidListings > 0) {
    score += 3;
    reasons.push("Platform listing compliance recorded");
  }

  score = Math.max(20, Math.min(98, Math.round(score)));

  const level = score >= 85 ? "excellent" : score >= 70 ? "strong" : score >= 55 ? "growing" : "new";
  const label = level === "excellent"
    ? "Verified Pro"
    : level === "strong"
      ? "Trusted Seller"
      : level === "growing"
        ? "Growing Trust"
        : "New Seller";
  const summary = level === "excellent"
    ? "High-confidence seller with strong marketplace history."
    : level === "strong"
      ? "Reliable seller with healthy marketplace signals."
      : level === "growing"
        ? "Promising seller with some trust signals."
        : "New or limited marketplace history.";

  return {
    score,
    label,
    level,
    summary,
    reasons: reasons.slice(0, 5),
    metrics: {
      ...history,
      farmTenureDays,
      listingPhotoCount,
      hasDetailedDescription,
    },
  };
}
