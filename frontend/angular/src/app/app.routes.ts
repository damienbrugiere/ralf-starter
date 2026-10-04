import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { LoginPage } from './auth/login-page';
import { CreateGamePage } from './game/create-game-page';
import { GameListPage } from './game/game-list-page';
import { HomePage } from './health/home-page';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: '',
    canActivateChild: [authGuard],
    children: [
      { path: '', component: HomePage },
      { path: 'games', component: GameListPage },
      { path: 'games/new', component: CreateGamePage },
    ],
  },
];
