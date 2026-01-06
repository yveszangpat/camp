"use client";
import {
    Tabs,
    Tab,
    Card,
    CardBody,
    Button,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,

    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    useDisclosure,
} from "@heroui/react";

import { useState, useEffect } from "react";

import { Trash2, SquarePen } from 'lucide-react';

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
);
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const editIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

const StudentManagerContent = () => {

    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        students_id: "",
        firstname: "",
        lastname: "",
        email: "",
        tel: ""
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/students');
            const data = await res.json();
            if (Array.isArray(data)) setStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (onClose) => {
        if (!formData.students_id || !formData.firstname) {
            alert("กรุณากรอกรหัสนักเรียนและชื่อ");
            return;
        }

        try {
            const res = await fetch('/api/students', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert("เพิ่มนักเรียนสำเร็จ!");
                setFormData({ students_id: "", firstname: "", lastname: "", email: "", tel: "" });
                fetchStudents();
                onClose();
            } else {
                const error = await res.json();
                alert("เกิดข้อผิดพลาด: " + error.error);
            }
        } catch (error) {
            alert("เชื่อมต่อ Server ไม่ได้");
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full pt-4">
            <Card className="border border-[#EFECE5] shadow-sm rounded-lg bg-white" radius="sm">
                <CardBody className="p-6">
                    <div className="justify-items-stretch">
                        <h3 className="text-gray-800 font-semibold mb-4">
                            นักเรียนทั้งหมด ({students.length})
                        </h3>
                        <div className="gap-2 flex justify-end mb-4">

                            <Button onPress={onOpen} variant="solid" className="bg-[#dbdbdb] hover:bg-[#bdbcbc] rounded-xl p-2 text-black">
                                <PlusIcon className="ml-2" />
                                <p className="text-sm">เพิ่มนักเรียนใหม่</p>
                            </Button>
                        </div>
                    </div>

                    <Table aria-label="Student Table" shadow="none" classNames={{ th: "bg-transparent text-gray-600 font-medium border-b", td: "py-3" }}>
                        <TableHeader>
                            <TableColumn>รหัสนักเรียน</TableColumn>
                            <TableColumn>ชื่อ-นามสกุล</TableColumn>
                            <TableColumn>อีเมล</TableColumn>
                            <TableColumn>ระดับชั้น</TableColumn>
                            <TableColumn>ห้องเรียน</TableColumn>
                            <TableColumn>เบอร์โทร</TableColumn>
                            <TableColumn>ดำเนินการ</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={"ไม่มีข้อมูลนักเรียน"}>

                            {students.map((stu) => (
                                <TableRow key={stu.students_id} className="border-b last:border-b-0 hover:bg-gray-50">
                                    <TableCell>{stu.students_id}</TableCell>
                                    <TableCell>{stu.firstname} {stu.lastname}</TableCell>
                                    <TableCell>{stu.email}</TableCell>
                                    <TableCell>-</TableCell>
                                    <TableCell>-</TableCell>
                                    <TableCell>{stu.tel}</TableCell>
                                    <TableCell>
                                        <span className="cursor-pointer active:opacity-50 flex items-center">
                                            <DeleteIcon />
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" backdrop="blur">
                <ModalContent className="bg-white rounded-2xl shadow-medium border border-gray-100 text-gray-800 p-2">
                    {(onClose) => (
                        <>
                            <ModalHeader>เพิ่มนักเรียนใหม่</ModalHeader>
                            <ModalBody className="gap-4">

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700">รหัสนักเรียน</label>
                                    <Input
                                        name="students_id"
                                        value={formData.students_id}
                                        onChange={handleChange}
                                        variant="bordered"
                                        radius="lg"
                                        placeholder="กรอกรหัสนักเรียน"
                                        classNames={{ inputWrapper: "bg-white" }}

                                    />
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex flex-col gap-1 w-full">
                                        <label className="text-sm font-medium text-gray-700">ชื่อจริง</label>
                                        <Input
                                            name="firstname"
                                            value={formData.firstname}
                                            onChange={handleChange}
                                            variant="bordered"
                                            radius="lg"
                                            placeholder="กรอกชื่อจริง"
                                            classNames={{ inputWrapper: "bg-white" }}
                                            className="border-2 rounded-xl"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1 w-full">
                                        <label className="text-sm font-medium text-gray-700">นามสกุล</label>
                                        <Input
                                            name="lastname"
                                            value={formData.lastname}
                                            onChange={handleChange}
                                            variant="bordered"
                                            radius="lg"
                                            placeholder="กรอกนามสกุล"
                                            classNames={{ inputWrapper: "bg-white" }}
                                        />
                                    </div>

                                   
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700">อีเมล</label>
                                    <Input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        variant="bordered"
                                        radius="lg"
                                        placeholder=""
                                        classNames={{ inputWrapper: "bg-white" }}
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700">เบอร์โทร</label>
                                    <Input
                                        name="tel"
                                        value={formData.tel}
                                        onChange={handleChange}
                                        variant="bordered"
                                        radius="lg"
                                        placeholder=""
                                        classNames={{ inputWrapper: "bg-white" }}
                                    />
                                </div>

                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>ยกเลิก</Button>
                                <Button color="primary" onPress={() => handleSubmit(onClose)}>บันทึก</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

const TeacherManagerContent = () => {
    return (
        <div className="flex flex-col gap-6 w-full  pt-4">

            <Card className="border border-[#EFECE5] shadow-sm rounded-lg bg-white" radius="sm">
                <CardBody className="p-6">
                    <h3 className="text-gray-800 font-semibold mb-4">ครูทั้งหมด (1)</h3>
                    <Table
                        aria-label="Teacher Table"
                        shadow="none"
                        classNames={{
                            th: "bg-transparent text-gray-600 font-medium border-b",
                            td: "py-3",
                        }}
                    >
                        <TableHeader>
                            <TableColumn>รหัสครู</TableColumn>
                            <TableColumn>ชื่อ</TableColumn>
                            <TableColumn>บทบาท</TableColumn>
                            <TableColumn>อีเมล</TableColumn>
                            <TableColumn>เบอร์โทร</TableColumn>
                            <TableColumn>ห้องเรียน</TableColumn>
                            <TableColumn>ระดับชั้น</TableColumn>
                            <TableColumn>ดำเนินการ</TableColumn>
                        </TableHeader>
                        <TableBody>
                            <TableRow key="1" className="border-b last:border-b-0 hover:bg-gray-50">
                                <TableCell>TCH001</TableCell>
                                <TableCell>ดร. ซาร่า วิลเลียมส์</TableCell>
                                <TableCell>ครูหัวหน้าค่าย</TableCell>
                                <TableCell>sarah.williams@school.edu</TableCell>
                                <TableCell>091121564</TableCell>
                                <TableCell>สะเต็มศึกษา</TableCell>
                                <TableCell>ม.4</TableCell>
                                <TableCell>
                                    <span className="cursor-pointer active:opacity-50 flex items-center">
                                        <Trash2 className="w-5 h-5 text-red-500" /> <SquarePen className="w-5 h-5 ml-3" />
                                    </span>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    );
};

export default function App() {

    let tabs = [
        {
            id: "Student",
            label: "นักเรียน",
            content: <StudentManagerContent />,
        },
        {
            id: "Teacher",
            label: "ครู",
            content: <TeacherManagerContent />,
        },
    ];

    return (
        <div className="flex w-full flex-col">
            <Tabs
                aria-label="User selection"
                items={tabs}
                radius="full"
                fullWidth
                classNames={{
                    tabList: "bg-[#EFECE5] p-1 gap-1 w-full",
                    cursor: "bg-white shadow-sm rounded-full",
                    tab: "h-7  rounded-full",
                    tabContent: "group-data-[selected=true]:text-black text-gray-500 font-medium"
                }}
            >
                {(item) => (
                    <Tab key={item.id} title={item.label}>
                        {item.content}
                    </Tab>
                )}
            </Tabs>
        </div>
    );
}