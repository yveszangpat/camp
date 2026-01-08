"use client";

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { ChevronRight, FileText, AlertCircle } from "lucide-react";

export default function SelectProjectTypeModal({ isOpen, onClose, onSelect }) {
    const [selectedType, setSelectedType] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showTemplateList, setShowTemplateList] = useState(false);

    // Fetch templates when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
            // Reset states
            setSelectedType(null);
            setSelectedTemplate(null);
            setShowTemplateList(false);
        }
    }, [isOpen]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/templates');
            const data = await response.json();
            setTemplates(data);
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTypeSelect = (type) => {
        setSelectedType(type);

        if (type === "continuing") {
            if (templates.length === 0) {
                // ถ้าไม่มี template แจ้งเตือน
                alert("ยังไม่มี Template ในระบบ\nกรุณาสร้างค่ายใหม่และบันทึกเป็น Template ก่อน");
                setSelectedType(null);
            } else {
                // ถ้ามี template แสดงรายการ
                setShowTemplateList(true);
            }
        } else {
            setShowTemplateList(false);
            setSelectedTemplate(null);
        }
    };
    

    const handleContinue = async () => {
        console.log("handleContinue called");
        console.log("selectedType:", selectedType);
        console.log("selectedTemplate:", selectedTemplate);

        if (selectedType === "new") {
            console.log("Calling onSelect with 'new'");
            onSelect("new", null);
        } else if (selectedType === "continuing" && selectedTemplate) {
            try {
                console.log("Fetching template data for ID:", selectedTemplate.camp_template_id);
                const response = await fetch(`/api/templates/${selectedTemplate.camp_template_id}`);
                const templateData = await response.json();
                console.log("Template data loaded:", templateData);
                onSelect("continuing", templateData); // ส่ง templateData ไปด้วย
            } catch (error) {
                console.error('Error loading template:', error);
                alert('ไม่สามารถโหลดข้อมูล Template ได้');
            }
        } else {
            console.log("Cannot continue - missing selection");
        }
    };

    
    const canContinue = selectedType === "new" || (selectedType === "continuing" && selectedTemplate);

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="2xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold">Select Project Type</h2>
                            <p className="text-sm text-gray-500 font-normal">
                                Choose how you want to create your camp
                            </p>
                        </ModalHeader>

                        <ModalBody className="py-6">
                            {!showTemplateList ? (
                                // Step 1: เลือกประเภท
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* New Project */}
                                    <button
                                        onClick={() => handleTypeSelect("new")}
                                        className={`
                                            p-6 rounded-xl border-2 transition-all text-left
                                            ${selectedType === "new"
                                                ? "border-[#6b857a] bg-[#6b857a]/5"
                                                : "border-gray-200 hover:border-gray-300"
                                            }
                                        `}
                                    >
                                        <h3 className="text-xl font-semibold mb-2">New Project</h3>
                                        <p className="text-gray-600 text-sm">
                                            Create a completely new project from scratch
                                        </p>
                                    </button>

                                    {/* Continuing Project */}
                                    <button
                                        onClick={() => handleTypeSelect("continuing")}
                                        className={`
                                            p-6 rounded-xl border-2 transition-all text-left relative
                                            ${selectedType === "continuing"
                                                ? "border-[#6b857a] bg-[#6b857a]/5"
                                                : "border-gray-200 hover:border-gray-300"
                                            }
                                        `}
                                    >
                                        <h3 className="text-xl font-semibold mb-2">
                                            Continuing Project
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Use an existing template as a starting point
                                        </p>
                                        {templates.length > 0 && (
                                            <span className="absolute top-2 right-2 bg-[#6b857a] text-white text-xs px-2 py-1 rounded-full">
                                                {templates.length} available
                                            </span>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                // Step 2: เลือก Template
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">Select a Template</h3>
                                        <button
                                            onClick={() => {
                                                setShowTemplateList(false);
                                                setSelectedType(null);
                                                setSelectedTemplate(null);
                                            }}
                                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                        >
                                            <ChevronRight className="rotate-180" size={16} />
                                            Back
                                        </button>
                                    </div>

                                    {loading ? (
                                        <div className="text-center py-8 text-gray-500">
                                            Loading templates...
                                        </div>
                                    ) : templates.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <AlertCircle size={48} className="text-gray-400 mb-3" />
                                            <p className="text-gray-600 font-medium">No templates available</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Create a camp and save it as a template first
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="max-h-96 overflow-y-auto space-y-3">
                                            {templates.map((template) => (
                                                <button
                                                    key={template.camp_template_id}
                                                    onClick={() => setSelectedTemplate(template)}
                                                    className={`
                                                        w-full p-4 rounded-lg border-2 transition-all text-left
                                                        ${selectedTemplate?.camp_template_id === template.camp_template_id
                                                            ? "border-[#6b857a] bg-[#6b857a]/5"
                                                            : "border-gray-200 hover:border-gray-300"
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-white rounded-lg border border-gray-200">
                                                            <FileText size={20} className="text-[#6b857a]" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                                {template.name}
                                                            </h4>
                                                            <p className="text-sm text-gray-500">
                                                                From: {template.camp?.name || "Unknown Camp"}
                                                            </p>
                                                            {template.camp?.location && (
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    📍 {template.camp.location}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {selectedTemplate?.camp_template_id === template.camp_template_id && (
                                                            <div className="text-[#6b857a]">
                                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                fullWidth
                                size="lg"
                                className="bg-[#6b857a] text-white"
                                onPress={handleContinue}
                                isDisabled={!canContinue}
                            >
                                Continue
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}