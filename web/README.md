# 🍜 家常菜馆 - 在线点单

朋友聚餐点单神器，手机浏览器直接访问，永久在线无需电脑开机。

---

## 🚀 快速部署（3 步搞定）

### 方法一：GitHub Pages（免费永久在线）

#### 步骤 1：创建 GitHub 仓库
1. 访问 [github.com](https://github.com) 注册/登录
2. 右上角 `+` → `New repository`
3. 仓库名填 `food-order`（或任意名称）
4. 选择 `Public`，勾选 `Add a README file`
5. 点击 `Create repository`

#### 步骤 2：上传文件
**方法 A：网页上传（新手推荐）**
1. 打开刚创建的仓库页面
2. 点击 `Add file` → `Upload files`
3. 把 `web/` 文件夹里的 **所有文件和文件夹** 拖进去
4. 点击 `Commit changes`

**方法 B：命令行上传**
```bash
# 在 web/ 目录下执行
cd d:\美食小程序\web
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/你的用户名/food-order.git
git push -u origin main
```

#### 步骤 3：开启 Pages
1. 仓库页面 → `Settings` → 左侧选 `Pages`
2. `Source` 选 `Deploy from a branch`
3. `Branch` 选 `main`，文件夹选 `/ (root)`
4. 点击 `Save`
5. 等待 1-2 分钟，页面会显示访问地址

**🎉 完成！** 访问 `https://你的用户名.github.io/food-order/`

---

### 方法二：Netlify（拖拽上线，最简单）

1. 访问 [app.netlify.com/drop](https://app.netlify.com/drop)
2. 把 `web/` 文件夹直接拖到页面上
3. 自动生成链接，立即可用 🎉

---

### 方法三：Vercel（国内速度快）

1. 访问 [vercel.com](https://vercel.com) 用 GitHub 账号登录
2. 点击 `Add New Project` → 选择你的 GitHub 仓库
3. Framework 选 `Other`
4. 点击 `Deploy`
5. 几秒后获得访问链接 🎉

---

## 📱 添加到手机主屏幕

部署完成后，在手机浏览器打开网站：

### Android（Chrome）
1. 右上角菜单 → `添加到主屏幕` 或 `安装应用`
2. 桌面会出现 App 图标，点击即用

### iOS（Safari）
1. 底部分享按钮 → `添加到主屏幕`
2. 桌面会出现 App 图标，点击即用

**✨ 现在可以像 App 一样使用，完全离线可用！**

---

## 💾 朋友共享订单

### 数据导出
在"我的"页面 → 点击 `📤 导出数据` → 下载 JSON 文件

### 数据导入
在"我的"页面 → 点击 `📥 导入数据` → 选择朋友发来的 JSON 文件

---

## 📂 项目结构

```
web/
├── index.html          # 主页面
├── manifest.json       # PWA 配置
├── service-worker.js    # 离线缓存
├── style.css           # 样式
├── app.js              # 核心逻辑
├── data.js             # 菜品数据
└── images/             # 菜品图片
```

---

## 🔧 本地开发

```bash
cd web
python -m http.server 8080
# 访问 http://localhost:8080
```

---

## ❓ 常见问题

**Q: GitHub Pages 访问慢？**
A: 改用 Vercel 或 Netlify，国内访问更快。

**Q: 手机安装后离线能用吗？**
A: 可以！Service Worker 会缓存所有资源，支持离线访问。

**Q: 数据会丢失吗？**
A: 数据存在浏览器本地存储（localStorage），清理浏览器数据会丢失。建议定期导出备份。
