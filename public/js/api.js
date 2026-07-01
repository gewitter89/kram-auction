// API Client for KRAM.UA
const API_BASE = '/api';

class AuctionAPI {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    // Headers with auth
    getHeaders(isJson = true) {
        const headers = {};
        if (isJson) headers['Content-Type'] = 'application/json';
        if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
        return headers;
    }

    // Generic fetch wrapper
    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            headers: this.getHeaders(options.isJson !== false),
            ...options
        };
        if (options.isJson === false) delete config.headers['Content-Type'];

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Помилка сервера');
            }
            return data;
        } catch (err) {
            if (err.message === 'Невалідний токен') {
                this.logout();
            }
            throw err;
        }
    }

    // ===== AUTH =====
    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        this.setAuth(data.token, data.user);
        return data;
    }

    async login(login, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ login, password })
        });
        this.setAuth(data.token, data.user);
        return data;
    }

    async getProfile() {
        return this.request('/auth/me');
    }

    async updateProfile(profileData) {
        return this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async changePassword(currentPassword, newPassword) {
        return this.request('/auth/password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    }

    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    }

    isLoggedIn() {
        return !!this.token;
    }

    // ===== LOTS =====
    async getLots(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/lots?${query}`);
    }

    async getTopLots() {
        return this.request('/lots/top');
    }

    async getLot(id) {
        return this.request(`/lots/${id}`);
    }

    async createLot(formData) {
        const url = `${API_BASE}/lots`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${this.token}` },
            body: formData // FormData for file upload
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data;
    }

    async updateLot(id, lotData) {
        return this.request(`/lots/${id}`, {
            method: 'PUT',
            body: JSON.stringify(lotData)
        });
    }

    async deleteLot(id) {
        return this.request(`/lots/${id}`, { method: 'DELETE' });
    }

    async getMyLots(status = 'active') {
        return this.request(`/lots/user/my?status=${status}`);
    }

    // ===== BIDS =====
    async placeBid(lotId, amount, isAuto = false, autoMax = null) {
        return this.request('/bids', {
            method: 'POST',
            body: JSON.stringify({ lotId, amount, isAuto, autoMax })
        });
    }

    async buyNow(lotId) {
        return this.request('/bids/buy-now', {
            method: 'POST',
            body: JSON.stringify({ lotId })
        });
    }

    async getMyBids() {
        return this.request('/bids/my');
    }

    async getBidHistory(lotId) {
        return this.request(`/bids/lot/${lotId}`);
    }

    // ===== FAVORITES =====
    async getFavorites() {
        return this.request('/favorites');
    }

    async addFavorite(lotId) {
        return this.request(`/favorites/${lotId}`, { method: 'POST' });
    }

    async removeFavorite(lotId) {
        return this.request(`/favorites/${lotId}`, { method: 'DELETE' });
    }

    // ===== MESSAGES =====
    async getConversations() {
        return this.request('/messages');
    }

    async getMessages(userId) {
        return this.request(`/messages/${userId}`);
    }

    async sendMessage(receiverId, text, lotId = null) {
        return this.request('/messages', {
            method: 'POST',
            body: JSON.stringify({ receiverId, text, lotId })
        });
    }

    async getUnreadCount() {
        return this.request('/messages/unread/count');
    }

    // ===== PURCHASES =====
    async getPurchases() {
        return this.request('/purchases');
    }

    async getSales() {
        return this.request('/purchases/sales');
    }

    async markPaid(purchaseId) {
        return this.request(`/purchases/${purchaseId}/pay`, { method: 'PUT' });
    }

    async markShipped(purchaseId, trackingNumber) {
        return this.request(`/purchases/${purchaseId}/ship`, {
            method: 'PUT',
            body: JSON.stringify({ trackingNumber })
        });
    }

    async markReceived(purchaseId) {
        return this.request(`/purchases/${purchaseId}/receive`, { method: 'PUT' });
    }

    async leaveReview(purchaseId, rating, text) {
        return this.request(`/purchases/${purchaseId}/review`, {
            method: 'POST',
            body: JSON.stringify({ rating, text })
        });
    }

    // ===== USERS =====
    async getUserProfile(username) {
        return this.request(`/users/${username}`);
    }

    async getUserLots(username, status = 'active') {
        return this.request(`/users/${username}/lots?status=${status}`);
    }

    // ===== CATEGORIES =====
    async getCategories() {
        return this.request('/categories');
    }

    // ===== NOTIFICATIONS =====
    async getNotifications() {
        return this.request('/notifications');
    }
}

// Global instance
const api = new AuctionAPI();

// Update UI based on auth state
function updateAuthUI() {
    const authLinks = document.querySelectorAll('[data-auth]');
    const guestLinks = document.querySelectorAll('[data-guest]');

    if (api.isLoggedIn()) {
        authLinks.forEach(el => el.style.display = '');
        guestLinks.forEach(el => el.style.display = 'none');
    } else {
        authLinks.forEach(el => el.style.display = 'none');
        guestLinks.forEach(el => el.style.display = '');
    }
}

document.addEventListener('DOMContentLoaded', updateAuthUI);
