import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage } from '../../core/services/chatbot.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {
  protected readonly chatbotService = inject(ChatbotService);
  protected readonly language = inject(LanguageService);
  protected readonly t = this.language.t.bind(this.language);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpen = signal(false);
  userInput = signal('');
  messages = this.chatbotService.messages;
  isTyping = this.chatbotService.isTyping;

  constructor() {
    // Effect to auto-scroll when messages change and notify Angular's change detection
    effect(() => {
      this.messages();
      this.isOpen();
      this.isTyping();

      setTimeout(() => {
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        this.scrollToBottom();
      }, 50);
    });
  }

  ngOnInit(): void { }

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
    this.isOpen.update(v => {
      const nextVal = !v;
      if (nextVal) {
        setTimeout(() => {
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }, 50);
      }
      return nextVal;
    });
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
