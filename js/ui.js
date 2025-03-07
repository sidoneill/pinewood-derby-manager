import { addRacer, getRacers, clearRacers, loadRacers, importRacersFromCSV } from './racers.js';
import { generateRaces, getCurrentRace, getAllRaces, markRaceComplete, loadRaces, clearRaces, areRacesLocked } from './races.js';
import { calculateResults, clearResults } from './results.js';

export function setupUI() {
  // Add racer button
  document.getElementById('add-racer').addEventListener('click', () => {
    const firstNameInput = document.getElementById('racer-firstname');
    const lastNameInput = document.getElementById('racer-lastname');
    const carInput = document.getElementById('car-number');
    const denInput = document.getElementById('den');
    
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const carNumber = parseInt(carInput.value);
    const den = denInput.value.trim();
    
    if (addRacer(firstName, lastName, carNumber, den)) {
      firstNameInput.value = '';
      lastNameInput.value = '';
      carInput.value = '';
      denInput.value = '';
      updateUI();
    } else {
      alert('Please enter a valid name and a unique car number.');
    }
  });
  
  // CSV Import button
  document.getElementById('import-csv').addEventListener('click', () => {
    const fileInput = document.getElementById('csv-file');
    const file = fileInput.files[0];
    
    if (!file) {
      alert('Please select a CSV file to import.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      const csvContent = e.target.result;
      if (importRacersFromCSV(csvContent)) {
        fileInput.value = '';
        updateUI();
        alert('Racers imported successfully!');
      } else {
        alert('Failed to import racers. Please check your CSV format.');
      }
    };
    reader.readAsText(file);
  });
  
  // Generate races button
  document.getElementById('generate-races').addEventListener('click', () => {
    if (areRacesLocked()) {
      const confirm = window.confirm('Races have already been generated and locked. Are you sure you want to regenerate them? This will clear all existing race results.');
      if (!confirm) return;
      clearRaces();
      clearResults();
    }
    
    if (generateRaces()) {
      updateUI();
    } else {
      alert('Need at least 2 racers to generate races.');
    }
  });
  
  // Clear storage button
  document.getElementById('clear-storage').addEventListener('click', () => {
    const confirm = window.confirm('Are you sure you want to clear all data? This will delete all racers, races, and results.');
    if (!confirm) return;
    
    clearRacers();
    clearRaces();
    clearResults();
    updateUI();
  });
}

export function updateUI() {
  updateRacersList();
  updateRacesDisplay();
  updateResultsDisplay();
  
  // Enable/disable generate races button
  const racers = getRacers();
  const generateButton = document.getElementById('generate-races');
  generateButton.disabled = racers.length < 2;
  
  // Update button text based on race lock status
  if (areRacesLocked()) {
    generateButton.textContent = 'Regenerate Races';
  } else {
    generateButton.textContent = 'Generate & Lock Races';
  }
}

function updateRacersList() {
  const racersList = document.getElementById('racers-list');
  const racers = getRacers();
  
  racersList.innerHTML = '';
  
  if (racers.length === 0) {
    racersList.innerHTML = '<p>No racers added yet.</p>';
    return;
  }
  
  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Car #</th>
        <th>Name</th>
        <th>Den</th>
      </tr>
    </thead>
    <tbody>
      ${racers.map(racer => `
        <tr>
          <td>${racer.carNumber}</td>
          <td>${racer.name}</td>
          <td>${racer.den || ''}</td>
        </tr>
      `).join('')}
    </tbody>
  `;
  
  racersList.appendChild(table);
}

function updateRacesDisplay() {
  const racesContainer = document.getElementById('races-container');
  const races = getAllRaces();
  
  racesContainer.innerHTML = '';
  
  if (races.length === 0) {
    racesContainer.innerHTML = '<p>Generate races to begin.</p>';
    return;
  }
  
  races.forEach(race => {
    const raceDiv = document.createElement('div');
    raceDiv.className = `race ${race.completed ? 'completed' : 'active'}`;
    
    raceDiv.innerHTML = `
      <h3>Race #${race.number}</h3>
      <table class="lanes-table">
        <thead>
          <tr>
            <th>Lane</th>
            <th>Racer</th>
            <th>Car #</th>
            <th>Den</th>
            ${!race.completed ? '<th>Select Winners</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${race.lanes.map(lane => `
            <tr>
              <td>${lane.lane}</td>
              <td>${lane.racer.name}</td>
              <td>${lane.racer.carNumber}</td>
              <td>${lane.racer.den || ''}</td>
              ${!race.completed ? `
                <td>
                  <button class="place-btn" data-race="${race.id}" data-lane="${lane.lane}">
                    Select
                  </button>
                </td>
              ` : ''}
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${race.completed ? `
        <div class="race-results">
          <h4>Results:</h4>
          <ol>
            ${race.winners.map(lane => {
              const laneData = race.lanes.find(l => l.lane === lane);
              return `<li>Lane ${lane}: ${laneData.racer.name} (Car #${laneData.racer.carNumber})</li>`;
            }).join('')}
          </ol>
        </div>
      ` : ''}
    `;
    
    racesContainer.appendChild(raceDiv);
  });
  
  // Add event listeners for place selection buttons
  document.querySelectorAll('.place-btn').forEach(button => {
    button.addEventListener('click', function() {
      const raceId = this.getAttribute('data-race');
      const lane = parseInt(this.getAttribute('data-lane'));
      
      // Find the race
      const race = races.find(r => r.id === raceId);
      if (!race || race.completed) return;
      
      // If this is the first selection, initialize winners array
      if (!race.winners) race.winners = [];
      
      // Add this lane to winners if not already selected
      if (!race.winners.includes(lane)) {
        race.winners.push(lane);
        
        // Update the button to show the place
        this.textContent = `${ordinal(race.winners.length)}`;
        this.disabled = true;
        
        // If all lanes have been assigned places, mark the race as complete
        if (race.winners.length === race.lanes.length) {
          markRaceComplete(raceId, race.winners);
          // Recalculate results after race completion (autosave)
          calculateResults();
          updateUI();
        }
      }
    });
  });
}

function updateResultsDisplay() {
  const resultsContainer = document.getElementById('results-container');
  const rankedRacers = calculateResults();
  const races = getAllRaces();
  const completedRaces = races.filter(race => race.completed);
  
  if (completedRaces.length === 0) {
    resultsContainer.innerHTML = '<p>No completed races yet.</p>';
    return;
  }
  
  resultsContainer.innerHTML = `
    <h3>Current Standings</h3>
    <table class="results-table">
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
        ${rankedRacers.map((racer, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${racer.name}</td>
            <td>${racer.carNumber}</td>
            <td>${racer.den || ''}</td>
            <td>${racer.points}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <p><strong>Race Progress:</strong> ${completedRaces.length}/${races.length} races completed</p>
  `;
}

// Helper function for ordinal numbers (1st, 2nd, 3rd, etc.)
function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}