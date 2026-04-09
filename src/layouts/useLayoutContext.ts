import { useContext } from "react";
import LayoutContext from "./LayoutContext";

export function useLayoutContext() {
  const ctx = useContext(LayoutContext);
  if (!ctx) {
    throw new Error("LayoutContext is not available");
  }
  return ctx;
}
