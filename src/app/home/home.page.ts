import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from '../services/database.service'; // Import the DatabaseService
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';
import { ModalController } from '@ionic/angular';
import { ChatModalComponent } from '../chat-modal/chat-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  facts: any[] = [];
  newsList: any[] = [];
  dailyFact: any;
  newsArticles: any[] = [];
  limitedNews: any[] = [];

  constructor(private router: Router, private databaseService: DatabaseService, private modalCtrl: ModalController) { }

  async ngOnInit() {
    try {
      this.databaseService.getScienceFacts().subscribe({
        next: async (data) => {
          this.facts = data;
          this.dailyFact = await this.databaseService.getDailyFact();
          this.newsArticles = await this.databaseService.fetchScienceNews();
          this.limitedNews = this.newsArticles.slice(0, 3);
        },
        error: (error) => {
          console.error('Error fetching science facts:', error);
        }
      });
      this.databaseService.showBannerAd();
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }

  async showAnotherFact() {
    this.dailyFact = await this.databaseService.getDailyFact(true);
    // try {
    //   await this.databaseService.loadInterstitialAd(); // Wait for the ad to load
    //   this.databaseService.showInterstitialAd(); // Show the ad

    //   setTimeout(async () => { // Delay fetching the new fact until after the ad
    //     this.dailyFact = await this.databaseService.getDailyFact();
    //   }, 3000); // Adjust the delay as needed
    // } catch (error) {
    //   console.error('Error loading interstitial ad:', error);
    //   this.dailyFact = await this.databaseService.getDailyFact(); // Load the fact even if the ad fails
    // }
  }

  viewAllNews() {
    this.router.navigate(['/news']);  // Navigate to the News page
  }

  async openArticle(url: string) {
    await Browser.open({ url });
  }

  async navigateToFactDetails(fact: any) {
    try {
      await this.databaseService.loadInterstitialAd(); // Wait for the ad to load
      this.databaseService.showInterstitialAd(); // Show the interstitial ad
      setTimeout(() => { // Delay navigation to allow the ad to display
        this.router.navigate(['/fact-details', fact]);
      }, 3000); // Adjust the timeout as needed
    } catch (error) {
      console.error('Error loading interstitial ad:', error);
      this.router.navigate(['/fact-details', fact]); // Navigate even if ad fails to load
    }
  }

  shareApp() {
    Share.share({
      title: 'Discover Science Facts!',
      text: 'Learn amazing science facts, solve brain-teasing quizzes, and explore fascinating topics with this app designed for curious minds!',
      url: 'https://www.amazon.com/dp/B0DSJNMFMB/ref=apps_sf_sta',
      dialogTitle: 'Share the wonders of science!'
    });
  }

  async shareFact() {
    try {
      await Share.share({
        title: 'Check out this interesting fact!',
        text: this.dailyFact.fact,
        url: 'https://www.amazon.com/dp/B0DSJNMFMB/ref=apps_sf_sta',
        dialogTitle: 'Share with friends',
      });
    } catch (error) {
      console.error('Error sharing fact:', error);
    }
  }

  goToFavorites() {
    this.router.navigate(['/favorites']); // Navigate even if ad fails to load
  }

  async getNewFact() {
    try {
      await this.databaseService.loadInterstitialAd(); // Load the ad first
      this.databaseService.showInterstitialAd(); // Show the interstitial ad
      setTimeout(async () => { // Delay getting new fact to allow ad to display
        this.dailyFact = await this.databaseService.getDailyFact(); // Fetch new fact
      }, 3000); // 3 second delay
    } catch (error) {
      console.error('Error loading interstitial ad:', error);
      this.dailyFact = await this.databaseService.getDailyFact(); // Fetch new fact even if ad fails
    }
  }

  async openChat() {
    const modal = await this.modalCtrl.create({
      component: ChatModalComponent
    });
    await modal.present();
  }
}
