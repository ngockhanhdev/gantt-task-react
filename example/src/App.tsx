import React, { useEffect } from "react";
import { Task, ViewMode, Gantt } from "gantt-task-react-v2";
import { ViewSwitcher } from "./components/view-switcher";
import { getStartEndDateForProject, initTasks } from "./helper";
import "gantt-task-react-v2/dist/index.css";
// import AppTest from "./components/VirtualizedList";
// import AppTest2 from "./components/VirtualizedList2";

// Init
const App = () => {

  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
  const [tasks, setTasks] = React.useState<Task[]>(initTasks());
  const [isChecked, setIsChecked] = React.useState(true);
  const [ganttHeight, setGanttHeight] = React.useState(0);
  let columnWidth = 65;
  let rowHeight = 50;
  if (view === ViewMode.Year) {
    columnWidth = 350;
  } else if (view === ViewMode.Month) {
    columnWidth = 300;
  } else if (view === ViewMode.Week) {
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
    setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    console.log("On expander click Id:" + task.id);
  };

  useEffect(() => {
    const editorEl: any = document.getElementById(`h-editor`);
    const initSetting = (editorWidth: number, editorHeight: number) => {
      console.log("editorWidth", editorWidth);
      console.log("editorHeight", editorHeight);

      setGanttHeight(editorHeight - rowHeight)
    };
    const myObserver = new ResizeObserver(([entry]) => {
      // throttle(initSetting, 1000)(entry.contentRect.width)
      initSetting(entry.contentRect.width, entry.contentRect.height);

      // throttle(initSetting, 1000)(windowWidth)
    });


    myObserver.observe(editorEl);

    return () => {
      myObserver.disconnect();
    };
  }, []);

  let configColor :any = {
    // #83b5fe
    barCornerRadius: 3,
    barProgressColor : "#79c780",
    barProgressSelectedColor : "#5b9460",
    barBackgroundColor : "#8ee997",
    barBackgroundSelectedColor : "#6aaf71",
    projectProgressColor : "#709ad8",
    projectProgressSelectedColor : "#5474a2",
    projectBackgroundColor : "#83b5fe",
    projectBackgroundSelectedColor : "#6288be",
    milestoneBackgroundColor : "#83b5fe",
    milestoneBackgroundSelectedColor : "#6288be",
  }
  // const ItemGanttContent : React.FC = ({task,rowHeight}: any) => {
  //   return <>
  //   <div>{task?.name}</div>
  //   </>
  // }
  return (
    <div className="Wrapper">
      <ViewSwitcher
        onViewModeChange={viewMode => setView(viewMode)}
        onViewListChange={setIsChecked}
        isChecked={isChecked}
      />
      {/*<AppTest></AppTest>*/}
      {/*<AppTest2></AppTest2>*/}


      <h3>Gantt With Limited Height</h3>
      <div
        id={"h-editor"}
        style={{
          maxHeight: "calc(100vh - 140px)",
        }}
      >

        <Gantt
          {...configColor}
          tasks={tasks}
          viewMode={view}
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
          // ItemGanttContent={ItemGanttContent}
        />
      </div>

    </div>
  );
};

export default App;
