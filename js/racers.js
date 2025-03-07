// Local storage key
const RACERS_STORAGE_KEY = 'pinewood_derby_racers';

// Initialize racers from localStorage or empty array
let racers = [];

// Load racers from localStorage
export function loadRacers() {
  const savedRacers = localStorage.getItem(RACERS_STORAGE_KEY);
  if (savedRacers) {
    racers = JSON.parse(savedRacers);
  }
  return racers;
}

// Save racers to localStorage
function saveRacers() {
  localStorage.setItem(RACERS_STORAGE_KEY, JSON.stringify(racers));
}

export function addRacer(firstName, lastName, carNumber, den) {
  // Validate input
  if (!firstName || !carNumber) return false;
  
  // Check for duplicate car numbers
  if (racers.some(racer => racer.carNumber === carNumber)) {
    return false;
  }
  
  // Add the racer
  racers.push({
    id: Date.now().toString(),
    firstName,
    lastName: lastName || '',
    name: `${firstName} ${lastName || ''}`.trim(),
    carNumber,
    den: den || '',
    points: 0
  });
  
  // Save to localStorage
  saveRacers();
  
  return true;
}

export function importRacersFromCSV(csvData) {
  // Parse CSV data
  const lines = csvData.split('\n');
  if (lines.length <= 1) return false; // Empty or only header
  
  const newRacers = [];
  let success = false;
  
  // Skip header row, process each line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    // Parse CSV row (handles quoted values)
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    if (values.length < 3) continue; // Need at least car#, firstName, lastName
    
    // Clean up values (remove quotes)
    const cleanValues = values.map(v => v.replace(/^"(.*)"$/, '$1').trim());
    
    const [carNumberStr, firstName, lastName, den] = cleanValues;
    const carNumber = parseInt(carNumberStr);
    
    if (!isNaN(carNumber) && firstName) {
      // Don't add if car number already exists
      if (!racers.some(r => r.carNumber === carNumber)) {
        newRacers.push({
          id: `csv-${Date.now()}-${i}`,
          firstName,
          lastName: lastName || '',
          name: `${firstName} ${lastName || ''}`.trim(),
          carNumber,
          den: den || '',
          points: 0
        });
        success = true;
      }
    }
  }
  
  if (success) {
    racers = [...racers, ...newRacers];
    saveRacers();
  }
  
  return success;
}

export function getRacers() {
  return [...racers];
}

export function clearRacers() {
  racers = [];
  saveRacers();
}

export function updateRacerPoints(racerId, points) {
  const racer = racers.find(r => r.id === racerId);
  if (racer) {
    racer.points += points;
    saveRacers();
  }
}

// Reset all racer points
export function resetRacerPoints() {
  racers.forEach(racer => {
    racer.points = 0;
  });
  saveRacers();
}