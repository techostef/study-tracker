type IFormatDate = 'yyyy-MM-dd' | 'dd-MM-yyyy' | 'MM-dd-yyyy';

export const getYesterday = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return yesterday;
}

export const getCurrentDate = () => {
  const today = new Date();
  return today;
}

export const formatDateToString = (date: Date, format: IFormatDate) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  switch(format) {
    case 'dd-MM-yyyy':
      return `${day}-${month}-${year}`;
    case 'MM-dd-yyyy':
      return `${month}-${day}-${year}`;
    default:
      return `${year}-${month}-${day}`;
  }
}