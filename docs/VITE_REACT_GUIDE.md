# 개발 가이드 (Vite + React)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

## 참조

### 의존  패키지 교체 작업

#### FIXME npm audit quill 패키지 `GHSA-4943-9vgg-gr5r` 문제

quill은 WYSIWYG Editor 이며, 팝업 내용 편집시 편의를 위하여 연동함

대처 가능한 WYSIWYG Editor 가 있으며 대처바람.

```shell
$ npm audit fix

up to date, audited 398 packages in 979ms

77 packages are looking for funding
  run `npm fund` for details

# npm audit report

quill  <=1.3.7
Severity: moderate
Cross-site Scripting in quill - https://github.com/advisories/GHSA-4943-9vgg-gr5r
fix available via `npm audit fix --force`
Will install react-quill@0.0.2, which is a breaking change
node_modules/quill-image-resize/node_modules/quill
node_modules/react-quill/node_modules/quill
  quill-image-resize  *
  Depends on vulnerable versions of quill
  node_modules/quill-image-resize
  react-quill  >=0.0.3
  Depends on vulnerable versions of quill
  node_modules/react-quill

3 moderate severity vulnerabilities

To address all issues possible (including breaking changes), run:
  npm audit fix --force

Some issues need review, and may require choosing
a different dependency.
```

# 환경 설정 & 실행 (로컬 개발용)
```bash
# nvm 설치 (없을 경우)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
nvm install 20
nvm use 20

# 의존성 설치 및 실행
npm install
npm run dev
```

