import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, BulkUploadResult } from '../admin.service';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressBarModule, MatChipsModule, MatDividerModule,
    MatListModule, MatSnackBarModule
  ],
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.css']
})
export class BulkUploadComponent {
  isDragging = false;
  selectedFile: File | null = null;
  isLoading = false;
  result: BulkUploadResult | null = null;

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragging = true; }
  onDragLeave()             { this.isDragging = false; }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
    const file = e.dataTransfer?.files[0];
    if (file) this.selectFile(file);
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) this.selectFile(input.files[0]);
  }

  selectFile(file: File) {
    const valid = file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    if (!valid) {
      this.snackBar.open('Only CSV and Excel files are supported.', 'OK', { duration: 3000 });
      return;
    }
    this.selectedFile = file;
    this.result = null;
  }

  upload() {
    if (!this.selectedFile) return;
    this.isLoading = true;
    this.result = null;

    this.adminService.bulkUpload(this.selectedFile).subscribe({
      next: res => {
        this.result = res;
        this.isLoading = false;
        const msg = `Done: ${res.successCount} added, ${res.failureCount} failed.`;
        this.snackBar.open(msg, 'Close', { duration: 4000 });
      },
      error: err => {
        this.isLoading = false;
        this.snackBar.open('Upload failed: ' + (err.message || 'Unknown error'), 'Close', { duration: 4000 });
      }
    });
  }

  reset() { this.selectedFile = null; this.result = null; }
}
