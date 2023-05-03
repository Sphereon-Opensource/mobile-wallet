import {useNavigation} from '@react-navigation/native';
import React, {ReactNode, useEffect, useState} from 'react';

import OnTouchContext from '../../contexts/OnTouchContext';
import {SSIOnTouchProviderContainerStyled as Container} from '../../styles/components';

interface OnTouchProviderProps {
  children: ReactNode;
}

const OnTouchProvider: React.FC<OnTouchProviderProps> = ({children}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const navigation = useNavigation();

  // we need this as the app can navigate (lock) when pressing os specific buttons which will not trigger handleTouch.
  // This will listen to any navigation state changes and closes the menus
  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      handleTouch();
    });

    return () => {
      unsubscribe();
    };
  }, [navigation, showProfileMenu, showMoreMenu]);

  const handleTouch = () => {
    setShowProfileMenu(false);
    setShowMoreMenu(false);
  };

  return (
    <Container onTouchStart={handleTouch}>
      <OnTouchContext.Provider
        value={{
          showProfileMenu,
          setShowProfileMenu,
          showMoreMenu,
          setShowMoreMenu,
        }}>
        {children}
      </OnTouchContext.Provider>
    </Container>
  );
};

export default OnTouchProvider;
