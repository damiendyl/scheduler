package com.example.demo.TimeTable;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

public enum DayOfWeek {
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY,
    SUNDAY;

    private static final List<DayOfWeek> VALUES = Arrays.asList(values());
    private static final int SIZE = VALUES.size();
    private static final Random r = new Random();

    public static DayOfWeek getRandom() {
        return VALUES.get(r.nextInt(SIZE));
    }
}
