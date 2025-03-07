import { getRacers } from './racers.js';
import { calculateResults } from './results.js';

// Local storage keys
const RACES_STORAGE_KEY = 'pinewood_derby_races';
const CURRENT_RACE_INDEX_KEY = 'pinewood_derby_current_race';
const RACE_FORMAT_KEY = 'pinewood_derby_race_format';
const FINALS_KEY = 'pinewood_derby_finals';

// Initialize data from localStorage or defaults
let races = [];
let finalsRaces = [];
let currentRaceIndex = 0;
let racesLocked = false;
let raceFormat = 'all-lanes';

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
  
  const savedFormat = localStorage.getItem(RACE_FORMAT_KEY);
  if (savedFormat) {
    raceFormat = savedFormat;
  }
  
  const savedFinals = localStorage.getItem(FINALS_KEY);
  if (savedFinals) {
    finalsRaces = JSON.parse(savedFinals);
  }
  
  return races;
}

// Save races to localStorage
function saveRaces() {
  localStorage.setItem(RACES_STORAGE_KEY, JSON.stringify(races));
  localStorage.setItem(CURRENT_RACE_INDEX_KEY, currentRaceIndex.toString());
  localStorage.setItem(RACE_FORMAT_KEY, raceFormat);
  
  if (finalsRaces.length > 0) {
    localStorage.setItem(FINALS_KEY, JSON.stringify(finalsRaces));
  }
}

// Helper to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function generateRaces(format = 'all-lanes') {
  const racers = getRacers();
  if (racers.length < 2) return false;
  
  // If races are already locked, don't regenerate
  if (racesLocked && races.length > 0) {
    return true;
  }
  
  // Save the selected format
  raceFormat = format;
  
  races = [];
  finalsRaces = [];
  currentRaceIndex = 0;
  
  const laneCount = 6; // 6-lane track
  
  if (format === 'all-lanes') {
    // All Lanes format: Each racer races once in each lane
    generateAllLanesRaces(racers, laneCount);
  } else if (format === 'random-3') {
    // 3 Random Lanes format: Each racer races in 3 random lanes
    generate3RandomLanesRaces(racers, laneCount);
  }
  
  // Mark races as locked and save to localStorage
  racesLocked = true;
  saveRaces();
  
  return true;
}

// Generate races where each racer races once in each lane
function generateAllLanesRaces(racers, laneCount) {
  // If 6 or fewer racers, this is straightforward
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
}

// Generate races where each racer races in 3 random lanes
function generate3RandomLanesRaces(racers, laneCount) {
  // Create a tracking structure to ensure each racer gets 3 random lanes
  const racerAssignments = {};
  racers.forEach(racer => {
    racerAssignments[racer.id] = {
      racer: racer,
      assignedLanes: [],
      raceCount: 0
    };
  });
  
  // Determine how many races we need
  // For n racers, each racing 3 times, we need (n * 3) / 6 races (rounded up)
  const racesNeeded = Math.ceil(racers.length * 3 / laneCount);
  
  // Create race structures
  for (let raceNum = 1; raceNum <= racesNeeded; raceNum++) {
    races.push({
      id: `race-${raceNum}`,
      number: raceNum,
      lanes: [],
      completed: false,
      winners: []
    });
  }
  
  // Now assign racers to races and lanes
  let currentRaceIndex = 0;
  
  // Repeat until all racers have been assigned to 3 races
  while (Object.values(racerAssignments).some(ra => ra.raceCount < 3)) {
    // Get current race
    const race = races[currentRaceIndex];
    
    // Find racers who still need races and aren't already in this race
    const eligibleRacers = Object.values(racerAssignments)
      .filter(ra => ra.raceCount < 3 && !race.lanes.some(l => l.racer.id === ra.racer.id));
    
    // If no eligible racers or race is full, move to next race
    if (eligibleRacers.length === 0 || race.lanes.length >= laneCount) {
      currentRaceIndex = (currentRaceIndex + 1) % races.length;
      continue;
    }
    
    // Select a racer randomly from eligible racers
    const randomIndex = Math.floor(Math.random() * eligibleRacers.length);
    const selectedRacer = eligibleRacers[randomIndex];
    
    // Find available lanes for this race
    const usedLanes = race.lanes.map(l => l.lane);
    const availableLanes = Array.from({length: laneCount}, (_, i) => i + 1)
      .filter(lane => !usedLanes.includes(lane));
    
    // Find lanes this racer hasn't used yet
    const unusedLanes = availableLanes.filter(lane => !selectedRacer.assignedLanes.includes(lane));
    
    // If there are unused lanes, prefer those
    let selectedLane;
    if (unusedLanes.length > 0) {
      const randomLaneIndex = Math.floor(Math.random() * unusedLanes.length);
      selectedLane = unusedLanes[randomLaneIndex];
    } else {
      // Otherwise, just pick a random available lane
      const randomLaneIndex = Math.floor(Math.random() * availableLanes.length);
      selectedLane = availableLanes[randomLaneIndex];
    }
    
    // Add racer to race in selected lane
    race.lanes.push({
      lane: selectedLane,
      racer: selectedRacer.racer
    });
    
    // Update racer assignment
    selectedRacer.assignedLanes.push(selectedLane);
    selectedRacer.raceCount++;
    
    // Sort lanes within the race by lane number
    race.lanes.sort((a, b) => a.lane - b.lane);
  }
  
  // Remove any empty races
  races = races.filter(race => race.lanes.length > 0);
  
  // Renumber races
  races.forEach((race, index) => {
    race.number = index + 1;
    race.id = `race-${race.number}`;
  });
}

export function generateFinals() {
  // Calculate current results to get top 3 racers
  const results = calculateResults();
  if (results.length < 3) return false;
  
  const topThree = results.slice(0, 3);
  
  // Generate 3 finals races where each racer races once in each lane
  finalsRaces = [];
  
  // Create 3 races, one for each lane 1-3
  for (let lane = 1; lane <= 3; lane++) {
    const race = {
      id: `finals-${lane}`,
      number: lane,
      isFinal: true,
      lanes: [],
      completed: false,
      winners: []
    };
    
    // In each race, assign racers to lanes with rotation
    for (let i = 0; i < topThree.length; i++) {
      const racerIndex = (i + lane - 1) % topThree.length;
      race.lanes.push({
        lane: i + 1,
        racer: topThree[racerIndex]
      });
    }
    
    finalsRaces.push(race);
  }
  
  // Add finals races to regular races
  races = [...races, ...finalsRaces];
  
  // Save to localStorage
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

export function getFinals() {
  return races.filter(race => race.isFinal);
}

export function areRacesLocked() {
  return racesLocked;
}

export function areAllRegularRacesComplete() {
  const regularRaces = races.filter(race => !race.isFinal);
  return regularRaces.length > 0 && regularRaces.every(race => race.completed);
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

export function editRaceResults(raceId) {
  const race = races.find(r => r.id === raceId);
  if (!race) return false;
  
  race.completed = false;
  race.winners = [];
  
  // Set current race index to this race
  currentRaceIndex = races.findIndex(r => r.id === raceId);
  
  // Save races to localStorage
  saveRaces();
  
  return true;
}

export function clearRaces() {
  races = [];
  finalsRaces = [];
  currentRaceIndex = 0;
  racesLocked = false;
  
  // Clear from localStorage
  localStorage.removeItem(RACES_STORAGE_KEY);
  localStorage.removeItem(CURRENT_RACE_INDEX_KEY);
  localStorage.removeItem(RACE_FORMAT_KEY);
  localStorage.removeItem(FINALS_KEY);
}