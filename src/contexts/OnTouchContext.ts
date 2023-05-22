import {createContext, Dispatch, SetStateAction} from 'react';

interface OnTouchContextType {
  showProfileMenu: boolean;
  setShowProfileMenu: Dispatch<SetStateAction<boolean>>;
  showMoreMenu: boolean;
  setShowMoreMenu: Dispatch<SetStateAction<boolean>>;
}

const OnTouchContext = createContext<OnTouchContextType>({
  showProfileMenu: false,
  setShowProfileMenu: () => {},
  showMoreMenu: false,
  setShowMoreMenu: () => {},
});

export default OnTouchContext;
