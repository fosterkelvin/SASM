// Debug script to check user data structure
// Paste this in the browser console on your deployed site to diagnose the issue

console.log('%c=== SASM Profile Debug Tool ===', 'color: #00ff00; font-size: 16px; font-weight: bold');

// Check environment variable
console.log('\n%c1. Environment Variable:', 'color: #ffaa00; font-weight: bold');
console.log('VITE_API:', import.meta.env?.VITE_API || 'NOT DEFINED');
console.log('Expected: Should be your production backend URL, NOT localhost');

// Check cookies
console.log('\n%c2. Cookies:', 'color: #ffaa00; font-weight: bold');
const cookies = document.cookie.split(';').reduce((acc, cookie) => {
  const [key, value] = cookie.trim().split('=');
  acc[key] = value;
  return acc;
}, {});
console.log('Has accessToken:', !!cookies.accessToken);
console.log('Has refreshToken:', !!cookies.refreshToken);
console.log('Cookies:', cookies);

// Check localStorage
console.log('\n%c3. LocalStorage:', 'color: #ffaa00; font-weight: bold');
console.log('Auth data:', localStorage.getItem('auth') || 'None');

// Make API call to get user data
console.log('\n%c4. User API Response:', 'color: #ffaa00; font-weight: bold');
fetch(`${import.meta.env?.VITE_API || 'http://localhost:4004'}/user`, {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then(res => {
    console.log('Status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('User Data:', data);
    console.log('\n%c5. Profile Information Check:', 'color: #ffaa00; font-weight: bold');
    console.log('Has profileName:', !!data.profileName);
    console.log('profileName value:', data.profileName || 'MISSING');
    console.log('Has profileID:', !!data.profileID);
    console.log('profileID value:', data.profileID || 'MISSING');
    
    if (!data.profileName) {
      console.log('\n%c❌ PROBLEM FOUND:', 'color: #ff0000; font-weight: bold');
      console.log('profileName is missing from user data!');
      console.log('\n%cPossible causes:', 'color: #ffaa00');
      console.log('1. Backend code not deployed with profileID fix');
      console.log('2. Session in database does not have profileID field');
      console.log('3. User needs to re-select profile after backend deployment');
      console.log('\n%cSolution:', 'color: #00ff00');
      console.log('1. Deploy backend code changes');
      console.log('2. Clear sessions: db.sessions.deleteMany({})');
      console.log('3. Sign out and sign in again');
      console.log('4. Select profile again with PIN');
    } else {
      console.log('\n%c✅ Profile data looks good!', 'color: #00ff00; font-weight: bold');
    }
  })
  .catch(err => {
    console.error('%c❌ API Error:', 'color: #ff0000; font-weight: bold', err);
    console.log('\n%cPossible causes:', 'color: #ffaa00');
    console.log('1. CORS error - backend not allowing frontend domain');
    console.log('2. Backend not running or wrong URL');
    console.log('3. Network connectivity issue');
  });

console.log('\n%c=== End Debug ===', 'color: #00ff00; font-size: 16px; font-weight: bold');
