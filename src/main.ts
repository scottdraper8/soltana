import './styles/main.scss';
import { weeks } from './data/weeks';
import { initStickyHeader } from './timeline/header';
import {
  initScrollNavButton,
  initialScrollToCurrentWeek,
  setCurrentWeekRow,
} from './timeline/navigation';
import { renderTimeline } from './timeline/renderer';
import { getCurrentWeekNumber } from './utils/dates';

/**
 * Initializes the timeline application.
 */
function init(): void {
  const currentWeek = getCurrentWeekNumber(weeks);

  renderTimeline(weeks, currentWeek);
  setCurrentWeekRow(currentWeek);
  initialScrollToCurrentWeek();
  initStickyHeader();
  initScrollNavButton();
}

document.addEventListener('DOMContentLoaded', init);
