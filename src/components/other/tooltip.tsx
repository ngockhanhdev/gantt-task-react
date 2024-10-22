import React, { useRef, useEffect } from "react";
import { Task } from "../../types/public-types";
import { BarTask } from "../../types/bar-task";
import styles from "./tooltip.module.css";
import useSetState from "../../helpers/useSetState";
import { GanttEvent } from "../../types/gantt-task-actions";

export type TooltipProps = {
  task: BarTask;
  arrowIndent: number;
  rtl: boolean;
  svgContainerHeight: number;
  svgContainerWidth: number;
  svgWidth: number;
  headerHeight: number;
  taskListWidth: number;
  scrollX: number;
  scrollY: number;
  rowHeight: number;
  fontSize: string;
  fontFamily: string;
  TooltipContent: React.FC<{
    task: Task;
    fontSize: string;
    fontFamily: string;
  }>;
  offsetY: number;
  ganttEvent: GanttEvent;
};
export const Tooltip: React.FC<TooltipProps> = ({
                                                  task,
                                                  rowHeight,
                                                  rtl,
                                                  svgContainerHeight,
                                                  svgContainerWidth,
                                                  scrollX,
                                                  scrollY,
                                                  arrowIndent,
                                                  fontSize,
                                                  fontFamily,
                                                  headerHeight,
                                                  taskListWidth,
                                                  TooltipContent,
                                                  offsetY = 0,
                                                  ganttEvent
                                                }) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useSetState<{
    relatedX: number,
    relatedY: number,
  }>({
    relatedX: 0,
    relatedY: 0,
  });
  useEffect(() => {
    if (tooltipRef.current) {
      console.log("ganttEvent",ganttEvent);
      const {event} = ganttEvent
      console.log('event',event.clientX);
      console.log('event',event.clientY);
      console.log('innerWidth',event.view.innerWidth);
      console.log('event.nativeEvent.layerX',event.nativeEvent.layerX);
      const tooltipHeight = tooltipRef.current.offsetHeight * 1.1;
      const tooltipWidth = tooltipRef.current.offsetWidth * 1.1;

      let newRelatedY = task.index * rowHeight - scrollY;
      let newRelatedX: number;
      // TODO
      // if (rtl) {
      //   newRelatedX = task.x1 - arrowIndent * 1.5 - tooltipWidth - scrollX;
      //   if (newRelatedX < 0) {
      //     newRelatedX = task.x2 + arrowIndent * 1.5 - scrollX;
      //   }
      //   const tooltipLeftmostPoint = tooltipWidth + newRelatedX;
      //   if (tooltipLeftmostPoint > svgContainerWidth) {
      //     newRelatedX = svgContainerWidth - tooltipWidth;
      //     newRelatedY += rowHeight;
      //   }
      // } else {
      //   newRelatedX = task.x2 + arrowIndent * 1.5 + taskListWidth - scrollX;
      //   const tooltipLeftmostPoint = tooltipWidth + newRelatedX;
      //   const fullChartWidth = taskListWidth + svgContainerWidth;
      //   if (tooltipLeftmostPoint > fullChartWidth) {
      //     newRelatedX =
      //       task.x1 +
      //       taskListWidth -
      //       arrowIndent * 1.5 -
      //       scrollX -
      //       tooltipWidth;
      //   }
      //   if (newRelatedX < taskListWidth) {
      //     newRelatedX = svgContainerWidth + taskListWidth - tooltipWidth;
      //     newRelatedY += rowHeight;
      //   }
      // }

      // const tooltipLowerPoint = tooltipHeight + newRelatedY - scrollY;

      // const tooltipLowerPoint = tooltipHeight + newRelatedY;
      // console.log('tooltipLowerPoint',tooltipLowerPoint);
      // console.log('svgContainerHeight',svgContainerHeight);
      // console.log('scrollY ',scrollY);
      // console.log('tooltipHeight ',tooltipHeight);
      // if (tooltipLowerPoint > svgContainerHeight - scrollY) {
      //   newRelatedY = svgContainerHeight - tooltipHeight;
      // }
      if (offsetY > 0) {
        if (task.index > 2 || event.view.innerHeight - event.clientY > rowHeight) {
          newRelatedY = newRelatedY + offsetY - (rowHeight/2)
        } else {
          newRelatedY = newRelatedY + offsetY;
        }
      }
      // let
      if (event.view.innerWidth - event.clientX <= tooltipWidth) {
        newRelatedX = event.nativeEvent.layerX - tooltipWidth;
      } else {
        newRelatedX = event.nativeEvent.layerX
      }
      if (tooltipHeight >= rowHeight*2) {
        if (newRelatedY > 0) {
          newRelatedY = newRelatedY - Math.abs(tooltipHeight- (rowHeight*2));
        } else {
          newRelatedY = newRelatedY + Math.abs(tooltipHeight- (rowHeight*2));
        }
      }
      console.log('newRelatedX',newRelatedX);
      console.log("newRelatedY",newRelatedY);
      setState({
        relatedX: newRelatedX,
        relatedY: newRelatedY,
      });
    }
  }, [
    tooltipRef,
    task,
    arrowIndent,
    scrollX,
    scrollY,
    headerHeight,
    taskListWidth,
    rowHeight,
    svgContainerHeight,
    svgContainerWidth,
    rtl,
    ganttEvent
  ]);

  return (
    <div
      ref={tooltipRef}
      className={
        state.relatedX
          ? styles.tooltipDetailsContainer
          : styles.tooltipDetailsContainerHidden
      }
      style={{ left: state.relatedX, top: state.relatedY }}
    >
      <TooltipContent task={task} fontSize={fontSize} fontFamily={fontFamily} />
    </div>
  );
};

export const StandardTooltipContent: React.FC<{
  task: Task;
  fontSize: string;
  fontFamily: string;
}> = ({ task, fontSize, fontFamily }) => {
  const style = {
    fontSize,
    fontFamily,
  };
  return (
    <div className={styles.tooltipDefaultContainer} style={style}>
      <b style={{ fontSize: fontSize + 6 , wordBreak: 'break-word'}}>{`${
        task.name
      }`}</b>
      <p>{`${task.start.getDate()}-${
        task.start.getMonth() + 1
      }-${task.start.getFullYear()}`}</p>
      <p>{`
      ${task.end.getDate()}-${
        task.end.getMonth() + 1
      }-${task.end.getFullYear()}
      `}</p>
      {task.end.getTime() - task.start.getTime() !== 0 && (
        <p className={styles.tooltipDefaultContainerParagraph}>{`Duration: ${~~(
          (task.end.getTime() - task.start.getTime()) /
          (1000 * 60 * 60 * 24)
        )} day(s)`}</p>
      )}

      <p className={styles.tooltipDefaultContainerParagraph}>
        {!!task.progress && `Progress: ${task.progress} %`}
      </p>
    </div>
  );
};
