import './styles/main.scss';
import { weeks } from './data/weeks';
import { initStickyHeader } from './timeline/header';
import {
  initScrollNavButton,
  initialScrollToCurrentWeek,
  setCurrentWeekRow,
} from './timeline/navigation';
import { renderTimeline, loadViewMode } from './timeline/renderer';
import { initViewToggle } from './timeline/viewToggle';
import { getCurrentWeekNumber } from './utils/dates';

/**
 * Initializes the timeline application.
 */
function init(): void {
  const currentWeek = getCurrentWeekNumber(weeks);

  // Load saved view mode preference before rendering
  loadViewMode();

  // Initialize view toggle component
  initViewToggle();

  renderTimeline(weeks, currentWeek);
  setCurrentWeekRow(currentWeek);
  initialScrollToCurrentWeek();
  initStickyHeader();
  initScrollNavButton();
}

document.addEventListener('DOMContentLoaded', init);
