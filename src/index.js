import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Animated from 'react-native-reanimated';
import Interactable from 'react-native-interactable-reanimated';
import {TouchableOpacity} from 'react-native-gesture-handler'

const Screen = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
};

const getSnapPoints = (snapPoints) => {
  return snapPoints.map((snapItem) => {
    if (typeof snapItem === 'string') {
      const parentValue = snapItem.split('%')[0];
      snapItem = (Screen.height / 100) * parentValue;
    }
    const snapObject = { y: Screen.height - snapItem };
    return snapObject;
  });
};

const getInitialPosition = (snapPoint) => {
  if (typeof snapPoint === 'string') {
    const parentValue = snapPoint.split('%')[0];
    snapPoint = (Screen.height / 100) * parentValue;
  }
  const snapObject = { y: Screen.height - snapPoint };
  return snapObject;
};

class BottomPanel extends Component {
  constructor(props) {
    super(props);
    this._deltaY = new Animated.Value(Screen.height);
    this.state = {
      snapToIndex: 0,
      points: 100,
      scrollValueY: new Animated.Value(0),
      showHeader: false,
      isDismissWithPress: props.isBackDropDismissByPress
        ? props.isBackDropDismissByPress
        : false,
        isBottomSheetDismissed: true,
      // isBottomSheetDismissed:
      //   props.initialPosition === 0 || props.initialPosition === '0%',
    };
  }

  onDrawerSnap = (snap) => {
    const { snapPoints, isHeaderShown } = this.props;
    isHeaderShown(snap.nativeEvent.index)
    if (
      snapPoints[snap.nativeEvent.index] === 0 ||
      snapPoints[snap.nativeEvent.index] === '0%'
    ) {
      this.setState({ isBottomSheetDismissed: true, showHeader: false });
    }  else if(snap.nativeEvent.index === 0) {
      this.setState({ isBottomSheetDismissed: false, showHeader: true });
    } else {
      this.setState({ isBottomSheetDismissed: false, showHeader: false });
    }
  };

  dismissBottomSheet = () => {
    const { snapPoints } = this.props;
    let index = snapPoints.findIndex((x) => x === 0 || x === '0%');
    if (index !== -1) {
      this.refs.bottomPanel.snapTo({ index });
    }
  };

  snapTo = (index) => {
    const { snapPoints } = this.props;
    if (snapPoints.findIndex((x) => x === 0 || x === '0%') !== -1) {
      Keyboard.dismiss();
    }
    this.refs.bottomPanel.snapTo({ index });
  };

  render() {
    const {
      bottomSheerColor = '#FFFFFF',
      backDropColor = '#000000',
      isRoundBorderWithTipHeader = false,
      header,
      body,
      isBackDrop = false,
      isModal,
      isAnimatedYFromParent,
      animatedValueY,
      containerStyle,
      tipStyle,
      headerStyle,
      bodyStyle,
      screenHeader,
      isHeaderShown,
    } = this.props;
    let { snapPoints, initialPosition = { y: 0 } } = this.props;
    snapPoints = getSnapPoints(snapPoints);
    initialPosition = getInitialPosition(initialPosition);
    const { isDismissWithPress, isBottomSheetDismissed } = this.state;
    return (
      <View style={styles.panelContainer} pointerEvents={'box-none'}>
        {/* Backdrop */}
        {isBackDrop && (
          <Animated.View
            pointerEvents={!isBottomSheetDismissed ? 'auto' : 'box-none'}
            style={[
              styles.panelContainer,
              {
                backgroundColor: backDropColor,
                opacity: isBottomSheetDismissed ? 0 : 0.6,
              },
            ]}
          />
        )}

        <Interactable.View
          dragEnabled={isModal ? false : true}
          verticalOnly={true}
          ref="bottomPanel"
          snapPoints={snapPoints}
          initialPosition={initialPosition}
          boundaries={{ top: isModal ? 0 : -300, bounce: isModal ? 0 : 0.5 }}
          animatedValueY={isAnimatedYFromParent ? animatedValueY : this._deltaY}
          onSnap={this.onDrawerSnap}
        >
          {!isModal && isDismissWithPress && !isBottomSheetDismissed  && (
            <TouchableOpacity
              onPress={() => this.dismissBottomSheet()}
              disabled={false}
              containerStyle={{
                zIndex: 1,
                height: Screen.height,
                marginTop: -Screen.height,
              }}
            >
              <View
              />
            </TouchableOpacity>
          )}
          {this.state.showHeader ?  screenHeader : header}
          <View
            style={[
              isModal ? styles.modal : styles.panel,
              isRoundBorderWithTipHeader
                ? {
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 0 },
                    shadowRadius: 5,
                    shadowOpacity: 0.4,
                  }
                : {},
              containerStyle,
            ]}
          >
            {!isModal && isRoundBorderWithTipHeader && (
              <View style={[styles.panelHandle, tipStyle]} />
            )}
            <View style={bodyStyle}>{body}</View>
          </View>
        </Interactable.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  panelHandle: {
    position: 'absolute',
    alignSelf: 'center',
    width: 40,
    height: 6,
    marginVertical: 8,
  },
  panel: {
    height: Screen.height + 300,
  },
  modal: {
    height: Screen.height + 300,
  },
  panelHeader: {
    padding: 16,
  },
  panelContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default BottomPanel;
