import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ScienceFact } from '../models/science-facts.model';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
  standalone: false,
})
export class FavoritesComponent  implements OnInit {

  favoriteFacts: ScienceFact[] = [];

  constructor(
    private factsService: DatabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    setTimeout(() => {
    this.favoriteFacts = this.factsService.getFavoriteFacts();
    this.factsService.showBannerAd();
    }, 1000);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  async removeFromFavorites(fact: any) {
    await this.factsService.loadInterstitialAd();
    this.factsService.showInterstitialAd();
    // ... rest of remove logic
  }
}
