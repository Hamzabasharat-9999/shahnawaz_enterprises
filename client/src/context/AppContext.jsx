import {createContext,useContext,useState} from 'react'; const C=createContext(null);
export function AppProvider({children}){const [mobileMenuOpen,setMobileMenuOpen]=useState(false);return <C.Provider value={{mobileMenuOpen,setMobileMenuOpen}}>{children}</C.Provider>}; export function useApp(){const v=useContext(C);if(!v)throw Error('useApp must be used inside AppProvider');return v}
