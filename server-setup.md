# Local Server Setup Options

## Python (if you have Python installed)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then visit: http://localhost:8000

## Node.js (if you have Node.js installed)
```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server

# Or use npx (no installation needed)
npx http-server
```

## PHP (if you have PHP installed)
```bash
php -S localhost:8000
```

## Live Server (VS Code Extension)
1. Install "Live Server" extension in VS Code
2. Right-click index.html
3. Select "Open with Live Server"