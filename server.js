/**
 * 家常菜馆 · 实时同步服务器
 * 支持静态文件服务 + WebSocket 实时订单同步
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;
const WEB_DIR = path.join(__dirname, 'web');

// MIME 类型映射
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// 共享订单数据 (内存存储)
let orders = [];
let clients = new Map(); // ws -> { name, role }

// 创建 HTTP 服务器 (静态文件)
const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(WEB_DIR, urlPath);

  // 安全检查：防止目录遍历
  if (!filePath.startsWith(WEB_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

// 创建 WebSocket 服务器
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(data, exclude = null) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client !== exclude && client.readyState === 1) {
      client.send(msg);
    }
  });
}

function broadcastOrders() {
  broadcast({ type: 'sync', orders: orders });
}

wss.on('connection', (ws) => {
  console.log(`[WS] 新客户端连接，当前在线: ${wss.clients.size}`);
  clients.set(ws, { name: '匿名', role: 'customer' });

  // 发送当前所有订单
  ws.send(JSON.stringify({ type: 'sync', orders: orders }));

  // 发送在线人数
  broadcast({ type: 'online_count', count: wss.clients.size });

  ws.on('message', (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch (e) {
      return;
    }

    const clientInfo = clients.get(ws) || { name: '匿名', role: 'customer' };

    switch (data.type) {
      case 'set_info':
        if (data.name) clientInfo.name = data.name;
        if (data.role) clientInfo.role = data.role;
        clients.set(ws, clientInfo);
        break;

      case 'new_order':
        // 添加新订单
        if (data.order) {
          // 使用服务端时间戳防止冲突
          data.order.id = 'order_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
          data.order.created = Date.now();
          data.order.createdAt = new Date().toLocaleString('zh-CN');
          orders.unshift(data.order);
          console.log(`[订单] ${data.order.customerName} 下单 ¥${data.order.total}`);
          // 广播新订单给所有人
          broadcast({ type: 'order_added', order: data.order });
          // 通知商家
          broadcast({
            type: 'notification',
            message: `新订单来自 ${data.order.customerName}，共 ${data.order.count} 份菜品，¥${data.order.total}`,
            orderId: data.order.id,
            targetRole: 'merchant'
          });
        }
        break;

      case 'update_status':
        const order = orders.find(o => o.id === data.orderId);
        if (order) {
          order.status = data.status;
          console.log(`[状态] 订单 ${data.orderId.slice(-6)} -> ${data.status}`);
          broadcast({
            type: 'status_updated',
            orderId: data.orderId,
            status: data.status
          });
          // 通知顾客做菜进度
          const statusMessages = {
            preparing: `您的订单 #${data.orderId.slice(-6)} 商家已开始制作！`,
            ready: `您的订单 #${data.orderId.slice(-6)} 已完成，请准备取餐！`,
            cancelled: `您的订单 #${data.orderId.slice(-6)} 已取消`
          };
          if (statusMessages[data.status]) {
            broadcast({
              type: 'notification',
              message: statusMessages[data.status],
              orderId: data.orderId,
              targetRole: 'customer'
            });
          }
        }
        break;

      case 'delete_order':
        orders = orders.filter(o => o.id !== data.orderId);
        console.log(`[删除] 订单 ${data.orderId.slice(-6)}`);
        broadcast({ type: 'order_deleted', orderId: data.orderId });
        break;

      case 'clear_orders':
        // 只有商家可以清空所有订单
        if (clientInfo.role === 'merchant') {
          orders = [];
          console.log('[清空] 所有订单已清空');
          broadcastOrders();
        }
        break;
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WS] 客户端断开，当前在线: ${wss.clients.size}`);
    broadcast({ type: 'online_count', count: wss.clients.size });
  });

  ws.on('error', () => {
    clients.delete(ws);
  });
});

server.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  🍜 家常菜馆服务器已启动`);
  console.log(`  本地访问: http://localhost:${PORT}`);
  console.log(`  WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`  静态文件目录: ${WEB_DIR}`);
  console.log(`========================================\n`);
});
