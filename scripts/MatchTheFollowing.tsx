import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder, Alert, TouchableOpacity, StatusBar, SafeAreaView, Animated } from 'react-native';
import Svg, { Line, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MatchItem {
  left: string[];
  right: string[];
  answer: { [key: string]: string };
}

const data: MatchItem = {
  left: ["Python", "HTML", "CSS", "SQL"],
  right: ["Web Styling", "Database Querying", "Web Structure", "General Programming"],
  answer: {
    "Python": "General Programming",
    "HTML": "Web Structure",
    "CSS": "Web Styling",
    "SQL": "Database Querying"
  }
};

const MatchTheFollowing = () => {
  const [matches, setMatches] = useState<{ [key: string]: string | null }>({});
  const [currentDrag, setCurrentDrag] = useState<{ fromLeft: string; toX: number; toY: number } | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  const positions = useRef<{ [key: string]: { x: number; y: number; absX: number; absY: number; width: number; height: number } }>({});
  const itemRefs = useRef<{ [key: string]: View | null }>({});
  const scaleAnimations = useRef<{ [key: string]: Animated.Value }>({});
  const instructionOpacity = useRef(new Animated.Value(1)).current;

  // Initialize scale animations for each item
  React.useEffect(() => {
    [...data.left, ...data.right].forEach(item => {
      if (!scaleAnimations.current[item]) {
        scaleAnimations.current[item] = new Animated.Value(1);
      }
    });
  }, []);

  const measurePosition = (key: string) => {
    setTimeout(() => {
      itemRefs.current[key]?.measure((fx, fy, width, height, px, py) => {
        positions.current[key] = {
          x: px + width / 2,
          y: py + height / 2,
          absX: px,
          absY: py,
          width,
          height,
        };
      });
    }, 100);
  };

  const animateItem = (item: string, scale: number) => {
    Animated.spring(scaleAnimations.current[item], {
      toValue: scale,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const hideInstructions = () => {
    Animated.timing(instructionOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowInstructions(false));
  };

  const findDropRight = (moveX: number, moveY: number): string | null => {
    for (const right of data.right) {
      const key = `right_${right}`;
      const pos = positions.current[key];
      if (pos && moveX >= pos.absX && moveX <= pos.absX + pos.width && moveY >= pos.absY && moveY <= pos.absY + pos.height) {
        return right;
      }
    }
    return null;
  };

  const validateAnswers = () => {
    if (Object.keys(matches).length === 0) {
      Alert.alert('No matches made!', 'Please drag items from the left to match them with items on the right.');
      return;
    }
    
    let correct = true;
    let correctCount = 0;
    
    Object.keys(data.answer).forEach(left => {
      if (matches[left] === data.answer[left]) {
        correctCount++;
      } else {
        correct = false;
      }
    });
    
    if (Object.keys(matches).length !== data.left.length) {
      correct = false;
    }
    
    const message = correct 
      ? 'Perfect! All matches are correct! 🎉' 
      : `You got ${correctCount} out of ${data.left.length} correct. Try again! 💪`;
    
    Alert.alert(
      correct ? 'Excellent Work!' : 'Keep Trying!', 
      message,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const resetMatches = () => {
    setMatches({});
    setCurrentDrag(null);
    setDraggedItem(null);
    // Reset all animations
    Object.keys(scaleAnimations.current).forEach(item => {
      animateItem(item, 1);
    });
  };

  const renderLines = () => {
    const lines = Object.keys(matches).map(left => {
      const right = matches[left];
      if (right) {
        const leftPos = positions.current[`left_${left}`];
        const rightPos = positions.current[`right_${right}`];
        if (leftPos && rightPos) {
          return (
            <Line
              key={`${left}-${right}`}
              x1={leftPos.x}
              y1={leftPos.y}
              x2={rightPos.x}
              y2={rightPos.y}
              stroke="url(#gradient)"
              strokeWidth="3"
            />
          );
        }
      }
      return null;
    });

    if (currentDrag) {
      const leftPos = positions.current[`left_${currentDrag.fromLeft}`];
      if (leftPos) {
        lines.push(
          <Line
            key="temp"
            x1={leftPos.x}
            y1={leftPos.y}
            x2={currentDrag.toX}
            y2={currentDrag.toY}
            stroke="#FF6B6B"
            strokeWidth="3"
            strokeDasharray="5,5"
            opacity={0.8}
          />
        );
      }
    }

    return lines;
  };

  const renderLeftItem = (item: string, index: number) => {
    const isMatched = matches[item] !== undefined && matches[item] !== null;
    
    const panResponder = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onPanResponderGrant: () => {
            const leftPos = positions.current[`left_${item}`];
            if (leftPos) {
              setCurrentDrag({ fromLeft: item, toX: leftPos.x, toY: leftPos.y });
            }
            setDraggedItem(item);
            animateItem(item, 1.05);
            if (showInstructions) {
              hideInstructions();
            }
          },
          onPanResponderMove: (evt, gesture) => {
            setCurrentDrag(prev =>
              prev ? { ...prev, toX: gesture.moveX, toY: gesture.moveY } : null
            );
          },
          onPanResponderRelease: (evt, gesture) => {
            const dropRight = findDropRight(gesture.moveX, gesture.moveY);
            if (dropRight) {
              // Remove existing match if any
              const existingLeft = Object.keys(matches).find(key => matches[key] === dropRight);
              const newMatches = { ...matches };
              
              if (existingLeft && existingLeft !== item) {
                newMatches[existingLeft] = null;
                animateItem(existingLeft, 1);
              }
              
              newMatches[item] = dropRight;
              setMatches(newMatches);
              
              // Animate both items
              animateItem(item, 0.98);
              animateItem(dropRight, 1.02);
              
              setTimeout(() => {
                animateItem(item, 1);
                animateItem(dropRight, 1);
              }, 200);
            } else {
              animateItem(item, 1);
            }
            
            setCurrentDrag(null);
            setDraggedItem(null);
          },
        }),
      [item, matches, showInstructions]
    );

    return (
      <Animated.View
        key={item}
        ref={el => (itemRefs.current[`left_${item}`] = el)}
        onLayout={() => measurePosition(`left_${item}`)}
        style={[
          styles.item, 
          styles.leftItem,
          isMatched && styles.matchedLeftItem,
          draggedItem === item && styles.draggedItem,
                      { 
            marginBottom: index === data.left.length - 1 ? 20 : 20,
            transform: [{ scale: scaleAnimations.current[item] || 1 }]
          }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.dragHandle}>
          <View style={styles.dragDot} />
          <View style={styles.dragDot} />
          <View style={styles.dragDot} />
        </View>
        <Text style={[styles.itemText, isMatched && styles.matchedText]}>{item}</Text>
        {isMatched && <View style={styles.connectedIndicator} />}
      </Animated.View>
    );
  };

  const renderRightItem = (item: string, index: number) => {
    const isMatched = Object.values(matches).includes(item);
    
    return (
      <Animated.View
        key={item}
        ref={el => (itemRefs.current[`right_${item}`] = el)}
        onLayout={() => measurePosition(`right_${item}`)}
        style={[
          styles.item, 
          styles.rightItem,
          isMatched && styles.matchedRightItem,
          { 
            marginBottom: index === data.right.length - 1 ? 20 : 20,
            transform: [{ scale: scaleAnimations.current[item] || 1 }]
          }
        ]}
      >
        <Text style={[styles.itemText, isMatched && styles.matchedText]}>{item}</Text>
        {isMatched && <View style={styles.connectedIndicator} />}
      </Animated.View>
    );
  };

  const matchedCount = Object.keys(matches).filter(key => matches[key] !== null).length;
  const totalCount = data.left.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#667eea" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Programming Match</Text>
        <Text style={styles.subtitle}>Connect languages with their uses</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { width: `${(matchedCount / totalCount) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{matchedCount} of {totalCount} connected</Text>
        </View>
      </View>

      {/* Instructions */}
      
        <Animated.View 
          style={styles.instructionsContainer}
        >
          <Text style={styles.instructionsText}>
            👆 Drag items from left to right to make connections
          </Text>
        </Animated.View>
       

      {/* Game Area */}
      <View style={styles.gameArea}>
        <View style={styles.columns}>
          <View style={styles.column}>
            <View style={styles.columnHeader}>
              <Text style={styles.columnTitle}>Languages</Text>
            </View>
            <View style={styles.itemsList}>
              {data.left.map((item, index) => renderLeftItem(item, index))}
            </View>
          </View>
          
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
          </View>
          
          <View style={styles.column}>
            <View style={styles.columnHeader}>
              <Text style={styles.columnTitle}>Primary Uses</Text>
            </View>
            <View style={styles.itemsList}>
              {data.right.map((item, index) => renderRightItem(item, index))}
            </View>
          </View>
        </View>
      </View>

      {/* SVG Lines */}
      <Svg style={styles.svg}>
        <Defs>
          <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#667eea" stopOpacity="1" />
            <Stop offset="100%" stopColor="#764ba2" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        {renderLines()}
      </Svg>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.resetButton} onPress={resetMatches}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.validateButton, 
            matchedCount === 0 && styles.disabledButton
          ]} 
          onPress={validateAnswers}
          disabled={matchedCount === 0}
        >
          <Text style={styles.validateButtonText}>Check Answers</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: screenWidth - 80,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  progressText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  instructionsContainer: {
    backgroundColor: '#fef3c7',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  instructionsText: {
    fontSize: 15,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '500',
  },
  gameArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  columns: {
    flexDirection: 'row',
    flex: 1,
  },
  column: {
    flex: 1,
    paddingHorizontal: 12,
  },
  separator: {
    width: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
    marginHorizontal: 5,
  },
  separatorLine: {
    width: 2,
    height: '100%',
    backgroundColor: '#cbd5e1',
    borderRadius: 1,
  },
  columnHeader: {
    marginBottom: 20,
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  itemsList: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  item: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    minHeight: 80,
    display:"flex",
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  leftItem: {
    flexDirection: 'row',
    paddingLeft: 25,
    marginRight: 8,
  },
  rightItem: {
    backgroundColor: '#f8fafc',
    marginLeft: 8,
  },
  matchedLeftItem: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
  },
  matchedRightItem: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
  },
  draggedItem: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  dragHandle: {
    position: 'absolute',
    left: 8,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragDot: {
    width: 4,
    height: 4,
    backgroundColor: '#94a3b8',
    borderRadius: 2,
    marginVertical: 1,
  },
  itemText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
    textAlign: 'center',
    // flex: 1,
  },
  matchedText: {
    color: '#0f766e',
    fontWeight: '600',
  },
  connectedIndicator: {
    position: 'absolute',
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
    pointerEvents: 'none',
  },
  bottomControls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 25,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 15,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  validateButton: {
    flex: 2,
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  validateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MatchTheFollowing;