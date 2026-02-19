import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../auth/auth';
import { Router, ActivatedRoute } from '@angular/router'; 
import { FormBuilder, FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { PropertyService } from './property.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute); 
  private fb = inject(FormBuilder);
  
  private propertyService = inject(PropertyService);

  hasSearched: boolean = false; 
  appliedLocation: string = ''; 
  
  initialSearch = new FormControl(''); 

  filterForm: FormGroup = this.fb.group({
    location: [''],
    minPrice: [''],
    maxPrice: [''],
    propertyType: ['']
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length > 0) {
        this.hasSearched = true;
        this.filterForm.patchValue(params);
        this.appliedLocation = params['location'] || ''; 
      }
    });
  }

  onInitialSearch() {
    if (this.initialSearch.value) {
      this.filterForm.patchValue({ location: this.initialSearch.value });
    }
    this.hasSearched = true;
    this.onFilter();
  }

  onFilter() {
    const formValues = this.filterForm.value;
    
    this.appliedLocation = formValues.location; 

    const cleanParams: any = {};
    Object.keys(formValues).forEach(key => {
      if (formValues[key] !== null && formValues[key] !== '') {
        cleanParams[key] = formValues[key];
      }
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: cleanParams
    });

    this.propertyService.buscarComFiltros(cleanParams).subscribe({
      next: (resultados) => {
        console.log('Imóveis encontrados no Banco de Dados:', resultados);

      },
      error: (err) => {
        console.error('Erro ao buscar imóveis:', err);
      }
    });
  }


  goBackHome() {
    this.hasSearched = false;
    this.appliedLocation = ''; 
    this.initialSearch.reset();
    this.filterForm.reset();
    

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  goToProfile() {
    alert('Aqui abrirá o Perfil!');
  }

  onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}