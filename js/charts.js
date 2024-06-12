import { logAnalyticsQuery } from './api-client'
import { DefaultAzureCredential, InteractiveBrowserCredential } from '@azure/identity'
import { LogsQueryClient } from '@azure/monitor-query'

export const charts = {
  async init() {
    console.log('charts module') // TODO(gb): remove trace

    const clientId = '44cdc4e5-a089-4a08-a6f7-0cc3a819b02f'
    const workspaceId = '0525d1d4-4009-4fcb-9b36-0d5cb86e6d3f'
    const credential = new InteractiveBrowserCredential({
      clientId
    })
    const client = new LogsQueryClient(credential)


    const query = 'ContainerLog\n' +
      '| where LogEntry contains "ApiInterceptor"\n' +
      '| parse LogEntry with * "3m[" Provider "ApiInterceptor]" *\n' +
      '| project TimeGenerated, Provider, LogEntry\n' +
      '| summarize count() by Provider, bin(TimeGenerated, 10m)'
    const timespan = 'P1D'

    try {
      const result = await client.queryWorkspace(workspaceId, query, { duration: timespan });

      if (result.status === 'Success') {
        result.tables.forEach(table => {
          console.log(`Table: ${table.name}`);
          table.rows.forEach(row => {
            console.log(row);
          });
        });
      } else {
        console.error('Query failed with status:', result.status);
      }
    } catch (error) {
      console.error('Error querying Log Analytics:', error);
    }
  }
}
