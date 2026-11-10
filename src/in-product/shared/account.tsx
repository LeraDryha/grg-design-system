import { createContext, useContext } from 'react';

/** Who is signed in: the bar's avatar and its menu. An app with the Profile gives it, so a new name shows at once and
 *  the menu opens the Profile and the company's Settings */
export type AccountController = {
  name: string;
  email: string;
  role: string;
  open?: (page: 'profile' | 'settings') => void;
};

export const DEFAULT_ACCOUNT: AccountController = { name: 'Guadalupe Schimmel', email: 'g.schimmel@company.test', role: 'Owner' };
export const AccountContext = createContext<AccountController | null>(null);
export const useAccount = () => useContext(AccountContext) ?? DEFAULT_ACCOUNT;
