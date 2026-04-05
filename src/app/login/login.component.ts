
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  /** Standard login — calls POST /auth/login via AuthService */
  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (success) => {
        if (!success) {
          this.errorMessage = 'Invalid credentials. Please try again.';
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'An unexpected error occurred.';
        this.isLoading = false;
      }
    });
  }

  /** Guest login — calls GET /auth/guest-token; no credentials needed */
  loginAsGuest(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.authService.loginAsGuest().subscribe({
      next: (success) => {
        if (!success) {
          this.errorMessage = 'Guest access is currently unavailable.';
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'An unexpected error occurred during guest login.';
        this.isLoading = false;
      }
    });
  }
}