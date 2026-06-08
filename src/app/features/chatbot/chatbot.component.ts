import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
  private readonly sanitizer = inject(DomSanitizer);

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

  copyToClipboard(text: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        // Successfully copied
      }).catch(err => {
        console.error('Could not copy text: ', err);
      });
    }
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

  formatMessageText(text: string): SafeHtml {
    if (!text) return '';

    // 1. Escape HTML tags to prevent XSS
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 2. Format markdown bold **bold**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-red-600">$1</strong>');

    // 3. Format markdown italic *italic*
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // 4. Format inline code `code` as badges
    html = html.replace(/`(.*?)`/g, '<code class="chat-code-badge">$1</code>');

    // 5. Parse bullet lists starting with '-'
    const lines = html.split('\n');
    let inList = false;
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('-')) {
        const itemContent = trimmed.substring(1).trim();
        let prefix = '';
        if (!inList) {
          inList = true;
          prefix = '<ul class="chat-bullet-list">';
        }
        return `${prefix}<li class="chat-bullet-item">${itemContent}</li>`;
      } else {
        let prefix = '';
        if (inList) {
          inList = false;
          prefix = '</ul>';
        }
        return prefix + line;
      }
    });

    if (inList) {
      processedLines.push('</ul>');
    }

    html = processedLines.join('\n');

    // 6. Convert newlines to breaks
    html = html.replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
