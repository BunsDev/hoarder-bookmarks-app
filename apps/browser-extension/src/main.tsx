import ReactDOM from "react-dom/client";
import "./index.css";
import OptionsPage from "./OptionsPage.tsx";
import NotConfiguredPage from "./NotConfiguredPage.tsx";
import { Providers } from "./utils/providers.tsx";
import BookmarkSavedPage from "./BookmarkSavedPage.tsx";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout.tsx";
import SavePage from "./SavePage.tsx";
import BookmarkDeletedPage from "./BookmarkDeletedPage.tsx";
import SignInPage from "./SignInPage.tsx";

function App() {
  return (
    <div className="w-96 p-4">
      <Providers>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<SavePage />} />
              <Route
                path="/bookmark/:bookmarkId"
                element={<BookmarkSavedPage />}
              />
              <Route
                path="/bookmarkdeleted"
                element={<BookmarkDeletedPage />}
              />
            </Route>
            <Route path="/notconfigured" element={<NotConfiguredPage />} />
            <Route path="/options" element={<OptionsPage />} />
            <Route path="/signin" element={<SignInPage />} />
          </Routes>
        </HashRouter>
      </Providers>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
