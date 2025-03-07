import { getRacers } from './racers.js';

// Local storage keys
const RACES_STORAGE_KEY = 'pinewood_derby_races';
const CURRENT_RACE_INDEX_KEY = 'pinewood_derby_current_race';

// Initialize data from localStorage or defaults
let races = [];
let currentRaceIndex = 0;
let racesLocked = false;

// Load races from localStorage
export function loadRaces() {
  const savedRaces = localStorage.getItem(RACES_STORAGE_KEY);
  if (savedRaces) {
    races = JSON.parse(savedRaces);
    racesLocked = true;
  }
  
  const savedCurrentRaceIndex = localStorage.getItem(CURRENT_RACE_INDEX_KEY);
  if (savedCurrentRaceIndex !== null) {
    currentRaceIndex = parseInt(savedCurrentRaceIndex);
  }
  
  return races;
}

// Save races to localStorage
function saveRaces() {
  localStorage.setItem(RACES_STORAGE_KEY, JSON.stringify(races));
  localStorage.setItem(CURRENT_RACE_INDEX_KEY, currentRaceIndex.toString());
}

export function generateRaces() {
  const racers = getRacers();
  if (racers.length < 2) return false;
  
  // If races are already locked, don't regenerate
  if (racesLocked && races.length > 0) {
    return true;
  }
  
  races = [];
  currentRaceIndex = 0;
  
  const laneCount = 6; // 6-lane track
  
  // Ensure each racer races in each lane
  // For 6 or fewer racers, this is straightforward
  if (racers.length <= laneCount) {
    // Create one race for each lane
    for (let lane = 1; lane <= laneCount; lane++) {
      const race = {
        id: `race-${lane}`,
        number: lane,
        lanes: [],
        completed: false,
        winners: []
      };
      
      // In each race, assign racers to lanes with rotation
      for (let i = 0; i < racers.length; i++) {
        const racerIndex = (i + lane - 1) % racers.length;
        race.lanes.push({
          lane: i + 1,
          racer: racers[racerIndex]
        });
      }
      
      races.push(race);
    }
  } else {
    // More than 6 racers - we need multiple heats for each lane
    // Organize racers into groups so each racer races in each lane
    
    // First, determine how many races we need
    // With n racers, and 6 lanes, each racer needs 6 races (one per lane)
    // Total number of "racer slots" is n * 6
    // Each race has 6 slots, so we need (n * 6) / 6 = n races minimum
    
    const totalRaces = racers.length;
    
    // Create all races first
    for (let raceNum = 1; raceNum <= totalRaces; raceNum++) {
      races.push({
        id: `race-${raceNum}`,
        number: raceNum,
        lanes: [],
        completed: false,
        winners: []
      });
    }
    
    // Now assign racers to lanes in each race
    for (let racerIndex = 0; racerIndex < racers.length; racerIndex++) {
      const racer = racers[racerIndex];
      
      // For each lane (1-6), assign this racer to a different race
      for (let lane = 1; lane <= laneCount; lane++) {
        // Calculate which race this racer should be in for this lane
        // Using a formula that distributes racers evenly across all races
        const raceIndex = (racerIndex + lane - 1) % races.length;
        
        // Add racer to this race in this lane
        races[raceIndex].lanes.push({
          lane: lane,
          racer: racer
        });
      }
    }
    
    // Sort lanes within each race by lane number
    races.forEach(race => {
      race.lanes.sort((a, b) => a.lane - b.lane);
    });
  }
  
  // Mark races as locked and save to localStorage
  racesLocked = true;
  saveRaces();
  
  return true;
}

export function getCurrentRace() {
  return currentRaceIndex < races.length ? races[currentRaceIndex] : null;
}

export function getCompletedRaces() {
  return races.filter(race => race.completed);
}

export function getAllRaces() {
  return [...races];
}

export function areRacesLocked() {
  return racesLocked;
}

export function markRaceComplete(raceId, winningPositions) {
  const race = races.find(r => r.id === raceId);
  if (!race) return false;
  
  race.completed = true;
  race.winners = winningPositions;
  
  // Find the next uncompleted race
  let nextRaceIndex = races.findIndex(r => !r.completed);
  if (nextRaceIndex === -1) {
    // All races completed
    nextRaceIndex = races.length;
  }
  
  currentRaceIndex = nextRaceIndex;
  
  // Save races to localStorage
  saveRaces();
  
  return true;
}

export function clearRaces() {
  races = [];
  currentRaceIndex = 0;
  racesLocked = false;
  
  // Clear from localStorage
  localStorage.removeItem(RACES_STORAGE_KEY);
  localStorage.removeItem(CURRENT_RACE_INDEX_KEY);
}