export function createTimeSeries(data, grouping, startDate, endDate, granularity = 'day') {
  const series = []
  const groups = [...new Set(data.map((d) => d[grouping]))]

  // Build Time Series
  const start = new Date(startDate)
  const end = new Date(endDate)
  const timeSeries = [];
  while (start <= end) {
    let x;
    if (granularity === 'month') {
      x = start.toISOString().slice(0, 7); // YYYY-MM
      start.setMonth(start.getMonth() + 1);
    } else if (granularity === 'day') {
      x = start.toISOString().slice(0, 10); // YYYY-MM-DD
      start.setDate(start.getDate() + 1);
    } else if (granularity === 'hours') {
      x = start.toISOString().slice(0, 13); // YYYY-MM-DDTHH
      start.setHours(start.getHours() + 1);
    } else {
      throw new Error('Invalid granularity. Use \'month\', \'day\', or \'hours\'.');
    }
    timeSeries.push({ x, y: 0 });
  }

  // Grouping
  groups.forEach((group) => {
    const providerData = data.filter((d) => d[grouping] === group)
    series.push({
      name: group,
      data: [...timeSeries].map((ts) => {
        const intervalParts = ts.x.split('-').map((part) => parseInt(part))
        return {
          x: ts.x,
          y: providerData.reduce((sum, item) => {
            if (
              (granularity === 'year' && item.year === intervalParts[0]) ||
              (granularity === 'month' && item.year === intervalParts[0] && item.month === intervalParts[1]) ||
              (granularity === 'day' && item.year === intervalParts[0] && item.month === intervalParts[1] && item.day === intervalParts[2]) ||
              (granularity === 'hour' && item.year === intervalParts[0] && item.month === intervalParts[1] && item.day === intervalParts[2] && item.hour === intervalParts[3])
            ) {
              sum += item.count;
            }
            return sum;
          }, 0)
        }
      })
    })
  })

  return series
}
