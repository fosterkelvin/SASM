# Scholar Management - Quick Start Guide

## 🎯 What is Scholar Management?

A dedicated page for HR staff to manage Student Assistants and Student Marshals, allowing them to deploy scholars to different offices and track their progress.

## 🚀 How to Access

1. **Login** as an HR user
2. Navigate to the **HR Sidebar**
3. Click on **"Scholars"** menu item
4. You'll be redirected to `/hr/scholars`

## 📋 Main Features

### 1. **Scholar List View**

```
┌─────────────────────────────────────────────────┐
│  🔍 Search    🏢 Office Filter   📚 Type   📊 Status │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Scholar  │  │ Scholar  │  │ Scholar  │     │
│  │   Card   │  │   Card   │  │   Card   │     │
│  │          │  │          │  │          │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Each Scholar Card Shows:**

- ✅ Name and Email
- 🎓 Scholar Type Badge (Student Assistant/Marshal)
- 🏢 Office Assignment
- 📅 Start Date
- ⏱️ Hours Progress (X/Y hours)
- ⭐ Performance Rating (if available)
- 🔘 Deploy/Update Button
- 👁️ View Details Button (if deployed)

### 2. **Deploy/Update Scholar**

Click "Deploy to Office" or "Update Deployment" to open modal:

```
┌─────────────────────────────────────┐
│  Deploy Scholar                     │
├─────────────────────────────────────┤
│                                     │
│  Scholar Info:                      │
│  Name: John Doe                     │
│  Type: Student Assistant            │
│                                     │
│  🏢 Office: [Search dropdown...]    │
│  👤 Supervisor: [Optional]          │
│  ⏱️ Required Hours: [120]           │
│  📝 Notes: [Optional text...]       │
│                                     │
│  [Deploy Scholar]  [Cancel]         │
└─────────────────────────────────────┘
```

### 3. **View Scholar Details**

Click "View DTR, Leave & Schedule" to see:

**Three Tabs Available:**

#### 📊 DTR Tab

- Select Month/Year
- Summary Cards: Total Hours, Days Present, Days Absent, Late Count
- Detailed table of daily attendance records

#### 📅 Leave Records Tab

- View leave requests and status
- (Coming soon feature)

#### 📚 Class Schedule Tab

- Visual weekly schedule grid
- Shows class times and duty hours
- Color-coded for easy reading

## 🔍 Search & Filter Options

### Search Bar

- Type scholar name
- Real-time filtering as you type

### Office Filter

- Filter by office name
- Leave empty to show all

### Scholar Type Filter

- **All Types** (default)
- **Student Assistant**
- **Student Marshal**

### Status Filter

- **All Statuses** (default)
- **Pending Office Interview**
- **Interview Scheduled**
- **Active Scholar**
- **Training Completed**

## 📝 Workflow Example

### Deploying a New Scholar

1. **Find the Scholar**

   - Use search or scroll through the list
   - Look for scholars without office assignment

2. **Click "Deploy to Office"**

   - Modal opens with scholar information

3. **Fill in Details**

   - Search and select an office
   - (Optional) Assign a supervisor
   - Enter required hours (e.g., 120)
   - (Optional) Add deployment notes

4. **Submit**
   - Click "Deploy Scholar"
   - Success message appears
   - Scholar card updates with new information

### Updating Existing Deployment

1. **Find Deployed Scholar**

   - Look for scholars with office assignments

2. **Click "Update Deployment"**

   - Modal opens pre-filled with current data

3. **Modify Information**

   - Change office, supervisor, hours, or notes
   - Update performance rating (set by office)

4. **Submit Changes**
   - Click "Update Deployment"
   - Confirmation appears

### Monitoring Progress

1. **Check Scholar Cards**

   - Green progress bars show hour completion
   - Percentage displayed below bar

2. **View Detailed DTR**

   - Click "View DTR, Leave & Schedule"
   - Select desired month/year
   - Review attendance records

3. **Check Performance**
   - Star rating (1-5) shown on cards
   - Set by office supervisors

## 🎨 Visual Indicators

### Scholar Type Badges

- 🔵 **Blue Badge** = Student Assistant
- 🟣 **Purple Badge** = Student Marshal

### Progress Bars

- 🟢 **Green** = Making progress
- **Percentage** = Completion rate

### Status Badges

- 🟢 **Green** = Present
- 🟡 **Yellow** = Late
- 🔴 **Red** = Absent

### Performance Stars

- ⭐⭐⭐⭐⭐ = 5/5 Excellent
- ⭐⭐⭐⭐ = 4/5 Very Good
- ⭐⭐⭐ = 3/5 Good
- ⭐⭐ = 2/5 Fair
- ⭐ = 1/5 Needs Improvement

## 💡 Tips & Best Practices

### For HR Staff

1. **Deploy Early**

   - Deploy scholars as soon as they pass interviews
   - Set realistic hour requirements

2. **Monitor Progress**

   - Check DTR regularly
   - Follow up on low completion rates

3. **Use Filters Effectively**

   - Filter by status to find scholars needing attention
   - Group by office to review deployments

4. **Communication**

   - Use notes field for important information
   - Coordinate with office supervisors

5. **Performance Tracking**
   - Review performance ratings
   - Identify top performers
   - Support struggling scholars

## 🆘 Troubleshooting

### Scholar Not Appearing?

- Check filters - reset to "All"
- Verify scholar has correct status
- Refresh the page

### Can't Deploy Scholar?

- Ensure all required fields are filled
- Office name must be selected
- Required hours must be a positive number

### DTR Not Loading?

- Check internet connection
- Verify scholar has DTR records
- Try different month/year

### Office Dropdown Empty?

- Ensure offices are created in system
- Contact system administrator
- Refresh the page

## 🔐 Permissions

**Required Role:** HR

**What HR Can Do:**

- ✅ View all scholars
- ✅ Deploy scholars to offices
- ✅ Update scholar deployments
- ✅ View scholar DTR records
- ✅ View scholar schedules
- ✅ Filter and search scholars

**What HR Cannot Do:**

- ❌ Set performance ratings (office staff only)
- ❌ Approve scholar time entries
- ❌ Modify scholar class schedules

## 📱 Mobile Access

The Scholar Management page is fully responsive:

- **Mobile View**: Stacked cards, full-width modals
- **Tablet View**: 2-column card grid
- **Desktop View**: 3-column card grid

All features work on mobile devices with touch-friendly interfaces.

## 🎓 Related Features

- **Trainee Management** (`/hr/trainees`) - Similar interface for trainees
- **Users** (`/hr/users`) - Manage all system users
- **DTR Check** (`/hr/dtr-check`) - View all DTR records
- **Analytics** (`/hr/analytics`) - Performance analytics

## 📞 Support

For issues or questions:

1. Check this guide first
2. Consult the main documentation
3. Contact your system administrator
4. Report bugs through proper channels

---

**Last Updated:** November 2025  
**Version:** 1.0  
**Feature Status:** ✅ Production Ready
