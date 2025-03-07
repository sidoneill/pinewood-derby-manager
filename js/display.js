// Constants for local storage keys
const RACES_STORAGE_KEY = 'pinewood_derby_races';
const CURRENT_RACE_INDEX_KEY = 'pinewood_derby_current_race';
const RACERS_STORAGE_KEY = 'pinewood_derby_racers';
const RESULTS_STORAGE_KEY = 'pinewood_derby_results';

// Function to load data from localStorage
function loadData() {
  let races = [];
  let currentRaceIndex = 0;
  let racers = [];
  let results = null;

  // Get races data
  const savedRaces = localStorage.getItem(RACES_STORAGE_KEY);
  if (savedRaces) {
    races = JSON.parse(savedRaces);
  }

  // Get current race index
  const savedCurrentRaceIndex = localStorage.getItem(CURRENT_RACE_INDEX_KEY);
  if (savedCurrentRaceIndex !== null) {
    currentRaceIndex = parseInt(savedCurrentRaceIndex);
  }

  // Get racers data
  const savedRacers = localStorage.getItem(RACERS_STORAGE_KEY);
  if (savedRacers) {
    racers = JSON.parse(savedRacers);
  }

  // Get results data
  const savedResults = localStorage.getItem(RESULTS_STORAGE_KEY);
  if (savedResults) {
    results = JSON.parse(savedResults);
  }

  return { races, currentRaceIndex, racers, results };
}

// Function to update the current race display
function updateCurrentRaceDisplay(races, currentRaceIndex) {
  const container = document.getElementById('current-race-container');
  
  if (races.length === 0 || currentRaceIndex >= races.length) {
    container.innerHTML = '<div class="no-data">No race in progress</div>';
    return;
  }

  const currentRace = races[currentRaceIndex];
  
  if (currentRace.completed) {
    container.innerHTML = '<div class="no-data">All races completed</div>';
    return;
  }

  let html = `
    <div class="race-info">Race #${currentRace.number}</div>
  `;

  currentRace.lanes.forEach(lane => {
    html += `
      <div class="lane">
        <div class="lane-number">${lane.lane}</div>
        <div class="racer-info">
          <div class="racer-name">${lane.racer.name}</div>
          <div class="car-number">Car #${lane.racer.carNumber}</div>
          ${lane.racer.den ? `<div class="den-info">Den: ${lane.racer.den}</div>` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Function to update the standings display
function updateStandingsDisplay(racers) {
  const container = document.getElementById('standings-container');
  
  if (racers.length === 0) {
    container.innerHTML = '<div class="no-data">No racers available</div>';
    return;
  }

  // Sort racers by points (descending)
  const sortedRacers = [...racers].sort((a, b) => b.points - a.points);

  let html = `
    <table class="standings-table">
      <thead>
        <tr>
          <th>Position</th>
          <th>Name</th>
          <th>Car #</th>
          <th>Den</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
  `;

  sortedRacers.forEach((racer, index) => {
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${racer.name}</td>
        <td>${racer.carNumber}</td>
        <td>${racer.den || ''}</td>
        <td>${racer.points}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

// Function to update the last race results display
function updateLastRaceDisplay(races) {
  const container = document.getElementById('last-race-container');
  
  // Find the last completed race
  const lastCompletedRace = [...races].filter(race => race.completed).pop();
  
  if (!lastCompletedRace) {
    container.innerHTML = '<div class="no-data">No completed races yet</div>';
    return;
  }

  let html = `
    <div class="race-info">Race #${lastCompletedRace.number} Results</div>
  `;

  lastCompletedRace.winners.forEach((laneNumber, index) => {
    const lane = lastCompletedRace.lanes.find(l => l.lane === laneNumber);
    if (lane) {
      html += `
        <div class="last-race-result">
          <div class="place place-${index + 1}">${index + 1}</div>
          <div class="racer-info">
            <div class="racer-name">${lane.racer.name}</div>
            <div class="car-number">Car #${lane.racer.carNumber}</div>
            ${lane.racer.den ? `<div class="den-info">Den: ${lane.racer.den}</div>` : ''}
          </div>
        </div>
      `;
    }
  });

  container.innerHTML = html;
}

// Main function to update all display elements
function updateDisplay() {
  const data = loadData();
  
  updateCurrentRaceDisplay(data.races, data.currentRaceIndex);
  updateStandingsDisplay(data.racers);
  updateLastRaceDisplay(data.races);
}

// Initialize the display
document.addEventListener('DOMContentLoaded', () => {
  // Update display initially
  updateDisplay();
  
  // Set up auto-refresh
  setInterval(updateDisplay, 5000); // Refresh every 5 seconds
});

// Listen for storage events (when data is changed in another tab)
window.addEventListener('storage', (event) => {
  if ([RACES_STORAGE_KEY, CURRENT_RACE_INDEX_KEY, RACERS_STORAGE_KEY, RESULTS_STORAGE_KEY].includes(event.key)) {
    updateDisplay();
  }
});