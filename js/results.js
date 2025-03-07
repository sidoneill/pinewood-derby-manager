import { getCompletedRaces } from './races.js';
import { getRacers, updateRacerPoints } from './racers.js';

export function calculateResults() {
  const completedRaces = getCompletedRaces();
  const racers = getRacers();
  
  // Reset points
  racers.forEach(racer => {
    racer.points = 0;
  });
  
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
  return racers.sort((a, b) => b.points - a.points);
}