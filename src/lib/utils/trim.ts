export function stripTrailingSlash(str: string) {
  return str.endsWith("/") ? str.slice(0, -1) : str;
}
