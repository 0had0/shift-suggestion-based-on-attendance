import ShiftSuggestor, { get_last_valid_punch_out_time } from "./index";

describe("shift sugession algo based on punches (attendence)", () => {
  let ShiftSuggestorInstance;

  beforeEach(() => {
    ShiftSuggestorInstance = new ShiftSuggestor();
  });

  it("should intiate an instance with empty shift & punches", () => {
    expect(ShiftSuggestorInstance.punches).toEqual(expect.arrayContaining([]));
    expect(ShiftSuggestorInstance.shifts).toEqual(expect.arrayContaining([]));
  });
  it("should set punches", () => {
    const EXPECTED = [
      { in: { date: "" }, out: { date: "" } },
      { in: { date: "" }, out: { date: "" } },
    ];
    ShiftSuggestorInstance.set_punches(EXPECTED);
    expect(ShiftSuggestorInstance.punches).toEqual(
      expect.arrayContaining(EXPECTED)
    );
    expect(ShiftSuggestorInstance.shifts).toEqual(expect.arrayContaining([]));
  });
  it("should set shifts", () => {
    const EXPECTED = [
      { id: -1, start_hour: "", end_hour: "" },
      { id: -1, start_hour: "", end_hour: "" },
    ];
    ShiftSuggestorInstance.set_shifts(EXPECTED);
    expect(ShiftSuggestorInstance.shifts).toEqual(
      expect.arrayContaining(EXPECTED)
    );
  });
  it("should throw an error if no punches", () => {
    const EXPECTED = [
      { id: -1, start_hour: "", end_hour: "" },
      { id: -1, start_hour: "", end_hour: "" },
    ];
    ShiftSuggestorInstance.set_shifts(EXPECTED);
    expect(() => ShiftSuggestorInstance.suggest()).toThrow(
      new Error("missing punches")
    );
  });
  it("should throw an error if no shifts", () => {
    const EXPECTED = [
      { in: { date: "" }, out: { date: "" } },
      { in: { date: "" }, out: { date: "" } },
    ];
    ShiftSuggestorInstance.set_punches(EXPECTED);
    expect(() => ShiftSuggestorInstance.suggest()).toThrow(
      new Error("missing shifts")
    );
  });
  it("should return first punch in time & last punch out time if no overlaping shifts and punches", () => {
    const PUNCHES = [
      { in: { date: "08:00:00" }, out: { date: "11:00:00" } },
      { in: { date: "12:00:00" }, out: { date: "14:00:00" } },
    ];
    ShiftSuggestorInstance.set_punches(PUNCHES);
    const SHIFTS = [
      { id: -1, start_hour: "01:00:00", end_hour: "07:00:00" },
      { id: -1, start_hour: "21:00:00", end_hour: "22:00:00" },
    ];
    ShiftSuggestorInstance.set_shifts(SHIFTS);
    expect(ShiftSuggestorInstance.suggest()).toEqual({
      custom_shift_name: "custom shift name",
      start_time: PUNCHES[0].in.date,
      end_time: get_last_valid_punch_out_time(PUNCHES),
    });
  });

  it("should return the first perfect punch covered shift if available", () => {
    const PUNCHES = [
      { in: { date: "06:00:00" }, out: { date: "07:30:00" } },
      { in: { date: "08:00:00" }, out: { date: "11:00:00" } },
      { in: { date: "12:00:00" }, out: { date: "14:00:00" } },
    ];
    ShiftSuggestorInstance.set_punches(PUNCHES);
    const SHIFTS = [
      { id: -1, start_hour: "08:00:00", end_hour: "11:00:00" },
      { id: -1, start_hour: "12:00:00", end_hour: "14:00:00" },
    ];
    ShiftSuggestorInstance.set_shifts(SHIFTS);
    expect(ShiftSuggestorInstance.suggest()).toEqual(SHIFTS[0]);
  });

  it("should return the most perfect punch covered shift if available", () => {
    const PUNCHES = [
      { in: { date: "02:00:00" }, out: { date: "07:30:00" } },
      { in: { date: "08:00:00" }, out: { date: "10:00:00" } },
      { in: { date: "12:00:00" }, out: { date: "17:00:00" } },
    ];
    ShiftSuggestorInstance.set_punches(PUNCHES);
    const SHIFTS = [
      { id: -1, start_hour: "07:00:00", end_hour: "14:30:00" },
      { id: -1, start_hour: "15:00:00", end_hour: "18:00:00" },
    ];
    ShiftSuggestorInstance.set_shifts(SHIFTS);
    expect(ShiftSuggestorInstance.suggest()).toEqual(SHIFTS[0]);
  });

  describe("test", () => {
    let ShiftSuggestorInstance = new ShiftSuggestor();
    const PUNCHES = [
      {
        in: {
          id: 1765,
          account_id: 553,
          branch_id: 27,
          manager_id: 548,
          manager_name: "Albert Einstein",
          date: "09:00:00",
          location: "Cedars Beirut",
          note: null,
          manager_note: null,
          is_valid: 1,
          distance: 0,
          is_original: true,
        },
        out: {
          id: 1851,
          account_id: 553,
          branch_id: 27,
          manager_id: 548,
          manager_name: "Albert Einstein",
          date: "15:00:00",
          location: "Cedars Beirut",
          note: null,
          manager_note: null,
          is_valid: 1,
          distance: 0,
          is_original: true,
        },
      },
      {
        in: {
          id: 1764,
          account_id: 553,
          branch_id: 27,
          manager_id: 548,
          manager_name: "Albert Einstein",
          date: "16:00:00",
          location: "Cedars Beirut",
          note: null,
          manager_note: null,
          is_valid: 1,
          distance: -2,
          is_original: false,
        },
        out: {
          id: 1731,
          account_id: 553,
          branch_id: 27,
          manager_id: 548,
          manager_name: "Albert Einstein",
          date: "20:00:17",
          location: "Cedars Beirut",
          note: null,
          manager_note: null,
          is_valid: 1,
          distance: 0,
          is_original: false,
        },
      },
    ];

    const SHIFTS = [
      {
        id: 2541,
        name: "OFF",
        weekday: 2,
        start_hour: "01:00:00",
        end_hour: "01:00:00",
        role_requirements: [
          { role_id: 4, num: 0 },
          { role_id: 5, num: 0 },
        ],
      },
      {
        id: 2555,
        name: "AM",
        weekday: 2,
        start_hour: "09:00:00",
        end_hour: "15:00:00",
        role_requirements: [
          { role_id: 4, num: 1 },
          { role_id: 5, num: 2 },
        ],
      },
      {
        id: 2562,
        name: "PM",
        weekday: 2,
        start_hour: "15:00:00",
        end_hour: "23:00:00",
        role_requirements: [
          { role_id: 4, num: 2 },
          { role_id: 5, num: 2 },
        ],
      },
      {
        id: 2870,
        name: "1 hr shift",
        weekday: 2,
        start_hour: "10:00:00",
        end_hour: "11:00:00",
        role_requirements: [
          { role_id: 4, num: 0 },
          { role_id: 5, num: 0 },
        ],
      },
    ];

    ShiftSuggestorInstance.set_shifts(SHIFTS);
    ShiftSuggestorInstance.set_punches(PUNCHES);
    console.log(ShiftSuggestorInstance.suggest());
    // expect()
  });
});
