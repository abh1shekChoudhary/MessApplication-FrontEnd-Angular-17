
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { StudentTotalComponent } from './student-total/student-total.component';
import { StudentListComponent } from './student-list/student-list.component';
import { StudentDuesComponent } from './student-dues/student-dues.component';
import { AddStudentComponent } from './addstudents/addstudents.component';
import { UpdateStudentComponent } from './update-student/update-student.component';
import { DeleteStudentComponent } from './delete-student/delete-student.component';
import { StudentDetailComponent } from './student-detail/student-detail.component';
import { MenuComponent } from './menu/menu.component';
import { FeaturesComponent } from './features/features.component';
import { BulkUploadComponent } from './bulk-upload/bulk-upload.component';
import { PricesComponent } from './prices/prices.component';
import { MenuEditComponent } from './menu-edit/menu-edit.component';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';
import { loginGuard } from './login/login.guard';
import { guestGuard } from './guest.guard';

export const routes: Routes = [

  // ── Public ─────────────────────────────────────────────────────────────────
  { path: 'login',    component: LoginComponent,    canActivate: [loginGuard] },

  // ── Guest-only (recruiter demo) ─────────────────────────────────────────────
  { path: 'features', component: FeaturesComponent, canActivate: [guestGuard] },

  // ── Authenticated (Admin + Student) ────────────────────────────────────────
  { path: 'home',            component: HomeComponent,          canActivate: [authGuard] },
  { path: 'menu/:type',      component: MenuComponent,          canActivate: [authGuard] },
  { path: 'students/total',  component: StudentTotalComponent,  canActivate: [authGuard] },
  { path: 'students/detail', component: StudentDetailComponent, canActivate: [authGuard] },

  // ── Admin-only — existing ──────────────────────────────────────────────────
  { path: 'getStudents',      component: StudentListComponent,   canActivate: [adminGuard] },
  { path: 'students/dues',    component: StudentDuesComponent,   canActivate: [adminGuard] },
  { path: 'students/add/new', component: AddStudentComponent,    canActivate: [adminGuard] },
  { path: 'students/update',  component: UpdateStudentComponent, canActivate: [adminGuard] },
  { path: 'students/delete',  component: DeleteStudentComponent, canActivate: [adminGuard] },

  // ── Admin-only — NEW features ──────────────────────────────────────────────
  { path: 'admin/bulk-upload', component: BulkUploadComponent, canActivate: [adminGuard] },
  { path: 'admin/prices',      component: PricesComponent,     canActivate: [adminGuard] },
  { path: 'admin/menu-edit',   component: MenuEditComponent,   canActivate: [adminGuard] },

  // ── Default & Wildcard ─────────────────────────────────────────────────────
  { path: '',   redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];