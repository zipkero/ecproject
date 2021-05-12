import { useEffect, useRef } from "react";

export function useTraceUpdate(props) {
  const prev = useRef(props);
  useEffect(() => {
    prev.current = props;
  });
}
