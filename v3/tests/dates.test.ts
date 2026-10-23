import { describe, expect, it } from 'vitest';
import { addCalendarDuration, completedAge, dueWindow, isLeapYear, parseCalendarDate as day, parsePartialDate as partial, scheduleStatus, temporalRelation, toDateInterval, validateHistoricalDate } from '../src/model/dates';

describe('calendar without clock or timezone', () => {
  it.each(['2024', '2024-07', '2024-07-18'])('accepts explicit precision %s', text => expect(partial(text).precision).toBe(({4:'year',7:'month',10:'day'} as Record<number,string>)[text.length]));
  it('expands years to an interval, without inventing a date', () => expect(toDateInterval(partial('2024'))).toEqual({minDate:day('2024-01-01'),maxDate:day('2024-12-31')}));
  it('expands a leap month', () => expect(toDateInterval(partial('2024-02')).maxDate).toEqual(day('2024-02-29')));
  it.each(['2023-02-29','1900-02-29','2024-04-31','0000','2024-13','2024-7','2024-01-01T00:00Z','2024-01-01-02'])('rejects invalid %s', text => expect(() => partial(text)).toThrow());
  it('recognizes century leap years', () => {expect(isLeapYear(2000)).toBe(true);expect(isLeapYear(1900)).toBe(false);});
  it('requires complete asOf', () => expect(() => day('2024')).toThrow());
  it('clamps leap anniversaries', () => expect(addCalendarDuration(day('2024-02-29'),{unit:'years',amount:1})).toEqual(day('2025-02-28')));
  it('clamps month ends across years', () => expect(addCalendarDuration(day('2023-12-31'),{unit:'months',amount:2})).toEqual(day('2024-02-29')));
  it('rejects overflow', () => expect(() => addCalendarDuration(day('9999-12-31'),{unit:'months',amount:1})).toThrow());
  it.each([['2025-07-17','Current'],['2025-07-18','Due'],['2025-07-19','Due']] as const)('anniversary boundary %s -> %s', (asOf,status) => expect(scheduleStatus(dueWindow(partial('2024-07-18'),{unit:'years',amount:1}),day(asOf))).toBe(status));
  it.each([['2024-12-31','Current'],['2025-06-01','Indeterminate'],['2025-12-31','Due']] as const)('partial date %s -> %s', (asOf,status) => expect(scheduleStatus(dueWindow(partial('2024'),{unit:'years',amount:1}),day(asOf))).toBe(status));
  it('rejects future and possibly future history', () => {expect(validateHistoricalDate(partial('2027'),day('2026-10-23'))).toContain('future_date');expect(validateHistoricalDate(partial('2026'),day('2026-10-23'))).toContain('possibly_future_date');});
  it('detects definite and possible pre-birth events', () => {expect(validateHistoricalDate(partial('2000'),day('2026-10-23'),partial('2001'))).toContain('before_birth');expect(validateHistoricalDate(partial('2001'),day('2026-10-23'),partial('2001-07'))).toContain('possibly_before_birth');});
  it.each([['2024-01-01','2024-01-02','before'],['2024-01-02','2024-01-01','after'],['2024-01-01','2024-01-01','same_day'],['2024','2024-07','overlap']] as const)('orders %s / %s conservatively', (a,b,r) => expect(temporalRelation(partial(a),partial(b))).toBe(r));
  it('calculates completed ages at the birthday', () => {expect(completedAge(day('2000-10-24'),day('2026-10-23'))).toBe(25);expect(completedAge(day('2000-10-23'),day('2026-10-23'))).toBe(26);});
  it('runs Gregorian round trips for every month over a century', () => {
    for(let year=1990;year<=2090;year++) for(let month=1;month<=12;month++) {
      const d={year,month,day:1}; expect(addCalendarDuration(d,{unit:'months',amount:12})).toEqual({...d,year:year+1});
    }
  });
});
