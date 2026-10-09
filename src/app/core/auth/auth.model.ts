/**
 * Yêu cầu đăng nhập gửi lên POST /api/v1/auth/login.
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Phản hồi cặp Token trả về từ Backend (JWT Stateless).
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

/**
 * Hồ sơ chi tiết của người dùng từ GET /api/v1/auth/me.
 */
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  roles: string[];
  permissions: string[];
  createdAt: string;
}

/**
 * Payload yêu cầu xoay vòng Refresh Token.
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}
