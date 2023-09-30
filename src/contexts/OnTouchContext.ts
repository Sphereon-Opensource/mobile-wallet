import {createContext, Dispatch, SetStateAction} from 'react';

interface OnTouchContextType {
  showProfileMenu: boolean;
  setShowProfileMenu: Dispatch<SetStateAction<boolean>>;
  showMoreMenu: boolean;
  setShowMoreMenu: Dispatch<SetStateAction<boolean>>;
}

const OnTouchContext = createContext<OnTouchContextType>({
  showProfileMenu: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setShowProfileMenu: () => {},
  showMoreMenu: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setShowMoreMenu: () => {},
});

export default OnTouchContext;
