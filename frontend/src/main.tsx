import ReactDOM from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { LandingPage } from "../Pages/LandingPage";
import { Editor } from "../Pages/Editor";
import { ResolvePath } from "../Pages/ResolvePath";

import "./main.css";
import "allotment/dist/style.css";

import "../assets/DroidSansMono.ttf";

const routes = [
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "resolve/:projectPathOrLink",
    element: <ResolvePath />,
  },
  {
    path: "editor/:projectPath",
    element: <Editor />,
  },
];

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
