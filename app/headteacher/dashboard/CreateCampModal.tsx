"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, ImageOff, X, Plus, Trash2 } from "lucide-react";
import { Select, SelectItem } from "@heroui/react";
import { DateRangePicker } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import type { DateValue } from "@internationalized/date";

interface TimeSlot {
    startTime: string;
    endTime: string;
    activity: string;
}

interface DaySchedule {
    day: number;
    timeSlots: TimeSlot[];
}

interface FormData {
    name: string;
    location: string;
    gradeLevel: string;
    classroomType: string;
    registrationStartDate: string;
    registrationEndDate: string;
    campStartDate: string;
    campEndDate: string;
    description: string;
    hasShirt: boolean;
    shirtStartDate: string;
    shirtEndDate: string;
    templateName: string;
    saveAsTemplate: boolean;
    dailySchedule: DaySchedule[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    projectType: string | null;
    templateData?: any;
    isLoading?: boolean;
}
function dateValueToString(date: DateValue) {
    return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

export default function CreateCampModal({
    isOpen,
    onClose,
    onSubmit,
    projectType,
    templateData,
    isLoading
}: Props) {
    const [classrooms, setClassrooms] = useState<any[]>([]);
    const [filteredClassrooms, setFilteredClassrooms] = useState<any[]>([]);
    const [selectedGrade, setSelectedGrade] = useState<string>("");
    const [selectedClassroomIds, setSelectedClassroomIds] = useState<number[]>([]);
    const [shirtImage, setShirtImage] = useState<string | null>(null);
    const [shirtImageFile, setShirtImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState<FormData>({
        name: "",
        location: "",
        gradeLevel: "",
        classroomType: "",
        registrationStartDate: "",
        registrationEndDate: "",
        campStartDate: "",
        campEndDate: "",
        description: "",
        hasShirt: false,
        shirtStartDate: "",
        shirtEndDate: "",
        templateName: "",
        saveAsTemplate: false,
        dailySchedule: [
            {
                day: 1,
                timeSlots: [{ startTime: "", endTime: "", activity: "" }],
            },
        ],
    });

    useEffect(() => {
        async function fetchClassrooms() {
            try {
                const res = await fetch("/api/classrooms");
                const data = await res.json();
                console.log("Fetched classrooms:", data);
                setClassrooms(data);
            } catch (err) {
                console.error("Failed to fetch classrooms:", err);
            }
        }
        if (isOpen) {
            fetchClassrooms();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedGrade) {
            const filtered = classrooms.filter(c => c.grade === selectedGrade);
            console.log("Filtered classrooms for grade", selectedGrade, ":", filtered);
            setFilteredClassrooms(filtered);
        } else {
            setFilteredClassrooms([]);
        }
        setSelectedClassroomIds([]);
    }, [selectedGrade, classrooms]);

    // โหลดข้อมูลจาก template เมื่อเปิด modal
    useEffect(() => {
        if (isOpen && projectType === "continuing" && templateData) {
            console.log("Loading template data:", templateData);

            // แปลง dailySchedule จาก template
            const dailySchedule = templateData.daily_schedule
                ? (typeof templateData.daily_schedule === 'string'
                    ? JSON.parse(templateData.daily_schedule)
                    : templateData.daily_schedule)
                : [{ day: 1, timeSlots: [{ startTime: "", endTime: "", activity: "" }] }];

            setFormData({
                name: templateData.name || "",
                location: templateData.location || "",
                gradeLevel: templateData.grade_level || "",
                classroomType: templateData.classroom_type || "",
                registrationStartDate: "",
                registrationEndDate: "",
                campStartDate: "",
                campEndDate: "",
                description: templateData.description || "",
                hasShirt: templateData.has_shirt || false,
                shirtStartDate: "",
                shirtEndDate: "",
                templateName: "",
                saveAsTemplate: false,
                dailySchedule: dailySchedule,
            });

            // ถ้ามี grade level ให้ตั้งค่า
            if (templateData.grade_level) {
                setSelectedGrade(templateData.grade_level);
            }

            // ถ้ามีรูปเสื้อ
            if (templateData.shirt_image_url) {
                setShirtImage(templateData.shirt_image_url);
            }
        } else if (isOpen && projectType === "new") {
            // Reset form เมื่อเป็น new project
            setFormData({
                name: "",
                location: "",
                gradeLevel: "",
                classroomType: "",
                registrationStartDate: "",
                registrationEndDate: "",
                campStartDate: "",
                campEndDate: "",
                description: "",
                hasShirt: false,
                shirtStartDate: "",
                shirtEndDate: "",
                templateName: "",
                saveAsTemplate: false,
                dailySchedule: [
                    {
                        day: 1,
                        timeSlots: [{ startTime: "", endTime: "", activity: "" }],
                    },
                ],
            });
            setSelectedGrade("");
            setShirtImage(null);
            setShirtImageFile(null);
            setSelectedClassroomIds([]);
        }
    }, [isOpen, projectType, templateData]);

    // โหลด classroom IDs จาก template หลังจาก classrooms ถูก fetch แล้ว
    useEffect(() => {
        if (isOpen && projectType === "continuing" && templateData && classrooms.length > 0) {
            console.log("Loading classroom IDs from template:", templateData);

            // ถ้า template มี classroom_ids ให้ตั้งค่า
            if (templateData.classroom_ids && Array.isArray(templateData.classroom_ids)) {
                // กรองเฉพาะ classroom ที่ยังมีอยู่ในระบบ
                const validClassroomIds = templateData.classroom_ids.filter((id: number) =>
                    classrooms.some(c => c.classroom_id === id)
                );
                console.log("Setting valid classroom IDs:", validClassroomIds);
                setSelectedClassroomIds(validClassroomIds);
            }

            // หรือถ้า template มี camp.camp_classrooms ให้ดึง classroom_id จากนั้น
            else if (templateData.camp?.camp_classrooms && Array.isArray(templateData.camp.camp_classrooms)) {
                const classroomIds = templateData.camp.camp_classrooms
                    .map((cc: any) => cc.classroom_id)
                    .filter((id: number) => classrooms.some(c => c.classroom_id === id));
                console.log("Setting classroom IDs from camp_classrooms:", classroomIds);
                setSelectedClassroomIds(classroomIds);
            }
        }
    }, [isOpen, projectType, templateData, classrooms]);

    const grades = Array.from(new Set(classrooms.map(c => c.grade))).sort();

    // Debug logs
    console.log("CreateCampModal render:");
    console.log("isOpen:", isOpen);
    console.log("projectType:", projectType);

    if (!isOpen) {
        console.log("Modal not shown: isOpen is false");
        return null;
    }

    if (projectType !== "new" && projectType !== "continuing") {
        console.log("Modal not shown: projectType is invalid:", projectType);
        return null;
    }

    const handleChange = (field: keyof FormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const addDay = () => {
        setFormData((prev) => ({
            ...prev,
            dailySchedule: [
                ...prev.dailySchedule,
                {
                    day: prev.dailySchedule.length + 1,
                    timeSlots: [{ startTime: "", endTime: "", activity: "" }],
                },
            ],
        }));
    };

    const removeDay = (dayIndex: number) => {
        if (formData.dailySchedule.length <= 1) return;
        const newSchedule = formData.dailySchedule
            .filter((_, i) => i !== dayIndex)
            .map((day, idx) => ({ ...day, day: idx + 1 }));
        setFormData({ ...formData, dailySchedule: newSchedule });
    };

    const addTimeSlot = (dayIndex: number) => {
        const newSchedule = [...formData.dailySchedule];
        newSchedule[dayIndex].timeSlots.push({ startTime: "", endTime: "", activity: "" });
        setFormData({ ...formData, dailySchedule: newSchedule });
    };

    const updateTimeSlot = (dayIndex: number, slotIndex: number, field: keyof TimeSlot, value: string) => {
        const newSchedule = [...formData.dailySchedule];
        newSchedule[dayIndex].timeSlots[slotIndex][field] = value;
        setFormData({ ...formData, dailySchedule: newSchedule });
    };

    const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
        const newSchedule = [...formData.dailySchedule];
        newSchedule[dayIndex].timeSlots = newSchedule[dayIndex].timeSlots.filter((_, i) => i !== slotIndex);
        setFormData({ ...formData, dailySchedule: newSchedule });
    };

    const handleShirtImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                alert('ขนาดไฟล์ต้องไม่เกิน 10MB');
                return;
            }

            setShirtImageFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setShirtImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeShirtImage = () => {
        setShirtImage(null);
        setShirtImageFile(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedClassroomIds.length === 0) {
            alert("กรุณาเลือกห้องเรียนอย่างน้อย 1 ห้อง");
            return;
        }

        if (formData.hasShirt) {
            if (!formData.shirtEndDate || !formData.campStartDate) {
                alert("กรุณากรอกวันที่สิ้นสุดการจองเสื้อ และวันเริ่มค่าย");
                return;
            }
            if (new Date(formData.shirtEndDate) >= new Date(formData.campStartDate)) {
                alert("วันสิ้นสุดการจองเสื้อต้องเป็นวันก่อนเริ่มค่ายเท่านั้น");
                return;
            }
        }


        const payload = {
            ...formData,
            classroom_ids: selectedClassroomIds,
            gradeLevel: selectedGrade,
            shirtImage: shirtImage,
            shirtImageFile: shirtImageFile,
        };

        onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b bg-white flex justify-between items-center">
                    <div>
                        <button onClick={onClose} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-1">
                            <ChevronRight className="rotate-180" size={18} />
                            <span className="text-sm font-medium">Back to Dashboard</span>
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {projectType === "continuing" ? "Create Camp from Template" : "Camp Details"}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {projectType === "continuing"
                                ? "Review and modify template data as needed"
                                : "Fill in the camp information to get started"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="overflow-y-auto p-6 space-y-8">
                    {/* Basic Information Section */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-[#6b857a] rounded-full"></span>
                            General Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Camp Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    placeholder="เช่น MSEC Camp 2025"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b857a] outline-none"
                                />
                            </div>

                            {/* Grade Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Grade
                                    <Select
                                        label="Grade Level"
                                        placeholder="-- Select Grade --"
                                        selectedKeys={selectedGrade ? [selectedGrade] : []}
                                        onSelectionChange={(keys) => {
                                            const grade = Array.from(keys)[0] as string;
                                            setSelectedGrade(grade);
                                            handleChange("gradeLevel", grade);
                                        }}
                                        isRequired
                                        classNames={{
                                            trigger: "border-gray-300",
                                        }}
                                    >
                                        {grades.map((grade) => (
                                            <SelectItem key={grade} value={grade}>
                                                {grade.replace("Level_", "ม.")}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </label>
                            </div>

                            {/* Classroom Selection (Multiple) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Classrooms
                                    {selectedClassroomIds.length > 0 && (
                                        <span className="ml-2 text-xs text-[#6b857a]">
                                            ({selectedClassroomIds.length} selected)
                                        </span>
                                    )}
                                </label>
                                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg max-h-40 overflow-y-auto bg-white">
                                    {!selectedGrade ? (
                                        <p className="text-sm text-gray-400">Please select a grade first</p>
                                    ) : filteredClassrooms.length === 0 ? (
                                        <p className="text-sm text-gray-400">No classrooms available for this grade</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {filteredClassrooms.map((classroom) => (
                                                <label
                                                    key={classroom.classroom_id}
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedClassroomIds.includes(classroom.classroom_id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedClassroomIds([...selectedClassroomIds, classroom.classroom_id]);
                                                            } else {
                                                                setSelectedClassroomIds(
                                                                    selectedClassroomIds.filter(id => id !== classroom.classroom_id)
                                                                );
                                                            }
                                                        }}
                                                        className="w-4 h-4 rounded border-gray-300 text-[#6b857a] focus:ring-[#6b857a]"
                                                    />
                                                    <span className="text-sm">
                                                        {classroom.type_classroom} - {classroom.teacher.firstname} {classroom.teacher.lastname}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => handleChange("location", e.target.value)}
                                    placeholder="อาคารวิทยวิภาส คณะวิทยาศาสตร์ มข."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b857a] outline-none"
                                />
                                <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">description</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    placeholder="ค่ายเกี่ยวกับการประยุกต์ใช้ STEM ในชีวิตประจำวัน"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b857a] outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Dates Section */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-[#6b857a] rounded-full"></span>
                            Timeline & Schedule
                        </h3>
                        {/* Date Ranges */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Registration Period */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Registration Period
                                </label>
                                <DateRangePicker
                                    className="w-full"
                                    value={
                                        formData.registrationStartDate && formData.registrationEndDate
                                            ? {
                                                start: parseDate(formData.registrationStartDate),
                                                end: parseDate(formData.registrationEndDate),
                                            }
                                            : null
                                    }
                                    onChange={(range) => {
                                        if (!range) return;
                                        handleChange("registrationStartDate", dateValueToString(range.start));
                                        handleChange("registrationEndDate", dateValueToString(range.end));
                                    }}
                                />
                            </div>

                            {/* Camp Period */}
                            <div>
                                <label className="block text-xs font-bold text-[#6b857a] uppercase mb-1">
                                    Camp Period
                                </label>
                                <DateRangePicker
                                    className="w-full"
                                    value={
                                        formData.campStartDate && formData.campEndDate
                                            ? {
                                                start: parseDate(formData.campStartDate),
                                                end: parseDate(formData.campEndDate),
                                            }
                                            : null
                                    }
                                    onChange={(range) => {
                                        if (!range) return;
                                        handleChange("campStartDate", dateValueToString(range.start));
                                        handleChange("campEndDate", dateValueToString(range.end));
                                    }}
                                />
                            </div>

                        </div>



                        {/* Daily Schedule Section */}
                        <div className="border-t pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold">Daily Schedule</h3>
                                    <p className="text-sm text-gray-500">Add days and time slots with activities</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addDay}
                                    className="flex items-center gap-1 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-lg">+</span>
                                    Add Day
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.dailySchedule.map((day, dayIndex) => (
                                    <div key={dayIndex} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                        {/* Day Header */}
                                        <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-semibold text-gray-700 border border-gray-200">
                                                    {day.day}
                                                </div>
                                                <span className="font-medium text-gray-700">Day {day.day}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => addTimeSlot(dayIndex)}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    <span className="text-base">+</span>
                                                    Add Time Slot
                                                </button>
                                                {formData.dailySchedule.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeDay(dayIndex)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Time Slots */}
                                        <div className="divide-y divide-gray-100">
                                            {day.timeSlots.map((slot, slotIndex) => (
                                                <div key={slotIndex} className="p-4 hover:bg-gray-50 transition-colors">
                                                    <div className="grid grid-cols-12 gap-3 items-center">
                                                        {/* Start Time */}
                                                        <div className="col-span-3">
                                                            <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                                                            <input
                                                                type="time"
                                                                value={slot.startTime}
                                                                onChange={(e) => updateTimeSlot(dayIndex, slotIndex, "startTime", e.target.value)}
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b857a] focus:border-transparent"
                                                            />
                                                        </div>

                                                        {/* End Time */}
                                                        <div className="col-span-3">
                                                            <label className="block text-xs text-gray-500 mb-1">End Time</label>
                                                            <input
                                                                type="time"
                                                                value={slot.endTime}
                                                                onChange={(e) => updateTimeSlot(dayIndex, slotIndex, "endTime", e.target.value)}
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b857a] focus:border-transparent"
                                                            />
                                                        </div>

                                                        {/* Activity */}
                                                        <div className="col-span-5">
                                                            <label className="block text-xs text-gray-500 mb-1">Activity</label>
                                                            <input
                                                                type="text"
                                                                value={slot.activity}
                                                                onChange={(e) => updateTimeSlot(dayIndex, slotIndex, "activity", e.target.value)}
                                                                placeholder="Activity name"
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b857a] focus:border-transparent"
                                                            />
                                                        </div>

                                                        {/* Delete Button */}
                                                        <div className="col-span-1 flex justify-end">
                                                            {day.timeSlots.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors mt-5"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Shirt & Template Section */}
                    <section className="pt-6 border-t space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <ImageOff size={20} className="text-[#6b857a]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">Shirt Reservations</h4>
                                    <p className="text-xs text-gray-500">Enable shirt size selection during registration</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={formData.hasShirt} onChange={(e) => handleChange("hasShirt", e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6b857a]"></div>
                            </label>
                        </div>

                        {formData.hasShirt && (
                            <div className="space-y-4 p-4 border rounded-xl">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Shirt Booking Period
                                    </label>

                                    <DateRangePicker
                                        className="w-full"
                                        value={
                                            formData.shirtStartDate && formData.shirtEndDate
                                                ? {
                                                    start: parseDate(formData.shirtStartDate),
                                                    end: parseDate(formData.shirtEndDate),
                                                }
                                                : null
                                        }
                                        onChange={(range) => {
                                            if (!range) return;
                                            handleChange("shirtStartDate", dateValueToString(range.start));
                                            handleChange("shirtEndDate", dateValueToString(range.end));
                                        }}
                                    />
                                </div>
                            

                                {/* Shirt Image Upload */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-2">
                                        Shirt Sample Image
                                    </label>
                                    <p className="text-xs text-gray-400 mb-3">
                                        Upload an image showing the camp shirt design for student reference
                                    </p>

                                    {!shirtImage ? (
                                        <label className="block w-full cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleShirtImageChange}
                                                className="hidden"
                                            />
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#6b857a] hover:bg-gray-50 transition-all">
                                                <ImageOff size={32} className="mx-auto text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-500 font-medium">Click to upload or drag and drop</p>
                                                <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG up to 10MB</p>
                                            </div>
                                        </label>
                                    ) : (
                                        <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
                                            <img
                                                src={shirtImage}
                                                alt="Shirt preview"
                                                className="w-full h-64 object-contain bg-gray-50"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeShirtImage}
                                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                            >
                                                <X size={20} />
                                            </button>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-xs">
                                                {shirtImageFile?.name || "Template Image"}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={formData.saveAsTemplate}
                                    onChange={(e) => handleChange("saveAsTemplate", e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#6b857a] focus:ring-[#6b857a]"
                                />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-black">Save this configuration as a template</span>
                            </label>
                            {formData.saveAsTemplate && (
                                <input
                                    type="text"
                                    placeholder="Template Name (e.g., Annual Science Camp)"
                                    value={formData.templateName}
                                    onChange={(e) => handleChange("templateName", e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b857a] outline-none text-sm"
                                />
                            )}
                        </div>
                    </section>
                </div>

                {/* Sticky Footer */}
                <div className="p-6 border-t bg-gray-50">
                    <button
                        onClick={handleSubmit}
                        className="w-full py-4 bg-[#6b857a] text-white rounded-xl hover:bg-[#5a7268] transition-all font-bold shadow-lg flex items-center justify-center gap-2"
                    >
                        Create Camp & Continue
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}