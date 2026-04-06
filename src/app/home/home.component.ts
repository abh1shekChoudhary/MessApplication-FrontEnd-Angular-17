import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { StudentService, Student } from '../student.service';
import { AdminService, MealPrice } from '../admin.service';
import { MenuService } from '../menu.service';
import { Observable, Subject, forkJoin, of, combineLatest } from 'rxjs';
import { switchMap, take, map, catchError, takeUntil } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface CalendarDay {
  dayNum: number;
  dateKey: string;        // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  hasRecord: boolean;
  dayLabel: string;       // 'Mon', 'Tue'...
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatTooltipModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  role: string | null = null;
  todayLabel = '';
  monthLabel = '';
  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
  }

  // ── Admin state ──────────────────────────────────────────────────────────
  adminLoading = true;
  todayTotalRecords = 0;
  todayBreakfast = 0;
  todayLunch = 0;
  todayDinner = 0;
  recentStudents: Student[] = [];
  prices: MealPrice[] = [];

  readonly quickActions = [
    { icon: 'list_alt',              label: 'Daily Attendance', route: '/getStudents' },
    { icon: 'person_add',            label: 'Add Record',       route: '/students/add/new' },
    { icon: 'upload_file',           label: 'Bulk Upload',      route: '/admin/bulk-upload' },
    { icon: 'account_balance_wallet',label: 'Dues Report',      route: '/students/dues' },
    { icon: 'restaurant_menu',       label: 'Edit Menu',        route: '/admin/menu-edit' },
  ];

  // ── Student state ────────────────────────────────────────────────────────
  studentLoading = true;
  studentTotal: number | null = null;
  studentRegNo: string | null = null;
  calendarWeeks: CalendarDay[][] = [];
  calendarMonthLabel = '';
  upcomingMeals: { mealType: string; meal: { name: string } }[] = [];
  readonly dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor(
    public authService: AuthService,
    private studentService: StudentService,
    private adminService: AdminService,
    private menuService: MenuService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const now = new Date();
    this.todayLabel = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    this.monthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    this.authService.userRole$.pipe(take(1)).subscribe(role => {
      this.role = role;
      if (role === 'admin') this.loadAdminDashboard(now);
      if (role === 'student') this.loadStudentDashboard(now);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Admin Dashboard ────────────────────────────────────────────────────────
  private formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private loadAdminDashboard(now: Date): void {
    const today = this.formatDate(now);
    this.adminLoading = true;

    forkJoin({
      students: this.studentService.getStudentsByDate(today).pipe(catchError(() => of([]))),
      prices:   this.adminService.getPrices().pipe(catchError(() => of([])))
    }).pipe(takeUntil(this.destroy$)).subscribe(({ students, prices }) => {
      this.todayTotalRecords = students.length;
      this.todayBreakfast    = students.filter(s => s.breakfast).length;
      this.todayLunch        = students.filter(s => s.lunch).length;
      this.todayDinner       = students.filter(s => s.dinner).length;
      this.recentStudents    = students.slice(0, 5);
      this.prices            = prices;
      this.adminLoading = false;
    });
  }

  getPriceFor(type: string): number | null {
    const p = this.prices.find(p => p.mealType.toUpperCase() === type.toUpperCase());
    return p ? p.priceInr : null;
  }

  navigateTo(route: string): void { this.router.navigate([route]); }

  // ── Student Dashboard ──────────────────────────────────────────────────────
  private loadStudentDashboard(now: Date): void {
    this.studentLoading = true;

    this.authService.currentUserRegNo$.pipe(take(1)).subscribe(reg => {
      this.studentRegNo = reg;
    });

    forkJoin({
      history:  this.studentService.getMyStudentHistory().pipe(catchError(() => of([]))),
      total:    this.studentService.getMyStudentTotal().pipe(catchError(() => of(0))),
      upcoming: this.menuService.getUpcomingMeals().pipe(catchError(() => of([])))
    }).pipe(takeUntil(this.destroy$)).subscribe(({ history, total, upcoming }) => {
      this.studentTotal   = total;
      this.upcomingMeals  = upcoming;
      this.buildCalendar(now, history as Student[]);
      this.studentLoading = false;
    });
  }

  private buildCalendar(now: Date, history: Student[]): void {
    const year  = now.getFullYear();
    const month = now.getMonth();
    this.calendarMonthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    // Build a lookup map by dateKey
    const recordMap = new Map<string, Student>();
    history.forEach(s => recordMap.set(s.date, s));

    const todayKey = this.formatDate(now);

    // First day of month — what weekday is it? (0=Sun..6=Sat → map to Mon=0)
    const firstDayOfMonth = new Date(year, month, 1);
    let startWeekday = (firstDayOfMonth.getDay() + 6) % 7; // Mon=0, Sun=6

    const daysInMonth   = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const allDays: CalendarDay[] = [];

    // Leading padding days from previous month
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const dt = new Date(year, month - 1, d);
      allDays.push(this.makeDay(dt, false, todayKey, recordMap));
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month, d);
      allDays.push(this.makeDay(dt, true, todayKey, recordMap));
    }

    // Trailing padding days to complete last row
    const remaining = (7 - (allDays.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const dt = new Date(year, month + 1, d);
      allDays.push(this.makeDay(dt, false, todayKey, recordMap));
    }

    // Split into weeks
    this.calendarWeeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      this.calendarWeeks.push(allDays.slice(i, i + 7));
    }
  }

  private makeDay(dt: Date, isCurrentMonth: boolean, todayKey: string, map: Map<string, Student>): CalendarDay {
    const key = this.formatDate(dt);
    const rec = map.get(key);
    return {
      dayNum: dt.getDate(),
      dateKey: key,
      isCurrentMonth,
      isToday: key === todayKey,
      isFuture: key > todayKey,
      breakfast:  rec?.breakfast ?? false,
      lunch:      rec?.lunch     ?? false,
      dinner:     rec?.dinner    ?? false,
      hasRecord:  !!rec,
      dayLabel: dt.toLocaleDateString('en-IN', { weekday: 'short' })
    };
  }
}