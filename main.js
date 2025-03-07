import './style.css';
import { loadRacers } from './js/racers.js';
import { loadRaces } from './js/races.js';
import { calculateResults } from './js/results.js';
import { setupUI, updateUI } from './js/ui.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Load data from localStorage
  loadRacers();
  loadRaces();
  calculateResults();
  
  // Set up UI event handlers
  setupUI();
  
  // Update the UI with loaded data
  updateUI();
});