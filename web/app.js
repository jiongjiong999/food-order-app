const App = {
  state: {
    currentTab: 'menu',
    currentCategory: '全部',
    currentOrderTab: 'all',
    orderView: 'all', // 'all' or 'mine' - 顾客查看全部或只看自己的
    cart: [],
    orders: [],
    role: 'customer',
    userName: '',
    wsConnected: false,
    onlineCount: 0,
  },

  ws: null,
  wsReconnectTimer: null,

  STORAGE_KEYS: {
    CART: 'food_web_cart',
    ORDERS: 'food_web_orders',
    ROLE: 'food_web_role',
    NAME: 'food_web_name',
  },

  init() {
    this.loadFromStorage();
    this.bindEvents();
    this.render();
    this.initWebSocket();
    // 支持 URL 参数切换标签 (PWA 快捷方式)
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['menu', 'cart', 'orders', 'mine'].includes(tab)) {
      this.setTab(tab);
    }
  },

  // ===== WebSocket 实时同步 =====
  initWebSocket() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${location.host}/ws`;
    try {
      this.ws = new WebSocket(wsUrl);
    } catch (e) {
      console.warn('WebSocket 连接失败，使用离线模式');
      this.updateConnectionStatus(false);
      return;
    }

    this.ws.onopen = () => {
      this.state.wsConnected = true;
      this.updateConnectionStatus(true);
      // 发送当前用户信息
      this.sendWsMessage({ type: 'set_info', name: this.state.userName, role: this.state.role });
    };

    this.ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        this.handleWsMessage(data);
      } catch (err) { console.error('WS message error:', err); }
    };

    this.ws.onclose = () => {
      this.state.wsConnected = false;
      this.updateConnectionStatus(false);
      // 自动重连（3秒后）
      this.wsReconnectTimer = setTimeout(() => this.initWebSocket(), 3000);
    };

    this.ws.onerror = () => {
      this.state.wsConnected = false;
      this.updateConnectionStatus(false);
    };
  },

  sendWsMessage(data) {
    if (this.ws && this.ws.readyState === 1) {
      this.ws.send(JSON.stringify(data));
    }
  },

  handleWsMessage(data) {
    switch (data.type) {
      case 'sync':
        // 全量同步订单
        this.state.orders = data.orders || [];
        this.saveOrders();
        this.renderOrders();
        this.renderMine();
        break;

      case 'order_added':
        // 新订单添加（来自其他用户）
        if (!this.state.orders.find(o => o.id === data.order.id)) {
          this.state.orders.unshift(data.order);
          this.saveOrders();
          this.renderOrders();
          this.renderMine();
          // 如果当前不在订单页面，显示提示
          if (this.state.currentTab !== 'orders') {
            this.showToast(`🛎 ${data.order.customerName} 新下了订单`);
          }
        }
        break;

      case 'status_updated':
        // 订单状态更新
        const order = this.state.orders.find(o => o.id === data.orderId);
        if (order) {
          order.status = data.status;
          this.saveOrders();
          this.renderOrders();
        }
        break;

      case 'order_deleted':
        this.state.orders = this.state.orders.filter(o => o.id !== data.orderId);
        this.saveOrders();
        this.renderOrders();
        this.renderMine();
        break;

      case 'notification':
        // 实时通知
        if (!data.targetRole || data.targetRole === this.state.role) {
          this.showNotification(data.message);
        }
        break;

      case 'online_count':
        this.state.onlineCount = data.count;
        this.updateOnlineCount();
        break;
    }
  },

  updateConnectionStatus(connected) {
    const indicator = document.getElementById('connStatus');
    if (indicator) {
      indicator.className = 'conn-status ' + (connected ? 'connected' : 'disconnected');
      indicator.title = connected ? '实时同步已连接' : '离线模式 - 实时同步断开';
    }
  },

  updateOnlineCount() {
    const el = document.getElementById('onlineCount');
    if (el) {
      el.textContent = this.state.onlineCount > 0 ? `${this.state.onlineCount} 人在线` : '';
    }
  },

  showNotification(msg) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerHTML = `<span class="notif-icon">🔔</span><span class="notif-text">${msg}</span>`;
    document.body.appendChild(notif);
    requestAnimationFrame(() => notif.classList.add('show'));
    setTimeout(() => {
      notif.classList.remove('show');
      setTimeout(() => notif.remove(), 400);
    }, 3500);
  },

  loadFromStorage() {
    try {
      const cart = localStorage.getItem(this.STORAGE_KEYS.CART);
      if (cart) this.state.cart = JSON.parse(cart);
      const orders = localStorage.getItem(this.STORAGE_KEYS.ORDERS);
      if (orders) this.state.orders = JSON.parse(orders);
      const role = localStorage.getItem(this.STORAGE_KEYS.ROLE);
      if (role) this.state.role = role;
      const name = localStorage.getItem(this.STORAGE_KEYS.NAME);
      if (name) this.state.userName = name;
    } catch (e) { console.error('Load error:', e); }
  },

  saveCart() {
    localStorage.setItem(this.STORAGE_KEYS.CART, JSON.stringify(this.state.cart));
  },

  saveOrders() {
    localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(this.state.orders));
  },

  setTab(tab) {
    this.state.currentTab = tab;
    this.updateTabBar();
    // 滚动到顶部
    const main = document.querySelector('.main');
    if (main) main.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  setCategory(cat) {
    this.state.currentCategory = cat;
    this.renderMenu();
  },

  setRole(role) {
    this.state.role = role;
    localStorage.setItem(this.STORAGE_KEYS.ROLE, role);
    this.sendWsMessage({ type: 'set_info', name: this.state.userName, role: role });
    this.renderMine();
    this.renderOrders();
  },

  setName(name) {
    this.state.userName = name;
    localStorage.setItem(this.STORAGE_KEYS.NAME, name);
    this.sendWsMessage({ type: 'set_info', name: name, role: this.state.role });
    this.renderMine();
  },

  addToCart(dish) {
    const existing = this.state.cart.find(i => i.dishId === dish.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.state.cart.push({
        dishId: dish.id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        quantity: 1
      });
    }
    this.saveCart();
    this.renderMenu();
    this.renderCart();
    this.updateCartBadge();
    this.showToast('已加入购物车');
    this.pulseCartBadge();
  },

  removeFromCart(dishId) {
    this.state.cart = this.state.cart.filter(i => i.dishId !== dishId);
    this.saveCart();
    this.renderCart();
    this.renderMenu();
    this.updateCartBadge();
  },

  updateQuantity(dishId, delta) {
    const item = this.state.cart.find(i => i.dishId === dishId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeFromCart(dishId);
    } else {
      this.saveCart();
      this.renderCart();
      this.renderMenu();
      this.updateCartBadge();
    }
  },

  getCartTotal() {
    return this.state.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  getCartCount() {
    return this.state.cart.reduce((sum, i) => sum + i.quantity, 0);
  },

  getDishQuantity(dishId) {
    const item = this.state.cart.find(i => i.dishId === dishId);
    return item ? item.quantity : 0;
  },

  clearCart() {
    this.state.cart = [];
    this.saveCart();
    this.renderCart();
    this.renderMenu();
    this.updateCartBadge();
  },

  submitOrder() {
    if (this.state.cart.length === 0) {
      this.showToast('购物车是空的');
      return;
    }
    const order = {
      id: 'order_' + Date.now(),
      items: JSON.parse(JSON.stringify(this.state.cart)),
      total: Math.round(this.getCartTotal() * 100) / 100,
      count: this.getCartCount(),
      status: 'pending',
      customerName: this.state.userName || '匿名',
      createdAt: new Date().toLocaleString('zh-CN'),
      created: Date.now()
    };
    // 通过 WebSocket 发送到服务器
    if (this.state.wsConnected) {
      this.sendWsMessage({ type: 'new_order', order: order });
    } else {
      // 离线模式：仅保存到本地
      this.state.orders.unshift(order);
      this.saveOrders();
    }
    this.clearCart();
    this.state.currentTab = 'orders';
    this.updateTabBar();
    this.renderOrders();
    this.renderMine();
    this.showToast('下单成功！');
  },

  updateOrderStatus(orderId, status) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      this.saveOrders();
      this.renderOrders();
      // 通过 WebSocket 同步状态
      if (this.state.wsConnected) {
        this.sendWsMessage({ type: 'update_status', orderId: orderId, status: status });
      }
      this.showToast('状态已更新');
    }
  },

  getStatusText(status) {
    const map = {
      pending: '待处理',
      preparing: '制作中',
      ready: '已完成',
      cancelled: '已取消'
    };
    return map[status] || status;
  },

  getStatusBg(status) {
    const map = {
      pending: '#FFF2E8',
      preparing: '#DBEAFE',
      ready: '#DCFCE7',
      cancelled: '#F3F4F6'
    };
    return map[status] || '#F3F4F6';
  },

  getStatusColor(status) {
    const map = {
      pending: '#FF6B35',
      preparing: '#3B82F6',
      ready: '#22C55E',
      cancelled: '#9CA3AF'
    };
    return map[status] || '#9CA3AF';
  },

  getOrdersByStatus(status) {
    if (status === 'all') return this.state.orders;
    return this.state.orders.filter(o => o.status === status);
  },

  deleteOrder(orderId) {
    this.state.orders = this.state.orders.filter(o => o.id !== orderId);
    this.saveOrders();
    this.renderOrders();
    this.renderMine();
    // 通过 WebSocket 同步删除
    if (this.state.wsConnected) {
      this.sendWsMessage({ type: 'delete_order', orderId: orderId });
    }
  },

  getSpiceLevelText(level) {
    const map = [
      { text: '不辣', icon: '🟢', color: '#22C55E' },
      { text: '微辣', icon: '🟡', color: '#F59E0B' },
      { text: '中辣', icon: '🟠', color: '#FF6B35' },
      { text: '重辣', icon: '🔴', color: '#EF4444' }
    ];
    return map[level] || map[0];
  },

  openDishDetail(dishId) {
    const dish = dishes.find(d => d.id === dishId);
    if (!dish) return;
    const qty = this.getDishQuantity(dish.id);
    const spice = this.getSpiceLevelText(dish.spiceLevel || 0);
    const modal = document.getElementById('dishDetailModal');
    if (!modal) return;

    const ingredientsHtml = dish.ingredients.map(ing =>
      `<span class="detail-ingredient">${ing}</span>`
    ).join('');

    const stepsHtml = dish.steps.map((step, i) =>
      `<div class="detail-step">
        <span class="detail-step__num">${i + 1}</span>
        <span class="detail-step__text">${step}</span>
      </div>`
    ).join('');

    modal.innerHTML = `
      <div class="detail-backdrop" data-close-detail></div>
      <div class="detail-modal">
        <div class="detail-hero">
          <img src="${dish.image}" alt="${dish.name}" class="detail-hero__img">
          <button class="detail-close" data-close-detail>✕</button>
          ${dish.recommended ? '<span class="detail-badge">🔥 推荐菜品</span>' : ''}
        </div>
        <div class="detail-body">
          <div class="detail-header">
            <h2 class="detail-name">${dish.name}</h2>
            <span class="detail-price">¥${dish.price}</span>
          </div>
          <div class="detail-tags">
            ${dish.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
          <div class="detail-meta">
            <div class="detail-meta__item">
              <span class="detail-meta__icon">⏱</span>
              <span class="detail-meta__label">${dish.cookingTime}</span>
            </div>
            <div class="detail-meta__item">
              <span class="detail-meta__icon">${spice.icon}</span>
              <span class="detail-meta__label" style="color:${spice.color}">${spice.text}</span>
            </div>
            <div class="detail-meta__item">
              <span class="detail-meta__icon">🔥</span>
              <span class="detail-meta__label">${dish.calories} 千卡</span>
            </div>
            <div class="detail-meta__item">
              <span class="detail-meta__icon">🍽</span>
              <span class="detail-meta__label">${dish.servingSize}</span>
            </div>
          </div>
          <div class="detail-section">
            <h3 class="detail-section__title">📝 菜品介绍</h3>
            <p class="detail-desc">${dish.description}</p>
          </div>
          <div class="detail-section">
            <h3 class="detail-section__title">🥘 所需食材</h3>
            <div class="detail-ingredients">${ingredientsHtml}</div>
          </div>
          <div class="detail-section">
            <h3 class="detail-section__title">👨‍🍳 烹饪步骤</h3>
            <div class="detail-steps">${stepsHtml}</div>
          </div>
          <div class="detail-section">
            <h3 class="detail-section__title">💡 小贴士</h3>
            <p class="detail-tips">${dish.tips}</p>
          </div>
          <div class="detail-section">
            <h3 class="detail-section__title">📊 营养参考</h3>
            <div class="detail-nutrition">
              <div class="detail-nutrition__item">
                <span class="detail-nutrition__value">${dish.calories}</span>
                <span class="detail-nutrition__label">千卡/份</span>
              </div>
              <div class="detail-nutrition__item">
                <span class="detail-nutrition__value">${dish.sales}</span>
                <span class="detail-nutrition__label">月销量</span>
              </div>
              <div class="detail-nutrition__item">
                <span class="detail-nutrition__value">${dish.servingSize}</span>
                <span class="detail-nutrition__label">建议份量</span>
              </div>
            </div>
          </div>
        </div>
        <div class="detail-footer">
          ${qty > 0 ? `
            <div class="qty-control detail-qty">
              <button class="qty-btn minus" data-minus="${dish.id}">−</button>
              <span class="qty-num">${qty}</span>
              <button class="qty-btn plus" data-plus="${dish.id}">+</button>
            </div>
            <button class="detail-footer__btn" data-close-detail>已完成</button>
          ` : `
            <button class="detail-footer__btn" data-detail-add="${dish.id}">加入购物车 ¥${dish.price}</button>
          `}
        </div>
      </div>
    `;
    modal.classList.add('detail-overlay--active');
    document.body.style.overflow = 'hidden';
  },

  closeDishDetail() {
    const modal = document.getElementById('dishDetailModal');
    if (modal) {
      modal.classList.remove('detail-overlay--active');
      modal.innerHTML = '';
      document.body.style.overflow = '';
      this.renderMenu();
    }
  },

  showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, 1500);
  },

  pulseCartBadge() {
    document.querySelectorAll('.badge').forEach(badge => {
      badge.style.animation = 'none';
      void badge.offsetWidth;
      badge.style.animation = 'badgePop 0.4s var(--ease-out)';
    });
  },

  exportData() {
    const data = {
      version: '2.0',
      exportAt: new Date().toISOString(),
      orders: this.state.orders,
      cart: this.state.cart,
      userName: this.state.userName,
      role: this.state.role
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'food-order-data-' + Date.now() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.showToast('数据已导出');
  },

  importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.orders && Array.isArray(data.orders)) {
          const shouldMerge = confirm('是否合并数据？\n\n点击"确定"合并订单\n点击"取消"替换所有数据');
          if (shouldMerge) {
            const existingIds = new Set(this.state.orders.map(o => o.id));
            const newOrders = data.orders.filter(o => !existingIds.has(o.id));
            this.state.orders = [...newOrders, ...this.state.orders];
          } else {
            this.state.orders = data.orders;
          }
          if (data.userName) this.state.userName = data.userName;
          if (data.role) this.state.role = data.role;
          this.saveOrders();
          localStorage.setItem(this.STORAGE_KEYS.NAME, this.state.userName);
          localStorage.setItem(this.STORAGE_KEYS.ROLE, this.state.role);
          this.render();
          this.showToast('导入成功！');
        } else {
          this.showToast('无效的数据文件');
        }
      } catch (err) {
        console.error('Import error:', err);
        this.showToast('导入失败：文件格式错误');
      }
    };
    reader.readAsText(file);
  },

  clearAllData() {
    if (!confirm('确定清空所有数据？此操作不可恢复！')) return;
    localStorage.removeItem(this.STORAGE_KEYS.CART);
    localStorage.removeItem(this.STORAGE_KEYS.ORDERS);
    localStorage.removeItem(this.STORAGE_KEYS.ROLE);
    localStorage.removeItem(this.STORAGE_KEYS.NAME);
    // 如果是商家且已连接，清空服务器上的所有订单
    if (this.state.wsConnected && this.state.role === 'merchant') {
      this.sendWsMessage({ type: 'clear_orders' });
    }
    this.state.cart = [];
    this.state.orders = [];
    this.render();
    this.showToast('已清空所有数据');
  },

  bindEvents() {
    document.addEventListener('click', (e) => {
      const tabEl = e.target.closest('[data-tab]');
      if (tabEl) {
        this.setTab(tabEl.dataset.tab);
        return;
      }
      const catEl = e.target.closest('[data-category]');
      if (catEl) {
        this.setCategory(catEl.dataset.category);
        return;
      }
      const detailEl = e.target.closest('[data-detail]');
      if (detailEl) {
        this.openDishDetail(detailEl.dataset.detail);
        return;
      }
      const closeDetailEl = e.target.closest('[data-close-detail]');
      if (closeDetailEl) {
        this.closeDishDetail();
        return;
      }
      const detailAddEl = e.target.closest('[data-detail-add]');
      if (detailAddEl) {
        const dish = dishes.find(d => d.id === detailAddEl.dataset.detailAdd);
        if (dish) this.addToCart(dish);
        this.closeDishDetail();
        return;
      }
      const addBtn = e.target.closest('[data-add]');
      if (addBtn) {
        const dishId = addBtn.dataset.add;
        const dish = dishes.find(d => d.id === dishId);
        if (dish) this.addToCart(dish);
        return;
      }
      const minusBtn = e.target.closest('[data-minus]');
      if (minusBtn) {
        this.updateQuantity(minusBtn.dataset.minus, -1);
        return;
      }
      const plusBtn = e.target.closest('[data-plus]');
      if (plusBtn) {
        this.updateQuantity(plusBtn.dataset.plus, 1);
        return;
      }
      const removeBtn = e.target.closest('[data-remove]');
      if (removeBtn) {
        this.removeFromCart(removeBtn.dataset.remove);
        return;
      }
      const submitBtn = e.target.closest('[data-submit]');
      if (submitBtn) {
        this.submitOrder();
        return;
      }
      const statusBtn = e.target.closest('[data-status]');
      if (statusBtn) {
        const id = statusBtn.dataset.status;
        const statusValue = statusBtn.dataset.statusValue;
        if (id && statusValue) {
          this.updateOrderStatus(id, statusValue);
        }
        return;
      }
      const deleteOrderBtn = e.target.closest('[data-delete-order]');
      if (deleteOrderBtn) {
        this.deleteOrder(deleteOrderBtn.dataset.deleteOrder);
        return;
      }
      const orderTabBtn = e.target.closest('[data-order-tab]');
      if (orderTabBtn) {
        this.state.currentOrderTab = orderTabBtn.dataset.orderTab;
        this.renderOrders();
        return;
      }
      const orderViewBtn = e.target.closest('[data-order-view]');
      if (orderViewBtn) {
        this.state.orderView = orderViewBtn.dataset.orderView;
        this.renderOrders();
        return;
      }
      const roleBtn = e.target.closest('[data-role]');
      if (roleBtn) {
        this.setRole(roleBtn.dataset.role);
        return;
      }
      const exportBtn = e.target.closest('[data-export]');
      if (exportBtn) {
        this.exportData();
        return;
      }
      const saveNameBtn = e.target.closest('[data-save-name]');
      if (saveNameBtn) {
        const input = document.getElementById('nameInput');
        if (input) {
          this.setName(input.value.trim());
        }
        return;
      }
      const clearDataBtn = e.target.closest('[data-clear-all]');
      if (clearDataBtn) {
        this.clearAllData();
        return;
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.id === 'importFile') {
        const file = e.target.files[0];
        if (file) this.importData(file);
        e.target.value = '';
      }
    });
  },

  render() {
    this.renderMenu();
    this.renderCart();
    this.renderOrders();
    this.renderMine();
    this.updateCartBadge();
    this.updateTabBar();
  },

  updateTabBar() {
    // 更新底部导航和侧边栏
    document.querySelectorAll('[data-tab]').forEach(item => {
      item.classList.toggle('active', item.dataset.tab === this.state.currentTab);
    });
    const pageMap = { menu: 'menuPage', cart: 'cartPage', orders: 'ordersPage', mine: 'minePage' };
    const targetId = pageMap[this.state.currentTab];
    document.querySelectorAll('.page').forEach(section => {
      section.classList.toggle('page--active', section.id === targetId);
    });
  },

  updateCartBadge() {
    const count = this.getCartCount();
    document.querySelectorAll('.badge').forEach(badge => {
      badge.textContent = count > 0 ? count : '';
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  renderMenu() {
    const filtered = this.state.currentCategory === '全部'
      ? dishes
      : dishes.filter(d => d.category === this.state.currentCategory);

    const categoriesHtml = categories.map(cat =>
      `<button class="category-tab ${cat === this.state.currentCategory ? 'active' : ''}" data-category="${cat}">${cat}</button>`
    ).join('');

    const dishesHtml = filtered.map((dish, i) => {
      const qty = this.getDishQuantity(dish.id);
      return `
        <div class="dish-card" style="animation: fadeInUp 0.4s var(--ease-out) ${i * 0.04}s both">
          <div class="dish-image" data-detail="${dish.id}">
            <img src="${dish.image}" alt="${dish.name}" loading="lazy">
            ${dish.recommended ? '<span class="badge-hot">🔥 推荐</span>' : ''}
          </div>
          <div class="dish-info" data-detail="${dish.id}">
            <h3 class="dish-name">${dish.name}</h3>
            <div class="dish-tags">
              ${dish.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
            <p class="dish-desc">${dish.description}</p>
            <div class="dish-sales">月售 ${dish.sales}</div>
          </div>
          <div class="dish-action">
            <span class="dish-price">¥${dish.price}</span>
            ${qty > 0 ? `
              <div class="qty-control">
                <button class="qty-btn minus" data-minus="${dish.id}">−</button>
                <span class="qty-num">${qty}</span>
                <button class="qty-btn plus" data-plus="${dish.id}">+</button>
              </div>
            ` : `
              <button class="add-btn" data-add="${dish.id}">+</button>
            `}
          </div>
        </div>
      `;
    }).join('');

    const container = document.getElementById('menuPage');
    if (container) {
      container.innerHTML = `
        <div class="page-header">
          <div class="header-title">🍜 家常菜馆</div>
          <div class="header-subtitle">点单聚餐，其乐融融</div>
        </div>
        <div class="category-tabs">${categoriesHtml}</div>
        <div class="dish-list">${dishesHtml}</div>
      `;
    }
  },

  renderCart() {
    const container = document.getElementById('cartPage');
    if (!container) return;

    if (this.state.cart.length === 0) {
      container.innerHTML = `
        <div class="page-header">
          <div class="header-title">🛒 购物车</div>
        </div>
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <div class="empty-text">购物车空空如也</div>
          <div class="empty-hint">去选点好吃的吧~</div>
        </div>
      `;
      return;
    }

    const cartItemsHtml = this.state.cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">¥${item.price}</div>
        </div>
        <div class="cart-item-actions">
          <button class="qty-btn minus" data-minus="${item.dishId}">−</button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn plus" data-plus="${item.dishId}">+</button>
          <button class="remove-btn" data-remove="${item.dishId}" title="删除">🗑</button>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="page-header">
        <div class="header-title">🛒 购物车</div>
        <div class="header-subtitle">${this.getCartCount()} 份菜品</div>
      </div>
      <div class="cart-list">${cartItemsHtml}</div>
      <div class="cart-footer">
        <div class="cart-total">
          合计: <span class="price">¥${this.getCartTotal().toFixed(2)}</span>
        </div>
        <button class="submit-btn" data-submit>提交订单</button>
      </div>
    `;
  },

  renderOrders() {
    const container = document.getElementById('ordersPage');
    if (!container) return;

    const statusTabs = [
      { key: 'all', label: '全部' },
      { key: 'pending', label: '待处理' },
      { key: 'preparing', label: '制作中' },
      { key: 'ready', label: '已完成' }
    ];
    const currentStatusTab = this.state.currentOrderTab || 'all';
    const isMerchant = this.state.role === 'merchant';

    // 筛选订单：商家看全部，顾客可选择看全部或只看自己的
    let displayOrders = this.state.orders;
    if (!isMerchant && this.state.orderView === 'mine') {
      displayOrders = displayOrders.filter(o =>
        (o.customerName || '匿名') === (this.state.userName || '匿名')
      );
    }

    // 按状态筛选
    const filteredOrders = currentStatusTab === 'all'
      ? displayOrders
      : displayOrders.filter(o => o.status === currentStatusTab);

    // 顾客模式的视图切换按钮
    const viewToggleHtml = !isMerchant ? `
      <div class="view-toggle">
        <button class="view-toggle__btn ${this.state.orderView === 'all' ? 'active' : ''}" data-order-view="all">📋 全部订单</button>
        <button class="view-toggle__btn ${this.state.orderView === 'mine' ? 'active' : ''}" data-order-view="mine">👤 我的订单</button>
      </div>
    ` : '';

    const onlineHtml = this.state.onlineCount > 0
      ? `<span class="online-badge">🟢 ${this.state.onlineCount} 人在线</span>`
      : '';

    if (filteredOrders.length === 0) {
      container.innerHTML = `
        <div class="page-header">
          <div class="header-title">${isMerchant ? '👨‍🍳 订单管理' : '📋 订单'}</div>
          <div class="header-subtitle">${onlineHtml}</div>
        </div>
        ${viewToggleHtml}
        <div class="order-tabs">
          ${statusTabs.map(t => `
            <button class="order-tab ${t.key === currentStatusTab ? 'active' : ''}" data-order-tab="${t.key}">${t.label}</button>
          `).join('')}
        </div>
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-text">${isMerchant ? '暂无订单' : '暂无订单'}</div>
          <div class="empty-hint">${isMerchant ? '顾客下单后会实时显示在这里' : '下单后可以在这里查看进度'}</div>
        </div>
      `;
      return;
    }

    const ordersHtml = filteredOrders.map(order => {
      const canUpdate = isMerchant;
      const statusColor = this.getStatusColor(order.status);
      const statusBg = this.getStatusBg(order.status);
      const statusActions = {
        pending: canUpdate ? '<button class="status-btn" data-status="' + order.id + '" data-status-value="preparing">开始制作</button>' : '',
        preparing: canUpdate ? '<button class="status-btn success" data-status="' + order.id + '" data-status-value="ready">标记完成</button>' : '',
        ready: canUpdate ? '<button class="status-btn" data-status="' + order.id + '" data-status-value="pending">重新制作</button>' : '',
        cancelled: ''
      };

      // 高亮当前用户的订单
      const isMine = (order.customerName || '匿名') === (this.state.userName || '匿名');
      const mineClass = !isMerchant && isMine ? ' order-card--mine' : '';

      const itemsHtml = (order.items || []).map(i => `
        <div class="order-item">
          <span class="order-item-name">${i.name}</span>
          <span class="order-item-qty">×${i.quantity}</span>
          <span class="order-item-price">¥${(i.price * i.quantity).toFixed(2)}</span>
        </div>
      `).join('');

      return `
        <div class="order-card${mineClass}">
          <div class="order-header">
            <div class="order-id">#${order.id.slice(-6)}</div>
            <div class="order-status" style="color:${statusColor};background:${statusBg}">
              ${this.getStatusText(order.status)}
            </div>
          </div>
          <div class="order-customer">👤 ${order.customerName || '匿名'}${isMine && !isMerchant ? ' (我)' : ''}</div>
          <div class="order-items">${itemsHtml}</div>
          <div class="order-footer">
            <div class="order-time">${order.createdAt}</div>
            <div class="order-total">合计: <span class="price">¥${(order.total || 0).toFixed(2)}</span></div>
          </div>
          ${statusActions[order.status] || ''}
          ${isMerchant ? `
            <div class="order-actions">
              <button class="delete-btn" data-delete-order="${order.id}">删除</button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="page-header">
        <div class="header-title">${isMerchant ? '👨‍🍳 订单管理' : '📋 订单'}</div>
        <div class="header-subtitle">${onlineHtml}</div>
      </div>
      ${viewToggleHtml}
      <div class="order-tabs">
        ${statusTabs.map(t => `
          <button class="order-tab ${t.key === currentStatusTab ? 'active' : ''}" data-order-tab="${t.key}">${t.label}</button>
        `).join('')}
      </div>
      <div class="orders-list">${ordersHtml}</div>
    `;
  },

  renderMine() {
    const container = document.getElementById('minePage');
    if (!container) return;

    const customerCount = this.state.orders.length;
    const totalAmount = this.state.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    container.innerHTML = `
      <div class="page-header">
        <div class="header-title">👤 我的</div>
      </div>

      <div class="profile-card">
        <div class="profile-avatar">${this.state.userName ? this.state.userName[0].toUpperCase() : '?'}</div>
        <div class="profile-info">
          <div class="profile-name">${this.state.userName || '未登录'}</div>
          <div class="profile-role">
            <span class="role-tag ${this.state.role}">${this.state.role === 'merchant' ? '商家模式' : '顾客模式'}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">角色切换</div>
        <div class="role-switch">
          <button class="role-btn ${this.state.role === 'customer' ? 'active' : ''}" data-role="customer">
            🍽 顾客
          </button>
          <button class="role-btn ${this.state.role === 'merchant' ? 'active' : ''}" data-role="merchant">
            👨‍🍳 商家
          </button>
        </div>
      </div>

      <div class="section">
        <div class="section-title">昵称设置</div>
        <div class="name-input-wrap">
          <input type="text" id="nameInput" class="name-input" placeholder="输入你的昵称" value="${this.state.userName}" maxlength="10">
          <button class="name-save-btn" data-save-name>保存</button>
        </div>
      </div>

      <div class="section">
        <div class="section-title">数据统计</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-num">${customerCount}</div>
            <div class="stat-label">总订单</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">¥${totalAmount.toFixed(0)}</div>
            <div class="stat-label">消费总额</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">实时同步 <span class="section-hint">多人在线共享</span></div>
        <div class="sync-info">
          <div class="sync-status ${this.state.wsConnected ? 'online' : 'offline'}">
            <span class="sync-dot"></span>
            <span>${this.state.wsConnected ? '已连接 - 实时同步中' : '离线模式'}</span>
            ${this.state.onlineCount > 0 ? `<span class="sync-count">${this.state.onlineCount} 人在线</span>` : ''}
          </div>
          <div class="sync-guide">
            <strong>使用说明：</strong>
            <ol>
              <li>所有设备打开同一个链接即可自动同步</li>
              <li>顾客下单后，商家手机上实时显示新订单</li>
              <li>商家更新制作进度，顾客自动收到通知</li>
              <li>顾客可在"订单"页查看全部订单或只看自己的</li>
            </ol>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">操作</div>
        <div class="action-list">
          <button class="action-btn danger" data-clear-all>
            🗑 清空所有数据
          </button>
        </div>
      </div>

      <div class="app-footer">
        <p>🍜 家常菜馆 Web版 v3.0</p>
        <p>支持实时同步 · 多人在线点单</p>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
