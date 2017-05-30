import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContextListComponent } from './context-list/context-list.component';
import { ContextDetailsComponent } from './context-details/context-details.component';
import { ContextDetailsResolverService } from './services/context-details-resolver.service';


const routes: Routes = [
    {
    path: 'contexts',
    component: ContextListComponent
  },
  {
    path: 'context/:id',
    component: ContextDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ContextDetailsResolverService]
})
export class ContextsRoutingModule { }