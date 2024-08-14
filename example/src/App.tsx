import React, { useEffect, useRef, useState } from "react";
import { Task, ViewMode, Gantt } from "gantt-task-react-v2";
import { ViewSwitcher } from "./components/view-switcher";
import { getStartEndDateForProject, initTasks } from "./helper";
import "gantt-task-react-v2/dist/index.css";
import useSetState from "./useSetState";
// import AppTest from "./components/VirtualizedList";
// import AppTest2 from "./components/VirtualizedList2";

// Init
const listMode: ViewMode[] = [ViewMode.Hour, ViewMode.QuarterDay, ViewMode.HalfDay, ViewMode.Day,
  ViewMode.Week, ViewMode.Month, ViewMode.QuarterYear, ViewMode.Year];
const App = () => {
  const [state, setState] = useSetState<any>({
    view: ViewMode.Day,
  });

  const stateRef = useRef<any>({
    zoomIndex: 3,
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isChecked, setIsChecked] = useState(true);
  const [ganttHeight, setGanttHeight] = useState(200);
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);


  let columnWidth = 65;
  let rowHeight = 50;
  if (state.view === ViewMode.Year) {
    columnWidth = 350;
  } else if (state.view === ViewMode.Month) {
    columnWidth = 300;
  } else if (state.view === ViewMode.Week) {
    columnWidth = 250;
  }

  const handleTaskChange = (task: Task) => {
    console.log("On date change Id:" + task.id);
    let newTasks = tasks.map(t => (t.id === task.id ? task : t));
    if (task.project) {
      const [start, end] = getStartEndDateForProject(newTasks, task.project);
      const project = newTasks[newTasks.findIndex(t => t.id === task.project)];
      if (
        project.start.getTime() !== start.getTime() ||
        project.end.getTime() !== end.getTime()
      ) {
        const changedProject = { ...project, start, end };
        newTasks = newTasks.map(t =>
          t.id === task.project ? changedProject : t,
        );
      }
    }
    setTasks(newTasks);
  };

  const handleTaskDelete = (task: Task) => {
    const conf = window.confirm("Are you sure about " + task.name + " ?");
    if (conf) {
      setTasks(tasks.filter(t => t.id !== task.id));
    }
    return conf;
  };

  const handleProgressChange = async (task: Task) => {
    setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    console.log("On progress change Id:" + task.id);
  };

  const handleDblClick = (task: Task) => {
    alert("On Double Click event Id:" + task.id);
  };

  const handleClick = (task: Task) => {
    console.log("On Click event Id:" + task.id);
  };

  const handleSelect = (task: Task, isSelected: boolean) => {
    console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
  };

  const handleExpanderClick = (task: Task) => {
    let newTask = tasks.map(t => (t.id === task.id ? task : t));
    setTasks(newTask);
    console.log("On expander click Id:" + task.id);
    console.log("On expander tasks:", newTask);
  };

  useEffect(() => {
    setGanttHeight(300);
    setTasks(initTasks());
    // const editorEl: any = document.getElementById(`h-editor`);
    // const initSetting = (editorWidth: number, editorHeight: number) => {
    //   console.log("editorWidth", editorWidth);
    //   console.log("editorHeight", editorHeight);
    //
    //   setGanttHeight(editorHeight - rowHeight)
    // };
    // const myObserver = new ResizeObserver(([entry]) => {
    //   // throttle(initSetting, 1000)(entry.contentRect.width)
    //   initSetting(entry.contentRect.width, entry.contentRect.height);
    //
    //   // throttle(initSetting, 1000)(windowWidth)
    // });
    //
    //
    // myObserver.observe(editorEl);
    //
    // return () => {
    //   myObserver.disconnect();
    // };
  }, []);

  // const onScrollTask = ({ y }: any) => {
  //   if (y != scrollY) {
  //     console.log("onScrollTask");
  //     setScrollY(y);
  //   }
  // };

  const onZoomTask = (type: "zoomIn" | "zoomOut") => {
    if (type === "zoomIn" && stateRef.current.zoomIndex > 0) {
      let newZoom: number = stateRef.current.zoomIndex - 1;
      stateRef.current.zoomIndex = newZoom;
      setState({
        view: listMode[newZoom],
      });
      console.log(type, newZoom);
    }

    if (type === "zoomOut" && stateRef.current.zoomIndex < listMode.length - 1) {
      console.log("listMode.length", listMode.length);
      console.log("stateRef.current.zoomIndex", stateRef.current.zoomIndex);
      let newZoom: number = stateRef.current.zoomIndex + 1;
      stateRef.current.zoomIndex = newZoom;
      setState({
        view: listMode[newZoom],
      });
      console.log(type, newZoom);
    }
  };
  let configColor: any = {
    // #83b5fe
    barCornerRadius: 3,
    barProgressColor: "#79c780",
    barProgressSelectedColor: "#5b9460",
    barBackgroundColor: "#8ee997",
    barBackgroundSelectedColor: "#6aaf71",
    projectProgressColor: "#709ad8",
    projectProgressSelectedColor: "#5474a2",
    projectBackgroundColor: "#83b5fe",
    projectBackgroundSelectedColor: "#6288be",
    milestoneBackgroundColor: "#83b5fe",
    milestoneBackgroundSelectedColor: "#6288be",
  };
  // const ItemGanttContent : React.FC = ({task,rowHeight}: any) => {
  //   return <>
  //   <div>{task?.name}</div>
  //   </>
  // }
  return (
    <div className="Wrapper">
      <ViewSwitcher
        onViewModeChange={viewMode => {
          setState({
            view: viewMode,
          });
        }}
        onViewListChange={setIsChecked}
        isChecked={isChecked}
      />
      {/*<AppTest></AppTest>*/}
      {/*<AppTest2></AppTest2>*/}


      <h3>Gantt With Limited Height</h3>
      <div>
        scrollX :
        <input type="text" value={scrollX} onChange={(event: any) => setScrollX(event.target.value)} />
      </div>
      <div> scrollY :
        <input type="number" value={scrollY} onChange={(event: any) => setScrollY(Number(event.target.value))} />
      </div>
      <div>
        view : {state.view}
      </div>
      <div
        id={"h-editor"}
        style={{
          maxHeight: "calc(100vh - 140px)",
        }}
      >
        {
          tasks?.length > 0 &&
          <Gantt
            {...configColor}
            defaultScrollX={scrollX}
            defaultScrollY={scrollY}
            // onScrollTask={onScrollTask}
            tasks={tasks}
            viewMode={state.view}
            onDateChange={handleTaskChange}
            onDelete={handleTaskDelete}
            onProgressChange={handleProgressChange}
            onDoubleClick={handleDblClick}
            onClick={handleClick}
            onSelect={handleSelect}
            onExpanderClick={handleExpanderClick}
            listCellWidth={isChecked ? "155px" : ""}
            ganttHeight={ganttHeight}
            rowHeight={rowHeight}
            columnWidth={columnWidth}
            onZoomTask={onZoomTask}
            // ItemGanttContent={ItemGanttContent}
          />
        }

      </div>

    </div>
  );
};

export default App;
