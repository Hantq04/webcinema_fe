export interface AppNotification {
  id: number;
  title: string;
  content: string;
  type: string;
  read: boolean;
  createTime: string;
  readTime?: string;
}

export interface NotificationResponse {
  statusCode: number;
  message: string;
  data: {
    content: AppNotification[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export interface UnreadCountResponse {
  statusCode: number;
  message: string;
  data: number;
}
