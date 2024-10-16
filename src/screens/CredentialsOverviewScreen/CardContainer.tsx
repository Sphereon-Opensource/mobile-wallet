import {CredentialSummary} from '@sphereon/ui-components.credential-branding';
import {useRef, useState} from 'react';
import {FlatList} from 'react-native';
import Animated, {useAnimatedScrollHandler, useSharedValue} from 'react-native-reanimated';
import {CARD_HEIGHT, CARD_SCROLL_OVERLAP, Card, CardOverlap} from './Card';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<CredentialSummary>);

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
  const [listHeight, setListHeight] = useState<number>(0);
  const [cardOverlap, setCardOverlap] = useState(CardOverlap.BIG);
  const [tappedIndex, setTappedIndex] = useState<number | undefined>(undefined);
  const containerHeight = Math.max(
    listHeight,
    credentials.length * CARD_HEIGHT - (credentials.length - 1) * cardOverlap + (credentials.length - 1) * CARD_SCROLL_OVERLAP,
  );
  return (
    <AnimatedFlatList
      ref={listRef}
      style={{width: '100%'}}
      onLayout={({nativeEvent: {layout}}) => setListHeight(layout.height)}
      contentContainerStyle={{height: containerHeight}}
      data={credentials}
      bounces={false}
      scrollEventThrottle={16}
      snapToInterval={CARD_HEIGHT - cardOverlap}
      getItemLayout={(_, index) => ({
        length: CARD_HEIGHT,
        offset: (CARD_HEIGHT - cardOverlap) * index,
        index,
      })}
      keyExtractor={({hash}) => hash}
      onScroll={onScroll}
      removeClippedSubviews={false}
      renderItem={({item, index}) => (
        <Card
          yScroll={yScroll}
          credential={item}
          index={index}
          listHeight={listHeight}
          cardOverlap={cardOverlap}
          tappedIndex={tappedIndex}
          // onTap={() => onItemPressWhenSelected(item)}
          onTap={() => {}}
          onDoubleTap={() => {
            console.log('taapedOn', index);
            setTappedIndex(index);
            setCardOverlap(cardOverlap === CardOverlap.BIG ? CardOverlap.NONE : CardOverlap.BIG);
          }}
        />
      )}
    />
  );
};
