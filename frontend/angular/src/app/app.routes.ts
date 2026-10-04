import { Routes } from '@angular/router';
import { CreateGamePage } from './game/create-game-page';
import { HomePage } from './health/home-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'games/new', component: CreateGamePage },
];
