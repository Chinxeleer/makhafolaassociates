// Main navigation, read by the header, mobile menu and footer. The core practice (RAF claims) comes first;
// `primary` marks it so the mobile menu can give it the largest link.
import { speciality } from "./practice-areas";

export interface NavItem {
  label: string;
  href: string;
  primary?: boolean;
}

export const nav: NavItem[] = [
  { label: speciality.navLabel, href: speciality.href, primary: true },
  { label: "Practice Areas", href: "/practice-areas/" },
  { label: "The Firm", href: "/about/" },
  { label: "Insights", href: "/insights/" },
  { label: "Contact", href: "/contact/" },
];
