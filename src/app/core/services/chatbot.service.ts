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
  type: 'text' | 'movie_list' | 'showtimes' | 'booking_status' | 'promo' | 'quick_replies' | 'movie_text_list' | 'cinema_list' | 'ticket_prices' | 'date_showtimes';
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
    // 1. Parse Cinema List
    if (replyText.includes('Địa chỉ:') && (replyText.includes('Các rạp phim') || replyText.includes('Danh sách các rạp phim') || replyText.includes('rạp phim của chúng tôi') || replyText.toLowerCase().includes('rap o dau') || replyText.toLowerCase().includes('địa chỉ rạp'))) {
      const lines = replyText.split('\n');
      let headerText = '';
      const cinemas: Array<{ name: string; address: string }> = [];
      let currentCinemaName = '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const match = line.match(/^\d+\.\s*(.*)/);
        if (match) {
          currentCinemaName = match[1].trim();
        } else if (line.startsWith('Địa chỉ:') || line.toLowerCase().includes('địa chỉ:')) {
          const address = line.replace(/địa chỉ:|address:/gi, '').trim();
          if (currentCinemaName) {
            cinemas.push({ name: currentCinemaName, address });
            currentCinemaName = '';
          }
        } else if (cinemas.length === 0) {
          if (headerText) {
            headerText += '\n' + line;
          } else {
            headerText = line;
          }
        }
      }

      if (cinemas.length > 0) {
        return {
          text: headerText || 'Danh sách rạp phim:',
          type: 'cinema_list',
          metadata: { cinemas }
        };
      }
    }

    // 2. Parse Ticket Prices
    if (replyText.includes('Bảng giá vé xem phim') || replyText.includes('Giá cơ bản theo loại ghế')) {
      const lines = replyText.split('\n');
      let headerText = '';
      const seatPrices: Array<{ name: string; price: string }> = [];
      const roomMultipliers: Array<{ name: string; multiplier: string; example: string }> = [];
      let weekendSurcharge = '';
      const timeDiscounts: Array<{ time: string; discount: string }> = [];

      let currentSection = '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.includes('Bảng giá vé xem phim')) {
          headerText = line;
          continue;
        }

        if (line.includes('Giá cơ bản theo loại ghế')) {
          currentSection = 'seats';
          continue;
        } else if (line.includes('Hệ số theo loại phòng chiếu')) {
          currentSection = 'rooms';
          continue;
        } else if (line.includes('Phụ thu cuối tuần')) {
          const match = line.match(/[\+\-]?\d+%/);
          if (match) {
            weekendSurcharge = match[0];
          } else {
            weekendSurcharge = line.replace(/Phụ thu cuối tuần\s*\(Thứ 7 - Chủ nhật\):/gi, '').trim();
          }
          currentSection = '';
          continue;
        } else if (line.includes('Giảm giá theo khung giờ')) {
          currentSection = 'time';
          continue;
        }

        if (line.startsWith('-')) {
          const content = line.substring(1).trim();
          if (currentSection === 'seats') {
            const matches = [...line.matchAll(/([a-zA-Z0-9\s\-_]+):\s*([\d,]+\s*VND)/gi)];
            for (const match of matches) {
              const name = match[1].replace(/^[\s\-]+|[\s\-]+$/g, '').trim();
              const price = match[2].trim();
              seatPrices.push({ name, price });
            }
          } else if (currentSection === 'rooms') {
            const nameMatch = content.match(/^([a-zA-Z0-9_]+)\s*\((.*?)\)/i);
            const priceMatch = content.match(/~(\d+,?\d*\s*VND)/i) || content.match(/~(\s*\d+,?\d*)/i);
            if (nameMatch) {
              const roomName = nameMatch[1].trim();
              const multiplier = nameMatch[2].trim();
              let examplePrice = '';
              if (priceMatch) {
                examplePrice = priceMatch[1].trim();
              } else {
                const parts = content.split('~');
                if (parts.length >= 2) examplePrice = parts[1].trim();
              }
              roomMultipliers.push({ name: roomName, multiplier, example: examplePrice });
            }
          } else if (currentSection === 'time') {
            const parts = content.split(':');
            if (parts.length >= 2) {
              timeDiscounts.push({ time: parts[0].trim(), discount: parts[1].trim() });
            }
          }
        } else if (!headerText && seatPrices.length === 0) {
          headerText = line;
        }
      }

      if (seatPrices.length > 0 || roomMultipliers.length > 0 || timeDiscounts.length > 0) {
        return {
          text: headerText || 'Bảng giá vé xem phim:',
          type: 'ticket_prices',
          metadata: {
            seats: seatPrices,
            rooms: roomMultipliers,
            weekend: weekendSurcharge,
            timeDiscounts: timeDiscounts
          }
        };
      }
    }

    // 3. Parse Date Showtimes
    if (replyText.includes('có các phim đang chiếu:') && replyText.includes('Suất chiếu:')) {
      const lines = replyText.split('\n');
      let headerText = '';
      const movies: Array<{ title: string; genre: string; date: string; showtimes: any[] }> = [];

      let currentMovie: any = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.includes('có các phim đang chiếu:')) {
          headerText = line;
          continue;
        }

        if (line.startsWith('Ngày chiếu:')) {
          if (currentMovie) {
            currentMovie.date = line.replace('Ngày chiếu:', '').trim();
          }
        } else if (line.startsWith('Suất chiếu:')) {
          if (currentMovie) {
            const timesStr = line.replace('Suất chiếu:', '').trim();
            currentMovie.showtimes = timesStr.split(',')
              .map(s => s.trim())
              .map(s => this.parseShowtimeString(s));
            movies.push(currentMovie);
            currentMovie = null;
          }
        } else if (line.includes('|')) {
          const parts = line.split('|');
          const title = parts[0].trim();
          let genre = '';
          if (parts.length >= 2) {
            genre = parts[1].replace(/thể loại:|genre:/gi, '').trim();
          }
          currentMovie = { title, genre, date: '', showtimes: [] };
        }
      }

      if (movies.length > 0) {
        return {
          text: headerText || 'Lịch chiếu phim:',
          type: 'date_showtimes',
          metadata: { movies }
        };
      }
    }

    // 4. Parse Cinema Showtimes (e.g. from Image 1)
    if (replyText.includes('Lịch chiếu tại') && replyText.includes('Ngày chiếu:')) {
      const lines = replyText.split('\n');
      let headerText = '';
      const movies: Array<{ title: string; genre: string; date: string; showtimes: any[] }> = [];
      let currentDate = '';
      let currentMovie: any = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.includes('Lịch chiếu tại')) {
          headerText = line;
          continue;
        }

        if (line.startsWith('Ngày chiếu:')) {
          currentDate = line.replace('Ngày chiếu:', '').replace(/:$/, '').trim();
          continue;
        }

        const movieMatch = line.match(/^\d+\.\s*([^|]+)\|/);
        if (movieMatch) {
          if (currentMovie) {
            movies.push(currentMovie);
          }
          const title = movieMatch[1].trim();
          let genre = '';
          if (line.includes('Thể loại:')) {
            genre = line.split('Thể loại:')[1].trim();
          } else if (line.includes('genre:')) {
            genre = line.split('genre:')[1].trim();
          }
          currentMovie = { title, genre, date: currentDate, showtimes: [] };
        } else if (currentMovie && (line.includes(':') || line.match(/\d{2}:\d{2}/))) {
          const times = line.split(',').map(s => s.trim());
          for (const timeStr of times) {
            currentMovie.showtimes.push(this.parseShowtimeString(timeStr));
          }
        }
      }

      if (currentMovie) {
        movies.push(currentMovie);
      }

      if (movies.length > 0) {
        return {
          text: headerText || 'Lịch chiếu:',
          type: 'date_showtimes',
          metadata: { movies }
        };
      }
    }

    // 5. Parse Movie Lists (Default fallback)
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

  private parseShowtimeString(st: string): { time: string; label: string } {
    st = st.trim();

    // Format: "CineGo Thanh Xuân (IMAX): 13:30"
    const endWithTime = st.match(/:\s*(\d{2}:\d{2})$/);
    if (endWithTime) {
      const time = endWithTime[1];
      const label = st.substring(0, st.length - endWithTime[0].length).trim();
      return { time, label };
    }

    // Format: "10:20 (CineGo Thanh Xuân - CineGo Thanh Xuân)"
    const startWithTime = st.match(/^(\d{2}:\d{2})\s*\((.*?)\)/);
    if (startWithTime) {
      return { time: startWithTime[1], label: startWithTime[2] };
    }

    const justTime = st.match(/^(\d{2}:\d{2})$/);
    if (justTime) {
      return { time: justTime[1], label: '' };
    }

    return { time: st, label: '' };
  }
}
