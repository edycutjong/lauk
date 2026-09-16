/**
 * The pillar ring — five arcs of 72° with a 6° gap, stroke 18.
 *
 *   hollow (0)  terracotta outline
 *   half   (1)  amber over the first half of the segment
 *   full   (2)  amber over the whole segment
 *
 * `fill` is the ring after the tapped add; its new amber lands with a
 * 250 ms ease per segment, staggered 60 ms, so the plate visibly changes.
 * Reduced motion: everything renders at its final state immediately.
 */
import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { PILLARS, type Levels } from '../core/pillars';
import { color } from '../theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SEG = 72;
const GAP = 6;
const STROKE = 18;

export function PillarRing({
  levels,
  fill,
  animate = true,
  diameter,
}: {
  levels: Levels;
  fill?: Levels;
  animate?: boolean;
  diameter?: number;
}) {
  const { width } = useWindowDimensions();
  const d = diameter ?? Math.min(0.56 * width, 240);
  const r = d / 2 - STROKE / 2;
  const c = 2 * Math.PI * r;
  const arc = (deg: number) => (c * deg) / 360;
  const reduce = useRef(false);
  const anims = useRef(PILLARS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => (reduce.current = v));
  }, []);

  useEffect(() => {
    const target = fill ?? levels;
    const seq = PILLARS.map((p, i) =>
      Animated.timing(anims[i], {
        toValue: target[p] / 2,
        duration: animate && !reduce.current ? (fill ? 250 : 400) : 0,
        delay: animate && !reduce.current ? i * 60 : 0,
        useNativeDriver: false,
      }),
    );
    Animated.parallel(seq).start();
  }, [levels, fill, animate, anims]);

  return (
    <View style={{ width: d, height: d }}>
      <Svg width={d} height={d} viewBox={`0 0 ${d} ${d}`}>
        <G rotation={-90} origin={`${d / 2}, ${d / 2}`}>
          {PILLARS.map((p, i) => {
            const offset = -arc(i * (SEG + GAP));
            return (
              <G key={p}>
                {/* hollow outline — the plate as bought */}
                <Circle
                  cx={d / 2}
                  cy={d / 2}
                  r={r}
                  fill="none"
                  stroke={color.plate}
                  strokeWidth={STROKE}
                  strokeOpacity={0.28}
                  strokeDasharray={`${arc(SEG)} ${c}`}
                  strokeDashoffset={offset}
                />
                {/* amber — a pillar met; length = level/2 of the segment */}
                <AnimatedCircle
                  cx={d / 2}
                  cy={d / 2}
                  r={r}
                  fill="none"
                  stroke={color.sated}
                  strokeWidth={STROKE}
                  strokeLinecap="butt"
                  strokeDasharray={anims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [`0 ${c}`, `${arc(SEG)} ${c}`],
                  })}
                  strokeDashoffset={offset}
                />
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}
