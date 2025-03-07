// Constants for local storage keys
const RACES_STORAGE_KEY = 'pinewood_derby_races';
const RACERS_STORAGE_KEY = 'pinewood_derby_racers';
const RESULTS_STORAGE_KEY = 'pinewood_derby_results';
const RACE_FORMAT_KEY = 'pinewood_derby_race_format';

// Function to load data from localStorage
function loadData() {
  let races = [];
  let racers = [];
  let results = null;
  let raceFormat = 'all-lanes';

  // Get races data
  const savedRaces = localStorage.getItem(RACES_STORAGE_KEY);
  if (savedRaces) {
    races = JSON.parse(savedRaces);
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
  
  // Get race format
  const savedFormat = localStorage.getItem(RACE_FORMAT_KEY);
  if (savedFormat) {
    raceFormat = savedFormat;
  }

  return { races, racers, results, raceFormat };
}

// Function to update the final standings section
function updateFinalStandings(racers, hasFinals) {
  const container = document.getElementById('final-standings-container');
  
  if (racers.length === 0) {
    container.innerHTML = '<p>No racer data available.</p>';
    return;
  }

  // Sort racers by points (descending)
  const sortedRacers = [...racers].sort((a, b) => b.points - a.points);

  let html = `
    <table class="standings-table final-standings">
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

// Function to update the finals races section
function updateFinalsSection(races) {
  const container = document.getElementById('finals-section');
  const finalsContainer = document.getElementById('finals-races-container');
  
  // Filter for finals races
  const finalsRaces = races.filter(race => race.isFinal);
  
  if (finalsRaces.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  
  let html = '';
  
  // Generate finals results if all finals are completed
  if (finalsRaces.every(race => race.completed)) {
    // Calculate finals-specific points
    const finalistsWithPoints = [];
    
    // Identify finalists
    const finalists = new Set();
    finalsRaces.forEach(race => {
      race.lanes.forEach(lane => {
        finalists.add(lane.racer.id);
      });
    });
    
    // Create finalists array with points initialized to 0
    finalists.forEach(finalistId => {
      const racer = races[0].lanes.find(lane => lane.racer.id === finalistId)?.racer;
      if (racer) {
        finalistsWithPoints.push({
          ...racer,
          finalsPoints: 0
        });
      }
    });
    
    // Calculate points from finals races
    finalsRaces.forEach(race => {
      race.winners.forEach((laneNumber, position) => {
        const lane = race.lanes.find(l => l.lane === laneNumber);
        if (lane) {
          const points = 3 - position; // 3 for 1st, 2 for 2nd, 1 for 3rd
          const finalist = finalistsWithPoints.find(f => f.id === lane.racer.id);
          if (finalist) {
            finalist.finalsPoints += points;
          }
        }
      });
    });
    
    // Sort by finals points
    finalistsWithPoints.sort((a, b) => b.finalsPoints - a.finalsPoints);
    
    // Display championship results
    html += `
      <div class="championship-results">
        <h3>Championship Results</h3>
        <table class="standings-table final-standings">
          <thead>
            <tr>
              <th>Position</th>
              <th>Name</th>
              <th>Car #</th>
              <th>Den</th>
              <th>Finals Points</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    finalistsWithPoints.forEach((finalist, index) => {
      let position = '';
      if (index === 0) position = 'Champion';
      else if (index === 1) position = '2nd Place';
      else if (index === 2) position = '3rd Place';
      
      html += `
        <tr>
          <td>${position || (index + 1)}</td>
          <td>${finalist.name}</td>
          <td>${finalist.carNumber}</td>
          <td>${finalist.den || ''}</td>
          <td>${finalist.finalsPoints}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
  }
  
  // Display individual finals races
  html += '<h3>Finals Race Results</h3>';
  
  finalsRaces.forEach(race => {
    html += `
      <div class="race-group">
        <h4>Finals Race #${race.number} ${race.completed ? '' : '(Not Completed)'}</h4>
    `;
    
    if (race.completed) {
      html += `
        <table class="race-results-table">
          <thead>
            <tr>
              <th>Position</th>
              <th>Lane</th>
              <th>Racer</th>
              <th>Car #</th>
              <th>Den</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      race.winners.forEach((laneNumber, position) => {
        const lane = race.lanes.find(l => l.lane === laneNumber);
        html += `
          <tr>
            <td>${position + 1}</td>
            <td>${lane.lane}</td>
            <td>${lane.racer.name}</td>
            <td>${lane.racer.carNumber}</td>
            <td>${lane.racer.den || ''}</td>
          </tr>
        `;
      });
      
      html += `
          </tbody>
        </table>
      `;
    } else {
      html += `<p>This race has not been completed.</p>`;
    }
    
    html += `</div>`;
  });
  
  finalsContainer.innerHTML = html;
}

