import { Injectable, computed, signal } from '@angular/core';

export type AppLanguage = 'vi' | 'en';

const STORAGE_KEY = 'webcinema.language';

const translations = {
  vi: {
    header: {
      slogan: 'Ưu đãi vé xem phim - đặt nhanh, xem nhanh',
      deal: 'Giá rẻ độc quyền',
      news: 'Tin mới & ưu đãi',
      myTickets: 'Vé của tôi',
      loginRegister: 'Đăng nhập / đăng ký',
      hello: 'Xin chào,',
      viewAccount: 'Xem tài khoản',
      logout: 'Đăng xuất',
      movie: 'Phim',
      movieSub: 'Now showing',
      cinema: 'Rạp CineGo',
      cinemaSub: 'Rạp chiếu',
      member: 'Thành viên',
      memberSub: 'Tài khoản',
      cultureplex: 'Cultureplex',
      cultureplexSub: 'Góc CineGo',
      buyNow: 'Mua vé ngay',
      homeAria: 'Trang chủ CineGo',
      vi: 'VN',
      en: 'EN',
      allCinemas: 'Tất Cả Các Rạp',
      specialCinemas: 'Rạp Đặc Biệt',
      threeDCinemas: 'Rạp 3D',
      accountCgv: 'Tài Khoản CineGo',
      memberBenefits: 'Quyền Lợi',
      onlineStore: 'Quầy Online',
      groupBooking: 'Thuê Rạp & Vé Nhóm',
      egift: 'CineGo eGift',
      rules: 'CineGo Rules'
    },
    footer: {
      companyName: 'CineGo Việt Nam',
      intro: 'Giới thiệu',
      onlineUtilities: 'Tiện ích Online',
      giftCard: 'Thẻ Quà Tặng',
      careers: 'Tuyển Dụng',
      advertisingContact: 'Liên Hệ Quảng Cáo CineGo',
      partners: 'Dành cho đối tác',
      termsOfUse: 'Điều khoản sử dụng',
      generalTerms: 'Điều Khoản Chung',
      transactionTerms: 'Điều Khoản Giao Dịch',
      paymentPolicy: 'Chính Sách Thanh Toán',
      privacyPolicy: 'Chính Sách Bảo Mật',
      cinemaRules: 'Những Quy Định Tại Rạp Phim',
      faq: 'Câu Hỏi Thường Gặp',
      connectWithUs: 'Kết nối với chúng tôi',
      customerCare: 'Chăm sóc khách hàng',
      hotlineLabel: 'Hotline: 1900 0240',
      workingHours: 'Giờ làm việc: 8:00 - 22:00 (Tất cả các ngày bao gồm cả Lễ Tết)',
      supportEmail: 'Email hỗ trợ: hoidap@cinego.vn',
      legalName: 'CÔNG TY TNHH CJ CINEGO VIỆT NAM',
      businessCertificate: 'Giấy Chứng nhận đăng ký doanh nghiệp: 0979389909 đăng ký lần đầu ngày 15/04/2026, được cấp bởi Sở Kế hoạch và Đầu tư Thành phố Hà Nội',
      address: 'Địa chỉ: Số 4, đường Quang Trung, phường Hà Đông, Thành phố Hà Nội, Việt Nam',
      hotline: 'Đường dây nóng (Hotline): 1900 0240',
      copyright: 'COPYRIGHT 2026 CJ CINEGO VIETNAM CO., LTD. ALL RIGHTS RESERVED'
    },
    home: {
      ctaHub: 'Rạp CineGo',
      ctaHubSub: 'Hệ thống rạp',
      ctaMovies: 'Now Showing',
      ctaMoviesSub: 'Phim đang chiếu',
      ctaSpecial: 'CineGo Special',
      ctaSpecialSub: 'Đặc trưng CineGo',
      ctaRegister: 'Register Now',
      ctaRegisterSub: 'Đăng ký ngay',
      quickAccessTitle: 'Truy cập nhanh',
      movieSelectionTitle: 'Movie Selection',
      movieActionDetails: 'Xem chi tiết',
      movieActionBook: 'Mua vé',
      movieActionTrailer: 'Trailer',
      movieTrailerDetail: 'Chi tiết',
      movieEmptyTitle: 'Chưa có phim hiển thị',
      movieEmptyDescription: 'Lưới poster sẽ xuất hiện sau khi backend trả danh sách phim.',
      categoriesTitle: 'Danh mục CineGo',
      categoriesSubtitle: 'Phim, rạp, thành viên, cultureplex',
      nowShowingTitle: 'Phim Đang Chiếu',
      nowShowingDescription: 'Khám phá những suất chiếu mới nhất.',
      comingSoonTitle: 'Phim Sắp Chiếu',
      comingSoonDescription: 'Theo dõi lịch ra mắt và trailer mới.',
      theatersDescription: 'Danh sách rạp theo khu vực, dễ chọn nhanh.',
      breadcrumbPhim: 'Phim',
      eventBadge: 'Thành Viên CineGo | Tin Mới & Ưu Đãi'
    },
    admin: {
      title: 'Quản trị CineGo',
      description: 'Cấu hình rạp, phim, khuyến mãi và báo cáo.'
    },
    movies: {
      title: 'Phim CineGo',
      description: 'Danh sách phim đang chiếu và sắp chiếu.',
      genre: 'Thể loại',
      duration: 'Thời lượng',
      releaseDate: 'Khởi chiếu',
      director: 'Đạo diễn',
      actor: 'Diễn viên',
      language: 'Ngôn ngữ',
      rated: 'Rated',
      contentTitle: 'Nội Dung Phim',
      showing: 'Phim Đang Chiếu',
      coming: 'Phim Sắp Chiếu',
      minutes: 'phút',
      preBook: 'ĐẶT TRƯỚC'
    },
    booking: {
      title: 'Đặt vé CineGo',
      description: 'Chọn suất chiếu, ghế ngồi và thanh toán nhanh.',
      chooseDate: 'Chọn ngày',
      chooseCity: 'Tất cả khu vực',
      chooseCinema: 'Tất cả rạp',
      noShowtimes: 'Xin lỗi, không có suất chiếu vào ngày này, hãy chọn một ngày khác.',
      selectShowtime: 'Vui lòng chọn ngày để xem lịch chiếu.',
      loadingSchedule: 'Đang tải thông tin...',
      cityHcm: 'Hồ Chí Minh',
      cityHn: 'Hà Nội',
      cityDn: 'Đà Nẵng',
      roomStandard: '2D Phụ Đề Việt',
      roomImax: 'IMAX 2D Phụ Đề Việt',
      cinemaLabel: 'Rạp',
      personSeat: 'Người / Ghế',
      screen: 'SCREEN',
      legendSelected: 'Đã chọn',
      legendUnavailable: 'Không thể chọn',
      legendStandard: 'Thường',
      legendVip: 'VIP',
      legendSweetbox: 'Sweet Box',
      showtime: 'Suất chiếu',
      roomLabel: 'Phòng chiếu',
      movieLabel: 'Tên phim',
      seatLabel: 'Ghế',
      totalLabel: 'Tổng'
    },
    shared: {
      loading: 'Đang tải',
      website: 'Website',
      close: 'Đóng'
    },
    auth: {
      loginTab: 'Đăng nhập',
      registerTab: 'Đăng ký',
      username: 'Tên đăng nhập',
      password: 'Mật khẩu',
      emailOrPhone: 'Tên đăng nhập',
      captchaPrompt: 'Vui lòng nhập ký tự bên dưới *',
      captchaInput: 'Nhập captcha',
      loadingCaptcha: 'Đang tải captcha...',
      noCaptcha: 'Không có captcha',
      forgotPassword: 'Bạn muốn tìm lại mật khẩu?',
      loginButton: 'ĐĂNG NHẬP',
      registerButton: 'ĐĂNG KÝ',
      name: 'Tên',
      phoneNumber: 'Số điện thoại',
      email: 'Email',
      birthDate: 'Ngày sinh',
      gender: 'Giới tính',
      day: 'Ngày',
      month: 'Tháng',
      year: 'Năm',
      male: 'Nam',
      female: 'Nữ',
      termsTitle: 'Điều khoản đăng ký',
      terms1: 'Bằng việc bấm nút “Đăng Ký” bên dưới. Tôi đồng ý cho phép CG Việt Nam thực hiện xử lý dữ liệu cá nhân của tôi phù hợp với mục đích mà CG Việt Nam đã thông báo tại',
      terms2: 'Thông tin cá nhân cung cấp tại đây là chính xác và trùng khớp với thông tin tại CMND/CCCD/Thẻ Căn cước và/hoặc Giấy khai sinh (Giấy tờ tuỳ thân). Email cung cấp tại đây là chính xác và thuộc quyền quản lý duy nhất của tôi.',
      terms3: 'Xác nhận email chính xác và ngày sinh khớp với thông tin trên CMND/CCCD. Nếu không trùng khớp, các thông tin này sẽ không được hỗ trợ cập nhật thay đổi và có thể không được hưởng các',
      terms4: 'Tôi đồng ý với',
      privacyPolicy: 'Chính Sách Bảo Mật',
      memberBenefits: 'Quyền lợi thành viên',
      termsOfUse: 'Điều Khoản Sử Dụng Của CG',
      requiredName: 'Vui lòng nhập tên',
      requiredUsername: 'Vui lòng nhập tên đăng nhập',
      requiredPhone: 'Vui lòng nhập số điện thoại',
      requiredEmail: 'Vui lòng nhập email',
      invalidEmail: 'Email không hợp lệ',
      requiredPassword: 'Mật khẩu tối thiểu 6 ký tự',
      requiredBirthDate: 'Vui lòng chọn ngày sinh',
      requiredGender: 'Vui lòng chọn giới tính',
      requiredCaptcha: 'Captcha là bắt buộc',
      consentPrompt: 'Vui lòng đánh dấu xác nhận thông tin và đồng ý với Điều khoản Sử dụng của CG',
      consentLine: 'Bạn phải tích vào dòng này để tiếp tục.',
      registerSuccess: 'Đăng ký thành công. Vui lòng đăng nhập.',
      registerNote: 'Các mục đánh dấu bên trên là bắt buộc để hoàn tất đăng ký.',
      loginSuccessPrefix: 'Đăng nhập thành công, chào ',
      loginSuccess: 'Đăng nhập thành công',
      loginError: 'Đăng nhập không thành công',
      registerError: 'Đăng ký không thành công',
      captchaError: 'Không tải được captcha',
      captchaReload: 'Vui lòng tải lại captcha.'
    },
    account: {
      title: 'Thông tin tài khoản',
      memberStatus: 'Thành viên CGV',
      myTickets: 'Vé của tôi',
      overviewTitle: 'Thông tin chung',
      usernameLabel: 'Tên đăng nhập',
      loginStateLabel: 'Trạng thái',
      loggedIn: 'Đang đăng nhập',
      quickActionLabel: 'Chức năng nhanh',
      quickActionValue: 'Xem tài khoản và quản lý đăng xuất'
    }
  },
  en: {
    header: {
      slogan: 'Movie ticket deals - book fast, watch fast',
      deal: 'Exclusive low price',
      news: 'News & offers',
      myTickets: 'My tickets',
      loginRegister: 'Login / Register',
      hello: 'Hello,',
      viewAccount: 'View account',
      logout: 'Logout',
      movie: 'Movies',
      movieSub: 'Now showing',
      cinema: 'CineGo theaters',
      cinemaSub: 'Cinema',
      member: 'Members',
      memberSub: 'Account',
      cultureplex: 'Cultureplex',
      cultureplexSub: 'CineGo corner',
      buyNow: 'Buy tickets now',
      homeAria: 'CineGo home',
      vi: 'VN',
      en: 'EN'
    },
    footer: {
      companyName: 'CineGo Vietnam',
      intro: 'Introduction',
      onlineUtilities: 'Online utilities',
      giftCard: 'Gift card',
      careers: 'Careers',
      advertisingContact: 'CineGo advertising contact',
      partners: 'For partners',
      termsOfUse: 'Terms of use',
      generalTerms: 'General terms',
      transactionTerms: 'Transaction terms',
      paymentPolicy: 'Payment policy',
      privacyPolicy: 'Privacy policy',
      cinemaRules: 'Cinema rules',
      faq: 'Frequently asked questions',
      connectWithUs: 'Connect with us',
      customerCare: 'Customer care',
      hotlineLabel: 'Hotline: 1900 0240',
      workingHours: 'Working hours: 8:00 - 22:00 (All days including holidays)',
      supportEmail: 'Support email: hoidap@cinego.vn',
      legalName: 'CJ CINEGO VIETNAM CO., LTD.',
      businessCertificate: 'Business registration certificate: 0979389909 first registered on 15/04/2026, issued by the Hanoi Department of Planning and Investment',
      address: 'Address: No. 4 Quang Trung Street, Ha Dong Ward, Hanoi, Vietnam',
      hotline: 'Hotline: 1900 0240',
      copyright: 'COPYRIGHT 2026 CJ CINEGO VIETNAM CO., LTD. ALL RIGHTS RESERVED'
    },
    home: {
      ctaHub: 'CineGo theaters',
      ctaHubSub: 'Theater system',
      ctaMovies: 'Now Showing',
      ctaMoviesSub: 'Now playing',
      ctaSpecial: 'CineGo Special',
      ctaSpecialSub: 'CineGo signature',
      ctaRegister: 'Register Now',
      ctaRegisterSub: 'Sign up now',
      quickAccessTitle: 'Quick access',
      movieSelectionTitle: 'Movie selection',
      movieActionDetails: 'View details',
      movieActionBook: 'Booking',
      movieActionTrailer: 'Trailer',
      movieTrailerDetail: 'Description',
      movieEmptyTitle: 'No movies available yet',
      movieEmptyDescription: 'The poster grid will appear after the backend returns the movie list.',
      categoriesTitle: 'CineGo categories',
      categoriesSubtitle: 'Movies, theaters, members, cultureplex',
      nowShowingTitle: 'Now showing',
      nowShowingDescription: 'Explore the latest screening slots.',
      comingSoonTitle: 'Coming soon',
      comingSoonDescription: 'Track release dates and new trailers.',
      theatersDescription: 'Theater list by region, easy to choose quickly.',
      breadcrumbPhim: 'Movies',
      eventBadge: 'CineGo Member | News & Offers'
    },
    admin: {
      title: 'CineGo Admin',
      description: 'Configure theaters, movies, promotions, and reports.'
    },
    movies: {
      title: 'CineGo Movies',
      description: 'List of now-playing and coming-soon movies.',
      genre: 'Genre',
      duration: 'Duration',
      releaseDate: 'Release Date',
      director: 'Director',
      actor: 'Cast',
      language: 'Language',
      rated: 'Rated',
      contentTitle: 'Movie Details',
      showing: 'Now Showing',
      coming: 'Coming Soon',
      minutes: 'minutes',
      preBook: 'PRE-BOOK'
    },
    booking: {
      title: 'CineGo Booking',
      description: 'Choose screening, seats, and pay quickly.',
      chooseDate: 'Select Date',
      chooseCity: 'All Cities',
      chooseCinema: 'All Cinemas',
      noShowtimes: 'Sorry, no showtimes available for this date, please choose another day.',
      selectShowtime: 'Please select a date to view showtimes.',
      loadingSchedule: 'Loading information...',
      cityHcm: 'Ho Chi Minh',
      cityHn: 'Ha Noi',
      cityDn: 'Da Nang',
      roomStandard: '2D Subtitles',
      roomImax: 'IMAX 2D Subtitles',
      cinemaLabel: 'Cinema',
      personSeat: 'Person / Seat',
      screen: 'SCREEN',
      legendSelected: 'Selected',
      legendUnavailable: 'Unavailable',
      legendStandard: 'Standard',
      legendVip: 'VIP',
      legendSweetbox: 'Sweet Box',
      showtime: 'Showtime',
      roomLabel: 'Room',
      movieLabel: 'Movie',
      seatLabel: 'Seat',
      totalLabel: 'Total'
    },
    shared: {
      loading: 'Loading',
      website: 'Website',
      close: 'Close'
    },
    auth: {
      loginTab: 'Login',
      registerTab: 'Register',
      username: 'Username',
      password: 'Password',
      emailOrPhone: 'Username',
      captchaPrompt: 'Please enter the characters below *',
      captchaInput: 'Enter captcha',
      loadingCaptcha: 'Loading captcha...',
      noCaptcha: 'No captcha',
      forgotPassword: 'Forgot your password?',
      loginButton: 'LOGIN',
      registerButton: 'REGISTER',
      name: 'Name',
      phoneNumber: 'Phone number',
      email: 'Email',
      birthDate: 'Birth date',
      gender: 'Gender',
      day: 'Day',
      month: 'Month',
      year: 'Year',
      male: 'Male',
      female: 'Female',
      termsTitle: 'Registration terms',
      terms1: 'By clicking “Register” below, I agree to allow CG Vietnam to process my personal data according to the purpose disclosed in',
      terms2: 'The personal information provided here is accurate and matches my ID/CCCD/Passport and/or birth certificate. The email provided here is accurate and under my sole control.',
      terms3: 'I confirm the email and birth date match the information on my ID/CCCD. If they do not match, these details may not be updated and I may not receive',
      terms4: 'I agree to the',
      privacyPolicy: 'Privacy Policy',
      memberBenefits: 'member benefits',
      termsOfUse: 'CG Terms of Use',
      requiredName: 'Please enter your name',
      requiredUsername: 'Please enter a username',
      requiredPhone: 'Please enter your phone number',
      requiredEmail: 'Please enter your email',
      invalidEmail: 'Invalid email',
      requiredPassword: 'Password must be at least 6 characters',
      requiredBirthDate: 'Please choose a birth date',
      requiredGender: 'Please choose a gender',
      requiredCaptcha: 'Captcha is required',
      consentPrompt: 'Please check the information confirmations and agree to the CG Terms of Use',
      consentLine: 'You must check this line to continue.',
      registerSuccess: 'Registration successful. Please log in.',
      registerNote: 'All marked items above are required to complete registration.',
      loginSuccessPrefix: 'Login successful, welcome ',
      loginSuccess: 'Login successful',
      loginError: 'Login failed',
      registerError: 'Registration failed',
      captchaError: 'Unable to load captcha',
      captchaReload: 'Please reload the captcha.'
    },
    account: {
      title: 'Account information',
      memberStatus: 'CGV member',
      myTickets: 'My tickets',
      overviewTitle: 'General information',
      usernameLabel: 'Username',
      loginStateLabel: 'Status',
      loggedIn: 'Logged in',
      quickActionLabel: 'Quick action',
      quickActionValue: 'View account and manage logout'
    }
  }
} as const;

