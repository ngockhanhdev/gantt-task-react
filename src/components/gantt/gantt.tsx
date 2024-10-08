import React, {
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
import { HorizontalScroll } from "../other/horizontal-scroll";
import { debounce, removeHiddenTasks, sortTasks } from "../../helpers/other-helper";
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
                                              defaultScrollY = 0,
                                              onScrollTask,
                                              onZoomTask,
                                            }) => {

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
  // const [dateSetup, setDateSetup] = useState<DateSetup>(() => {
  //   const [startDate, endDate] = ganttDateRange(tasks, viewMode, preStepsCount);
  //   return { viewMode, dates: seedDates(startDate, endDate, viewMode) };
  // });

  const taskHeight = useMemo(
    () => (rowHeight * barFill) / 100,
    [rowHeight, barFill],
  );

  const svgWidth = state.dateSetup.dates.length * columnWidth;
  const ganttFullHeight = state.barTasks.length * rowHeight;

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
        tasks
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
    // console.log("get data", newItems);
    setState({
      visibleItems: newItems,
      offsetY: newOffsetY,
    });
  }, [state.barTasks, ganttFullHeight]);

  useEffect(() => {
    if (defaultScrollY !== state.scrollY && Math.abs(defaultScrollY - state.scrollY) > 1) {
      setState({
        scrollY: defaultScrollY,
      });
      if (ganttHeight && ganttHeight < ganttFullHeight) {
        handleScroll(defaultScrollY);
      }
    }
  }, [defaultScrollY]);
  useEffect(() => {
    if (
      viewMode === state.dateSetup.viewMode &&
      ((viewDate && !state.currentViewDate) ||
        (viewDate && state.currentViewDate?.valueOf() !== viewDate.valueOf()))
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
  }

  const handleScrollTask = debounce((scrollYPosition: number) => {
    if (onScrollTask && Math.abs(defaultScrollY - scrollYPosition) > 1) {
      onScrollTask({
        y: state.scrollY,
      });
    }
  }, 10);
  // useEffect(() => {
  //   if (ganttHeight && ganttHeight < ganttFullHeight) {
  //     handleScroll();
  //     handleScrollTask()
  //   }
  // }, [
  //   // state.barTasks,
  //   state.scrollY,
  //   // ganttHeight,
  //   // ganttFullHeight,
  // ]);

  const handleZoomTask = debounce((type: "zoomIn" | "zoomOut", event?: any) => {
    if (onZoomTask) {
      onZoomTask(type, event);
    }
  }, 200);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault(); // Ngăn chặn hành động zoom mặc định của trình duyệt
        if (event.deltaY < 0) {
          handleZoomTask("zoomIn", event);
        } else {
          handleZoomTask("zoomOut", event);
        }
        return;
      }
      if (event.shiftKey || event.deltaX) {
        const scrollMove = event.deltaX ? event.deltaX : event.deltaY;
        let newScrollX = state.scrollX + scrollMove;
        if (newScrollX < 0) {
          newScrollX = 0;
        } else if (newScrollX > svgWidth) {
          newScrollX = svgWidth;
        }
        if (newScrollX !== state.scrollX) {
          setState({
            scrollX: newScrollX,
          });
          event.preventDefault();
        }
      } else if (ganttHeight) {
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
          if (ganttHeight && ganttHeight < ganttFullHeight) {
            handleScroll(newScrollY);
            handleScrollTask(newScrollY);
          }
          event.preventDefault();
        }
      }

      ignoreScrollEvent.current = true;
    };
    // subscribe if scroll is necessary

    // if (ganttHeight && ganttHeight < ganttFullHeight) {
    wrapperRef.current?.addEventListener("wheel", handleWheel, {
      passive: false,
    });
    // } else {
    //   wrapperRef.current?.removeEventListener("wheel", handleWheel);
    // }
    return () => {
      wrapperRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, [
    // wrapperRef,
    state.scrollY,
    state.scrollX,
    ganttHeight,
    // svgWidth,
    rtl,
    ganttFullHeight,
  ]);

  //

  const handleScrollY = (event: SyntheticEvent<HTMLDivElement>) => {
    if (state.scrollY !== event.currentTarget.scrollTop && !ignoreScrollEvent.current) {
      setState({
        scrollY: event.currentTarget.scrollTop,
      });
      if (ganttHeight && ganttHeight < ganttFullHeight) {
        handleScroll(event.currentTarget.scrollTop);
        handleScrollTask(event.currentTarget.scrollTop);
      }
      ignoreScrollEvent.current = true;
    } else {
      ignoreScrollEvent.current = false;
    }
  };

  const handleScrollX = (event: SyntheticEvent<HTMLDivElement>) => {
    if (state.scrollX !== event.currentTarget.scrollLeft && !ignoreScrollEvent.current) {
      setState({
        scrollX: event.currentTarget.scrollLeft,
      });
      ignoreScrollEvent.current = true;
    } else {
      ignoreScrollEvent.current = false;
    }
  };

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
      if (newScrollX !== state.scrollX) {
        setState({
          scrollX: newScrollX,
        });
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
    ignoreScrollEvent.current = true;
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
    console.log("eventGantt", eventGantt);
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
          console.log("newTaskVisibleList",action,newTaskVisibleList);
          setState({
            visibleItems: newTaskVisibleList,
          });
        }
        // schedules change
        else if (changedTask?.project) {
          const stateProject = state.visibleItems.find(t => t.id === changedTask.project);

          if (stateProject?.type === 'schedules' &&
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
            taskListWidth={state.taskListWidth}
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
      <HorizontalScroll
        svgWidth={svgWidth}
        taskListWidth={state.taskListWidth}
        scroll={state.scrollX}
        rtl={rtl}
        onScroll={handleScrollX}
      />
    </div>
  );
};
