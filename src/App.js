import React from "react";
import "antd/dist/antd.min.css";
import "./App.css";
import { Provider } from "react-redux"; //供应商组件
import { store, persistor } from "./redux/store";
import IndexRouter from "./router/IndexRouter";
import { PersistGate } from "redux-persist/integration/react";

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}></PersistGate>
      <IndexRouter></IndexRouter>
    </Provider> //上下文跨级通信
  );
}
