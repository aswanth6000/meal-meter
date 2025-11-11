# 🥗 Meal Meter

**Meal Meter** is a minimalist browser extension that helps you **track how much you’ve spent on Zomato and Swiggy** — see your total spend, number of orders, and average order value, all in one click.

> 💡 Stay mindful of your food spending while enjoying your favorite meals!

---

## 🚀 Features

* 🍕 Tracks total spending on **Zomato** and **Swiggy**
* 💰 Calculates **average spend per order**
* 📈 Displays overall spending insights
* 🔒 Works locally — no external data sharing
* ⚡ Built with **Vite + React + Manifest V3**

---

## 🥉 Installation

### 🔸 Chrome (Manual / Unpacked)

> **Note:** This extension is not yet available on the Chrome Web Store. Stay tuned for updates!

1. Download the latest ZIP from the [Releases](./releases) page.
2. Extract the ZIP file to a folder on your computer.
3. Open `chrome://extensions` in your Chrome browser.
4. Enable **Developer mode** (toggle in the top-right corner).
5. Click **Load unpacked**, then select the extracted folder.

<!-- ###  Microsoft Edge (Free Publishing)

Meal Meter works perfectly on Edge.

1. Open `edge://extensions`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the extracted folder
5. Optionally, publish it via the [Microsoft Partner Center](https://partner.microsoft.com/dashboard/microsoftedge) (no fee required) -->

---

## ⚙️ Building a Release

To create a production build and ZIP package:

```bash
npm run release
```

This will:

* Build your extension with Vite
* Generate a ZIP in the `releases/` folder
* Include the current version from your `manifest.json`

---

## 🧠 Development Setup

If you’d like to work on the code locally:

```bash
npm install
npm run dev
```

Then, load the `dist/` folder as an unpacked extension from `chrome://extensions`.

---

## 🤝 Contributing

We ❤️ contributions from the community!

Whether you’re fixing a bug, improving UI, adding new features, or enhancing documentation — every contribution helps.

### 🔧 How to Contribute

1. **Fork** this repository
2. Create a new branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and test locally
4. Commit with a clear message:

   ```bash
   git commit -m "Add: new feature description"
   ```
5. Push your branch:

   ```bash
   git push origin feature/your-feature-name
   ```
6. Submit a **Pull Request** — we’ll review and merge it!

### 🧩 Code Guidelines

* Follow clean and modular React component patterns.
* Keep the UI minimal and intuitive.
* Use consistent naming and formatting (Prettier + ESLint recommended).
* Comment code for clarity where necessary.

---

## 💡 Feature Requests

Have an idea to make Meal Meter even better?

We’d love to hear it!

* Open a new [Feature Request](../../issues/new?template=feature_request.md)
* Describe what problem it solves or how it improves user experience
* Screenshots or examples are always appreciated

Some potential upcoming ideas:

* 📊 Weekly or monthly spend charts
* 📍 Restaurant-wise spend breakdown
* 🖾 Export data as CSV
* 🔔 Spending limit alerts

---

## 🐞 Reporting Bugs

Found a bug or something not working right?

* Open a [Bug Report](../../issues/new?template=bug_report.md)
* Include clear steps to reproduce and a screenshot if possible

We’ll triage and fix it as soon as possible.

---

## 🥉 Folder Structure

```
meal-meter/
│
├── src/               # React + Vite source code
├── public/            # Static assets (icons, manifest)
├── dist/              # Built extension output
├── releases/          # Ready-to-publish ZIPs
│
├── manifest.json      # Chrome Extension manifest (v3)
├── package.json
└── README.md
```

---

## 🔒 Privacy

Meal Meter does **not collect or share** any personal data.
All calculations happen **locally** in your browser.

Your cookies and order data **never leave your device**.

---

## 🧪 License

Licensed under the **MIT License**.
You’re free to use, modify, and distribute this project with attribution.

---

## 🌟 Support

If you enjoy using **Meal Meter**, consider giving it a ⭐ on GitHub —
it really helps others discover the project and motivates continued updates!

---

### ❤️ Built by developers who love food and clean code.
