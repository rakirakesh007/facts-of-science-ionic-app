import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { FactDetailsComponent } from './fact-details/fact-details.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { NewsComponent } from './news/news.component';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  { path: 'fact-details/:category', component: FactDetailsComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'news', component: NewsComponent },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
