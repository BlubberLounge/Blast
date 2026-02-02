import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { UndercoverComponent } from './pages/undercover/undercover.component';
import { KopfkinoComponent } from './pages/kopfkino/kopfkino.component';
import { MontagsmalerComponent } from './pages/montagsmaler/montagsmaler.component';
import { LippenlesenComponent } from './pages/lippenlesen/lippenlesen.component';
import { WoerterketteComponent } from './pages/woerterkette/woerterkette.component';
import { KingsCupComponent } from './pages/kings-cup/kings-cup.component';
import { QuizBattleComponent } from './pages/quiz-battle/quiz-battle.component';
import { ActivityComponent } from './pages/activity/activity.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'undercover', component: UndercoverComponent },
  { path: 'kopfkino', component: KopfkinoComponent },
  { path: 'drawing', component: MontagsmalerComponent },
  { path: 'lippenlesen', component: LippenlesenComponent },
  { path: 'wortekette', component: WoerterketteComponent },
  { path: 'kings-cup', component: KingsCupComponent },
  { path: 'quiz', component: QuizBattleComponent },
  { path: 'activity', component: ActivityComponent },
  { path: '**', redirectTo: '' }
];
