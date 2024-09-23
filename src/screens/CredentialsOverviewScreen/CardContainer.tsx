import {useRef, useState} from 'react';
import {Animated, FlatList} from 'react-native';
import {CARD_HEIGHT} from './Accordion';
import {Card, CardConfig} from './Card';

const cards: CardConfig[] = [
  {title: 'Card 1', style: {backgroundColor: 'red'}},
  {title: 'Card 2', style: {backgroundColor: 'blue'}},
  {title: 'Card 3', style: {backgroundColor: 'green'}},
  {title: 'Card 4', style: {backgroundColor: 'yellow'}},
  {title: 'Card 5', style: {backgroundColor: 'purple'}},
  {title: 'Card 6', style: {backgroundColor: 'orange'}},
  {title: 'Card 7', style: {backgroundColor: 'pink'}},
  {title: 'Card 8', style: {backgroundColor: 'brown'}},
  {title: 'Card 9', style: {backgroundColor: 'yellow'}},
  {title: 'Card 10', style: {backgroundColor: 'white'}},
  {title: 'Card 11', style: {backgroundColor: 'gray'}},
  {title: 'Card 12', style: {backgroundColor: 'cyan'}},
  {title: 'Card 13', style: {backgroundColor: 'magenta'}},
  {title: 'Card 14', style: {backgroundColor: 'lime'}},
  {title: 'Card 15', style: {backgroundColor: 'teal'}},
  {title: 'Card 16', style: {backgroundColor: 'lavender'}},
  {title: 'Card 17', style: {backgroundColor: 'yellow'}},
  {title: 'Card 18', style: {backgroundColor: 'navy'}},
  {title: 'Card 19', style: {backgroundColor: 'olive'}},
  {title: 'Card 20', style: {backgroundColor: 'silver'}},
];
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<CardConfig>);

