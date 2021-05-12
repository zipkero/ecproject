import React, { Component } from "react";
import Container from "./containers/Container";
import configure from "./store/configure";
import { Provider } from "react-redux";

const App = ({ fetchedInitData }) => {
  const store = configure(fetchedInitData);
  return (
    <Provider store={store}>
      <Container />
    </Provider>
  );
};

export default App;
