import {useContext} from 'react';
import {AccessibilityContext} from '../contexts/AccessibiltyContext';
export type {AnnounceOptions} from '../contexts/AccessibiltyContext';

export const useAccessibility = () => useContext(AccessibilityContext);
