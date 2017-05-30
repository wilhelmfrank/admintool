import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { UserListComponent } from './user-list/user-list.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { UsersService } from './services/users.service';
import { Elastic4usersService } from './services/elastic4users.service';
import { AnotherListComponent } from './another-list/another-list.component';
import { GrantsComponent } from './grants/grants.component';

@NgModule({
  imports: [
    FormsModule,
    HttpModule,
    CommonModule,
    UsersRoutingModule
  ],
  declarations: [
    UserListComponent,
    UserDetailsComponent,
    AnotherListComponent,
    GrantsComponent
  ],
  providers: [
    UsersService,
    Elastic4usersService
  ]
})
export class UsersModule { }