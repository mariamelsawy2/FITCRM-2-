# FitCRM - Fitness Client Relationship Management

A client-side web application for managing fitness clients, built for **CSCE4502 – Design of Web-Based Systems (Fall 2025) - Assignment #2**.

## Project Description

FitCRM is a client management system designed for personal trainers and fitness coaches. The application allows users to add, edit, delete, search, and view client information, along with tracking exercise history and fetching suggested exercises from an external API.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic markup and page structure |
| **CSS3** | Styling with Flexbox, Grid, and CSS Custom Properties |
| **Vanilla JavaScript** | Client-side logic and DOM manipulation |
| **localStorage** | Client-side data persistence |
| **Wger REST API** | Fetching suggested exercises |

## Pages

### Page 1 — New Client Form (`index.html`)

- Form to add a new client with required fields
- Form validation (required fields, email format, phone format)
- Saves client data to localStorage
- Edit mode when accessed with `?edit=<clientId>` parameter

### Page 2 — Client List View (`clients.html`)

- Displays all clients in a responsive table
- **Edit**: Opens form pre-populated with existing client data
- **Delete**: Removes client with confirmation prompt
- **Search**: Filter clients by name in real-time
- **View**: Opens Page 3 with full client details

### Page 3 — Client View (`client-view.html`)

Displays the following client information:
- Name
- Email
- Phone
- Fitness Goal
- Membership Start Date
- **Exercise History** (list of past exercises)
- **Exercises for Next Session** (5 exercises fetched from Wger API)

## Data Storage

All client data is stored in the browser's **localStorage** under the key `fitcrm_clients`.

### Data Schema

```javascript
{
  id: "client_123456789_abc123",
  fullName: "John Doe",
  age: 30,
  gender: "Male",
  email: "john@example.com",
  phone: "+20 10 1234 5678",
  goal: "Weight Loss",
  goalText: "",
  startDate: "2025-01-15",
  createdAt: "2025-01-15T10:30:00.000Z",
  exerciseHistory: [
    {
      id: "exercise_123",
      date: "2025-01-20",
      title: "Upper Body Workout",
      tags: ["Push-ups", "Bench Press", "Rows"],
      notes: "Focus on chest and shoulders"
    }
  ]
}
```

### Exercise History Entry Format

Each exercise entry contains:
- **Exercise Date** - When the exercise was performed
- **Exercise Title** - Name/title of the exercise session
- **Exercise Tags** - Comma-separated tags for exercises performed
- **Exercise Notes** - Additional notes about the exercise

## External API (Wger)

The application fetches **5 suggested exercises** for the next session from the [Wger Workout Manager REST API](https://wger.de/en/software/api).

**API Endpoint:**
```
GET https://wger.de/api/v2/exerciseinfo/?language=2&limit=20
```

**Implementation Details:**
- Fetches exercises with English translations (language=2)
- Extracts: **name**, **category**, and **description** for each exercise
- Displays exactly 5 exercises as required by the assignment
- Fresh API call on every page load (not cached in localStorage)
- Fallback exercises are shown if the API is unavailable

**Fallback Message:**
```
"⚠️ Unable to load suggested exercises right now."
```

When the API fails, goal-specific fallback exercises are displayed:
- Weight Loss: Jumping Jacks, Burpees, Mountain Climbers, etc.
- Muscle Gain: Push-ups, Squats, Lunges, Plank, etc.
- General Fitness: Walking, Stretching, Bodyweight Squats, etc.

## Deployment

### Option 1: GitHub Pages (Recommended)

1. Push this repository to GitHub
2. Go to **Settings** → **Pages**
3. Select **Source**: Deploy from a branch
4. Select **Branch**: `main` and `/ (root)`
5. Click **Save**
6. Your site will be live at: `https://<username>.github.io/<repo-name>/`

### Option 2: Netlify

1. Go to [Netlify](https://netlify.com)
2. Drag and drop the project folder
3. Your site will be deployed automatically

### Option 3: Local Development

Open `index.html` directly in a browser, or use a local server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx http-server

# Then open http://localhost:8080
```

## Project Structure

```
fitcrm/
├── index.html           # Page 1: New Client Form
├── clients.html         # Page 2: Client List View
├── client-view.html     # Page 3: Client Details View
├── css/
│   └── styles.css       # Stylesheet
├── js/
│   └── app.js           # JavaScript module
├── assets/
│   └── icons/           # Icons (if any)
└── README.md            # Documentation
```

## Features

- ✅ Add new clients with form validation
- ✅ Edit existing clients
- ✅ Delete clients with confirmation
- ✅ Search clients by name
- ✅ View full client details
- ✅ Exercise history tracking
- ✅ 5 suggested exercises from Wger API
- ✅ localStorage persistence
- ✅ Responsive design (Flexbox/Grid)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

**CSCE4502 - Design of Web-Based Systems**  
Fall 2025 - Assignment #2
