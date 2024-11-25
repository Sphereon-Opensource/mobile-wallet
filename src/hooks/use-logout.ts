import {useDispatch} from 'react-redux';
import {logout} from '../store/actions/user.actions';

export const useLogout = () => {
  const dispatch = useDispatch();
  return () => {
    dispatch<any>(logout());
  };
};
