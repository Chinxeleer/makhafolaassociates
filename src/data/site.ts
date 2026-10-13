// Single source of truth for firm details. Components read from here; never retype these elsewhere.

export const site = {
  name: "Makhafola & Associates Inc.",
  shortName: "Makhafola & Associates",
  tagline: "Trusted legal solutions for individuals and businesses, delivered with integrity and excellence.",
  // TODO: confirm domain. The firm profile shows both makhafola-associates.co.za and makhafolaassociates.co.za.
  url: "https://www.makhafola-associates.co.za",
  director: "Matsobane Meshack Makhafola",
  phone: {
    display: "083 200 2036",
    href: "tel:+27832002036",
    international: "+27 83 200 2036",
  },
  email: "meshack@makhafola-associates.co.za",
  whatsapp: {
    href: "https://wa.me/27832002036",
    label: "Message us on WhatsApp",
  },
  address: {
    lines: ["Office 116, Tudor Chambers", "231 Helen Joseph Street", "Pretoria, 0002"],
    street: "Office 116, Tudor Chambers, 231 Helen Joseph Street",
    locality: "Pretoria",
    region: "Gauteng",
    postalCode: "0002",
    country: "ZA",
  },
  // Approximate position of Tudor Chambers, Helen Joseph Street, Pretoria CBD. TODO: confirm pin on the map.
  geo: { lat: -25.7466, lon: 28.1925 },
  // TODO: confirm office hours.
  hours: null as string | null,
  // TODO: client portal URL.
  portalUrl: null as string | null,
  // TODO: PAIA manual URL.
  paiaUrl: null as string | null,
  areaServed: "Pretoria, Gauteng, South Africa",
} as const;

export const nav = [
  { label: "Practice Areas", href: "/practice-areas/" },
  { label: "The Firm", href: "/about/" },
  { label: "Insights", href: "/insights/" },
  { label: "Contact", href: "/contact/" },
] as const;