export type TranslationKey = keyof typeof translations.vi.auth | keyof typeof translations.vi.header;

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly language = signal<AppLanguage>(this.readLanguage());

  readonly currentLanguage = computed(() => this.language());

  constructor() {
    this.applyLanguage(this.language());
  }

  useLanguage(language: AppLanguage): void {
    this.language.set(language);
    this.persistLanguage(language);
    this.applyLanguage(language);
  }

  isActive(language: AppLanguage): boolean {
    return this.language() === language;
  }

  t(key: string): string {
    const language = this.language();
    const group = key.startsWith('header.')
      ? 'header'
      : key.startsWith('footer.')
        ? 'footer'
        : key.startsWith('home.')
          ? 'home'
          : key.startsWith('admin.')
            ? 'admin'
            : key.startsWith('movies.')
              ? 'movies'
              : key.startsWith('booking.')
                ? 'booking'
                : key.startsWith('shared.')
                  ? 'shared'
                  : 'auth';
    const normalizedKey = key.replace(/^header\.|^footer\.|^home\.|^admin\.|^movies\.|^booking\.|^shared\.|^auth\./, '');
    const currentTranslations = translations[language][group] as Record<string, string>;
    return currentTranslations[normalizedKey] ?? key;
  }

  private readLanguage(): AppLanguage {
    if (typeof localStorage === 'undefined') {
      return 'vi';
    }

    const storedLanguage = localStorage.getItem(STORAGE_KEY);
    return storedLanguage === 'en' ? 'en' : 'vi';
  }

  private persistLanguage(language: AppLanguage): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(STORAGE_KEY, language);
  }

  private applyLanguage(language: AppLanguage): void {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }
}
