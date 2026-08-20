# 五十音测试 / Kana Romaji Quiz

五十音学习小工具 ✧٩(ˊωˋ*)و✧

中文 丨 [English](#english)

## 在线预览

在线体验 👉 [https://krq.liht.cc/](https://krq.liht.cc/)

## 介绍

一个很单纯的五十音测验平台～ 内置错题本、假名笔画动画、五十音一览表，帮你轻松快乐地掌握五十音 (´▽`ʃ♡ƪ)

## 功能

- ✒️ **假名笔画动画**：田字格 + 逐笔描摹，平假名 / 片假名左右对照
- 📚 **错题本**：答错自动收录，专练易错字，连续答对自动移出
- 📖 **五十音一览**：清音、浊音、半浊音、拗音、外来语音一应俱全
- 🎹 **罗马字输入**：支持多种写法（shi/si、chi/ti、fu/hu…）
- 📊 **进度跟踪** & 错题回顾
- 🖥️ **简洁清爽**：纯前端，打开即用，无需构建
- 🧩 **开源**：想怎么改就怎么改

## 快速开始

1. 克隆项目：

   ```bash
   git clone https://github.com/Fay521/kana-romaji-quiz.git
   cd kana-romaji-quiz
   ```

2. 双击用浏览器打开 `index.html` 即可，没有任何构建步骤 (๑•̀ㅂ•́)و✧

## 项目结构

```
kana-romaji-quiz/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式
├── js/
│   ├── app.js          # 逻辑
│   ├── kana-data.js    # 假名数据（含拗音、外来语音）
│   └── stroke-data.js  # 笔画路径数据（源自 KanjiVG）
├── LICENSE
└── README.md
```

## 计划更新

- [x] 基础功能
- [x] 五十音一览
- [x] 假名笔画动画
- [ ] 添加假名语音
- [ ] 添加部分日语中的汉字

## 许可证

GNU General Public License v3.0 - 详见 [LICENSE](LICENSE) 文件

## 反馈 & 参与

发现问题或有想法？欢迎提 issue 或 PR 呀～ ฅ^•ﻌ•^ฅ

**热烈欢迎感兴趣的大佬前来提 PR！** ٩(๑❛ᴗ❛๑)۶ 无论是修 bug、加功能、美化界面，还是改进翻译，都非常欢迎～ 一起把这个小工具变得更好吧 (ง •̀_•́)ง✨

---

## English

A cute little tool for learning Japanese kana (๑˃̵ᴗ˂̵)

### Live Preview

Try it online 👉 [https://krq.liht.cc/](https://krq.liht.cc/)

### Overview

A lightweight web quiz for practicing Japanese kana (hiragana & katakana) and romaji — with animated stroke order and a built-in mistake book. Perfect for beginners getting to grips with the syllabary.

### Features

- ✒️ **Animated stroke order**: dashed 田字格 grid, strokes drawn one by one; hiragana & katakana shown side by side
- 📚 **Mistake book**: wrong answers are collected automatically so you can drill the tricky ones; answering correctly several times removes them
- 📖 **Complete kana chart**: seion, dakuon, handakuon, yōon and foreign katakana sounds
- 🎹 **Flexible romaji input**: multiple romanizations accepted (shi/si, chi/ti, fu/hu, …)
- 📊 **Progress tracking** & mistake review
- 🖥️ **Clean & simple**: pure frontend, just open it — no build step
- 🧩 **Open source**: tweak it however you like

### Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/Fay521/kana-romaji-quiz.git
   cd kana-romaji-quiz
   ```

2. Open `index.html` in your browser — that's it! ✧

### Project Structure

```
kana-romaji-quiz/
├── index.html          # Main page
├── css/
│   └── style.css       # Styles
├── js/
│   ├── app.js          # App logic
│   ├── kana-data.js    # Kana data (incl. yōon & foreign sounds)
│   └── stroke-data.js  # Stroke path data (sourced from KanjiVG)
├── LICENSE
└── README.md
```

### Roadmap

- [x] Basic features
- [x] Kana chart
- [x] Animated stroke order
- [ ] Kana audio
- [ ] Some kanji used in Japanese

### License

GNU General Public License v3.0 — see [LICENSE](LICENSE) for details

### Feedback & Contributing

Found a bug or have an idea? Issues and PRs are always welcome! ฅ^•ﻌ•^ฅ

**Calling all contributors — PRs are very welcome!** ٩(๑❛ᴗ❛๑)۶ Bug fixes, new features, UI polish, or better translations — every contribution counts. Let's make this little tool even better together (ง •̀_•́)ง✨
