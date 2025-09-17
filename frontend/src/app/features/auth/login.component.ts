import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  private pendingEmail = signal<string | null>(null);

  @ViewChild('confirmDialog') confirmDialog!: ElementRef<HTMLDialogElement>;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  get email() { return this.form.controls.email; }

  async onSubmit() {
    if (this.form.invalid || this.loading()) return;
    const email = (this.form.value.email ?? '').toLowerCase().trim();
    this.loading.set(true);

    try {
      const found = await this.auth.findUser(email);
      console.log("findUser result:", found);

      if (found) {
        console.log("User found, logging in...");
        await this.auth.loginOrCreate(email);
        await this.router.navigateByUrl('/tasks');
        return;
      }

      this.pendingEmail.set(email);

      const dialog = this.confirmDialog?.nativeElement;

      if (dialog) {
        dialog.showModal();
      } else {
        const ok = confirm('No existe una cuenta con ese email. ¿Deseas crearla?');
        await this.handleCreateDecision(ok);
      }
    } finally {
      this.loading.set(false);
    }
  }

  async onDialogClose(event: Event) {
    const dialog = event.target as HTMLDialogElement;
    const ok = dialog.returnValue === 'ok';
    await this.handleCreateDecision(ok);
  }

  private async handleCreateDecision(ok: boolean) {
    const email = this.pendingEmail();
    this.pendingEmail.set(null);

    if (!ok || !email) return;

    this.loading.set(true);
    try {
      await this.auth.loginOrCreate(email);
      await this.router.navigateByUrl('/tasks');
    } finally {
      this.loading.set(false);
    }
  }
}
