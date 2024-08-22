import { Task } from "../../dist/types/public-types";

export function AddNewData(taskLength:number) : any {
  const currentDate = new Date();
  let newTask = [];
  for (let i = 0; i < 5000; i++) {
    newTask.push({
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
      name: `Task ${taskLength + i + Math.random()}`,
      id: `Task ${taskLength + i + Math.random()}`,
      progress: 0,
      // isDisabled: true,
      type: "task",
      project: "ProjectSample",
    });
  }
  return newTask;
}

export function initTasks() {
  let tasks: any[] = [
    {
      name: "01. Chuẩn bị dự án",
      start: new Date("2024-08-11T17:00:00.000Z"),
      end: new Date("2024-08-15T17:00:00.000Z"),
      id: "36b73c71-6e2f-46b0-8d88-80957e616462",
      type: "project",
      hideChildren: false,
      progress: 30
    },
    {
      name: "Thành lập tổ dự án",
      start: new Date("2024-08-11T17:00:00.000Z"),
      end: new Date("2024-08-15T17:00:00.000Z"),
      id: "65477f52-754b-4802-a501-27f3c20d044f",
      type: "project",
      hideChildren: false,
      progress: 0,
      project: "36b73c71-6e2f-46b0-8d88-80957e616462"
    },
    {
      name: "Xin quyết định schedules",
      start: new Date("2024-08-15T17:00:00.000Z"),
      end: new Date("2024-08-23T17:00:00.000Z"),
      id: "88407d7b-3f01-4b52-bc8f-6acf32002dfe",
      type: "schedules",
      hideChildren: true,
      progress: 0,
      project: "65477f52-754b-4802-a501-27f3c20d044f"
    },
    {
      name: "Xin quyết định 2",
      start: new Date("2024-08-15T17:00:00.000Z"),
      end: new Date("2024-08-18T17:00:00.000Z"),
      id: "88407d7b-3f01-4b52-bc8f-6acf32002df2",
      type: "task",
      progress: 0,
      project: "88407d7b-3f01-4b52-bc8f-6acf32002dfe"
    },
    {
      name: "Xin quyết định 3",
      start: new Date("2024-08-19T17:00:00.000Z"),
      end: new Date("2024-08-21T17:00:00.000Z"),
      id: "88407d7b-3f01-4b52-bc8f-6acf32002df3",
      type: "task",
      progress: 0,
      project: "88407d7b-3f01-4b52-bc8f-6acf32002dfe"
    },
    {
      name: "Xin quyết định 4",
      start: new Date("2024-08-22T17:00:00.000Z"),
      end: new Date("2024-08-23T17:00:00.000Z"),
      id: "88407d7b-3f01-4b52-bc8f-6acf32002df4",
      type: "task",
      progress: 0,
      project: "88407d7b-3f01-4b52-bc8f-6acf32002dfe"
    },
    {
      name: "Xin quyết định",
      start: new Date("2024-08-11T17:00:00.000Z"),
      end: new Date("2024-08-13T17:00:00.000Z"),
      id: "88407d7b-3f01-4b52-bc8f-6acf32002df0",
      type: "task",
      hideChildren: true,
      progress: 0,
      project: "65477f52-754b-4802-a501-27f3c20d044f"
    },
    {
      name: "Họp tổ dự án",
      start: new Date("2024-08-13T17:00:00.000Z"),
      end: new Date("2024-08-15T17:00:00.000Z"),
      id: "2ea8d626-c9ff-4edb-b04c-d2b12d7b12bf",
      type: "task",
      progress: 0,
      project: "65477f52-754b-4802-a501-27f3c20d044f",
      dependencies: [
        "88407d7b-3f01-4b52-bc8f-6acf32002df0"
      ]
    },
    {
      name: "Lập Tờ trình dự án",
      start: new Date("2024-08-11T17:00:00.000Z"),
      end: new Date("2024-08-15T17:00:00.000Z"),
      id: "5f6c6943-c835-4b06-85e6-b1e2ad2fe7b1",
      type: "project",
      hideChildren: false,
      progress: 0,
      project: "36b73c71-6e2f-46b0-8d88-80957e616462"
    },
    {
      name: "Launch SaaS Product",
      start: new Date("2024-08-11T17:00:00.000Z"),
      end: new Date("2024-10-14T17:00:00.000Z"),
      id: "e35634e0-250f-4601-98d9-21a5c5140868",
      type: "project",
      hideChildren: false,
      progress: 34
    },
    {
      name: "Setup web server",
      start: new Date("2024-08-11T17:00:00.000Z"),
      end: new Date("2024-08-19T17:00:00.000Z"),
      id: "a262ca98-9a32-44a6-94d8-9e123b33d5be",
      type: "project",
      hideChildren: false,
      progress: 42,
      project: "e35634e0-250f-4601-98d9-21a5c5140868"
    },
    {
      name: "Install Apache",
      start: new Date("2024-08-11T17:00:00.000Z"),
      end: new Date("2024-08-13T17:00:00.000Z"),
      id: "dc44a452-f1e6-456e-8cd7-17467e8e7ffd",
      type: "task",
      progress: 50,
      project: "a262ca98-9a32-44a6-94d8-9e123b33d5be"
    },
    {
      name: "Configure firewall",
      start: new Date("2024-08-11T17:00:00.000Z"),
      end: new Date("2024-08-13T17:00:00.000Z"),
      id: "b61a1bc0-8246-4a82-9402-f2c0e0a77bb5",
      type: "task",
      progress: 50,
      project: "a262ca98-9a32-44a6-94d8-9e123b33d5be"
    },
    {
      name: "Setup load balancer",
      start: new Date("2024-08-11T17:00:00.000Z"),
      end: new Date("2024-08-13T17:00:00.000Z"),
      id: "cc5d902a-0c95-408f-a606-684c4c98bf9d",
      type: "task",
      progress: 50,
      project: "a262ca98-9a32-44a6-94d8-9e123b33d5be"
    },
    {
      name: "Configure ports",
      start: new Date("2024-08-11T17:00:00.000Z"),
      end: new Date("2024-08-12T17:00:00.000Z"),
      id: "e66496f3-3ec1-4922-9f41-3de5248d9571",
      type: "task",
      progress: 50,
      project: "a262ca98-9a32-44a6-94d8-9e123b33d5be"
    },
    {
      name: "Run tests",
      start: new Date("2024-08-14T17:00:00.000Z"),
      end: new Date("2024-08-19T17:00:00.000Z"),
      id: "db7f4fbe-3b5b-4096-84c5-0942d071dddd",
      type: "task",
      progress: 0,
      project: "a262ca98-9a32-44a6-94d8-9e123b33d5be",
      dependencies: [
        "cc5d902a-0c95-408f-a606-684c4c98bf9d",
        "dc44a452-f1e6-456e-8cd7-17467e8e7ffd",
        "e66496f3-3ec1-4922-9f41-3de5248d9571",
        "b61a1bc0-8246-4a82-9402-f2c0e0a77bb5"
      ]
    },
    {
      name: "Website Design",
      start: new Date("2024-08-19T17:00:00.000Z"),
      end: new Date("2024-09-09T17:00:00.000Z"),
      id: "f119ea8c-74f8-4c80-ac74-458aa9575faa",
      type: "project",
      hideChildren: false,
      progress: 38,
      project: "e35634e0-250f-4601-98d9-21a5c5140868"
    },
    {
      name: "Contact designers",
      start: new Date("2024-08-19T17:00:00.000Z"),
      end: new Date("2024-08-25T17:00:00.000Z"),
      id: "167b3be5-73d2-453f-95cc-1833bce17876",
      type: "task",
      progress: 70,
      project: "f119ea8c-74f8-4c80-ac74-458aa9575faa",
      dependencies: [
        "db7f4fbe-3b5b-4096-84c5-0942d071dddd"
      ]
    },
    {
      name: "Create shortlist of three designers",
      start: new Date("2024-08-25T17:00:00.000Z"),
      end: new Date("2024-08-26T17:00:00.000Z"),
      id: "8b93c477-f3a2-4f01-8c4a-f76277691f87",
      type: "task",
      progress: 60,
      project: "f119ea8c-74f8-4c80-ac74-458aa9575faa",
      dependencies: [
        "167b3be5-73d2-453f-95cc-1833bce17876"
      ]
    },

  ]
  return tasks;
}
export function initTasks2() {
  let tasks: any[] = [
    {
      name: "01. Chuẩn bị dự án",
      start: new Date("2024-08-11T17:00:00.000Z"),
      end: new Date("2024-08-15T17:00:00.000Z"),
      id: "36b73c71-6e2f-46b0-8d88-80957e616462",
      type: "task",
      hideChildren: false,
      progress: 30
    },
    {
      name: "Thành lập tổ dự án",
      start: new Date("2024-08-11T17:00:00.000Z"),
      end: new Date("2024-08-15T17:00:00.000Z"),
      id: "65477f52-754b-4802-a501-27f3c20d044f",
      type: "task",
      hideChildren: false,
      progress: 0,
    },
    {
      name: "Xin quyết định",
      start: new Date("2024-08-11T17:00:00.000Z"),
      end: new Date("2024-08-13T17:00:00.000Z"),
      id: "88407d7b-3f01-4b52-bc8f-6acf32002dfe",
      type: "task",
      progress: 0,
    },
    {
      name: "Họp tổ dự án",
      start: new Date("2024-08-13T17:00:00.000Z"),
      end: new Date("2024-08-15T17:00:00.000Z"),
      id: "2ea8d626-c9ff-4edb-b04c-d2b12d7b12bf",
      type: "task",
      progress: 0,
    },
    {
      name: "Họp tổ dự án2",
      start: new Date("2024-08-13T17:00:00.000Z"),
      end: new Date("2024-08-15T17:00:00.000Z"),
      id: "2ea8d626-c9ff-4edb-b04c-d2b12d7b12dd",
      type: "task",
      progress: 0,
    },

  ]
  return tasks;
}

