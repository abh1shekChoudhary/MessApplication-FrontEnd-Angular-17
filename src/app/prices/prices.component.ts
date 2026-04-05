import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService, MealPrice } from '../admin.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

interface PriceRow extends MealPrice { editing: boolean; form: FormGroup; }

const MEAL_ICONS: Record<string, string> = {
  BREAKFAST: 'free_breakfast',
  LUNCH:     'lunch_dining',
  DINNER:    'dinner_dining'
};

@Component({
  selector: 'app-prices',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatTableModule, MatProgressSpinnerModule, MatSnackBarModule, MatDividerModule
  ],
  templateUrl: './prices.component.html',
  styleUrls: ['./prices.component.css']
})
export class PricesComponent implements OnInit {
  prices: PriceRow[] = [];
  isLoading = true;
  displayedColumns = ['icon', 'meal', 'price', 'actions'];
  mealIcons = MEAL_ICONS;

  constructor(private adminService: AdminService, private fb: FormBuilder, private snackBar: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.isLoading = true;
    this.adminService.getPrices().subscribe({
      next: data => {
        this.prices = data.map(p => ({
          ...p,
          editing: false,
          form: this.fb.group({ priceInr: [p.priceInr, [Validators.required, Validators.min(1)]] })
        }));
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.snackBar.open('Failed to load prices.', 'OK', { duration: 3000 }); }
    });
  }

  startEdit(row: PriceRow) { row.form.patchValue({ priceInr: row.priceInr }); row.editing = true; }
  cancelEdit(row: PriceRow) { row.editing = false; }

  save(row: PriceRow) {
    if (row.form.invalid) return;
    const newPrice = row.form.value.priceInr;
    this.adminService.updatePrice(row.mealType, newPrice).subscribe({
      next: updated => {
        row.priceInr = updated.priceInr;
        row.editing = false;
        this.snackBar.open(`${row.mealType} price updated to ₹${updated.priceInr}.`, 'Close', { duration: 3000 });
      },
      error: () => this.snackBar.open('Failed to update price.', 'OK', { duration: 3000 })
    });
  }
}
