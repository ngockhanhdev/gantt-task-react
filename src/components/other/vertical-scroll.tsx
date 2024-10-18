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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scroll;
    }
  }, [scroll]);

  useEffect(() => {
    let handleScroll = (event:any) => {
      if (onScroll) {
        onScroll(event)
      }
    }
    scrollRef.current?.addEventListener("scroll", handleScroll, {
      passive: false,
    });
    return () => {
      scrollRef.current?.removeEventListener("scroll", handleScroll);
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
