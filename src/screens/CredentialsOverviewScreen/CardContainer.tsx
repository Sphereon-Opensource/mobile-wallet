import {CredentialSummary} from '@sphereon/ui-components.credential-branding';
import {useRef, useState} from 'react';
import {FlatList} from 'react-native';
import Animated, {useAnimatedScrollHandler, useSharedValue} from 'react-native-reanimated';
import {CARD_HEIGHT, CARD_OVERLAY, Card} from './Card';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<CredentialSummary>);

const MAX_CARDS_UNDER_SELECTED = 3;
type Props = {
  credentials: CredentialSummary[];
  onItemPressWhenSelected: (credential: CredentialSummary) => Promise<void>;
};

export const CardContainer = ({credentials, onItemPressWhenSelected}: Props) => {
  const listRef = useRef<FlatList>(null);
  const yScroll = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler(e => {
    yScroll.value = e.contentOffset.y;
  });
  const [selected, setSelected] = useState<number>();
  const [listHeight, setListHeight] = useState<number>(0);
  const containerHeight = Math.max(listHeight, credentials.length * CARD_HEIGHT - (credentials.length - 1) * CARD_OVERLAY);
  return (
    <AnimatedFlatList
      ref={listRef}
      style={{width: '100%'}}
      onLayout={({nativeEvent: {layout}}) => setListHeight(layout.height)}
      contentContainerStyle={{height: containerHeight}}
      scrollEnabled={selected == undefined}
      data={credentials}
      bounces={false}
      scrollEventThrottle={16}
      snapToInterval={CARD_HEIGHT - CARD_OVERLAY}
      getItemLayout={(_, index) => ({
        length: CARD_HEIGHT,
        offset: (CARD_HEIGHT - CARD_OVERLAY) * index,
        index,
      })}
      keyExtractor={({hash}) => hash}
      onScroll={onScroll}
      removeClippedSubviews={false}
      renderItem={({item, index}) => (
        <Card
          cardsUnderSelected={Math.min(MAX_CARDS_UNDER_SELECTED, credentials.length - selected! - 1)}
          yScroll={yScroll}
          credential={item}
          index={index}
          listHeight={listHeight}
          selected={selected}
          onSelect={() => setSelected(index === selected ? undefined : index)}
          onViewDetailsPress={() => onItemPressWhenSelected(item)}
        />
      )}
    />
  );
};
