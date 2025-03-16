import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
  standalone: false
})
export class NewsComponent  implements OnInit {
  newsArticles: any[] = [];

  constructor(private databaseService: DatabaseService, private router: Router) { }

  async ngOnInit() {
    this.newsArticles = await this.databaseService.fetchScienceNews();
    this.databaseService.showBannerAd();
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  async openArticle(url: string) {
    await Browser.open({ url });
  }

}
