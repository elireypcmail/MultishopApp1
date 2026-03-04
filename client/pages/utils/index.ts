export function isBcryptHash(value: string): boolean {
      if (!value || value.length !== 60) return false;
      return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
}