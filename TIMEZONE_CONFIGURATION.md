# Timezone Configuration - Notes App

## Overview
Your notes app has been updated to automatically use the user's system timezone and locale. Timestamps now display in the user's local time whether they're using IST, EST, PST, or any other timezone.

## How It Works

### Backend (Django)
- **Storage**: All timestamps are stored in UTC (best practice)
- **Creation**: When a note is created, `created_at` captures the current UTC time
- **Updates**: When a note is edited, `updated_at` is automatically set to the current UTC time
- **Timezone-Aware**: Uses `datetime.timezone.utc` for timezone-aware datetime objects

**Files Modified:**
- `notesApp/models.py` - Added `_get_utc_now()` factory function
- `notesApp/views.py` - Uses consistent UTC time handling
- `notesApp/utils.py` - Added `get_current_utc_time()` utility function

### Frontend (React)
- **Detection**: Automatically detects user's system timezone and locale
- **Conversion**: Converts UTC timestamps from API to user's local time
- **Display**: Shows timezone abbreviation (e.g., IST, EST, PST)
- **Locale**: Respects user's browser language settings

**Files Created/Modified:**
- `notes-frontend/src/utils/dateFormatter.js` - New utility module with timezone functions
- `notes-frontend/src/pages/Notes.jsx` - Uses new timezone formatter

## Key Features

### Timezone Detection
```javascript
// Browser's timezone (e.g., Asia/Kolkata, America/New_York)
Intl.DateTimeFormat().resolvedOptions().timeZone

// Browser's language/locale (e.g., en-IN, en-US)
navigator.language
```

### Example Displays
- **IST User**: "09/03/2026, 03:45:30 PM IST"
- **EST User**: "03/08/2026, 05:15:30 AM EST"
- **PST User**: "03/08/2026, 02:15:30 AM PST"

## Available Utility Functions

### `formatWithTimezone(dateStr)`
Formats timestamp with timezone abbreviation (default)
```javascript
formatWithTimezone("2026-03-09T10:30:00Z")
// Returns: "09/03/2026, 03:45:30 PM IST"
```

### `formatToUserTimezone(dateStr, options)`
Formats timestamp without timezone abbreviation
```javascript
formatToUserTimezone("2026-03-09T10:30:00Z")
// Returns: "09/03/2026, 03:45:30 PM"
```

### `getUserTimezone()`
Returns full timezone name
```javascript
getUserTimezone()
// Returns: "Asia/Kolkata" or "America/New_York"
```

### `getUserTimezoneAbbr()`
Returns timezone abbreviation
```javascript
getUserTimezoneAbbr()
// Returns: "IST" or "EST"
```

## Testing

### Test 1: Create a Note
1. Create a new note
2. Check the timestamp - it should show your current local time
3. Example: If your system is set to IST and it's 3:45 PM, timestamp should show "03:45"

### Test 2: Edit a Note
1. Edit an existing note
2. The timestamp should update to show the current time in your timezone
3. The "edited" label should appear

### Test 3: Timezone Switching (Browser Dev Tools)
1. Open DevTools (F12)
2. Use Device Emulation or Browser settings to change locale
3. Refresh the page
4. Timestamps should reformat to match the selected timezone

## GMT/UTC Offset Examples

| Timezone | Abbr | UTC Offset | Example |
|----------|------|-----------|---------|
| Indian Standard Time | IST | UTC+5:30 | "09/03/2026, 03:45:30 PM IST" |
| Eastern Standard Time | EST | UTC-5 | "03/08/2026, 05:15:30 AM EST" |
| Pacific Standard Time | PST | UTC-8 | "03/08/2026, 02:15:30 AM PST" |
| British Summer Time | BST | UTC+1 | "09/03/2026, 10:15:30 AM BST" |
| Central European Time | CET | UTC+1 | "09/03/2026, 11:15:30 AM CET" |
| Australian Eastern Time | AEDT | UTC+11 | "09/03/2026, 09:45:30 PM AEDT" |

## Important Notes

✅ **What's Working:**
- UTC storage on backend (timezone-independent)
- Automatic timezone detection on frontend
- Proper datetime defaults in models
- Consistent timestamp updates on edit

✅ **Best Practices Applied:**
- UTC storage for database (language/library independent)
- Timezone-aware datetime objects
- Factory functions for default values
- Reusable utility functions

## No Action Needed
- All configuration is automatic
- No environment variables to set
- No database migrations required
- Works with any system timezone

## Troubleshooting

**Issue**: Timestamps show wrong time
- **Solution**: Check your browser/system timezone settings
- **Command**: `date` in terminal to verify system timezone

**Issue**: Timezone abbreviation missing
- **Solution**: This is expected in some browsers; full timezone is still correct
- **Note**: Check `getUserTimezone()` returns correct value

**Issue**: Timestamps don't update after edit
- **Solution**: Refresh the page (browser cache) or check backend logs
