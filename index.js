import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";

import {
  isSameDirection,
  is_inside,
  is_overlaping_left,
  is_overlaping_right,
  is_perfect,
  norm,
  vector,
} from "./utils";

dayjs.extend(isToday);

const generate_time_from_date_string = (
  date_string,
  format = "YYYY-MM-DD HH:mm:ss"
) => {
  return dayjs(date_string, format).format("HH:mm:ss");
};

export const get_last_valid_punch_out_time = (punches) => {
  if (!Array.isArray(punches)) {
    console.log("please check params is array type");
    return null;
  }
  for (let punch of punches) {
    if (punch?.out?.date) {
      return generate_time_from_date_string(punch.out.date);
    }
  }
};

const abs = (i) => (i < 0 ? -i : i);

class ShiftSuggestor {
  constructor(punches = [], shifts = []) {
    this.punches = punches ?? [];
    this.shifts = shifts ?? [];
  }
  set_punches(punches) {
    this.punches = punches;
  }
  set_shifts(shifts) {
    this.shifts = shifts;
  }
  suggest() {
    if (!Array.isArray(this.punches) || this.punches.length === 0) {
      throw new Error("missing punches");
    }
    if (!Array.isArray(this.shifts) || this.shifts.length === 0) {
      throw new Error("missing shifts");
    }

    const shiftScores = [];
    let maxScore = 0;
    let maxScoreShift;

    for (const shift of this.shifts) {
      const shiftStartTime = dayjs(
        dayjs().format("YYYY-MM-DD") + " " + shift.start_hour
      );
      const shiftEndTime = dayjs(
        dayjs().format("YYYY-MM-DD") + " " + shift.end_hour
      ).isBefore(dayjs(dayjs().format("YYYY-MM-DD") + " " + shift.start_hour))
        ? dayjs(
            dayjs().add(1, "day").format("YYYY-MM-DD") + " " + shift.end_hour
          )
        : dayjs(dayjs().format("YYYY-MM-DD") + " " + shift.end_hour);

      const shiftRange = vector(shiftStartTime, shiftEndTime);

      let shiftScore = 0;

      for (const punch of this.punches) {
        const punchInTime = dayjs(
          dayjs().format("YYYY-MM-DD") + " " + punch?.in?.date
        );
        const punchOutTime = dayjs(
          dayjs().format("YYYY-MM-DD") + " " + punch?.out?.date
        );

        const punchRange = vector(punchInTime, punchOutTime);

        if (
          isSameDirection(
            vector(shiftStartTime, punchOutTime),
            vector(shiftEndTime, punchInTime)
          )
        ) {
          continue;
        }
        if (is_perfect(shiftRange, punchRange)) {
          shiftScore = norm(shiftRange);
          return shift;
        }

        if (is_inside(punchRange, shiftRange)) {
          shiftScore += abs(norm(shiftRange));
        } else {
          if (is_overlaping_right(punchRange, shiftRange)) {
            shiftScore += abs(norm(vector(shiftStartTime, punchOutTime)));
          } else if (is_overlaping_left(punchRange, shiftRange)) {
            shiftScore += abs(norm(vector(punchInTime, shiftEndTime)));
          }
        }
      }
      shiftScores.push({
        shift,
        score: norm(shiftRange) !== 0 ? shiftScore / norm(shiftRange) : -1,
      });
      if (shiftScore / norm(shiftRange) > maxScore) {
        maxScore = shiftScore / norm(shiftRange);
        maxScoreShift = shift;
      }
    }

    if (maxScore === 0) {
      return {
        custom_shift_name: "custom shift name",
        start_time: this.punches[0].in.date,
        end_time: get_last_valid_punch_out_time(this.punches),
      };
    }

    return maxScoreShift;
  }
}

export default ShiftSuggestor;
