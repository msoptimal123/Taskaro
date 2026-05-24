const MONTHS = ['jan','feb','mar','apr','maj','jun','jul','avg','sep','okt','nov','dec'];
const MONTHS_FULL = ['januar','februar','marec','april','maj','junij','julij','avgust','september','oktober','november','december'];
const DAYS = ['Nedelja','Ponedeljek','Torek','Sreda','Četrtek','Petek','Sobota'];

export function formatDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${parseInt(d)}. ${MONTHS[parseInt(m) - 1]}`;
}

export function formatDateFull(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${parseInt(d)}. ${MONTHS_FULL[parseInt(m) - 1]} ${y}`;
}

export function formatDayName(iso: string): string {
  return DAYS[new Date(iso).getDay()];
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function isToday(iso: string): boolean {
  return iso === todayISO();
}

export function isPast(iso: string): boolean {
  return iso < todayISO();
}
