# Netflix-Style Profile System - Testing Guide

## ✅ Pre-Testing Checklist

### Backend
- [x] TypeScript compilation errors fixed
- [x] Server should be running on port 4004
- [x] MongoDB connected
- [x] Routes registered at `/office/profiles`

### Frontend
- [x] ProfileSelector component created
- [x] API functions updated
- [x] Route `/profile-selector` added to App.tsx
- [x] Dev server running on port 5173

## 🧪 Complete Test Flow

### Test 1: First-Time User Experience

**Steps:**
1. Open browser in incognito mode (fresh session)
2. Navigate to `http://localhost:5173/signin`
3. Login with OFFICE account credentials
   - Email: (your office test account)
   - Password: (your office test password)

**Expected Results:**
- ✅ Successful login
- ✅ Automatically redirected to `/profile-selector`
- ✅ See "Welcome to SASM" heading
- ✅ See message: "Get started by creating your first profile"
- ✅ See only one card: "Add Profile" with green dashed border

### Test 2: Create First Profile

**Steps:**
1. Click "Add Profile" card
2. Modal opens with form

**Fill in:**
- Profile Name: "Test User"
- PIN: "1234"
- Confirm PIN: "1234"

3. Click "Create Profile"

**Expected Results:**
- ✅ Modal closes
- ✅ Success toast: "Profile created successfully!"
- ✅ Heading changes to "Who's using SASM?"
- ✅ See new profile card with:
  - Blue gradient avatar with "T"
  - Name "Test User"
  - No last accessed date (first time)
- ✅ "Add Profile" card still visible

### Test 3: Select Profile

**Steps:**
1. Click on "Test User" profile card
2. PIN entry modal appears
3. Enter PIN: "1234"
4. Click "Access" or press Enter

**Expected Results:**
- ✅ Success toast: "Profile selected successfully!"
- ✅ Redirected to `/office-dashboard`
- ✅ Can access office features

### Test 4: Create Additional Profiles

**Steps:**
1. Sign out
2. Sign in again with same OFFICE account
3. Should be at profile selector
4. Click "Add Profile"
5. Create profiles with these details:

**Profile 2:**
- Name: "Manager"
- PIN: "5678"

**Profile 3:**
- Name: "Admin"
- PIN: "9999"

**Expected Results:**
- ✅ Each profile created successfully
- ✅ All 3 profiles visible on selector
- ✅ Different avatars (T, M, A)
- ✅ "Add Profile" card still visible

### Test 5: Edit Profile

