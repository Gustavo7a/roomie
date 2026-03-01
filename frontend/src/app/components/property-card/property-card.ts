import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Property} from '../../models/property';
import {environment} from '../../../enviroments/enviroment';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-card.html',
  styleUrl: './property-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyCard {
  @Input() property!: Property;
  @Output() propertySelected = new EventEmitter<Property>();

  readonly apiBase = environment.apiUrl;

  get firstPhotoUrl(): string | null {
    if (this.property.photos && this.property.photos.length > 0) {
      const path = this.property.photos[0].path;
      return path.startsWith('http') ? path : this.apiBase + path;
    }
    if (this.property.mainPhotoUrl) {
      return this.property.mainPhotoUrl;
    }
    return null;
  }
}
