import { getRacers } from './racers.js';

let races = [];
let currentRaceIndex = 0;

export function generateRaces() {
  const racers = getRacers();
  if (racers.length < 2) return false;
  
  races = [];
  currentRaceIndex = 0;
  
  // If we have 6 or fewer racers, we can do a simple rotation
  // Each racer needs to race in each lane
  const laneCount = 6;
  
  // Create a set of races where each racer runs in each lane
  for (let lane = 0; lane < laneCount; lane++) {
    if (lane < racers.length) {
      // For each starting position, create a race
      const race = {
        id: `race-${lane + 1}`,
        number: lane + 1,
        lanes: [],
        completed: false,
        winners: []
      };
      
      // Assign racers to lanes with a rotation pattern
      for (let i = 0; i < racers.length; i++) {
        const lanePosition = (lane + i) % racers.length;
        race.lanes.push({
          lane: i + 1,
          racer: racers[lanePosition]
        });
      }
      
      races.push(race);
    }
  }
  
  return races.length > 0;
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

export function markRaceComplete(raceId, winningPositions) {
  const race = races.find(r => r.id === raceId);
  if (!race) return false;
  
  race.completed = true;
  race.winners = winningPositions;
  currentRaceIndex++;
  
  return true;
}