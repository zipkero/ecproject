import { useEffect, useState } from "react";

export default function ({ deps = [], fetch, initial }) {
  const [history, setHistory] = useState(initial);

  const fetchHistory = async () => {
    const data = await fetch();
    setHistory(data);
  };

  useEffect(() => {
    fetchHistory();
  }, deps);

  return history;
}
