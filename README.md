# Outta Web - Business Finder

Find businesses without websites for your outreach campaigns using Google Places API.

## 🚀 Live Demo

Your app will be available at: `https://your-heroku-app-name.herokuapp.com`

## 🛠️ Features

- **Bulk Location Entry**: Add multiple cities/states at once
- **Smart Location Detection**: Automatically formats city/state combinations
- **Google Places API Integration**: Find businesses without websites
- **User Authentication**: Secure login/register system
- **Search History**: Track and manage your searches
- **Export to CSV**: Download results for outreach campaigns

## 📋 Prerequisites

- Node.js 18.x or higher
- Heroku account
- Google Places API key

## 🚀 Deployment to Heroku

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Test Locally
```bash
npm start
```
Visit: http://localhost:3000

### Step 3: Deploy to Heroku

1. **Login to Heroku CLI**:
```bash
heroku login
```

2. **Initialize Git** (if not already done):
   ```bash
git init
git add .
git commit -m "Initial commit"
```

3. **Create Heroku App** (replace with your app name):
```bash
heroku create your-app-name
```

4. **Deploy**:
```bash
git push heroku main
```

5. **Open your app**:
```bash
heroku open
```

## 🔧 Configuration

### Environment Variables

Set your Google Places API key in Heroku:
```bash
heroku config:set GOOGLE_PLACES_API_KEY=your_api_key_here
```

### API Endpoints

- `GET /` - Main application
- `GET /api/health` - Health check
- `GET /api/places/search` - Google Places search proxy
- `GET /api/places/details` - Google Places details proxy

## 📁 Project Structure

```
├── server.js              # Express server
├── outta_web.html         # Main application
├── index.html             # Alternative version
├── package.json           # Dependencies
├── Procfile              # Heroku configuration
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🔒 Security Features

- Helmet.js for security headers
- CORS enabled
- Content Security Policy
- Input validation
- Error handling

## 🌐 API Integration

The app includes proxy endpoints to handle Google Places API requests server-side, avoiding CORS issues.

## 📞 Support

For issues or questions, check the application logs:
```bash
heroku logs --tail
```

## 🎯 Quick Start

1. Deploy to Heroku
2. Set your Google Places API key
3. Open the app URL
4. Register/login
5. Start finding businesses!

---

**Built with ❤️ for business outreach campaigns**