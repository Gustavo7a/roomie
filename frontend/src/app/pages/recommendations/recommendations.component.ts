import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {RecommendationService} from '../../services/recommendation.service';
import {RoommateRecommendation} from '../../models/roommate-recommendation';
import {HeaderComponent} from '../../components/shared/header/header.component';
import {StudentCardComponent} from '../../components/student-card/student-card.component';
import {FilterPanelComponent} from '../../components/filter-panel/filter-panel.component';
import {DEFAULT_FILTER_STATE, FilterState} from '../../models/filter-state';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, HeaderComponent, StudentCardComponent, FilterPanelComponent],
  templateUrl: './recommendations.component.html',
  styleUrl: './recommendations.component.css',
})
export class RecommendationsComponent implements OnInit {
  private readonly recommendationService = inject(RecommendationService);
  private readonly router = inject(Router);

  /** Lista completa vinda da API (sem os ignorados) */
  allRecommendations: RoommateRecommendation[] = [];

  isLoading = true;
  errorMessage = '';
  needsHabits = false;

  /** Estado do painel de filtros */
  filterPanelOpen = false;
  filterState: FilterState = { ...DEFAULT_FILTER_STATE };

  /** Guarda temporariamente a última recomendação ignorada para permitir "Desfazer" */
  lastIgnored: RoommateRecommendation | null = null;

  ngOnInit(): void {
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.recommendationService.getFilteredRecommendations().subscribe({
      next: (data) => {
        this.allRecommendations = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 400) {
          this.needsHabits = true;
          this.errorMessage = '';
        } else if (err.status === 403) {
          this.errorMessage = 'Apenas estudantes podem ver recomendações de colegas.';
        } else {
          this.errorMessage = 'Erro ao carregar recomendações. Tente novamente.';
        }
      }
    });
  }

  // ─── Filtros ────────────────────────────────────────────────────────────────

  get filteredRecommendations(): RoommateRecommendation[] {
    const { majorSearch, minCompatibility, studySchedules, selectedHobbies, selectedLifeStyles, selectedCleaningPrefs } = this.filterState;
    const search = majorSearch.trim().toLowerCase();

    return this.allRecommendations.filter(rec => {
      if (search && !rec.major.toLowerCase().includes(search)) return false;
      if (rec.compatibilityPercentage < minCompatibility) return false;
      if (studySchedules.length > 0 && !studySchedules.includes(rec.studySchedule ?? '')) return false;
      if (selectedHobbies.length > 0 && !selectedHobbies.every(h => rec.hobbies.includes(h))) return false;
      if (selectedLifeStyles.length > 0 && !selectedLifeStyles.every(l => rec.lifeStyles.includes(l))) return false;
      if (selectedCleaningPrefs.length > 0 && !selectedCleaningPrefs.every(c => rec.cleaningPrefs.includes(c))) return false;
      return true;
    });
  }

  get availableMajors(): string[] {
    return [...new Set(this.allRecommendations.map(r => r.major))].sort();
  }

  get availableStudySchedules(): string[] {
    return [...new Set(this.allRecommendations.filter(r => r.studySchedule).map(r => r.studySchedule!))].sort();
  }

  get availableHobbies(): string[] {
    return [...new Set(this.allRecommendations.flatMap(r => r.hobbies))].sort();
  }

  get availableLifeStyles(): string[] {
    return [...new Set(this.allRecommendations.flatMap(r => r.lifeStyles))].sort();
  }

  get availableCleaningPrefs(): string[] {
    return [...new Set(this.allRecommendations.flatMap(r => r.cleaningPrefs))].sort();
  }

  get hasActiveFilters(): boolean {
    return (
      this.filterState.majorSearch.trim() !== '' ||
      this.filterState.minCompatibility > 0 ||
      this.filterState.studySchedules.length > 0 ||
      this.filterState.selectedHobbies.length > 0 ||
      this.filterState.selectedLifeStyles.length > 0 ||
      this.filterState.selectedCleaningPrefs.length > 0
    );
  }

  onFiltersChange(filters: FilterState): void {
    this.filterState = filters;
  }

  toggleFilterPanel(): void {
    this.filterPanelOpen = !this.filterPanelOpen;
  }

  // ─── Ignorar ────────────────────────────────────────────────────────────────

  ignoreRecommendation(rec: RoommateRecommendation): void {
    this.recommendationService.ignoreRecommendation(rec.studentId);
    this.allRecommendations = this.allRecommendations.filter(r => r.studentId !== rec.studentId);
    this.lastIgnored = rec;

    setTimeout(() => {
      if (this.lastIgnored?.studentId === rec.studentId) {
        this.lastIgnored = null;
      }
    }, 5000);
  }

  undoLastIgnore(): void {
    if (this.lastIgnored) {
      this.recommendationService.undoIgnore(this.lastIgnored.studentId);
      this.allRecommendations.push(this.lastIgnored);
      this.allRecommendations.sort((a, b) => b.compatibilityPercentage - a.compatibilityPercentage);
      this.lastIgnored = null;
    }
  }

  clearAllIgnored(): void {
    this.recommendationService.clearIgnored();
    this.loadRecommendations();
  }

  get ignoredCount(): number {
    return this.recommendationService.ignoredCount;
  }

  // ─── Navegação ──────────────────────────────────────────────────────────────

  goBack(): void {
    this.router.navigate(['/home']);
  }

  goToHabits(): void {
    this.router.navigate(['/habits']);
  }
}
