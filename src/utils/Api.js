class Api {
  constructor({ baseUrl, headers }) {
    this._baseUrl = baseUrl;
    this._headers = headers;
  }

  // New helper method to handle fetch and response checking
  _request(url, options) {
    return fetch(url, options).then(this._checkResponse);
  }

  // Helper to check response status and return JSON or error
  _checkResponse(res) {
    if (res.ok) return res.json();
    return Promise.reject(`Error: ${res.status} ${res.statusText}`);
  }

  // Method to get both user info and cards at once
  getAppInfo() {
    return Promise.all([this.getInitialCards(), this.getUserInfo()]);
  }

  // Refactored methods to use _request
  getUserInfo() {
    return this._request(`${this._baseUrl}/users/me`, {
      headers: this._headers,
    });
  }

  getInitialCards() {
    return this._request(`${this._baseUrl}/cards`, {
      headers: this._headers,
    });
  }

  editUserInfo({ name, about }) {
    return this._request(`${this._baseUrl}/users/me`, {
      method: "PATCH",
      headers: this._headers,
      body: JSON.stringify({ name, about }),
    });
  }

  editAvatarInfo(avatar) {
    return this._request(`${this._baseUrl}/users/me/avatar`, {
      method: "PATCH",
      headers: this._headers,
      body: JSON.stringify({ avatar }),
    });
  }

  deleteCard(id) {
    return this._request(`${this._baseUrl}/cards/${id}`, {
      method: "DELETE",
      headers: this._headers,
    });
  }

  addCard({ name, link }) {
    return this._request(`${this._baseUrl}/cards`, {
      method: "POST",
      headers: this._headers,
      body: JSON.stringify({ name, link }),
    });
  }

  handleLikeStatus(id, isLiked) {
    return this._request(`${this._baseUrl}/cards/${id}/likes`, {
      method: isLiked ? "DELETE" : "PUT",
      headers: this._headers,
    });
  }
}

export default Api;
