import React, { useRef, useEffect } from "react";
import { GridProps } from "../grid/grid";
import { CalendarProps, Calendar } from "../calendar/calendar";
import { TaskGanttContentProps } from "./task-gantt-content";
import styles from "./gantt.module.css";
import { Task } from "../../types/public-types";

export type TaskGanttProps = {
  gridProps: GridProps;
  calendarProps: CalendarProps;
  barProps: TaskGanttContentProps;
  ganttHeight: number;
  scrollY: number;
  scrollX: number;
  ItemGanttContent?: React.FC<{
    rowHeight?: number;
    rowWidth?: string;
    fontFamily?: string;
    fontSize?: string;
    task: Task;
  }>;
};
export const CalendarGant: React.FC<TaskGanttProps> = ({
                                                      gridProps,
                                                      calendarProps,
                                                      barProps,
                                                      scrollY,
                                                      scrollX,
                                                    }) => {
  const horizontalContainerRef = useRef<HTMLDivElement>(null);
  const verticalGanttContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (horizontalContainerRef.current) {
      // console.log("scrollY", scrollY);
      horizontalContainerRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);

  useEffect(() => {
    if (verticalGanttContainerRef.current) {
      verticalGanttContainerRef.current.scrollLeft = scrollX;
    }
  }, [scrollX]);


  return (
    <div
      className={styles.ganttVerticalContainer}
      ref={verticalGanttContainerRef}
      dir="ltr"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={gridProps.svgWidth}
        height={calendarProps.headerHeight}
        fontFamily={barProps.fontFamily}
      >
        <Calendar {...calendarProps} />
      </svg>
    </div>
  );
};
