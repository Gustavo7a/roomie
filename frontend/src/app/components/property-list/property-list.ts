import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Property} from '../../models/property';
import {PropertyDetailView} from '../../models/property-detail-view';
import {PropertyCard} from '../property-card/property-card';
import {PropertyDetail} from '../property-detail/property-detail';
import {PropertyService} from '../../services/propertyService';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, PropertyCard, PropertyDetail],
  templateUrl: './property-list.html',
  styleUrl: './property-list.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PropertyList {
  @Input() properties: Property[] = [];
  @Input() loading = false;

  selectedProperty: Property | null = null;
  selectedDetail: PropertyDetailView | null = null;

  private readonly propertyService = inject(PropertyService);
  private readonly cdr = inject(ChangeDetectorRef);

  openDetail(property: Property): void {
    this.selectedProperty = property;
    this.selectedDetail = null;
    this.propertyService.getDetailById(property.id).subscribe({
      next: (detail) => {
        this.selectedDetail = detail;
        this.cdr.detectChanges();
      },
      error: () => { /* mantém selectedDetail null */
      }
    });
  }

  closeDetail(): void {
    this.selectedProperty = null;
    this.selectedDetail = null;
  }
}
