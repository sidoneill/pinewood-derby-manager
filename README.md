# Pinewood Derby Race Manager

A simple system for managing Pinewood Derby races with a 6-lane track.

## Features

- Add racers with numbered cars
- Generate fair races for a 6-lane track
- Track race results
- Calculate standings automatically

## How to Run

1. Clone this repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to the local server address (usually http://localhost:5173)

## Usage

1. **Add Racers**: Enter a racer name and unique car number, then click "Add Racer"
2. **Generate Races**: Once you have at least 2 racers, click "Generate Races" to create a fair race schedule where each racer runs in each lane
3. **Record Results**: For each race, click the "Select" buttons in order of finish to record the results
4. **View Standings**: The results section will automatically calculate and display the current standings

## Build for Production

To build for production, run: `npm run build`

This will create a `dist` directory with the compiled assets that can be deployed to any static web server.
