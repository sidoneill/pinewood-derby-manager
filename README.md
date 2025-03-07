# Pinewood Derby Race Manager

A simple system for managing Pinewood Derby races with a 6-lane track.

## Features

- Add racers with numbered cars
- Import racers from a CSV file
- Choose between race formats (all lanes or 3 random lanes)
- Generate fair races based on selected format
- Edit results of completed races
- Run championship finals for top 3 racers
- Separate display view for audience/projector
- Races and results persist between page refreshes
- Results autosave after each race

## Race Formats

- **All Lanes**: Each racer races once in each lane of the track (6 lanes total)
- **3 Random Lanes**: Each racer races three times, with lanes randomly assigned

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

1. **Select Race Format**: Choose between "All Lanes" or "3 Random Lanes" format.
2. **Generate Races**: Click "Generate & Lock Races" to create a fair race schedule.
3. **Record Results**: For each race, click the "Select" buttons in order of finish to record the results.
4. **Edit Results**: If needed, click the "Edit Results" button on completed races to modify the results.
5. **Championship Finals**: After all regular races are complete, click "Generate Championship Finals" to run a final championship round for the top 3 racers.

### Display View

Click the "Open Display View" button to open a separate window designed for projection or a secondary display. This view shows:

- The current race
- The next race
- Current standings
- Results of the last completed race

The display view automatically refreshes to show the latest data.

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