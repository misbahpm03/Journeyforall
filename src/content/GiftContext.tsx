"use client";

import { createContext, useCallback, useContext } from "react";
import { defaultContent, type GiftContent } from "./gift";

const Gift = createContext<GiftContent>(defaultContent);
export const GiftProvider = Gift.Provider;
export const useGift = () => useContext(Gift);

/* "{name}" → her name, anywhere in the content. */
export function useWithName() {
  const name = useGift().recipientName;
  return useCallback((s: string) => s.replaceAll("{name}", name), [name]);
}
