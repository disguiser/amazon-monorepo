export function JSONParse(str: string | null) {
  if (str === null) {
    return null;
  } else {
    return JSON.parse(str);
  }
}

const title = '周氏ERP';

export default function getPageTitle(pageTitle: string) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`;
  }
  return `${title}`;
}

/**
 * Upper case first char
 * @param {String} str
 */
export function uppercaseFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

import dayjs from 'dayjs';
export function parseTime(time: string | Date) {
  return dayjs(time).format('YYYY-MM-DD HH:mm');
}

export const week = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
function generateXAxisData() {
  const day = new Date().getDay();
  let xAxisData = week
    .slice(day + 1)
    .concat(week.slice(0, day + 1))
    .reverse();

  xAxisData = xAxisData.map((d: string, index: number) => {
    return `${d}(${dayjs().subtract(index, 'day').format('D')})`;
  });
  return xAxisData.reverse();
}
export function initBarOption() {
  const option: any = {
    tooltip: {},
    xAxis: {
      data: generateXAxisData(),
    },
    yAxis: {},
    series: [
      {
        type: 'bar',
        data: null,
      },
    ],
  };
  return option;
}

export function initStackOption() {
  const option: any = {
    tooltip: {},
    xAxis: {
      data: generateXAxisData(),
    },
    yAxis: {},
    series: [
      {
        type: 'bar',
        stack: 'total',
        data: null,
      },
    ],
  };
  return option;
}
