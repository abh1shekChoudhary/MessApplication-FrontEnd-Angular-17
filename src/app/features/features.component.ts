import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';

export interface ShowcaseFeature {
  icon: string;
  title: string;
  desc: string;
  route: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatRippleModule],
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent {
  view: 'admin' | 'student' = 'admin';

  setView(v: 'admin' | 'student'): void { this.view = v; }

  readonly adminFeatures: ShowcaseFeature[] = [
    { icon: 'list_alt',               title: 'Daily Attendance',    desc: 'Filterable, sortable list of all student attendance for any given day.',              route: '/getStudents'       },
    { icon: 'account_balance_wallet', title: 'Dues Report',         desc: 'Calculate and display total dues for all students within a custom date range.',       route: '/students/dues'     },
    { icon: 'history',                title: 'Student History',     desc: 'Look up the complete meal history for any individual student by registration number.', route: '/students/detail'   },
    { icon: 'upload_file',            title: 'Bulk Upload',         desc: 'Import hundreds of attendance records at once via CSV or Excel file upload.',          route: '/admin/bulk-upload' },
    { icon: 'person_add',             title: 'Add / Upsert Record', desc: 'Smart form that creates new records or intelligently merges with existing ones.',      route: '/students/add/new'  },
    { icon: 'price_change',           title: 'Meal Prices',         desc: 'View and update live breakfast, lunch, and dinner pricing in real time.',              route: '/admin/prices'      },
    { icon: 'restaurant_menu',        title: 'Edit Menu',           desc: 'Modify the weekly meal menu — names and descriptions — for all seven days.',           route: '/admin/menu-edit'   },
    { icon: 'calculate',              title: 'Student Total',       desc: 'Look up the total outstanding bill for any student by their registration number.',     route: '/students/total'    },
  ];

  readonly studentFeatures: ShowcaseFeature[] = [
    { icon: 'today',          title: "Today's Menu",  desc: 'See the next two upcoming meals automatically calculated based on the current time.', route: '/menu/upcoming'   },
    { icon: 'receipt_long',   title: 'My History',    desc: 'A complete, sortable log of every meal recorded against your account.',               route: '/students/detail' },
    { icon: 'payments',       title: 'My Total Bill', desc: 'Check your current outstanding balance — updated live whenever a record is added.',   route: '/students/total'  },
    { icon: 'calendar_month', title: 'Meal Calendar', desc: 'Your personal attendance calendar for the month with colour-coded meal dots.',        route: '/home'            },
  ];
}