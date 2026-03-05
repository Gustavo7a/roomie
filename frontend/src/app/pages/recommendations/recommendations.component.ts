import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {RecommendationService} from '../../services/recommendation.service';
import {RoommateRecommendation} from '../../models/roommate-recommendation';
import {HeaderComponent} from '../../components/shared/header/header.component';
import {StudentCardComponent} from '../../components/student-card/student-card.component';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, HeaderComponent, StudentCardComponent],
  templateUrl: './recommendations.component.html',
  styleUrl: './recommendations.component.css',
})
export class RecommendationsComponent implements OnInit {
  private readonly recommendationService = inject(RecommendationService);
  private readonly router = inject(Router);

  recommendations: RoommateRecommendation[] = [];
  isLoading = true;
  errorMessage = '';
  needsHabits = false;

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
        this.recommendations = data;
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

  ignoreRecommendation(rec: RoommateRecommendation): void {
    this.recommendationService.ignoreRecommendation(rec.studentId);
    this.recommendations = this.recommendations.filter(r => r.studentId !== rec.studentId);
    this.lastIgnored = rec;

    // Esconde o toast de "Desfazer" após 5 segundos
    setTimeout(() => {
      if (this.lastIgnored?.studentId === rec.studentId) {
        this.lastIgnored = null;
      }
    }, 5000);
  }

  undoLastIgnore(): void {
    if (this.lastIgnored) {
      this.recommendationService.undoIgnore(this.lastIgnored.studentId);
      this.recommendations.push(this.lastIgnored);
      this.recommendations.sort((a, b) => b.compatibilityPercentage - a.compatibilityPercentage);
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

  goBack(): void {
    this.router.navigate(['/home']);
  }

  goToHabits(): void {
    this.router.navigate(['/habits']);
  }
}
