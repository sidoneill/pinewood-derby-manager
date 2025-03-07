import './style.css';
import { addRacer, getRacers, clearRacers } from './js/racers.js';
import { generateRaces, getCurrentRace, getCompletedRaces, markRaceComplete } from './js/races.js';
import { calculateResults } from './js/results.js';
import { setupUI, updateUI } from './js/ui.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  setupUI();
  updateUI();
});