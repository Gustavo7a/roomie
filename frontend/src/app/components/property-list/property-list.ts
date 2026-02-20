import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../../models/property';
import { PropertyCard } from '../property-card/property-card';
import { PropertyDetail } from '../property-detail/property-detail';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, PropertyCard, PropertyDetail],
  templateUrl: './property-list.html',
  styleUrl: './property-list.css',
})
export class PropertyList {
  @Input() properties: Property[] = [];
  @Input() loading = false;

  selectedProperty: Property | null = null;

  openDetail(property: Property): void {
    this.selectedProperty = property;
  }

  closeDetail(): void {
    this.selectedProperty = null;
  }
}
