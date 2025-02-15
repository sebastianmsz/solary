# Solary ☀️

A modern weather application that provides real-time weather information and forecasts for any location worldwide. Built with modern JavaScript, this application showcases API integration, responsive design, and efficient webpack bundling.

## Features

- **Current Weather**: Displays real-time temperature, condition, humidity, wind, and sunrise/sunset times.
- **Hourly Forecast**: Provides a 10-hour forecast including temperature and weather conditions.
- **Extended Forecast**: Shows forecast details for upcoming days.
- **Search Autocomplete**: Quickly find your location with real-time suggestions.
- **Unit Toggle**: Switch between Celsius and Fahrenheit with ease.
- **Responsive Design**: Optimized for desktop, tablet, and mobile experiences.
- **Themed Backgrounds**: Automatically adjusts backgrounds for day and night.

## Screenshot

![App Screenshot](screenshot.webp)

## Live Demo

[View Live Demo](https://sebastianmsz.github.io/solary)

## Getting Started

### Prerequisites

- Node.js (v12 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sebastianmsz/solary.git
   cd solary
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:8080](http://localhost:8080) in your browser

### Building for Production

To create a production build:
```bash
npm run build
```

## Project Structure

```
solary/
├── src/              # Source files
│   ├── api.js        # API integration
│   ├── index.js      # Main entry point
│   ├── ui.js         # UI components
│   └── style.css     # Styles
├── public/           # Static assets
│   ├── img/          # Images
│   └── index.html    # HTML template
└── webpack.config.js # Webpack configuration
```

## Technologies Used

- **JavaScript (ESNext)**
- **Webpack**: For module bundling and development server.
- **Babel**: Transpiling modern JavaScript for broader browser support.
- **HTML & CSS**: For building responsive user interfaces.
- **Weather API**: For fetching current weather and forecast data.
- **FontAwesome**: For incorporating icons.
- **ESLint & Prettier**: For code linting and formatting.

## Development

### API Integration
The application uses a weather API to fetch:
- Current weather conditions
- Hourly forecasts
- Extended weather forecasts
- Location autocomplete suggestions

### Code Style
This project uses:
- ESLint for code linting
- Prettier for code formatting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Sebastian Molina - [sevas.molina2004@gmail.com](mailto:sevas.molina2004@gmail.com)

Project Link: [https://github.com/sebastianmsz/solary](https://github.com/sebastianmsz/solary)
