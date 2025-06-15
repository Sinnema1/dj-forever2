import { jwtDecode } from 'jwt-decode';

interface UserToken {
  name: string;
  exp: number;
  data: {
    isAdmin: boolean;
  };
}

// Create a new class to instantiate for a user
class AuthService {
  /**
   * Get user profile from token
   */
  getProfile() {
    return jwtDecode(this.getToken());
  }

  /**
   * Check if user is logged in
   */
  loggedIn() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Check if logged in user is admin
   */
  isAdmin() {
    try {
      const decoded = jwtDecode<UserToken>(this.getToken());
      return decoded.data.isAdmin === true;
    } catch (err) {
      console.error('Failed to decode token for admin check:', err);
      return false;
    }
  }

  /**
   * Check if token is expired
   * @param token - JWT token string
   */
  isTokenExpired(token: string) {
    try {
      const decoded = jwtDecode<UserToken>(token);
      return decoded.exp < Date.now() / 1000;
    } catch (err) {
      console.error('Failed to decode token for expiry check:', err);
      return false;
    }
  }

  /**
   * Retrieve the user token from localStorage
   */
  getToken() {
    return localStorage.getItem('id_token') || '';
  }

  /**
   * Login: save token and redirect
   * @param idToken - JWT token string
   */
  login(idToken: string) {
    localStorage.setItem('id_token', idToken);
    window.location.assign('/');
  }

  /**
   * Logout: remove token and reset app state
   */
  logout() {
    localStorage.removeItem('id_token');
    window.location.assign('/');
  }
}

export default new AuthService();
