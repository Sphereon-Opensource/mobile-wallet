import React, {FC} from 'react';

import {SSIBasicContainerStyled as RouteContainer} from '../../../styles/components';

// TODO implement activity view

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IProps {}

const SSIActivityView: FC<IProps> = (props: IProps): JSX.Element => {
  return <RouteContainer style={{backgroundColor: '#2C334B'}} />;
};

export default SSIActivityView;
