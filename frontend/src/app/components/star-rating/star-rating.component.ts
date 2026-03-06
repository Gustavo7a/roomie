import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationSummary } from '../../models/evaluation.model';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.css'],
})
export class StarRatingComponent {
  @Input() summary: EvaluationSummary | null = null;
  @Input() hasEvaluated = false;
  @Input() isStudent = false;

  @Output() submitEvaluation = new EventEmitter<{ rating: number }>();

  hoverRating = 0;
  selectedRating = 0;

  get stars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  onStarHover(star: number): void {
    if (!this.hasEvaluated) {
      this.hoverRating = star;
    }
  }

  onStarLeave(): void {
    this.hoverRating = 0;
  }

  onStarClick(star: number): void {
    if (!this.hasEvaluated) {
      this.selectedRating = star;
      this.submitEvaluation.emit({
        rating: star,
      });
    }
  }

  getStarClass(star: number, rating: number): string {
    if (star <= Math.floor(rating)) return 'full';
    if (star - rating < 1) return 'half';
    return 'empty';
  }

  formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString('pt-BR');
  }

  getInitials(name: string): string {
    if (!name?.trim()) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts.at(-1)!.charAt(0)).toUpperCase();
  }
}
