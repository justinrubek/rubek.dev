import { writable, get as getFromStore } from 'svelte/store';

import type { CalendarAvailability } from './types';

export const contextKey = {};
export const scheduleStore = writable<CalendarAvailability>({});
