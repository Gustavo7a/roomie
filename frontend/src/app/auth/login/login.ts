import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../auth'; 
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);


  isRightPanelActive: boolean = false; 
  showLoginPass: boolean = false;      
  showRegisterPass: boolean = false;  
  showConfirmPass: boolean = false;    

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });


  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    gender: ['', [Validators.required]],
    phone: ['', [Validators.required, 
      Validators.pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    cpf: ['', [
      Validators.required, 
      Validators.pattern(/^(\d{3}\.\d{3}\.\d{3}\-\d{2}|\d{11})$/)
    ]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });


  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password !== confirmPassword ? { passwordMismatch: true } : null;
  }

  async onLogin() {
    if(this.loginForm.valid) {
      try {
        await firstValueFrom(this.auth.login(this.loginForm.value));
        await this.router.navigate(['/home']);
      } catch (error) {
        alert('Falha no login! Verifique suas credenciais.');
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }


  async onRegister() {
    if (this.registerForm.valid) {
      try {
        
        const rawValues = this.registerForm.value;
        const cleanPhone = rawValues.phone.replace(/\D/g, '');
        const ddd = cleanPhone.substring(0, 2);
        const numero = cleanPhone.substring(2);
        const cleanCpf = rawValues.cpf.replace(/\D/g, '');

        const dadosParaEnviar = {
        name: rawValues.name,
        email: rawValues.email,
        password: rawValues.password,
        gender: rawValues.gender,

        telefones: [
          { ddd: ddd, numero: numero }
        ]
      };

        await firstValueFrom(this.auth.register(dadosParaEnviar));
        alert('Cadastro realizado com sucesso! Faça login.');
        this.togglePanel(); 
        this.registerForm.reset();
      } catch (error: any) {
        const msg = error?.error?.message || 'Erro ao realizar cadastro.';
        alert(msg);
      }
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  togglePanel() {
    this.isRightPanelActive = !this.isRightPanelActive;
  }

  toggleLoginPass() { this.showLoginPass = !this.showLoginPass; }
  toggleRegisterPass() { this.showRegisterPass = !this.showRegisterPass; }
  toggleConfirmPass() { this.showConfirmPass = !this.showConfirmPass; }
}