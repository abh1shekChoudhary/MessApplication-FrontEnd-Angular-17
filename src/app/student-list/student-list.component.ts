import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { StudentService, Student } from '../student.service';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';

// Import all necessary Angular Material modules
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MaskRegNoPipe } from "../mask-reg-no.pipe";

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MaskRegNoPipe
  ],
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['reg', 'date', 'breakfast', 'lunch', 'dinner', 'total'];
  dataSource = new MatTableDataSource<Student>();
  isLoading = true;
  selectedDate: string;
  isAdmin$: Observable<boolean>;
  isGuest$: Observable<boolean>; // To handle guest logic

  dateControl = new FormControl(new Date());

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private studentService: StudentService,
    private authService: AuthService
  ) {
    this.isAdmin$ = this.authService.isAdmin$;
    this.isGuest$ = this.authService.isGuest$;
    // Set the initial date using our new, safe formatter
    this.selectedDate = this.formatDate(new Date());
  }

  ngOnInit(): void {
    this.fetchStudentData(this.selectedDate);
  }

  // --- NEW, TIMEZONE-SAFE HELPER FUNCTION ---
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    // getMonth() is 0-indexed, so we add 1. padStart ensures it's two digits.
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // A reusable method to fetch data for a given date
  fetchStudentData(date: string): void {
    this.isLoading = true;
    this.selectedDate = date; // Update the displayed date
    this.studentService.getStudentsByDate(date).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Failed to fetch student list:", err);
        this.isLoading = false;
      }
    });
  }

  // This method is called when the admin searches for a new date
  searchByDate(): void {
    if (this.dateControl.value) {
      const newDate = this.dateControl.value;
      // Use our safe formatter here as well
      const formattedDate = this.formatDate(newDate);
      this.fetchStudentData(formattedDate);
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // ── Stat card counts ───────────────────────────────────────────────────
  get breakfastCount(): number { return this.dataSource.data.filter(s => s.breakfast).length; }
  get lunchCount():     number { return this.dataSource.data.filter(s => s.lunch).length; }
  get dinnerCount():    number { return this.dataSource.data.filter(s => s.dinner).length; }
}

