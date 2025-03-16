import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { forkJoin } from 'rxjs';
import { ScienceFact } from '../models/science-facts.model';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-fact-details',
  templateUrl: './fact-details.component.html',
  styleUrls: ['./fact-details.component.scss'],
  standalone: false,
})
export class FactDetailsComponent implements OnInit {
  header: string = '';
  filteredFacts: any[] = [];
  colors: string[] = ['#E8F5E9', '#EFEFEF'];
  scienceFacts: any[] = [];
  factContents: ScienceFact[] = [];
  favoriteFacts: any[] = [];
  category: string = '';
  selectedTopic: any;
  timelineEvents: any[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private databaseService: DatabaseService, private storage: Storage) { }

  async ngOnInit() {
    forkJoin({
      facts: this.databaseService.getScienceFacts(),
      contents: this.databaseService.getFactsContent(),
      timelineEvents: this.databaseService.getTimelineData()
    }).subscribe({
      next: (data) => {
        this.scienceFacts = data.facts;
        this.factContents = data.contents;
        this.timelineEvents = data.timelineEvents;
        this.loadFavorites();
        this.route.params.subscribe(params => {
          this.category = params['category'];
          this.selectedTopic = this.scienceFacts.find(fact => fact.category === this.category);
          this.header = this.selectedTopic ? this.selectedTopic.category : '';
          this.filterFacts();
          this.databaseService.showBannerAd();
        });
      },
      error: (error) => {
        console.error('Error fetching science facts:', error);
      }
    });
  }

  async navigateToDetail(category: string) {
    if (category !== this.category) {
      this.router.navigate(['/fact-details', category]);
      try {
        await this.databaseService.loadInterstitialAd(); // Wait for the ad to load
        this.databaseService.showInterstitialAd(); // Show the interstitial ad
        setTimeout(() => { // Delay navigation to allow the ad to display
          this.router.navigate(['/fact-details', category]);
        }, 3000); // Adjust the timeout as needed
      } catch (error) {
        console.error('Error loading interstitial ad:', error);
        this.router.navigate(['/fact-details', category]); // Navigate even if ad fails to load
      }
    }
  }

  filterFacts() {
    this.filteredFacts = this.factContents.filter(fact => fact.category === this.category);
    this.filteredFacts = this.filteredFacts.map((fact, index) => ({
      ...fact,
      color: this.colors[index % this.colors.length],
      showAnswer: false
    }));

    // Show banner ad after facts are loaded
    setTimeout(() => {
      this.databaseService.showBannerAd();
    }, 1000);
  }

  toggleAnswer(fact: any) {
    fact.showAnswer = !fact.showAnswer;
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  async loadFavorites() {
    const savedFavorites = await this.storage['get']('favoriteFacts');
    this.favoriteFacts = savedFavorites || [];
    console.log('this.favoriteFacts', this.favoriteFacts)
  }

  async toggleFavorite(fact: any) {
    const index = this.favoriteFacts.findIndex(fav => fav.title === fact.title);
    if (index > -1) {
      this.favoriteFacts.splice(index, 1);
    } else {
      this.favoriteFacts.push(fact);
    }
    await this.storage['set']('favoriteFacts', this.favoriteFacts);
  }

  isFavorite(fact: any): boolean {
    return this.favoriteFacts.some(fav => fav.title === fact.title);
  }

  @ViewChildren('timelineItem') timelineItems!: QueryList<ElementRef>;

  @HostListener('window:scroll', [])
  onScroll() {
    this.checkScroll();
  }

  ngAfterViewInit() {
    this.checkScroll();
  }

  private checkScroll() {
    const triggerBottom = window.innerHeight * 0.85;

    this.timelineItems.forEach((item) => {
      const itemTop = item.nativeElement.getBoundingClientRect().top;
      if (itemTop < triggerBottom) {
        item.nativeElement.classList.add('show');
      } else {
        item.nativeElement.classList.remove('show');
      }
    });
  }
}

