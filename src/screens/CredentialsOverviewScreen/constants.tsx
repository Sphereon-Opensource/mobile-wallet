type Icon = 'card' | 'list';

export const CredentialsOverviewImages = {
  card: require('../../assets/images/cardViewIcon.png'),
  list: require('../../assets/images/listViewIcon.png'),
} satisfies {[key in Icon]: string};
