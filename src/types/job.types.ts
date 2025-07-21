// Basic job types stub
export interface Job {
  id: string;
  description: string;
  [key: string]: any;
}

export interface Task {
  id: string;
  description: string;
  [key: string]: any;
}

export interface JobStatus {
  id: string;
  name: string;
  [key: string]: any;
}