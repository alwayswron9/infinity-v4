export function getClientToken() {
  if (typeof window === 'undefined') return null;
  
  console.log('Raw cookie string:', document.cookie);
  const cookieParts = document.cookie.split('; ');
  console.log('Cookie parts:', cookieParts);
  
  const cookie = cookieParts.find(row => {
    console.log('Checking row:', row, 'starts with token=?', row.startsWith('token='));
    return row.startsWith('token=');
  });

  console.log('Found cookie:', cookie);
  return cookie ? cookie.split('=')[1] : null;
}

export function storeClientToken(token: string) {
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
}

export function clearClientToken() {
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
} 