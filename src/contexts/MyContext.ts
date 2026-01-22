import { createContext } from "react";

type MyDropdownContextType = {
  buildings: any;
  updateBuildings: any;
};

const initialState = {
  buildings: undefined,
  updateBuildings: undefined,
};

export const MyContext = createContext<MyDropdownContextType>({
  ...initialState,
});
