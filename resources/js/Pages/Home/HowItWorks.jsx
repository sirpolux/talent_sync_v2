import {
    Building2,
    ClipboardCheck,
    Brain,
    GraduationCap,
    BarChart3
} from "lucide-react";

export default function HowItWorks() {

    const steps = [
        {
            icon: Building2,
            title: "Set Up Your Organization",
            description:
                "Create your organization structure by adding departments, roles, and required competencies for each position."
        },
        {
            icon: Brain,
            title: "Identify Skill Gaps",
            description:
                "TalentSync analyzes employee profiles and compares them with role requirements to detect missing skills."
        },
        {
            icon: GraduationCap,
            title: "Assign Training Programs",
            description:
                "Automatically assign training modules or allow employees to request training based on identified gaps."
        },
        {
            icon: ClipboardCheck,
            title: "Track Learning Progress",
            description:
                "Monitor training completion, assessment results, and employee engagement in real time."
        },
        {
            icon: BarChart3,
            title: "Make Data-Driven Decisions",
            description:
                "Use training insights to determine promotion readiness and improve workforce capability."
        }
    ];

    return (
        <section className="py-28 bg-gray-50">

            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto">

                    <h2 className="text-3xl md:text-4xl font-bold">
                        How TalentSync Works
                    </h2>

                    <p className="mt-6 text-gray-600 text-lg">
                        TalentSync simplifies workforce development by turning
                        employee training into a structured and automated process.
                    </p>

                </div>

                {/* Steps */}
                <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-5 gap-8">

                    {steps.map((step, index) => {

                        const Icon = step.icon;

                        return (
                            <div
                                key={index}
                                className="relative bg-white border rounded-xl p-6 hover:shadow-lg transition"
                            >

                                {/* Step Number */}
                                <div className="absolute -top-4 -left-4 bg-indigo-600 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold">
                                    {index + 1}
                                </div>

                                {/* Icon */}
                                <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg">
                                    <Icon size={22} />
                                </div>

                                {/* Title */}
                                <h3 className="mt-5 font-semibold text-lg">
                                    {step.title}
                                </h3>

                                {/* Description */}
                                <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                                    {step.description}
                                </p>

                            </div>
                        );
                    })}

                </div>

            </div>

        </section>
    );
}