import { BarTask } from "../types/bar-task";
import { Task } from "../types/public-types";

export function isKeyboardEvent(
  event: React.MouseEvent | React.KeyboardEvent | React.FocusEvent
): event is React.KeyboardEvent {
  return (event as React.KeyboardEvent).key !== undefined;
}

export function isMouseEvent(
  event: React.MouseEvent | React.KeyboardEvent | React.FocusEvent
): event is React.MouseEvent {
  return (event as React.MouseEvent).clientX !== undefined;
}

export function isBarTask(task: Task | BarTask): task is BarTask {
  return (task as BarTask).x1 !== undefined;
}

export function removeHiddenTasks(tasks: Task[]) {
  const groupedTasks = tasks.filter(
    t => t.hideChildren && ["project","schedules"].includes(t.type)
  );
  if (groupedTasks.length > 0) {
    for (let i = 0; groupedTasks.length > i; i++) {
      const groupedTask = groupedTasks[i];
      const children = getChildren(tasks, groupedTask);
      tasks = tasks.filter(t => children.indexOf(t) === -1);
    }
  }
  return tasks;
}

export function getChildren(taskList: Task[], task: Task) {
  let tasks: Task[] = [];
  if (!["project","schedules"].includes(task.type)) {
    tasks = taskList.filter(
      t => t.dependencies && t.dependencies.indexOf(task.id) !== -1
    );
  } else {
    tasks = taskList.filter(t => t.project && t.project === task.id);
  }
  var taskChildren: Task[] = [];
  tasks.forEach(t => {
    taskChildren.push(...getChildren(taskList, t));
  })
  tasks = tasks.concat(tasks, taskChildren);
  return tasks;
}

export const sortTasks = (taskA: Task, taskB: Task) => {
  const orderA = taskA.displayOrder || Number.MAX_VALUE;
  const orderB = taskB.displayOrder || Number.MAX_VALUE;
  if (orderA > orderB) {
    return 1;
  } else if (orderA < orderB) {
    return -1;
  } else {
    return 0;
  }
};

export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function(...args: Parameters<T>): void {
    clearTimeout(timeoutId);
    // @ts-ignore
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

interface DataPoint {
  year: string;
  value: number;
  count: number;
}

interface SvgSize {
  width: number;
  height: number;
  marginX: number;
  marginY: number;
}
export function getLine(elementSvg:any, svgSize: SvgSize) {
  if (!elementSvg) return
  const data : any = [
    { year: '1991', value: 3, count: 10 },
    { year: '1992', value: 4, count: 4 },
    { year: '1993', value: 3.5, count: 5 },
    { year: '1994', value: 5, count: 5 },
    { year: '1995', value: 4.9, count: 4.9 },
    { year: '1996', value: 6, count: 35 },
    { year: '1997', value: 7, count: 7 },
    { year: '1998', value: 9, count: 1 },
    { year: '1999', value: 13, count: 20 },
  ];

  const svgWidth : number = svgSize?.width|| 600;
  const svgHeight: number = svgSize?.height || 400;
  const marginX: number = svgSize?.marginX || 50;
  const marginY: number = svgSize?.marginY || 50;

  const maxValue = Math.max(...data.map((d:any) => Math.max(d.value, d.count)));
  const xScale = (svgWidth - 2 * marginX) / (data.length - 1);
  const yScale = (svgHeight - 2 * marginY) / maxValue;

  const createSmoothPath = (
    dataPoints: DataPoint[],
    accessor: (point: DataPoint) => number
  ): string => {
    return dataPoints
      .map((point, index, array) => {
        const x = marginX + index * xScale;
        const y = svgHeight - marginY - accessor(point) * yScale;

        if (index === 0) {
          return `M${x},${y}`;
        } else {
          const prevX = marginX + (index - 1) * xScale;
          const prevY = svgHeight - marginY - accessor(array[index - 1]) * yScale;

          const midX = (prevX + x) / 2;
          const midY = (prevY + y) / 2;

          return `Q${prevX},${prevY} ${midX},${midY}`;
        }
      })
      .join(' ');
  };

  const svg = elementSvg;

  const drawPath = (d: string, color: string) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', color);
    path.setAttribute('fill', 'transparent');
    svg.appendChild(path);
  };

  drawPath(createSmoothPath(data, (d) => d.value), 'blue');
  drawPath(createSmoothPath(data, (d) => d.count), 'red');

  // const drawAxis = (x1: number, y1: number, x2: number, y2: number) => {
  //   const axis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  //   axis.setAttribute('x1', x1.toString());
  //   axis.setAttribute('y1', y1.toString());
  //   axis.setAttribute('x2', x2.toString());
  //   axis.setAttribute('y2', y2.toString());
  //   axis.setAttribute('stroke', 'black');
  //   svg.appendChild(axis);
  // };
  //
  // drawAxis(marginX, svgHeight - marginY, svgWidth - marginX, svgHeight - marginY);
  // drawAxis(marginX, marginY, marginX, svgHeight - marginY);
}