export function getStartEndDateForProject(tasks: Task[], projectId: string) {
  const projectTasks = tasks.filter(t => t.project === projectId);
  let start = projectTasks[0].start;
  let end = projectTasks[0].end;

  for (let i = 0; i < projectTasks.length; i++) {
    const task = projectTasks[i];
    if (start.getTime() > task.start.getTime()) {
      start = task.start;
    }
    if (end.getTime() < task.end.getTime()) {
      end = task.end;
    }
  }
  return [start, end];
}

export function getLine() {
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

  const svgWidth : number = 600;
  const svgHeight: number = 400;
  const margin: number = 50;

  const maxValue: number = Math.max(...data.map((d:any) => Math.max(d.value, d.count)));
  const xScale: number = (svgWidth - 2 * margin) / (data.length - 1);
  const yScale: number = (svgHeight - 2 * margin) / maxValue;

  // function createPath(dataPoints:any, accessor: any) {
  //   return dataPoints.map((point:any, index:any) => {
  //     const x = margin + index * xScale;
  //     const y = svgHeight - margin - accessor(point) * yScale;
  //     const command = index === 0 ? 'M' : 'L';
  //     return `${command}${x},${y}`;
  //   }).join(' ');
  // }

  function createSmoothPath(dataPoints:any, accessor:any) {
    return dataPoints.map((point:any, index:any, array:any) => {
      const x = margin + index * xScale;
      const y = svgHeight - margin - accessor(point) * yScale;

      if (index === 0) {
        return `M${x},${y}`;
      } else {
        const prevX = margin + (index - 1) * xScale;
        const prevY = svgHeight - margin - accessor(array[index - 1]) * yScale;

        const midX = (prevX + x) / 2;
        const midY = (prevY + y) / 2;

        return `Q${prevX},${prevY} ${midX},${midY}`;
      }
    }).join(' ');
  }

  const svg: any = document.getElementById('chart');

  // Vẽ đường cho giá trị "value"
  const valuePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  valuePath.setAttribute('d', createSmoothPath(data, (d:any) => d.value));
  valuePath.setAttribute('stroke', 'blue');
  valuePath.setAttribute('fill', 'transparent');
  svg.appendChild(valuePath);

  // Vẽ đường cho giá trị "count"
  const countPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  countPath.setAttribute('d', createSmoothPath(data, (d:any) => d.count));
  countPath.setAttribute('stroke', 'red');
  countPath.setAttribute('fill', 'transparent');
  svg.appendChild(countPath);

  // Vẽ các trục
  const axisX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  axisX.setAttribute('x1', String(margin));
  axisX.setAttribute('y1', String(svgHeight - margin));
  axisX.setAttribute('x2', String(svgWidth - margin));
  axisX.setAttribute('y2', String(svgHeight - margin));
  axisX.setAttribute('stroke', 'black');
  // svg.appendChild(axisX);

  const axisY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  axisY.setAttribute('x1', String(margin));
  axisY.setAttribute('y1', String(margin));
  axisY.setAttribute('x2', String(margin));
  axisY.setAttribute('y2', String(svgHeight - margin));
  axisY.setAttribute('stroke', 'black');
  // svg.appendChild(axisY);
}
