export const int_from_dayjs_time = (dayjsObjt) => {
  if (!dayjsObjt?.isValid?.()) {
    throw new Error("[dayjs to number failure]: Invalid dayjs object given");
  }
  return dayjsObjt.isToday()
    ? dayjsObjt.hour() + (dayjsObjt.minute() * 100) / (60 * 100)
    : dayjsObjt.hour() + (dayjsObjt.minute() * 100) / (60 * 100) + 24;
};

export const vector = (start, end) => {
  try {
    return {
      start: typeof start == "number" ? start : int_from_dayjs_time(start),
      end: typeof end == "number" ? end : int_from_dayjs_time(end),
    };
  } catch (error) {
    throw new Error("[vector creating failure]: Invalid dayjs object given");
  }
};

export const norm = (v) => {
  if (v?.hasOwnProperty("start") && v?.hasOwnProperty("end")) {
    return v.end - v.start;
  }
  throw new Error("[norm creation failure]: Invalid given vector");
};
export const isSameDirection = (vector1, vector2) => {
  try {
    const d1 = norm(vector1);
    const d2 = norm(vector2);

    return d1 !== 0 ? (d2 !== 0 ? d1 * d2 >= 0 : d1 >= 0) : d2 != 0;
  } catch (error) {
    throw new Error("[isSameDirection failure]: got wrong arguments type");
  }
};

export const is_perfect = (range1, range2) => {
  try {
    return (
      norm(vector(range1.start, range2.start)) === 0 &&
      norm(vector(range1.end, range2.end)) === 0
    );
  } catch (error) {
    throw new Error("[is_prefect failure]: given wrong argument");
  }
};

/* is range1 inside range2 */
export const is_inside = (range1, range2) => {
  try {
    if (
      !isSameDirection(
        vector(range1.start, range2.start),
        vector(range1.end, range2.end)
      )
    ) {
      return (
        norm(vector(range1.start, range2.start)) <= 0 &&
        norm(vector(range1.end, range2.end)) >= 0
      );
    }
    return false;
  } catch (error) {
    throw new Error("[is_inside failure]: given wrong argument");
  }
};

export const is_overlaping_right = (range1, range2) => {
  try {
    return (
      isSameDirection(
        vector(range1.start, range2.start),
        vector(range1.end, range2.end)
      ) &&
      norm(vector(range1.start, range2.start)) >= 0 &&
      norm(vector(range1.end, range2.end)) >= 0
    );
  } catch (error) {
    throw new Error("[is_overlaping_right failure]: given wrong argument");
  }
};

export const is_overlaping_left = (range1, range2) => {
  try {
    return (
      isSameDirection(
        vector(range1.start, range2.start),
        vector(range1.end, range2.end)
      ) &&
      norm(vector(range1.start, range2.start)) <= 0 &&
      norm(vector(range1.end, range2.end)) <= 0
    );
  } catch (error) {
    throw new Error("[is_overlaping_left failure]: given wrong argument");
  }
};
