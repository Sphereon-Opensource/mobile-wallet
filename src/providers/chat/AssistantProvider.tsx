import React, {createContext, useContext} from 'react';
import useAIAssistant from '../../hooks/useAIAssistant';

const AssistantContext = createContext<ReturnType<typeof useAIAssistant> | undefined>(undefined);

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};

export const AssistantProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const assistant = useAIAssistant();
  return <AssistantContext.Provider value={assistant}>{children}</AssistantContext.Provider>;
};
