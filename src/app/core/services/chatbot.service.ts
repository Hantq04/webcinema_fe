import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { LanguageService } from './language.service';

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  type: 'text' | 'movie_list' | 'showtimes' | 'booking_status' | 'promo' | 'quick_replies' | 'movie_text_list';
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly http = inject(HttpClient);
  private readonly apiService = inject(ApiService);
  private readonly language = inject(LanguageService);
  private readonly authService = inject(AuthService);

  messages = signal<ChatMessage[]>([]);
  isTyping = signal(false);

  private readonly botName = 'CineGo Assistant';
  private readonly botAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=CineGo';
  private readonly t = this.language.t.bind(this.language);

  constructor() {
    this.resetChat();
  }

  resetChat() {
    this.messages.set([]);
    this.addBotMessage(this.t('chatbot.welcome'), 'quick_replies', {
      replies: [
        { label: this.t('chatbot.promoLabel'), action: 'promo' },
        { label: this.t('chatbot.faqLabel'), action: 'faq' }
      ]
    });
  }

  sendMessage(text: string) {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
      type: 'text'
    };
    this.messages.update(msgs => [...msgs, userMsg]);

    this.processQuery(text);
  }

  private processQuery(query: string) {
    this.isTyping.set(true);

    const payload = {
      userId: this.authService.currentUserId() ?? 0,
      message: query
    };

    const headers = {
      'Accept-Language': this.language.currentLanguage()
    };

    this.http.post<any>(this.apiService.apiUrl('/api/v1/chat-bot/ask'), payload, { headers }).subscribe({
      next: (res) => {
        // Lấy câu trả lời linh hoạt từ nhiều định dạng response của BE
        const replyText = res?.data?.reply || res?.reply || res?.response || res?.message || (typeof res === 'string' ? res : '');

        if (replyText) {
          const parsed = this.parseBeResponse(replyText);
          this.addBotMessage(parsed.text, parsed.type, parsed.metadata);
        } else {
          this.addBotMessage(this.t('chatbot.systemError'));
        }
        this.isTyping.set(false);
      },
      error: (err) => {
        console.error('Chatbot API Error:', err);
        this.addBotMessage(this.t('chatbot.networkError'));
        this.isTyping.set(false);
      }
    });
  }

  handleAction(action: string) {
    switch (action) {
      case 'faq':
        this.sendFAQ();
        break;
      case 'promo':
        this.sendMessage(this.t('chatbot.promoQuery'));
        break;

      // Các câu hỏi FAQ xử lý offline tại FE
      case 'refund_policy':
        this.addUserMessage(this.t('chatbot.refundPolicyLabel'));
        this.showFaqResponse(this.t('chatbot.refundPolicyDesc'));
        break;
      case 'payment_methods':
        this.addUserMessage(this.t('chatbot.paymentMethodsLabel'));
        this.showFaqResponse(this.t('chatbot.paymentMethodsDesc'));
        break;
      case 'membership':
        this.addUserMessage(this.t('chatbot.membershipLabel'));
        this.showFaqResponse(this.t('chatbot.membershipDesc'));
        break;
      case 'locations':
        this.addUserMessage(this.t('chatbot.locationsLabel'));
        this.showFaqResponse(this.t('chatbot.locationsDesc'));
        break;

      default:
        this.sendMessage(action); // Các action khác tự động gửi lên BE
    }
  }

  private addUserMessage(text: string) {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
      type: 'text'
    };
    this.messages.update(msgs => [...msgs, userMsg]);
  }

  private showFaqResponse(reply: string) {
    this.isTyping.set(true);
    setTimeout(() => {
      this.addBotMessage(reply);
      this.isTyping.set(false);
    }, 600);
  }

  private addBotMessage(text: string, type: ChatMessage['type'] = 'text', metadata?: any) {
    const botMsg: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      sender: 'bot',
      text,
      timestamp: new Date(),
      type,
      metadata
    };
    this.messages.update(msgs => [...msgs, botMsg]);
  }

  private sendFAQ() {
    this.addBotMessage(this.t('chatbot.faqIntro'), 'quick_replies', {
      replies: [
        { label: this.t('chatbot.refundPolicyLabel'), action: 'refund_policy' },
        { label: this.t('chatbot.paymentMethodsLabel'), action: 'payment_methods' },
        { label: this.t('chatbot.membershipLabel'), action: 'membership' },
        { label: this.t('chatbot.locationsLabel'), action: 'locations' }
      ]
    });
  }

  private parseBeResponse(replyText: string): { text: string; type: ChatMessage['type']; metadata?: any } {
    if (replyText.includes('|') && replyText.split('\n').some(line => line.trim().startsWith('-') && line.includes('|'))) {
      const lines = replyText.split('\n');
      let intro = '';
      const movies: Array<{ title: string; genre: string; releaseDate: string }> = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('-')) {
          const content = line.substring(1).trim();
          const parts = content.split('|').map(p => p.trim());
          if (parts.length >= 1) {
            const title = parts[0];
            let genre = '';
            let releaseDate = '';

            for (let j = 1; j < parts.length; j++) {
              const part = parts[j];
              if (part.toLowerCase().includes('thể loại') || part.toLowerCase().includes('genre')) {
                genre = part.replace(/thể loại:|genre:/gi, '').trim();
              } else if (part.toLowerCase().includes('khởi chiếu') || part.toLowerCase().includes('release') || part.toLowerCase().includes('premiere')) {
                const rawDate = part.replace(/khởi chiếu:|release:|premiere:/gi, '').trim();
                releaseDate = rawDate.replace(/(\d{4})-(\d{2})-(\d{2})/g, '$3/$2/$1');
              }
            }

            movies.push({ title, genre, releaseDate });
          }
        } else if (movies.length === 0) {
          if (intro) {
            intro += '\n' + line;
          } else {
            intro = line;
          }
        }
      }

      if (movies.length > 0) {
        return {
          text: intro || 'Danh sách phim:',
          type: 'movie_text_list',
          metadata: { movies }
        };
      }
    }

    return { text: replyText, type: 'text' };
  }
}
