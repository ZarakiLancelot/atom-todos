import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });
  get email() { return this.form.controls.email; }

  async onSubmit() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    try {
      const result = await this.auth.loginOrCreate(this.email.value);
      console.log(`User ${result}`);
      await this.router.navigateByUrl('/tasks');
    } catch (error) {
      console.error('Login error', error);
      alert('Login failed. Please try again.');
    } finally {
      this.loading = false;
    }
  }
}