**Steps:**
1. At profile selector
2. Hover over "Test User" profile
3. Edit (pencil) icon appears in top-right
4. Click edit icon
5. Change name to "Test Admin"
6. Leave PIN fields empty (don't change PIN)
7. Click "Update Profile"

**Expected Results:**
- ✅ Edit modal opens
- ✅ Name pre-filled with current name
- ✅ PIN fields empty
- ✅ Success toast: "Profile updated successfully!"
- ✅ Profile name changed to "Test Admin"
- ✅ Avatar changes to "T" (first letter)

### Test 6: Change PIN

**Steps:**
1. Hover over "Test Admin" profile
2. Click edit icon
3. Don't change name
4. New PIN: "4321"
5. Confirm PIN: "4321"
6. Click "Update Profile"

**Expected Results:**
- ✅ Success toast: "Profile updated successfully!"
- ✅ Profile card unchanged visually

7. Click "Test Admin" profile
8. Try old PIN "1234"

**Expected Results:**
- ✅ Error toast: "Incorrect PIN"
- ✅ PIN field clears

9. Try new PIN "4321"

**Expected Results:**
- ✅ Successfully accesses dashboard

### Test 7: Delete Profile

**Steps:**
1. Sign out, sign in again
2. At profile selector with 3 profiles
3. Hover over "Manager" profile
4. Click delete (trash) icon
5. Confirmation modal appears
6. Click "Delete Profile"

**Expected Results:**
- ✅ Delete confirmation modal shows
- ✅ Shows profile name in message
- ✅ Success toast: "Profile deleted successfully!"
- ✅ "Manager" profile removed from grid
- ✅ Only 2 profiles remain

### Test 8: Cannot Delete Last Profile

**Steps:**
1. Delete "Admin" profile
2. Now only "Test Admin" remains
3. Hover over "Test Admin"
4. Click delete icon
5. Try to delete

**Expected Results:**
- ✅ Error toast: "Cannot delete the last profile..."
- ✅ Profile not deleted
- ✅ Still see "Test Admin" profile

### Test 9: Maximum Profiles Limit

**Steps:**
1. Create 4 more profiles (to reach 5 total)
   - Profile 4: "User4", PIN "1111"
   - Profile 5: "User5", PIN "2222"
2. Try to create 6th profile

**Expected Results:**
- ✅ "Add Profile" card shows "Maximum profiles reached"
- ✅ Card appears disabled
- ✅ Cannot click to create more
- ✅ Error toast if attempted: "Maximum of 5 profiles allowed"

### Test 10: PIN Validation

**Steps:**
1. Delete one profile to make room
2. Click "Add Profile"
3. Try these invalid PINs:

**Test A:** PIN "123" (3 digits)
- ✅ Error toast: "PIN must be exactly 4 digits"

**Test B:** PIN "12345" (5 digits)
- ✅ Cannot type more than 4 digits

**Test C:** PIN "abcd" (letters)
- ✅ Cannot type letters (digits only)

**Test D:** PIN "1234", Confirm "5678" (mismatch)
- ✅ Error toast: "PINs do not match"

**Test E:** PIN "1234", Confirm "1234" (valid)
- ✅ Profile created successfully

### Test 11: Profile Last Accessed

**Steps:**
1. At profile selector
2. Select "Test Admin" profile with PIN
3. Access dashboard
4. Sign out
5. Sign in again
6. At profile selector

**Expected Results:**
- ✅ "Test Admin" card shows "Last used: [today's date]"
- ✅ Other profiles don't show last accessed

### Test 12: Hover States & Animations

**Steps:**
1. At profile selector
2. Hover over each profile card

**Expected Results:**
- ✅ Card scales up slightly
- ✅ Blue shadow appears
- ✅ Edit/Delete buttons fade in
- ✅ Smooth transitions

3. Hover over "Add Profile" card

**Expected Results:**
- ✅ Card scales up
- ✅ Border changes to green
- ✅ Icon changes to green
- ✅ Text changes to green

### Test 13: Theme Switching

**Steps:**
1. At profile selector in light mode
2. Click theme switcher in DefNav
3. Switch to dark mode

**Expected Results:**
- ✅ Background changes to dark gray
- ✅ Cards change to dark theme
- ✅ Text readable (white/gray)
- ✅ All elements properly themed

4. Switch back to light mode

**Expected Results:**
- ✅ Everything returns to light theme
- ✅ No visual glitches

### Test 14: Responsive Design

**Steps:**
1. At profile selector
2. Resize browser window

**Desktop (>1024px):**
- ✅ 4 columns grid

**Tablet (768px - 1024px):**
- ✅ 3 columns grid

**Mobile (<768px):**
- ✅ 2 columns grid
- ✅ Cards stack properly
- ✅ Text readable
- ✅ Buttons accessible

### Test 15: Error Handling

**Test A: Wrong PIN**
1. Click profile
2. Enter wrong PIN
- ✅ Error toast shown
- ✅ PIN field cleared
- ✅ Can retry

**Test B: Network Error (simulate)**
1. Stop backend server
2. Try to create profile
- ✅ Error toast with meaningful message
- ✅ Form stays open
- ✅ Can fix and retry

**Test C: Duplicate Name**
1. Create profile "Test"
2. Try to create another "Test"
- ✅ Error toast: "A profile with this name already exists"

### Test 16: Logout Without Selecting Profile

**Steps:**
1. Login with OFFICE account
2. At profile selector (don't select any profile)
3. Click logout/sign out

**Expected Results:**
- ✅ Successfully signed out
- ✅ Redirected to signin page
- ✅ No errors

### Test 17: Direct Dashboard Access (Security)

**Steps:**
1. Login with OFFICE account
2. At profile selector
3. Manually navigate to `http://localhost:5173/office-dashboard`

**Expected Results:**
- ✅ Should be blocked (route guard)
- ✅ Redirected back to profile selector
- ✅ OR: Access denied message

*Note: This requires implementing route guards - currently in progress*

## 🐛 Known Issues to Check

- [ ] Profile selector accessible before authentication?
- [ ] Can access dashboard without profile selection?
- [ ] Profile cards responsive on very small screens?
- [ ] Modal z-index conflicts with other UI?
- [ ] Toast notifications positioning correct?

## 📊 Performance Checks

- [ ] Profile list loads quickly (<1s)
- [ ] Profile selection smooth (<500ms)
- [ ] No lag when hovering cards
- [ ] Modals open/close smoothly
- [ ] No console errors
- [ ] No memory leaks (check DevTools)

## ✅ Sign-Off Checklist

After all tests pass:
- [ ] All CRUD operations work
- [ ] PIN authentication works
- [ ] Validation prevents bad data
- [ ] UI is responsive
- [ ] Theme switching works
- [ ] Error handling graceful
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Smooth user experience
- [ ] Ready for production

## 🎉 Success Criteria

The system passes all tests when:
1. ✅ Users MUST create/select a profile before accessing dashboard
2. ✅ Profile creation with 4-digit PIN works flawlessly
3. ✅ Profile editing (name/PIN) works correctly
4. ✅ Profile deletion works (except last profile)
5. ✅ PIN authentication is secure and accurate
6. ✅ UI is beautiful and responsive
7. ✅ All validations prevent bad input
8. ✅ Error messages are clear and helpful
9. ✅ The experience feels just like Netflix!

**Current Status:** ✅ Ready to Test!

Start with Test 1 and work through all scenarios. Report any issues found!
