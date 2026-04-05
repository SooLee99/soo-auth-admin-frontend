import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import "./static/css/admin-white.css";

import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from "./App.tsx";
import {enableStrictMode} from "./build_constants.ts";

const root = enableStrictMode
    ? <StrictMode><App/></StrictMode>
    : <App/>;

createRoot(document.getElementById('root')!).render(root);