// Function to update the race results section
function updateRaceResults(races, raceFormat) {
  const container = document.getElementById('race-results-container');
  
  // Filter for regular (non-finals) races
  const regularRaces = races.filter(race => !race.isFinal);
  
  if (regularRaces.length === 0) {
    container.innerHTML = '<p>No race data available.</p>';
    return;
  }

  let formatDisplay = raceFormat === 'all-lanes' ? 'All Lanes Format' : '3 Random Lanes Format';
  
  let html = `<p class="race-format-info">Race format: ${formatDisplay}</p>`;
  
  const completedRaces = regularRaces.filter(race => race.completed);
  const incompleteRaces = regularRaces.filter(race => !race.completed);
  
  // Show completed races
  html += `<h3>Completed Races (${completedRaces.length}/${regularRaces.length})</h3>`;
  
  if (completedRaces.length === 0) {
    html += '<p>No completed races yet.</p>';
  } else {
    completedRaces.forEach(race => {
      html += `
        <div class="race-group">
          <h4>Race #${race.number}</h4>
          <table class="race-results-table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Lane</th>
                <th>Racer</th>
                <th>Car #</th>
                <th>Den</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      race.winners.forEach((laneNumber, position) => {
        const lane = race.lanes.find(l => l.lane === laneNumber);
        html += `
          <tr>
            <td>${position + 1}</td>
            <td>${lane.lane}</td>
            <td>${lane.racer.name}</td>
            <td>${lane.racer.carNumber}</td>
            <td>${lane.racer.den || ''}</td>
          </tr>
        `;
      });
      
      html += `
            </tbody>
          </table>
        </div>
      `;
    });
  }
  
  // Show incomplete races
  if (incompleteRaces.length > 0) {
    html += `<h3>Incomplete Races (${incompleteRaces.length})</h3>`;
    
    incompleteRaces.forEach(race => {
      html += `
        <div class="race-group">
          <h4>Race #${race.number}</h4>
          <table class="race-results-table">
            <thead>
              <tr>
                <th>Lane</th>
                <th>Racer</th>
                <th>Car #</th>
                <th>Den</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      race.lanes.sort((a, b) => a.lane - b.lane).forEach(lane => {
        html += `
          <tr>
            <td>${lane.lane}</td>
            <td>${lane.racer.name}</td>
            <td>${lane.racer.carNumber}</td>
            <td>${lane.racer.den || ''}</td>
          </tr>
        `;
      });
      
      html += `
            </tbody>
          </table>
        </div>
      `;
    });
  }

  container.innerHTML = html;
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Set the current date
  const currentDateElement = document.getElementById('current-date');
  const generationTimeElement = document.getElementById('generation-time');
  
  const now = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
  
  currentDateElement.textContent = now.toLocaleDateString(undefined, dateOptions);
  generationTimeElement.textContent = now.toLocaleString(undefined, {...dateOptions, ...timeOptions});
  
  // Load data
  const data = loadData();
  
  // Update sections
  updateFinalStandings(data.racers, data.races.some(race => race.isFinal));
  updateFinalsSection(data.races);
  updateRaceResults(data.races, data.raceFormat);
});
