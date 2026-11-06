import { createContext, useContext } from "react";
/** styleVersion 2 開關：Video.tsx 提供，元件用 useV2() 決定走新行為或保持 v1 */
export const StyleV2Context = createContext(false);
export const useV2 = () => useContext(StyleV2Context);
