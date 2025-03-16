import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AdmobAds, BannerPosition, BannerSize } from 'capacitor-admob-ads';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Storage } from '@ionic/storage-angular';
import { ScienceFact } from '../models/science-facts.model';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private menuJsonUrl = "https://rakirakesh007.github.io/science_facts_data/scienceFacts";
  private contentJsonUrl = "https://rakirakesh007.github.io/science_facts_data/factContents";
  private timmelineJsonUrl = "https://rakirakesh007.github.io/science_facts_data/timelineEvents"
  private _storage: Storage | null = null;
  private favoriteFacts: ScienceFact[] = []
  private storageInitialized = false;
  private apiKey: string = '9fa5f46242034fbfbf31cfc9fd5e6a19';
  private newsStorageKey = 'science_news';
  private lastFetchKey = 'last_fetch_date';
  private interstitialCounter = 0; // Track number of clicks
  private interstitialLimit = 3; // Show ad every 3rd time

  constructor(private http: HttpClient, private storage: Storage) {
    this.init();
  }

  async init() {
    this._storage = await this.storage.create();
    this.storageInitialized = true;
    await this.loadFavorites();
  }

  getTimelineData(): Observable<any> {
    return this.http.get<any>(this.timmelineJsonUrl);
  }

  // Load favorites from storage
  private async loadFavorites() {
    if (this._storage) {
      const savedFavorites = await this._storage?.get('favoriteFacts');
      this.favoriteFacts = savedFavorites || [];
    }
  }

  async fetchScienceNews(): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0];  // Get today's date

    // Check last fetch date
    const lastFetch = await this.storage.get(this.lastFetchKey);
    if (lastFetch === today) {
      // ✅ Load from storage if news was fetched today
      const storedNews = await this.storage.get(this.newsStorageKey);
      if (storedNews) return storedNews;
    }

    // 🔄 Fetch fresh news from API & update storage
    const url = `https://newsapi.org/v2/top-headlines?category=science&apiKey=${this.apiKey}`;
    return new Promise((resolve, reject) => {
      this.http.get<any>(url).subscribe(async response => {
        const articles = response.articles || [];
        await this.storage.set(this.newsStorageKey, articles);  // Store news
        await this.storage.set(this.lastFetchKey, today);  // Update last fetch date
        resolve(articles);
      }, error => reject(error));
    });
  }

  // Get all favorite facts
  getFavoriteFacts(): ScienceFact[] {
    return this.favoriteFacts;
  }

  // Check if a fact is bookmarked
  isFavorite(fact: ScienceFact): boolean {
    return this.favoriteFacts.some(fav => fav.id === fact.id);
  }

  // Add a fact to favorites
  async addToFavorites(fact: ScienceFact) {
    this.favoriteFacts.push(fact);
    await this._storage?.set('favoriteFacts', this.favoriteFacts);
  }

  // Remove a fact from favorites
  async removeFromFavorites(factId: string) {
    this.favoriteFacts = this.favoriteFacts.filter(fact => fact.id !== factId);
    await this._storage?.set('favoriteFacts', this.favoriteFacts);
  }

  getScienceFacts(): Observable<any> {
    return this.http.get<any>(this.menuJsonUrl);
  }

  getFactsContent(): Observable<any> {
    return this.http.get<any>(this.contentJsonUrl);
  }

  async getDailyFact(forceFetch: boolean = false): Promise<any> {
    if (!this.storageInitialized) return null;

    // Check if a fact has already been fetched for today
    const today = new Date().toISOString().split('T')[0];
    const storedFact = await this.storage.get('dailyFact');
    if (!forceFetch && storedFact && storedFact.date === today) {
      return storedFact.fact;
    }

    // Fetch facts from the API
    const url = 'https://chat-gpt26.p.rapidapi.com/';
    const apiKey = 'e7bf4bc82amsh1bb0689b89038a3p1fcdbcjsneed24cf50efa';
    const data = JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Tell me an interesting fun fact about science'
        }
      ]
    });

    let fact: any = null;

    try {
      // const response = await fetch(url, {
      //     method: 'POST',
      //     headers: {
      //         'x-rapidapi-key': apiKey,
      //         'x-rapidapi-host': 'chat-gpt26.p.rapidapi.com',
      //         'Content-Type': 'application/json'
      //     },
      //     body: data
      // });

      // const result = await response.json();

      // if (result.choices && result.choices.length > 0) {
      //     fact = result.choices[0].message.content;
      // }
      let facts = await this.getFactsContent().toPromise();
      if (!facts || facts.length === 0) return null;

      facts = facts.filter((fact: { category: string; }) =>
        fact.category !== 'Brainteaser Quiz' &&
        fact.category !== 'Scientist'
      );
      let index = Math.floor(Math.random() * facts.length);
      fact = facts[index]
    } catch (error) {
      console.error('Error fetching facts from API:', error);
      return null;
    }

    if (!fact) return null;

    // Save the fact to storage with today's date
    await this.storage.set('dailyFact', { date: today, fact });

    return fact;
  }

  // async getDailyFact(forceFetch: boolean = false): Promise<any> {
  //   if (!this.storageInitialized) return null;
  //   let facts = await this.getFactsContent().toPromise();
  //   if (!facts || facts.length === 0) return null;

  //   facts = facts.filter((fact: { category: string; }) =>
  //     fact.category !== 'Brainteaser Quiz' &&
  //     fact.category !== 'Scientist'
  //   );

  //   let lastFactIndex = await this.storage.get('lastFactIndex');
  //   let newFactIndex;

  //   do {
  //     newFactIndex = Math.floor(Math.random() * facts.length);
  //   } while (newFactIndex === lastFactIndex); // Ensure no duplicate fact

  //   await this.storage.set('lastFactIndex', newFactIndex); // Save new fact index

  //   return facts[newFactIndex]; // Return the selected fact
  // }

  showBannerAd() {
    AdmobAds.showBannerAd({
      adId: environment.bannerAdmobApId,
      isTesting: environment.admobTesting,
      adSize: BannerSize.BANNER,
      adPosition: BannerPosition.BOTTOM
    }).then(() => {
    }).catch(error => {
    })
  }

  loadInterstitialAd(): Promise<void> {
    return new Promise((resolve, reject) => {
      AdmobAds.loadInterstitialAd({
        adId: environment.interstitialAdmobApId,
        isTesting: environment.admobTesting
      }).then(() => {
        resolve(); // Resolve when the ad is successfully loaded
      }).catch(error => {
        reject(error); // Reject if there is an error loading the ad
      });
    });
  }

  async showInterstitialAd() {
    this.interstitialCounter++; // Increment counter
    if (this.interstitialCounter >= this.interstitialLimit) {
      this.interstitialCounter = 0; // Reset counter
      await AdmobAds.showInterstitialAd();
      this.loadInterstitialAd(); // Preload next ad
    }
  }

  // Show interstitial ad after certain actions
  async showAdAfterAction() {
    if (Math.random() < 0.3) { // 30% chance to show ad
      await this.loadInterstitialAd();
      this.showInterstitialAd();
    }
  }

  // Show ad after every N actions
  private actionCount = 0;
  async trackActionForAd() {
    this.actionCount++;
    if (this.actionCount % 5 === 0) { // Show ad every 5 actions
      await this.loadInterstitialAd();
      this.showInterstitialAd();
    }
  }
}
