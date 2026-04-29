import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage } from '../../core/services/chatbot.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {
  protected readonly chatbotService = inject(ChatbotService);
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t.bind(this.language);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpen = signal(false);
  userInput = signal('');
  messages = this.chatbotService.messages;
  isTyping = this.chatbotService.isTyping;

  constructor() {
    // Effect to auto-scroll when messages change
    effect(() => {
      this.messages();
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  ngOnInit(): void {}

  sendMessage() {
    const text = this.userInput().trim();
    if (text) {
      this.chatbotService.sendMessage(text);
      this.userInput.set('');
    }
  }

  handleQuickReply(action: string) {
    this.chatbotService.handleAction(action);
  }

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
