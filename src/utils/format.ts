export function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function pluralize(n: number, s: string, p?: string): string {
  return n === 1 ? s : p || s + 's';
}
