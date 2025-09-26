# Instagram Contact Finder - Design Document

## Overview

The Instagram Contact Finder is a client-server feature that integrates with the existing OUTTA WEB application. It leverages the Google Custom Search JSON API to discover Instagram business profiles based on niche and location criteria. The feature consists of a frontend interface for user interaction and a backend API endpoint for search processing and data extraction.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Frontend UI   │───▶│   Backend API    │───▶│  Google Custom      │
│   (outta_web.   │    │   (server.js)    │    │  Search JSON API    │
│    html)        │◀───│                  │◀───│                     │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
        │                        │
        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐
│   Local Storage │    │   Error Logging  │
│   (Results      │    │   & Analytics    │
│    History)     │    │                  │
└─────────────────┘    └──────────────────┘
```

### Component Architecture

1. **Frontend Components:**
   - Search Form Component
   - Results Display Component  
   - Export Functionality Component
   - Error Handling Component

2. **Backend Components:**
   - API Route Handler
   - Google Search Service
   - Data Extraction Service
   - Response Formatter Service

## Components and Interfaces

### Frontend Components

#### 1. Search Form Component
```javascript
// Interface for search form
interface SearchFormData {
  niche: string;
  location: string;
}

// Validation rules
const validateSearchForm = (data: SearchFormData) => {
  return {
    isValid: boolean,
    errors: string[]
  }
}
```

#### 2. Results Display Component
```javascript
// Interface for search results
interface InstagramProfile {
  name: string;
  username: string;
  profileUrl: string;
  extractedAt: Date;
}

interface SearchResults {
  profiles: InstagramProfile[];
  totalFound: number;
  searchQuery: string;
  niche: string;
  location: string;
  searchDate: Date;
}
```

#### 3. Export Component
```javascript
// Export functionality
interface ExportOptions {
  format: 'json' | 'csv';
  filename: string;
  data: SearchResults;
}
```

### Backend API Interface

#### Endpoint: `/api/instagram/contact-finder`

**Request:**
```javascript
POST /api/instagram/contact-finder
Content-Type: application/json

{
  "niche": "barber",
  "location": "Houston",
  "maxResults": 10
}
```

**Response (Success):**
```javascript
{
  "success": true,
  "data": {
    "profiles": [
      {
        "name": "Houston Barber Shop",
        "username": "houstonbarber",
        "profileUrl": "https://instagram.com/houstonbarber"
      }
    ],
    "totalFound": 5,
    "searchQuery": "site:instagram.com \"barber\" \"Houston\"",
    "niche": "barber",
    "location": "Houston",
    "searchDate": "2024-01-15T10:30:00Z"
  }
}
```

**Response (Error):**
```javascript
{
  "success": false,
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "Daily search limit reached",
    "details": "Your Google Custom Search API quota has been exceeded"
  }
}
```

### Google Custom Search Service

#### Search Query Construction
```javascript
const constructSearchQuery = (niche, location) => {
  return `site:instagram.com "${niche}" "${location}"`;
}
```

#### API Configuration
```javascript
const googleSearchConfig = {
  apiKey: process.env.GOOGLE_SEARCH_API_KEY,
  searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
  baseUrl: 'https://www.googleapis.com/customsearch/v1'
}
```

## Data Models

### Instagram Profile Model
```javascript
class InstagramProfile {
  constructor(searchResult) {
    this.name = this.extractDisplayName(searchResult.title);
    this.username = this.extractUsername(searchResult.link);
    this.profileUrl = searchResult.link;
    this.isValid = this.validate();
  }

  extractUsername(url) {
    // Extract username from instagram.com/username format
    const match = url.match(/instagram\.com\/([^\/\?]+)/);
    return match ? match[1] : null;
  }

  extractDisplayName(title) {
    // Extract business name before (@username) if present
    return title.split('(@')[0].trim();
  }

  validate() {
    return this.name && 
           this.username && 
           this.profileUrl && 
           this.username.match(/^[a-zA-Z0-9._]+$/);
  }
}
```

### Search Results Model
```javascript
class SearchResults {
  constructor(profiles, searchParams) {
    this.profiles = profiles.filter(p => p.isValid);
    this.totalFound = this.profiles.length;
    this.searchQuery = constructSearchQuery(searchParams.niche, searchParams.location);
    this.niche = searchParams.niche;
    this.location = searchParams.location;
    this.searchDate = new Date();
  }

  toJSON() {
    return {
      profiles: this.profiles.map(p => ({
        name: p.name,
        username: p.username,
        profileUrl: p.profileUrl
      })),
      totalFound: this.totalFound,
      searchQuery: this.searchQuery,
      niche: this.niche,
      location: this.location,
      searchDate: this.searchDate
    };
  }

