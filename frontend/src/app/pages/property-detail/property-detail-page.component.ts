import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../services/propertyService';
import { FavoritesService } from '../../services/favorites.service';
import { PropertyDetailView } from '../../models/property-detail-view';
import { PropertyPhoto } from '../../models/property';
import { HeaderComponent } from '../../components/shared/header/header.component';
import { StarRatingComponent } from '../../components/star-rating/star-rating.component';
import { EvaluationService } from '../../services/evaluation.service';
import { EvaluationSummary } from '../../models/evaluation.model';
import { environment } from '../../../enviroments/enviroment';
import { Auth } from '../../auth/auth';
import { StudentService } from '../../services/student.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-property-detail-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent, StarRatingComponent],
  templateUrl: './property-detail-page.component.html',
  styleUrl: './property-detail-page.component.css',
})
export class PropertyDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly propertyService = inject(PropertyService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly auth = inject(Auth);
  private readonly studentService = inject(StudentService);
  private readonly evaluationService = inject(EvaluationService);

  readonly apiBase = environment.apiUrl;

  detail: PropertyDetailView | null = null;
  photos: PropertyPhoto[] = [];
  selectedPhotoIndex = 0;
  isLoading = true;
  errorMessage: string | null = null;
  interesseEnviado = false;
  isStudent = false;
  evaluationSummary: EvaluationSummary | null = null;
  hasEvaluated = false;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!idParam || Number.isNaN(id)) {
      this.errorMessage = 'ID de imóvel inválido.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    // Verifica se o usuário logado está autenticado
    this.auth.currentUser$.pipe(take(1)).subscribe(user => {
      if (user) {
        // Se está autenticado, pode ser um estudante
        this.isStudent = true;
        this.cdr.detectChanges();
      }
    });

    this.propertyService.getDetailById(id).subscribe({
      next: (data) => {
        this.detail = data;
        this.isLoading = false;
        this.cdr.detectChanges();

        // Verifica no servidor se já demonstrou interesse (fonte confiável)
        this.propertyService.checkInterest(id).subscribe({
          next: (hasInterest) => {
            if (hasInterest) {
              this.interesseEnviado = true;
              this.cdr.detectChanges();
            }
          },
          error: () => { /* sem autenticação, ignora */ }
        });
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar os detalhes deste imóvel.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });

    this.propertyService.getById(id).subscribe({
      next: (property) => {
        if (property?.photos?.length) {
          this.photos = property.photos;
          this.cdr.detectChanges();
        }
      },
      error: () => { /* sem fotos não bloqueia a página */ }
    });

    this.loadEvaluations(id);
    this.checkEvaluationStatus(id);
  }

  loadEvaluations(propertyId: number): void {
    this.evaluationService.getEvaluations(propertyId).subscribe({
      next: (summary) => {
        this.evaluationSummary = summary;
        this.cdr.detectChanges();
      },
      error: () => { /* sem avaliações não bloqueia */ }
    });
  }

  checkEvaluationStatus(propertyId: number): void {
    this.evaluationService.hasEvaluated(propertyId).subscribe({
      next: (result) => {
        this.hasEvaluated = result;
        this.cdr.detectChanges();
      },
      error: () => { /* ignora */ }
    });
  }

  onSubmitEvaluation(event: { rating: number; comment?: string }): void {
    if (!this.detail) return;
    const propertyId = this.detail.idImovel;
    this.evaluationService.createEvaluation(propertyId, {
      rating: event.rating,
    }).subscribe({
      next: () => {
        this.hasEvaluated = true;
        this.loadEvaluations(propertyId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 409) {
          this.hasEvaluated = true;
          this.cdr.detectChanges();
        } else if (err.status === 403) {
          this.errorMessage = err.error?.message ?? 'Você não tem permissão para avaliar este imóvel.';
        } else {
          this.errorMessage = 'Erro ao enviar avaliação. Tente novamente.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  photoUrl(path: string): string {
    return path.startsWith('http') ? path : this.apiBase + path;
  }

  get selectedPhotoSrc(): string | null {
    return this.photos.length ? this.photoUrl(this.photos[this.selectedPhotoIndex].path) : null;
  }

  prevPhoto(): void {
    this.selectedPhotoIndex =
      (this.selectedPhotoIndex - 1 + this.photos.length) % this.photos.length;
  }

  nextPhoto(): void {
    this.selectedPhotoIndex = (this.selectedPhotoIndex + 1) % this.photos.length;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  typeLabel(type?: string): string {
    const map: Record<string, string> = {
      HOUSE: 'Casa', APARTMENT: 'Apartamento', STUDIO: 'Studio',
      ROOM: 'Quarto Individual', DORMITORY: 'Dormitório',
    };
    return type ? (map[type] ?? type) : '—';
  }

  genderLabel(gender?: string): string {
    const map: Record<string, string> = {
      MALE: 'Masculino', FEMALE: 'Feminino', MIXED: 'Misto', OTHER: 'Outro',
    };
    return gender ? (map[gender] ?? gender) : '—';
  }

  getMapsUrl(): string {
    if (!this.detail) return '#';
    const address = `${this.detail.rua}, ${this.detail.numEndereco} - ${this.detail.bairro}, ${this.detail.cidade} - ${this.detail.estado}, ${this.detail.cep}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  demonstrarInteresse(): void {
    if (!this.detail || this.interesseEnviado) return;

    this.propertyService.expressInterest(this.detail.idImovel).subscribe({
      next: () => {
        if (!this.detail) return;
        this.favoritesService.addFavorite({
          id: this.detail.idImovel,
          titulo: this.detail.titulo,
          preco: this.detail.preco,
          tipo: this.detail.tipo,
          bairro: this.detail.bairro,
          cidade: this.detail.cidade,
          estado: this.detail.estado,
          addedAt: new Date().toISOString(),
        });
        this.interesseEnviado = true;
        this.cdr.detectChanges();
      },
      error: (err: { status: number }) => {
        if (err.status === 409) {
          // Já havia demonstrado interesse — refletir no UI
          this.interesseEnviado = true;
          this.cdr.detectChanges();
        }
      },
    });
  }
}

