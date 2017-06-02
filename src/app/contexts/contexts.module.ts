import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../base/shared/shared.module';

import { ContextsRoutingModule } from './contexts-routing.module';
import { ContextDetailsComponent } from './context-details/context-details.component';
import { ContextListComponent } from './context-list/context-list.component';
import { ContextsService } from './services/contexts.service';

@NgModule({
  imports: [
    FormsModule,
    HttpModule,
    CommonModule,
    SharedModule,
    ContextsRoutingModule
  ],
  declarations: [
    ContextDetailsComponent,
    ContextListComponent
  ],
  providers: [
    ContextsService
  ]
})
export class ContextsModule { }
