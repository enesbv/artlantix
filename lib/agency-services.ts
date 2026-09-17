export const AGENCY_SERVICES = [
  { id: 'brand-identity', key: 'brand', price: 50, minBusinessDays: 3, maxBusinessDays: 5 },
  { id: 'alternative-logo', key: 'logo', price: 50, minBusinessDays: 3, maxBusinessDays: 5 },
  { id: 'social-media-kit', key: 'social', price: 50, minBusinessDays: 3, maxBusinessDays: 5 },
] as const;
export type AgencyService = typeof AGENCY_SERVICES[number]['id'];

export function getAgencyServices(ids: readonly AgencyService[]) {
  return AGENCY_SERVICES.filter((service) => ids.includes(service.id));
}

export function getAgencyServicesTotal(ids: readonly AgencyService[]) {
  return getAgencyServices(ids).reduce((sum, service) => sum + service.price, 0);
}
