import React, { SyntheticEvent, useRef, useEffect } from "react";
import styles from "./vertical-scroll.module.css";

export const VerticalScroll: React.FC<{
  scroll: number;
  ganttHeight: number;
  ganttFullHeight: number;
  headerHeight: number;
  rtl: boolean;
  onScroll: (event: SyntheticEvent<HTMLDivElement>) => void;
}> = ({
  scroll,
  ganttHeight,
  ganttFullHeight,
  headerHeight,
  rtl,
  onScroll,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const isFocusWrapper = useRef(false);

  const onMouseenter = () => {
    isFocusWrapper.current = true;
  };
  const onMouseleave = () => {
    isFocusWrapper.current = false;
  };
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scroll;
    }
  }, [scroll]);

  useEffect(() => {
    let handleScroll = (event:any) => {
      if (onScroll && isFocusWrapper.current) {
        onScroll(event)
      }
    }
    scrollRef.current?.addEventListener("scroll", handleScroll, {
      passive: false,
    });
    scrollRef.current?.addEventListener("mouseenter", onMouseenter);
    scrollRef.current?.addEventListener("mouseleave", onMouseleave);
    return () => {
      scrollRef.current?.removeEventListener("scroll", handleScroll);
      scrollRef.current?.removeEventListener("mouseenter", onMouseenter);
      scrollRef.current?.removeEventListener("mouseleave", onMouseleave);
    };
  }, [onScroll]);

  return (
    <div
      style={{
        height: ganttHeight,
        marginTop: headerHeight,
        marginLeft: rtl ? "" : "-1rem",
      }}
      className={styles.scroll}
      // onScroll={onScroll}
      ref={scrollRef}
    >
      <div style={{ height: ganttFullHeight, width: 1 }} />
    </div>
  );
};
