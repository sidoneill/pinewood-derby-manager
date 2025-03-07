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
    container.innerHTML = '<div class="no-data">Current race is completed</div>';
    return;
  }

  let html = `
    <div class="race-info">${currentRace.isFinal ? '<span class="finals-title">FINALS</span> ' : ''}Race #${currentRace.number}</div>
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

// Function to update the next race display
function updateNextRaceDisplay(races, currentRaceIndex) {
  const container = document.getElementById('next-race-container');
  
  if (races.length === 0) {
    container.innerHTML = '<div class="no-data">No races scheduled</div>';
    return;
  }

  // Find the next race that isn't completed
  let nextRaceIndex = -1;
  for (let i = currentRaceIndex + 1; i < races.length; i++) {
    if (!races[i].completed) {
      nextRaceIndex = i;
      break;
    }
  }

  // If no next race found, check if current race is completed
  // and look for the first uncompleted race
  if (nextRaceIndex === -1) {
    if (currentRaceIndex < races.length && races[currentRaceIndex].completed) {
      for (let i = 0; i < races.length; i++) {
        if (!races[i].completed) {
          nextRaceIndex = i;
          break;
        }
      }
    }
  }

  // If still no next race found, all races are completed
  if (nextRaceIndex === -1) {
    container.innerHTML = '<div class="no-data">All races are completed</div>';
    return;
  }

  const nextRace = races[nextRaceIndex];

  let html = `
    <div class="race-info">${nextRace.isFinal ? '<span class="finals-title">FINALS</span> ' : ''}Race #${nextRace.number}</div>
  `;

  nextRace.lanes.forEach(lane => {
    html += `
      <div class="lane next-lane">
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
function updateLastRaceDisplay(races, currentRaceIndex) {
  const container = document.getElementById('last-race-container');
  
  // Find the last completed race (prioritize the one right before current)
  let lastCompletedRace = null;
  
  // First check if there's a completed race right before current
  if (currentRaceIndex > 0 && races[currentRaceIndex - 1].completed) {
    lastCompletedRace = races[currentRaceIndex - 1];
  } else {
    // Otherwise, find the last completed race in the entire array
    lastCompletedRace = [...races].filter(race => race.completed).pop();
  }
  
  if (!lastCompletedRace) {
    container.innerHTML = '<div class="no-data">No completed races yet</div>';
    return;
  }

  let html = `
    <div class="race-info">${lastCompletedRace.isFinal ? '<span class="finals-title">FINALS</span> ' : ''}Race #${lastCompletedRace.number} Results</div>
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
  updateNextRaceDisplay(data.races, data.currentRaceIndex);
  updateStandingsDisplay(data.racers);
  updateLastRaceDisplay(data.races, data.currentRaceIndex);
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