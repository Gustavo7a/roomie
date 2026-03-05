import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoommateRecommendation } from '../../models/roommate-recommendation';

@Component({
  selector: 'app-student-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-card.component.html',
  styleUrl: './student-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentCardComponent {
  @Input() recommendation!: RoommateRecommendation;
  @Output() ignore = new EventEmitter<RoommateRecommendation>();

  get initial(): string {
    return this.recommendation.name.charAt(0).toUpperCase();
  }

  get compatibilityColor(): string {
    const pct = this.recommendation.compatibilityPercentage;
    if (pct >= 75) return '#16a34a';
    if (pct >= 50) return '#d97706';
    return '#6b7280';
  }

  onIgnore(event: MouseEvent): void {
    event.stopPropagation();
    this.ignore.emit(this.recommendation);
  }
}
