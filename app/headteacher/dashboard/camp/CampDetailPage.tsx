"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ChevronLeft,
    MapPin,
    Calendar,
    Clock,
    Shirt,
    FileText,
    Award,
    BarChart3,
    Plus
} from "lucide-react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";

interface TimeSlot {
    startTime: string;
    endTime: string;
    activity: string;
}

interface DaySchedule {
    day: number;
    timeSlots: TimeSlot[];
}

interface CampDetail {
    camp_id: number;
    name: string;
    location: string;
    start_date: string;
    end_date: string;
    start_regis_date: string;      // ✅ แก้ไข
    end_regis_date: string;        // ✅ แก้ไข
    description: string;
    grade_level: string;
    has_shirt: boolean;
    end_shirt_date?: string;       // ✅ แก้ไข
    shirt_image_url?: string;
    daily_schedule: any;           // ✅ เปลี่ยนเป็น any ก่อน
    status: string;
    plan_type?: any;
    camp_classroom?: any[];
    _count?: {
        student_enrollment: number;
    };
}

export default function CampDetailPage() {
    const router = useRouter();
    const params = useParams();
    const campId = params?.id;

    const [camp, setCamp] = useState<CampDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (campId) {
            fetchCampDetail();
        }
    }, [campId]);

    const fetchCampDetail = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/camps/${campId}`);
            const data = await response.json();

            console.log("=== Raw API Response ===");
            console.log(data);

            // ดึง grade_level และ plan_type จาก camp_classroom
            let gradeLevel = null;
            let planTypeName = "MSEC"; // default

            if (data.camp_classroom && data.camp_classroom.length > 0) {
                const classroom = data.camp_classroom[0].classroom;
                if (classroom) {
                    gradeLevel = classroom.grade;
                    planTypeName = classroom.type_classroom || "MSEC";
                    console.log("Found grade from classroom:", gradeLevel);
                    console.log("Found type_classroom:", planTypeName);
                }
            }

            // ถ้าไม่มีจาก classroom ให้ลองดูจาก plan_type
            if (!planTypeName && data.plan_type) {
                planTypeName = data.plan_type.name || "MSEC";
                console.log("Found plan_type name:", planTypeName);
            }

            // ดึง daily_schedule จาก camp_daily_schedule
            let dailySchedule = [];
            if (data.camp_daily_schedule && data.camp_daily_schedule.length > 0) {
                dailySchedule = data.camp_daily_schedule
                    .sort((a, b) => a.day - b.day)
                    .map(schedule => ({
                        day: schedule.day,
                        timeSlots: schedule.time_slots.map(slot => ({
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            activity: slot.activity
                        }))
                    }));
                console.log("Found daily schedule:", dailySchedule);
            }

            data.grade_level = gradeLevel;
            data.plan_type_name = planTypeName;
            data.daily_schedule = dailySchedule;

            console.log("=== Processed Data ===");
            console.log("grade_level:", data.grade_level);
            console.log("daily_schedule:", data.daily_schedule);
            console.log("has_shirt:", data.has_shirt);
            console.log("start_regis_date:", data.start_regis_date, typeof data.start_regis_date);
            console.log("end_regis_date:", data.end_regis_date, typeof data.end_regis_date);
            console.log("end_shirt_date:", data.end_shirt_date, typeof data.end_shirt_date);
            console.log("start_date:", data.start_date, typeof data.start_date);
            console.log("end_date:", data.end_date, typeof data.end_date);

            setCamp(data);
        } catch (error) {
            console.error('Error fetching camp detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (time: string) => {
        if (!time) return "";
        return time.slice(0, 5); // แสดงแค่ HH:MM
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#6b857a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading camp details...</p>
                </div>
            </div>
        );
    }

    if (!camp) {
        return (
            <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">Camp not found</p>
                    <Button
                        className="mt-4 bg-[#6b857a] text-white"
                        onPress={() => router.push('/headteacher/dashboard')}
                    >
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const totalActivities = camp.daily_schedule?.reduce((sum, day) => sum + day.timeSlots.length, 0) || 0;

    return (
        <div className="min-h-screen bg-[#F5F1E8]">
            {/* Header */}
            <div className=" z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <button
                        onClick={() => router.push('/headteacher/dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-3"
                    >
                        <ChevronLeft size={20} />
                        <span className="font-medium">Back to Dashboard</span>
                    </button>

                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{camp.name}</h1>
                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="flex items-center gap-1">
                                    <MapPin size={18} />
                                    <span>{camp.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar size={18} />
                                    <span>{formatDate(camp.start_date)} - {formatDate(camp.end_date)}</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="bg-[#6b857a] text-white"
                            startContent={<FileText size={18} />}
                        >
                            Edit Camp
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Camp Information */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin size={20} className="text-[#6b857a]" />
                            <h3 className="font-semibold text-gray-900">Camp Information</h3>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-500">Grade Level</p>
                                <p className="font-medium text-gray-900">
                                    {camp.grade_level?.replace("Level_", "ม.")}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">Class/Learning Plan</p>
                                <p className="font-medium text-gray-900">
                                    {camp.plan_type_name }
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">Registration Period</p>
                                <p className="font-medium text-gray-900">
                                    {camp.start_regis_date ? formatDate(camp.start_regis_date) : "N/A"} - 
                                    {camp.end_regis_date ? formatDate(camp.end_regis_date) : "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Shirt Reservations */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Shirt size={20} className="text-[#6b857a]" />
                            <h3 className="font-semibold text-gray-900">Shirt Reservations</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Status</span>
                                <Chip
                                    size="sm"
                                    className="bg-green-100 text-green-700"
                                >
                                    {camp.has_shirt ? "Enabled" : "Disabled"}
                                </Chip>
                            </div>

                            {camp.has_shirt && (
                                <>
                                    <div>
                                        <p className="text-gray-500 text-sm">Deadline</p>
                                        <p className="font-medium text-gray-900">
                                            {camp.end_shirt_date ? formatDate(camp.end_shirt_date) : "N/A"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-sm mb-2">Sample</p>
                                        {camp.shirt_image_url ? (
                                            <img
                                                src={camp.shirt_image_url}
                                                alt="Shirt sample"
                                                className="w-full h-32 object-contain bg-gray-50 rounded-lg"
                                            />
                                        ) : (
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="aspect-square bg-gray-100 rounded-lg"></div>
                                                <div className="aspect-square bg-gray-100 rounded-lg"></div>
                                                <div className="aspect-square bg-gray-100 rounded-lg"></div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Camp Schedule */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar size={20} className="text-[#6b857a]" />
                            <h3 className="font-semibold text-gray-900">Camp Schedule</h3>
                        </div>

                        <div className="space-y-3">
                            {camp.daily_schedule?.slice(0, 3).map((day, index) => (
                                <div key={index}>
                                    <p className="text-sm font-medium text-gray-900">Day {day.day}</p>
                                    <p className="text-xs text-gray-500">
                                        {day.timeSlots.length} activities scheduled
                                    </p>
                                </div>
                            ))}

                            {camp.daily_schedule?.length > 3 && (
                                <p className="text-xs text-gray-400 italic">
                                    +{camp.daily_schedule.length - 3} more days
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>

                        <div className="space-y-2">
                            <Button
                                className="w-full justify-start bg-transparent hover:bg-gray-50 text-gray-700"
                                startContent={<Plus size={18} />}
                            >
                                Create Base
                            </Button>

                            <Button
                                className="w-full justify-start bg-transparent hover:bg-gray-50 text-gray-700"
                                startContent={<FileText size={18} />}
                            >
                                View Evaluation
                            </Button>

                            <Button
                                className="w-full justify-start bg-transparent hover:bg-gray-50 text-gray-700"
                                startContent={<Award size={18} />}
                            >
                                View Certificate
                            </Button>

                            <Button
                                className="w-full justify-start bg-transparent hover:bg-gray-50 text-gray-700"
                                startContent={<BarChart3 size={18} />}
                            >
                                View Statistics
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Complete Schedule */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock size={20} className="text-[#6b857a]" />
                        <div>
                            <h3 className="font-semibold text-gray-900">Complete Schedule</h3>
                            <p className="text-sm text-gray-500">Daily timeline and activities</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {camp.daily_schedule?.map((day, dayIndex) => (
                            <div key={dayIndex}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-semibold text-gray-700">
                                        {day.day}
                                    </div>
                                    <h4 className="font-semibold text-gray-900">Day {day.day}</h4>
                                </div>

                                <div className="space-y-3 ml-13">
                                    {day.timeSlots.map((slot, slotIndex) => (
                                        <div
                                            key={slotIndex}
                                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-2 text-gray-600 min-w-[120px]">
                                                <Clock size={16} />
                                                <span className="text-sm font-medium">
                                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-900 font-medium">{slot.activity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bases Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 text-lg">Bases</h3>
                            <p className="text-sm text-gray-500">Manage camp bases and missions</p>
                        </div>

                        <Button
                            className="bg-[#6b857a] text-white"
                            startContent={<Plus size={18} />}
                        >
                            Create Base
                        </Button>
                    </div>

                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Plus size={32} className="text-gray-400" />
                            </div>
                            <p className="text-gray-500 mb-4">No bases created yet</p>
                            <Button
                                className="bg-[#6b857a] text-white"
                                size="lg"
                                startContent={<Plus size={18} />}
                            >
                                Create First Base
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}