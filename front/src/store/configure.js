import { applyMiddleware, compose, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import createReducer from "store/modules";
import { schedulerSaga } from "store/saga/rootSaga";

const sagaMiddleware = createSagaMiddleware();

const configure = (fetchedInitData) => {
  const reducers = createReducer(fetchedInitData);
  const devTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  const composeEnhancers = devTools || compose;

  let middleWares = [sagaMiddleware];

  const store = createStore(
    reducers,
    composeEnhancers(applyMiddleware(...middleWares))
  );

  // const store = createStore(reducers, applyMiddleware(...middleWares));
  sagaMiddleware.run(schedulerSaga);

  return store;
};

export default configure;
