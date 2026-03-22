# React + TypeScript + Vite

# 📝 TO-DO List Web App

A simple and interactive **To-Do List Web Application** that helps users manage daily tasks efficiently. This project is built using **HTML, CSS, and JavaScript** and focuses on improving productivity through task organization.

---

## 🚀 Features

- ✅ Add new tasks  
- ✏️ Edit existing tasks  
- ❌ Delete tasks  
- ✔️ Mark tasks as completed  
- 📱 Responsive design (works on mobile & desktop)  
- 💾 Data persistence using Local Storage  

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript  
- **Storage:** Local Storage (Browser)  
- **Editor:** VS Code  

---

## 📂 Project Structure

```
TO-DO-List/
│── index.html
│── style.css
│── script.js
│── README.md
```

---

## 📸 Demo

*(Add your project screenshot here)*

---

## ⚙️ Installation & Setup

1. Clone the repository  
```
git clone https://github.com/siddheshg01/TO-DO-List.git
```

2. Open the folder  
```
cd TO-DO-List
```

3. Run the project  
- Open `index.html` in your browser  

---

## 🎯 Usage

- Enter a task in the input field  
- Click **Add** to add the task  
- Mark tasks as completed  
- Delete tasks when done  

---

## 💡 Future Improvements

- 🔍 Search functionality  
- 📅 Task deadlines  
- 🌙 Dark mode  
- ☁️ Backend integration (database)  

---

## 🤝 Contributing

Contributions are welcome!  
Feel free to fork this repo and submit a pull request.

---

## 📄 License

This project is open-source and available under the **MIT License**.

---

## 👨‍💻 Author

**Siddhesh Gaikwad**  
GitHub: https://github.com/siddheshg01  

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
