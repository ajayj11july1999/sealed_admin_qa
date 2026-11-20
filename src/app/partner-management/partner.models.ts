/**
 * Shapes returned by sealed_partner_api's admin endpoints (/api/admin/v1).
 * Success bodies are bare JSON; errors are { code, status: false, message, data: { errorCode } }.
 */

export type PartnerEnv = 'test' | 'live';
export type PartnerStatus = 'active' | 'suspended' | 'revoked';

export interface Partner {
  keyId: string;
  name: string;
  env: PartnerEnv;
  status: PartnerStatus;
  coreActorId: string;
  ipAllowlist: string[];
  defaultWebhookUrl: string | null;
  secretRotatesAt: string | null;
  webhookSecretRotatesAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePartnerPayload {
  name: string;
  env: PartnerEnv;
  coreActorId: string;
  ipAllowlist?: string[];
  defaultWebhookUrl?: string;
}

/** Returned once, at creation. Never stored or logged by the panel. */
export interface IssuedCredentials {
  keyId: string;
  secret: string;
  webhookSecret: string;
}

/** Rupees. fare = basePrice + max(0, max(km, baseKm) - baseKm) * perKm */
export interface Rate {
  basePrice: number;
  baseKm: number;
  perKm: number;
}

export interface PartnerCostRow {
  vehicleId: string;
  name: string;
  imageUrl: string | null;
  status: 'active' | 'inactive';
  standard: Rate;
  partner: (Rate & { updatedBy: string | null; updatedAt: string | null }) | null;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface CostPreview {
  totalKm: number;
  legsKm: number[];
  vehicles: {
    vehicleId: string;
    name: string;
    totalCost: number;
    standardCost: number;
    rateSource: 'partner' | 'standard';
    billedKm: number;
    rate: Rate;
  }[];
}

export interface PartnerUser {
  id: string;
  email: string;
  name: string | null;
  status: 'active' | 'disabled';
  lastLoginAt: string | null;
  createdBy: string | null;
  createdAt: string;
}

/** A verified S2B customer from sealed_new_b (main/users/b2bCust/list). */
export interface B2bCustomer {
  _id: string;
  name: string;
  mobileNo?: string;
}

/** The B2C/B2B fare formula, as sealed_new_b computes it. Rupees, 2 decimals. */
export function fare(km: number, rate: Rate): number {
  const billedKm = km < rate.baseKm ? rate.baseKm : km;
  return Number((rate.basePrice + Math.max(0, billedKm - rate.baseKm) * rate.perKm).toFixed(2));
}

export function rateLabel(rate: Rate): string {
  return `₹${rate.basePrice} for ${rate.baseKm} km + ₹${rate.perKm}/km`;
}