  toCSV() {
    const headers = ['Name', 'Username', 'Profile URL', 'Niche', 'Location', 'Search Date'];
    const rows = this.profiles.map(p => [
      p.name,
      `@${p.username}`,
      p.profileUrl,
      this.niche,
      this.location,
      this.searchDate.toISOString()
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }
}
```

## Error Handling

### Error Types and Responses

1. **Missing API Credentials**
   ```javascript
   {
     code: 'MISSING_CREDENTIALS',
     message: 'API credentials not configured',
     userMessage: 'Please configure your Google Custom Search API credentials'
   }
   ```

2. **Quota Exceeded**
   ```javascript
   {
     code: 'QUOTA_EXCEEDED',
     message: 'Daily search limit reached',
     userMessage: 'Daily search limit reached. Please try again tomorrow or upgrade your API plan'
   }
   ```

3. **No Results Found**
   ```javascript
   {
     code: 'NO_RESULTS',
     message: 'No Instagram profiles found',
     userMessage: 'No Instagram profiles found for this niche and location'
   }
   ```

4. **Network Error**
   ```javascript
   {
     code: 'NETWORK_ERROR',
     message: 'Failed to connect to Google API',
     userMessage: 'Connection error. Please check your internet connection and try again'
   }
   ```

### Frontend Error Handling Strategy

```javascript
const handleSearchError = (error) => {
  const errorMessages = {
    'MISSING_CREDENTIALS': 'Please configure your Google Custom Search API credentials',
    'QUOTA_EXCEEDED': 'Daily search limit reached. Please try again tomorrow',
    'NO_RESULTS': `No Instagram profiles found for '${niche}' in '${location}'`,
    'NETWORK_ERROR': 'Connection error. Please check your internet connection and try again'
  };

  displayErrorMessage(errorMessages[error.code] || 'An unexpected error occurred');
  enableRetryButton();
}
```

## Testing Strategy

### Unit Tests

1. **Data Extraction Tests**
   - Test username extraction from various Instagram URL formats
   - Test display name extraction from different title formats
   - Test validation logic for extracted data

2. **Search Query Construction Tests**
   - Test query formatting with different niche/location combinations
   - Test special character handling in search terms
   - Test query encoding for API calls

3. **Export Functionality Tests**
   - Test JSON export format and structure
   - Test CSV export format and escaping
   - Test filename generation with timestamps

### Integration Tests

1. **API Endpoint Tests**
   - Test successful search with valid credentials
   - Test error handling for missing credentials
   - Test quota exceeded scenarios
   - Test malformed request handling

2. **Google API Integration Tests**
   - Test API call construction and execution
   - Test response parsing and data extraction
   - Test error response handling

### End-to-End Tests

1. **Complete Search Flow**
   - User enters niche and location
   - System performs search and displays results
   - User exports results in both formats
   - Results are properly formatted and downloadable

2. **Error Scenarios**
   - Test user experience with various error conditions
   - Verify appropriate error messages are displayed
   - Test retry functionality after errors

## Performance Considerations

### Frontend Optimization
- Implement debounced search to prevent excessive API calls
- Cache recent search results in localStorage
- Use loading indicators for better user experience
- Implement pagination for large result sets

### Backend Optimization
- Implement rate limiting to prevent API quota abuse
- Add response caching for identical searches
- Optimize data extraction algorithms
- Implement request queuing for high traffic

### API Usage Optimization
- Batch multiple searches when possible
- Implement intelligent retry logic with exponential backoff
- Monitor API usage and implement usage analytics
- Provide usage statistics to users

## Security Considerations

### API Key Protection
- Store API keys as environment variables
- Never expose API keys in frontend code
- Implement server-side API key validation
- Rotate API keys regularly

### Input Validation
- Sanitize all user inputs before processing
- Implement rate limiting per user/IP
- Validate search parameters on both frontend and backend
- Prevent injection attacks through input sanitization

### Data Privacy
- Don't store personal information from Instagram profiles
- Implement data retention policies for search results
- Provide clear privacy policy for data usage
- Allow users to delete their search history

## Deployment Strategy

### Environment Configuration
```javascript
// Required environment variables
GOOGLE_SEARCH_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_engine_id_here
```

### Frontend Integration
- Add new tab/section to existing OUTTA WEB interface
- Maintain consistent styling with current application
- Integrate with existing user authentication system
- Preserve user session across feature switches

### Backend Deployment
- Add new API endpoint to existing server.js
- Implement proper CORS headers for cross-origin requests
- Add endpoint to existing error handling middleware
- Include in existing logging and monitoring systems