import json
from collections import defaultdict, Counter

all_slots = []

# =========================================================================
# TIER 1: PRIMARY FOUNDATION (Class 1 - 5)
# Days: Monday, Wednesday & Friday
# Exactly 2 classes per subject per week.
# Morning slots can be allocated + Evening slots. Consecutive blocks.
# Faculty: FAC-11 (MATH & SCI), FAC-12 (CA), FAC-13 (ENG & BIO)
# =========================================================================

# On Mon, Wed, Fri:
# Available slots:
# Morning: "08:00 AM - 09:30 AM" (Morning Batch)
# Evening: "04:00 PM - 05:30 PM", "05:30 PM - 07:00 PM", "07:00 PM - 08:30 PM" (Evening Batch)

# Class 1 (4 subs: MATH, SCI, ENG, CA -> 8 slots):
# Mon Evening (3 slots):
all_slots.append({"id": "TT-0101", "day": "Monday", "timeSlot": "04:00 PM - 05:30 PM", "classLevel": "1", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-01-MATH", "facultyId": "FAC-11", "room": "ROOM-3"})
all_slots.append({"id": "TT-0102", "day": "Monday", "timeSlot": "05:30 PM - 07:00 PM", "classLevel": "1", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-01-ENG", "facultyId": "FAC-13", "room": "ROOM-3"})
all_slots.append({"id": "TT-0103", "day": "Monday", "timeSlot": "07:00 PM - 08:30 PM", "classLevel": "1", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-01-CA", "facultyId": "FAC-12", "room": "ROOM-3"})
# Wed Evening (3 slots):
all_slots.append({"id": "TT-0104", "day": "Wednesday", "timeSlot": "04:00 PM - 05:30 PM", "classLevel": "1", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-01-ENG", "facultyId": "FAC-13", "room": "ROOM-3"})
all_slots.append({"id": "TT-0105", "day": "Wednesday", "timeSlot": "05:30 PM - 07:00 PM", "classLevel": "1", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-01-SCI", "facultyId": "FAC-11", "room": "ROOM-3"})
all_slots.append({"id": "TT-0106", "day": "Wednesday", "timeSlot": "07:00 PM - 08:30 PM", "classLevel": "1", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-01-CA", "facultyId": "FAC-12", "room": "ROOM-3"})
# Fri Evening (2 slots):
all_slots.append({"id": "TT-0107", "day": "Friday", "timeSlot": "04:00 PM - 05:30 PM", "classLevel": "1", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-01-MATH", "facultyId": "FAC-11", "room": "ROOM-3"})
all_slots.append({"id": "TT-0108", "day": "Friday", "timeSlot": "05:30 PM - 07:00 PM", "classLevel": "1", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-01-SCI", "facultyId": "FAC-11", "room": "ROOM-3"})

# Class 2 (4 subs: MATH, SCI, ENG, CA -> 8 slots):
# Mon Evening (3 slots):
all_slots.append({"id": "TT-0201", "day": "Monday", "timeSlot": "04:00 PM - 05:30 PM", "classLevel": "2", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-02-ENG", "facultyId": "FAC-13", "room": "ROOM-4"})
all_slots.append({"id": "TT-0202", "day": "Monday", "timeSlot": "05:30 PM - 07:00 PM", "classLevel": "2", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-02-CA", "facultyId": "FAC-12", "room": "ROOM-4"})
all_slots.append({"id": "TT-0203", "day": "Monday", "timeSlot": "07:00 PM - 08:30 PM", "classLevel": "2", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-02-MATH", "facultyId": "FAC-11", "room": "ROOM-4"})
# Wed Evening (2 slots):
all_slots.append({"id": "TT-0204", "day": "Wednesday", "timeSlot": "04:00 PM - 05:30 PM", "classLevel": "2", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-02-MATH", "facultyId": "FAC-11", "room": "ROOM-4"})
all_slots.append({"id": "TT-0205", "day": "Wednesday", "timeSlot": "05:30 PM - 07:00 PM", "classLevel": "2", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-02-ENG", "facultyId": "FAC-13", "room": "ROOM-4"})
# Fri Evening (3 slots):
all_slots.append({"id": "TT-0206", "day": "Friday", "timeSlot": "04:00 PM - 05:30 PM", "classLevel": "2", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-02-CA", "facultyId": "FAC-12", "room": "ROOM-4"})
all_slots.append({"id": "TT-0207", "day": "Friday", "timeSlot": "05:30 PM - 07:00 PM", "classLevel": "2", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-02-SCI", "facultyId": "FAC-11", "room": "ROOM-4"})
all_slots.append({"id": "TT-0208", "day": "Friday", "timeSlot": "07:00 PM - 08:30 PM", "classLevel": "2", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-02-SCI", "facultyId": "FAC-11", "room": "ROOM-4"})

# Class 3 (4 subs: MATH, SCI, ENG, CA -> 8 slots):
# Mon Evening (2 slots):
all_slots.append({"id": "TT-0301", "day": "Monday", "timeSlot": "04:00 PM - 05:30 PM", "classLevel": "3", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-03-CA", "facultyId": "FAC-12", "room": "ROOM-5"})
all_slots.append({"id": "TT-0302", "day": "Monday", "timeSlot": "05:30 PM - 07:00 PM", "classLevel": "3", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-03-MATH", "facultyId": "FAC-11", "room": "ROOM-5"})
# Wed Evening (3 slots):
all_slots.append({"id": "TT-0303", "day": "Wednesday", "timeSlot": "04:00 PM - 05:30 PM", "classLevel": "3", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-03-CA", "facultyId": "FAC-12", "room": "ROOM-5"})
all_slots.append({"id": "TT-0304", "day": "Wednesday", "timeSlot": "05:30 PM - 07:00 PM", "classLevel": "3", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-03-SCI", "facultyId": "FAC-11", "room": "ROOM-5"})
all_slots.append({"id": "TT-0305", "day": "Wednesday", "timeSlot": "07:00 PM - 08:30 PM", "classLevel": "3", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-03-ENG", "facultyId": "FAC-13", "room": "ROOM-4"})
# Fri Evening (3 slots):
all_slots.append({"id": "TT-0306", "day": "Friday", "timeSlot": "04:00 PM - 05:30 PM", "classLevel": "3", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-03-ENG", "facultyId": "FAC-13", "room": "ROOM-5"})
all_slots.append({"id": "TT-0307", "day": "Friday", "timeSlot": "05:30 PM - 07:00 PM", "classLevel": "3", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-03-MATH", "facultyId": "FAC-11", "room": "ROOM-5"})
all_slots.append({"id": "TT-0308", "day": "Friday", "timeSlot": "07:00 PM - 08:30 PM", "classLevel": "3", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-03-SCI", "facultyId": "FAC-11", "room": "ROOM-5"})

# Class 4 (4 subs: MATH, SCI, ENG, CA -> 8 slots):
# Mon (3 slots: 1 morning + 2 evening):
all_slots.append({"id": "TT-0401", "day": "Monday", "timeSlot": "08:00 AM - 09:30 AM", "classLevel": "4", "stream": "General", "batch": "Morning Batch (6:30 AM - 9:00 AM)", "subjectId": "SUB-04-CA", "facultyId": "FAC-12", "room": "ROOM-3"})
all_slots.append({"id": "TT-0402", "day": "Monday", "timeSlot": "05:30 PM - 07:00 PM", "classLevel": "4", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-04-SCI", "facultyId": "FAC-11", "room": "ROOM-2"})
all_slots.append({"id": "TT-0403", "day": "Monday", "timeSlot": "07:00 PM - 08:30 PM", "classLevel": "4", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-04-ENG", "facultyId": "FAC-13", "room": "ROOM-2"})
# Wed (3 slots: 1 morning + 2 evening):
all_slots.append({"id": "TT-0404", "day": "Wednesday", "timeSlot": "08:00 AM - 09:30 AM", "classLevel": "4", "stream": "General", "batch": "Morning Batch (6:30 AM - 9:00 AM)", "subjectId": "SUB-04-ENG", "facultyId": "FAC-13", "room": "ROOM-3"})
all_slots.append({"id": "TT-0405", "day": "Wednesday", "timeSlot": "05:30 PM - 07:00 PM", "classLevel": "4", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-04-CA", "facultyId": "FAC-12", "room": "ROOM-2"})
all_slots.append({"id": "TT-0406", "day": "Wednesday", "timeSlot": "07:00 PM - 08:30 PM", "classLevel": "4", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-04-MATH", "facultyId": "FAC-11", "room": "ROOM-2"})
# Fri Evening (2 slots):
all_slots.append({"id": "TT-0407", "day": "Friday", "timeSlot": "05:30 PM - 07:00 PM", "classLevel": "4", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-04-MATH", "facultyId": "FAC-11", "room": "ROOM-2"})
all_slots.append({"id": "TT-0408", "day": "Friday", "timeSlot": "07:00 PM - 08:30 PM", "classLevel": "4", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-04-SCI", "facultyId": "FAC-11", "room": "ROOM-2"})

# Class 5 (5 subs: MATH, SCI, BIO, ENG, CA -> 10 slots):
# Mon (3 slots: 1 morning + 2 evening):
all_slots.append({"id": "TT-0501", "day": "Monday", "timeSlot": "08:00 AM - 09:30 AM", "classLevel": "5", "stream": "General", "batch": "Morning Batch (6:30 AM - 9:00 AM)", "subjectId": "SUB-05-BIO", "facultyId": "FAC-13", "room": "ROOM-4"})
all_slots.append({"id": "TT-0502", "day": "Monday", "timeSlot": "04:00 PM - 05:30 PM", "classLevel": "5", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-05-SCI", "facultyId": "FAC-11", "room": "ROOM-1"})
all_slots.append({"id": "TT-0503", "day": "Monday", "timeSlot": "07:00 PM - 08:30 PM", "classLevel": "5", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-05-MATH", "facultyId": "FAC-11", "room": "ROOM-1"})
# Wed (3 slots: 1 morning + 2 evening):
all_slots.append({"id": "TT-0504", "day": "Wednesday", "timeSlot": "08:00 AM - 09:30 AM", "classLevel": "5", "stream": "General", "batch": "Morning Batch (6:30 AM - 9:00 AM)", "subjectId": "SUB-05-CA", "facultyId": "FAC-12", "room": "ROOM-4"})
all_slots.append({"id": "TT-0505", "day": "Wednesday", "timeSlot": "04:00 PM - 05:30 PM", "classLevel": "5", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-05-BIO", "facultyId": "FAC-13", "room": "ROOM-1"})
all_slots.append({"id": "TT-0506", "day": "Wednesday", "timeSlot": "07:00 PM - 08:30 PM", "classLevel": "5", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-05-ENG", "facultyId": "FAC-13", "room": "ROOM-1"})
# Fri (4 slots: 1 morning + 3 evening):
all_slots.append({"id": "TT-0507", "day": "Friday", "timeSlot": "08:00 AM - 09:30 AM", "classLevel": "5", "stream": "General", "batch": "Morning Batch (6:30 AM - 9:00 AM)", "subjectId": "SUB-05-CA", "facultyId": "FAC-12", "room": "ROOM-3"})
all_slots.append({"id": "TT-0508", "day": "Friday", "timeSlot": "04:00 PM - 05:30 PM", "classLevel": "5", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-05-ENG", "facultyId": "FAC-13", "room": "ROOM-1"})
all_slots.append({"id": "TT-0509", "day": "Friday", "timeSlot": "05:30 PM - 07:00 PM", "classLevel": "5", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-05-SCI", "facultyId": "FAC-11", "room": "ROOM-1"})
all_slots.append({"id": "TT-0510", "day": "Friday", "timeSlot": "07:00 PM - 08:30 PM", "classLevel": "5", "stream": "General", "batch": "Evening Batch (4:00 PM - 8:30 PM)", "subjectId": "SUB-05-MATH", "facultyId": "FAC-11", "room": "ROOM-1"})

print(f"Primary Foundation slots added: {len(all_slots)} (Expected: 42)")

def audit(slots):
    by_time = defaultdict(list)
    for s in slots:
        by_time[(s['day'], s['timeSlot'])].append(s)
    errs = []
    for (d, t), sl in by_time.items():
        if len(sl) > 5: errs.append(f"Room overflow on {d} {t}: {len(sl)}")
        facs = [s['facultyId'] for s in sl]
        if len(facs) != len(set(facs)): errs.append(f"Faculty conflict on {d} {t}: {facs}")
        clss = [s['classLevel'] for s in sl]
        if len(clss) != len(set(clss)): errs.append(f"Class conflict on {d} {t}: {clss}")
    sub_c = Counter(s['subjectId'] for s in slots)
    for sub, count in sub_c.items():
        if count != 2: errs.append(f"Sub {sub} count = {count}")
    print("Primary errors:", len(errs))
    for e in errs: print(" -", e)

audit(all_slots)
