import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";

import {
  int_from_dayjs_time,
  isSameDirection,
  is_inside,
  is_overlaping_left,
  is_overlaping_right,
  is_perfect,
  norm,
  vector,
} from "./utils";

dayjs.extend(isToday);

describe("utils function tests", () => {
  describe("int_from_dayjs_time tests", () => {
    it("should return number fro from 'dayjs'm dayjs object", () => {
      const DAYJS_OBJECT = dayjs();
      const EXPECTED = DAYJS_OBJECT.isToday()
        ? DAYJS_OBJECT.hour() + (DAYJS_OBJECT.minute() * 100) / (60 * 100)
        : DAYJS_OBJECT.hour() + (DAYJS_OBJECT.minute() * 100) / (60 * 100) + 24;
      expect(int_from_dayjs_time(DAYJS_OBJECT)).toEqual(EXPECTED);
    });
    it("should add 24 to the output when the day is not today (expecte input will be only tomorrow)", () => {
      const DAYJS_OBJECT = dayjs().add(1, "day");
      const EXPECTED = DAYJS_OBJECT.isToday()
        ? DAYJS_OBJECT.hour() + (DAYJS_OBJECT.minute() * 100) / (60 * 100)
        : DAYJS_OBJECT.hour() + (DAYJS_OBJECT.minute() * 100) / (60 * 100) + 24;
      expect(int_from_dayjs_time(DAYJS_OBJECT)).toEqual(EXPECTED);
    });
    it("should throw an error if given invalid dayjs object", () => {
      expect(() => int_from_dayjs_time()).toThrow(
        new Error("[dayjs to number failure]: Invalid dayjs object given")
      );
    });
  });
  describe("vector tests", () => {
    it("should return vector object", () => {
      const START_DAYJS_OBJECT = dayjs();
      const END_DAYJS_OBJECT = dayjs().add(8, "hours");
      const EXPECTED = {
        start: int_from_dayjs_time(START_DAYJS_OBJECT),
        end: int_from_dayjs_time(END_DAYJS_OBJECT),
      };
      expect(vector(START_DAYJS_OBJECT, END_DAYJS_OBJECT)).toEqual(EXPECTED);
    });
    it("should return vector from given number", () => {
      expect(vector(1, 2)).toEqual(
        expect.objectContaining({ start: 1, end: 2 })
      );
    });
    it("should throw an error if given invalid arguments", () => {
      expect(() => vector()).toThrow(
        new Error("[vector creating failure]: Invalid dayjs object given")
      );
    });
  });
  describe("norm tests", () => {
    it("should return number", () => {
      const START_DAYJS_OBJECT = dayjs();
      const END_DAYJS_OBJECT = dayjs().add(8, "hours");
      const VECTOR = vector(START_DAYJS_OBJECT, END_DAYJS_OBJECT);
      const EXPECTED = VECTOR.end - VECTOR.start;
      expect(norm(VECTOR)).toEqual(EXPECTED);
    });
    it("should throw an error if given invalid arguments", () => {
      expect(() => norm()).toThrow(
        new Error("[norm creation failure]: Invalid given vector")
      );
    });
  });
  describe("isSameDirection tests", () => {
    it("should return true if 2 vector for negative sense", () => {
      const VECTOR_1 = vector(dayjs().add(7, "hour"), dayjs());
      const VECTOR_2 = vector(dayjs().add(3, "hour"), dayjs());

      expect(isSameDirection(VECTOR_1, VECTOR_2)).toEqual(true);
    });
    it("should return true if 2 vector for positive sense", () => {
      const VECTOR_1 = vector(dayjs(), dayjs().add(7, "hour"));
      const VECTOR_2 = vector(dayjs(), dayjs().add(3, "hour"));

      expect(isSameDirection(VECTOR_1, VECTOR_2)).toEqual(true);
    });
    it("should return false if 2 vector with different direction", () => {
      const VECTOR_1 = vector(dayjs(), dayjs().add(7, "hour"));
      const VECTOR_2 = vector(dayjs().add(3, "hour"), dayjs());

      expect(isSameDirection(VECTOR_1, VECTOR_2)).toEqual(false);
    });
    it("should throw an error if given invalid arguments", () => {
      expect(() => isSameDirection()).toThrow(
        new Error("[isSameDirection failure]: got wrong arguments type")
      );
    });
  });
  describe("is_perfect tests", () => {
    it("should return true only if 2 vector have 0 norm", () => {
      const VECTOR_1 = vector(dayjs(), dayjs());
      const VECTOR_2 = vector(dayjs(), dayjs());
      expect(is_perfect(VECTOR_1, VECTOR_2)).toEqual(true);
    });
    it("should return false if 2 vector have norms than 0", () => {
      const VECTOR_1 = vector(dayjs(), dayjs().add(1, "hour"));
      const VECTOR_2 = vector(dayjs(), dayjs());
      expect(is_perfect(VECTOR_1, VECTOR_2)).toEqual(false);
    });
  });
  it("should throw an error if given invalid arguments", () => {
    expect(() => is_perfect()).toThrow(
      new Error("[is_prefect failure]: given wrong argument")
    );
  });

  describe("is_inside tests", () => {
    it("should return true if range 1 inside range 2", () => {
      const RANGE_1 = vector(dayjs().add(3, "hour"), dayjs().add(4, "hour"));
      const RANGE_2 = vector(dayjs().add(1, "hour"), dayjs().add(5, "hour"));

      expect(is_inside(RANGE_1, RANGE_2)).toEqual(true);
    });
    it("should return false if range 1 outside range 2", () => {
      const RANGE_1 = vector(dayjs().add(2, "hour"), dayjs().add(3, "hour"));
      const RANGE_2 = vector(dayjs().add(4, "hour"), dayjs().add(5, "hour"));
      expect(is_inside(RANGE_1, RANGE_2)).toEqual(false);
    });
    it("should return false if range 1 overlap range 2", () => {
      const RANGE_1 = vector(dayjs().add(2, "hour"), dayjs().add(5, "hour"));
      const RANGE_2 = vector(dayjs().add(1, "hour"), dayjs().add(3, "hour"));
      const RANGE_3 = vector(dayjs().add(4, "hour"), dayjs().add(6, "hour"));

      expect(is_inside(RANGE_1, RANGE_2)).toEqual(false);
      expect(is_inside(RANGE_1, RANGE_3)).toEqual(false);
    });
  });
  it("should throw an error if given invalid arguments", () => {
    expect(() => is_inside()).toThrow(
      new Error("[is_inside failure]: given wrong argument")
    );
  });

  describe("is_overlaping_right tests", () => {
    it("should return right if overlaping right", () => {
      const RANGE_1 = vector(dayjs().add(2, "hour"), dayjs().add(5, "hour"));
      const RANGE_2 = vector(dayjs().add(4, "hour"), dayjs().add(6, "hour"));

      expect(is_overlaping_right(RANGE_1, RANGE_2)).toEqual(true);
    });
    it("should return right if not overlaping right", () => {
      const RANGE_1 = vector(dayjs().add(2, "hour"), dayjs().add(5, "hour"));
      const RANGE_2 = vector(dayjs().add(1, "hour"), dayjs().add(3, "hour"));
      const RANGE_3 = vector(dayjs().add(3, "hour"), dayjs().add(4, "hour"));

      expect(is_overlaping_right(RANGE_1, RANGE_2)).toEqual(false);
      expect(is_overlaping_right(RANGE_1, RANGE_2)).toEqual(false);
      expect(is_overlaping_right(RANGE_1, RANGE_3)).toEqual(false);
    });
    it("should throw an error if given invalid arguments", () => {
      expect(() => is_overlaping_right()).toThrow(
        new Error("[is_overlaping_right failure]: given wrong argument")
      );
    });
  });

  describe("is_overlaping_left tests", () => {
    it("should return right if overlaping right", () => {
      const RANGE_1 = vector(dayjs().add(4, "hour"), dayjs().add(6, "hour"));
      const RANGE_2 = vector(dayjs().add(2, "hour"), dayjs().add(5, "hour"));

      expect(is_overlaping_left(RANGE_1, RANGE_2)).toEqual(true);
    });
    it("should return right if not overlaping right", () => {
      const RANGE_1 = vector(dayjs().add(1, "hour"), dayjs().add(3, "hour"));
      const RANGE_2 = vector(dayjs().add(2, "hour"), dayjs().add(5, "hour"));
      const RANGE_3 = vector(dayjs().add(3, "hour"), dayjs().add(4, "hour"));

      expect(is_overlaping_left(RANGE_1, RANGE_2)).toEqual(false);
      expect(is_overlaping_left(RANGE_1, RANGE_2)).toEqual(false);
      expect(is_overlaping_left(RANGE_1, RANGE_3)).toEqual(false);
    });
    it("should throw an error if given invalid arguments", () => {
      expect(() => is_overlaping_left()).toThrow(
        new Error("[is_overlaping_left failure]: given wrong argument")
      );
    });
  });
});
