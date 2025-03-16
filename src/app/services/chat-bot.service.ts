import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as fuzzball from 'fuzzball';

@Injectable({
  providedIn: 'root'
})
export class ChatBotService {
  private chatbotData: any[] = [];
  private chatbotJsonUrl = "https://rakirakesh007.github.io/science_facts_data/chatbot-data"

  constructor(private http: HttpClient) {
    this.loadChatbotData();
  }
  private loadChatbotData() {
    this.http.get<any[]>(this.chatbotJsonUrl).subscribe(data => {
      this.chatbotData = data;
    });
  }

  getAnswer(userQuestion: string): string {
    const question = userQuestion.toLowerCase().trim();

    // 🔹 1. First, check for exact match
    const exactMatch = this.chatbotData.find(q => q.question.toLowerCase() === question);
    if (exactMatch) {
      return exactMatch.answer;
    }

    // 🔹 2. Check for keyword match
    const keywordMatch = this.chatbotData.find(q =>
      q.keywords.some((keyword: string) => question.includes(keyword))
    );
    if (keywordMatch) {
      return keywordMatch.answer;
    }

    // 🔹 3. Fuzzy Match: Find the closest question (Threshold: 80%)
    let bestMatch = null;
    let bestScore = 0;

    for (const entry of this.chatbotData) {
      const score = fuzzball.ratio(question, entry.question); // Get similarity score (0-100)
      if (score > 80 && score > bestScore) { // Adjust threshold as needed
        bestScore = score;
        bestMatch = entry;
      }
    }

    if (bestMatch) {
      return bestMatch.answer;
    }

    return "I don't know the answer yet!";
  }
}
