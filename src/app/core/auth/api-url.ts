import { environment } from '../../../environments/environment';
export function esApi(url: string): boolean {
  const base = environment.apiUrl.replace(/\/$/, '');
  return url === base || url.startsWith(base + '/') || url.startsWith(base + '?');
}
export function esLogin(url: string): boolean {
  return url.split('?')[0] === environment.apiUrl + '/auth/login';
}
export function retornoSeguro(url: string | null): string {
  return url?.startsWith('/') && !url.startsWith('//') && !url.startsWith('/login')
    ? url
    : '/inicio';
}
