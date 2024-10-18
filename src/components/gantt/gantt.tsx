import React, {
  SyntheticEvent,
  useRef,
  useEffect,
  useMemo,
forwardRef, useImperativeHandle
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
import { HorizontalScroll } from "../other/horizontal-scroll";
import { debounce, removeHiddenTasks, sortTasks } from "../../helpers/other-helper";
import styles from "./gantt.module.css";
import useSetState from "../../helpers/useSetState";
// import { CalendarGant } from "./calendar-gantt";

const debounceTime: number = 0;
const TaskTableDefault: React.FC<any> = () => {
  return <div></div>;
};
export const Gantt: React.FC<GanttProps> = forwardRef(({
                                              tasks,
                                              headerHeight = 50,
                                              columnWidth = 60,
                                              listCellWidth = "155px",
                                              rowHeight = 50,
                                              ganttHeight = 0,
                                              maxHeight = "100%",
                                              scrollLoadData = false,
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
                                              TaskTable = TaskTableDefault,
                                              ItemGanttContent,
                                              onDateChange,
                                              onProgressChange,
                                              onDoubleClick,
                                              onClick,
                                              onDelete,
                                              onSelect,
                                              onExpanderClick,
                                              defaultScrollY = 0,
                                              onScrollTask,
                                              onZoomTask,
                                              widthTable= 0
                                            }, ref) => {

  const getDateSetup = () => {
    const [startDate, endDate] = ganttDateRange(tasks, viewMode, preStepsCount);
    return { viewMode, dates: seedDates(startDate, endDate, viewMode) };
  };
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
      dateSetup: DateSetup
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
    scrollX: 0,

    // scroll virtualized
    visibleItems: [],
    offsetY: 0,
    dateSetup: getDateSetup(),
  });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  const countScroll = useRef(0);
  // const [dateSetup, setDateSetup] = useState<DateSetup>(() => {
  //   const [startDate, endDate] = ganttDateRange(tasks, viewMode, preStepsCount);
  //   return { viewMode, dates: seedDates(startDate, endDate, viewMode) };
  // });

  const taskHeight = useMemo(
    () => (rowHeight * barFill) / 100,
    [rowHeight, barFill],
  );

  const svgWidth = state.dateSetup.dates.length * columnWidth;
  const ganttFullHeight = !listCellWidth ? (state.barTasks.length * rowHeight) - (headerHeight || 0) : state.barTasks.length * rowHeight;

  const ignoreScrollEvent = useRef<boolean>(false);
  // task change events

  const handleRemoveHiddenTask = (listTask: Task[]): Task[] => {
    let filteredTasks: Task[];
    if (onExpanderClick) {
      filteredTasks = removeHiddenTasks(listTask);
    } else {
      filteredTasks = listTask;
    }
    return filteredTasks;
  };
  const changeTaskData = (listTask: Task[]): { dataSetup: DateSetup, tasksData: BarTask[] } => {
    let filteredTasks: Task[];
    filteredTasks = listTask.sort(sortTasks);
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
        tasks,
      ),
    };
  };

  useEffect(() => {
    let listTask: Task[] = handleRemoveHiddenTask(tasks);
    let { dataSetup, tasksData } = changeTaskData(listTask);
    setState({
      barTasks: tasksData,
      dateSetup: dataSetup,
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
    // onExpanderClick,
  ]);

  useEffect(() => {
    let { newItems, newOffsetY } = getDataScroll(state.barTasks, 0);
    setState({
      visibleItems: newItems,
      offsetY: newOffsetY,
    });
  }, [state.barTasks, ganttFullHeight]);

  const onChangeDefaultScrollY = (value:number) => {
    if (value !== state.scrollY && Math.abs(value - state.scrollY) > 1) {
      setState({
        scrollY: value,
      });
      if (ganttHeight && ganttHeight < ganttFullHeight && scrollLoadData) {
        handleScroll(value);
      } else {
        if (wrapperRef.current) {
          wrapperRef.current.scrollTop = value;
        }
      }
    }
  }

  useEffect(() => {
    onChangeDefaultScrollY(defaultScrollY)
  }, [defaultScrollY, wrapperRef]);
  useEffect(() => {
    if (
      viewMode === state.dateSetup.viewMode &&
      ((viewDate && !state.currentViewDate) ||
        (viewDate && state.currentViewDate?.valueOf() !== viewDate.valueOf())) &&
      state.scrollX <= 1 && countScroll.current < 1
    ) {
      const dates = state.dateSetup.dates;
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
    state.dateSetup.dates,
    state.dateSetup.viewMode,
    viewMode,
    // state.currentViewDate,
    // setCurrentViewDate,
  ]);


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

  const getDataScroll = (listTask: any, scrollYPosition: number): { newItems: any, newOffsetY: number } => {
    console.log("getDataScroll");
    if (!scrollLoadData) {
      return {
        newItems: listTask,
        newOffsetY: 0,
      };
    }
    let ganttHeightCheck = ganttHeight && ganttHeight < ganttFullHeight ? ganttHeight : ganttFullHeight;
    const newStartIndex = Math.max(
      0,
      Math.floor(scrollYPosition / rowHeight),
    ) || 0;
    const newEndIndex = Math.min(
      listTask.length - 1,
      Math.floor((scrollYPosition + ganttHeightCheck) / rowHeight),
    );
    let newItems = listTask.slice(newStartIndex, newEndIndex + 1);
    let newOffsetY = newStartIndex * rowHeight || 0;
    return {
      newItems,
      newOffsetY,
    };
  };


  const handleScroll = (scrollYPosition: number) => {
    if (!scrollLoadData) {
      return;
    }
    let listTask: Task[] = handleRemoveHiddenTask(tasks);
    let { newItems, newOffsetY } = getDataScroll(listTask, scrollYPosition || 0);
    if (newOffsetY != state.offsetY) {
      let { tasksData, dataSetup } = changeTaskData(newItems);
      setState({
        visibleItems: tasksData,
        offsetY: newOffsetY,
        dateSetup: dataSetup,
      });
    }
  };


  const handleScrollTask = (scrollYPosition: number) => {
    console.log("handleScrollTask", scrollYPosition, onScrollTask);
    if (onScrollTask) {
      console.log('==== handleScrollTask');
      onScrollTask({
        y: scrollYPosition < 2 ? 0 : scrollYPosition,
      });
    }
  };


  const handleZoomTask = (type: "zoomIn" | "zoomOut", event?: any) => {
    console.log("handleZoomTask",type);
    if (onZoomTask) {
      onZoomTask(type, event);
    }
  }

  const handleWheel = debounce((event: any) => {
    console.log("handleWheel", ignoreScrollEvent.current);
    event.stopImmediatePropagation()
    event.preventDefault();
    // debugger;
    if (ignoreScrollEvent.current) {
      return;
    }
    console.log('handleWheel');
    ignoreScrollEvent.current = true;
    if (event.ctrlKey || event.metaKey) {
      // event.preventDefault();
      // Ngăn chặn hành động zoom mặc định của trình duyệt
      if (event.deltaY < 0) {
        handleZoomTask("zoomIn", event);
      } else {
        handleZoomTask("zoomOut", event);
      }
      ignoreScrollEvent.current = false;
      return;
    }
    if (event.shiftKey || event.deltaX) {
      // event.preventDefault();
      const scrollMove = event.deltaX ? event.deltaX : event.deltaY;
      let newScrollX = state.scrollX + scrollMove;
      if (newScrollX < 0) {
        newScrollX = 0;
      } else if (newScrollX > svgWidth) {
        newScrollX = svgWidth;
      }
      if (newScrollX !== state.scrollX) {
        console.log("newScrollX", newScrollX);
        setState({
          scrollX: newScrollX,
        });
        countScroll.current += 1;
        // event.preventDefault();
      }
    } else if (ganttHeight) {
      // event.preventDefault();
      let newScrollY = state.scrollY + event.deltaY;
      if (newScrollY < 0) {
        newScrollY = 0;
      } else if (newScrollY > ganttFullHeight - ganttHeight) {
        newScrollY = ganttFullHeight - ganttHeight;
      }
      if (newScrollY !== state.scrollY) {
        console.log("newScrollY", newScrollY);
        setState({
          scrollY: newScrollY,
        });
        if (ganttHeight && ganttHeight < ganttFullHeight) {
          handleScroll(newScrollY);
          handleScrollTask(newScrollY);
        }
      }
    } else if (maxHeight) {
      // event.preventDefault();
      let newScrollY = state.scrollY + event.deltaY;
      if (newScrollY < 0) {
        newScrollY = 0;
      } else if (newScrollY > ganttFullHeight) {
        newScrollY = ganttFullHeight;
      }
      if (newScrollY !== state.scrollY) {
        console.log("newScrollY", newScrollY);
        setState({
          scrollY: newScrollY,
        });
        handleScrollTask(newScrollY);
        // @ts-ignore
        wrapperRef.current.scrollTop = newScrollY;
        // event.preventDefault();
      }
    }
    ignoreScrollEvent.current = false;

  }, debounceTime);

  const onWheel = (event: any) => {
    handleWheel(event);
  };
  const isFocusWrapper = useRef(false)

  const onMouseenter = (event:any) => {
    console.log("event",event);
    isFocusWrapper.current = true
  }
  const onMouseleave = (event:any) => {
    console.log("event",event);
    isFocusWrapper.current = false
  }
  useEffect(() => {
    // subscribe if scroll is necessary

    // if (ganttHeight && ganttHeight < ganttFullHeight) {
    wrapperRef.current?.addEventListener("wheel", onWheel, {
      passive: false,
    });
    wrapperRef.current?.addEventListener('mouseenter', onMouseenter)
    wrapperRef.current?.addEventListener('mouseleave', onMouseleave)
    window.addEventListener('wheel', function(event) {
      if (isFocusWrapper.current) {
        event.preventDefault();
      }
    }, { passive: false });
    // } else {
    //   wrapperRef.current?.removeEventListener("wheel", handleWheel);
    // }
    return () => {
      wrapperRef.current?.removeEventListener("wheel", onWheel);
      wrapperRef.current?.removeEventListener("wheel", onMouseenter);
      wrapperRef.current?.removeEventListener("wheel", onMouseleave);

    };
  }, [
    wrapperRef,
    state.scrollY,
    state.scrollX,
    ganttHeight,
    // svgWidth,
    rtl,
    ganttFullHeight,
    maxHeight,
  ]);

  //

  const handleScrollY = debounce((event: any) => {
    console.log("handleScrollY", ignoreScrollEvent.current);
    // debugger;
    if (ignoreScrollEvent.current) return;
    console.log('handleScrollY');
    ignoreScrollEvent.current = true;
    event.stopPropagation()
    event.preventDefault();
    if (state.scrollY !== event.target.scrollTop) {
      const { offsetHeight, scrollHeight, scrollTop } = event.target;
      let newScrollY = scrollTop;
      if (scrollHeight - offsetHeight <= scrollTop) {
        newScrollY = scrollHeight - offsetHeight;
      }
      setState({
        scrollY: newScrollY,
      });
      handleScrollTask(newScrollY);
      handleScroll(newScrollY);
      // if (ganttHeight && ganttHeight < ganttFullHeight) {
      //   handleScrollTask(newScrollY);
      // }
    }
    ignoreScrollEvent.current = false;
  }, debounceTime);

  const handleScrollX = (event: SyntheticEvent<HTMLDivElement>) => {
    if (ignoreScrollEvent.current) return;
    console.log('handleScrollX');
    ignoreScrollEvent.current = true;
    if (state.scrollX !== event.currentTarget.scrollLeft) {
      setState({
        scrollX: event.currentTarget.scrollLeft,
      });
      countScroll.current += 1;
    }
    ignoreScrollEvent.current = false;
  };

  /**
   * Handles arrow keys events and transform it to new scroll
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    ignoreScrollEvent.current = true;
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
      if (newScrollX !== state.scrollX) {
        setState({
          scrollX: newScrollX,
        });
        countScroll.current += 1;
      }

    } else {
      if (newScrollY < 0) {
        newScrollY = 0;
      } else if (newScrollY > ganttFullHeight - ganttHeight) {
        newScrollY = ganttFullHeight - ganttHeight;
      }
      if (newScrollY !== state.scrollY) {
        setState({
          scrollY: newScrollY,
        });
        if (ganttHeight && ganttHeight < ganttFullHeight) {
          handleScroll(newScrollY);
          handleScrollTask(newScrollY);
        }
      }
    }
    console.log("handleKeyDown");
    ignoreScrollEvent.current = false;
  };

  /**
   * Task select event
   */
  const handleSelectedTask = (taskId: string) => {
    const newSelectedTask = state.visibleItems.find(t => t.id === taskId);
    const oldSelectedTask = state.visibleItems.find(
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
    // console.log("eventGantt", eventGantt);
    setState({
      ganttEvent: eventGantt,
    });
    if (changedTask) {
      if (action === "delete") {
        setState({
          ganttEvent: { action: "" },
          visibleItems: state.visibleItems.filter(t => t.id !== changedTask.id),
        });
      } else if (
        action === "move" ||
        action === "end" ||
        action === "start" ||
        action === "progress"
      ) {
        const prevStateTask = state.visibleItems.find(t => t.id === changedTask.id);
        if (
          prevStateTask &&
          (prevStateTask.start.getTime() !== changedTask.start.getTime() ||
            prevStateTask.end.getTime() !== changedTask.end.getTime() ||
            prevStateTask.progress !== changedTask.progress)
        ) {
          // actions for change
          const newTaskVisibleList = state.visibleItems.map(t =>
            t.id === changedTask.id ? changedTask : t,
          );
          setState({
            visibleItems: newTaskVisibleList,
          });
        }
        // schedules change
        else if (changedTask?.project) {
          const stateProject = state.visibleItems.find(t => t.id === changedTask.project);

          if (stateProject?.type === "schedules" &&
            stateProject?.scheduleChildren &&
            stateProject?.scheduleChildren?.length > 0) {
            const prevStateTask = stateProject.scheduleChildren.find(t => t.id === changedTask.id);

            if (
              prevStateTask &&
              (prevStateTask.start.getTime() !== changedTask.start.getTime() ||
                prevStateTask.end.getTime() !== changedTask.end.getTime() ||
                prevStateTask.progress !== changedTask.progress)
            ) {
              let newScheduleChildren = stateProject.scheduleChildren.map(t =>
                t.id === changedTask.id ? changedTask : t,
              );
              // actions for change
              const newTaskVisibleList = state.visibleItems.map(t =>
                t.id === stateProject.id ? {
                  ...t,
                  scheduleChildren: newScheduleChildren,
                } : t,
              );
              setState({
                visibleItems: newTaskVisibleList,
              });
            }
          }
        }
      }
    }
  };

  // const setGanttEventGrid = async (
  //   action: GanttContentMoveAction,
  //   task: Task,
  //   event?: React.MouseEvent | React.KeyboardEvent,
  // ) => {
  //   if (!event) {
  //     if (action === "select") {
  //       // setSelectedTask(task.id);
  //     }
  //   }
  //   // Keyboard events
  //   // else if (isKeyboardEvent(event)) {
  //   //   if (action === "delete") {
  //   //     if (onDelete) {
  //   //       try {
  //   //         const result = await onDelete(task);
  //   //         if (result !== undefined && result) {
  //   //           setGanttEvent({ action, changedTask: task });
  //   //         }
  //   //       } catch (error) {
  //   //         console.error("Error on Delete. " + error);
  //   //       }
  //   //     }
  //   //   }
  //   // }
  //   // Mouse Events
  //   else if (action === "mouseenter") {
  //     // console.log(action,task);
  //     // if (!ganttEvent.action) {
  //     //   setGanttEvent({
  //     //     action,
  //     //     changedTask: task,
  //     //     originalSelectedTask: task,
  //     //   });
  //     // }
  //   }
  // };

  const setFailedTask = (value: any) => {
    if (value) {
      setState({
        visibleItems: state.visibleItems.map(t => (t.id !== value?.id ? t : value)),
      });
    }
  };


  const gridProps: GridProps = {
    columnWidth,
    svgWidth,
    tasks: tasks,
    // tasks: state.visibleItems || [],
    rowHeight,
    ganttFullHeight,
    dates: state.dateSetup.dates,
    todayColor,
    rtl,
    offsetY: state.offsetY,
    // onEventGridStart : setGanttEventGrid
  };
  const calendarProps: CalendarProps = {
    dateSetup: state.dateSetup,
    locale,
    viewMode,
    headerHeight,
    columnWidth,
    fontFamily,
    fontSize,
    rtl,
    hidden: !listCellWidth,
  };
  const barProps: TaskGanttContentProps = {
    tasks: state.visibleItems || [],
    dates: state.dateSetup.dates,
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
    locale,
    headerHeight,
    scrollY: state.scrollY,
    ganttHeight: ganttHeight && ganttHeight < ganttFullHeight ? ganttHeight : ganttFullHeight,
    ganttFullHeight,
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

  useImperativeHandle(ref, () => ({
     // Expose hàm cho component cha
    onChangeDefaultScrollY,
  }));
  return (
    <div>
      {/*{!listCellWidth &&*/}
      {/*  <CalendarGant*/}
      {/*    gridProps={gridProps}*/}
      {/*    calendarProps={calendarProps}*/}
      {/*    barProps={barProps}*/}
      {/*    ganttHeight={ganttHeight && ganttHeight < ganttFullHeight ? ganttHeight : ganttFullHeight}*/}
      {/*    scrollY={state.scrollY}*/}
      {/*    scrollX={state.scrollX}*/}
      {/*  ></CalendarGant>*/}
      {/*}*/}
      <div
        style={{
          maxHeight: maxHeight || "100%",
          overflow: "auto",
        }}
        ref={wrapperRef}
        // onScroll={handleScrollY}
        // onWheel={handleWheel}
      >

        <div
          className={styles.wrapper}
          onKeyDown={handleKeyDown}
          tabIndex={0}

        >
          {listCellWidth ? <TaskList {...tableProps} /> : <TaskTable />}
          <TaskGantt
            gridProps={gridProps}
            calendarProps={calendarProps}
            barProps={barProps}
            ganttHeight={ganttHeight && ganttHeight < ganttFullHeight ? ganttHeight : ganttFullHeight}
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
              taskListWidth={listCellWidth ? state.taskListWidth : widthTable}
              TooltipContent={TooltipContent}
              rtl={rtl}
              svgWidth={svgWidth}
              offsetY={state.offsetY}
            />
          )}
          <VerticalScroll
            ganttFullHeight={ganttFullHeight}
            ganttHeight={ganttHeight && ganttHeight < ganttFullHeight ? ganttHeight : ganttFullHeight}
            headerHeight={headerHeight}
            scroll={state.scrollY}
            onScroll={handleScrollY}
            rtl={rtl}
          />
        </div>
      </div>
      <HorizontalScroll
        svgWidth={svgWidth}
        taskListWidth={listCellWidth ? state.taskListWidth : widthTable}
        scroll={state.scrollX}
        rtl={rtl}
        onScroll={handleScrollX}
      />
    </div>
  );
});
