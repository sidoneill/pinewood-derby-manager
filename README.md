# Pinewood Derby Race Manager

A simple system for managing Pinewood Derby races with a 6-lane track.

## Features

- Add racers with numbered cars
- Import racers from a CSV file
- Generate fair races where each racer races once in each lane
- Races persist between page refreshes
- Results autosave after each race
- Track race results and calculate standings automatically

## How to Run

1. Clone this repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to the local server address (usually http://localhost:5173)

## Usage

### Adding Racers

You can add racers in two ways:

1. **Import from CSV**: Upload a CSV file with the format:
   ```
   car number,first name,last name,den
   123,John,Smith,Wolf
   456,Jane,Doe,Bear
   ```
   Click "Import" to add these racers.

2. **Manual Entry**: Fill in the form fields and click "Add Racer" for each racer.

### Managing Races

1. **Generate Races**: Once you have at least 2 racers, click "Generate & Lock Races" to create a fair race schedule where each racer runs in each lane.
2. **Record Results**: For each race, click the "Select" buttons in order of finish to record the results.
3. **View Standings**: The results section will automatically calculate and display the current standings.

### Data Persistence

All data (racers, races, and results) is stored locally in your browser, so you can close the browser and return later without losing your data.

If you need to clear all data, click the "Clear All Data" button.

## Build for Production

To build for production, run: `npm run build`

This will create a `dist` directory with the compiled assets that can be deployed to any static web server.

## CSV Format

The CSV file for importing racers should have:
- First row: Headers (optional, will be skipped)
- Columns in this order: car number, first name, last name, den
- Example:
  ```
  car number,first name,last name,den
  123,John,Smith,Wolf
  456,Jane,Doe,Bear
  ```
