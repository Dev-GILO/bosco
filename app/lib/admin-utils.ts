// Admin role check utility
const ADMIN_EMAILS = ["admin@bosco.com"]

export function isAdmin(email: string | null): boolean {
  return email ? ADMIN_EMAILS.includes(email) : false
}
