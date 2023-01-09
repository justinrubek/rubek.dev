import { writable, get as getFromStore } from 'svelte/store';

import type { CalendarAvailability, Day, TimeRange } from './types';

export const contextKey = {};
export const dateContextKey = {};

export interface ScheduleStore {
    // general store functions
    subscribe: any;
    set: any;
    update: any;
    
    // data
    availability: CalendarAvailability;

    // functions
    getState: () => any;
    updateAvailability: (availability: CalendarAvailability) => void;
    getDayAvailability: (date: Date) => Day;
}

function timeslots(avail: CalendarAvailability, date: Date): Array<TimeRange> {
    console.log('getDayAvailability', date);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    console.log('getDayAvailability', year, month, day);
    const { availability } = this.getState();
    console.log('getDayAvailability', availability);
    return availability[year][month][day];
}


const defaultState = {
    availability: {},
};

export const get = ({
    availability,
} = defaultState): ScheduleStore => {
	const { subscribe, set, update } = writable({
        availability,
        timeslots: [],
    });

    return {
        subscribe,
        set,
        update,
        availability,
		getState() {
			return getFromStore({ subscribe });
		},
        updateAvailability: (availability: CalendarAvailability) => {
            update((state) => {
                return { ...state, availability };
            });
        },
        getDayAvailability: (date: Date) => {
            console.log('getDayAvailability', date);
            const year = date.getFullYear();
            const month = date.getMonth();
            const day = date.getDate();
            console.log('getDayAvailability', year, month, day);
            const { availability } = this.getState();
            console.log('getDayAvailability', availability);
            return availability[year][month][day];
        },
    };
};

export default {
    get
};
