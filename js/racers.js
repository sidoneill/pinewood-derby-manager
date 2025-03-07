let racers = [];

export function addRacer(name, carNumber) {
  // Validate input
  if (!name || !carNumber) return false;
  
  // Check for duplicate car numbers
  if (racers.some(racer => racer.carNumber === carNumber)) {
    return false;
  }
  
  // Add the racer
  racers.push({
    id: Date.now().toString(),
    name,
    carNumber,
    points: 0
  });
  
  return true;
}

export function getRacers() {
  return [...racers];
}

export function clearRacers() {
  racers = [];
}

export function updateRacerPoints(racerId, points) {
  const racer = racers.find(r => r.id === racerId);
  if (racer) {
    racer.points += points;
  }
}