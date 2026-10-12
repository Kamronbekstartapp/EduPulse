export const mockStudents = [
  {
    id: "STU-1001",
    fullName: "Aliyev Samar",
    grade: "9-A",
    arrivalTime: "07:45",
    status: "present", 
    uniformStatus: "excellent",
    uniformNotes: "To'liq maktab formasi",
    booksReady: true,
    notebooksReady: true,
    parentName: "Aliyev Botir",
    parentPhone: "+998 90 123 45 67",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "STU-1002",
    fullName: "Karimova Zilola",
    grade: "9-A",
    arrivalTime: "07:52",
    status: "present",
    uniformStatus: "excellent",
    uniformNotes: "To'liq maktab formasi",
    booksReady: true,
    notebooksReady: true,
    parentName: "Karimova Umida",
    parentPhone: "+998 91 234 56 78",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "STU-1003",
    fullName: "Toshpulotov Jamshid",
    grade: "9-A",
    arrivalTime: "08:12",
    status: "late",
    uniformStatus: "warning",
    uniformNotes: "Bo'yinbog'i yo'q",
    booksReady: true,
    notebooksReady: false,
    parentName: "Toshpulotov Shavkat",
    parentPhone: "+998 93 345 67 89",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "STU-1004",
    fullName: "Oripova Madina",
    grade: "9-B",
    arrivalTime: "-",
    status: "absent",
    uniformStatus: "bad",
    uniformNotes: "Kiyimi mos emas",
    booksReady: false,
    notebooksReady: false,
    parentName: "Oripov Alisher",
    parentPhone: "+998 94 456 78 90",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "STU-1005",
    fullName: "Rustamov Behzod",
    grade: "9-B",
    arrivalTime: "07:58",
    status: "present",
    uniformStatus: "excellent",
    uniformNotes: "To'liq maktab formasi",
    booksReady: true,
    notebooksReady: true,
    parentName: "Rustamova Nigora",
    parentPhone: "+998 97 567 89 01",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
  }
];

export const mockStats = {
  totalStudents: 1240,
  presentCount: 1120,
  lateCount: 34,
  absentCount: 12,
  attendancePercentage: 90.3,
  uniformComplianceRate: 95.8,
  preparedForLessonRate: 92.4
};




export const mockClasses = [
  { id: "C-9A", name: "9-A sinf", studentCount: 28, teacher: "Azizov M.", room: "204-xona", shift: "1-smena" },
  { id: "C-9B", name: "9-B sinf", studentCount: 26, teacher: "Karimova Z.", room: "205-xona", shift: "1-smena" },
  { id: "C-10A", name: "10-A sinf", studentCount: 25, teacher: "Tursunov D.", room: "301-xona", shift: "1-smena" },
  { id: "C-11A", name: "11-A sinf", studentCount: 22, teacher: "Saidova N.", room: "302-xona", shift: "1-smena" }
];

export const mockTeachers = [
  {
    id: "TCH-1",
    fullName: "Azizov Murod",
    subject: "Matematika",
    role: "Fan o'qituvchisi",
    classes: ["9-A", "10-A"],
    phone: "+998 90 111-22-33",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "TCH-2",
    fullName: "Karimova Zilola",
    subject: "O'zbek tili va adabiyoti",
    role: "Sinf rahbari (9-B)",
    classes: ["9-B", "11-A"],
    phone: "+998 91 222-33-44",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "TCH-3",
    fullName: "Tursunov Dilshod",
    subject: "Fizika",
    role: "O'quv ishlari o'rinbosari",
    classes: ["10-A", "11-A"],
    phone: "+998 93 333-44-55",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
  }
];