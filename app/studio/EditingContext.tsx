"use client";

import { createContext, useContext } from "react";

export const EditingContext = createContext<{ unsaved: boolean; setUnsaved: (value: boolean) => void }>({ unsaved: false, setUnsaved: () => {} });
export const useStudioEditing = () => useContext(EditingContext);
