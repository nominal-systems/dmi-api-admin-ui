export const INTEGRATIONS_CONFIG = [
  {
    status: 'RUNNING',
    color: 'green',
    operations: ['test', 'stop', 'restart']
  },
  {
    status: 'STOPPED',
    color: 'red',
    operations: ['test', 'start']
  },
  {
    status: 'NEW',
    color: 'blue',
    operations: ['test', 'start']
  }
]
