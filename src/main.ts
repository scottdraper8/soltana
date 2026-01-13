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
import { initLazyImages } from './timeline/lazyImages';
import { getCurrentWeekNumber } from './utils/dates';

function init(): void {
  const currentWeek = getCurrentWeekNumber(weeks);

  loadViewMode();
  renderTimeline(weeks, currentWeek);
  initViewToggle();
  setCurrentWeekRow(currentWeek);
  initialScrollToCurrentWeek();
  initStickyHeader();
  initScrollNavButton();
  initLazyImages();
}

document.addEventListener('DOMContentLoaded', init);
