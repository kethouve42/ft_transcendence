
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiry = payload.exp * 1000; // en ms
    return Date.now() > expiry;
  } catch (err) {
    return true; // si décryptage impossible, on considère le token invalide
  }
}
