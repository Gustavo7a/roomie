export interface FilterState {
  majorSearch: string;
  minCompatibility: number;
  studySchedules: string[];
  selectedHobbies: string[];
  selectedLifeStyles: string[];
  selectedCleaningPrefs: string[];
}

export const DEFAULT_FILTER_STATE: FilterState = {
  majorSearch: '',
  minCompatibility: 0,
  studySchedules: [],
  selectedHobbies: [],
  selectedLifeStyles: [],
  selectedCleaningPrefs: [],
};
