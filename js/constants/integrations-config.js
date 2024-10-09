export const INTEGRATIONS_CONFIG = [
  {
    status: 'RUNNING',
    color: 'green',
    operations: ['stop', 'restart']
  },
  {
    status: 'STOPPED',
    color: 'red',
    operations: ['start']
  },
  {
    status: 'NEW',
    color: 'blue',
    operations: ['start']
  }
]
