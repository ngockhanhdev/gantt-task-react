import React, {
  useState,
  SyntheticEvent,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { ViewMode, GanttProps, Task } from "../../types/public-types";
import { GridProps } from "../grid/grid";
import { ganttDateRange, seedDates } from "../../helpers/date-helper";
import { CalendarProps } from "../calendar/calendar";
import { TaskGanttContentProps } from "./task-gantt-content";
import { TaskListHeaderDefault } from "../task-list/task-list-header";
import { TaskListTableDefault } from "../task-list/task-list-table";
import { StandardTooltipContent, Tooltip } from "../other/tooltip";
import { VerticalScroll } from "../other/vertical-scroll";
import { TaskListProps, TaskList } from "../task-list/task-list";
import { TaskGantt } from "./task-gantt";
import { BarTask } from "../../types/bar-task";
import { convertToBarTasks } from "../../helpers/bar-helper";
import { GanttEvent } from "../../types/gantt-task-actions";
import { DateSetup } from "../../types/date-setup";
// import { HorizontalScroll } from "../other/horizontal-scroll";
import { removeHiddenTasks, sortTasks } from "../../helpers/other-helper";
import styles from "./gantt.module.css";
import useSetState from "../../helpers/useSetState";

export const Gantt: React.FC<GanttProps> = ({
                                              tasks,
                                              headerHeight = 50,
                                              columnWidth = 60,
                                              listCellWidth = "155px",
                                              rowHeight = 50,
                                              ganttHeight = 0,
                                              viewMode = ViewMode.Day,
                                              preStepsCount = 1,
                                              locale = "en-GB",
                                              barFill = 60,
                                              barCornerRadius = 3,
                                              barProgressColor = "#a3a3ff",
                                              barProgressSelectedColor = "#8282f5",
                                              barBackgroundColor = "#b8c2cc",
                                              barBackgroundSelectedColor = "#aeb8c2",
                                              projectProgressColor = "#7db59a",
                                              projectProgressSelectedColor = "#59a985",
                                              projectBackgroundColor = "#fac465",
                                              projectBackgroundSelectedColor = "#f7bb53",
                                              milestoneBackgroundColor = "#f1c453",
                                              milestoneBackgroundSelectedColor = "#f29e4c",
                                              rtl = false,
                                              handleWidth = 8,
                                              timeStep = 300000,
                                              arrowColor = "grey",
                                              fontFamily = "Arial, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue",
                                              fontSize = "14px",
                                              arrowIndent = 20,
                                              todayColor = "rgba(252, 248, 227, 0.5)",
                                              viewDate,
                                              TooltipContent = StandardTooltipContent,
                                              TaskListHeader = TaskListHeaderDefault,
                                              TaskListTable = TaskListTableDefault,
                                              ItemGanttContent,
                                              onDateChange,
                                              onProgressChange,
                                              onDoubleClick,
                                              onClick,
                                              onDelete,
                                              onSelect,
                                              onExpanderClick,
                                            }) => {
  console.log("gannnnt");

  const [state, setState] = useSetState<
    {
      currentViewDate: Date | undefined,
      taskListWidth: number,
      svgContainerWidth: number,
      svgContainerHeight: number,
      barTasks: BarTask[],
      ganttEvent: GanttEvent,
      selectedTask: BarTask | undefined,
      scrollY: number,
      scrollX: number,

      // scroll virtualized
      visibleItems: BarTask[],
      offsetY: number,
    }
  >({
    currentViewDate: undefined,
    taskListWidth: 0,
    svgContainerWidth: 0,
    svgContainerHeight: ganttHeight,
    barTasks: [],
    ganttEvent: {
      action: "",
    },
    selectedTask: undefined,
    scrollY: 0,
    scrollX: -1,

    // scroll virtualized
    visibleItems: [],
    offsetY: 0,
  });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  const [dateSetup, setDateSetup] = useState<DateSetup>(() => {
    const [startDate, endDate] = ganttDateRange(tasks, viewMode, preStepsCount);
    return { viewMode, dates: seedDates(startDate, endDate, viewMode) };
  });

  const taskHeight = useMemo(
    () => (rowHeight * barFill) / 100,
    [rowHeight, barFill],
  );

  const svgWidth = dateSetup.dates.length * columnWidth;
  const ganttFullHeight = state.barTasks.length * rowHeight;

  const ignoreScrollEvent = useRef<boolean>(false);
  // task change events

  const changeTaskData = (listTask: Task[]): any => {
    let filteredTasks: Task[];
    if (onExpanderClick) {
      filteredTasks = removeHiddenTasks(listTask);
    } else {
      filteredTasks = listTask;
    }
    filteredTasks = filteredTasks.sort(sortTasks);
    const [startDate, endDate] = ganttDateRange(
      filteredTasks,
      viewMode,
      preStepsCount,
    );
    let newDates = seedDates(startDate, endDate, viewMode);
    if (rtl) {
      newDates = newDates.reverse();
      if (state.scrollX === -1) {
        setState({ scrollX: newDates.length * columnWidth });
      }
    }
    return {
      dataSetup: { dates: newDates, viewMode },
      tasksData: convertToBarTasks(
        filteredTasks,
        newDates,
        columnWidth,
        rowHeight,
        taskHeight,
        barCornerRadius,
        handleWidth,
        rtl,
        barProgressColor,
        barProgressSelectedColor,
        barBackgroundColor,
        barBackgroundSelectedColor,
        projectProgressColor,
        projectProgressSelectedColor,
        projectBackgroundColor,
        projectBackgroundSelectedColor,
        milestoneBackgroundColor,
        milestoneBackgroundSelectedColor,
      ),
    };
  };

  useEffect(() => {
    let { dataSetup, tasksData } = changeTaskData(tasks);
    setDateSetup(dataSetup);
    setState({
      barTasks: tasksData,
    });
  }, [
    tasks,
    viewMode,
    preStepsCount,
    rowHeight,
    barCornerRadius,
    columnWidth,
    taskHeight,
    handleWidth,
    barProgressColor,
    barProgressSelectedColor,
    barBackgroundColor,
    barBackgroundSelectedColor,
    projectProgressColor,
    projectProgressSelectedColor,
    projectBackgroundColor,
    projectBackgroundSelectedColor,
    milestoneBackgroundColor,
    milestoneBackgroundSelectedColor,
    rtl,
    // scrollX,
    onExpanderClick,
  ]);

  useEffect(() => {
    if (
      viewMode === dateSetup.viewMode &&
      ((viewDate && !state.currentViewDate) ||
        (viewDate && state.currentViewDate?.valueOf() !== viewDate.valueOf()))
    ) {
      const dates = dateSetup.dates;
      const index = dates.findIndex(
        (d, i) =>
          viewDate.valueOf() >= d.valueOf() &&
          i + 1 !== dates.length &&
          viewDate.valueOf() < dates[i + 1].valueOf(),
      );
      if (index === -1) {
        return;
      }
      setState({
        currentViewDate: viewDate,
        scrollX: columnWidth * index,
      });
    }
  }, [
    viewDate,
    columnWidth,
    dateSetup.dates,
    dateSetup.viewMode,
    viewMode,
    // state.currentViewDate,
    // setCurrentViewDate,
  ]);

  // useEffect(() => {
  //   console.log("gantt useEffect 3", state.ganttEvent);
  //   const { changedTask, action } = state.ganttEvent;
  //   if (changedTask) {
  //     if (action === "delete") {
  //       setState({
  //         ganttEvent : { action: "" },
  //         barTasks: state.barTasks.filter(t => t.id !== changedTask.id)
  //       })
  //     } else if (
  //       action === "move" ||
  //       action === "end" ||
  //       action === "start" ||
  //       action === "progress"
  //     ) {
  //       const prevStateTask = state.barTasks.find(t => t.id === changedTask.id);
  //       if (
  //         prevStateTask &&
  //         (prevStateTask.start.getTime() !== changedTask.start.getTime() ||
  //           prevStateTask.end.getTime() !== changedTask.end.getTime() ||
  //           prevStateTask.progress !== changedTask.progress)
  //       ) {
  //         // actions for change
  //         const newTaskList = state.barTasks.map(t =>
  //           t.id === changedTask.id ? changedTask : t,
  //         );
  //         setState({
  //           barTasks: newTaskList,
  //         })
  //       }
  //     }
  //   }
  // }, [state.ganttEvent, state.barTasks]);


  useEffect(() => {
    if (!listCellWidth) {
      setState({
        taskListWidth: 0,
      });
      return;
    }
    if (taskListRef.current) {
      setState({
        taskListWidth: taskListRef.current.offsetWidth,
      });
      return;
    }
  }, [taskListRef, listCellWidth]);

  useEffect(() => {
    if (wrapperRef.current) {
      setState({
        svgContainerWidth: wrapperRef.current.offsetWidth - state.taskListWidth,
      });
    }
  }, [wrapperRef, state.taskListWidth]);

  useEffect(() => {
    if (ganttHeight) {
      setState({
        svgContainerHeight: ganttHeight + headerHeight,
      });
    } else {
      setState({
        svgContainerHeight: tasks.length * rowHeight + headerHeight,
      });
    }
  }, [ganttHeight, tasks, headerHeight, rowHeight]);

  // scroll events TODO
  // useEffect(() => {
  //   console.log('gantt useEffect 8');
  // if (rtl) {
  //   let filteredTasks: Task[];
  //   if (onExpanderClick) {
  //     filteredTasks = removeHiddenTasks(tasks);
  //   } else {
  //     filteredTasks = tasks;
  //   }
  //   filteredTasks = filteredTasks.sort(sortTasks);
  //   const [startDate, endDate] = ganttDateRange(
  //     filteredTasks,
  //     viewMode,
  //     preStepsCount
  //   );
  //   let newDates = seedDates(startDate, endDate, viewMode);
  //   newDates = newDates.reverse();
  //   if (scrollX === -1) {
  //     setScrollX(newDates.length * columnWidth);
  //   }
  // }
  // }, [
  // wrapperRef,
  // scrollY,
  // scrollX,
  // ganttHeight,
  // svgWidth,
  // rtl,
  // ganttFullHeight,
  // ]);
  // useEffect(() => {
  //   const handleWheel = (event: WheelEvent) => {
  //     console.log("handleWheel",event);
  //     console.log("scrollX",scrollX);
  //     console.log("scrollY",scrollY);
  //     console.log("ganttHeight",ganttHeight);
  //     console.log("ganttFullHeight",ganttFullHeight);
  //     // if (event.shiftKey || event.deltaX) {
  //     //   const scrollMove = event.deltaX ? event.deltaX : event.deltaY;
  //     //   let newScrollX = scrollX + scrollMove;
  //     //   if (newScrollX < 0) {
  //     //     newScrollX = 0;
  //     //   } else if (newScrollX > svgWidth) {
  //     //     newScrollX = svgWidth;
  //     //   }
  //     //   console.log("newScrollX",newScrollX);
  //     //   setScrollX(newScrollX);
  //     //   event.preventDefault();
  //     // } else
  //       if (ganttHeight) {
  //       let newScrollY = scrollY + event.deltaY;
  //         console.log("newScrollY",newScrollY);
  //         console.log("ganttFullHeight 2",ganttFullHeight -  ganttHeight);
  //       if (newScrollY < 0) {
  //         newScrollY = 0;
  //       } else if (newScrollY > ganttFullHeight - ganttHeight) {
  //         newScrollY = ganttFullHeight - ganttHeight;
  //       }
  //       console.log("newScrollY",newScrollY);
  //       if (newScrollY !== scrollY) {
  //         // setScrollY(newScrollY);
  //         event.preventDefault();
  //       }
  //     }
  //
  //     // setIgnoreScrollEvent(true);
  //   };
  //   // subscribe if scroll is necessary
  //   wrapperRef.current?.addEventListener("wheel", handleWheel, {
  //     passive: false,
  //   });
  //   return () => {
  //     wrapperRef.current?.removeEventListener("wheel", handleWheel);
  //   };
  //
  // }, []);


  const handleScroll = () => {

    const newStartIndex = Math.max(
      0,
      Math.floor(state.scrollY / rowHeight),
    );
    const newEndIndex = Math.min(
      tasks.length - 1,
      Math.floor((state.scrollY + ganttHeight) / rowHeight),
    );
    let newItems = tasks.slice(newStartIndex, newEndIndex + 1);
    let newOffsetY = newStartIndex * rowHeight;
    let {dataSetup, tasksData } = changeTaskData(newItems);
    setDateSetup(dataSetup);

    setState({
      visibleItems: tasksData,
      offsetY: newOffsetY,
    });
  };

  useEffect(() => {
    handleScroll();
  }, [state.barTasks, state.scrollY]);
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      // if (event.shiftKey || event.deltaX) {
      //   const scrollMove = event.deltaX ? event.deltaX : event.deltaY;
      //   let newScrollX = scrollX + scrollMove;
      //   if (newScrollX < 0) {
      //     newScrollX = 0;
      //   } else if (newScrollX > svgWidth) {
      //     newScrollX = svgWidth;
      //   }
      //   setScrollX(newScrollX);
      //   event.preventDefault();
      // } else
      if (ganttHeight) {
        let newScrollY = state.scrollY + event.deltaY;
        if (newScrollY < 0) {
          newScrollY = 0;
        } else if (newScrollY > ganttFullHeight - ganttHeight) {
          newScrollY = ganttFullHeight - ganttHeight;
        }
        if (newScrollY !== state.scrollY) {
          setState({
            scrollY: newScrollY,
          });
          event.preventDefault();
        }
      }

      ignoreScrollEvent.current = true;
    };
    // subscribe if scroll is necessary
    wrapperRef.current?.addEventListener("wheel", handleWheel, {
      passive: false,
    });
    return () => {
      wrapperRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, [
    // wrapperRef,
    state.scrollY,
    // scrollX,
    // ganttHeight,
    // svgWidth,
    rtl,
    // ganttFullHeight,
  ]);

  //

  const handleScrollY = (event: SyntheticEvent<HTMLDivElement>) => {
    if (state.scrollY !== event.currentTarget.scrollTop && !ignoreScrollEvent.current) {
      setState({
        scrollY: event.currentTarget.scrollTop,
      });
      ignoreScrollEvent.current = true;
    } else {
      ignoreScrollEvent.current = false;
    }
  };

  // const handleScrollX = (event: SyntheticEvent<HTMLDivElement>) => {
  //   console.log("handleScrollX",event);
  //
  //   if (scrollX !== event.currentTarget.scrollLeft && !ignoreScrollEvent) {
  //     setScrollX(event.currentTarget.scrollLeft);
  //     setIgnoreScrollEvent(true);
  //   } else {
  //     setIgnoreScrollEvent(false);
  //   }
  // };

  /**
   * Handles arrow keys events and transform it to new scroll
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    let newScrollY = state.scrollY;
    let newScrollX = state.scrollX;
    let isX = true;
    switch (event.key) {
      case "Down": // IE/Edge specific value
      case "ArrowDown":
        newScrollY += rowHeight;
        isX = false;
        break;
      case "Up": // IE/Edge specific value
      case "ArrowUp":
        newScrollY -= rowHeight;
        isX = false;
        break;
      case "Left":
      case "ArrowLeft":
        newScrollX -= columnWidth;
        break;
      case "Right": // IE/Edge specific value
      case "ArrowRight":
        newScrollX += columnWidth;
        break;
    }
    if (isX) {
      if (newScrollX < 0) {
        newScrollX = 0;
      } else if (newScrollX > svgWidth) {
        newScrollX = svgWidth;
      }
      setState({
        scrollX: newScrollX,
      });
    } else {
      if (newScrollY < 0) {
        newScrollY = 0;
      } else if (newScrollY > ganttFullHeight - ganttHeight) {
        newScrollY = ganttFullHeight - ganttHeight;
      }
      setState({
        scrollY: newScrollY,
      });
    }
    ignoreScrollEvent.current = true;
  };

  /**
   * Task select event
   */
  const handleSelectedTask = (taskId: string) => {
    const newSelectedTask = state.barTasks.find(t => t.id === taskId);
    const oldSelectedTask = state.barTasks.find(
      t => !!state.selectedTask && t.id === state.selectedTask.id,
    );
    if (onSelect) {
      if (oldSelectedTask) {
        onSelect(oldSelectedTask, false);
      }
      if (newSelectedTask) {
        onSelect(newSelectedTask, true);
      }
    }
    setState({
      selectedTask: newSelectedTask,
    });
  };
  const handleExpanderClick = (task: Task) => {
    if (onExpanderClick && task.hideChildren !== undefined) {
      onExpanderClick({ ...task, hideChildren: !task.hideChildren });
    }
  };

  const setGanttEvent = (eventGantt: any) => {
    const { changedTask, action } = eventGantt;
    console.log("eventGantt", eventGantt);
    setState({
      ganttEvent: eventGantt,
    });
    if (changedTask) {
      if (action === "delete") {
        setState({
          ganttEvent: { action: "" },
          barTasks: state.barTasks.filter(t => t.id !== changedTask.id),
        });
      } else if (
        action === "move" ||
        action === "end" ||
        action === "start" ||
        action === "progress"
      ) {
        const prevStateTask = state.barTasks.find(t => t.id === changedTask.id);
        if (
          prevStateTask &&
          (prevStateTask.start.getTime() !== changedTask.start.getTime() ||
            prevStateTask.end.getTime() !== changedTask.end.getTime() ||
            prevStateTask.progress !== changedTask.progress)
        ) {
          // actions for change
          const newTaskList = state.barTasks.map(t =>
            t.id === changedTask.id ? changedTask : t,
          );
          setState({
            barTasks: newTaskList,
            // ganttEvent : eventGantt
          });
        }
      }
    }

  };

  const setFailedTask = (value: any) => {
    if (value) {
      setState({
        barTasks: state.barTasks.map(t => (t.id !== value?.id ? t : value)),
      });
    }
  };


  const gridProps: GridProps = {
    columnWidth,
    svgWidth,
    // tasks: tasks,
    tasks: state.visibleItems || [],
    rowHeight,
    ganttFullHeight,
    dates: dateSetup.dates,
    todayColor,
    rtl,
    offsetY: state.offsetY,
  };
  const calendarProps: CalendarProps = {
    dateSetup,
    locale,
    viewMode,
    headerHeight,
    columnWidth,
    fontFamily,
    fontSize,
    rtl,
  };
  const barProps: TaskGanttContentProps = {
    tasks: state.visibleItems || [],
    // tasks: state.barTasks,
    dates: dateSetup.dates,
    ganttEvent: state.ganttEvent,
    selectedTask: state.selectedTask,
    rowHeight,
    // ganttFullHeight,
    taskHeight,
    columnWidth,
    arrowColor,
    timeStep,
    fontFamily,
    fontSize,
    arrowIndent,
    svgWidth,
    rtl,
    setGanttEvent,
    setFailedTask,
    setSelectedTask: handleSelectedTask,
    onDateChange,
    onProgressChange,
    onDoubleClick,
    onClick,
    onDelete,
    offsetY: state.offsetY,

  };

  const tableProps: TaskListProps = {
    rowHeight,
    rowWidth: listCellWidth,
    fontFamily,
    fontSize,
    tasks: state.visibleItems || [],
    // tasks: state.barTasks,
    locale,
    headerHeight,
    scrollY: state.scrollY,
    ganttHeight,
    horizontalContainerClass: styles.horizontalContainer,
    selectedTask: state.selectedTask,
    taskListRef,
    setSelectedTask: handleSelectedTask,
    onExpanderClick: handleExpanderClick,
    TaskListHeader,
    TaskListTable,
    offsetY: state.offsetY,
  };

  // @ts-ignore
  const ItemRenderGanttContent: React.JSXElementConstructor<any> = React.memo((propsGantt: any) => {
    return !!ItemGanttContent && propsGantt ? <ItemGanttContent {...propsGantt}></ItemGanttContent> : undefined;
  });
  return (
    <div>
      <div
        className={styles.wrapper}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        ref={wrapperRef}
      >
        {listCellWidth && <TaskList {...tableProps} />}
        <TaskGantt
          gridProps={gridProps}
          calendarProps={calendarProps}
          barProps={barProps}
          ganttHeight={ganttHeight}
          scrollY={state.scrollY}
          scrollX={state.scrollX}
          ItemGanttContent={!!ItemGanttContent ? ItemRenderGanttContent : undefined}
        />
        {state.ganttEvent.changedTask && (
          <Tooltip
            arrowIndent={arrowIndent}
            rowHeight={rowHeight}
            svgContainerHeight={state.svgContainerHeight}
            svgContainerWidth={state.svgContainerWidth}
            fontFamily={fontFamily}
            fontSize={fontSize}
            scrollX={state.scrollX}
            scrollY={state.scrollY}
            task={state.ganttEvent.changedTask}
            headerHeight={headerHeight}
            taskListWidth={state.taskListWidth}
            TooltipContent={TooltipContent}
            rtl={rtl}
            svgWidth={svgWidth}
          />
        )}
        <VerticalScroll
          ganttFullHeight={ganttFullHeight}
          ganttHeight={ganttHeight}
          headerHeight={headerHeight}
          scroll={state.scrollY}
          onScroll={handleScrollY}
          rtl={rtl}
        />
      </div>
      {/*<HorizontalScroll*/}
      {/*  svgWidth={svgWidth}*/}
      {/*  taskListWidth={taskListWidth}*/}
      {/*  scroll={scrollX}*/}
      {/*  rtl={rtl}*/}
      {/*  onScroll={handleScrollX}*/}
      {/*/>*/}
    </div>
  );
};