const OVERLAP = 0;
export const CardContainer = () => {
  const listRef = useRef<FlatList>(null);
  const yScroll = new Animated.Value(0);
  const onScroll = Animated.event([{nativeEvent: {contentOffset: {y: yScroll}}}], {useNativeDriver: true});
  const [scroll, setScroll] = useState(0);
  const defaultTopValues = cards.map((_, index) => index * (CARD_HEIGHT - OVERLAP));
  const [expanded, setExpanded] = useState<number | null>(null);
  // const [tops, setTops] = useState<number[]>(cards.map((_, index) => index * CARD_HEIGHT));
  // const [tops, setTops] = useState<number[]>(cards.map((_, index) => index * CARD_HEIGHT));
  // console.log(tops)
  // const handleScroll = useCallback<NonNullable<ScrollViewProps['onScroll']>>(
  //   event => {
  //     if (expanded !== null) {
  //       // setStickyIndex(expanded);
  //       return;
  //     }
  //     const yOffset = event.nativeEvent.contentOffset.y;
  //     // console.log({diff, yOffset, yScroll: yScroll.value});
  //     // console.log({yOffset, diff: yOffset - yScroll.value});
  //     const diff = yOffset - scroll;
  //     containerHeight.value = cards.length * 150 - diff;
  //     // animatedTopValues.forEach((top, index) => {
  //       // const shouldStick = yOffset > index * 150 / 2;
  //       // console.log({index, shouldStick, yOffset, top: top.value});
  //       // const offset = shouldStick ? yScroll.current : index * 150 - yScroll.current;
  //       // top.value = top.value + diff;
  //       top.value = top.value - diff;
  //       // console.log({b4: top.value, after: top.value + diff, scroll: yOffset, diff: diff});
  //     });
  //     setScroll(yOffset);
  //     // setTops(tops.map(top => Math.max(newStickyIndex * 150, 0)));
  //     // setStickyIndex(Math.floor(yOffset / 150));
  //     // console.log('yOffset', yOffset);
  //     // console.log('stickyIndex', newStickyIndex);
  //     // const newTops = tops.map(top => Math.max(top - yOffset, 0));
  //     // Calculate which items should be sticky
  //     // setTops(newTops);
  //     // setHeight(h => h - yOffset);
  //   },
  //   [cards, expanded, listRef, scroll],
  // );
  // const snapToLastIfNotSnappedAtBottomOfList = useCallback<NonNullable<ScrollViewProps['onMomentumScrollEnd']>>(
  //   e => {
  //     if (!listRef.current) return;
  //     const landTo = Math.round(e.nativeEvent.contentOffset.y / 150) * 150;
  //     listRef.current.scrollTo({y: landTo, animated: true});
  //   },
  //   [listRef],
  // );
  // const handlePress = useCallback((index: number, expanded: number | null) => {
  //   const distanceFromTop = animatedTopValues[index].value - yScroll.current;
  //   if (expanded === null) {
  //     setExpanded(index);
  //     // console.log({distanceFromTop, scroll: yScroll.value})
  //     listRef.current?.scrollTo({y: distanceFromTop, animated: true});
  //     animatedTopValues.forEach((top, i) => {
  //       // console.log({i, index, top: top.value})
  //       top.value = withTiming(i <= index
  //         ? top.value
  //         : top.value + 80,
  //         {duration: 250});
  //     });
  //   } else if (expanded !== index) {
  //     listRef.current?.scrollTo({y: distanceFromTop, animated: true});
  //     setExpanded(index);
  //     animatedTopValues.forEach((top, i) => {
  //       top.value = withTiming((i > expanded) && (i < index)
  //         ? top.value - 80
  //         : i > index
  //           ? top.value + 80
  //           : top.value,
  //         {duration: 250});
  //     });
  //   } else {
  //     setExpanded(null);
  //     animatedTopValues.forEach((top, i) => {
  //       if (i > index) {
  //         top.value = withTiming(top.value - 80, {duration: 250})
  //       };
  //     });
  //   }
  //   setTimeout(() => console.log(animatedTopValues.map(top => top.value)), 0);
  // }, []);
  // const [sticky, setSticky]
  // console.log({tops});
  const CARD_OVERLAY = 100;
  const containerHeight = cards.length * CARD_HEIGHT - (cards.length - 1) * CARD_OVERLAY;
  const height = containerHeight;

  return (
    // <View style={{position: 'relative', flex: 1, width: '100%', borderColor: 'red', borderWidth: 1}}>

    <AnimatedFlatList
      ref={listRef}
      // scrollEnabled={expanded === null}
      style={{width: '100%'}}
      contentContainerStyle={{height: containerHeight}}
      data={cards}
      bounces={false}
      scrollEventThrottle={16}
      snapToInterval={CARD_HEIGHT - CARD_OVERLAY}
      keyExtractor={({title}) => title}
      onScroll={onScroll}
      removeClippedSubviews={false}
      getItemLayout={(_, index) => ({
        length: CARD_HEIGHT,
        offset: index * (CARD_HEIGHT - CARD_OVERLAY),
        index,
      })}
      renderItem={({item, index}) => {
        const position = Animated.subtract(index * CARD_HEIGHT, yScroll);
        const overlay = -index * CARD_OVERLAY;
        const cardOverlay = new Animated.Value(overlay);
        const isDisappearing = -CARD_HEIGHT;
        const isTop = 0;
        const isBottom = height - CARD_HEIGHT;
        const isAppearing = height;
        const translateY = Animated.add(
          Animated.add(
            yScroll,
            yScroll.interpolate({
              inputRange: [0, index * (CARD_HEIGHT - CARD_OVERLAY)],
              outputRange: [0, -index * (CARD_HEIGHT - CARD_OVERLAY)],
              extrapolateRight: 'clamp',
            }),
          ),
          cardOverlay,
        );
        const scale = position.interpolate({
          inputRange: [isDisappearing, isTop, isBottom, isAppearing],
          outputRange: [0.5, 1, 1, 0.5],
          extrapolate: 'clamp',
        });
        const opacity = position.interpolate({
          inputRange: [isDisappearing, isTop, isBottom, isAppearing],
          outputRange: [0.5, 1, 1, 0.5],
        });
        return (
          <Animated.View
            style={[
              {
                // position: 'absolute',
                // top: defaultTopValues[index] - yScroll.value,
                opacity: 1,
                transform: [{translateY: translateY}],
                width: '100%',
                // zIndex: index * 10,
              },
            ]}
            key={item.title}>
            <Card
              title={item.title}
              isExpanded={expanded === index}
              onPress={() => {
                setExpanded(expanded === index ? null : index);
              }}
              style={{
                ...item.style,
                // ...(index === 1 ? {marginTop: 120} : {}),
                // position: 'absolute',
                // top: tops[index],
                // top: tops[index],
                // transform: 'translateY(-scrollY.current)',
              }}
            />
          </Animated.View>
        );
      }}
    />
    /* {cards.map((card, index) => {
    const inputRange = [10, 30];
    const scale = interpolate(yScroll.value, [0, 1], inputRange);
    // const animatedStyles = useAnimatedStyle(() => ({
    //   top: interpolate(
    //     yScroll.value,
    //     [0, index * (CARD_HEIGHT - OVERLAP), (index + 1) * (CARD_HEIGHT - OVERLAP)],
    //     [defaultTopValues[index] - yScroll.value, yScroll.value, yScroll.value],
    //   )
    // }));
    // console.log({index, top: an})
    return (
      <Animated.View
        style={[{
          // position: 'absolute',
          // top: defaultTopValues[index] - yScroll.value,
          transform: [{translateY: yScroll.value + 100}],
          opacity: 0.2,
          width: '100%',
          // zIndex: index * 10,
        }]}
        key={card.title}>
        <Card
          title={card.title}
          isExpanded={expanded === index}
          onPress={() => { }}
          style={{
            ...card.style,
            // ...(index === 1 ? {marginTop: 120} : {}),
            // position: 'absolute',
            // top: tops[index],
            // top: tops[index],
            // transform: 'translateY(-scrollY.current)',
          }}
        />
      </Animated.View>
    );
  })} */
    // </View>
    // <FlatList
    //   contentContainerStyle={{flexGrow: 1, position: 'relative'}}
    //   initialNumToRender={cards.length}
    //   style={{width: '100%', height: CARD_HEIGHT, borderColor: 'red', borderWidth: 1}}
    //   keyExtractor={({title}) => title}
    //   // onViewableItemsChanged={({viewableItems}) => console.log(viewableItems)}
    //   // getItemLayout={(_, index) => (
    //   //   {length: 120, offset: 120 * index, index}
    //   // )}
    //   snapToInterval={CARD_HEIGHT}
    //   contentInset={{top: 0, left: 0, bottom: CARD_HEIGHT0, right: 0}}
    //   data={cards}
    //   // onScroll={handleScroll}
    //   // stickyHeaderIndices={[0]}
    //   renderItem={({item, index}) => {
    //     // const isSticky = stickyItems.includes(index);
    //     // console.log({isSticky, index, item});
    //     return (
    //       <Card
    //         isExpanded={false}
    //         onPress={() => { }}
    //         title={item.title} style={{
    //           ...item.style,
    //           position: 'absolute',
    //           top: 50,
    //           left: 0,
    //           // ...(index === 1 ? {marginTop: 120} : {}),
    //           opacity: 0.2,

    //           // ...(isSticky ? {position: 'absolute', top: 0, width: '100%'} : {}),
    //           zIndex: index * 100,
    //           // transform: [{translateY: index * -20}]
    //         }} />
    //     )
    //   }}
    // />
  );
};
