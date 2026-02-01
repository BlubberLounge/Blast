import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { UndercoverComponent } from './pages/undercover/undercover.component';
import { KopfkinoComponent } from './pages/kopfkino/kopfkino.component';
import { MontagsmalerComponent } from './pages/montagsmaler/montagsmaler.component';
import { LippenlesenComponent } from './pages/lippenlesen/lippenlesen.component';
import { WoerterketteComponent } from './pages/woerterkette/woerterkette.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'undercover', component: UndercoverComponent },
  { path: 'kopfkino', component: KopfkinoComponent },
  { path: 'drawing', component: MontagsmalerComponent },
  { path: 'lippenlesen', component: LippenlesenComponent },
  { path: 'wortekette', component: WoerterketteComponent },
  { path: '**', redirectTo: '' }
];
