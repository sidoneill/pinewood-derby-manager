import { addRacer, getRacers, clearRacers, loadRacers, importRacersFromCSV } from './racers.js';
import { 
  generateRaces, 
  getCurrentRace, 
  getAllRaces, 
  markRaceComplete, 
  loadRaces, 
  clearRaces, 
  areRacesLocked, 
  editRaceResults,
  areAllRegularRacesComplete,
  generateFinals,
  getFinals
} from './races.js';
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
    
    // Get selected race format
    const formatRadios = document.getElementsByName('race-format');
    let selectedFormat = 'all-lanes';
    
    for (const radio of formatRadios) {
      if (radio.checked) {
        selectedFormat = radio.value;
        break;
      }
    }
    
    if (generateRaces(selectedFormat)) {
      updateUI();
    } else {
      alert('Need at least 2 racers to generate races.');
    }
  });
  
  // Generate finals button
  const finalsButton = document.getElementById('generate-finals');
  if (finalsButton) {
    finalsButton.addEventListener('click', () => {
      if (generateFinals()) {
        updateUI();
      } else {
        alert('Unable to generate finals. Ensure you have at least 3 racers with completed races.');
      }
    });
  }
  
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
  
  // Show/hide finals container
  const finalsContainer = document.getElementById('finals-container');
  if (finalsContainer) {
    if (areAllRegularRacesComplete() && getFinals().length === 0) {
      finalsContainer.classList.remove('hidden');
    } else {
      finalsContainer.classList.add('hidden');
    }
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
    raceDiv.className = `race ${race.completed ? 'completed' : 'active'} ${race.isFinal ? 'finals-race' : ''}`;
    
    // Add racing info heading
    let heading = `<h3>${race.isFinal ? '<span class="finals-title">FINALS</span> ' : ''}Race #${race.number}</h3>`;
    
    // Add edit button for completed races
    if (race.completed) {
      heading += `<button class="edit-btn" data-race="${race.id}">Edit Results</button>`;
    }
    
    raceDiv.innerHTML = heading;
    
    // Create table for lanes
    const table = document.createElement('table');
    table.className = 'lanes-table';
    
    let tableHtml = `
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
    `;
    
    race.lanes.forEach(lane => {
      tableHtml += `
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
      `;
    });
    
    tableHtml += '</tbody>';
    table.innerHTML = tableHtml;
    raceDiv.appendChild(table);
    
    // Add results section for completed races
    if (race.completed) {
      const resultsDiv = document.createElement('div');
      resultsDiv.className = 'race-results';
      
      let resultsHtml = '<h4>Results:</h4><ol>';
      
      race.winners.forEach(lane => {
        const laneData = race.lanes.find(l => l.lane === lane);
        resultsHtml += `<li>Lane ${lane}: ${laneData.racer.name} (Car #${laneData.racer.carNumber})</li>`;
      });
      
      resultsHtml += '</ol>';
      resultsDiv.innerHTML = resultsHtml;
      raceDiv.appendChild(resultsDiv);
    }
    
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
  
  // Add event listeners for edit buttons
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', function() {
      const raceId = this.getAttribute('data-race');
      
      if (editRaceResults(raceId)) {
        // Recalculate results after changing race status
        calculateResults();
        updateUI();
      }
    });
  });
}

function updateResultsDisplay() {
  const resultsContainer = document.getElementById('results-container');
  const rankedRacers = calculateResults();
  const races = getAllRaces();
  const regularRaces = races.filter(race => !race.isFinal);
  const finalsRaces = races.filter(race => race.isFinal);
  const completedRegularRaces = regularRaces.filter(race => race.completed);
  const completedFinalsRaces = finalsRaces.filter(race => race.completed);
  
  if (completedRegularRaces.length === 0) {
    resultsContainer.innerHTML = '<p>No completed races yet.</p>';
    return;
  }
  
  // If finals are complete, show a special header
  let finalsHeader = '';
  if (completedFinalsRaces.length === finalsRaces.length && finalsRaces.length > 0) {
    // Get the final standings from the finals
    const finalsResults = [];
    
    // Get points just from finals races
    rankedRacers.forEach(racer => {
      finalsResults.push({
        ...racer,
        finalsPoints: 0
      });
    });
    
    // Calculate points from finals races
    completedFinalsRaces.forEach(race => {
      race.winners.forEach((laneNumber, position) => {
        const lane = race.lanes.find(l => l.lane === laneNumber);
        if (lane) {
          const points = 3 - position; // 3 for 1st, 2 for 2nd, 1 for 3rd
          const racer = finalsResults.find(r => r.id === lane.racer.id);
          if (racer) {
            racer.finalsPoints += points;
          }
        }
      });
    });
    
    // Sort by finals points
    finalsResults.sort((a, b) => b.finalsPoints - a.finalsPoints);
    
    // Display top 3
    finalsHeader = `
      <div class="finals-results">
        <h3 class="finals-title">Championship Finals Results</h3>
        <ol>
          <li>${finalsResults[0].name} (Car #${finalsResults[0].carNumber}) - CHAMPION</li>
          <li>${finalsResults[1].name} (Car #${finalsResults[1].carNumber}) - 2nd Place</li>
          <li>${finalsResults[2].name} (Car #${finalsResults[2].carNumber}) - 3rd Place</li>
        </ol>
      </div>
    `;
  }
  
  resultsContainer.innerHTML = finalsHeader + `
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
    <p><strong>Race Progress:</strong> ${completedRegularRaces.length}/${regularRaces.length} regular races completed${
      finalsRaces.length > 0 ? `, ${completedFinalsRaces.length}/${finalsRaces.length} finals races completed` : ''
    }</p>
  `;
}

// Helper function for ordinal numbers (1st, 2nd, 3rd, etc.)
function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}