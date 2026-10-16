"use strict";

import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { jsx as _jsx } from "react/jsx-runtime";
export const ErrorNotification = ({
  message
}) => {
  const [activeMessage, setActiveMessage] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const animationValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (message && message !== activeMessage) {
      setActiveMessage(message);
      setShowNotification(true);
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    } else {
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      }).start(({
        finished
      }) => {
        if (finished) {
          setShowNotification(false);
        }
      });
    }
  }, [message]);
  if (!showNotification) return null;
  return /*#__PURE__*/_jsx(Animated.View, {
    style: [styles.errorContainer, {
      opacity: animationValue
    }],
    children: /*#__PURE__*/_jsx(Text, {
      style: styles.errorText,
      children: activeMessage
    })
  });
};
const styles = StyleSheet.create({
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: '#ff4d4f',
    padding: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 600
  }
});
//# sourceMappingURL=ErrorNotification.js.map