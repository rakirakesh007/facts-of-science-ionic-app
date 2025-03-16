import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ChatBotService } from '../services/chat-bot.service';

@Component({
  selector: 'app-chat-modal',
  templateUrl: './chat-modal.component.html',
  styleUrls: ['./chat-modal.component.scss'],
  standalone: false,
})
export class ChatModalComponent  implements OnInit {
  messages: { text: string; sender: string }[] = [];
  userInput: string = '';
  isTyping: boolean = false;

  constructor(private modalCtrl: ModalController, private chatbotService: ChatBotService) { }

  ngOnInit() {}

  closeChat() {
    this.modalCtrl.dismiss();
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    this.messages.push({ text: this.userInput, sender: 'user' });

    this.isTyping = true;

    setTimeout(() => {
      const botResponse = this.chatbotService.getAnswer(this.userInput);
      this.messages.push({ text: botResponse, sender: 'bot' });

      this.isTyping = false; // Hide typing indicator
      this.userInput = '';
    }, 1500);

  }

}
