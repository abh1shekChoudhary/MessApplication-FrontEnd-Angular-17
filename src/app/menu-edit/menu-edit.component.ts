import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService, WeeklyMenuItem } from '../admin.service';

import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const MEAL_COLORS: Record<string, string> = {
  BREAKFAST: '#fff8e1', LUNCH: '#e8f5e9', DINNER: '#e3f2fd', SNACKS: '#fce4ec'
};

interface EditableItem extends WeeklyMenuItem { editing: boolean; form: FormGroup; }

@Component({
  selector: 'app-menu-edit',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatExpansionModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatTableModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatChipsModule
  ],
  templateUrl: './menu-edit.component.html',
  styleUrls: ['./menu-edit.component.css']
})
export class MenuEditComponent implements OnInit {
  isLoading = true;
  days = DAYS;
  mealColors = MEAL_COLORS;
  menuByDay: Record<string, EditableItem[]> = {};
  columns = ['mealType', 'name', 'description', 'actions'];

  constructor(private adminService: AdminService, private fb: FormBuilder, private snackBar: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.isLoading = true;
    this.adminService.getFullMenu().subscribe({
      next: items => {
        this.menuByDay = {};
        for (const day of this.days) {
          this.menuByDay[day] = items
            .filter(i => i.dayOfWeek === day)
            .map(i => ({
              ...i,
              editing: false,
              form: this.fb.group({
                name:        [i.name,        Validators.required],
                description: [i.description, Validators.required]
              })
            }));
        }
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.snackBar.open('Failed to load menu.', 'OK', { duration: 3000 }); }
    });
  }

  startEdit(item: EditableItem) {
    item.form.patchValue({ name: item.name, description: item.description });
    item.editing = true;
  }

  cancelEdit(item: EditableItem) { item.editing = false; }

  save(item: EditableItem) {
    if (item.form.invalid) return;
    const { name, description } = item.form.value;
    this.adminService.updateMenuItem(item.dayOfWeek, item.mealType, name, description).subscribe({
      next: updated => {
        item.name        = updated.name;
        item.description = updated.description;
        item.editing     = false;
        this.snackBar.open(`${item.dayOfWeek} ${item.mealType} updated.`, 'Close', { duration: 3000 });
      },
      error: () => this.snackBar.open('Failed to save changes.', 'OK', { duration: 3000 })
    });
  }

  getColor(mealType: string) { return this.mealColors[mealType] || '#f5f5f5'; }
}
