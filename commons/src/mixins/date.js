import moment from 'moment';

export const date = {
  filters: {
    momentify (val, format) {
      return moment(val).format(format);
    } 
  }
}