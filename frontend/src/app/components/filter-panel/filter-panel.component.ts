import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DEFAULT_FILTER_STATE, FilterState } from '../../models/filter-state';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterPanelComponent implements OnChanges {
  @Input() availableMajors: string[] = [];
  @Input() availableStudySchedules: string[] = [];
  @Input() availableHobbies: string[] = [];
  @Input() availableLifeStyles: string[] = [];
  @Input() availableCleaningPrefs: string[] = [];
  @Input() filters: FilterState = { ...DEFAULT_FILTER_STATE };

  @Output() filtersChange = new EventEmitter<FilterState>();
  @Output() close = new EventEmitter<void>();

  local: FilterState = { ...DEFAULT_FILTER_STATE };

  readonly compatibilityOptions = [
    { label: 'Qualquer', value: 0 },
    { label: '\u2265 25%', value: 25 },
    { label: '\u2265 50%', value: 50 },
    { label: '\u2265 75%', value: 75 },
  ];

  readonly MAJORS_LIMIT = 5;
  showAllMajors = false;

  get visibleMajors(): string[] {
    return this.showAllMajors
      ? this.availableMajors
      : this.availableMajors.slice(0, this.MAJORS_LIMIT);
  }

  get hiddenMajorsCount(): number {
    return Math.max(0, this.availableMajors.length - this.MAJORS_LIMIT);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters']) {
      this.local = {
        ...this.filters,
        studySchedules: [...this.filters.studySchedules],
        selectedHobbies: [...this.filters.selectedHobbies],
        selectedLifeStyles: [...this.filters.selectedLifeStyles],
        selectedCleaningPrefs: [...this.filters.selectedCleaningPrefs],
      };
    }
  }

  get hasActiveFilters(): boolean {
    return (
      this.local.majorSearch.trim() !== '' ||
      this.local.minCompatibility > 0 ||
      this.local.studySchedules.length > 0 ||
      this.local.selectedHobbies.length > 0 ||
      this.local.selectedLifeStyles.length > 0 ||
      this.local.selectedCleaningPrefs.length > 0
    );
  }

  isSelected(
    category: 'studySchedules' | 'selectedHobbies' | 'selectedLifeStyles' | 'selectedCleaningPrefs',
    value: string
  ): boolean {
    return (this.local[category] as string[]).includes(value);
  }

  toggle(
    category: 'studySchedules' | 'selectedHobbies' | 'selectedLifeStyles' | 'selectedCleaningPrefs',
    value: string
  ): void {
    const arr = this.local[category] as string[];
    const idx = arr.indexOf(value);
    (this.local[category] as string[]) = idx >= 0 ? arr.filter(v => v !== value) : [...arr, value];
    this.emit();
  }

  onMajorChange(value: string): void {
    this.local.majorSearch = value;
    this.emit();
  }

  onCompatibilityChange(value: number): void {
    this.local.minCompatibility = value;
    this.emit();
  }

  clearFilters(): void {
    this.local = {
      majorSearch: '',
      minCompatibility: 0,
      studySchedules: [],
      selectedHobbies: [],
      selectedLifeStyles: [],
      selectedCleaningPrefs: [],
    };
    this.emit();
  }

  private emit(): void {
    this.filtersChange.emit({
      majorSearch: this.local.majorSearch,
      minCompatibility: this.local.minCompatibility,
      studySchedules: [...this.local.studySchedules],
      selectedHobbies: [...this.local.selectedHobbies],
      selectedLifeStyles: [...this.local.selectedLifeStyles],
      selectedCleaningPrefs: [...this.local.selectedCleaningPrefs],
    });
  }
}
