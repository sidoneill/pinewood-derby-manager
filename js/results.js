import { getCompletedRaces } from './races.js';
import { getRacers, updateRacerPoints, resetRacerPoints } from './racers.js';

// Local storage key
const RESULTS_STORAGE_KEY = 'pinewood_derby_results';

// Calculate and store results
export function calculateResults() {
  const completedRaces = getCompletedRaces();
  const racers = getRacers();
  
  // Reset points
  resetRacerPoints();
  
  // Assign points based on finishing position
  // 1st place: 6 points, 2nd place: 5 points, etc.
  completedRaces.forEach(race => {
    race.winners.forEach((laneNumber, position) => {
      const lane = race.lanes.find(l => l.lane === laneNumber);
      if (lane) {
        // Points are inverse of position (6 for 1st, 5 for 2nd, etc.)
        const points = 6 - position;
        updateRacerPoints(lane.racer.id, points);
      }
    });
  });
  
  // Sort racers by points (descending)
  const sortedRacers = racers.sort((a, b) => b.points - a.points);
  
  // Save results to localStorage
  saveResults(sortedRacers);
  
  return sortedRacers;
}

// Save results to localStorage
function saveResults(results) {
  localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify({
    timestamp: new Date().toISOString(),
    results: results
  }));
}

// Load results from localStorage
export function loadResults() {
  const savedResults = localStorage.getItem(RESULTS_STORAGE_KEY);
  if (savedResults) {
    return JSON.parse(savedResults);
  }
  return null;
}

// Clear results from localStorage
export function clearResults() {
  localStorage.removeItem(RESULTS_STORAGE_KEY);
}