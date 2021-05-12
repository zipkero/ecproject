import React, { useState } from "react";

const factory = (_) => ({
  title: "hello",
});

const Test = (_) => {
  debugger;
  const [get, set] = useState(factory);
  const [click] = useState((_) => (_) => set({ title: "world" }));
  return <div onClick={click}>{get.title}</div>;
};

export default Test;
