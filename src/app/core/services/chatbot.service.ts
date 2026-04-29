import { Injectable, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  type: 'text' | 'movie_list' | 'showtimes' | 'booking_status' | 'promo' | 'quick_replies';
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  messages = signal<ChatMessage[]>([]);
  isTyping = signal(false);

  private readonly botName = 'CineGo Assistant';
  private readonly botAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=CineGo';

  constructor() {
    // Initial welcome message
    this.addBotMessage('Xin chào! Tôi là CineGo Assistant. Tôi có thể giúp gì cho bạn hôm nay?', 'quick_replies', {
      replies: [
        { label: '🎬 Tìm phim', action: 'find_movies' },
        { label: '📅 Xem suất chiếu', action: 'showtimes' },
        { label: '🎟️ Vé của tôi', action: 'my_bookings' },
        { label: '💡 Hỏi đáp FAQ', action: 'faq' }
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
    const lowerQuery = query.toLowerCase();

    // Mock delay for "thinking"
    setTimeout(() => {
      if (lowerQuery.includes('phim') || lowerQuery.includes('movie')) {
        this.sendMovieRecommendations();
      } else if (lowerQuery.includes('suất chiếu') || lowerQuery.includes('showtime')) {
        this.sendShowtimes();
      } else if (lowerQuery.includes('vé') || lowerQuery.includes('booking')) {
        this.sendBookingStatus();
      } else if (lowerQuery.includes('khuyến mãi') || lowerQuery.includes('promo')) {
        this.sendPromotions();
      } else if (lowerQuery.includes('faq') || lowerQuery.includes('hỏi') || lowerQuery.includes('giúp')) {
        this.sendFAQ();
      } else {
        this.addBotMessage('Tôi chưa hiểu ý bạn lắm. Bạn có thể chọn một trong các gợi ý dưới đây nhé:', 'quick_replies', {
          replies: [
            { label: '🎬 Tìm phim', action: 'find_movies' },
            { label: '📅 Xem suất chiếu', action: 'showtimes' },
            { label: '🎟️ Vé của tôi', action: 'my_bookings' },
            { label: '📞 Liên hệ hỗ trợ', action: 'contact' }
          ]
        });
      }
      this.isTyping.set(false);
    }, 1500);
  }

  handleAction(action: string) {
    switch (action) {
      case 'find_movies':
        this.sendMessage('Tìm phim đang chiếu');
        break;
      case 'showtimes':
        this.sendMessage('Xem suất chiếu hôm nay');
        break;
      case 'my_bookings':
        this.sendMessage('Tra cứu vé của tôi');
        break;
      case 'promo':
        this.sendMessage('Xem khuyến mãi');
        break;
      case 'faq':
        this.sendFAQ();
        break;
      default:
        this.addBotMessage('Tính năng này đang được phát triển.');
    }
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

  private sendMovieRecommendations() {
    this.addBotMessage('Đây là một số phim hot đang chiếu tại rạp:', 'movie_list', {
      movies: [
        {
          id: 1,
          title: 'Avengers: Endgame',
          genre: 'Action, Sci-Fi',
          rating: 8.4,
          duration: '181 min',
          poster: 'https://image.tmdb.org/t/p/w500/or06vSaeEbDb3WEzGCO7fkpVIw.jpg'
        },
        {
          id: 2,
          title: 'The Dark Knight',
          genre: 'Action, Crime, Drama',
          rating: 9.0,
          duration: '152 min',
          poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDp9QmUvdbK6NINUpSI.jpg'
        },
        {
          id: 3,
          title: 'Inception',
          genre: 'Action, Adventure, Sci-Fi',
          rating: 8.8,
          duration: '148 min',
          poster: 'https://image.tmdb.org/t/p/w500/9gk7Fn9sVAsS9Te6G1NEE3lyOBt.jpg'
        }
      ]
    });
  }

  private sendShowtimes() {
    this.addBotMessage('Lịch chiếu hôm nay tại CineGo Central:', 'showtimes', {
      showtimes: [
        { time: '14:30', room: 'P01', format: '2D Digital' },
        { time: '17:15', room: 'P03', format: '3D IMAX' },
        { time: '20:00', room: 'P01', format: '2D Digital' },
        { time: '22:45', room: 'P02', format: '2D Digital' }
      ]
    });
  }

  private sendBookingStatus() {
    this.addBotMessage('Vui lòng nhập mã đặt vé hoặc số điện thoại để tôi kiểm tra nhé. Hoặc xem lịch sử đặt vé gần nhất của bạn:', 'booking_status', {
      lastBooking: {
        id: 'CGV123456789',
        movie: 'Avengers: Endgame',
        date: '2026-04-29',
        time: '20:00',
        seats: 'H12, H13',
        status: 'Confirmed'
      }
    });
  }

  private sendPromotions() {
    this.addBotMessage('Hiện đang có các chương trình ưu đãi hấp dẫn dành cho bạn:', 'promo', {
      promos: [
        { title: 'Thứ 2 Vui Vẻ', desc: 'Đồng giá vé 45k cho mọi suất chiếu.', code: 'HAPPYMON' },
        { title: 'Combo Couple', desc: 'Giảm 20% khi mua 2 vé + 1 bắp nước lớn.', code: 'COUPLE20' }
      ]
    });
  }

  private sendFAQ() {
    this.addBotMessage('Bạn có thể tìm thấy câu trả lời cho các vấn đề thường gặp tại đây:', 'quick_replies', {
      replies: [
        { label: 'Chính sách hoàn vé', action: 'refund_policy' },
        { label: 'Phương thức thanh toán', action: 'payment_methods' },
        { label: 'Quyền lợi thành viên', action: 'membership' },
        { label: 'Địa điểm rạp', action: 'locations' }
      ]
    });
  }
}
